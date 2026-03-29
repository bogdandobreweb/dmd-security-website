<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Log errors for debugging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/contact_errors.log');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$name = strip_tags(trim($_POST['name'] ?? ''));
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone = strip_tags(trim($_POST['phone'] ?? ''));
$company = strip_tags(trim($_POST['company'] ?? ''));
$message = strip_tags(trim($_POST['message'] ?? ''));

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'error' => 'Required fields missing']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email']);
    exit;
}

$to = 'office@dmdsecurity.ro';
$subject = "=?UTF-8?B?" . base64_encode("Solicitare oferta - $name" . ($company ? " ($company)" : '')) . "?=";

$body = "Ați primit o nouă solicitare de ofertă de pe site-ul DMD Security.\n\n";
$body .= "Nume: $name\n";
$body .= "Email: $email\n";
$body .= "Telefon: $phone\n";
$body .= "Companie: " . ($company ?: '-') . "\n\n";
$body .= "Mesaj:\n$message\n";

$headers = "From: DMD Security <office@dmdsecurity.ro>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    // Also send to secondary email
    mail('dmdsecuritate@gmail.com', $subject, $body, $headers);
    error_log("Email sent successfully to $to from $email");
} else {
    $lastError = error_get_last();
    error_log("Email FAILED to $to from $email. Error: " . ($lastError ? $lastError['message'] : 'unknown'));
}

echo json_encode(['success' => $sent, 'debug' => !$sent ? 'mail() returned false - check server mail config' : null]);
