// Blog archive: client-side category filter + pagination (progressive enhancement).
// All cards stay in the HTML so search engines and no-JS users see every article.
// Categories are derived from the first segment of each card's .blog-listing-meta.
(function () {
    'use strict';

    var PER_PAGE = 12;

    function ready(fn) {
        if (document.readyState !== 'loading') { fn(); }
        else { document.addEventListener('DOMContentLoaded', fn); }
    }

    ready(function () {
        var listing = document.querySelector('.blog-listing');
        var filtersBar = document.getElementById('blogFilters');
        var shownEl = document.getElementById('blogShownCount');
        var totalEl = document.getElementById('blogTotalCount');
        if (!listing || !filtersBar) { return; }

        var cards = Array.prototype.slice.call(listing.querySelectorAll('.blog-listing-card'));
        if (!cards.length) { return; }

        function primaryCategory(card) {
            var meta = card.querySelector('.blog-listing-meta');
            if (!meta || !meta.textContent) { return 'Other'; }
            var first = meta.textContent.split('·')[0].replace(/\s+/g, ' ').trim();
            return first || 'Other';
        }

        cards.forEach(function (c) { c._cat = primaryCategory(c); });

        var cats = [];
        cards.forEach(function (c) { if (cats.indexOf(c._cat) === -1) { cats.push(c._cat); } });
        cats.sort(function (a, b) { return a.localeCompare(b, 'bg'); });

        cats.forEach(function (cat) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'blog-filter-btn';
            b.setAttribute('data-cat', cat);
            b.textContent = cat;
            filtersBar.appendChild(b);
        });

        // Pagination container inserted after the listing.
        var pager = document.createElement('nav');
        pager.className = 'blog-pagination';
        pager.setAttribute('aria-label', 'Pages');
        listing.parentNode.insertBefore(pager, listing.nextSibling);

        var state = { cat: '', page: 1 };

        function filteredCards() {
            return cards.filter(function (c) { return !state.cat || c._cat === state.cat; });
        }

        function render() {
            var list = filteredCards();
            var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
            if (state.page > pages) { state.page = pages; }
            if (state.page < 1) { state.page = 1; }

            var start = (state.page - 1) * PER_PAGE;
            var visible = list.slice(start, start + PER_PAGE);

            cards.forEach(function (c) { c.style.display = 'none'; });
            visible.forEach(function (c) { c.style.display = ''; });

            if (shownEl) { shownEl.textContent = String(visible.length); }
            if (totalEl) { totalEl.textContent = String(list.length); }

            // Buttons active state.
            Array.prototype.forEach.call(filtersBar.querySelectorAll('.blog-filter-btn'), function (b) {
                var active = (b.getAttribute('data-cat') || '') === state.cat;
                b.classList.toggle('active', active);
                if (active) { b.setAttribute('aria-pressed', 'true'); }
                else { b.removeAttribute('aria-pressed'); }
            });

            // Pager.
            while (pager.firstChild) { pager.removeChild(pager.firstChild); }
            if (pages > 1) {
                pager.appendChild(pageBtn('‹', state.page - 1, state.page === 1, 'prev'));
                for (var i = 1; i <= pages; i++) {
                    pager.appendChild(pageBtn(String(i), i, false, i === state.page));
                }
                pager.appendChild(pageBtn('›', state.page + 1, state.page === pages, 'next'));
                pager.style.display = 'flex';
            } else {
                pager.style.display = 'none';
            }
        }

        function pageBtn(label, target, disabled, active) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = label;
            if (active === true) { b.className = 'active'; }
            if (disabled) { b.disabled = true; }
            else { b.addEventListener('click', function () { state.page = target; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }); }
            return b;
        }

        filtersBar.addEventListener('click', function (e) {
            var btn = e.target.closest('.blog-filter-btn');
            if (!btn) { return; }
            state.cat = btn.getAttribute('data-cat') || '';
            state.page = 1;
            render();
        });

        render();
    });
})();
