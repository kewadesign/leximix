<?php
/**
 * LexiMix - Logout
 * POST /api/auth/logout.php
 * 
 * Invalidates the current session
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? null;

if (!$token) {
    jsonResponse(['success' => true, 'message' => 'Already logged out']);
}

$pdo = getDB();

// Delete session
$stmt = $pdo->prepare("DELETE FROM sessions WHERE token = ?");
$stmt->execute([$token]);

jsonResponse([
    'success' => true,
    'message' => 'Erfolgreich ausgeloggt'
]);
