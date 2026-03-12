/**
 * Shared helpers for the Jobs and Routines dashboard pages.
 */

/** Safely escape a string for insertion into innerHTML. */
function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

/**
 * Render summary cards into a container element.
 *
 * @param {HTMLElement} containerEl  – target grid container
 * @param {Array}       defs        – [{ key, label, color }]
 * @param {Function}    countFn     – (key) => number
 * @param {string|null} activeFilter
 * @param {Function}    onToggle    – (key) => void, called when a card is clicked
 */
function renderSummaryCards(containerEl, defs, countFn, activeFilter, onToggle) {
    containerEl.innerHTML = '';
    defs.forEach(function (def) {
        var count = countFn(def.key);
        var isActive = activeFilter === def.key;
        var card = document.createElement('div');
        card.className = 'bg-glass-100 border rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-glass-200 ' +
            (isActive ? 'border-brand-emerald/40' : 'border-glass-border');
        card.innerHTML =
            '<div class="text-3xl font-bold ' + def.color + '">' + count + '</div>' +
            '<div class="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">' + def.label + '</div>';
        card.addEventListener('click', function () {
            onToggle(def.key);
        });
        containerEl.appendChild(card);
    });
}

/**
 * Wire up the detail modal's close button, backdrop, and Escape key.
 *
 * Expects element ids: detail-modal, detail-close, detail-backdrop.
 * Returns { open, close } functions that show/hide the modal.
 */
function initDetailModal() {
    var modal    = document.getElementById('detail-modal');
    var closeBtn = document.getElementById('detail-close');
    var backdrop = document.getElementById('detail-backdrop');

    function close() { modal.classList.add('hidden'); }
    function open()  { modal.classList.remove('hidden'); }

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });

    return { open: open, close: close };
}
