<?php
/**
 * LexiMix - Import Users from Firebase Export
 * POST /api/admin/import-users.php
 * 
 * ADMIN ONLY - Import users from Firebase JSON export
 * Requires admin secret in header
 */

require_once __DIR__ . '/../config.php';

// Admin authentication
$adminSecret = $_SERVER['HTTP_X_ADMIN_SECRET'] ?? '';
if ($adminSecret !== 'YOUR_ADMIN_SECRET_HERE') { // Change this!
    jsonResponse(['success' => false, 'error' => 'Unauthorized'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$users = $input['users'] ?? [];

if (empty($users)) {
    jsonResponse(['success' => false, 'error' => 'No users provided'], 400);
}

$pdo = getDB();
$imported = 0;
$skipped = 0;
$errors = [];

foreach ($users as $username => $userData) {
    try {
        $normalizedUsername = normalizeUsername($username);
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$normalizedUsername]);
        
        if ($stmt->fetch()) {
            $skipped++;
            continue;
        }
        
        // Get email from userData or generate placeholder
        $email = $userData['email'] ?? $normalizedUsername . '@migrated.leximix.de';
        
        // Generate friend code
        $friendCode = null;
        if (isset($userData['friendCode'])) {
            $friendCode = $userData['friendCode'];
        } else {
            for ($i = 0; $i < 10; $i++) {
                $code = generateFriendCode();
                $stmt = $pdo->prepare("SELECT id FROM users WHERE friend_code = ?");
                $stmt->execute([$code]);
                if (!$stmt->fetch()) {
                    $friendCode = $code;
                    break;
                }
            }
        }
        
        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, friend_code, is_premium, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $normalizedUsername,
            $email,
            $friendCode,
            !empty($userData['isPremium']) ? 1 : 0
        ]);
        $userId = $pdo->lastInsertId();
        
        // Prepare user data for storage
        $saveData = $userData['saves']['current'] ?? $userData;
        $saveData['friendCode'] = $friendCode;
        $saveData['lastSaved'] = time() * 1000;
        $saveData['_migratedFrom'] = 'firebase';
        $saveData['_migratedAt'] = date('Y-m-d H:i:s');
        
        // Insert user data
        $stmt = $pdo->prepare("
            INSERT INTO user_data (user_id, data, version) 
            VALUES (?, ?, 1)
        ");
        $stmt->execute([$userId, json_encode($saveData, JSON_UNESCAPED_UNICODE)]);
        
        $imported++;
        
    } catch (Exception $e) {
        $errors[] = [
            'username' => $username,
            'error' => $e->getMessage()
        ];
    }
}

jsonResponse([
    'success' => true,
    'imported' => $imported,
    'skipped' => $skipped,
    'errors' => $errors
]);
