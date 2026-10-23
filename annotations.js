// Screen-space separation of a small set of measurement captions. A caption
// sits on what it measures: a distance at the midpoint of its line, the angle
// on its bisector. It moves only when it would cover an earlier caption or one
// of its own obstacles, sliding along its own direction in small steps. There
// are no leader lines; the measured geometry never changes.
(function (root) {
    const overlaps = (a, b, gap) => Math.abs(a.x - b.x) < (a.width + b.width) / 2 + gap
        && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + gap;

    // labels: [{ x, y, width, height, slide: { x, y }, flip, obstacles }] in
    // caption order. `slide` is a unit screen direction; a caption with flip
    // true may reverse it to move away from whatever it covers. Obstacles are
    // rectangles that only this caption must clear.
    const overlapArea = (a, b, gap) => Math.max(0, (a.width + b.width) / 2 + gap - Math.abs(a.x - b.x))
        * Math.max(0, (a.height + b.height) / 2 + gap - Math.abs(a.y - b.y));

    function separateLabels(labels, gap = 4, maxSteps = 12) {
        const placed = [];
        return labels.map(label => {
            const others = [...placed, ...(label.obstacles || [])];
            const blocking = others.find(other => overlaps(label, other, gap));
            if (!blocking) { placed.push(label); return label; }
            let { x: dx, y: dy } = label.slide || { x: 0, y: -1 };
            if (label.flip !== false && dx * (label.x - blocking.x) + dy * (label.y - blocking.y) < 0) { dx = -dx; dy = -dy; }
            // The caption's own direction first; across it only when that
            // cannot clear. The nearest clear position wins, otherwise the
            // position that covers the least.
            const directions = [{ x: dx, y: dy }, { x: -dy, y: dx }, { x: dy, y: -dx }];
            const step = Math.max(2, label.height / 2);
            let best = null, bestArea = Infinity, bestDistance = Infinity;
            for (const direction of directions) {
                for (let i = 1; i <= maxSteps; i++) {
                    const candidate = { ...label, x: label.x + direction.x * step * i, y: label.y + direction.y * step * i };
                    const area = others.reduce((sum, other) => sum + overlapArea(candidate, other, gap), 0);
                    const distance = step * i;
                    if (area < bestArea || area === bestArea && distance < bestDistance) { best = candidate; bestArea = area; bestDistance = distance; }
                    if (area === 0) break;
                }
            }
            placed.push(best);
            return best;
        });
    }
    const api = { separateLabels };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalAnnotations = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
