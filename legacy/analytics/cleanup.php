<?php
/**
 * cleanup.php
 * -----------
 * Трие всички записи в базата, по-стари от 3 месеца, и компресира базата (VACUUM).
 * Предназначен е да се пуска автоматично през cron (виж README.md за настройка).
 *
 * Може да се вика по два начина:
 *   1) От конзолата (CLI):        php cleanup.php
 *   2) През URL (wget/curl cron): https://сайт.bg/analytics/cleanup.php?token=ТАЕН_ТОКЕН
 */

require __DIR__ . '/db.php';
$config = require __DIR__ . '/config.php';

$isCli = (php_sapi_name() === 'cli');

// Ако не е CLI, изискваме валиден таен токен - за да не може произволен човек
// да вика скрипта от браузъра
if (!$isCli) {
    $token = $_GET['token'] ?? '';
    if (!hash_equals((string) $config['cleanup_token'], (string) $token)) {
        http_response_code(403);
        die('Forbidden');
    }
}

try {
    $pdo = get_db();

    $stmt = $pdo->prepare("DELETE FROM visits WHERE created_at < datetime('now','localtime','-3 months')");
    $stmt->execute();
    $deleted = $stmt->rowCount();

    $eventStmt = $pdo->prepare("DELETE FROM analytics_events WHERE created_at < datetime('now','localtime','-3 months')");
    $eventStmt->execute();
    $deletedEvents = $eventStmt->rowCount();

    // Компресираме файла на базата данни, за да освободим реално мястото на диска
    $pdo->exec('VACUUM');

    $message = date('Y-m-d H:i:s') . " - OK - изтрити посещения: {$deleted}; събития: {$deletedEvents}\n";
} catch (Throwable $e) {
    $message = date('Y-m-d H:i:s') . ' - ГРЕШКА: ' . $e->getMessage() . "\n";
}

// Пазим малък лог, за да можеш да провериш дали cron-ът наистина се изпълнява
file_put_contents(__DIR__ . '/data/cleanup.log', $message, FILE_APPEND);

if ($isCli) {
    echo $message;
} else {
    header('Content-Type: text/plain; charset=utf-8');
    echo $message;
}
