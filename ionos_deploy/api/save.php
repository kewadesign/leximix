<?php
/**
 * LexiMix Cloud Save API - IONOS Server
 * Speichert Benutzerdaten mit Versionierung und Konflikt-Handling
 */

// CORS Headers für alle Origins (Development + Production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Preflight Request handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Nur POST erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Konfiguration
$dataDir = __DIR__ . '/../userdata/';

// Sicherstellen dass das Verzeichnis existiert
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// JSON-Body lesen
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit();
}

// Validierung
$username = isset($data['username']) ? strtolower(trim(preg_replace('/\s+/', '', $data['username']))) : null;
$userData = isset($data['data']) ? $data['data'] : null;
$clientVersion = isset($data['version']) ? intval($data['version']) : 0;
$clientTimestamp = isset($data['timestamp']) ? intval($data['timestamp']) : time() * 1000;

if (!$username || strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid username']);
    exit();
}

if (!$userData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No data provided']);
    exit();
}

// Sichere Dateiname (nur alphanumerische Zeichen)
$safeUsername = preg_replace('/[^a-z0-9]/', '', $username);
$filePath = $dataDir . $safeUsername . '.json';

// Bestehende Daten laden für Konfliktprüfung
$existingData = null;
$serverVersion = 0;
$serverTimestamp = 0;

if (file_exists($filePath)) {
    $existingContent = file_get_contents($filePath);
    $existingData = json_decode($existingContent, true);
    if ($existingData) {
        $serverVersion = isset($existingData['_version']) ? intval($existingData['_version']) : 0;
        $serverTimestamp = isset($existingData['lastSaved']) ? intval($existingData['lastSaved']) : 0;
    }
}

// Konflikt-Erkennung: Wenn Server-Version neuer ist
if ($serverVersion > 0 && $clientVersion > 0 && $serverVersion > $clientVersion) {
    // Client hat ältere Daten - Konflikt!
    // Strategie: Timestamp gewinnt (neuere Änderungen haben Priorität)
    if ($serverTimestamp > $clientTimestamp) {
        // Server-Daten sind neuer - Client muss neu laden
        http_response_code(409); // Conflict
        echo json_encode([
            'success' => false,
            'error' => 'conflict',
            'serverVersion' => $serverVersion,
            'serverTimestamp' => $serverTimestamp,
            'message' => 'Server has newer data. Please reload.'
        ]);
        exit();
    }
    // Sonst: Client-Timestamp ist neuer, also überschreiben erlaubt
}

// Version erhöhen
$newVersion = max($serverVersion, $clientVersion) + 1;

// Daten mit Metadaten anreichern
$userData['_version'] = $newVersion;
$userData['lastSaved'] = $clientTimestamp ?: (time() * 1000);
$userData['_savedAt'] = date('Y-m-d H:i:s');
$userData['_savedFrom'] = 'ionos';

// Backup der alten Daten erstellen (nur wenn vorhanden)
if ($existingData) {
    $backupDir = $dataDir . 'backups/';
    if (!file_exists($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    $backupPath = $backupDir . $safeUsername . '_' . date('Ymd_His') . '.json';
    
    // Nur letzte 10 Backups behalten
    $backups = glob($backupDir . $safeUsername . '_*.json');
    if (count($backups) >= 10) {
        sort($backups);
        unlink($backups[0]); // Ältestes löschen
    }
    
    file_put_contents($backupPath, json_encode($existingData, JSON_PRETTY_PRINT));
}

// Neue Daten speichern
$result = file_put_contents($filePath, json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save data']);
    exit();
}

// Erfolg
echo json_encode([
    'success' => true,
    'version' => $newVersion,
    'timestamp' => $userData['lastSaved'],
    'message' => 'Data saved successfully'
]);
