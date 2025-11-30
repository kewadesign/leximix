<?php
/**
 * LexiMix - Get Friends List
 * GET /api/friends/list.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$pdo = getDB();

// Get friends
$stmt = $pdo->prepare("
    SELECT u.id, u.username, u.friend_code, u.is_premium, u.last_login, f.since
    FROM friends f
    JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = ?
    ORDER BY u.username
");
$stmt->execute([$session['user_id']]);
$friends = $stmt->fetchAll();

// Get pending requests (received)
$stmt = $pdo->prepare("
    SELECT fr.id as request_id, u.id, u.username, u.friend_code, fr.created_at
    FROM friend_requests fr
    JOIN users u ON fr.from_user_id = u.id
    WHERE fr.to_user_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
");
$stmt->execute([$session['user_id']]);
$pendingRequests = $stmt->fetchAll();

// Get sent requests (pending)
$stmt = $pdo->prepare("
    SELECT fr.id as request_id, u.id, u.username, u.friend_code, fr.created_at
    FROM friend_requests fr
    JOIN users u ON fr.to_user_id = u.id
    WHERE fr.from_user_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
");
$stmt->execute([$session['user_id']]);
$sentRequests = $stmt->fetchAll();

jsonResponse([
    'success' => true,
    'friends' => $friends,
    'pendingRequests' => $pendingRequests,
    'sentRequests' => $sentRequests,
    'myFriendCode' => $session['friend_code']
]);
