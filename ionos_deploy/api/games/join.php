<?php
/**
 * LexiMix - Join Game
 * POST /api/games/join.php
 * 
 * Join an existing game as guest
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameId = $input['gameId'] ?? '';

if (empty($gameId)) {
    jsonResponse(['success' => false, 'error' => 'Game ID required'], 400);
}

$pdo = getDB();

try {
    // Get game
    $stmt = $pdo->prepare("SELECT * FROM games WHERE id = ?");
    $stmt->execute([$gameId]);
    $game = $stmt->fetch();
    
    if (!$game) {
        jsonResponse(['success' => false, 'error' => 'Game not found'], 404);
    }
    
    // Check if game is waiting for a player
    if ($game['status'] !== 'waiting') {
        jsonResponse(['success' => false, 'error' => 'Game is not available'], 400);
    }
    
    // Check if user is already the host
    if ($game['host_id'] == $userId) {
        jsonResponse(['success' => false, 'error' => 'You are already the host'], 400);
    }
    
    // Check if game already has a guest
    if ($game['guest_id']) {
        jsonResponse(['success' => false, 'error' => 'Game already has a guest'], 400);
    }
    
    // Update game with guest
    $stmt = $pdo->prepare("
        UPDATE games 
        SET guest_id = ?, status = 'ready', last_activity = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$userId, $gameId]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Joined game successfully'
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to join game'], 500);
}
