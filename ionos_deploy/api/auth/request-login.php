<?php
/**
 * LexiMix - Request Magic Link
 * POST /api/auth/request-login.php
 * 
 * Sends a magic link to the user's email for passwordless login
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$email = trim($input['email'] ?? '');

// Validate email
if (!$email || !isValidEmail($email)) {
    jsonResponse(['success' => false, 'error' => 'Ungültige E-Mail-Adresse'], 400);
}

$pdo = getDB();

// Check if user exists
$stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

$isNewUser = !$user;

// Generate magic link token
$token = generateToken();
$expiresAt = date('Y-m-d H:i:s', time() + MAGIC_LINK_EXPIRY);

// Store magic link
$stmt = $pdo->prepare("
    INSERT INTO magic_links (email, token, expires_at) 
    VALUES (?, ?, ?)
");
$stmt->execute([$email, $token, $expiresAt]);

// Build magic link URL
$magicLinkUrl = APP_URL . "?login_token=" . $token;

// Send email
$subject = $isNewUser ? "Willkommen bei LexiMix!" : "Dein Login-Link für LexiMix";

$htmlBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #fff; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: #262626; border: 4px solid #000; box-shadow: 8px 8px 0 #000; padding: 30px; }
        .logo { text-align: center; font-size: 32px; font-weight: 900; color: #06FFA5; margin-bottom: 20px; }
        .btn { display: inline-block; background: #06FFA5; color: #000; font-weight: 900; padding: 16px 32px; text-decoration: none; border: 4px solid #000; box-shadow: 4px 4px 0 #000; margin: 20px 0; }
        .btn:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; }
        .footer { font-size: 12px; color: #888; margin-top: 30px; }
        .expire { color: #FF006E; font-weight: bold; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>🎮 LEXIMIX</div>
        <h2 style='margin: 0 0 20px 0;'>" . ($isNewUser ? "Willkommen! 👋" : "Hey! 👋") . "</h2>
        <p>Klicke auf den Button um dich " . ($isNewUser ? "zu registrieren" : "einzuloggen") . ":</p>
        <center>
            <a href='" . $magicLinkUrl . "' class='btn'>🔐 " . ($isNewUser ? "Jetzt Registrieren" : "Einloggen") . "</a>
        </center>
        <p class='expire'>⏰ Dieser Link ist 15 Minuten gültig.</p>
        <p class='footer'>
            Falls du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.<br>
            Der Link funktioniert nur einmal.
        </p>
    </div>
</body>
</html>
";

$textBody = ($isNewUser ? "Willkommen bei LexiMix!" : "Dein Login-Link") . "\n\n" .
    "Klicke hier um dich " . ($isNewUser ? "zu registrieren" : "einzuloggen") . ":\n" .
    $magicLinkUrl . "\n\n" .
    "Der Link ist 15 Minuten gültig und funktioniert nur einmal.";

// Send via SMTP
$mailSent = sendEmail($email, $subject, $htmlBody, $textBody);

if (!$mailSent) {
    jsonResponse(['success' => false, 'error' => 'E-Mail konnte nicht gesendet werden'], 500);
}

jsonResponse([
    'success' => true,
    'message' => 'Magic Link gesendet! Prüfe deine E-Mails.',
    'isNewUser' => $isNewUser
]);

/**
 * Send email via SMTP
 */
function sendEmail(string $to, string $subject, string $htmlBody, string $textBody): bool {
    // Try PHPMailer if available
    $phpmailerPath = __DIR__ . '/../vendor/PHPMailer/src/PHPMailer.php';
    
    if (file_exists($phpmailerPath)) {
        require_once $phpmailerPath;
        require_once __DIR__ . '/../vendor/PHPMailer/src/SMTP.php';
        require_once __DIR__ . '/../vendor/PHPMailer/src/Exception.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        try {
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = SMTP_PORT;
            $mail->CharSet = 'UTF-8';
            
            $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
            $mail->addAddress($to);
            
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $textBody;
            
            return $mail->send();
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $mail->ErrorInfo);
            return false;
        }
    }
    
    // Fallback to PHP mail() function
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>',
        'Reply-To: ' . SMTP_FROM_EMAIL,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $subject, $htmlBody, implode("\r\n", $headers));
}
