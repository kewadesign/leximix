<?php
/**
 * LexiMix - List Games
 * GET /api/games/list.php
 * 
 * Get list of active games for the current user
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$userId = $session['user_id'];

$pdo = getDB();

try {
    // Get all games where user is host or guest
    $stmt = $pdo->prepare("
        SELECT g.*,
               h.username as host_username,
               guest.username as guest_username
        FROM games g
        LEFT JOIN users h ON g.host_id = h.id
        LEFT JOIN users guest ON g.guest_id = guest.id
        WHERE (g.host_id = ? OR g.guest_id = ?)
        AND g.status != 'finished'
        ORDER BY g.last_activity DESC
        LIMIT 50
    ");
    $stmt->execute([$userId, $userId]);
    $games = $stmt->fetchAll();
    
    $result = [];
    foreach ($games as $game) {
        $result[] = [
            'id' => $game['id'],
            'gameType' => $game['game_type'],
            'status' => $game['status'],
            'hostId' => $game['host_id'],
            'hostUsername' => $game['host_username'],
            'guestId' => $game['guest_id'],
            'guestUsername' => $game['guest_username'],
            'createdAt' => $game['created_at'],
            'lastActivity' => $game['last_activity']
        ];
    }
    
    jsonResponse([
        'success' => true,
        'games' => $result
    ]);
    
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
    jsonResponse(['success' => false, 'error' => 'Failed to list games'], 500);
}
