<?php
/**
 * LexiMix - System Configuration
 * GET /api/config/system.php
 * 
 * Returns public system configuration (no auth required)
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$pdo = getDB();

// Get all public config
$stmt = $pdo->query("SELECT config_key, config_value FROM system_config");
$rows = $stmt->fetchAll();

$config = [];
foreach ($rows as $row) {
    $config[$row['config_key']] = $row['config_value'];
}

// Parse boolean values
if (isset($config['maintenance_mode'])) {
    $config['maintenance_mode'] = $config['maintenance_mode'] === 'true';
}

jsonResponse([
    'success' => true,
    'config' => $config
]);
