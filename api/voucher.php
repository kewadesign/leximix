<?php
require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['voucherCode'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing data']);
    exit();
}

$username = trim($data['username']);
$voucherCode = strtoupper(trim($data['voucherCode']));

try {
    $pdo->beginTransaction();

    // 1. Get User ID
    $stmt = $pdo->prepare("SELECT id, save_data FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        throw new Exception("User not found");
    }

    $userId = $user['id'];

    // 2. Get Voucher
    $stmt = $pdo->prepare("SELECT * FROM vouchers WHERE code = ?");
    $stmt->execute([$voucherCode]);
    $voucher = $stmt->fetch();

    if (!$voucher) {
        // Try stripped code
        $strippedCode = str_replace('-', '', $voucherCode);
        $stmt->execute([$strippedCode]);
        $voucher = $stmt->fetch();

        if (!$voucher) {
            throw new Exception("Ungültiger Gutscheincode");
        }
    }

    // 3. Check if already redeemed
    $stmt = $pdo->prepare("SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_code = ?");
    $stmt->execute([$userId, $voucher['code']]);
    if ($stmt->fetch()) {
        throw new Exception("Du hast diesen Gutschein bereits eingelöst");
    }

    // 4. Record Redemption
    $stmt = $pdo->prepare("INSERT INTO user_vouchers (user_id, voucher_code) VALUES (?, ?)");
    $stmt->execute([$userId, $voucher['code']]);

    // 5. Update User Save Data (Coins/Premium)
    $saveData = json_decode($user['save_data'], true);

    // Add coins
    $coinsToAdd = intval($voucher['coins']);
    $saveData['coins'] = ($saveData['coins'] ?? 0) + $coinsToAdd;

    // Add Premium
    $isPremium = false;
    if ($voucher['is_premium']) {
        $saveData['isPremium'] = true;
        $saveData['premiumActivatedAt'] = time() * 1000; // JS timestamp
        $isPremium = true;
    }

    // Save updated data
    $newSaveData = json_encode($saveData);
    $stmt = $pdo->prepare("UPDATE users SET save_data = ? WHERE id = ?");
    $stmt->execute([$newSaveData, $userId]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'coinsAwarded' => $coinsToAdd,
        'isPremium' => $isPremium
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>