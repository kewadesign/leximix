<?php
/**
 * LexiMix - Add Friend by Code
 * POST /api/friends/add.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$input = getJsonInput();
$friendCode = strtoupper(trim($input['friendCode'] ?? ''));

if (!$friendCode || strlen($friendCode) !== 6) {
    jsonResponse(['success' => false, 'error' => 'Ungültiger Freundescode'], 400);
}

$pdo = getDB();

// Find friend by code
$stmt = $pdo->prepare("SELECT id, username FROM users WHERE friend_code = ?");
$stmt->execute([$friendCode]);
$friend = $stmt->fetch();

if (!$friend) {
    jsonResponse(['success' => false, 'error' => 'Benutzer nicht gefunden'], 404);
}

if ($friend['id'] == $session['user_id']) {
    jsonResponse(['success' => false, 'error' => 'Du kannst dich nicht selbst hinzufügen'], 400);
}

// Check if already friends
$stmt = $pdo->prepare("SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?");
$stmt->execute([$session['user_id'], $friend['id']]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'error' => 'Ihr seid bereits befreundet'], 400);
}

// Check if request already exists
$stmt = $pdo->prepare("SELECT status FROM friend_requests WHERE from_user_id = ? AND to_user_id = ?");
$stmt->execute([$session['user_id'], $friend['id']]);
$existing = $stmt->fetch();

if ($existing) {
    if ($existing['status'] === 'pending') {
        jsonResponse(['success' => false, 'error' => 'Anfrage bereits gesendet'], 400);
    }
}

// Check if they sent us a request (auto-accept)
$stmt = $pdo->prepare("SELECT id FROM friend_requests WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'");
$stmt->execute([$friend['id'], $session['user_id']]);
$theirRequest = $stmt->fetch();

if ($theirRequest) {
    // Auto-accept: They already requested us
    $stmt = $pdo->prepare("UPDATE friend_requests SET status = 'accepted' WHERE id = ?");
    $stmt->execute([$theirRequest['id']]);
    
    // Add friendship both ways
    $stmt = $pdo->prepare("INSERT INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)");
    $stmt->execute([$session['user_id'], $friend['id'], $friend['id'], $session['user_id']]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Ihr seid jetzt Freunde!',
        'friendAdded' => true,
        'friend' => [
            'id' => $friend['id'],
            'username' => $friend['username']
        ]
    ]);
}

// Create friend request
$stmt = $pdo->prepare("
    INSERT INTO friend_requests (from_user_id, to_user_id, status) 
    VALUES (?, ?, 'pending')
    ON DUPLICATE KEY UPDATE status = 'pending', created_at = NOW()
");
$stmt->execute([$session['user_id'], $friend['id']]);

jsonResponse([
    'success' => true,
    'message' => 'Freundschaftsanfrage gesendet!',
    'friendAdded' => false
]);
