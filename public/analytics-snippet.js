// First-party analytics beacon; sends data only after cookie consent.
(function () {
    if (localStorage.getItem('cookie_consent') !== 'accepted') return;
    var q = new URLSearchParams(window.location.search);
    var ua = navigator.userAgent;
    var param = function (k) { return encodeURIComponent(q.get(k) || ''); };
    var browser = encodeURIComponent(navigator.userAgentData && navigator.userAgentData.brands
        ? navigator.userAgentData.brands.map(function (b) { return b.brand; }).join(', ')
        : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : /Edg/i.test(ua) ? 'Edge' : 'Unknown');
    var os = encodeURIComponent(/Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown');
    var img = new Image();
    img.src = '/analytics/track.php?page=' + encodeURIComponent(location.pathname)
        + '&ref=' + encodeURIComponent(document.referrer)
        + '&utm_source=' + param('utm_source') + '&utm_medium=' + param('utm_medium') + '&utm_campaign=' + param('utm_campaign')
        + '&device_type=' + encodeURIComponent(/mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop')
        + '&browser=' + browser + '&os=' + os
        + '&screen_width=' + encodeURIComponent(window.screen ? window.screen.width : 0);
})();
