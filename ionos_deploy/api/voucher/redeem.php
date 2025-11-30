<?php
/**
 * LexiMix - Redeem Voucher
 * POST /api/voucher/redeem.php
 */

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$session = requireAuth();
$input = getJsonInput();
$code = strtoupper(trim($input['code'] ?? ''));

if (!$code) {
    jsonResponse(['success' => false, 'error' => 'Kein Code angegeben'], 400);
}

$pdo = getDB();

// Try different code formats
$codes = [$code, str_replace('-', '', $code)];

$voucher = null;
foreach ($codes as $tryCode) {
    $stmt = $pdo->prepare("SELECT * FROM vouchers WHERE code = ?");
    $stmt->execute([$tryCode]);
    $voucher = $stmt->fetch();
    if ($voucher) {
        $code = $tryCode;
        break;
    }
}

if (!$voucher) {
    jsonResponse(['success' => false, 'error' => 'Ungültiger Gutscheincode'], 404);
}

// Check if already redeemed
$stmt = $pdo->prepare("SELECT 1 FROM voucher_redemptions WHERE voucher_code = ? AND user_id = ?");
$stmt->execute([$code, $session['user_id']]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'error' => 'Du hast diesen Gutschein bereits eingelöst'], 400);
}

// Redeem voucher
$pdo->beginTransaction();

try {
    // Record redemption
    $stmt = $pdo->prepare("INSERT INTO voucher_redemptions (voucher_code, user_id) VALUES (?, ?)");
    $stmt->execute([$code, $session['user_id']]);
    
    // Update user data - add coins
    $stmt = $pdo->prepare("SELECT data FROM user_data WHERE user_id = ?");
    $stmt->execute([$session['user_id']]);
    $result = $stmt->fetch();
    
    if ($result) {
        $userData = json_decode($result['data'], true);
        $userData['coins'] = ($userData['coins'] ?? 0) + $voucher['coins'];
        
        // Handle premium
        if ($voucher['is_premium']) {
            $userData['isPremium'] = true;
            $userData['premiumActivatedAt'] = time() * 1000;
            
            // Also update users table
            $stmt = $pdo->prepare("UPDATE users SET is_premium = TRUE, premium_activated_at = NOW() WHERE id = ?");
            $stmt->execute([$session['user_id']]);
        }
        
        $userData['lastSaved'] = time() * 1000;
        
        $stmt = $pdo->prepare("UPDATE user_data SET data = ?, version = version + 1 WHERE user_id = ?");
        $stmt->execute([json_encode($userData, JSON_UNESCAPED_UNICODE), $session['user_id']]);
    }
    
    $pdo->commit();
    
    jsonResponse([
        'success' => true,
        'message' => 'Gutschein erfolgreich eingelöst!',
        'coinsAwarded' => $voucher['coins'],
        'isPremium' => (bool)$voucher['is_premium'],
        'newCoins' => $userData['coins'] ?? $voucher['coins']
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(['success' => false, 'error' => 'Fehler beim Einlösen'], 500);
}
