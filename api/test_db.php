<?php
require_once 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT 1");
    if ($stmt) {
        echo "Database connection successful!";
    } else {
        echo "Database connection failed (query returned false).";
    }
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage();
}
?>