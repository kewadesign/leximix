<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (!isset($_GET['username'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing username']);
    exit();
}

$username = trim($_GET['username']);

$stmt = $pdo->prepare("SELECT save_data FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user) {
    echo json_encode(['success' => true, 'data' => json_decode($user['save_data'])]);
} else {
    echo json_encode(['success' => false, 'error' => 'User not found']);
}
?>