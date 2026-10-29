<?php
// Ixonite website security checker: server-side helper.
// Browsers cannot read another site's response headers or TLS certificate,
// so this script makes one request to the site the visitor entered and
// returns the headers and certificate as JSON. Ships in out/ with the site.
//
// Safety: public hostnames only, every resolved IP must be public (no
// internal/metadata addresses), the connection is pinned to the checked IP
// (no DNS rebinding), ports 80/443 only, short timeouts, no response bodies,
// and a per-visitor rate limit.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_SLASHES);
  exit;
}

// ---- rate limit: 20 scans per 10 minutes per IP ----
$rlDir = sys_get_temp_dir() . '/ixn-scan';
@mkdir($rlDir, 0700, true);
$rlFile = $rlDir . '/' . md5($_SERVER['REMOTE_ADDR'] ?? 'x');
$now = time();
$hits = array_filter(array_map('intval', @file($rlFile) ?: []), function ($t) use ($now) { return $t > $now - 600; });
if (count($hits) >= 20) out(['ok' => false, 'error' => 'rate_limited'], 429);
$hits[] = $now;
@file_put_contents($rlFile, implode("\n", $hits), LOCK_EX);

// ---- validate host ----
$host = strtolower(trim((string) ($_GET['host'] ?? '')));
$host = preg_replace('#^[a-z]+://#', '', $host);
$host = preg_replace('#[/?\#:].*$#', '', $host);
$host = rtrim($host, '.');
if (!preg_match('/^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/', $host)) {
  out(['ok' => false, 'error' => 'invalid_host'], 400);
}

function public_ips($host) {
  $ips = @gethostbynamel($host);
  if (!$ips) return null;
  foreach ($ips as $ip) {
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return false;
  }
  return $ips;
}

$ips = public_ips($host);
if ($ips === null) out(['ok' => false, 'error' => 'no_dns'], 400);
if ($ips === false) out(['ok' => false, 'error' => 'private_address'], 400);
$ip = $ips[0];

// ---- one HTTP request, headers only, pinned to the checked IP ----
function fetch_headers($url, $host, $ip) {
  $parts = parse_url($url);
  $port = ($parts['scheme'] ?? '') === 'http' ? 80 : 443;
  $headers = [];
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RESOLVE => ["$host:$port:$ip"],
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; IxoniteSecurityCheck/1.0; +https://ixonit.com/tools/)',
    CURLOPT_HEADERFUNCTION => function ($ch, $line) use (&$headers) {
      $len = strlen($line);
      if (preg_match('#^HTTP/#', $line)) $headers = [];
      $p = explode(':', $line, 2);
      if (count($p) === 2) {
        $k = strtolower(trim($p[0]));
        $headers[$k] = isset($headers[$k]) ? $headers[$k] . ', ' . trim($p[1]) : trim($p[1]);
      }
      return $len;
    },
    CURLOPT_WRITEFUNCTION => function () { return 0; }, // stop at the body
  ]);
  curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  curl_close($ch);
  return [$status, $headers];
}

[$status, $headers] = fetch_headers("https://$host/", $host, $ip);
$redirects = [];
$finalHost = $host;
// Follow up to 3 redirects that stay on public hosts.
for ($i = 0; $i < 3 && $status >= 300 && $status < 400 && !empty($headers['location']); $i++) {
  $loc = $headers['location'];
  $p = parse_url($loc);
  if (!$p || empty($p['host'])) { $loc = "https://$finalHost" . (substr($loc, 0, 1) === '/' ? $loc : "/$loc"); $p = parse_url($loc); }
  if (!in_array($p['scheme'] ?? '', ['http', 'https'], true) || isset($p['port']) && !in_array((int) $p['port'], [80, 443], true)) break;
  $nextIps = public_ips(strtolower($p['host']));
  if (!$nextIps) break;
  $redirects[] = $loc;
  $finalHost = strtolower($p['host']);
  $ip = $nextIps[0];
  [$status, $headers] = fetch_headers($loc, $finalHost, $ip);
}

// Does plain http:// redirect to https://?
[$hStatus, $hHeaders] = fetch_headers("http://$host/", $host, $ips[0]);
$httpsRedirect = $hStatus >= 300 && $hStatus < 400 && stripos($hHeaders['location'] ?? '', 'https://') === 0;

// ---- TLS certificate ----
function tls_info($host, $ip, $verify) {
  $ctx = stream_context_create(['ssl' => [
    'peer_name' => $host,
    'SNI_enabled' => true,
    'capture_peer_cert' => true,
    'verify_peer' => $verify,
    'verify_peer_name' => $verify,
  ]]);
  $errno = 0; $errstr = '';
  $s = @stream_socket_client("ssl://$ip:443", $errno, $errstr, 6, STREAM_CLIENT_CONNECT, $ctx);
  if (!$s) return null;
  $meta = stream_get_meta_data($s);
  $params = stream_context_get_params($s);
  fclose($s);
  $cert = openssl_x509_parse($params['options']['ssl']['peer_certificate']);
  $san = [];
  if (!empty($cert['extensions']['subjectAltName'])) {
    foreach (explode(',', $cert['extensions']['subjectAltName']) as $e) $san[] = trim(str_replace('DNS:', '', $e));
  }
  return [
    'protocol' => $meta['crypto']['protocol'] ?? null,
    'cipher' => $meta['crypto']['cipher_name'] ?? null,
    'issuer' => $cert['issuer']['O'] ?? ($cert['issuer']['CN'] ?? null),
    'subject' => $cert['subject']['CN'] ?? null,
    'validFrom' => gmdate('c', $cert['validFrom_time_t']),
    'validTo' => gmdate('c', $cert['validTo_time_t']),
    'daysLeft' => (int) floor(($cert['validTo_time_t'] - time()) / 86400),
    'san' => array_slice($san, 0, 20),
  ];
}

$tls = tls_info($host, $ips[0], true);
$tlsValid = $tls !== null;
if (!$tls) $tls = tls_info($host, $ips[0], false);

out([
  'ok' => $status > 0,
  'host' => $host,
  'finalHost' => $finalHost,
  'status' => $status,
  'redirects' => $redirects,
  'httpsRedirect' => $httpsRedirect,
  'headers' => $headers,
  'tls' => $tls ? array_merge($tls, ['valid' => $tlsValid]) : null,
]);
