<?php
declare(strict_types=1);

/**
 * JenniferslawAction.org — Petitions endpoint (moved here from JennifersLaw.org, November 2026)
 * ------------------------------------------------------------------
 * Stores petition signatures on the site's own server, so petitions never
 * expire or close because of a third-party platform.
 *
 *   POST /api/petition-sign.php            sign one or more petitions in one submission
 *   GET  /api/petition-sign.php?counts=1    signature count for every petition
 *   GET  /api/petition-sign.php?recent=SLUG  latest public signers (name/city only, opt-in)
 *   GET  /api/petition-sign.php?export=SLUG&key=ADMIN_KEY   CSV of all signatures (for delivery)
 *
 * STORAGE
 *   Default: SQLite file in a folder ABOVE the public web root:
 *       <account>/domains/jenniferslawaction.org/jl-data/petitions.sqlite
 *   (created automatically on first use). Override with PETITION_DATA_DIR.
 *   Optional MySQL: set PETITION_DB_DSN (e.g. mysql:host=localhost;dbname=uXXX_petitions;charset=utf8mb4),
 *   PETITION_DB_USER and PETITION_DB_PASS. Hostinger Business includes both.
 *
 * CONFIG (environment or the .env file above public_html — same loader rules as story-submit.php)
 *   PETITION_ADMIN_KEY   long random string; required for ?export=
 *   PETITION_SALT        long random string used to hash IP addresses for rate limiting
 *   JL_ALLOWED_ORIGINS   optional, comma-separated
 *
 * Responses are always JSON (except the CSV export). Email addresses are never returned publicly.
 */

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

// Every petition slug the site publishes. Keep in sync with PETITION_SLUGS in _site-tools/build_action_site.py.
// 'peoples-demand' is the national petition (The People's Demand), open to anyone in any state.
const JL_PETITIONS = [
    'judge-robert-w-rohm', 'judge-david-e-schwartz', 'judge-kenneth-l-popejoy', 'judge-bonnie-m-wheaton',
    'judge-mia-s-mcpherson', 'judge-jennifer-l-barron', 'judge-bryan-s-chapman', 'judge-joseph-t-bugos',
    'judge-charles-s-beach-ii', 'judge-thomas-v-lyons-ii', 'judge-kathy-m-flanagan', 'judge-jerry-a-esrig',
    'judge-toya-t-harvey', 'judge-jack-j-hagerty', 'judge-barbara-n-flores', 'judge-james-e-hanlon-jr',
    'peoples-demand',
];

function jl_json(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function jl_env(string $key): ?string
{
    static $dotenv = null;
    foreach ([getenv($key), $_ENV[$key] ?? null, $_SERVER[$key] ?? null] as $c) {
        if (is_string($c) && $c !== '') return trim($c);
    }
    if ($dotenv === null) {
        $dotenv = [];
        $root = dirname(__DIR__);
        foreach ([dirname($root) . '/.env', dirname($root) . '/jl-secrets/.env', $root . '/.env'] as $p) {
            if (!is_readable($p) || !is_file($p)) continue;
            foreach (file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
                [$k, $v] = explode('=', $line, 2);
                $v = trim($v);
                if (strlen($v) > 1 && ($v[0] === '"' || $v[0] === "'") && substr($v, -1) === $v[0]) $v = substr($v, 1, -1);
                $dotenv[trim($k)] = $v;
            }
            break;
        }
    }
    $v = $dotenv[$key] ?? null;
    return ($v !== null && $v !== '') ? $v : null;
}

function jl_db(): PDO
{
    $dsn = jl_env('PETITION_DB_DSN');
    if ($dsn) {
        $pdo = new PDO($dsn, jl_env('PETITION_DB_USER') ?? '', jl_env('PETITION_DB_PASS') ?? '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdo->exec('CREATE TABLE IF NOT EXISTS signatures (
            id INT AUTO_INCREMENT PRIMARY KEY, petition VARCHAR(80) NOT NULL, name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL, city VARCHAR(80), state VARCHAR(40), zip VARCHAR(12), comment TEXT,
            show_public TINYINT NOT NULL DEFAULT 0, updates TINYINT NOT NULL DEFAULT 0, created_at VARCHAR(32) NOT NULL, ip_hash VARCHAR(64),
            UNIQUE KEY uniq_sig (petition, email)) CHARACTER SET utf8mb4');
        try { $pdo->exec('ALTER TABLE signatures ADD COLUMN updates TINYINT NOT NULL DEFAULT 0'); } catch (Throwable $e) { /* already there */ }
        return $pdo;
    }
    $dir = jl_env('PETITION_DATA_DIR') ?? (dirname(dirname(__DIR__)) . '/jl-data');
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    if (!is_dir($dir) || !is_writable($dir)) {
        // Fallback inside the web root, protected by api/.htaccess-style rules in its own folder.
        $dir = __DIR__ . '/_petition-data';
        if (!is_dir($dir)) {
            @mkdir($dir, 0750, true);
            @file_put_contents($dir . '/.htaccess', "Require all denied\n");
        }
    }
    $pdo = new PDO('sqlite:' . $dir . '/petitions.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec('CREATE TABLE IF NOT EXISTS signatures (
        id INTEGER PRIMARY KEY AUTOINCREMENT, petition TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
        city TEXT, state TEXT, zip TEXT, comment TEXT, show_public INTEGER NOT NULL DEFAULT 0, updates INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL, ip_hash TEXT, UNIQUE(petition, email))');
    try { $pdo->exec('ALTER TABLE signatures ADD COLUMN updates INTEGER NOT NULL DEFAULT 0'); } catch (Throwable $e) { /* already there */ }
    return $pdo;
}

function jl_counts(PDO $db): array
{
    $out = array_fill_keys(JL_PETITIONS, 0);
    foreach ($db->query('SELECT petition, COUNT(*) AS n FROM signatures GROUP BY petition') as $r) {
        if (isset($out[$r['petition']])) $out[$r['petition']] = (int)$r['n'];
    }
    return $out;
}

function jl_clean(?string $s, int $max): string
{
    $s = trim((string)$s);
    $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s) ?? '';
    return mb_substr($s, 0, $max);
}

// Same-origin check for writes (browsers send Origin on POST).
function jl_origin_ok(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return true;
    $allowed = array_filter(array_map('trim', explode(',', jl_env('JL_ALLOWED_ORIGINS') ?? '')));
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $allowed[] = 'https://' . $host;
    $allowed[] = 'http://' . $host;
    return in_array($origin, $allowed, true);
}

try {
    $db = jl_db();
} catch (Throwable $e) {
    error_log('[jl-petition] db: ' . $e->getMessage());
    jl_json(500, ['ok' => false, 'message' => 'The petition service is not available right now. Please try again later.']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    if (isset($_GET['counts'])) {
        jl_json(200, ['ok' => true, 'counts' => jl_counts($db)]);
    }
    if (isset($_GET['recent'])) {
        $slug = (string)$_GET['recent'];
        if (!in_array($slug, JL_PETITIONS, true)) jl_json(400, ['ok' => false]);
        $st = $db->prepare('SELECT name, city, state, created_at FROM signatures WHERE petition = ? AND show_public = 1 ORDER BY id DESC LIMIT 25');
        $st->execute([$slug]);
        jl_json(200, ['ok' => true, 'recent' => $st->fetchAll(PDO::FETCH_ASSOC)]);
    }
    if (isset($_GET['export'])) {
        $key = jl_env('PETITION_ADMIN_KEY');
        if (!$key || !hash_equals($key, (string)($_GET['key'] ?? ''))) jl_json(403, ['ok' => false]);
        $slug = (string)$_GET['export'];
        $all = ($slug === 'all');
        if (!$all && !in_array($slug, JL_PETITIONS, true)) jl_json(400, ['ok' => false]);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="petition-' . $slug . '-' . date('Y-m-d') . '.csv"');
        $out = fopen('php://output', 'w');
        // For delivery to a petition's recipients, use ?export=SLUG&key=...&delivery=1: names, cities, states and comments only, never emails.
        $delivery = !empty($_GET['delivery']);
        fputcsv($out, $delivery ? ['petition', 'name', 'city', 'state', 'comment', 'signed_at_utc'] : ['petition', 'name', 'email', 'city', 'state', 'zip', 'comment', 'show_public', 'wants_updates', 'signed_at_utc']);
        $st = $all ? $db->query('SELECT * FROM signatures ORDER BY petition, id')
                   : $db->prepare('SELECT * FROM signatures WHERE petition = ? ORDER BY id');
        if (!$all) $st->execute([$slug]);
        foreach ($st as $r) {
            fputcsv($out, $delivery ? [$r['petition'], $r['name'], $r['city'], $r['state'], $r['comment'], $r['created_at']]
                                    : [$r['petition'], $r['name'], $r['email'], $r['city'], $r['state'], $r['zip'], $r['comment'], $r['show_public'], $r['updates'] ?? 0, $r['created_at']]);
        }
        exit;
    }
    jl_json(400, ['ok' => false, 'message' => 'Unsupported request.']);
}

if ($method !== 'POST') jl_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
if (!jl_origin_ok()) jl_json(403, ['ok' => false, 'message' => 'This form can only be submitted from JenniferslawAction.org.']);

$in = $_POST;
$ctype = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($ctype, 'application/json') !== false) {
    $in = json_decode((string)file_get_contents('php://input'), true) ?: [];
}

// Spam guards: hidden honeypot field must stay empty; form must have been open at least 3 seconds.
if (!empty($in['website'])) jl_json(200, ['ok' => true, 'message' => 'Thank you.']);
$t = (int)($in['t'] ?? 0);
if ($t > 0 && (time() - (int)($t / 1000)) < 3) jl_json(400, ['ok' => false, 'message' => 'Please take a moment to review the petition, then submit again.']);

$name = jl_clean($in['name'] ?? '', 120);
$email = strtolower(jl_clean($in['email'] ?? '', 190));
$city = jl_clean($in['city'] ?? '', 80);
$state = jl_clean($in['state'] ?? '', 40);
$zip = jl_clean($in['zip'] ?? '', 12);
$comment = jl_clean($in['comment'] ?? '', 1000);
$public = !empty($in['public']) ? 1 : 0;
$updates = !empty($in['updates']) ? 1 : 0;

$list = $in['petitions'] ?? '';
if (is_string($list)) $list = explode(',', $list);
$list = array_values(array_unique(array_filter(array_map('trim', (array)$list), fn($s) => in_array($s, JL_PETITIONS, true))));

if (mb_strlen($name) < 2) jl_json(400, ['ok' => false, 'message' => 'Please enter your name.']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jl_json(400, ['ok' => false, 'message' => 'Please enter a valid email address.']);
if (!$list) jl_json(400, ['ok' => false, 'message' => 'No petition was selected.']);

// Rate limit: 30 submissions per hour per address (hashed, never stored in the clear).
$salt = jl_env('PETITION_SALT') ?? 'jenniferslaw';
$ipHash = hash('sha256', $salt . '|' . ($_SERVER['REMOTE_ADDR'] ?? ''));
$since = gmdate('Y-m-d\TH:i:s\Z', time() - 3600);
$st = $db->prepare('SELECT COUNT(DISTINCT created_at) FROM signatures WHERE ip_hash = ? AND created_at > ?');
$st->execute([$ipHash, $since]);
if ((int)$st->fetchColumn() > 30) jl_json(429, ['ok' => false, 'message' => 'Too many submissions from this connection. Please try again later.']);

$now = gmdate('Y-m-d\TH:i:s\Z');
$signed = [];
$already = [];
$isMysql = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
$sql = ($isMysql ? 'INSERT IGNORE' : 'INSERT OR IGNORE') . ' INTO signatures (petition, name, email, city, state, zip, comment, show_public, updates, created_at, ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
$ins = $db->prepare($sql);
$db->beginTransaction();
foreach ($list as $slug) {
    $ins->execute([$slug, $name, $email, $city, $state, $zip, $comment, $public, $updates, $now, $ipHash]);
    if ($ins->rowCount() > 0) $signed[] = $slug; else $already[] = $slug;
}
$db->commit();

$n = count($signed);
$msg = $n === 0
    ? 'You have already signed ' . (count($already) === 1 ? 'this petition' : 'these petitions') . '. Thank you.'
    : 'Thank you. Your signature has been added to ' . ($n === 1 ? 'the petition' : $n . ' petitions') . '.';
jl_json(200, ['ok' => true, 'message' => $msg, 'signed' => $signed, 'already' => $already, 'counts' => jl_counts($db)]);
