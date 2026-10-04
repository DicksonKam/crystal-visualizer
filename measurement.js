// Resolve one measurement geometry shared by numbers, lines and angle visuals.
(function (root) {
    function createMeasurements(geometry) {
        const components = position => Array.isArray(position) ? [...position] : [position.x, position.y, position.z];
        const subtract = (a, b) => a.map((value, axis) => value - b[axis]);
        const finite = position => position.length === 3 && position.every(Number.isFinite);

        function resolve(atoms, { lattice = null, periodicAxes = [true, true, true], nearest = false } = {}) {
            const points = atoms.map((atom, selectionIndex) => ({
                selectionIndex, position: components(atom.position), offset: [0, 0, 0], isImage: false,
                unavailable: false, error: null, nearest: false
            }));
            const anchorIndex = points.length > 1 ? 1 : 0;
            const anchor = points[anchorIndex];
            if (!anchor) return { points, pairs: [], angle: null, errors: [] };
            points.forEach((point, index) => {
                if (!finite(point.position) || !finite(anchor.position)) {
                    point.unavailable = true;
                    point.error = 'Measurement coordinates are not finite';
                    return;
                }
                if (index === anchorIndex) return;
                point.nearest = Boolean(nearest && lattice && periodicAxes.some(Boolean)
                    && !atoms[index].isGhost && !atoms[anchorIndex].isGhost);
                if (!point.nearest) return;
                try {
                    const image = geometry.nearestImageBetween(anchor.position, point.position, lattice, periodicAxes);
                    const position = anchor.position.map((value, axis) => value + image.delta[axis]);
                    if (!finite(position)) throw new Error('Measurement image cannot be represented');
                    point.position = position;
                    point.offset = [...image.offset];
                    point.isImage = point.offset.some(value => value !== 0);
                } catch (error) {
                    point.unavailable = true;
                    point.error = error.message;
                }
            });
            const pairs = points.slice(1).map((end, index) => {
                const start = points[index];
                const delta = subtract(end.position, start.position);
                const distance = Math.hypot(...delta);
                const unavailable = start.unavailable || end.unavailable || !Number.isFinite(distance);
                return {
                    indices: [index, index + 1], start: start.position, end: end.position, delta,
                    // Relative shift preserves the signed 1→2 / 2→3 displacement.
                    // images records the actual displayed copies for annotations.
                    offset: subtract(end.offset, start.offset).map(value => value || 0),
                    images: [start, end].filter(point => point.isImage),
                    distance: unavailable ? null : distance,
                    nearest: !unavailable && (start.nearest || end.nearest), unavailable,
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
