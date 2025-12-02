<?php
/**
 * Update database schema - Add matchmaking_queue table
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getDB();
    
    // Check if matchmaking_queue table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'matchmaking_queue'");
    if ($stmt->rowCount() == 0) {
        // Create matchmaking_queue table
        $pdo->exec("
            CREATE TABLE matchmaking_queue (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              game_type ENUM('maumau', 'chess', 'morris', 'rummy', 'checkers') NOT NULL,
              language VARCHAR(10) DEFAULT 'DE',
              mmr INT DEFAULT 1000,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              INDEX idx_game_type (game_type, created_at),
              INDEX idx_user (user_id),
              UNIQUE KEY unique_user_game (user_id, game_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        echo json_encode(['success' => true, 'message' => 'Created matchmaking_queue table']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Matchmaking_queue table already exists']);
    }
    
    // Check if matches table exists (for match signals)
    $stmt = $pdo->query("SHOW TABLES LIKE 'matches'");
    if ($stmt->rowCount() == 0) {
        // Create matches table
        $pdo->exec("
            CREATE TABLE matches (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              game_id VARCHAR(36) NOT NULL,
              opponent_id INT NOT NULL,
              opponent_username VARCHAR(50) NOT NULL,
              game_type ENUM('maumau', 'chess', 'morris', 'rummy', 'checkers') NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE CASCADE,
              INDEX idx_user (user_id),
              INDEX idx_game (game_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        echo json_encode(['success' => true, 'message' => 'Created matches table']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Matches table already exists']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
