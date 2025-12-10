<?php
// Email Verification Script
header('Content-Type: text/html; charset=utf-8');

require 'db_connect.php';

if (!isset($_GET['token']) || empty($_GET['token'])) {
    http_response_code(400);
    echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LexiMix - Ungültiger Link</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
        h1 { color: #FF006E; margin-bottom: 20px; }
        p { color: #333; line-height: 1.6; }
        .button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #FF006E; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background: #D60054; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Ungültiger Link</h1>
        <p>Der Bestätigungslink ist ungültig oder fehlt.</p>
        <a href="https://leximix.de" class="button">Zurück zur Startseite</a>
    </div>
</body>
</html>';
    exit();
}

$token = $_GET['token'];

try {
    // Find user by token
    $stmt = $pdo->prepare("SELECT id, username, email, email_verified FROM users WHERE verification_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LexiMix - Ungültiger Token</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
        h1 { color: #FF006E; margin-bottom: 20px; }
        p { color: #333; line-height: 1.6; }
        .button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #FF006E; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background: #D60054; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Token nicht gefunden</h1>
        <p>Der Bestätigungslink ist ungültig oder wurde bereits verwendet.</p>
        <a href="https://leximix.de" class="button">Zurück zur Startseite</a>
    </div>
</body>
</html>';
        exit();
    }

    // Check if already verified
    if ($user['email_verified']) {
        echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LexiMix - Bereits bestätigt</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
        h1 { color: #06FFA5; margin-bottom: 20px; }
        p { color: #333; line-height: 1.6; }
        .button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #06FFA5; color: black; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background: #00D68F; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✓ Bereits bestätigt!</h1>
        <p>Deine E-Mail-Adresse wurde bereits bestätigt. Du kannst dich jetzt anmelden!</p>
        <a href="https://leximix.de" class="button">Zur Anmeldung</a>
    </div>
</body>
</html>';
        exit();
    }

    // Verify the email
    $stmt = $pdo->prepare("UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?");
    $stmt->execute([$user['id']]);

    echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LexiMix - E-Mail bestätigt!</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
        h1 { color: #06FFA5; margin-bottom: 20px; }
        p { color: #333; line-height: 1.6; }
        .username { font-size: 24px; font-weight: bold; color: #FF006E; margin: 20px 0; }
        .button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #06FFA5; color: black; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background: #00D68F; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 E-Mail bestätigt!</h1>
        <p>Willkommen, <span class="username">' . htmlspecialchars($user['username']) . '</span>!</p>
        <p>Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt anmelden und spielen!</p>
        <a href="https://leximix.de" class="button">Jetzt spielen</a>
    </div>
</body>
</html>';

} catch (Exception $e) {
    http_response_code(500);
    echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LexiMix - Fehler</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
        h1 { color: #FF006E; margin-bottom: 20px; }
        p { color: #333; line-height: 1.6; }
        .button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #FF006E; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background: #D60054; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Fehler</h1>
        <p>Bei der Bestätigung ist ein Fehler aufgetreten. Bitte versuche es später erneut.</p>
        <a href="https://leximix.de" class="button">Zurück zur Startseite</a>
    </div>
</body>
</html>';
}
?>