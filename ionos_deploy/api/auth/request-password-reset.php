<?php
/**
 * LexiMix - Request Password Reset
 * POST /api/auth/request-password-reset.php
 * 
 * Sends a password reset email with a token
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$email = trim($input['email'] ?? '');

if (empty($email)) {
    jsonResponse(['success' => false, 'error' => 'E-Mail erforderlich'], 400);
}

if (!isValidEmail($email)) {
    jsonResponse(['success' => false, 'error' => 'Ungültige E-Mail-Adresse'], 400);
}

$pdo = getDB();

// Check if user exists
$stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

// Always return success to prevent email enumeration
if (!$user) {
    jsonResponse([
        'success' => true,
        'message' => 'Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.'
    ]);
}

// Generate reset token
$resetToken = generateToken(32);
$expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour

// Store reset token in magic_links table (reuse existing table)
$stmt = $pdo->prepare("
    INSERT INTO magic_links (email, token, expires_at, used)
    VALUES (?, ?, ?, 0)
");
$stmt->execute([$email, $resetToken, $expiresAt]);

// Send email
$resetLink = APP_URL . "/reset-password?token=" . $resetToken;

$subject = "LexiMix - Passwort zurücksetzen";
$htmlBody = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #16213e; padding: 30px; border-radius: 10px; }
        .logo { text-align: center; font-size: 32px; font-weight: bold; color: #FF006E; margin-bottom: 20px; }
        .button { display: inline-block; background: #FF006E; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>🎮 LexiMix</div>
        <h2>Hallo {$user['username']}!</h2>
        <p>Du hast angefordert, dein Passwort zurückzusetzen.</p>
        <p>Klicke auf den Button unten, um ein neues Passwort zu setzen:</p>
        <p style='text-align: center;'>
            <a href='{$resetLink}' class='button'>Passwort zurücksetzen</a>
        </p>
        <p>Oder kopiere diesen Link in deinen Browser:</p>
        <p style='word-break: break-all; color: #06FFA5;'>{$resetLink}</p>
        <p><strong>Der Link ist 1 Stunde gültig.</strong></p>
        <div class='footer'>
            Falls du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.<br>
            Dein Passwort wird nicht geändert, solange du nicht auf den Link klickst.
        </div>
    </div>
</body>
</html>
";

// Try to send email
$emailSent = false;
$headers = [
    'From' => SMTP_FROM_EMAIL,
    'Reply-To' => SMTP_FROM_EMAIL,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/html; charset=UTF-8'
];

// Use PHP mail() or external service
if (function_exists('mail')) {
    $headerStr = '';
    foreach ($headers as $key => $value) {
        $headerStr .= "$key: $value\r\n";
    }
    $emailSent = @mail($email, $subject, $htmlBody, $headerStr);
}

// Log for debugging
if (DEBUG_MODE && !$emailSent) {
    error_log("Password reset requested for: $email, token: $resetToken");
}

jsonResponse([
    'success' => true,
    'message' => 'Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
    'debug' => DEBUG_MODE ? ['token' => $resetToken, 'emailSent' => $emailSent] : null
]);
