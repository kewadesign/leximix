<?php
/**
 * LexiMix - Respond to Game Invite
 * POST /api/invites/respond.php
 * 
 * Accept or decline a game invitation
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$inviteId = $input['inviteId'] ?? null;
$action = $input['action'] ?? ''; // 'accept' or 'decline'

if (!$inviteId || !in_array($action, ['accept', 'decline'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid request'], 400);
}

$pdo = getDB();

try {
    // Get invite
    $stmt = $pdo->prepare("
        SELECT gi.*, g.*
        FROM game_invites gi
        JOIN games g ON gi.game_id = g.id
        WHERE gi.id = ? AND gi.to_user_id = ?
    ");
    $stmt->execute([$inviteId, $userId]);
    $invite = $stmt->fetch();
    
    if (!$invite) {
        jsonResponse(['success' => false, 'error' => 'Invite not found'], 404);
    }
    
    if ($invite['status'] !== 'pending') {
        jsonResponse(['success' => false, 'error' => 'Invite already processed'], 400);
    }
    
    $pdo->beginTransaction();
    
    if ($action === 'accept') {
        // Check if game still has space
        if ($invite['guest_id']) {
            $pdo->rollBack();
            jsonResponse(['success' => false, 'error' => 'Game is full'], 400);
        }
        
        // Update invite status
        $stmt = $pdo->prepare("UPDATE game_invites SET status = 'accepted' WHERE id = ?");
        $stmt->execute([$inviteId]);
        
        // Join game
        $stmt = $pdo->prepare("
            UPDATE games 
            SET guest_id = ?, status = 'ready', last_activity = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$userId, $invite['game_id']]);
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Invite accepted',
            'gameId' => $invite['game_id']
        ]);
        
    } else {
        // Decline
        $stmt = $pdo->prepare("UPDATE game_invites SET status = 'declined' WHERE id = ?");
        $stmt->execute([$inviteId]);
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Invite declined'
        ]);
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to process invite'], 500);
}
