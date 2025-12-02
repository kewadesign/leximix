<?php
/**
 * LexiMix - Import Firebase Users
 * POST /api/admin/import-firebase-users.php
 * 
 * Import users from Firebase Realtime Database JSON export
 * 
 * Expected JSON format:
 * {
 *   "username1": {
 *     "saves": {
 *       "current": {
 *         "name": "...",
 *         "level": 1,
 *         "coins": 0,
 *         "xp": 0,
 *         "friendCode": "ABC123",
 *         ...
 *       }
 *     },
 *     "friendCode": "ABC123"
 *   },
 *   "username2": { ... }
 * }
 */

require_once __DIR__ . '/../config.php';

// Simple admin check - in production use proper authentication
$adminKey = $_GET['key'] ?? '';
if ($adminKey !== 'LexiMixAdmin2024!') {
    jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();

if (empty($input) || !is_array($input)) {
    jsonResponse(['success' => false, 'error' => 'Invalid JSON data'], 400);
}

$pdo = getDB();

$imported = 0;
$skipped = 0;
$errors = [];

foreach ($input as $username => $userData) {
    // Skip system keys
    if (in_array($username, ['vouchers', 'friendCodes', 'system', 'games', 'gameInvites'])) {
        continue;
    }
    
    try {
        // Check if user already exists
        $normalizedUsername = strtolower(preg_replace('/\s+/', '', $username));
        $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(REPLACE(username, ' ', '')) = ?");
        $stmt->execute([$normalizedUsername]);
        
        if ($stmt->fetch()) {
            $skipped++;
            continue;
        }
        
        // Extract user data
        $saveData = $userData['saves']['current'] ?? [];
        $friendCode = $userData['friendCode'] ?? $saveData['friendCode'] ?? generateFriendCode();
        
        // Generate a random temporary password (users will need to reset)
        $tempPassword = bin2hex(random_bytes(8));
        $passwordHash = password_hash($tempPassword, PASSWORD_BCRYPT);
        
        // Create placeholder email (users will need to update)
        $email = strtolower($username) . '@imported.leximix.de';
        
        $pdo->beginTransaction();
        
        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, password_hash, friend_code, is_premium, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $username,
            $email,
            $passwordHash,
            $friendCode,
            (bool)($saveData['isPremium'] ?? false)
        ]);
        $userId = $pdo->lastInsertId();
        
        // Insert user data
        $stmt = $pdo->prepare("
            INSERT INTO user_data (user_id, data_key, data_value)
            VALUES (?, 'current', ?)
        ");
        $stmt->execute([$userId, json_encode($saveData)]);
        
        $pdo->commit();
        $imported++;
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $errors[] = "User '$username': " . $e->getMessage();
    }
}

jsonResponse([
    'success' => true,
    'imported' => $imported,
    'skipped' => $skipped,
    'errors' => $errors,
    'message' => "Imported $imported users, skipped $skipped existing users"
]);
