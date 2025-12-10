<?php
// Migration script to add email verification fields
require 'db_connect.php';

try {
    // Check if verification_token column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'verification_token'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN verification_token VARCHAR(64) DEFAULT NULL");
        echo "Added verification_token column.\n";
    } else {
        echo "verification_token column already exists.\n";
    }

    // Check if email_verified column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'email_verified'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0");
        echo "Added email_verified column.\n";
    } else {
        echo "email_verified column already exists.\n";
    }

    echo "Migration successful!\n";

    // Set existing users as verified (backwards compatibility)
    $pdo->exec("UPDATE users SET email_verified = 1 WHERE verification_token IS NULL");
    echo "Set existing users as verified.\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>