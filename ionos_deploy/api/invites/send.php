<?php
/**
 * LexiMix - Send Game Invite
 * POST /api/invites/send.php
 * 
 * Send a game invitation to another user
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameId = $input['gameId'] ?? '';
$toUserId = $input['toUserId'] ?? null;
$toFriendCode = $input['toFriendCode'] ?? null;

if (empty($gameId)) {
    jsonResponse(['success' => false, 'error' => 'Game ID required'], 400);
}

if (!$toUserId && !$toFriendCode) {
    jsonResponse(['success' => false, 'error' => 'User ID or friend code required'], 400);
}

$pdo = getDB();

try {
    // Verify game exists and user is host
    $stmt = $pdo->prepare("SELECT * FROM games WHERE id = ? AND host_id = ?");
    $stmt->execute([$gameId, $userId]);
    $game = $stmt->fetch();
    
    if (!$game) {
        jsonResponse(['success' => false, 'error' => 'Game not found or not authorized'], 404);
    }
    
    // Find target user
    $targetUserId = $toUserId;
    if (!$targetUserId && $toFriendCode) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE friend_code = ?");
        $stmt->execute([$toFriendCode]);
        $targetUser = $stmt->fetch();
        if (!$targetUser) {
            jsonResponse(['success' => false, 'error' => 'User not found'], 404);
        }
        $targetUserId = $targetUser['id'];
    }
    
    // Check if user is trying to invite themselves
    if ($targetUserId == $userId) {
        jsonResponse(['success' => false, 'error' => 'Cannot invite yourself'], 400);
    }
    
    // Check for existing pending invite
    $stmt = $pdo->prepare("
        SELECT id FROM game_invites 
        WHERE game_id = ? AND from_user_id = ? AND to_user_id = ? AND status = 'pending'
    ");
    $stmt->execute([$gameId, $userId, $targetUserId]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'error' => 'Invite already sent'], 400);
    }
    
    // Create invite
    $stmt = $pdo->prepare("
        INSERT INTO game_invites (game_id, from_user_id, to_user_id, status)
        VALUES (?, ?, ?, 'pending')
    ");
    $stmt->execute([$gameId, $userId, $targetUserId]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Invite sent successfully'
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to send invite'], 500);
}
