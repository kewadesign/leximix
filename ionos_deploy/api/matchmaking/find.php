<?php
/**
 * LexiMix - Find Match
 * POST /api/matchmaking/find.php
 * 
 * Server-side matchmaking - atomar und race-condition-safe
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameType = $input['gameType'] ?? '';

$allowedTypes = ['maumau', 'chess', 'morris', 'rummy', 'checkers'];
if (!in_array($gameType, $allowedTypes)) {
    jsonResponse(['success' => false, 'error' => 'Invalid game type'], 400);
}

$pdo = getDB();

try {
    $pdo->beginTransaction();
    
    // Find oldest opponent in queue (FIFO)
    $stmt = $pdo->prepare("
        SELECT mq.id, mq.user_id, u.username
        FROM matchmaking_queue mq
        JOIN users u ON mq.user_id = u.id
        WHERE mq.game_type = ? AND mq.user_id != ?
        ORDER BY mq.created_at ASC
        LIMIT 1
        FOR UPDATE
    ");
    $stmt->execute([$gameType, $userId]);
    $opponent = $stmt->fetch();
    
    if (!$opponent) {
        $pdo->rollBack();
        jsonResponse([
            'success' => true,
            'matched' => false,
            'message' => 'No opponent found'
        ]);
    }
    
    // Remove both users from queue
    $stmt = $pdo->prepare("DELETE FROM matchmaking_queue WHERE user_id IN (?, ?) AND game_type = ?");
    $stmt->execute([$userId, $opponent['user_id'], $gameType]);
    
    // Generate game ID
    $gameId = bin2hex(random_bytes(16));
    
    // Get current user's username
    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $currentUser = $stmt->fetch();
    
    // Create match signals for both users
    $stmt = $pdo->prepare("
        INSERT INTO matches (user_id, game_id, opponent_id, opponent_username, game_type)
        VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $userId, $gameId, $opponent['user_id'], $opponent['username'], $gameType,
        $opponent['user_id'], $gameId, $userId, $currentUser['username'], $gameType
    ]);
    
    $pdo->commit();
    
    jsonResponse([
        'success' => true,
        'matched' => true,
        'gameId' => $gameId,
        'opponent' => [
            'userId' => $opponent['user_id'],
            'username' => $opponent['username']
        ]
    ]);
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to find match'], 500);
}
