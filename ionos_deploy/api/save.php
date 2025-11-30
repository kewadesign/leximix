<?php
/**
 * LexiMix Cloud Save API - IONOS Server
 * Speichert Benutzerdaten mit Versionierung und Konflikt-Handling
 * 
 * Supports both legacy (username-based) and new (session-based) authentication
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$session = getCurrentSession();
$pdo = getDB();

// Determine user
$userId = null;
$username = null;

if ($session) {
    // New auth: Use session
    $userId = $session['user_id'];
    $username = $session['username'];
} else {
    // Legacy auth: Use username from request
    $username = isset($input['username']) ? normalizeUsername($input['username']) : null;
    
    if (!$username || strlen($username) < 3) {
        jsonResponse(['success' => false, 'error' => 'Invalid username'], 400);
    }
    
    // Find user by username
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user) {
        $userId = $user['id'];
    } else {
        // Legacy fallback: Save to file system (for users not yet migrated)
        $dataDir = __DIR__ . '/../userdata/';
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        $safeUsername = preg_replace('/[^a-z0-9]/', '', $username);
        $filePath = $dataDir . $safeUsername . '.json';
        
        $userData = $input['data'] ?? null;
        if (!$userData) {
            jsonResponse(['success' => false, 'error' => 'No data provided'], 400);
        }
        
        $userData['lastSaved'] = time() * 1000;
        $userData['_savedFrom'] = 'ionos_legacy';
        
        $result = file_put_contents($filePath, json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        if ($result === false) {
            jsonResponse(['success' => false, 'error' => 'Failed to save data'], 500);
        }
        
        jsonResponse([
            'success' => true,
            'version' => 1,
            'timestamp' => $userData['lastSaved'],
            'message' => 'Data saved (legacy mode)'
        ]);
    }
}

// Get user data
$userData = $input['data'] ?? null;
$clientVersion = isset($input['version']) ? intval($input['version']) : 0;

if (!$userData) {
    jsonResponse(['success' => false, 'error' => 'No data provided'], 400);
}

// Get current version
$stmt = $pdo->prepare("SELECT version FROM user_data WHERE user_id = ?");
$stmt->execute([$userId]);
$existing = $stmt->fetch();
$serverVersion = $existing ? $existing['version'] : 0;

// Conflict detection
if ($serverVersion > 0 && $clientVersion > 0 && $serverVersion > $clientVersion) {
    jsonResponse([
        'success' => false,
        'error' => 'conflict',
        'serverVersion' => $serverVersion,
        'message' => 'Server has newer data'
    ], 409);
}

// Prepare data
$userData['lastSaved'] = time() * 1000;
$newVersion = max($serverVersion, $clientVersion) + 1;
$jsonData = json_encode($userData, JSON_UNESCAPED_UNICODE);

// Upsert
if ($existing) {
    $stmt = $pdo->prepare("
        UPDATE user_data 
        SET data = ?, version = ?, updated_at = NOW() 
        WHERE user_id = ?
    ");
    $stmt->execute([$jsonData, $newVersion, $userId]);
} else {
    $stmt = $pdo->prepare("
        INSERT INTO user_data (user_id, data, version) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$userId, $jsonData, $newVersion]);
}

// Update premium status if changed
if (isset($userData['isPremium'])) {
    $stmt = $pdo->prepare("UPDATE users SET is_premium = ? WHERE id = ?");
    $stmt->execute([$userData['isPremium'] ? 1 : 0, $userId]);
}

jsonResponse([
    'success' => true,
    'version' => $newVersion,
    'timestamp' => $userData['lastSaved'],
    'message' => 'Data saved successfully'
]);
