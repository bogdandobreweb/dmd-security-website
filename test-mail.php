<?php
header('Content-Type: text/html; charset=UTF-8');

echo "<h2>Mail Test</h2>";

// Test 1: Can PHP send mail?
$to = 'office@dmdsecurity.ro';
$subject = '=?UTF-8?B?' . base64_encode('Test email din site DMD Security') . '?=';
$body = "Acesta este un email de test trimis din site-ul DMD Security.\n\nData: " . date('Y-m-d H:i:s');
$headers = "From: DMD Security <office@dmdsecurity.ro>\r\n";
$headers .= "Reply-To: office@dmdsecurity.ro\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$result = mail($to, $subject, $body, $headers);

echo "<p><strong>mail() result:</strong> " . ($result ? 'TRUE (sent)' : 'FALSE (failed)') . "</p>";

// Check for errors
$error = error_get_last();
if ($error) {
    echo "<p><strong>Last error:</strong> " . htmlspecialchars($error['message']) . "</p>";
}

// Check mail config
echo "<h3>PHP Mail Config:</h3>";
echo "<p>sendmail_path: " . ini_get('sendmail_path') . "</p>";
echo "<p>SMTP: " . ini_get('SMTP') . "</p>";
echo "<p>smtp_port: " . ini_get('smtp_port') . "</p>";

// Check if contact_errors.log exists
$logFile = __DIR__ . '/contact_errors.log';
if (file_exists($logFile)) {
    echo "<h3>Error Log:</h3>";
    echo "<pre>" . htmlspecialchars(file_get_contents($logFile)) . "</pre>";
} else {
    echo "<p>No error log file found.</p>";
}
