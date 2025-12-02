<?php
/**
 * LexiMix - Get Game State
 * GET /api/games/state.php?id=GAME_ID
 * 
 * Retrieves current game state (for polling)
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$gameId = $_GET['id'] ?? '';

if (empty($gameId)) {
    jsonResponse(['success' => false, 'error' => 'Game ID required'], 400);
}

$pdo = getDB();

try {
    $stmt = $pdo->prepare("
        SELECT g.*, 
               h.username as host_username,
               guest.username as guest_username
        FROM games g
        LEFT JOIN users h ON g.host_id = h.id
        LEFT JOIN users guest ON g.guest_id = guest.id
        WHERE g.id = ? AND (g.host_id = ? OR g.guest_id = ?)
    ");
    $stmt->execute([$gameId, $userId, $userId]);
    $game = $stmt->fetch();
    
    if (!$game) {
        jsonResponse(['success' => false, 'error' => 'Game not found'], 404);
    }
    
    jsonResponse([
        'success' => true,
        'state' => json_decode($game['state'], true),
        'status' => $game['status'],
        'gameType' => $game['game_type'],
        'hostId' => $game['host_id'],
        'guestId' => $game['guest_id'],
        'winnerId' => $game['winner_id'],
        'lastActivity' => $game['last_activity']
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to get game state'], 500);
}
