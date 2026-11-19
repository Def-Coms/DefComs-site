<?php
/**
 * track.php
 * ---------
 * Записва едно посещение в базата данни и връща невидим 1x1 GIF пиксел.
 */

require __DIR__ . '/db.php';
$config = require __DIR__ . '/config.php';

function classify_source(string $referrer, string $utmSource, string $utmMedium): string
{
    if ($utmSource !== '') {
        return 'campaign';
    }

    if ($utmMedium !== '') {
        return 'campaign';
    }

    if ($referrer === '') {
        return 'direct';
    }

    $host = strtolower(parse_url($referrer, PHP_URL_HOST) ?? '');
    if ($host === '') {
        return 'direct';
    }

    if (str_contains($host, 'google') || str_contains($host, 'bing') || str_contains($host, 'yandex') || str_contains($host, 'duckduckgo')) {
        return 'search';
    }

    if (str_contains($host, 'facebook') || str_contains($host, 'linkedin') || str_contains($host, 'instagram') || str_contains($host, 'twitter') || str_contains($host, 'x.com')) {
        return 'social';
    }

    if (str_contains($host, 'mail') || str_contains($host, 'outlook') || str_contains($host, 'gmail')) {
        return 'email';
    }

    return 'referral';
}

$page = isset($_GET['page']) ? mb_substr(trim($_GET['page']), 0, 255) : '/';
$referrer = isset($_GET['ref']) ? mb_substr(trim($_GET['ref']), 0, 255) : '';
$sessionId = isset($_GET['session_id']) ? mb_substr(trim($_GET['session_id']), 0, 255) : '';
$utmSource = isset($_GET['utm_source']) ? mb_substr(trim($_GET['utm_source']), 0, 100) : '';
$utmMedium = isset($_GET['utm_medium']) ? mb_substr(trim($_GET['utm_medium']), 0, 100) : '';
$utmCampaign = isset($_GET['utm_campaign']) ? mb_substr(trim($_GET['utm_campaign']), 0, 100) : '';
$deviceType = isset($_GET['device_type']) ? mb_substr(trim($_GET['device_type']), 0, 50) : 'desktop';
$browser = isset($_GET['browser']) ? mb_substr(trim($_GET['browser']), 0, 50) : '';
$os = isset($_GET['os']) ? mb_substr(trim($_GET['os']), 0, 50) : '';
$screenWidth = isset($_GET['screen_width']) ? (int) $_GET['screen_width'] : 0;
$userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

$ipHeader = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$ip = trim(explode(',', $ipHeader)[0]);
$dayKey = date('Y-m-d');
$visitorHash = hash('sha256', $ip . '|' . $userAgent . '|' . $dayKey . '|' . $config['salt']);

if ($sessionId === '') {
    $sessionId = 'sid-' . substr(hash('sha256', $visitorHash . '|' . microtime(true)), 0, 16);
}

$createdAt = date('Y-m-d H:i:s');
$createdAtTs = strtotime($createdAt);

try {
    $pdo = get_db();

    $lastVisit = $pdo->prepare('SELECT id, created_at FROM visits WHERE session_id = ? ORDER BY id DESC LIMIT 1');
    $lastVisit->execute([$sessionId]);
    $latest = $lastVisit->fetch(PDO::FETCH_ASSOC);
    if ($latest && !empty($latest['created_at'])) {
        $prevTs = strtotime($latest['created_at']);
        $delta = max(0, (int) ($createdAtTs - $prevTs));
        $pdo->prepare('UPDATE visits SET duration_seconds = ? WHERE id = ?')->execute([$delta, $latest['id']]);
    }

    $source = classify_source($referrer, $utmSource, $utmMedium);

    $insertVisit = $pdo->prepare(
        'INSERT INTO visits (visitor_hash, session_id, page, referrer, referrer_source, utm_source, utm_medium, utm_campaign, user_agent, device_type, browser, os, screen_width, created_at, session_started_at, duration_seconds, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' 
    );
    $insertVisit->execute([
        $visitorHash,
        $sessionId,
        $page,
        $referrer,
        $source,
        $utmSource,
        $utmMedium,
        $utmCampaign,
        $userAgent,
        $deviceType,
        $browser,
        $os,
        $screenWidth,
        $createdAt,
        $createdAt,
        0,
        'pageview'
    ]);

    $sessionRow = $pdo->prepare('SELECT id, started_at, page_count, duration_seconds FROM sessions WHERE session_id = ?');
    $sessionRow->execute([$sessionId]);
    $session = $sessionRow->fetch(PDO::FETCH_ASSOC);

    if ($session) {
        $pageCount = (int) $session['page_count'] + 1;
        $startedAt = $session['started_at'];
        $durationSeconds = max((int) $session['duration_seconds'], (int) ($createdAtTs - strtotime($startedAt)));
        $pdo->prepare(
            'UPDATE sessions SET visitor_hash = ?, entry_page = COALESCE(entry_page, ?), exit_page = ?, referrer = ?, referrer_source = ?, utm_source = ?, utm_medium = ?, utm_campaign = ?, device_type = COALESCE(?, device_type), browser = COALESCE(?, browser), os = COALESCE(?, os), screen_width = COALESCE(?, screen_width), last_seen_at = ?, page_count = ?, duration_seconds = ? WHERE session_id = ?'
        )->execute([
            $visitorHash,
            $page,
            $page,
            $referrer,
            $source,
            $utmSource,
            $utmMedium,
            $utmCampaign,
            $deviceType,
            $browser,
            $os,
            $screenWidth,
            $createdAt,
            $pageCount,
            $durationSeconds,
            $sessionId
        ]);
    } else {
        $pdo->prepare(
            'INSERT INTO sessions (session_id, visitor_hash, entry_page, exit_page, referrer, referrer_source, utm_source, utm_medium, utm_campaign, device_type, browser, os, screen_width, started_at, last_seen_at, page_count, duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)'
        )->execute([
            $sessionId,
            $visitorHash,
            $page,
            $page,
            $referrer,
            $source,
            $utmSource,
            $utmMedium,
            $utmCampaign,
            $deviceType,
            $browser,
            $os,
            $screenWidth,
            $createdAt,
            $createdAt
        ]);
    }
} catch (Throwable $e) {
    // Тихо пропускаме грешка, за да не чупим зареждането на сайта.
}

header('Content-Type: image/gif');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo base64_decode('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
