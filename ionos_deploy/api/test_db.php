<?php
// Direct database connection test
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$host = 'db5019126627.hosting-data.io';
$database = 'dbs15032117';
$username = 'dbu1355789';
$password = 'LmApiDb2024Secure!';

echo json_encode([
    'host' => $host,
    'database' => $database,
    'username' => $username,
    'password_length' => strlen($password),
    'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
    'remote_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
]);

echo "\n\nAttempting connection...\n";

try {
    $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "SUCCESS: Connected to database!\n";
    
    // Test query
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    echo "Test query result: " . json_encode($result) . "\n";
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
}
?>
