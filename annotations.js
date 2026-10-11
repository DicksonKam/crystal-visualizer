// Screen-space placement of a small set of measurement labels. Physical
// measurement anchors remain separate from their presentation positions.
(function (root) {
    function placeLabels(labels, obstacles, viewport) {
        const occupied = [...obstacles];
        const gap = 4;
        const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width / 2, b.x + b.width / 2) - Math.max(a.x - a.width / 2, b.x - b.width / 2) + gap)
            * Math.max(0, Math.min(a.y + a.height / 2, b.y + b.height / 2) - Math.max(a.y - a.height / 2, b.y - b.height / 2) + gap);
        return labels.map(label => {
            let best, score = Infinity;
            // Prefer the anchor, then the closest available position. The
            // bounded search is deterministic and never changes geometry.
            for (let ring = 0; ring <= 12; ring++) {
                for (let dx = -ring; dx <= ring; dx++) for (let dy = -ring; dy <= ring; dy++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
                    const candidate = { ...label,
                        x: Math.max(label.width / 2 + gap, Math.min(viewport.width - label.width / 2 - gap, label.x + dx * 8)),
                        y: Math.max(label.height / 2 + gap, Math.min(viewport.height - label.height / 2 - gap, label.y + dy * 8))
                    };
                    const area = occupied.reduce((sum, rectangle) => sum + overlap(candidate, rectangle), 0);
                    const distance = (candidate.x - label.x) ** 2 + (candidate.y - label.y) ** 2;
                    const cost = area * 1e6 + distance;
                    if (cost < score) { score = cost; best = candidate; }
                }
                // No later ring can improve an already unobstructed position
                // closer than the next ring's minimum displacement.
                if (score < ((ring + 1) * 8) ** 2) break;
            }
            occupied.push(best);
            return best;
        });
    }
    const api = { placeLabels };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalAnnotations = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
