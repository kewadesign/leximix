<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

// Helper to get user ID
function getUserId($pdo, $username)
{
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $res = $stmt->fetch();
    return $res ? $res['id'] : null;
}

if ($method === 'POST') {
    $action = $data['action'] ?? '';

    if ($action === 'add_friend') {
        $myUsername = $data['username'];
        $friendCode = strtoupper(trim($data['friendCode']));

        try {
            $myId = getUserId($pdo, $myUsername);
            if (!$myId)
                throw new Exception("User not found");

            $stmt = $pdo->prepare("SELECT id, username FROM users WHERE friend_code = ?");
            $stmt->execute([$friendCode]);
            $friend = $stmt->fetch();

            if (!$friend)
                throw new Exception("Ungültiger Freundescode");
            if ($friend['id'] == $myId)
                throw new Exception("Du kannst dich nicht selbst hinzufügen");

            // Check existing friendship
            $stmt = $pdo->prepare("SELECT id FROM friendships WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)");
            $stmt->execute([$myId, $friend['id'], $friend['id'], $myId]);
            if ($stmt->fetch())
                throw new Exception("Bereits befreundet");

            // Check existing request
            $stmt = $pdo->prepare("SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ?");
            $stmt->execute([$myId, $friend['id']]);
            if ($stmt->fetch())
                throw new Exception("Anfrage bereits gesendet");

            // Create Request
            $stmt = $pdo->prepare("INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)");
            $stmt->execute([$myId, $friend['id']]);

            echo json_encode(['success' => true]);

        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    } elseif ($action === 'accept_request') {
        // ... Implementation for accept
        // For brevity in this turn, assuming basic add friend flow is priority.
        // Full implementation would go here.
        echo json_encode(['success' => false, 'error' => 'Not implemented yet']);
    }
}
?>