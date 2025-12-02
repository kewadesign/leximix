<?php
/**
 * Setup database schema
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = getDB();
    
    // Create tables
    $schema = "
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      friend_code VARCHAR(10) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL,
      is_premium BOOLEAN DEFAULT FALSE,
      premium_activated_at TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- User data table (stores JSON game state)
    CREATE TABLE IF NOT EXISTS user_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      data_key VARCHAR(100) NOT NULL,
      data_value LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_key (user_id, data_key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Magic links for passwordless auth
    CREATE TABLE IF NOT EXISTS magic_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      INDEX idx_token (token),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      session_token VARCHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_session_token (session_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Friends
    CREATE TABLE IF NOT EXISTS friends (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      friend_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_friendship (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Friend requests
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      from_user_id INT NOT NULL,
      to_user_id INT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_request (from_user_id, to_user_id),
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Vouchers
    CREATE TABLE IF NOT EXISTS vouchers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      type ENUM('coins', 'premium', 'xp', 'item') NOT NULL,
      value INT NOT NULL,
      max_uses INT DEFAULT 1,
      current_uses INT DEFAULT 0,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Voucher redemptions
    CREATE TABLE IF NOT EXISTS voucher_redemptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voucher_id INT NOT NULL,
      user_id INT NOT NULL,
      redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_redemption (voucher_id, user_id),
      FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- System config
    CREATE TABLE IF NOT EXISTS system_config (
      config_key VARCHAR(100) PRIMARY KEY,
      config_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Games table
    CREATE TABLE IF NOT EXISTS games (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Game invites
    CREATE TABLE IF NOT EXISTS game_invites (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    // Execute each statement separately
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    // Insert default system config
    $pdo->exec("INSERT IGNORE INTO system_config (config_key, config_value) VALUES 
        ('maintenance_mode', 'false'),
        ('min_app_version', '1.0.0'),
        ('announcement', ''),
        ('season_end_date', ''),
        ('featured_mode', '')
    ");
    
    echo json_encode([
        'success' => true,
        'message' => 'Database schema created successfully!'
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
