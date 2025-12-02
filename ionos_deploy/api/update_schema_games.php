<?php
/**
 * Update database schema - Add games and game_invites tables
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getDB();
    
    // Check if games table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'games'");
    if ($stmt->rowCount() == 0) {
        // Create games table
        $pdo->exec("
            CREATE TABLE games (
              id VARCHAR(36) PRIMARY KEY,
              game_type ENUM('maumau', 'chess', 'morris', 'rummy', 'checkers') NOT NULL,
              host_id INT NOT NULL,
              guest_id INT,
              state JSON NOT NULL,
              status ENUM('waiting', 'ready', 'playing', 'finished') DEFAULT 'waiting',
              winner_id INT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL,
              FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
              INDEX idx_status (status),
              INDEX idx_players (host_id, guest_id),
              INDEX idx_last_activity (last_activity)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        echo json_encode(['success' => true, 'message' => 'Created games table']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Games table already exists']);
    }
    
    // Check if game_invites table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'game_invites'");
    if ($stmt->rowCount() == 0) {
        // Create game_invites table
        $pdo->exec("
            CREATE TABLE game_invites (
              id INT AUTO_INCREMENT PRIMARY KEY,
              game_id VARCHAR(36) NOT NULL,
              from_user_id INT NOT NULL,
              to_user_id INT NOT NULL,
              status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
              INDEX idx_to_user (to_user_id, status),
              INDEX idx_game (game_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        echo json_encode(['success' => true, 'message' => 'Created game_invites table']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Game_invites table already exists']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
