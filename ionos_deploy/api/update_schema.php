<?php
/**
 * Update database schema - Add password_hash column
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getDB();
    
    // Check if password_hash column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'password_hash'");
    if ($stmt->rowCount() == 0) {
        // Add password_hash column
        $pdo->exec("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER email");
        echo json_encode(['success' => true, 'message' => 'Added password_hash column']);
    } else {
        echo json_encode(['success' => true, 'message' => 'password_hash column already exists']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
