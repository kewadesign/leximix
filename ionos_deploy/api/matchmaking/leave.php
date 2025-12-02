<?php
/**
 * LexiMix - Leave Matchmaking Queue
 * POST /api/matchmaking/leave.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameType = $input['gameType'] ?? '';

$pdo = getDB();

try {
    if ($gameType) {
        $stmt = $pdo->prepare("DELETE FROM matchmaking_queue WHERE user_id = ? AND game_type = ?");
        $stmt->execute([$userId, $gameType]);
    } else {
        // Remove from all queues
        $stmt = $pdo->prepare("DELETE FROM matchmaking_queue WHERE user_id = ?");
        $stmt->execute([$userId]);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Left matchmaking queue'
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to leave queue'], 500);
}
