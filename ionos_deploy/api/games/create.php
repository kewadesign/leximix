<?php
/**
 * LexiMix - Create Game
 * POST /api/games/create.php
 * 
 * Creates a new multiplayer game
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameType = $input['gameType'] ?? '';
$initialState = $input['state'] ?? null;

// Validation
$allowedTypes = ['maumau', 'chess', 'morris', 'rummy', 'checkers'];
if (!in_array($gameType, $allowedTypes)) {
    jsonResponse(['success' => false, 'error' => 'Invalid game type'], 400);
}

if (!$initialState) {
    jsonResponse(['success' => false, 'error' => 'Initial state required'], 400);
}

$pdo = getDB();

try {
    // Generate unique game ID
    $gameId = bin2hex(random_bytes(16));
    
    // Insert game
    $stmt = $pdo->prepare("
        INSERT INTO games (id, game_type, host_id, state, status)
        VALUES (?, ?, ?, ?, 'waiting')
    ");
    $stmt->execute([
        $gameId,
        $gameType,
        $userId,
        json_encode($initialState)
    ]);
    
    jsonResponse([
        'success' => true,
        'gameId' => $gameId
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to create game'], 500);
}
