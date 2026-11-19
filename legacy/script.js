// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

if (hamburger && navMenu && mobileNavOverlay) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));

        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on overlay
    mobileNavOverlay.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.getElementById(this.getAttribute('href').slice(1));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background change and scroll shadowing
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (header && window.scrollY > 50) {
        header.classList.add('scrolled');
    } else if (header) {
        header.classList.remove('scrolled');
    }
});

// Compliance / Regulations Directory Tab Switching
const compTabBtns = document.querySelectorAll('.comp-tab-btn');
const compCards = document.querySelectorAll('.comp-card');

compTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle Active Class on Button
        compTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter Cards
        const selectedCat = btn.getAttribute('data-category');
        compCards.forEach(card => {
            if (card.getAttribute('data-cat') === selectedCat) {
                card.classList.add('show');
            } else {
                card.classList.remove('show');
            }
        });
    });
});

// Sentinel OS Showcase Interactive Switching
const showcaseTabs = document.querySelectorAll('.showcase-tab');
const sentinelImg = document.getElementById('sentinel-img');
const sentinelTitle = document.getElementById('sentinel-title');

showcaseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove Active from other tabs
        showcaseTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Apply Image Switch Transition
        sentinelImg.classList.add('changing');

        setTimeout(() => {
            const newImgSrc = tab.getAttribute('data-img');
            const newTitle = tab.getAttribute('data-title');

            sentinelImg.src = newImgSrc;
            sentinelTitle.textContent = newTitle;

            sentinelImg.classList.remove('changing');
        }, 200);
    });
});

// Blog / Articles Category Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const articleCards = document.querySelectorAll('.article-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        articleCards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (filterValue === 'all' || category === filterValue) {
                card.classList.add('show');
                card.style.display = 'flex';
            } else {
                card.classList.remove('show');
                card.style.display = 'none';
            }
        });
    });
});

// Detailed Articles Data Base
const articlesDatabase = {
    art1: {
        title: "Защо киберсигурността е необходимост, а не лукс",
        category: "За Бизнеса",
        content: `
            <p><strong>Киберсигурността вече не е просто въпрос на ИТ управление. Тя е критична част от бизнес стратегията за оцеляване.</strong></p>
            <p>Във времена на тотална дигитализация, защитата на данните и активите на клиентите определя успеха на всяка модерна фирма. Нападателите използват автоматизирани инструменти и изкуствен интелект (AI), което означава, че никоя организация не е прекалено малка, за да бъде атакувана.</p>
            <p>Когато избирате партньор в киберсигурността, трябва да търсите екип, който предлага:</p>
            <ul>
                <li>Реален практически опит в отблъскването на реални атаки;</li>
                <li>Денонощен 24/7/365 активен мониторинг (SOC);</li>
                <li>Индивидуален анализ на риска, съобразен с дейността на фирмата ви;</li>
                <li>Комплексен подход – от защитата на крайните точки до обучения за персонала.</li>
            </ul>
            <p>Инвестицията в сигурност е инвестиция в репутация, доверие от страна на вашите клиенти и дългосрочно спокойствие. С DefComs вие получавате всичко това, без разходите по изграждане на собствен SOC отдел от нулата.</p>
        `
    },
    art2: {
        title: "Защо аутсорсването на SOC е по-изгодно от вътрешен екип",
        category: "За Бизнеса",
        content: `
            <p><strong>Изграждането на вътрешен Security Operations Center (SOC) е колосална инвестиция, непосилна за повечето организации.</strong></p>
            <p>За денонощно покритие вътрешният SOC обичайно изисква екип за смени, подходящи технологии и постоянна поддръжка. Конкретният състав зависи от обхвата и модела на работа.</p>
            <p><strong>Предимствата на аутсорсинга с DefComs:</strong></p>
            <ul>
                <li><strong>Разпределение на ресурсите:</strong> Външната услуга може да намали нуждата от самостоятелно изграждане и поддържане на SOC; разходът зависи от договорения обхват;</li>
                <li><strong>Планиране на старта:</strong> Срокът за интеграция със Sentinel OS се уточнява след оценка на средата и необходимите източници на данни;</li>
                <li><strong>Поддръжка на услугата:</strong> Обхватът на мониторинга и актуализациите се определя от договорените процеси и отговорности.</li>
            </ul>
            <p>Фокусирайте се върху развитието на бизнеса си, като използвате SOC услуга с предварително договорен обхват и отговорности.</p>
        `
    },
    art3: {
        title: "Как киберсигурността влияе върху доверието и растежа на бизнеса",
        category: "За Бизнеса",
        content: `
            <p><strong>Доверието на клиентите е най-ценният и най-трудно спечелен актив за всяка компания.</strong></p>
            <p>Когато клиентите ви доверяват своята финансова информация, лични данни и бизнес тайни, те очакват безкомпромисна защита. Един-единствен успешен пробив може да унищожи репутацията, изграждана с години, и да доведе до масово напускане на клиенти в полза на конкуренти, които демонстрират по-висока зрялост по отношение на сигурността.</p>
            <p><strong>Как киберсигурността стимулира бизнес растежа:</strong></p>
            <ul>
                <li><strong>Изисквания на партньори:</strong> Сертификат ISO 27001 или договорени мерки за сигурност могат да бъдат част от изискванията на клиенти и партньори;</li>
                <li><strong>Намаляване на застрахователните премии:</strong> Застрахователите предлагат много по-изгодни условия за киберзастраховане на компании с активна защита;</li>
                <li><strong>Инвестиционна привлекателност:</strong> Инвеститорите и партньорите оценяват много по-високо компании, които имат нисък риск от оперативно прекъсване на дейността поради кибератаки.</li>
            </ul>
            <p>В DefComs превръщаме киберсигурността от пасивен разход в стратегическо бизнес предимство, което директно подпомага вашия растеж и пазарно лидерство.</p>
        `
    },
    art4: {
        title: "Истинската цена на една кибератака: Какво плащате извън откупа",
        category: "За Бизнеса",
        content: `
            <p><strong>Много собственици на бизнес вярват, че цената на една рансъмуер атака се изчерпва с размера на искания откуп. Действителността обаче е много по-разрушителна.</strong></p>
            <p>Според глобални анализи, директният откуп представлява едва 15-20% от общите финансови загуби за компанията след пробив в сигурността. Останалата част от цената се състои от скрити и дългосрочни разходи.</p>
            <p><strong>Какво плащате всъщност:</strong></p>
            <ul>
                <li><strong>Оперативен престой (Downtime):</strong> Всеки час, в който вашите системи не работят, служителите ви не могат да изпълняват задълженията си, а клиентите ви не получават услуги, носи директни загуби;</li>
                <li><strong>Правни глоби и санкции:</strong> Несъответствието с GDPR, NIS2 или националния Закон за киберсигурност води до тежки санкции от регулаторните органи;</li>
                <li><strong>Разходи за разследване и възстановяване:</strong> Наемането на специализирани екипи за дигитална криминалистика, подмяната на компрометиран хардуер и пренастройването на софтуерни системи изискват значителни извънредни средства;</li>
                <li><strong>Дългосрочно репутационно сриване:</strong> Загубата на интелектуална собственост и бизнес договори, съчетана с публичния отзвук, може да доведе до фалит на организацията в рамките на 6 месеца след инцидента.</li>
            </ul>
            <p>Предотвратяването на инциденти винаги е многократно по-евтино от тяхното отстраняване. DefComs ви осигурява надежден щит срещу тези пагубни финансови последици.</p>
        `
    },
    art5: {
        title: "Киберрискът като въпрос за ръководството — как да говорим на езика на бизнеса",
        category: "За Бизнеса",
        content: `
            <p><strong>Време е киберсигурността да напусне затворените стаи на ИТ отделите и да заеме своето централно място на масата на борда на директорите.</strong></p>
            <p>Киберрискът не е просто технически въпрос – той е фундаментален бизнес риск, равен по значение на финансовия, правния или пазарния риск. Мениджмънтът на компаниите носи персонална и солидарна отговорност за защитата на активите и непрекъснатостта на бизнес процесите.</p>
            <p><strong>Ключови теми за дискусия на управленско ниво:</strong></p>
            <ul>
                <li><strong>Анализ на бизнес въздействието (BIA):</strong> Колко време може да оцелее бизнесът ни без достъп до критичните бази данни? Какъв е максимално допустимият престой?;</li>
                <li><strong>Разпределение на бюджета:</strong> Инвестираме ли в сигурност пропорционално на стойността на дигиталните ни активи?;</li>
                <li><strong>Управление на съответствието:</strong> Отговаря ли организацията ни на европейските стандарти (NIS2, GDPR, DORA) и какви са личните ни отговорности като управители при пробив?.</li>
            </ul>
            <p>DefComs предоставя на ръководителите ясни, разбираеми бизнес отчети и анализи на риска. Ние ви помагаме да вземате информирани и стратегически решения, превръщайки техническите данни в ясни бизнес аргументи.</p>
        `
    },
    art6: {
        title: "Киберзастраховане и ролята на техническата готовност",
        category: "За Бизнеса",
        content: `
            <p><strong>Киберзастраховането бързо се превръща в стандарт за модерните компании, но получаването на полица вече не е толкова лесно.</strong></p>
            <p>Изискванията за киберзастраховане се различават между застрахователите и зависят от вида, размера и риска на организацията. Проверявайте актуалните условия директно с избрания застраховател.</p>
            <p><strong>Какво изискват застрахователите от техническата ви защита:</strong></p>
            <ul>
                <li><strong>Задължителна Мултифакторна автентикация (MFA):</strong> За всички потребители и особено за отдалечен достъп (VPN/RDP);</li>
                <li><strong>Регулярни тестове за проникване (Penetration Testing):</strong> Провеждани от квалифицирани изпълнители с предварително писмено разрешение и договорен обхват;</li>
                <li><strong>Внедрена EDR (Endpoint Detection and Response) технология:</strong> На всички сървъри и работни станции;</li>
                <li><strong>Изолирани офлайн бекъпи:</strong> Могат да подпомогнат възстановяването; резултатът зависи от целостта на копията и редовното тестване.</li>
            </ul>
            <p>DefComs може да подпомогне техническата оценка, планирането на контроли и подготовката на документация. Изискванията и решението за застраховане се определят от съответния застраховател; подготовката не гарантира одобрение или конкретни условия.</p>
        `
    },
    art7: {
        title: "Phishing Заплахата: Как да изградим силен човешки firewall",
        category: "Технически",
        content: `
            <p><strong>Фишинг съобщенията могат да бъдат използвани за кражба на идентификационни данни, разпространение на зловреден софтуер или измама.</strong></p>
            <p>Фишингът е сред най-старите, но и най-ефективните вектори на атака, тъй като таргетира най-слабото звено в сигурността – човешкия фактор. Нападателите имитират легитимни банкови съобщения, фактури от доставчици или дори вътрешни съобщения от мениджмънта.</p>
            <p><strong>Основни мерки за защита, които DefComs препоръчва и внедрява:</strong></p>
            <ul>
                <li><strong>Мултифакторна автентикация (MFA):</strong> Дори и паролата на ваш служител да бъде открадната, вторият фактор предотвратява неоторизиран достъп;</li>
                <li><strong>Симулирани фишинг кампании:</strong> Редовни контролирани тренировки за тестване на бдителността на екипа;</li>
                <li><strong>Технически филтри:</strong> Внедряване на модерни SPF, DKIM и DMARC протоколи за проверка на входящите писма.</li>
            </ul>
            <p>Киберхигиената е общ ангажимент на цялата компания. Обученият и бдителен служител е последната и най-надеждна линия на защита.</p>
        `
    },
    art8: {
        title: "Ransomware: Как да се защитим и да запазим данните си",
        category: "Технически",
        content: `
            <p><strong>Ransomware (криптиращият софтуер) е най-големият генератор на финансови загуби за съвременния бизнес.</strong></p>
            <p>Веднъж проникнал в мрежата, този зловреден код криптира файловете на сървърите и изисква огромен откуп в криптовалута за предоставяне на ключ. Плащането на откупа обаче не гарантира получаването на ключа или възстановяването на дейността.</p>
            <p><strong>Как изглежда надеждната защита срещу Ransomware?</strong></p>
            <ul>
                <li><strong>Правило за бекъп 3-2-1:</strong> Съхранявайте поне три копия от данните си, на два различни физически носителя, като поне едното копие е напълно изолирано (офлайн) от фирмената мрежа;</li>
                <li><strong>EDR решения за защита:</strong> Интелигентните антивируси от ново поколение улавят необичайни действия, като масово криптиране на файлове, и незабавно изолират машината;</li>
                <li><strong>Мрежова сегментация:</strong> Разделянето на мрежата на отделни виртуални подмрежи спира страничното разпространение на вируса.</li>
            </ul>
            <p>Не чакайте да станете жертва, за да помислите за вашите бекъпи. Свържете се с DefComs, за да изградим устойчив план за възстановяване.</p>
        `
    },
    art9: {
        title: "Zero Trust архитектура: Моделът за сигурност на утрешния ден",
        category: "Технически",
        content: `
            <p><strong>Традиционната концепция за защита на "периметъра" на мрежата вече е мъртва.</strong></p>
            <p>В света на дистанционната работа и облачните услуги, заплахите могат да възникнат отвсякъде. Моделът "Zero Trust" (Нулево доверие) се основава на простата максима: <em>никога не се доверявай, винаги проверявай</em>.</p>
            <p><strong>Основни стълбове на Zero Trust:</strong></p>
            <ul>
                <li><strong>Микросегментация:</strong> Ограничаване на достъпа на потребителите само до тези приложения и ресурси, които са абсолютно необходими за текущата им задача (least privilege);</li>
                <li><strong>Непрекъсната автентикация:</strong> Постоянна оценка на риска, проверка на устройството и местоположението при всяка заявка за достъп;</li>
                <li><strong>Мониторинг на трафика:</strong> Всеки пакет в мрежата се проверява за аномалии и заплахи.</li>
            </ul>
            <p>DefComs внедрява модерни Zero Trust концепции, за да направи защитата на вашия бизнес адаптивна и непробиваема, независимо къде се намират вашите служители.</p>
        `
    },
    art10: {
        title: "Тестове за проникване (Penetration Testing) — открийте пропуските първи",
        category: "Технически",
        content: `
            <p><strong>Най-добрата защита е атаката. За да защитите системите си ефективно, трябва да погледнете на тях през очите на реален нападател.</strong></p>
            <p>Тестовете за проникване (пентестове), извършвани от етичните хакери на DefComs, симулират контролирана кибератака срещу вашата уеб платформа, вътрешна мрежа или мобилни приложения. Нашата цел е да намерим пробойните в защитата преди злонамерените хакери да ги експлоатират за кражба на данни или саботаж.</p>
            <p><strong>Как протича един професионален пентест:</strong></p>
            <ul>
                <li><strong>Разузнаване и планиране:</strong> Анализираме публично достъпната информация за организацията и картографираме повърхността за атака;</li>
                <li><strong>Сканиране за уязвимости:</strong> Използваме автоматизирани и ръчни техники за идентифициране на остарял софтуер, грешни конфигурации и логически пропуски в кода;</li>
                <li><strong>Експлоатация (с повишено внимание):</strong> Опитваме се да проникнем контролирано в защитените зони, доказвайки критичността на намерените уязвимости;</li>
                <li><strong>Подробен технически доклад:</strong> Предоставяме детайлен отчет с приоритизиран списък от уязвимости и конкретни стъпки за тяхното отстраняване (remediation).</li>
            </ul>
            <p>Пентестовете могат да бъдат част от оценката на сигурността и да се изискват от конкретни стандарти или договори. Те дават резултат за проверения обхват и момент и не гарантират липса на други уязвимости.</p>
        `
    },
    art11: {
        title: "Сигурност на IoT устройства в мрежата: Новите входни точки за хакери",
        category: "Технически",
        content: `
            <p><strong>Умните камери, термостати, принтери и индустриални сензори улесняват ежедневието ни, но представляват огромна заплаха за сигурността.</strong></p>
            <p>Повечето IoT (Internet of Things) и IIoT (Industrial IoT) устройства са проектирани с фокус върху функционалността и евтиното производство, а сигурността им често е оставена на заден план. Те обикновено имат твърдо кодирани фабрични пароли, остарели операционни системи и не поддържат стандартни антивирусни агенти.</p>
            <p><strong>Как да защитим IoT екосистемата си:</strong></p>
            <ul>
                <li><strong>Пълна инвентаризация:</strong> Не можете да защитите това, което не знаете, че съществува. Идентифицирайте всяко свързано устройство в мрежата си;</li>
                <li><strong>Мрежова изолация:</strong> Всички IoT устройства трябва да се разположат в отделна, изолирана виртуална мрежа (VLAN) без директен достъп до корпоративните сървъри и бази данни;</li>
                <li><strong>Промяна на фабричните настройки:</strong> Смяната на дефолтните пароли с уникални и силни е първата критична стъпка при инсталация;</li>
                <li><strong>Постоянен мониторинг на трафика:</strong> Наблюдение за необичаен мрежов трафик от IoT устройства, което може да е индикатор, че са превърнати в част от ботнет мрежа за DDoS атаки.</li>
            </ul>
            <p>Специалистите на DefComs проектират сигурни мрежови архитектури, които изолират и неутрализират рисковете от IoT устройствата, запазвайки предимствата на свързаността.</p>
        `
    },
    art12: {
        title: "Защита на крайните точки (Endpoint Security) чрез EDR/XDR решения",
        category: "Технически",
        content: `
            <p><strong>В ерата на отдалечената работа, крайните точки (лаптопи, работни станции, мобилни телефони) са основното бойно поле в кибервойната.</strong></p>
            <p>Класическите антивирусни решения често разчитат на сигнатури на познат зловреден софтуер. Допълнителни защитни контроли могат да подпомогнат откриването на нови или безфайлови атаки, но ефективността зависи от продукта и конфигурацията.</p>
            <p><strong>Как EDR (Endpoint Detection and Response) може да допълни защитата:</strong></p>
            <ul>
                <li><strong>Поведенчески анализ:</strong> EDR може да анализира поведението на процесите и да сигнализира за подозрителни действия; откриването и блокирането зависят от конфигурацията и контекста;</li>
                <li><strong>Възстановяване (Rollback):</strong> При успешна инфекция, модерните EDR системи могат да върнат състоянието на файловете към момента преди атаката;</li>
                <li><strong>Интеграция със SOC:</strong> При договорен обхват EDR сигналите могат да бъдат наблюдавани и ескалирани към отговорните лица; действията и сроковете се определят от конфигурацията и договорените процедури.</li>
            </ul>
            <p>EDR/XDR решенията могат да подпомогнат наблюдението и защитата на включените в обхвата устройства. Покритието зависи от внедряването, конфигурацията и поддръжката на системите.</p>
        `
    },
    art13: {
        title: "Как директивата NIS2 променя правилата в България",
        category: "Регулации",
        content: `
            <p><strong>Новата европейска директива NIS2 налага много по-строги стандарти за сигурност, които вече не са пожелателни.</strong></p>
            <p>NIS2 драстично разширява списъка с критични сектори и въвежда персонална отговорност за мениджмънта на фирмите при сериозни киберинциденти. България активно внедрява тези разпоредби в националния Закон за киберсигурност.</p>
            <p><strong>Какво изисква NIS2 от компаниите?</strong></p>
            <ul>
                <li>Системи за ранно откриване на аномалии и задължително докладване на инциденти до 24 часа;</li>
                <li>Оценка и одит на сигурността по цялата верига на доставчици на софтуер и услуги;</li>
                <li>Непрекъснато обучение по киберсигурност за ръководните кадри;</li>
                <li>Разполагане на стабилен план за бизнес непрекъснатост и бекъпи.</li>
            </ul>
            <p>DefComs помага на българския бизнес да отговори безболезнено на всички изисквания чрез пълна софтуерна и юридическа готовност, подготовка на СУИС документи и 24/7/365 технически мониторинг.</p>
        `
    },
    art14: {
        title: "Съответствие с GDPR: Основни изисквания за защита на личните данни",
        category: "Регулации",
        content: `
            <p><strong>Общият регламент за защита на данните (GDPR) е в сила от години, но много организации все още пренебрегват техническата му страна.</strong></p>
            <p>GDPR изисква от всяка компания, която обработва лични данни на граждани на ЕС, да приложи "подходящи технически и организационни мерки" за защита на тези данни. Пропускът да се криптира база данни или липсата на контрол на достъпа може да доведе до огромни глоби - до 20 милиона евро или 4% от годишния оборот на компанията.</p>
            <p><strong>Основни изисквания по GDPR:</strong></p>
            <ul>
                <li><strong>Принцип на минимални привилегии:</strong> Достъп до лични данни трябва да имат само служители, за които това е абсолютно необходимо за работата им;</li>
                <li><strong>Псевдонимизация и криптиране:</strong> Данните трябва да бъдат защитени както при пренос, така и в покой на сървърите;</li>
                <li><strong>Докладване при пробив:</strong> Задължение за уведомяване на Комисията за защита на личните данни (КЗЛД) в рамките на 72 часа след откриване на инцидент;</li>
                <li><strong>Оценка на въздействието (DPIA):</strong> Задължителна процедура при внедряване на нови софтуерни технологии, които носят висок риск за личните данни.</li>
            </ul>
            <p>DefComs комбинира технически експерти и правни консултанти, за да ви осигури цялостно съответствие с GDPR – от мрежовата сигурност и криптирането до изготвянето на нужните правни политики и процедури.</p>
        `
    },
    art15: {
        title: "Стандартът ISO/IEC 27001 — основата на информационната сигурност",
        category: "Регулации",
        content: `
            <p><strong>ISO/IEC 27001 е международно признатият златен стандарт, дефиниращ изискванията за Система за управление на информационната сигурност (СУИС).</strong></p>
            <p>Сертификацията по този стандарт доказва пред вашите клиенти, инвеститори и партньори, че компанията ви управлява сигурността на информацията по систематичен, структуриран и професионален начин, базиран на непрекъснат анализ на рисковете.</p>
            <p><strong>Какво включва изграждането на СУИС по ISO 27001:</strong></p>
            <ul>
                <li><strong>Оценка на активите и рисковете:</strong> Картографиране на всички информационни активи и идентифициране на заплахите за тях;</li>
                <li><strong>Внедряване на контроли за сигурност:</strong> Прилагане на контроли от Анекс А на стандарта – физическа сигурност, контрол на достъпа, мрежова защита, управление на инциденти;</li>
                <li><strong>Вътрешни одити:</strong> Редовна проверка на ефективността на системата от независими вътрешни лица;</li>
                <li><strong>Непрекъснато подобрение:</strong> Процеси за коригиране на отклонения и адаптация към нови заплахи.</li>
            </ul>
            <p>DefComs може да подпомогне оценката и подготовката на СУИС по ISO 27001. Сертификацията се извършва от компетентен независим сертифициращ орган; резултатът и срокът зависят от организацията и обхвата.</p>
        `
    },
    art16: {
        title: "Директивата ePrivacy и бисквитките: Какво трябва да знаем",
        category: "Регулации",
        content: `
            <p><strong>Директивата ePrivacy, често наричана "Закон за бисквитките", регулира поверителността в електронните комуникации.</strong></p>
            <p>Тя допълва GDPR и въвежда специфични правила за използването на бисквитки (cookies), проследяващи технологии (pixels) и директен маркетинг по имейл или SMS. Спазването на ePrivacy е задължително за всеки корпоративен уебсайт.</p>
            <p><strong>Основни правила съгласно ePrivacy:</strong></p>
            <ul>
                <li><strong>Предварително съгласие:</strong> Не можете да зареждате неосновни (маркетингови или аналитични) бисквитки на компютъра на потребителя, преди той да е дал изрично и активно съгласие;</li>
                <li><strong>Ясна информация:</strong> Потребителите трябва да получат достъпна и детайлна информация за това какви бисквитки се използват и с каква цел;</li>
                <li><strong>Лесен отказ:</strong> Оттеглянето на съгласието за бисквитки трябва да бъде толкова лесно, колкото е било и неговото даване.</li>
            </ul>
            <p>DefComs извършва пълен одит на вашите уебсайтове и помага при внедряването на съвместими с GDPR/ePrivacy платформи за управление на съгласието (CMP), за да предпази фирмата ви от санкции при проверка.</p>
        `
    },
    art17: {
        title: "Директивата DORA за оперативна устойчивост на финансовия сектор",
        category: "Регулации",
        content: `
            <p><strong>Законът за дигитална оперативна устойчивост (DORA) е новият стълб на финансовата стабилност в Европейския съюз.</strong></p>
            <p>DORA обединява правилата за ИКТ сигурност за над 22 000 финансови институции в ЕС (банки, застрахователи, инвестиционни посредници, финтех дружества), както и за техните критични ИТ доставчици на услуги от трети страни (облачни оператори, доставчици на софтуер).</p>
            <p><strong>Петте ключови стълба на DORA:</strong></p>
            <ul>
                <li><strong>Управление на ИКТ риска:</strong> Рамка за управление на риска, одобрена от управителните органи;</li>
                <li><strong>Докладване на сериозни инциденти:</strong> Задължение за класифициране и бързо докладване на ИКТ инциденти по унифицирани шаблони;</li>
                <li><strong>Тестване на оперативната устойчивост:</strong> Задължително редовно техническо тестване на сигурността, включително Threat-Led Penetration Testing (TLPT) за големи организации;</li>
                <li><strong>Управление на риска от трети страни:</strong> Строг контрол, мониторинг и стандартизирани договори с външни доставчици на ИТ услуги;</li>
                <li><strong>Обмен на информация:</strong> Насърчаване на споделянето на разузнавателни данни за киберзаплахи между институциите.</li>
            </ul>
            <p>Експертите на DefComs предлагат цялостни услуги по привеждане на бизнеса в съответствие с DORA – от технически контроли за устойчивост и пентестове до изготвяне на рамки за управление на ИКТ риска.</p>
        `
    },
    art18: {
        title: "Законът за киберсигурност в България и националните регулаторни изисквания",
        category: "Регулации",
        content: `
            <p><strong>Законът за киберсигурност (ЗКС) е основният нормативен акт, който урежда организацията на националната киберсигурност в Република България.</strong></p>
            <p>ЗКС транспонира европейските директиви в българското законодателство и дефинира изискванията за операторите на съществени услуги, публичния сектор и доставчиците на цифрови услуги. Контролът се осъществява от Министерство на електронното управление (МЕУ) и Националния екип за реагиране при инциденти в киберсигурността (Cert.bg).</p>
            <p><strong>Основни задължения за българските организации по ЗКС:</strong></p>
            <ul>
                <li><strong>Минимални мерки за сигурност:</strong> Задължително внедряване на дефиниран пакет от контроли за физическа, мрежова и софтуерна защита;</li>
                <li><strong>Определяне на отговорник по киберсигурност:</strong> Назначаване на лице с подходящи компетентности и ясно определени отговорности;</li>
                <li><strong>Регулярни одити на сигурността:</strong> Провеждане на независими одити и докладване на съответствието към регулаторните органи;</li>
                <li><strong>Регистрация и сътрудничество:</strong> Задължително докладване на киберинциденти към националния център.</li>
            </ul>
            <p>DefComs може да подпомогне оценката и подготовката на технически и организационни мерки спрямо приложимите изисквания на ЗКС. Отговорността за съответствието остава на организацията, а оценките на надзорните органи не могат да бъдат гарантирани от консултант.</p>
        `
    }
};

// Open Article Modal Popup
const modal = document.getElementById('article-modal');
const modalBody = document.getElementById('modal-article-body');
const modalClose = document.querySelector('.modal-close');

if (modal && modalBody && modalClose) {
    document.querySelectorAll('.article-card').forEach(card => {
        const readMore = card.querySelector('.read-more');
        if (!readMore) return;

        readMore.addEventListener('click', (e) => {
            e.preventDefault();
            const artId = card.getAttribute('data-id');
            const article = articlesDatabase[artId];

            if (article) {
                modalBody.innerHTML = `
                    <span class="article-category" style="margin-bottom: 15px; display: inline-block;">${article.category}</span>
                    <h2>${article.title}</h2>
                    <div class="modal-body-text">${article.content}</div>
                `;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close Modal
    const closeModalFunc = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModalFunc);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModalFunc();
        }
    });
}

// Counter animation for stats section
const animateCounter = (element, target, duration = 1500) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
};

// Observe stats section scroll trigger
const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    if (text.includes('/') || text.includes('%')) {
                        return; // Keep non-numeric styles static (e.g. 24/7, 100%)
                    }
                    const number = parseInt(text);
                    if (!isNaN(number)) {
                        animateCounter(stat, number);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Create High-tech Success Overlay Modal for Contact Form submissions
const successOverlay = document.createElement('div');
successOverlay.id = 'success-overlay';
successOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(3, 5, 10, 0.95);
    backdrop-filter: blur(20px);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 2500;
    padding: var(--space-md);
`;
successOverlay.innerHTML = `
    <div style="
        background: var(--background-modal);
        border: 2px solid var(--secondary-cyan);
        box-shadow: var(--shadow-xl), var(--shadow-glow);
        border-radius: var(--radius-xl);
        max-width: 550px;
        width: 100%;
        text-align: center;
        padding: var(--space-2xl) var(--space-xl);
        position: relative;
    ">
        <div style="font-size: 4rem; color: var(--secondary-cyan); margin-bottom: var(--space-md); filter: drop-shadow(0 0 10px var(--secondary-cyan-glow));">⚡</div>
        <h2 style="font-size: var(--font-size-2xl); color: white; margin-bottom: var(--space-sm); font-weight: 800;">Заявката е Изпратена Успешно!</h2>
        <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-lg); font-size: var(--font-size-sm);">
            Вашето запитване за киберсигурност беше криптирано и изпратено успешно до нашия денонощен SOC екип. Процесът се обработва през защитен шлюз Formspree.<br><br>
            Нашите експерти ще се свържат с Вас до броени часове на посочения имейл адрес.
        </p>
        <button id="close-success-btn" class="btn btn-primary" style="padding: 10px var(--space-2xl); font-size: var(--font-size-xs);">Затвори портала</button>
    </div>
`;
document.body.appendChild(successOverlay);

const closeSuccessBtn = document.getElementById('close-success-btn');
if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
        successOverlay.style.display = 'none';
        document.body.style.overflow = '';
    });
}

// Contact Form Submission Handling via Asynchronous Fetch (direct submission to info@defcoms.eu via local secure send_form.php)
const contactForm = document.getElementById('contact-form-el');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        if (!data.name || !data.email || !data.message) {
            alert('Моля, попълнете всички задължителни полета.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Моля, въведете валиден имейл адрес.');
            return;
        }

        // S-20 honeypot + F-17 explicit consent guards (mirror of server-side checks)
        if (data.website_hp) { return; }
        if (data.consent !== 'yes') {
            alert('Моля, потвърдете съгласието за обработване на личните данни.');
            return;
        }

        console.log('Submitting contact form securely...');
        
        // Submit asynchronously to our secure gateway
        fetch('/send_form.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    throw new Error(`Server error: ${response.status}`);
                });
            }
        })
        .then(result => {
            console.log('Submission success:', result);
            successOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            contactForm.reset();
        })
        .catch(error => {
            console.error('Form submission error:', error);
            // Fallback to mailto
            const subject = encodeURIComponent('Запитване от DefComs уебсайт');
            const body = encodeURIComponent(`Име: ${data.name}\nИмейл: ${data.email}\nСъобщение: ${data.message}`);
            window.location.href = `mailto:info@defcoms.eu?subject=${subject}&body=${body}`;
        });
    });
}

// Intersection Observer for Scroll Animations
const scrollObserverOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            scrollObserver.unobserve(entry.target);
        }
    });
}, scrollObserverOptions);

document.querySelectorAll('.animate-on-scroll').forEach(element => {
    scrollObserver.observe(element);
});

// Newsletter Form Handling
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(newsletterForm);
        const data = Object.fromEntries(formData);
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Моля, въведете валиден имейл адрес.');
            return;
        }

        // S-20 honeypot + F-17 explicit consent guards (mirror of server-side checks)
        if (data.website_hp) { return; }
        if (data.consent !== 'yes') {
            alert('Моля, потвърдете съгласието за получаване на бюлетина.');
            return;
        }
        
        console.log('Submitting newsletter form securely...');
        
        // Submit to send_form.php
        fetch('/send_form.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    throw new Error(`Server error: ${response.status}`);
                });
            }
        })
        .then(result => {
            console.log('Newsletter subscription success:', result);
            // Hide form and show success message
            newsletterForm.style.display = 'none';
            document.getElementById('newsletter-success').classList.add('active');
            
            // Reset form after 5 seconds
            setTimeout(() => {
                newsletterForm.reset();
                newsletterForm.style.display = 'block';
                document.getElementById('newsletter-success').classList.remove('active');
            }, 5000);
        })
        .catch(error => {
            console.error('Form submission error:', error);
            // Fallback to mailto
            const subject = encodeURIComponent('Абонамент за Кибер Новини от DefComs уебсайт');
            const body = encodeURIComponent(`Искам да се абонирам за кибер новини.\nИмейл: ${data.email}`);
            window.location.href = `mailto:info@defcoms.eu?subject=${subject}&body=${body}`;
        });
    });
}

console.log('DefComs high-tech cybersecurity portal loaded successfully!');


// Content protection - Disable text copying, right-click, selection and keyboard shortcuts
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
});

document.addEventListener('copy', function (e) {
    e.preventDefault();
    return false;
});

document.addEventListener('cut', function (e) {
    e.preventDefault();
    return false;
});

document.addEventListener('selectstart', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('keydown', function (e) {
    // Prevent Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+P, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A' || e.key === 'p' || e.key === 'P')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
    ) {
        e.preventDefault();
        return false;
    }
});
