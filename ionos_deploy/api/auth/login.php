<?php
/**
 * LexiMix - User Login
 * POST /api/auth/login.php
 * 
 * Login with email + password
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validation
if (empty($email) || empty($password)) {
    jsonResponse(['success' => false, 'error' => 'E-Mail und Passwort erforderlich'], 400);
}

if (!isValidEmail($email)) {
    jsonResponse(['success' => false, 'error' => 'Ungültige E-Mail-Adresse'], 400);
}

$pdo = getDB();

// Find user by email
$stmt = $pdo->prepare("
    SELECT id, username, email, password_hash, friend_code, is_premium, created_at
    FROM users 
    WHERE email = ?
");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Benutzer nicht gefunden'], 401);
}

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    jsonResponse(['success' => false, 'error' => 'Falsches Passwort'], 401);
}

// Update last login
$stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
$stmt->execute([$user['id']]);

// Delete old sessions for this user (optional: keep last 5)
$stmt = $pdo->prepare("
    DELETE FROM sessions 
    WHERE user_id = ? 
    AND id NOT IN (
        SELECT id FROM (
            SELECT id FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
        ) as t
    )
");
$stmt->execute([$user['id'], $user['id']]);

// Create new session
$sessionToken = generateToken();
$expiresAt = date('Y-m-d H:i:s', time() + SESSION_EXPIRY);

$stmt = $pdo->prepare("
    INSERT INTO sessions (user_id, session_token, expires_at)
    VALUES (?, ?, ?)
");
$stmt->execute([$user['id'], $sessionToken, $expiresAt]);

// Get user data
$stmt = $pdo->prepare("SELECT data_value FROM user_data WHERE user_id = ? AND data_key = 'current'");
$stmt->execute([$user['id']]);
$userDataRow = $stmt->fetch();
$userData = $userDataRow ? json_decode($userDataRow['data_value'], true) : null;

jsonResponse([
    'success' => true,
    'sessionToken' => $sessionToken,
    'expiresAt' => $expiresAt,
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'friendCode' => $user['friend_code'],
        'isPremium' => (bool)$user['is_premium']
    ],
    'userData' => $userData
]);
