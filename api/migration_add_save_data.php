<?php
// Fix Registration SQL Error - Migration Script
// Usage: php api/migration_add_save_data.php

require 'db_connect.php';

echo "Starting migration...\n";

try {
    // 1. Check if 'save_data' column exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM users LIKE 'save_data'");
    $stmt->execute();
    if ($stmt->fetch()) {
        echo "Column 'save_data' already exists.\n";
    } else {
        echo "Adding 'save_data' column...\n";
        $sql = "ALTER TABLE users ADD COLUMN save_data JSON AFTER created_at";
        $pdo->exec($sql);
        echo "Success: 'save_data' column added.\n";
    }

    // 2. Check if 'last_saved' column exists (it was also in the schema but might be missing)
    $stmt = $pdo->prepare("SHOW COLUMNS FROM users LIKE 'last_saved'");
    $stmt->execute();
    if ($stmt->fetch()) {
        echo "Column 'last_saved' already exists.\n";
    } else {
        echo "Adding 'last_saved' column...\n";
        $sql = "ALTER TABLE users ADD COLUMN last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER save_data";
        $pdo->exec($sql);
        echo "Success: 'last_saved' column added.\n";
    }

    echo "Migration completed successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
