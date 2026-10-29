<?php
// Ixonite form mailer for shared hosting.
// Receives the booking form and sample-report email capture from the static
// site and emails them to the team. Upload it next to index.html (it ships in
// out/ after `npm run build`). Set $TO and $FROM below before going live.

$TO   = 'contact@ixonit.com';      // where submissions go
$FROM = 'no-reply@ixonit.com';     // must be a mailbox on this hosting domain

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'POST only']);
  exit;
}

// Honeypot: bots fill the hidden "website" field.
if (!empty($_POST['website'])) {
  echo json_encode(['ok' => true]);
  exit;
}

function field($k, $max = 2000) {
  $v = isset($_POST[$k]) ? trim((string) $_POST[$k]) : '';
  $v = str_replace(["\r", "\0"], '', $v);
  return mb_substr($v, 0, $max);
}

$type  = field('type', 40) === 'sample-report' ? 'sample-report' : 'booking';
$email = field('email', 200);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'invalid email']);
  exit;
}

$lines = [
  'Type:     ' . ($type === 'booking' ? 'Scoping call request' : 'Sample report download'),
  'Email:    ' . $email,
];
if ($type === 'booking') {
  $lines[] = 'Name:     ' . field('name', 200);
  $lines[] = 'Company:  ' . field('company', 200);
  $lines[] = 'Service:  ' . field('service', 100);
  $lines[] = 'Date:     ' . field('date', 40);
  $lines[] = 'Time:     ' . field('time', 40);
  $lines[] = '';
  $lines[] = field('message', 5000);
}
$lines[] = '';
$lines[] = 'Sent ' . gmdate('Y-m-d H:i') . ' UTC from ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

$subject = $type === 'booking'
  ? 'Scoping call request from ' . $email
  : 'Sample report downloaded by ' . $email;

$headers = [
  'From: Ixonite website <' . $FROM . '>',
  'Reply-To: ' . $email,
  'Content-Type: text/plain; charset=utf-8',
];

$ok = @mail($TO, $subject, implode("\n", $lines), implode("\r\n", $headers));

// Keep a local log too, in case mail() is blocked by the host.
@file_put_contents(
  __DIR__ . '/../form-submissions.log',
  json_encode(['t' => gmdate('c'), 'type' => $type, 'email' => $email, 'mail_ok' => $ok]) . "\n",
  FILE_APPEND | LOCK_EX
);

echo json_encode(['ok' => (bool) $ok]);
