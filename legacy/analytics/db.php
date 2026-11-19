<?php

function ensure_schema(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_hash TEXT NOT NULL,
            session_id TEXT,
            page TEXT,
            referrer TEXT,
            referrer_source TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            user_agent TEXT,
            device_type TEXT,
            browser TEXT,
            os TEXT,
            screen_width INTEGER,
            created_at TEXT NOT NULL,
            session_started_at TEXT,
            duration_seconds INTEGER DEFAULT 0,
            event_type TEXT DEFAULT 'pageview'
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL UNIQUE,
            visitor_hash TEXT NOT NULL,
            entry_page TEXT,
            exit_page TEXT,
            referrer TEXT,
            referrer_source TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            device_type TEXT,
            browser TEXT,
            os TEXT,
            screen_width INTEGER,
            started_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            page_count INTEGER DEFAULT 0,
            duration_seconds INTEGER DEFAULT 0
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            page TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ");

    $visitColumns = [];
    foreach ($pdo->query('PRAGMA table_info(visits)') as $row) {
        $visitColumns[] = $row['name'];
    }

    $additions = [
        ['session_id', 'TEXT'],
        ['referrer_source', 'TEXT'],
        ['utm_source', 'TEXT'],
        ['utm_medium', 'TEXT'],
        ['utm_campaign', 'TEXT'],
        ['device_type', 'TEXT'],
        ['browser', 'TEXT'],
        ['os', 'TEXT'],
        ['screen_width', 'INTEGER'],
        ['session_started_at', 'TEXT'],
        ['duration_seconds', 'INTEGER DEFAULT 0'],
        ['event_type', "TEXT DEFAULT 'pageview'"]
    ];

    foreach ($additions as [$column, $def]) {
        if (!in_array($column, $visitColumns, true)) {
            $pdo->exec("ALTER TABLE visits ADD COLUMN $column $def");
        }
    }

    $sessionColumns = [];
    foreach ($pdo->query('PRAGMA table_info(sessions)') as $row) {
        $sessionColumns[] = $row['name'];
    }

    $sessionAdditions = [
        ['entry_page', 'TEXT'],
        ['exit_page', 'TEXT'],
        ['referrer', 'TEXT'],
        ['referrer_source', 'TEXT'],
        ['utm_source', 'TEXT'],
        ['utm_medium', 'TEXT'],
        ['utm_campaign', 'TEXT'],
        ['device_type', 'TEXT'],
        ['browser', 'TEXT'],
        ['os', 'TEXT'],
        ['screen_width', 'INTEGER'],
        ['started_at', 'TEXT'],
        ['last_seen_at', 'TEXT'],
        ['page_count', 'INTEGER DEFAULT 0'],
        ['duration_seconds', 'INTEGER DEFAULT 0']
    ];

    foreach ($sessionAdditions as [$column, $def]) {
        if (!in_array($column, $sessionColumns, true)) {
            $pdo->exec("ALTER TABLE sessions ADD COLUMN $column $def");
        }
    }

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_visits_visitor_hash ON visits(visitor_hash)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name)");
}

function get_db(): PDO
{
    $config = require __DIR__ . '/config.php';
    $dbPath = $config['db_path'];
    $dataDir = dirname($dbPath);

    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    ensure_schema($pdo);

    return $pdo;
}
