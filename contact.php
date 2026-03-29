<?php
header('Content-Type: application/json');

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
$subject = "Solicitare oferta - $name" . ($company ? " ($company)" : '');

$body = "Ați primit o nouă solicitare de ofertă de pe site-ul DMD Security.\n\n";
$body .= "Nume: $name\n";
$body .= "Email: $email\n";
$body .= "Telefon: $phone\n";
$body .= "Companie: " . ($company ?: '-') . "\n\n";
$body .= "Mesaj:\n$message\n";

$headers = "From: noreply@dmdsecurity.ro\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: DMDSecurity-Website\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

// Also send to secondary email
if ($sent) {
    mail('dmdsecuritate@gmail.com', $subject, $body, $headers);
}

echo json_encode(['success' => $sent]);
