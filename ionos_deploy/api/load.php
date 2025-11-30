<?php
/**
 * LexiMix Cloud Load API - IONOS Server
 * Lädt Benutzerdaten mit Versionsinfo
 */

// CORS Headers für alle Origins (Development + Production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Preflight Request handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// GET oder POST erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Konfiguration
$dataDir = __DIR__ . '/../userdata/';

// Username aus Query-Parameter oder POST-Body
$username = null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $username = isset($_GET['username']) ? $_GET['username'] : null;
} else {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $username = isset($data['username']) ? $data['username'] : null;
}

// Normalisieren
$username = $username ? strtolower(trim(preg_replace('/\s+/', '', $username))) : null;

if (!$username || strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid username']);
    exit();
}

// Sichere Dateiname
$safeUsername = preg_replace('/[^a-z0-9]/', '', $username);
$filePath = $dataDir . $safeUsername . '.json';

// Prüfen ob Datei existiert
if (!file_exists($filePath)) {
    // Kein Fehler - einfach keine Daten
    echo json_encode([
        'success' => true,
        'exists' => false,
        'data' => null,
        'version' => 0,
        'timestamp' => 0
    ]);
    exit();
}

// Daten laden
$content = file_get_contents($filePath);
$userData = json_decode($content, true);

if (!$userData) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to parse data']);
    exit();
}

// Version und Timestamp extrahieren
$version = isset($userData['_version']) ? intval($userData['_version']) : 1;
$timestamp = isset($userData['lastSaved']) ? intval($userData['lastSaved']) : 0;

// Metadaten entfernen für saubere Antwort (optional behalten)
// unset($userData['_version']);
// unset($userData['_savedAt']);
// unset($userData['_savedFrom']);

echo json_encode([
    'success' => true,
    'exists' => true,
    'data' => $userData,
    'version' => $version,
    'timestamp' => $timestamp
]);
