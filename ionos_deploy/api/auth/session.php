<?php
/**
 * LexiMix - Check Session
 * GET /api/auth/session.php
 * 
 * Validates the current session and returns user info
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = getCurrentSession();

if (!$session) {
    jsonResponse([
        'success' => false,
        'error' => 'Nicht angemeldet',
        'authenticated' => false
    ], 401);
}

$pdo = getDB();

// Load user data
$stmt = $pdo->prepare("SELECT data, version FROM user_data WHERE user_id = ?");
$stmt->execute([$session['user_id']]);
$userData = $stmt->fetch();

jsonResponse([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => $session['user_id'],
        'username' => $session['username'],
        'email' => $session['email'],
        'friendCode' => $session['friend_code'],
        'isPremium' => (bool)$session['is_premium']
    ],
    'userData' => $userData ? json_decode($userData['data'], true) : null,
    'dataVersion' => $userData ? $userData['version'] : 0,
    'sessionExpiresAt' => $session['expires_at']
]);
