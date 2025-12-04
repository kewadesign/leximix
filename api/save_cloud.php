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

if (!isset($data['username']) || !isset($data['saveData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing data']);
    exit();
}

$username = trim($data['username']);
$saveData = json_encode($data['saveData']);

try {
    $stmt = $pdo->prepare("UPDATE users SET save_data = ? WHERE username = ?");
    $stmt->execute([$saveData, $username]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        // Check if user exists to distinguish between "no change" and "user not found"
        $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            echo json_encode(['success' => true]); // No changes needed
        } else {
            echo json_encode(['success' => false, 'error' => 'User not found']);
        }
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Save failed: ' . $e->getMessage()]);
}
?>