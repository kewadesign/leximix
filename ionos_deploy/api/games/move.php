<?php
/**
 * LexiMix - Make Game Move
 * POST /api/games/move.php
 * 
 * Updates game state with a move
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameId = $input['gameId'] ?? '';
$newState = $input['state'] ?? null;

if (empty($gameId) || !$newState) {
    jsonResponse(['success' => false, 'error' => 'Game ID and state required'], 400);
}

$pdo = getDB();

try {
    // Get current game
    $stmt = $pdo->prepare("SELECT * FROM games WHERE id = ?");
    $stmt->execute([$gameId]);
    $game = $stmt->fetch();
    
    if (!$game) {
        jsonResponse(['success' => false, 'error' => 'Game not found'], 404);
    }
    
    // Verify user is part of the game
    if ($game['host_id'] != $userId && $game['guest_id'] != $userId) {
        jsonResponse(['success' => false, 'error' => 'Not authorized'], 403);
    }
    
    // Verify game is not finished
    if ($game['status'] === 'finished') {
        jsonResponse(['success' => false, 'error' => 'Game is finished'], 400);
    }
    
    // Update game state
    $stmt = $pdo->prepare("
        UPDATE games 
        SET state = ?, last_activity = NOW()
        WHERE id = ?
    ");
    $stmt->execute([json_encode($newState), $gameId]);
    
    // Check if game should be marked as finished
    if (isset($newState['status']) && $newState['status'] === 'finished') {
        $winnerId = null;
        if (isset($newState['winner'])) {
            // Look up winner by username
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$newState['winner']]);
            $winner = $stmt->fetch();
            if ($winner) {
                $winnerId = $winner['id'];
            }
        }
        
        $stmt = $pdo->prepare("
            UPDATE games 
            SET status = 'finished', winner_id = ?
            WHERE id = ?
        ");
        $stmt->execute([$winnerId, $gameId]);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Move applied successfully'
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to apply move'], 500);
}
