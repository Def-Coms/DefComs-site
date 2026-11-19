<?php
/**
 * DefComs - High-Tech Secure PHP Form Processor
 * Handles Contact Form, Newsletter Subscription, and NIS2 & DORA Wizard submissions.
 * Submissions are sent securely to info@defcoms.eu via PHP mail() with strict validation and sanitation.
 */

// Set header for JSON response
header('Content-Type: application/json; charset=utf-8');

// Configure recipient email
define('RECIPIENT_EMAIL', 'info@defcoms.eu');

// Ensure Request Method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Неразрешен метод на заявка. Разрешен е само POST.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Read inputs
$form_type = isset($_POST['form_type']) ? trim($_POST['form_type']) : '';

// Anti-spam honeypot: bots fill the hidden "website_hp" field; humans never see it.
// If it is populated, silently pretend success so the bot does not learn it was caught.
if (isset($_POST['website_hp']) && trim((string) $_POST['website_hp']) !== '') {
    echo json_encode(['status' => 'success', 'message' => 'Получихме заявката ви.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. Handlers based on form type or inputs present
if ($form_type === 'assessment_lead') {
    handleAssessmentLead();
} elseif ($form_type === 'newsletter_subscription' || (isset($_POST['email']) && count($_POST) <= 3 && !isset($_POST['name']))) {
    handleNewsletter();
} elseif (isset($_POST['sector']) || isset($_POST['employees']) || isset($_POST['turnover'])) {
    handleWizard();
} else {
    handleContact();
}

/**
 * Handle the optional contact request shown after the preliminary assessment result.
 */
function handleAssessmentLead() {
    $name = isset($_POST['name']) ? cleanInput($_POST['name']) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
    $company = isset($_POST['company']) ? cleanInput($_POST['company']) : '';
    $phone = isset($_POST['phone']) ? cleanInput($_POST['phone']) : '';

    if ($name === '' || !$email || $company === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Попълнете име, валиден имейл и организация.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $subject = 'Запитване след NIS2/DORA самооценка от ' . $company;
    $answers = [];
    foreach (['sector', 'employees', 'turnover', 'partner', 'sole_provider', 'public_provider'] as $field) {
        if (isset($_POST[$field]) && is_scalar($_POST[$field])) {
            $answers[$field] = cleanInput((string) $_POST[$field]);
        }
    }
    $answersHtml = '';
    foreach ($answers as $field => $value) {
        $answersHtml .= '<li><strong>' . htmlspecialchars($field, ENT_QUOTES, 'UTF-8') . ':</strong> ' . $value . '</li>';
    }
    $mailBody = '<h2>Запитване след предварителна самооценка</h2>'
        . '<p><strong>Име:</strong> ' . $name . '</p>'
        . '<p><strong>Имейл:</strong> ' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Организация:</strong> ' . $company . '</p>'
        . '<p><strong>Телефон:</strong> ' . ($phone !== '' ? $phone : 'Не е посочен') . '</p>'
        . '<p>Потребителят изрично изпрати формуляра с цел да бъде потърсен от DefComs.</p>'
        . '<h3>Отговори от самооценката</h3><ul>' . $answersHtml . '</ul>';

    if (sendEmail(RECIPIENT_EMAIL, $subject, $mailBody, $email)) {
        echo json_encode(['status' => 'success', 'message' => 'Запитването е изпратено.'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Запитването не можа да бъде изпратено. Опитайте отново по-късно.'], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * Handle Contact Form submission
 */
function handleContact() {
    $name = isset($_POST['name']) ? cleanInput($_POST['name']) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
    $company = isset($_POST['company']) ? cleanInput($_POST['company']) : '';
    $message = isset($_POST['message']) ? cleanInput($_POST['message']) : '';

    if (empty($name) || !$email || empty($message)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Моля, попълнете всички задължителни полета коректно.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // F-17: require explicit, unchecked-by-default consent and store evidence (time + IP).
    $consent = isset($_POST['consent']) && $_POST['consent'] === 'yes';
    if (!$consent) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Моля, потвърдете съгласието за обработване на личните данни.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $consentEvidence = 'Да — ' . date('Y-m-d H:i:s') . ' · IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

    $subject = "Ново запитване от контактна форма на DefComs";

    // HTML Message Template
    $mailBody = "
    <html>
    <head>
        <title>{$subject}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050811; color: #ffffff; padding: 20px; }
            .container { background-color: #0a0f1e; border: 1px solid #00f0ff; border-radius: 8px; padding: 25px; box-shadow: 0 0 15px rgba(0, 240, 255, 0.15); }
            h2 { color: #00f0ff; border-bottom: 2px solid #ff3838; padding-bottom: 10px; margin-top: 0; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #ff3838; }
            .value { background-color: #050811; padding: 10px; border-radius: 4px; border: 1px solid #1a243a; white-space: pre-wrap; margin-top: 5px; }
            .footer { margin-top: 25px; font-size: 11px; color: #666666; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>⚡ Ново Запитване за Киберсигурност</h2>
            <div class='field'>
                <div class='label'>Име на подател:</div>
                <div class='value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='label'>Имейл за контакт:</div>
                <div class='value'><a href='mailto:{$email}' style='color: #00f0ff; text-decoration: none;'>{$email}</a></div>
            </div>
            " . (!empty($company) ? "
            <div class='field'>
                <div class='label'>Фирма / Организация:</div>
                <div class='value'>{$company}</div>
            </div>" : "") . "
            <div class='field'>
                <div class='label'>Съобщение / Нужда от услуги:</div>
                <div class='value'>{$message}</div>
            </div>
            <div class='field'>
                <div class='label'>Съгласие за обработка на данни:</div>
                <div class='value'>{$consentEvidence}</div>
            </div>
            <div class='footer'>
                Това писмо е изпратено автоматично от защитения уеб сървър на DefComs.eu.
            </div>
        </div>
    </body>
    </html>";

    if (sendEmail(RECIPIENT_EMAIL, $subject, $mailBody, $email)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Вашето съобщение беше изпратено успешно.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Възникна сървърна грешка при изпращането. Моля, опитайте по-късно или се свържете с нас директно.'
        ], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * Handle Newsletter Subscription submission
 */
function handleNewsletter() {
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;

    if (!$email) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Моля, въведете валиден имейл адрес.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // F-17: require explicit consent before recording a newsletter subscription.
    $consent = isset($_POST['consent']) && $_POST['consent'] === 'yes';
    if (!$consent) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Моля, потвърдете съгласието за получаване на бюлетина.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $consentEvidence = 'Да — ' . date('Y-m-d H:i:s') . ' · IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

    $subject = "Нов абонамент за Кибер Новини - DefComs";

    // HTML Message Template
    $mailBody = "
    <html>
    <head>
        <title>{$subject}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050811; color: #ffffff; padding: 20px; }
            .container { background-color: #0a0f1e; border: 1px solid #00f0ff; border-radius: 8px; padding: 25px; box-shadow: 0 0 15px rgba(0, 240, 255, 0.15); }
            h2 { color: #00f0ff; border-bottom: 2px solid #ff3838; padding-bottom: 10px; margin-top: 0; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #ff3838; }
            .value { background-color: #050811; padding: 10px; border-radius: 4px; border: 1px solid #1a243a; margin-top: 5px; }
            .footer { margin-top: 25px; font-size: 11px; color: #666666; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>📰 Нов Абонат за Бюлетин</h2>
            <p>Следният имейл адрес изрази желание да получава седмичния бюлетин за киберсигурност, новини и регулации:</p>
            <div class='field'>
                <div class='label'>Абониран Имейл:</div>
                <div class='value'><a href='mailto:{$email}' style='color: #00f0ff; text-decoration: none;'>{$email}</a></div>
            </div>
            <div class='field'>
                <div class='label'>Съгласие за бюлетин:</div>
                <div class='value'>{$consentEvidence}</div>
            </div>
            <div class='footer'>
                Това писмо е изпратено автоматично от защитения уеб сървър на DefComs.eu.
            </div>
        </div>
    </body>
    </html>";

    if (sendEmail(RECIPIENT_EMAIL, $subject, $mailBody, $email)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Благодарим ви за абонамента! Успешно бяхте записани.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Възникна сървърна грешка при записването за бюлетин.'
        ], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * Handle NIS2 & DORA Evaluation Wizard submission
 */
function handleWizard() {
    $sector = isset($_POST['sector']) ? cleanInput($_POST['sector']) : 'Не е посочен';
    $employees = isset($_POST['employees']) ? cleanInput($_POST['employees']) : 'Не е посочен';
    $turnover = isset($_POST['turnover']) ? cleanInput($_POST['turnover']) : 'Не е посочен';

    $partner = isset($_POST['partner']) ? cleanInput($_POST['partner']) : 'no';
    $sole_provider = isset($_POST['sole_provider']) ? cleanInput($_POST['sole_provider']) : 'no';
    $public_provider = isset($_POST['public_provider']) ? cleanInput($_POST['public_provider']) : 'no';

    // Contact info
    $name = isset($_POST['name']) ? cleanInput($_POST['name']) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
    $company = isset($_POST['company']) ? cleanInput($_POST['company']) : '';
    $phone = isset($_POST['phone']) ? cleanInput($_POST['phone']) : '';

    if (empty($name) || !$email || empty($company) || empty($phone)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Моля, попълнете цялата контактна информация в Стъпка 4, за да получите оценката.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Map Technical values to Bulgarian human-readable strings
    $sectors_bg = [
        'finance' => 'Финансов сектор (Банки, застрахователи, финтех)',
        'ict-finance' => 'ИКТ доставчик за финансовия сектор',
        'highly-critical' => 'Силно критични сектори (Енергетика, транспорт, здравеопазване, космос)',
        'digital-infra' => 'Дигитална инфраструктура & ИКТ управление (MSSP, Cloud, DNS, TLD)',
        'critical-other' => 'Други критични сектори (Производство, храни, машини, пощенски услуги)',
        'digital-providers' => 'Дигитални доставчици (Е-commerce, търсачки, социални мрежи)',
        'public-admin' => 'Публична администрация / Държавен сектор',
        'other' => 'Друг сектор'
    ];

    $employees_bg = [
        'micro' => 'Микро предприятие (под 10 служители)',
        'small' => 'Малко предприятие (10 - 49 служители)',
        'medium' => 'Средно предприятие (50 - 249 служители)',
        'large' => 'Едро/Голямо предприятие (250+ служители)'
    ];

    $turnover_bg = [
        'micro-f' => 'Под 2 млн. EUR',
        'small-f' => 'Под 10 млн. EUR',
        'medium-f' => 'До 50 млн. EUR (Баланс до 43 млн. EUR)',
        'large-f' => 'Над 50 млн. EUR (Баланс над 43 млн. EUR)'
    ];

    $sector_txt = isset($sectors_bg[$sector]) ? $sectors_bg[$sector] : $sector;
    $employees_txt = isset($employees_bg[$employees]) ? $employees_bg[$employees] : $employees;
    $turnover_txt = isset($turnover_bg[$turnover]) ? $turnover_bg[$turnover] : $turnover;

    $partner_txt = $partner === 'yes' ? 'Да' : 'Не';
    $sole_provider_txt = $sole_provider === 'yes' ? 'Да' : 'Не';
    $public_provider_txt = $public_provider === 'yes' ? 'Да' : 'Не';

    // Algorithmic evaluation
    $belongsToNIS2 = false;
    $belongsToDORA = false;
    $category_result = 'safe';

    if ($sector === 'finance') {
        $belongsToDORA = true;
        $category_result = 'dora';
    } elseif ($sector === 'ict-finance') {
        $belongsToDORA = true;
        $category_result = 'dora-vendor';
    }

    $isMediumOrLarge = ($employees === 'medium' || $employees === 'large') || ($turnover === 'medium-f' || $turnover === 'large-f');
    $isLarge = ($employees === 'large' && ($turnover === 'medium-f' || $turnover === 'large-f'));

    if (!$belongsToDORA) {
        if ($sector === 'highly-critical' || $sector === 'digital-infra') {
            if ($isMediumOrLarge) {
                $belongsToNIS2 = true;
                $category_result = $isLarge ? 'essential' : 'important';
            } elseif ($public_provider === 'yes' || $sole_provider === 'yes') {
                $belongsToNIS2 = true;
                $category_result = 'essential';
            }
        } elseif ($sector === 'critical-other' || $sector === 'digital-providers') {
            if ($isMediumOrLarge) {
                $belongsToNIS2 = true;
                $category_result = 'important';
            }
        } elseif ($sector === 'public-admin') {
            $belongsToNIS2 = true;
            $category_result = 'essential';
        }
    }

    if (!$belongsToNIS2 && !$belongsToDORA) {
        if ($partner === 'yes') {
            $category_result = 'indirect';
        } else {
            $category_result = 'safe';
        }
    }

    // Text status translation
    $status_names = [
        'essential' => '🚨 Съществен Субект (Essential Entity) по NIS2',
        'important' => '⚠️ Важен Субект (Important Entity) по NIS2',
        'dora' => '🏦 Финансово съответствие по DORA',
        'dora-vendor' => '⚙️ Критичен ИКТ доставчик по DORA',
        'indirect' => '🔗 Влияние по веригата на доставки (Supply Chain)',
        'safe' => '🛡️ Минимален регулаторен риск'
    ];
    $status_txt = isset($status_names[$category_result]) ? $status_names[$category_result] : 'Неопределен';

    $subject = "Изпратен тест за NIS2 & DORA съответствие от {$company}";

    // HTML mail template
    $mailBody = "
    <html>
    <head>
        <title>{$subject}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050811; color: #ffffff; padding: 20px; }
            .container { background-color: #0a0f1e; border: 1px solid #00f0ff; border-radius: 8px; padding: 25px; box-shadow: 0 0 15px rgba(0, 240, 255, 0.15); }
            h2 { color: #00f0ff; border-bottom: 2px solid #ff3838; padding-bottom: 10px; margin-top: 0; }
            h3 { color: #ff3838; border-bottom: 1px solid #1a243a; padding-bottom: 5px; margin-top: 20px; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #a0a0a0; font-size: 13px; }
            .value { background-color: #050811; padding: 8px 12px; border-radius: 4px; border: 1px solid #1a243a; font-weight: bold; margin-top: 3px; }
            .result-box { background: rgba(0, 240, 255, 0.05); border: 2px solid #00f0ff; padding: 15px; border-radius: 6px; font-size: 16px; margin-top: 15px; }
            .footer { margin-top: 25px; font-size: 11px; color: #666666; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>📊 NIS2 & DORA Оценка за Съответствие</h2>

            <h3>📋 1. Контактна информация</h3>
            <div class='field'>
                <div class='label'>Фирма / Организация:</div>
                <div class='value'>{$company}</div>
            </div>
            <div class='field'>
                <div class='label'>Лице за контакт:</div>
                <div class='value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='label'>Имейл адрес:</div>
                <div class='value'><a href='mailto:{$email}' style='color: #00f0ff; text-decoration: none;'>{$email}</a></div>
            </div>
            <div class='field'>
                <div class='label'>Телефон за връзка:</div>
                <div class='value'>{$phone}</div>
            </div>

            <h3>🔍 2. Параметри на организацията</h3>
            <div class='field'>
                <div class='label'>Сектор на дейност:</div>
                <div class='value'>{$sector_txt}</div>
            </div>
            <div class='field'>
                <div class='label'>Брой служители (персонал):</div>
                <div class='value'>{$employees_txt}</div>
            </div>
            <div class='field'>
                <div class='label'>Годишен оборот / Баланс:</div>
                <div class='value'>{$turnover_txt}</div>
            </div>
            <div class='field'>
                <div class='label'>Доставчик на големи регулирани компании (Supply chain):</div>
                <div class='value'>{$partner_txt}</div>
            </div>
            <div class='field'>
                <div class='label'>Единствен/критичен доставчик на държавно ниво:</div>
                <div class='value'>{$sole_provider_txt}</div>
            </div>
            <div class='field'>
                <div class='label'>Публичен доставчик на ел. мрежи/DNS:</div>
                <div class='value'>{$public_provider_txt}</div>
            </div>

            <h3>🎯 3. Изчислен регулаторен статус</h3>
            <div class='result-box'>
                <strong>Резултат:</strong> {$status_txt}
            </div>

            <div class='footer'>
                Този анализ беше генериран и криптиран през интелигентния уизард на DefComs.eu.
            </div>
        </div>
    </body>
    </html>";

    if (sendEmail(RECIPIENT_EMAIL, $subject, $mailBody, $email)) {
        echo json_encode([
            'status' => 'success',
            'category' => $category_result,
            'belongsToNIS2' => $belongsToNIS2,
            'belongsToDORA' => $belongsToDORA,
            'message' => 'Вашият тест беше успешно изпратен до нашия екип. Генерираме резултатите на екрана...'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Възникна сървърна грешка при обработка на резултатите от теста.'
        ], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * Safely clean inputs from scripts & HTML injection
 */
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Helper to send email securely via PHP mail()
 */
function sendEmail($to, $subject, $message, $replyTo) {
    // UTF-8 Subject encoding
    $encodedSubject = "=?utf-8?B?" . base64_encode($subject) . "?=";

    // Strict headers setup
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    $headers .= "From: DefComs Portal <noreply@defcoms.eu>\r\n";
    if ($replyTo) {
        $headers .= "Reply-To: {$replyTo}\r\n";
    }
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    // Call native mail function
    return mail($to, $encodedSubject, $message, $headers);
}
