<?php
/**
 * LexiMix - Remove Friend
 * POST /api/friends/remove.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$friendCode = $input['friendCode'] ?? '';

if (empty($friendCode)) {
    jsonResponse(['success' => false, 'error' => 'Friend code required'], 400);
}

$pdo = getDB();

try {
    // Find friend by code
    $stmt = $pdo->prepare("SELECT id FROM users WHERE friend_code = ?");
    $stmt->execute([$friendCode]);
    $friend = $stmt->fetch();
    
    if (!$friend) {
        jsonResponse(['success' => false, 'error' => 'Friend not found'], 404);
    }
    
    $friendId = $friend['id'];
    
    // Remove bidirectional friendship
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
    $stmt->execute([$userId, $friendId, $friendId, $userId]);
    
    $pdo->commit();
    
    jsonResponse([
        'success' => true,
        'message' => 'Friend removed successfully'
    ]);
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to remove friend'], 500);
}
