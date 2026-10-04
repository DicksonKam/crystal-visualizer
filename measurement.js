// Resolve one measurement geometry shared by numbers, lines and angle visuals.
(function (root) {
    function createMeasurements() {
        const components = position => Array.isArray(position) ? [...position] : [position.x, position.y, position.z];
        const subtract = (a, b) => a.map((value, axis) => value - b[axis]);
        const finite = position => position.length === 3 && position.every(Number.isFinite);

        function resolve(atoms) {
            const points = atoms.map((atom, selectionIndex) => ({
                selectionIndex, position: components(atom.position), unavailable: false, error: null
            }));
            const anchorIndex = points.length > 1 ? 1 : 0;
            const anchor = points[anchorIndex];
            if (!anchor) return { points, pairs: [], angle: null, errors: [] };
            points.forEach(point => {
                if (!finite(point.position) || !finite(anchor.position)) {
                    point.unavailable = true;
                    point.error = 'Measurement coordinates are not finite';
                    return;
                }
            });
            const pairs = points.slice(1).map((end, index) => {
                const start = points[index];
                const delta = subtract(end.position, start.position);
                const distance = Math.hypot(...delta);
                const unavailable = start.unavailable || end.unavailable || !Number.isFinite(distance);
                return {
                    indices: [index, index + 1], start: start.position, end: end.position, delta,
                    distance: unavailable ? null : distance,
                    unavailable,
                    error: start.error || end.error || (unavailable ? 'Measurement distance cannot be represented' : null)
                };
            });
            let angle = null;
            if (points.length === 3 && pairs.every(pair => !pair.unavailable && pair.distance >= 1e-10)) {
                const first = pairs[0].delta.map(value => -value / pairs[0].distance);
                const third = pairs[1].delta.map(value => value / pairs[1].distance);
                const cosine = first.reduce((sum, value, axis) => sum + value * third[axis], 0);
                angle = { first: points[0].position, vertex: anchor.position, third: points[2].position,
                    firstDirection: first, thirdDirection: third,
                    angleDeg: Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI };
            }
            return { points, pairs, angle, errors: [...new Set([...points, ...pairs].map(value => value.error).filter(Boolean))] };
        }
        return { resolve };
    }
    const api = { createMeasurements };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalMeasurements = api;
})(globalThis);
