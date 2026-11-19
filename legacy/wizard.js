/**
 * DefComs - Interactive NIS2 and DORA Compliance Wizard
 */

let currentStep = 1;
const totalSteps = 3;
let assessmentStarted = false;
let assessmentCompleted = false;

function trackAssessmentEvent(eventName) {
    if (!/^https?:$/.test(location.protocol)) return;
    if (localStorage.getItem('cookie_consent') !== 'accepted') return;
    const payload = new URLSearchParams({ event_name: eventName, page: location.pathname });
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/analytics/event.php', payload);
    } else {
        fetch('/analytics/event.php', { method: 'POST', body: payload, keepalive: true });
    }
}

function markAssessmentStart() {
    if (!assessmentStarted) {
        assessmentStarted = true;
        trackAssessmentEvent('assessment_start');
    }
}

window.addEventListener('pagehide', () => {
    if (assessmentStarted && !assessmentCompleted) {
        trackAssessmentEvent('assessment_abandon');
    }
});

// Selection handler for custom Radio buttons
    document.addEventListener('click', event => {
        const cta = event.target.closest('[data-assessment-event], #results-content a');
        if (!cta) return;
        trackAssessmentEvent(cta.dataset.assessmentEvent || 'assessment_cta_click');
    });
function selectRadio(name, value, element) {
    markAssessmentStart();
    // Deselect other cards in the same group
    const parent = element.parentElement;
    parent.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Select the clicked card
    element.classList.add('selected');

    // Update the hidden input
    const hiddenInput = document.getElementById(`selected-${name}`);
    if (hiddenInput) {
        hiddenInput.value = value;
    }
}

// Toggle handler for custom Checkboxes
function toggleCheckbox(id, element) {
    markAssessmentStart();
    element.classList.toggle('selected');

    const hiddenInput = document.getElementById(`chk-${id}`);
    if (hiddenInput) {
        if (element.classList.contains('selected')) {
            hiddenInput.value = 'yes';
        } else {
            hiddenInput.value = 'no';
        }
    }
}

// Navigation Step switching
function navigateStep(direction) {
    // Validate inputs before going forward
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');

    // Update step counter
    currentStep += direction;

    if (currentStep > totalSteps) {
        assessmentCompleted = true;
        trackAssessmentEvent('assessment_complete');
        document.getElementById('step-results').classList.add('active');
        document.getElementById('wizard-nav-panel').style.display = 'none';
        updateProgressBar(100);
        document.querySelectorAll('.wizard-step-lbl').forEach(lbl => lbl.classList.remove('active'));
        calculateResults();
        const contactSection = document.getElementById('assessment-contact');
        if (contactSection) contactSection.hidden = false;
    } else {
        // Show next/prev step
        document.getElementById(`step-${currentStep}`).classList.add('active');

        // Show/Hide back button
        const prevBtn = document.getElementById('prev-btn');
        if (currentStep > 1) {
            prevBtn.style.visibility = 'visible';
        } else {
            prevBtn.style.visibility = 'hidden';
        }

        // Change Next button text to submit on final step
        const nextBtn = document.getElementById('next-btn');
        nextBtn.textContent = currentStep === totalSteps ? 'Виж предварителния резултат' : 'Напред →';

        // Update progress bar
        const progressPercentage = ((currentStep - 1) / totalSteps) * 100;
        updateProgressBar(progressPercentage);

        // Update Indicators
        updateIndicators();
    }
}

// Update Indicators state
function updateIndicators() {
    document.querySelectorAll('.wizard-step-lbl').forEach((lbl, idx) => {
        if (idx + 1 === currentStep) {
            lbl.classList.add('active');
        } else {
            lbl.classList.remove('active');
        }
    });
}

// Update Progress Bar
function updateProgressBar(percentage) {
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Input validation before proceeding
function validateCurrentStep() {
    if (currentStep === 1) {
        const sector = document.getElementById('selected-sector').value;
        if (!sector) {
            alert('Моля, изберете сектор на дейност на Вашата организация, за да продължите.');
            return false;
        }
    } else if (currentStep === 2) {
        const employees = document.getElementById('selected-employees').value;
        const turnover = document.getElementById('selected-turnover').value;
        if (!employees || !turnover) {
            alert('Моля, изберете брой служители и годишен оборот на Вашата фирма.');
            return false;
        }
    }
    return true;
}

// Preliminary orientation only; this is not a legal applicability decision.
function calculateResults() {
    const sector = document.getElementById('selected-sector').value;
    const employees = document.getElementById('selected-employees').value;
    const turnover = document.getElementById('selected-turnover').value;

    const isPartner = document.getElementById('chk-partner').value === 'yes';
    const isSoleProvider = document.getElementById('chk-sole-provider').value === 'yes';
    const isPublicProvider = document.getElementById('chk-public-provider').value === 'yes';

    let belongsToNIS2 = false;
    let belongsToDORA = false;
    let category = ''; // 'essential', 'important', 'dora', 'dora-vendor', 'indirect', 'safe'

    // 1. Check for DORA
    if (sector === 'finance') {
        belongsToDORA = true;
        category = 'dora';
    } else if (sector === 'ict-finance') {
        belongsToDORA = true;
        category = 'dora-vendor';
    }

    // 2. Check for NIS2
    // Large and medium companies in Highly Critical and Critical sectors fall under NIS2
    const isMediumOrLarge = (employees === 'medium' || employees === 'large') || (turnover === 'medium-f' || turnover === 'large-f');
    const isLarge = (employees === 'large' && (turnover === 'medium-f' || turnover === 'large-f'));

    if (!belongsToDORA) {
        if (sector === 'highly-critical' || sector === 'digital-infra') {
            if (isMediumOrLarge) {
                belongsToNIS2 = true;
                category = isLarge ? 'essential' : 'important';
            } else if (isPublicProvider || isSoleProvider) {
                // Micro/small providers of public telecom, DNS, TLD are always Essential under NIS2
                belongsToNIS2 = true;
                category = 'essential';
            }
        } else if (sector === 'critical-other' || sector === 'digital-providers') {
            if (isMediumOrLarge) {
                belongsToNIS2 = true;
                category = 'important';
            }
        } else if (sector === 'public-admin') {
            belongsToNIS2 = true;
            category = 'essential';
        }
    }

    // 3. Check for supply chain / indirect compliance
    if (!belongsToNIS2 && !belongsToDORA) {
        if (isPartner) {
            category = 'indirect';
        } else {
            category = 'safe';
        }
    }

    renderResults(category, belongsToNIS2, belongsToDORA);
}

// Render Results Page dynamically
function renderResults(category, belongsToNIS2, belongsToDORA) {
    const container = document.getElementById('results-content');
    let badgeClass = '';
    let statusText = '';
    let icon = '';
    let title = '';
    let text = '';
    let services = [];

    if (category === 'essential') {
        badgeClass = 'status-critical';
        statusText = 'Предварителен сигнал: възможен обхват NIS2';
        icon = '🚨';
        title = 'Отговорите ви показват възможна приложимост на NIS2';
        text = `Избраните секторни и размерни критерии могат да съответстват на организации, които попадат в обхвата на NIS2. Въпросникът не проверява всички критерии, изключения, национални правила или правния статус на организацията. Проверете конкретния субект и дейност преди извод за приложимост.`;
        services = ['soc', 'gdpr_compliance', 'incident_response', 'pentest'];
    } else if (category === 'important') {
        badgeClass = 'status-critical';
        statusText = 'Предварителен сигнал: възможен обхват NIS2';
        icon = '⚠️';
        title = 'Отговорите ви показват възможна приложимост на NIS2';
        text = `Избраните секторни и размерни критерии могат да съответстват на организации, които попадат в обхвата на NIS2. Въпросникът не проверява всички критерии, изключения, национални правила или правния статус на организацията. Проверете конкретния субект и дейност преди извод за приложимост.`;
        services = ['soc', 'gdpr_compliance', 'pentest', 'cloud_security'];
    } else if (category === 'dora') {
        badgeClass = 'status-critical';
        statusText = 'Предварителен сигнал: възможен обхват DORA';
        icon = '🏦';
        title = 'Отговорите ви показват възможна приложимост на DORA';
        text = `Изборът на финансов сектор може да е свързан с обхвата на DORA, но регламентът съдържа конкретни определения, типове субекти, изключения и пропорционални изисквания. Потвърдете статуса на юридическото лице и дейността му спрямо актуалните официални правила.`;
        services = ['soc', 'gdpr_compliance', 'pentest', 'backup_recovery'];
    } else if (category === 'dora-vendor') {
        badgeClass = 'status-warning';
        statusText = 'Предварителен сигнал: проверете ICT доставчик изискванията по DORA';
        icon = '⚙️';
        title = 'Възможна е връзка с изискванията за ICT доставчици по DORA';
        text = `Предоставянето на ICT услуги на финансови организации може да има отношение към договорните и third-party risk изисквания на DORA. Това само по себе си не означава, че компанията е определен критичен ICT third-party provider или е пряко под надзор. Конкретният статус изисква отделна проверка.`;
        services = ['soc', 'pentest', 'cloud_security', 'supply_chain'];
    } else if (category === 'indirect') {
        badgeClass = 'status-warning';
        statusText = 'Предварителен сигнал: проверете изискванията по веригата на доставки';
        icon = '🔗';
        title = 'Отговорите ви подсказват възможна експозиция във веригата на доставки';
        text = `Ролята ви на доставчик може да има отношение към договорни и клиентски изисквания за сигурност. Тя сама по себе си не установява пряка приложимост на NIS2 или DORA към вашата организация.`;
        services = ['endpoint_security', 'phishing_simulations', 'supply_chain', 'ransomware_prevention'];
    } else {
        badgeClass = 'status-safe';
        statusText = 'Не е установен очевиден сигнал по избраните отговори';
        icon = '🛡️';
        title = 'Въпросникът не показва очевиден сигнал по избраните критерии';
        text = `Това не доказва, че NIS2 или DORA не се прилагат към организацията. Въпросникът е опростен и може да пропусне специални категории, национални правила, групови отношения или други релевантни факти. Потвърдете извода по официалните източници.`;
        services = ['endpoint_security', 'phishing_simulations', 'ransomware_prevention', 'backup_recovery'];
    }

    // Generate Recommended Services HTML
    let servicesHTML = '';
    const servicesDb = {
        soc: {
            icon: '👁️',
            title: 'SOC Мониторинг 24/7/365',
            desc: 'Непрекъснато денонощно наблюдение, откриване и мигновена неутрализация на заплахи от нашия Security Operations Center.'
        },
        gdpr_compliance: {
            icon: '📁',
            title: 'GDPR/NIS2/DORA Съответствие',
            desc: 'Технически контроли, изчерпателно изготвяне на документация и подготовка за одити по европейските регулации.'
        },
        incident_response: {
            icon: '⚡',
            title: 'Incident Response',
            desc: 'Светкавично реагиране при инциденти, изолиране на компрометирани ресурси и бързо възстановяване.'
        },
        pentest: {
            icon: '🕵️',
            title: 'Penetration Testing (Пентест)',
            desc: 'Етични и контролирани симулации на реални хакерски атаки за намиране на критични пропуски във Вашата ИТ среда.'
        },
        cloud_security: {
            icon: '☁️',
            title: 'Cloud Security & Одити',
            desc: 'Защита и конфигурационен одит на Вашите облачни среди и ресурси (AWS, Azure, GCP, DigitalOcean).'
        },
        endpoint_security: {
            icon: '💻',
            title: 'Endpoint Security (EDR)',
            desc: 'Ново поколение поведенческа защита на крайните устройства на служителите за спиране на безфайлови атаки.'
        },
        phishing_simulations: {
            icon: '🎣',
            title: 'Phishing Симулации & Обучение',
            desc: 'Регулярни контролирани симулации за обучение на служителите и превръщането им в човешки firewall.'
        },
        ransomware_prevention: {
            icon: '🔒',
            title: 'Ransomware Превенция',
            desc: 'Многослойна архитектурна стратегия и мрежова сегментация за нулева толерантност към криптиращ софтуер.'
        },
        backup_recovery: {
            icon: '💾',
            title: 'Backup & Disaster Recovery',
            desc: 'Защитен бекъп по златното правило 3-2-1 с бързи автоматизирани процедури за спешно възстановяване.'
        },
        supply_chain: {
            icon: '🔗',
            title: 'Supply Chain Security',
            desc: 'Оценка на риска от външен софтуер и сигурност по цялата Ваша софтуерна верига на доставки.'
        }
    };

    services.forEach(srvKey => {
        const srv = servicesDb[srvKey];
        if (srv) {
            servicesHTML += `
                <div class="rec-service-card">
                    <div class="rec-service-header">
                        <span class="rec-service-icon">${srv.icon}</span>
                        <h4>${srv.title}</h4>
                    </div>
                    <p>${srv.desc}</p>
                </div>
            `;
        }
    });

    container.innerHTML = `
        <div class="results-icon">${icon}</div>
        <div class="results-status-badge ${badgeClass}">${statusText}</div>
        <h2 class="results-title">${title}</h2>
        <p class="results-text">${text}</p>
        <p class="results-text assessment-disclaimer"><strong>Важно:</strong> Това е автоматизирана, предварителна информационна индикация, а не правен съвет, официална класификация или пълен compliance assessment. Проверете актуалните правила и конкретните факти на организацията.</p>

        <h3 class="recommended-services-title">Препоръчителни Услуги за Вашата Сигурност</h3>
        <div class="recommended-grid">
            ${servicesHTML}
        </div>

        <div class="results-cta-box">
            <h3>Имате нужда от съдействие за покриване на стандартите?</h3>
            <p>Разгледайте услугата ни и официалните източници. Ако желаете личен контакт, можете по избор да попълните формуляра по-долу.</p>
            <a href="nis2-dora-compliance.html" class="btn btn-secondary">NIS2 и DORA услуги</a>
            <p><a href="https://eur-lex.europa.eu/eli/dir/2022/2555/oj" target="_blank" rel="noopener noreferrer">Официален текст на NIS2 ↗</a> · <a href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj" target="_blank" rel="noopener noreferrer">Официален текст на DORA ↗</a></p>
        </div>
    `;
}

// Automatically bind option card elements clicked triggers inside Wizard to maintain state
document.addEventListener('DOMContentLoaded', () => {
    // Make sure wizard starts properly
    updateProgressBar(0);
    const contactSection = document.getElementById('assessment-contact');
    const submitButton = document.getElementById('assessment-submit');
    if (contactSection && submitButton) {
        contactSection.hidden = true;
        submitButton.addEventListener('click', submitAssessmentLead);
    }
});

function submitAssessmentLead() {
    const status = document.getElementById('assessment-form-status');
    const name = document.getElementById('wizard-name').value.trim();
    const email = document.getElementById('wizard-email').value.trim();
    const company = document.getElementById('wizard-company').value.trim();
    const phone = document.getElementById('wizard-phone').value.trim();

    if (!name || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Въведете име, валиден имейл и организация, за да изпратите запитване.';
        return;
    }

    const formData = new FormData(document.getElementById('wizard-form'));
    formData.set('form_type', 'assessment_lead');
    formData.set('phone', phone);
    status.textContent = 'Изпращане…';

    fetch('/send_form.php', { method: 'POST', body: formData })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
            if (!ok || data.status !== 'success') {
                throw new Error(data.message || 'Изпращането не беше успешно.');
            }
            status.textContent = 'Благодарим. Запитването ви е изпратено.';
            trackAssessmentEvent('assessment_lead_submitted');
            document.getElementById('assessment-submit').disabled = true;
        })
        .catch(error => {
            status.textContent = error.message || 'Не успяхме да изпратим запитването. Опитайте отново.';
        });
}