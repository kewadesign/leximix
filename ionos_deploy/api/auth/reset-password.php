<?php
/**
 * LexiMix - Reset Password
 * POST /api/auth/reset-password.php
 * 
 * Resets password using a valid token
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$token = trim($input['token'] ?? '');
$newPassword = $input['password'] ?? '';

if (empty($token) || empty($newPassword)) {
    jsonResponse(['success' => false, 'error' => 'Token und neues Passwort erforderlich'], 400);
}

if (strlen($newPassword) < 6) {
    jsonResponse(['success' => false, 'error' => 'Passwort muss mindestens 6 Zeichen lang sein'], 400);
}

$pdo = getDB();

// Find valid token
$stmt = $pdo->prepare("
    SELECT id, email 
    FROM magic_links 
    WHERE token = ? AND used = 0 AND expires_at > NOW()
");
$stmt->execute([$token]);
$resetRequest = $stmt->fetch();

if (!$resetRequest) {
    jsonResponse(['success' => false, 'error' => 'Ungültiger oder abgelaufener Token'], 400);
}

// Find user by email
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$resetRequest['email']]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Benutzer nicht gefunden'], 404);
}

try {
    $pdo->beginTransaction();
    
    // Hash new password
    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
    
    // Update user password
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$passwordHash, $user['id']]);
    
    // Mark token as used
    $stmt = $pdo->prepare("UPDATE magic_links SET used = 1 WHERE id = ?");
    $stmt->execute([$resetRequest['id']]);
    
    // Invalidate all existing sessions for security
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    
    $pdo->commit();
    
    jsonResponse([
        'success' => true,
        'message' => 'Passwort erfolgreich geändert. Du kannst dich jetzt einloggen.'
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => 'Fehler: ' . $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Passwort-Reset fehlgeschlagen'], 500);
}
