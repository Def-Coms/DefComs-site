<?php
/**
 * Receives low-detail, allowlisted funnel events without answer/contact payloads.
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit;
}

require __DIR__ . '/db.php';

$allowedEvents = [
    'assessment_start',
    'assessment_complete',
    'assessment_abandon',
    'assessment_lead_submitted',
    'assessment_cta_click'
];

$eventName = isset($_POST['event_name']) ? trim((string) $_POST['event_name']) : '';
$page = isset($_POST['page']) ? trim((string) $_POST['page']) : '';

if (!in_array($eventName, $allowedEvents, true) || $page === '' || strlen($page) > 255 || str_contains($page, "\n") || str_contains($page, "\r")) {
    http_response_code(400);
    exit;
}

try {
    $pdo = get_db();
    $statement = $pdo->prepare('INSERT INTO analytics_events (event_name, page, created_at) VALUES (?, ?, ?)');
    $statement->execute([$eventName, $page, date('Y-m-d H:i:s')]);
    http_response_code(204);
} catch (Throwable $e) {
    http_response_code(204);
}
