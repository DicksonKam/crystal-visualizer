// Screen-space placement of a small set of measurement labels. Physical
// measurement anchors remain separate from their presentation positions.
(function (root) {
    // Clip a bond centerline against the caption expanded by its stroke radius.
    // Its bounding box only culls candidates; a diagonal bond does not reserve
    // the large empty corners of that box.
    function segmentOverlap(label, obstacle, gap) {
        const { a, b, radius } = obstacle.segment;
        let low = 0, high = 1;
        for (const axis of ['x', 'y']) {
            const half = label[axis === 'x' ? 'width' : 'height'] / 2 + radius + gap;
            const start = a[axis], delta = b[axis] - start;
            const min = label[axis] - half, max = label[axis] + half;
            if (Math.abs(delta) < 1e-9) {
                if (start < min || start > max) return 0;
            } else {
                const first = (min - start) / delta, second = (max - start) / delta;
                low = Math.max(low, Math.min(first, second));
                high = Math.min(high, Math.max(first, second));
                if (low > high) return 0;
            }
        }
        return Math.max(1e-6, (high - low) * Math.hypot(b.x - a.x, b.y - a.y)) * (2 * radius + gap);
    }

    function placeLabels(labels, obstacles, viewport) {
        const occupied = [...obstacles];
        const gap = 4, step = 8, rings = 12;
        const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width / 2, b.x + b.width / 2) - Math.max(a.x - a.width / 2, b.x - b.width / 2) + gap)
            * Math.max(0, Math.min(a.y + a.height / 2, b.y + b.height / 2) - Math.max(a.y - a.height / 2, b.y - b.height / 2) + gap);
        return labels.map(label => {
            const clampX = x => Math.max(label.width / 2 + gap, Math.min(viewport.width - label.width / 2 - gap, x));
            const clampY = y => Math.max(label.height / 2 + gap, Math.min(viewport.height - label.height / 2 - gap, y));
            const reach = rings * step;
            const left = clampX(label.x - reach) - label.width / 2 - gap;
            const right = clampX(label.x + reach) + label.width / 2 + gap;
            const top = clampY(label.y - reach) - label.height / 2 - gap;
            const bottom = clampY(label.y + reach) + label.height / 2 + gap;
            // Cull against the clamped search area once per label. Far-away
            // atoms cannot affect placement, including at viewport edges.
            const nearby = occupied.filter(rect => rect.x + rect.width / 2 >= left && rect.x - rect.width / 2 <= right
                && rect.y + rect.height / 2 >= top && rect.y - rect.height / 2 <= bottom);
            let best, bestArea = Infinity, bestDistance = Infinity;
            const consider = (x, y, rectangles) => {
                const candidate = { ...label, x: clampX(x), y: clampY(y) };
                const area = rectangles.reduce((sum, rectangle) => sum + (rectangle.segment ? segmentOverlap(candidate, rectangle, gap) : overlap(candidate, rectangle)), 0);
                const distance = (candidate.x - label.x) ** 2 + (candidate.y - label.y) ** 2;
                if (area < bestArea || area === bestArea && distance < bestDistance) {
                    best = candidate; bestArea = area; bestDistance = distance;
                }
            };
            // Prefer the anchor, then the closest available position. The
            // bounded search is deterministic and never changes geometry.
            for (let ring = 0; ring <= rings; ring++) {
                for (let dx = -ring; dx <= ring; dx++) for (let dy = -ring; dy <= ring; dy++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
                    consider(label.x + dx * step, label.y + dy * step, nearby);
                }
                // No later ring can improve an already unobstructed position
                // closer than the next ring's minimum displacement.
                if (bestArea === 0 && bestDistance < ((ring + 1) * step) ** 2) break;
            }
            // A close-view atom may cover the entire local search. Try its
            // perimeter directly instead of growing a costly pixel grid.
            // These destinations can reach other atoms, so score all obstacles.
            if (bestArea > 0) {
                for (const rectangle of nearby) {
                    const xs = [rectangle.x - (rectangle.width + label.width) / 2 - gap,
                        rectangle.x + (rectangle.width + label.width) / 2 + gap];
                    const ys = [rectangle.y - (rectangle.height + label.height) / 2 - gap,
                        rectangle.y + (rectangle.height + label.height) / 2 + gap];
                    for (const x of xs) consider(x, label.y, occupied);
                    for (const y of ys) consider(label.x, y, occupied);
                    for (const x of xs) for (const y of ys) consider(x, y, occupied);
                }
            }
            occupied.push(best);
            return best;
        });
    }
    const api = { placeLabels };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalAnnotations = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
