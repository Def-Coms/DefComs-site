<?php
session_start();
require __DIR__ . '/db.php';
$config = require __DIR__ . '/config.php';

// ---------- Вход с парола ----------
if (isset($_POST['password'])) {
    if (password_verify($_POST['password'], $config['admin_password_hash'])) {
        $_SESSION['analytics_logged_in'] = true;
    } else {
        $loginError = 'Грешна парола.';
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: stats.php');
    exit;
}

if (empty($_SESSION['analytics_logged_in'])) {
    ?>
    <!DOCTYPE html>
    <html lang="bg">
    <head>
        <meta charset="UTF-8">
        <title>Вход - Статистика</title>
        <style>
            body { font-family: system-ui, sans-serif; background:#0f1115; color:#e6e6e6; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
            form { background:#1b1e26; padding:32px; border-radius:12px; width:280px; box-shadow:0 10px 30px rgba(0,0,0,.4); }
            h1 { font-size:18px; margin:0 0 16px; }
            input { width:100%; padding:10px; border-radius:8px; border:1px solid #333; background:#0f1115; color:#fff; box-sizing:border-box; margin-bottom:12px; }
            button { width:100%; padding:10px; border:none; border-radius:8px; background:#5b8def; color:#fff; font-weight:600; cursor:pointer; }
            .error { color:#ff6b6b; font-size:14px; margin-bottom:12px; }
        </style>
    </head>
    <body>
        <form method="post">
            <h1>🔒 Статистика на сайта</h1>
            <?php if (!empty($loginError)): ?>
                <div class="error"><?= htmlspecialchars($loginError) ?></div>
            <?php endif; ?>
            <input type="password" name="password" placeholder="Парола" autofocus>
            <button type="submit">Вход</button>
        </form>
    </body>
    </html>
    <?php
    exit;
}

// ---------- Заявки към базата ----------
$pdo = get_db();

function scalar(PDO $pdo, string $sql): int
{
    return (int) $pdo->query($sql)->fetchColumn();
}

$todayViews    = scalar($pdo, "SELECT COUNT(*) FROM visits WHERE date(created_at) = date('now','localtime')");
$todayUnique   = scalar($pdo, "SELECT COUNT(DISTINCT visitor_hash) FROM visits WHERE date(created_at) = date('now','localtime')");
$todaySessions = scalar($pdo, "SELECT COUNT(DISTINCT session_id) FROM visits WHERE date(created_at) = date('now','localtime')");

$weekViews     = scalar($pdo, "SELECT COUNT(*) FROM visits WHERE date(created_at) >= date('now','localtime','-6 days')");
$weekUnique    = scalar($pdo, "SELECT COUNT(DISTINCT visitor_hash) FROM visits WHERE date(created_at) >= date('now','localtime','-6 days')");
$weekSessions  = scalar($pdo, "SELECT COUNT(DISTINCT session_id) FROM visits WHERE date(created_at) >= date('now','localtime','-6 days')");

$monthViews    = scalar($pdo, "SELECT COUNT(*) FROM visits WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m','now','localtime')");
$monthUnique   = scalar($pdo, "SELECT COUNT(DISTINCT visitor_hash) FROM visits WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m','now','localtime')");
$monthSessions = scalar($pdo, "SELECT COUNT(DISTINCT session_id) FROM visits WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m','now','localtime')");

$totalViews    = scalar($pdo, "SELECT COUNT(*) FROM visits");
$totalUnique   = scalar($pdo, "SELECT COUNT(DISTINCT visitor_hash) FROM visits");
$totalSessions = scalar($pdo, "SELECT COUNT(DISTINCT session_id) FROM visits");

$avgDuration = (int) $pdo->query("SELECT AVG(duration_seconds) FROM sessions")->fetchColumn();
$avgPagesPerSession = (float) $pdo->query("SELECT AVG(page_count) FROM sessions")->fetchColumn();

$daily = $pdo->query("
    SELECT date(created_at) as d, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as uniques, COUNT(DISTINCT session_id) as sessions
    FROM visits
    WHERE date(created_at) >= date('now','localtime','-13 days')
    GROUP BY d
    ORDER BY d ASC
")->fetchAll(PDO::FETCH_ASSOC);

$dailyMap = [];
foreach ($daily as $row) {
    $dailyMap[$row['d']] = $row;
}
$last14 = [];
for ($i = 13; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $last14[] = $dailyMap[$d] ?? ['d' => $d, 'views' => 0, 'uniques' => 0, 'sessions' => 0];
}
$maxViews = max(1, max(array_column($last14, 'views')));

$topPages = $pdo->query("
    SELECT page, COUNT(*) as views
    FROM visits
    WHERE date(created_at) >= date('now','localtime','-29 days')
    GROUP BY page
    ORDER BY views DESC
    LIMIT 10
")->fetchAll(PDO::FETCH_ASSOC);

$topSources = $pdo->query("
    SELECT referrer_source as source, COUNT(*) as views
    FROM visits
    WHERE date(created_at) >= date('now','localtime','-29 days')
    GROUP BY referrer_source
    ORDER BY views DESC
    LIMIT 8
")->fetchAll(PDO::FETCH_ASSOC);

$topDevices = $pdo->query("
    SELECT device_type, COUNT(*) as views
    FROM visits
    WHERE date(created_at) >= date('now','localtime','-29 days') AND device_type IS NOT NULL
    GROUP BY device_type
    ORDER BY views DESC
    LIMIT 6
")->fetchAll(PDO::FETCH_ASSOC);

$engagement = $pdo->query("
    SELECT page, COUNT(*) as views, MAX(duration_seconds) as max_duration
    FROM visits
    WHERE date(created_at) >= date('now','localtime','-29 days')
    GROUP BY page
    ORDER BY views DESC
    LIMIT 8
")->fetchAll(PDO::FETCH_ASSOC);

$assessmentEvents = $pdo->query("
    SELECT event_name, COUNT(*) AS total
    FROM analytics_events
    WHERE page LIKE '%assessment/nis2-dora%' OR page LIKE '%wizard.html%'
    GROUP BY event_name
    ORDER BY event_name
")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Статистика на посетителите</title>
<style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background:#0f1115; color:#e6e6e6; margin:0; padding:24px; }
    .wrap { max-width: 960px; margin: 0 auto; }
    header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    h1 { font-size:22px; margin:0; }
    a.logout { color:#9aa4b2; font-size:14px; text-decoration:none; }
    .cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:16px; margin-bottom:32px; }
    .card { background:#1b1e26; border-radius:12px; padding:20px; }
    .card .label { color:#9aa4b2; font-size:13px; margin-bottom:8px; }
    .card .value { font-size:28px; font-weight:700; }
    .card .sub { color:#9aa4b2; font-size:13px; margin-top:4px; }
    .section { background:#1b1e26; border-radius:12px; padding:20px; margin-bottom:24px; }
    .section h2 { font-size:15px; color:#9aa4b2; margin:0 0 16px; text-transform:uppercase; letter-spacing:.05em; }
    .chart { display:flex; align-items:flex-end; gap:6px; height:140px; }
    .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; }
    .bar { width:100%; background:#5b8def; border-radius:4px 4px 0 0; min-height:2px; }
    .bar-label { font-size:10px; color:#9aa4b2; margin-top:6px; white-space:nowrap; }
    .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); gap:16px; }
    .mini-card { background:#161923; border:1px solid #2a2e38; border-radius:10px; padding:14px; }
    .mini-card .mini-label { color:#9aa4b2; font-size:12px; text-transform:uppercase; margin-bottom:6px; }
    .mini-card .mini-value { font-size:20px; font-weight:700; }
    table { width:100%; border-collapse:collapse; }
    td, th { padding:8px 4px; text-align:left; font-size:14px; border-bottom:1px solid #2a2e38; }
    th { color:#9aa4b2; font-weight:500; }
    .legend { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; color:#9aa4b2; font-size:12px; }
    .dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:6px; }
</style>
</head>
<body>
<div class="wrap">
    <header>
        <h1>📊 Статистика на посетителите</h1>
        <a class="logout" href="?logout=1">Изход</a>
    </header>

    <div class="cards">
        <div class="card">
            <div class="label">Днес</div>
            <div class="value"><?= $todayViews ?></div>
            <div class="sub"><?= $todayUnique ?> уникални посетители • <?= $todaySessions ?> сесии</div>
        </div>
        <div class="card">
            <div class="label">Последните 7 дни</div>
            <div class="value"><?= $weekViews ?></div>
            <div class="sub"><?= $weekUnique ?> уникални посетители • <?= $weekSessions ?> сесии</div>
        </div>
        <div class="card">
            <div class="label">Този месец</div>
            <div class="value"><?= $monthViews ?></div>
            <div class="sub"><?= $monthUnique ?> уникални посетители • <?= $monthSessions ?> сесии</div>
        </div>
        <div class="card">
            <div class="label">Общо от началото</div>
            <div class="value"><?= $totalViews ?></div>
            <div class="sub"><?= $totalUnique ?> уникални посетители • <?= $totalSessions ?> сесии</div>
        </div>
    </div>

    <div class="section">
        <h2>Показатели за ангажираност</h2>
        <div class="stats-grid">
            <div class="mini-card">
                <div class="mini-label">Средно време в сесия</div>
                <div class="mini-value"><?= gmdate('H:i:s', max(0, (int) $avgDuration)) ?></div>
            </div>
            <div class="mini-card">
                <div class="mini-label">Средно страници/сесия</div>
                <div class="mini-value"><?= number_format($avgPagesPerSession, 1) ?></div>
            </div>
            <div class="mini-card">
                <div class="mini-label">Най-посещавана страница</div>
                <div class="mini-value"><?= htmlspecialchars($topPages[0]['page'] ?? '/') ?></div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Прегледи по дни (последните 14 дни)</h2>
        <div class="chart">
            <?php foreach ($last14 as $row): ?>
                <div class="bar-col">
                    <div class="bar" style="height: <?= max(2, round($row['views'] / $maxViews * 100)) ?>%" title="<?= $row['views'] ?> прегледа / <?= $row['sessions'] ?> сесии"></div>
                    <div class="bar-label"><?= date('d.m', strtotime($row['d'])) ?></div>
                </div>
            <?php endforeach; ?>
        </div>
        <div class="legend">
            <span><span class="dot" style="background:#5b8def"></span> Прегледи</span>
            <span><span class="dot" style="background:#2bc48a"></span> Уникални посетители</span>
        </div>
    </div>

    <div class="section">
        <h2>Източници на трафик</h2>
        <table>
            <tr><th>Източник</th><th>Брой посещения</th></tr>
            <?php foreach ($topSources as $src): ?>
                <tr>
                    <td><?= htmlspecialchars($src['source'] ?: 'direct') ?></td>
                    <td><?= $src['views'] ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>

    <div class="section">
        <h2>Устройства</h2>
        <table>
            <tr><th>Устройство</th><th>Брой посещения</th></tr>
            <?php foreach ($topDevices as $device): ?>
                <tr>
                    <td><?= htmlspecialchars($device['device_type'] ?: 'unknown') ?></td>
                    <td><?= $device['views'] ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>

    <div class="section">
        <h2>Най-посещавани страници (последните 30 дни)</h2>
        <table>
            <tr><th>Страница</th><th>Прегледи</th></tr>
            <?php if (empty($topPages)): ?>
                <tr><td colspan="2">Все още няма данни.</td></tr>
            <?php endif; ?>
            <?php foreach ($topPages as $p): ?>
                <tr>
                    <td><?= htmlspecialchars($p['page']) ?></td>
                    <td><?= $p['views'] ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>

    <div class="section">
        <h2>Ангажираност по страници</h2>
        <table>
            <tr><th>Страница</th><th>Прегледи</th><th>Макс. продължителност</th></tr>
            <?php foreach ($engagement as $row): ?>
                <tr>
                    <td><?= htmlspecialchars($row['page']) ?></td>
                    <td><?= $row['views'] ?></td>
                    <td><?= gmdate('H:i:s', max(0, (int) $row['max_duration'])) ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>

    <div class="section">
        <h2>NIS2/DORA assessment funnel</h2>
        <table>
            <tr><th>Събитие</th><th>Общо</th></tr>
            <?php if (empty($assessmentEvents)): ?>
                <tr><td colspan="2">Все още няма събития от оценката.</td></tr>
            <?php endif; ?>
            <?php foreach ($assessmentEvents as $event): ?>
                <tr>
                    <td><?= htmlspecialchars($event['event_name']) ?></td>
                    <td><?= (int) $event['total'] ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
</div>
</body>
</html>
