<?php
/**
 * LexiMix - User Registration
 * POST /api/auth/register.php
 * 
 * Registers a new user with email + password
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$username = trim($input['username'] ?? '');
$language = $input['language'] ?? 'DE';
$age = intval($input['age'] ?? 0);

// Validation
if (empty($email) || empty($password) || empty($username)) {
    jsonResponse(['success' => false, 'error' => 'Alle Felder sind erforderlich'], 400);
}

if (!isValidEmail($email)) {
    jsonResponse(['success' => false, 'error' => 'Ungültige E-Mail-Adresse'], 400);
}

if (strlen($username) < 3 || strlen($username) > 30) {
    jsonResponse(['success' => false, 'error' => 'Benutzername muss 3-30 Zeichen lang sein'], 400);
}

if (!preg_match('/^[a-zA-Z0-9]+$/', $username)) {
    jsonResponse(['success' => false, 'error' => 'Nur Buchstaben und Zahlen erlaubt'], 400);
}

if (strlen($password) < 6) {
    jsonResponse(['success' => false, 'error' => 'Passwort muss mindestens 6 Zeichen lang sein'], 400);
}

if ($age < 12 || $age > 120) {
    jsonResponse(['success' => false, 'error' => 'Ungültiges Alter'], 400);
}

$pdo = getDB();

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'error' => 'E-Mail wird bereits verwendet'], 400);
}

// Check if username already exists
$normalizedUsername = normalizeUsername($username);
$stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(REPLACE(username, ' ', '')) = ?");
$stmt->execute([$normalizedUsername]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'error' => 'Benutzername bereits vergeben'], 400);
}

// Generate friend code
$friendCode = generateFriendCode();

// Hash password
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

// Create user
try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, friend_code, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$username, $email, $passwordHash, $friendCode]);
    $userId = $pdo->lastInsertId();
    
    // Create initial user data
    $initialData = json_encode([
        'name' => $username,
        'age' => $age,
        'language' => $language,
        'xp' => 0,
        'level' => 1,
        'coins' => 0,
        'isPremium' => false,
        'friendCode' => $friendCode,
        'completedLevels' => [],
        'playedWords' => [],
        'theme' => 'dark',
        'avatarId' => 'avatar_cyberpunk_warrior',
        'ownedAvatars' => ['avatar_cyberpunk_warrior'],
        'createdAt' => time() * 1000
    ]);
    
    $stmt = $pdo->prepare("
        INSERT INTO user_data (user_id, data_key, data_value)
        VALUES (?, 'current', ?)
    ");
    $stmt->execute([$userId, $initialData]);
    
    $pdo->commit();
    
    // Create session
    $sessionToken = generateToken();
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_EXPIRY);
    
    $stmt = $pdo->prepare("
        INSERT INTO sessions (user_id, session_token, expires_at)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$userId, $sessionToken, $expiresAt]);
    
    jsonResponse([
        'success' => true,
        'sessionToken' => $sessionToken,
        'expiresAt' => $expiresAt,
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'friendCode' => $friendCode,
            'isPremium' => false
        ],
        'userData' => json_decode($initialData, true)
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => 'Registrierung fehlgeschlagen: ' . $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Registrierung fehlgeschlagen'], 500);
}
