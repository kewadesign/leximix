<?php
// Test script to verify PHP is working and check CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'PHP is working correctly!',
    'server_time' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'https' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'yes' : 'no'
]);
?>