<?php
/**
 * Contact form handler for Hostinger (PHP 8.x).
 *
 * Sends the enquiry by email. Configure TO/FROM below; FROM must be a mailbox
 * on this domain or mail() is likely to be rejected/spam-filtered. For better
 * deliverability swap mail() for SMTP (Google Workspace / Hostinger SMTP) or a
 * transactional API (Postmark, Resend). See TODO.md.
 *
 * Returns JSON for fetch() callers and redirects for plain HTML form posts.
 */

declare(strict_types=1);

const TO_ADDRESS   = 'hello@mickeymullin.com';
const FROM_ADDRESS = 'website@mickeymullin.com';
const RATE_DIR     = __DIR__ . '/../private/contact-rate'; // outside public_html if possible
const RATE_WINDOW  = 600; // seconds
const RATE_MAX     = 5;   // submissions per IP per window

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, string $error = '', int $code = 200): never
{
    global $wantsJson;
    http_response_code($code);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    } else {
        header('Location: /' . ($ok ? '?sent=1#contact' : '?sent=0#contact'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'method', 405);
}

// Honeypot: bots fill every field. Pretend success so they move on.
if (trim((string)($_POST['company_url'] ?? '')) !== '') {
    respond(true);
}

$clean = static fn(string $k, int $max): string =>
    mb_substr(trim(str_replace(["\r", "\0"], '', (string)($_POST[$k] ?? ''))), 0, $max);

$name    = $clean('name', 120);
$email   = $clean('email', 200);
$phone   = $clean('phone', 40);
$town    = $clean('town', 80);
$message = $clean('message', 5000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'invalid', 422);
}

// Simple per-IP rate limit (file based, no DB needed).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (@is_dir(RATE_DIR) || @mkdir(RATE_DIR, 0700, true)) {
    $file = RATE_DIR . '/' . hash('sha256', $ip);
    $now = time();
    $hits = [];
    if (is_file($file)) {
        $hits = array_filter(
            array_map('intval', explode("\n", (string)file_get_contents($file))),
            static fn(int $t): bool => $t > $now - RATE_WINDOW
        );
    }
    if (count($hits) >= RATE_MAX) {
        respond(false, 'rate', 429);
    }
    $hits[] = $now;
    file_put_contents($file, implode("\n", $hits), LOCK_EX);
}

// Header-injection safe: name/email are stripped of CR above; reject LF too.
if (preg_match('/[\n]/', $name . $email)) {
    respond(false, 'invalid', 422);
}

$subject = 'Website enquiry: ' . $name . ($town !== '' ? " ($town)" : '');
$body = "Name:    $name\nEmail:   $email\nPhone:   $phone\nTown:    $town\nIP:      $ip\n\n$message\n";

$headers = [
    'From: Mickey Mullin website <' . FROM_ADDRESS . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=utf-8',
];

$sent = mail(TO_ADDRESS, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . FROM_ADDRESS);

respond($sent, $sent ? '' : 'mail', $sent ? 200 : 500);
