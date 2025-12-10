<?php
// Simple Mail Test V2 - USING SMTP AUTH
require_once 'smtp_mailer.php';

$to = 'test@example.com';
// Allow overriding to via query param for testing if needed, though safely
if (isset($_GET['to']) && filter_var($_GET['to'], FILTER_VALIDATE_EMAIL)) {
    $to = $_GET['to'];
}

$subject = 'Test Mail form LexiMix V2 (SMTP Auth)';
$message = "This is a test email sent via authenticated SMTP (IONOS).\n\nSent at: " . date('Y-m-d H:i:s');

echo "Attempting to send email to: $to <br>";

if (sendSmtpMail($to, $subject, $message)) {
    echo "<b>SUCCESS:</b> Mail accepted for delivery via SMTP.";
} else {
    echo "<b>FAILURE:</b> Mail failed to send via SMTP. Check server logs.";
}
?>