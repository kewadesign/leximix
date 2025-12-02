<?php
/**
 * LexiMix API Configuration
 * IMPORTANT: Update these values with your IONOS credentials!
 */

// ============================================
// CORS SETTINGS (MUST BE FIRST!)
// ============================================
$ALLOWED_ORIGINS = [
    'https://leximix.de',
    'http://localhost:5173',
    'http://localhost:3000',
    'capacitor://localhost',
    'http://localhost'
];

// Set CORS headers IMMEDIATELY before any other code runs
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Global error handler to ensure JSON responses even on PHP errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => "Server error: $errstr"], JSON_UNESCAPED_UNICODE);
    exit;
});

set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $exception->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
});

// ============================================
// DATABASE CONFIGURATION
// ============================================
define('DB_HOST', 'db5019126627.hosting-data.io'); // IONOS MySQL host (NEW Standard DB)
define('DB_NAME', 'dbs15032117');                  // Database name
define('DB_USER', 'dbu1355789');                    // Database user
define('DB_PASS', 'LmApiDb2024Secure!');               // DB Passwort
define('DB_CHARSET', 'utf8mb4');

// ============================================
// EMAIL / SMTP CONFIGURATION (IONOS)
// ============================================
define('SMTP_HOST', 'smtp.ionos.de');
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@leximix.de');         // IONOS E-Mail
define('SMTP_PASS', 'Kewadesign1998');             // E-Mail Passwort
define('SMTP_FROM_NAME', 'LexiMix');
define('SMTP_FROM_EMAIL', 'noreply@leximix.de');

// ============================================
// SECURITY SETTINGS
// ============================================
define('MAGIC_LINK_EXPIRY', 15 * 60);              // 15 minutes in seconds
define('SESSION_EXPIRY', 30 * 24 * 60 * 60);       // 30 days in seconds
define('RATE_LIMIT_WINDOW', 60);                   // 1 minute
define('RATE_LIMIT_MAX_REQUESTS', 30);             // Max requests per window

// ============================================
// APP SETTINGS
// ============================================
define('APP_URL', 'https://leximix.de');
define('API_URL', 'https://leximix.de/api');
define('DEBUG_MODE', true);                        // Set to true for development

// ============================================
// DATABASE CONNECTION
// ============================================
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            if (DEBUG_MODE) {
                die(json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]));
            } else {
                die(json_encode(['success' => false, 'error' => 'Database connection failed']));
            }
        }
    }
    
    return $pdo;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a secure random token
 */
function generateToken(int $length = 32): string {
    return bin2hex(random_bytes($length));
}

/**
 * Generate a friend code (6 characters, uppercase alphanumeric)
 */
function generateFriendCode(): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0/O, 1/I
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

/**
 * Normalize username (lowercase, no spaces)
 */
function normalizeUsername(string $username): string {
    return strtolower(preg_replace('/\s+/', '', trim($username)));
}

/**
 * Get JSON input
 */
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return $data ?? [];
}

/**
 * Send JSON response
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Validate email format
 */
function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Get current session from header
 */
function getCurrentSession(): ?array {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? null;
    
    if (!$token) {
        return null;
    }
    
    $pdo = getDB();
    $stmt = $pdo->prepare("
        SELECT s.*, u.username, u.email, u.friend_code, u.is_premium
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    
    return $stmt->fetch() ?: null;
}

/**
 * Require authentication
 */
function requireAuth(): array {
    $session = getCurrentSession();
    
    if (!$session) {
        jsonResponse(['success' => false, 'error' => 'Nicht autorisiert'], 401);
    }
    
    return $session;
}
