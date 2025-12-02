<?php
/**
 * LexiMix - Check for Match
 * GET /api/matchmaking/check.php
 * 
 * Polling endpoint to check if a match was found
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$pdo = getDB();

try {
    // Check for match signal
    $stmt = $pdo->prepare("
        SELECT m.*, u.username as opponent_username
        FROM matches m
        JOIN users u ON m.opponent_id = u.id
        WHERE m.user_id = ?
        ORDER BY m.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $match = $stmt->fetch();
    
    if ($match) {
        // Delete the match signal after reading
        $stmt = $pdo->prepare("DELETE FROM matches WHERE id = ?");
        $stmt->execute([$match['id']]);
        
        jsonResponse([
            'success' => true,
            'matched' => true,
            'gameId' => $match['game_id'],
            'opponent' => [
                'userId' => $match['opponent_id'],
                'username' => $match['opponent_username']
            ],
            'gameType' => $match['game_type']
        ]);
    } else {
        jsonResponse([
            'success' => true,
            'matched' => false
        ]);
    }
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to check match'], 500);
}
