<?php
/**
 * LexiMix - Lookup User by Friend Code
 * GET /api/friends/lookup.php?code=FRIEND_CODE
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$code = $_GET['code'] ?? '';

if (empty($code)) {
    jsonResponse(['success' => false, 'error' => 'Friend code required'], 400);
}

$pdo = getDB();

try {
    $stmt = $pdo->prepare("SELECT id, username, friend_code FROM users WHERE friend_code = ?");
    $stmt->execute([$code]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'User not found'], 404);
    }
    
    jsonResponse([
        'success' => true,
        'userId' => $user['id'],
        'username' => $user['username'],
        'friendCode' => $user['friend_code']
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to lookup user'], 500);
}
