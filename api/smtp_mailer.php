<?php

function sendSmtpMail($to, $subject, $body, $debug = false)
{
    $host = 'ssl://smtp.ionos.de';
    $port = 465;
    $username = 'noreply@leximix.de';
    $password = 'TK##2024';
    $fromEmail = 'noreply@leximix.de';
    $fromName = 'LexiMix';

    $eol = "\r\n";

    if ($debug)
        echo "<pre>Debug Mode Enabled\n";

    // Helper to read response (Multiline capable)
    if (!function_exists('get_smtp_response')) {
        function get_smtp_response($socket, $debug = false)
        {
            $response = '';
            while (true) {
                $line = fgets($socket, 515);
                if ($line === false)
                    break;
                $response .= $line;
                if ($debug)
                    echo "S: " . htmlspecialchars($line);
                // Check if this is the last line (3 digits followed by space)
                if (preg_match('/^\d{3} /', $line)) {
                    break;
                }
            }
            return $response;
        }
    }

    // Helper to send command
    if (!function_exists('send_smtp_command')) {
        function send_smtp_command($socket, $cmd, $debug = false)
        {
            if ($debug)
                echo "C: " . htmlspecialchars($cmd);
            fputs($socket, $cmd);
        }
    }

    // Connect
    if ($debug)
        echo "Connecting to $host:$port...\n";
    $socket = fsockopen($host, $port, $errno, $errstr, 15);
    if (!$socket) {
        if ($debug)
            echo "Error: $errno $errstr\n";
        error_log("SMTP Connect failed: $errno $errstr");
        return false;
    }

    // Read initial greeting
    get_smtp_response($socket, $debug);

    // EHLO
    send_smtp_command($socket, "EHLO " . $_SERVER['SERVER_NAME'] . $eol, $debug);
    get_smtp_response($socket, $debug);

    // AUTH LOGIN
    send_smtp_command($socket, "AUTH LOGIN" . $eol, $debug);
    get_smtp_response($socket, $debug);

    // Send Username
    send_smtp_command($socket, base64_encode($username) . $eol, $debug);
    get_smtp_response($socket, $debug);

    // Send Password
    send_smtp_command($socket, base64_encode($password) . $eol, $debug);
    $authResult = get_smtp_response($socket, $debug);

    if (strpos($authResult, '235') === false) {
        if ($debug)
            echo "Authentication Failed!\n";
        fclose($socket);
        return false;
    }

    // MAIL FROM
    send_smtp_command($socket, "MAIL FROM: <$fromEmail>" . $eol, $debug);
    get_smtp_response($socket, $debug);

    // RCPT TO
    send_smtp_command($socket, "RCPT TO: <$to>" . $eol, $debug);
    get_smtp_response($socket, $debug);

    // DATA
    send_smtp_command($socket, "DATA" . $eol, $debug);
    get_smtp_response($socket, $debug);

    // Headers
    $headers = "MIME-Version: 1.0" . $eol;
    $headers .= "Content-type: text/plain; charset=utf-8" . $eol;
    $headers .= "From: $fromName <$fromEmail>" . $eol;
    $headers .= "Reply-To: $fromName <$fromEmail>" . $eol;
    $headers .= "To: $to" . $eol;
    $headers .= "Subject: $subject" . $eol;

    // Body
    send_smtp_command($socket, $headers . $eol . $body . $eol . "." . $eol, $debug);
    $result = get_smtp_response($socket, $debug);

    // QUIT
    send_smtp_command($socket, "QUIT" . $eol, $debug);
    fclose($socket);

    if ($debug)
        echo "</pre>";

    if (strpos($result, '250') !== false) {
        return true;
    } else {
        error_log("SMTP Send Failed: $result");
        return false;
    }
}
?>