<?php
/**
 * КОНФИГУРАЦИЯ
 * -------------
 * Всичко по-долу вече е готово за употреба (salt, парола, токен).
 * Ако някога поискаш да смениш паролата:
 *   - Изпълни в SSH конзола: php -r "echo password_hash('нова_парола', PASSWORD_DEFAULT);"
 *   - Копирай резултата и го сложи като стойност на 'admin_password_hash' по-долу.
 */

return [
    // Случаен таен низ - използва се за анонимизиране на посетителите (не пази истински IP адреси)
    'salt' => 'eb198eefeaf7ff2f4bf48f89dfbd7129d57e1f19ab48ef29143630edef5947b0',

    // Хеш на паролата за влизане в /stats.php (само хеш — НИКОГА не записвайте паролата в чист текст тук)
    'admin_password_hash' => '$2b$10$VjTCLve.mQT8ejFiBEA6Xu4uj9Z4ssxU5c.CXgz1t//wigoyF9dlC',

    // Път до SQLite базата данни (папката 'data' трябва да е достъпна за запис от PHP)
    'db_path' => __DIR__ . '/data/visits.db',

    // Таен токен, който защитава cleanup.php, ако го извикваш през URL (cron през wget/curl)
    'cleanup_token' => '39985a1ed43bce946c67e59a647930f55352b76c3da04b2f',
];
