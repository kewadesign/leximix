<?php
/**
 * LexiMix - Delete User Account
 * POST /api/auth/delete-account.php
 * 
 * Permanently deletes user account and all associated data
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// Require authentication
$session = getCurrentSession();
if (!$session) {
    jsonResponse(['success' => false, 'error' => 'Nicht autorisiert'], 401);
}

$input = getJsonInput();
$confirmPassword = $input['password'] ?? '';

if (empty($confirmPassword)) {
    jsonResponse(['success' => false, 'error' => 'Passwort zur Bestätigung erforderlich'], 400);
}

$pdo = getDB();

// Get user with password hash
$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE id = ?");
$stmt->execute([$session['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Benutzer nicht gefunden'], 404);
}

// Verify password
if (!password_verify($confirmPassword, $user['password_hash'])) {
    jsonResponse(['success' => false, 'error' => 'Falsches Passwort'], 401);
}

try {
    $pdo->beginTransaction();
    
    $userId = $user['id'];
    
    // Delete all user data (cascades handle most, but be explicit)
    $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM user_data WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM friends WHERE user_id = ? OR friend_id = ?")->execute([$userId, $userId]);
    $pdo->prepare("DELETE FROM friend_requests WHERE from_user_id = ? OR to_user_id = ?")->execute([$userId, $userId]);
    $pdo->prepare("DELETE FROM voucher_redemptions WHERE user_id = ?")->execute([$userId]);
    $pdo->prepare("DELETE FROM game_invites WHERE from_user_id = ? OR to_user_id = ?")->execute([$userId, $userId]);
    $pdo->prepare("DELETE FROM games WHERE host_id = ? OR guest_id = ?")->execute([$userId, $userId]);
    
    // Finally delete the user
    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
    
    $pdo->commit();
    
    jsonResponse([
        'success' => true,
        'message' => 'Account erfolgreich gelöscht'
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => 'Löschen fehlgeschlagen: ' . $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Löschen fehlgeschlagen'], 500);
}
