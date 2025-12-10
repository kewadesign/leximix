<?php
// CORS Headers - Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = $data['password'];

// Basic validation
if (strlen($username) < 3 || strlen($password) < 6) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit();
}

// Check if user exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->execute([$username, $email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Username or Email already exists']);
    exit();
}

// Hash password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Generate Friend Code
function generateFriendCode($pdo)
{
    $code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
    $stmt = $pdo->prepare("SELECT id FROM users WHERE friend_code = ?");
    $stmt->execute([$code]);
    if ($stmt->fetch()) {
        return generateFriendCode($pdo);
    }
    return $code;
}

$friendCode = generateFriendCode($pdo);

// Generate verification token
$verificationToken = bin2hex(random_bytes(32));

// Create User
try {
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, friend_code, verification_token, save_data) VALUES (?, ?, ?, ?, ?, ?)");
    // Initial save data
    $initialSave = json_encode([
        'name' => $username,
        'age' => $data['age'] ?? 0,
        'level' => 1,
        'coins' => 0,
        'xp' => 0,
        'language' => $data['language'] ?? 'de',
        'friendCode' => $friendCode
    ]);

    $stmt->execute([$username, $email, $passwordHash, $friendCode, $verificationToken, $initialSave]);

    // Send Welcome Email with verification link
    $to = $email;
    $subject = "Willkommen bei LexiMix - Bestätige deine E-Mail";
    $verificationLink = "https://leximix.de/api/verify.php?token=$verificationToken";
    $message = "Hallo $username,\n\nWillkommen bei LexiMix! Dein Account wurde erfolgreich erstellt.\n\nBitte klicke auf den folgenden Link, um deine E-Mail-Adresse zu bestätigen:\n$verificationLink\n\nDein Freundescode: $friendCode\n\nViel Spaß beim Spielen!\nDein LexiMix Team";

    // Attempt to send
    require_once 'smtp_mailer.php';
    if (!sendSmtpMail($to, $subject, $message)) {
        // Log error but don't stop registration for now, or handle as needed
        error_log("Failed to send welcome email to $to");
    }

    echo json_encode(['success' => true, 'username' => $username, 'friendCode' => $friendCode]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()]);
}
?>