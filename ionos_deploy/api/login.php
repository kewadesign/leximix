<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing credentials']);
    exit();
}

$email = trim($data['email']);
$password = $data['password'];

$stmt = $pdo->prepare("SELECT id, username, password_hash, save_data, friend_code FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    echo json_encode([
        'success' => true,
        'username' => $user['username'],
        'friendCode' => $user['friend_code'],
        'saveData' => json_decode($user['save_data'])
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
}
?>