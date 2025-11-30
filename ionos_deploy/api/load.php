<?php
/**
 * LexiMix Cloud Load API - IONOS Server
 * Lädt Benutzerdaten mit Versionsinfo
 * 
 * Supports both legacy (username-based) and new (session-based) authentication
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

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
    // Legacy auth: Get username from request
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $username = isset($_GET['username']) ? normalizeUsername($_GET['username']) : null;
    } else {
        $input = getJsonInput();
        $username = isset($input['username']) ? normalizeUsername($input['username']) : null;
    }
    
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
        // Legacy fallback: Load from file system
        $dataDir = __DIR__ . '/../userdata/';
        $safeUsername = preg_replace('/[^a-z0-9]/', '', $username);
        $filePath = $dataDir . $safeUsername . '.json';
        
        if (!file_exists($filePath)) {
            jsonResponse([
                'success' => true,
                'exists' => false,
                'data' => null,
                'version' => 0,
                'timestamp' => 0
            ]);
        }
        
        $content = file_get_contents($filePath);
        $userData = json_decode($content, true);
        
        if (!$userData) {
            jsonResponse(['success' => false, 'error' => 'Failed to parse data'], 500);
        }
        
        jsonResponse([
            'success' => true,
            'exists' => true,
            'data' => $userData,
            'version' => $userData['_version'] ?? 1,
            'timestamp' => $userData['lastSaved'] ?? 0,
            'source' => 'legacy_file'
        ]);
    }
}

// Load from database
$stmt = $pdo->prepare("SELECT data, version, updated_at FROM user_data WHERE user_id = ?");
$stmt->execute([$userId]);
$result = $stmt->fetch();

if (!$result) {
    jsonResponse([
        'success' => true,
        'exists' => false,
        'data' => null,
        'version' => 0,
        'timestamp' => 0
    ]);
}

$userData = json_decode($result['data'], true);

jsonResponse([
    'success' => true,
    'exists' => true,
    'data' => $userData,
    'version' => $result['version'],
    'timestamp' => $userData['lastSaved'] ?? 0,
    'source' => 'database'
]);
