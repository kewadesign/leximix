<?php
/**
 * LexiMix - Verify Magic Link Token
 * POST /api/auth/verify-token.php
 * 
 * Verifies the magic link token and creates a session
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$token = trim($input['token'] ?? '');
$username = isset($input['username']) ? normalizeUsername($input['username']) : null;

// Validate token
if (!$token || strlen($token) !== 64) {
    jsonResponse(['success' => false, 'error' => 'Ungültiger Token'], 400);
}

$pdo = getDB();

// Find the magic link
$stmt = $pdo->prepare("
    SELECT * FROM magic_links 
    WHERE token = ? AND used = FALSE AND expires_at > NOW()
");
$stmt->execute([$token]);
$magicLink = $stmt->fetch();

if (!$magicLink) {
    jsonResponse(['success' => false, 'error' => 'Token ungültig oder abgelaufen'], 400);
}

// Mark token as used
$stmt = $pdo->prepare("UPDATE magic_links SET used = TRUE WHERE id = ?");
$stmt->execute([$magicLink['id']]);

// Check if user exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$magicLink['email']]);
$user = $stmt->fetch();

if (!$user) {
    // New user - need username
    if (!$username || strlen($username) < 3) {
        jsonResponse([
            'success' => false, 
            'error' => 'Username erforderlich',
            'needsUsername' => true,
            'email' => $magicLink['email']
        ], 400);
    }
    
    // Check if username is taken
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        jsonResponse([
            'success' => false, 
            'error' => 'Benutzername bereits vergeben',
            'needsUsername' => true
        ], 400);
    }
    
    // Generate friend code
    $friendCode = null;
    for ($i = 0; $i < 10; $i++) {
        $code = generateFriendCode();
        $stmt = $pdo->prepare("SELECT id FROM users WHERE friend_code = ?");
        $stmt->execute([$code]);
        if (!$stmt->fetch()) {
            $friendCode = $code;
            break;
        }
    }
    
    // Create user
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, friend_code, created_at) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$username, $magicLink['email'], $friendCode]);
    $userId = $pdo->lastInsertId();
    
    // Create initial user data
    $initialData = json_encode([
        'name' => $username,
        'age' => 0,
        'avatarId' => 'default',
        'ownedAvatars' => ['default'],
        'xp' => 0,
        'level' => 1,
        'coins' => 100, // Welcome bonus
        'isPremium' => false,
        'completedLevels' => new \stdClass(),
        'playedWords' => [],
        'language' => 'DE',
        'theme' => 'dark',
        'friendCode' => $friendCode,
        'lastSaved' => time() * 1000
    ]);
    
    $stmt = $pdo->prepare("
        INSERT INTO user_data (user_id, data, version) 
        VALUES (?, ?, 1)
    ");
    $stmt->execute([$userId, $initialData]);
    
    // Fetch created user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
}

// Update last login
$stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
$stmt->execute([$user['id']]);

// Create session
$sessionToken = generateToken();
$expiresAt = date('Y-m-d H:i:s', time() + SESSION_EXPIRY);

$stmt = $pdo->prepare("
    INSERT INTO sessions (user_id, token, expires_at) 
    VALUES (?, ?, ?)
");
$stmt->execute([$user['id'], $sessionToken, $expiresAt]);

// Load user data
$stmt = $pdo->prepare("SELECT data, version FROM user_data WHERE user_id = ?");
$stmt->execute([$user['id']]);
$userData = $stmt->fetch();

jsonResponse([
    'success' => true,
    'message' => 'Login erfolgreich!',
    'sessionToken' => $sessionToken,
    'expiresAt' => $expiresAt,
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'friendCode' => $user['friend_code'],
        'isPremium' => (bool)$user['is_premium'],
        'createdAt' => $user['created_at']
    ],
    'userData' => $userData ? json_decode($userData['data'], true) : null,
    'dataVersion' => $userData ? $userData['version'] : 0
]);
