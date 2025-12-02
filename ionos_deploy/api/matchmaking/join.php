<?php
/**
 * LexiMix - Join Matchmaking Queue
 * POST /api/matchmaking/join.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$input = getJsonInput();
$gameType = $input['gameType'] ?? '';
$language = $input['language'] ?? 'DE';
$mmr = $input['mmr'] ?? 1000;

$allowedTypes = ['maumau', 'chess', 'morris', 'rummy', 'checkers'];
if (!in_array($gameType, $allowedTypes)) {
    jsonResponse(['success' => false, 'error' => 'Invalid game type'], 400);
}

$pdo = getDB();

try {
    // Remove existing entry if any (replace)
    $stmt = $pdo->prepare("DELETE FROM matchmaking_queue WHERE user_id = ? AND game_type = ?");
    $stmt->execute([$userId, $gameType]);
    
    // Add to queue
    $stmt = $pdo->prepare("
        INSERT INTO matchmaking_queue (user_id, game_type, language, mmr)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE language = ?, mmr = ?, created_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([$userId, $gameType, $language, $mmr, $language, $mmr]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Joined matchmaking queue'
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to join queue'], 500);
}
