// Sidebar sizing is presentation state, independent of document/edit history.
window.CrystalLayout = {
    initSidebar(onResize) {
        const main = document.querySelector('.main-content');
        const sidebar = document.querySelector('.sidebar');
        const divider = document.getElementById('sidebarDivider');
        if (!main || !sidebar || !divider) return;
        const key = 'crystal-sidebar-width';
        let width = window.innerWidth <= 768 ? 240 : 280;
        let expanded = width, drag = null, resizeFrame = null;
        try {
            const saved = JSON.parse(localStorage.getItem(key));
            if (saved && Number.isFinite(saved.width) && saved.width >= 0 && Number.isFinite(saved.expanded) && saved.expanded > 0) {
                width = saved.width; expanded = saved.expanded;
            }
        } catch { /* Storage may be unavailable; sizing still works. */ }
        const maximum = () => Math.max(0, main.clientWidth - divider.offsetWidth - Math.min(280, main.clientWidth / 2));
        function apply(value) {
            const max = maximum(), min = Math.min(220, max);
            width = value <= 72 ? 0 : Math.min(max, Math.max(min, value));
            if (width > 0) expanded = width;
            main.style.setProperty('--sidebar-width', `${width}px`);
            sidebar.inert = width === 0;
            sidebar.setAttribute('aria-hidden', String(width === 0));
            divider.setAttribute('aria-valuemax', String(Math.round(max)));
            divider.setAttribute('aria-valuenow', String(Math.round(width)));
            divider.setAttribute('aria-valuetext', width ? `${Math.round(width)} pixels` : 'Collapsed');
            if (resizeFrame === null) resizeFrame = requestAnimationFrame(() => { resizeFrame = null; onResize(); });
        }
        function save() {
            try { localStorage.setItem(key, JSON.stringify({ width, expanded })); } catch { /* Optional preference. */ }
        }
        function finish(cancel) {
            if (!drag) return;
            const previous = drag; drag = null;
            if (cancel) { expanded = previous.expanded; apply(previous.width); } else save();
            main.classList.remove('resizing-sidebar');
            if (divider.hasPointerCapture(previous.id)) divider.releasePointerCapture(previous.id);
        }
        divider.addEventListener('pointerdown', event => {
            if (event.button !== 0 || drag) return;
            event.preventDefault(); divider.focus();
            drag = { id: event.pointerId, x: event.clientX, width, expanded };
            divider.setPointerCapture(event.pointerId);
            main.classList.add('resizing-sidebar');
        });
        divider.addEventListener('pointermove', event => {
            if (drag && drag.id === event.pointerId) apply(drag.width + event.clientX - drag.x);
        });
        divider.addEventListener('pointerup', event => { if (drag?.id === event.pointerId) finish(false); });
        divider.addEventListener('pointercancel', event => { if (drag?.id === event.pointerId) finish(true); });
        divider.addEventListener('lostpointercapture', () => finish(true));
        window.addEventListener('blur', () => finish(true));
        divider.addEventListener('keydown', event => {
            if (event.key === 'Escape' && drag) { event.preventDefault(); event.stopPropagation(); finish(true); return; }
            const increment = event.shiftKey ? 50 : 20;
            const values = { ArrowLeft: width <= Math.min(220, maximum()) ? 0 : width - increment, ArrowRight: width ? width + increment : Math.min(expanded, maximum()), Home: 0, End: maximum(), Enter: width ? 0 : expanded };
            if (Object.hasOwn(values, event.key)) { event.preventDefault(); event.stopPropagation(); apply(values[event.key]); save(); }
        });
        divider.addEventListener('dblclick', () => { apply(width ? 0 : expanded); save(); });
        window.addEventListener('resize', () => { finish(true); apply(width); });
        apply(width);
    }
};
