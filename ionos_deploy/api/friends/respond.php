<?php
/**
 * LexiMix - Accept/Reject Friend Request
 * POST /api/friends/respond.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$input = getJsonInput();
$requestId = intval($input['requestId'] ?? 0);
$action = $input['action'] ?? ''; // 'accept' or 'reject'

if (!$requestId || !in_array($action, ['accept', 'reject'])) {
    jsonResponse(['success' => false, 'error' => 'Ungültige Anfrage'], 400);
}

$pdo = getDB();

// Find the request
$stmt = $pdo->prepare("
    SELECT * FROM friend_requests 
    WHERE id = ? AND to_user_id = ? AND status = 'pending'
");
$stmt->execute([$requestId, $session['user_id']]);
$request = $stmt->fetch();

if (!$request) {
    jsonResponse(['success' => false, 'error' => 'Anfrage nicht gefunden'], 404);
}

if ($action === 'accept') {
    // Update request status
    $stmt = $pdo->prepare("UPDATE friend_requests SET status = 'accepted' WHERE id = ?");
    $stmt->execute([$requestId]);
    
    // Add friendship both ways
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)
    ");
    $stmt->execute([
        $session['user_id'], $request['from_user_id'],
        $request['from_user_id'], $session['user_id']
    ]);
    
    // Get friend info
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$request['from_user_id']]);
    $friend = $stmt->fetch();
    
    jsonResponse([
        'success' => true,
        'message' => 'Freundschaftsanfrage angenommen!',
        'friend' => $friend
    ]);
} else {
    // Reject
    $stmt = $pdo->prepare("UPDATE friend_requests SET status = 'rejected' WHERE id = ?");
    $stmt->execute([$requestId]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Freundschaftsanfrage abgelehnt'
    ]);
}
