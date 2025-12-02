<?php
/**
 * LexiMix - List Game Invites
 * GET /api/invites/list.php
 * 
 * Get pending game invitations (for polling)
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$pdo = getDB();

try {
    // Get pending invites for this user
    $stmt = $pdo->prepare("
        SELECT gi.*,
               g.game_type,
               g.status as game_status,
               from_user.username as from_username,
               from_user.friend_code as from_friend_code
        FROM game_invites gi
        JOIN games g ON gi.game_id = g.id
        JOIN users from_user ON gi.from_user_id = from_user.id
        WHERE gi.to_user_id = ? AND gi.status = 'pending'
        ORDER BY gi.created_at DESC
    ");
    $stmt->execute([$userId]);
    $invites = $stmt->fetchAll();
    
    $result = [];
    foreach ($invites as $invite) {
        $result[] = [
            'id' => $invite['id'],
            'gameId' => $invite['game_id'],
            'gameType' => $invite['game_type'],
            'fromUserId' => $invite['from_user_id'],
            'fromUsername' => $invite['from_username'],
            'fromFriendCode' => $invite['from_friend_code'],
            'createdAt' => $invite['created_at']
        ];
    }
    
    jsonResponse([
        'success' => true,
        'invites' => $result
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to list invites'], 500);
}
