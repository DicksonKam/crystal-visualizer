// Geometry independent of Three.js and the browser UI.
(function (root) {
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const subtract = (a, b) => a.map((value, index) => value - b[index]);
    const scale = (a, factor) => a.map(value => value * factor);
    const length = a => Math.hypot(...a);
    const components = point => Array.isArray(point) ? point : [point.x, point.y, point.z];

    class GeometryWorkLimitError extends Error {
        constructor(message) { super(message); this.name = 'GeometryWorkLimitError'; }
    }
    const MAX_IMAGE_SEARCH_STEPS = 10000;
    const MAX_BOUNDARY_TRANSLATIONS = 50000;

    // LLL size reduction keeps a highly tilted basis from making the exact
    // integer search enumerate millions of equivalent-looking candidates.
    // Integer transforms let callers receive offsets in the original basis.
    function reducedBasis(vectors) {
        const basis = vectors.map(vector => [...vector]);
        const dimension = basis.length;
        const transform = basis.map((_, row) => basis.map((__, col) => Number(row === col)));
        function orthogonalize() {
            const orthogonal = [];
            const norms = [];
            const mu = basis.map(() => Array(dimension).fill(0));
            for (let i = 0; i < dimension; i++) {
                let vector = [...basis[i]];
                for (let j = 0; j < i; j++) {
                    mu[i][j] = dot(basis[i], orthogonal[j]) / norms[j];
                    vector = subtract(vector, scale(orthogonal[j], mu[i][j]));
                }
                orthogonal.push(vector);
                norms.push(dot(vector, vector));
            }
            if (norms.some(value => !Number.isFinite(value) || value <= 0) || mu.flat().some(value => !Number.isFinite(value))) {
                throw new GeometryWorkLimitError('Periodic cell has zero volume or is too ill-conditioned to measure reliably');
            }
            return { norms, mu };
        }
        let column = 1;
        let steps = 0;
        while (column < dimension) {
            if (++steps > 128) throw new GeometryWorkLimitError('Periodic basis reduction exceeded its work limit');
            let state = orthogonalize();
            for (let row = column - 1; row >= 0; row--) {
                const integer = Math.round(state.mu[column][row]);
                if (!Number.isSafeInteger(integer)) throw new GeometryWorkLimitError('Periodic image offset exceeds reliable integer precision');
                if (integer) {
                    basis[column] = subtract(basis[column], scale(basis[row], integer));
                    transform[column] = transform[column].map((value, index) => value - integer * transform[row][index]);
                    if (transform[column].some(value => !Number.isSafeInteger(value))) throw new GeometryWorkLimitError('Periodic image offset exceeds reliable integer precision');
                    state = orthogonalize();
                }
            }
            if (state.norms[column] >= (0.75 - state.mu[column][column - 1] ** 2) * state.norms[column - 1]) column++;
            else {
                [basis[column], basis[column - 1]] = [basis[column - 1], basis[column]];
                [transform[column], transform[column - 1]] = [transform[column - 1], transform[column]];
                column = Math.max(1, column - 1);
            }
        }
        return { basis, transform };
    }

    function requireFiniteCell(lattice, format = 'cell') {
        if (lattice.some(vector => vector.some(value => !Number.isFinite(value)))) {
            throw new Error(`Invalid ${format}: lattice has non-finite coordinates`);
        }
        const volume = dot(lattice[0], cross(lattice[1], lattice[2]));
        if (!Number.isFinite(volume)) throw new Error(`Invalid ${format}: lattice volume is not finite`);
        if (Math.abs(volume) < 1e-10) throw new Error(`Invalid ${format}: lattice has zero volume`);
        return volume;
    }

    function fractionalToCartesian(fractional, lattice) {
        return [0, 1, 2].map(axis => fractional.reduce((sum, value, index) => sum + value * lattice[index][axis], 0));
    }

    function cartesianToFractional(point, lattice) {
        const [a, b, c] = lattice;
        const reciprocal = [cross(b, c), cross(c, a), cross(a, b)];
        const volume = dot(a, reciprocal[0]);
        if (!Number.isFinite(volume) || Math.abs(volume) < 1e-10) return null;
        const position = components(point);
        const fractional = reciprocal.map(row => dot(position, row) / volume);
        return fractional.every(Number.isFinite) ? fractional : null;
    }

    // Average positions on each periodic axis. A linear average puts atoms at
    // 0.99 and 0.01 on opposite sides of the cell instead of beside each other.
    function periodicFractionalCenter(positions, periodicAxes = [true, true, true]) {
        if (!positions.length) return null;
        return [0, 1, 2].map(axis => {
            if (!periodicAxes[axis]) return positions.reduce((sum, position) => sum + position[axis] / positions.length, 0);
            let sine = 0;
            let cosine = 0;
            let linear = 0;
            positions.forEach(position => {
                const wrapped = ((position[axis] % 1) + 1) % 1;
                const angle = 2 * Math.PI * wrapped;
                sine += Math.sin(angle);
                cosine += Math.cos(angle);
                linear += wrapped;
            });
            // A uniform distribution has no unique circular center. Preserve
            // the familiar arithmetic center in that case.
            if (Math.hypot(sine, cosine) < positions.length * 1e-8) {
                return linear / positions.length;
            }
            return ((Math.atan2(sine, cosine) / (2 * Math.PI)) + 1) % 1;
        });
    }

    // Find the nearest translated copy of B to A. A QR-based integer search
    // handles tilted cells where rounding fractional coordinates is incorrect.
    function nearestImageBetween(pointA, pointB, lattice, periodicAxes = [true, true, true]) {
        const a = components(pointA);
        const b = components(pointB);
        const delta = subtract(b, a);
        const axes = [0, 1, 2].filter(axis => periodicAxes[axis]);
        const dimension = axes.length;
        if (!dimension) return { offset: [0, 0, 0], delta, distance: length(delta) };
        const { basis, transform } = reducedBasis(axes.map(axis => lattice[axis]));
        const q = [];
        const r = Array.from({ length: dimension }, () => Array(dimension).fill(0));

        for (let column = 0; column < dimension; column++) {
            let orthogonal = [...basis[column]];
            for (let row = 0; row < column; row++) {
                r[row][column] = dot(q[row], basis[column]);
                orthogonal = subtract(orthogonal, scale(q[row], r[row][column]));
            }
            r[column][column] = length(orthogonal);
            if (!Number.isFinite(r[column][column]) || r[column][column] < 1e-10) {
                throw new Error('Cannot measure periodic distance: lattice has zero volume');
            }
            q[column] = scale(orthogonal, 1 / r[column][column]);
        }

        const target = q.map(axis => -dot(axis, delta));
        const candidate = Array(dimension).fill(0);
        for (let row = dimension - 1; row >= 0; row--) {
            let remainder = target[row];
            for (let column = row + 1; column < dimension; column++) {
                remainder -= r[row][column] * candidate[column];
            }
            candidate[row] = Math.round(remainder / r[row][row]);
            if (!Number.isSafeInteger(candidate[row])) throw new GeometryWorkLimitError('Periodic image offset exceeds reliable integer precision');
        }

        function displacement(offset) {
            return delta.map((value, axis) => value + offset.reduce((sum, count, index) => sum + count * basis[index][axis], 0));
        }

        let bestOffset = [...candidate];
        let bestDelta = displacement(bestOffset);
        let bestSquared = dot(bestDelta, bestDelta);
        let bestProjectedSquared = target.reduce((sum, value, row) => {
            const residual = value - r[row].reduce((projection, coefficient, column) => projection + coefficient * candidate[column], 0);
            return sum + residual * residual;
        }, 0);
        const trial = Array(dimension).fill(0);
        let searchSteps = 0;

        function search(row, partialSquared) {
            if (row < 0) {
                const vector = displacement(trial);
                const squared = dot(vector, vector);
                if (partialSquared < bestProjectedSquared) {
                    bestProjectedSquared = partialSquared;
                    bestSquared = squared;
                    bestOffset = [...trial];
                    bestDelta = vector;
                }
                return;
            }
            let remainder = target[row];
            for (let column = row + 1; column < dimension; column++) {
                remainder -= r[row][column] * trial[column];
            }
            const center = remainder / r[row][row];
            const radius = Math.sqrt(Math.max(0, bestProjectedSquared - partialSquared)) / r[row][row];
            const first = Math.ceil(center - radius);
            const last = Math.floor(center + radius);
            if (![first, last].every(Number.isSafeInteger)) throw new GeometryWorkLimitError('Periodic search range exceeds reliable integer precision');
            // Visit the nearest candidates first so good bounds shrink early.
            const nearest = Math.round(center);
            for (let step = 0; step <= 2 * Math.max(nearest - first, last - nearest); step++) {
                if (++searchSteps > MAX_IMAGE_SEARCH_STEPS) throw new GeometryWorkLimitError('Periodic distance search exceeded its work limit');
                const integer = nearest + (step % 2 ? -(step + 1) / 2 : step / 2);
                if (integer < first || integer > last) continue;
                const residual = r[row][row] * (integer - center);
                const nextSquared = partialSquared + residual * residual;
                const tolerance = Number.EPSILON * 32 * Math.max(bestProjectedSquared, Number.MIN_VALUE);
                if (nextSquared <= bestProjectedSquared + tolerance) {
                    trial[row] = integer;
                    search(row - 1, nextSquared);
                }
            }
        }

        search(dimension - 1, 0);
        const offset = [0, 0, 0];
        axes.forEach((axis, index) => {
            offset[axis] = bestOffset.reduce((sum, count, row) => sum + count * transform[row][index], 0) || 0;
            if (!Number.isSafeInteger(offset[axis])) throw new GeometryWorkLimitError('Periodic image offset exceeds reliable integer precision');
        });
        return { offset, delta: bestDelta, distance: Math.sqrt(bestSquared) };
    }

    // Estimate the full workload before allocating translation arrays or doing
    // any bond work. One huge range must not freeze a two-atom document.
    function boundaryTranslationRanges(points, lattice, repeats, periodicAxes, cutoff) {
        const reciprocal = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(axis => cartesianToFractional(axis, lattice));
        if (reciprocal.some(column => !column)) throw new GeometryWorkLimitError('Periodic cell cannot be represented reliably');
        const margins = [0, 1, 2].map(axis => cutoff * Math.hypot(...reciprocal.map(column => column[axis])) + 1e-9);
        let total = 0;
        return points.map(point => {
            const fractional = cartesianToFractional(point, lattice);
            if (!fractional) throw new GeometryWorkLimitError('Periodic coordinates cannot be represented reliably');
            const ranges = [0, 1, 2].map(axis => periodicAxes[axis] ? [
                Math.ceil((-margins[axis] - fractional[axis]) / repeats[axis]) || 0,
                Math.floor((repeats[axis] + margins[axis] - fractional[axis]) / repeats[axis]) || 0
            ] : [0, 0]);
            if (ranges.flat().some(value => !Number.isSafeInteger(value))) throw new GeometryWorkLimitError('Periodic bond range exceeds reliable integer precision');
            total += ranges.reduce((count, [first, last]) => count * Math.max(0, last - first + 1), 1);
            if (total > MAX_BOUNDARY_TRANSLATIONS) throw new GeometryWorkLimitError('Periodic boundary bonds exceed the work limit; reduce the bond cutoff or use a less skewed cell');
            return ranges;
        });
    }

    // Clip a bond to the fractional bounds of the displayed cell or supercell.
    function clipSegmentToCell(pointA, pointB, lattice, repeats, periodicAxes = [true, true, true]) {
        const a = components(pointA);
        const b = components(pointB);
        const [u, v, w] = lattice;
        const volume = dot(u, cross(v, w));
        if (Math.abs(volume) < 1e-10) throw new Error('Cannot clip periodic bond: lattice has zero volume');
        const reciprocal = [cross(v, w), cross(w, u), cross(u, v)].map(row => scale(row, 1 / volume));
        const direction = subtract(b, a);
        let enter = 0;
        let exit = 1;
        for (let axis = 0; axis < 3; axis++) {
            if (!periodicAxes[axis]) continue;
            const first = dot(reciprocal[axis], a);
            const slope = dot(reciprocal[axis], direction);
            if (Math.abs(slope) < 1e-12) {
                if (first < -1e-10 || first > repeats[axis] + 1e-10) return null;
                continue;
            }
            const lower = -first / slope;
            const upper = (repeats[axis] - first) / slope;
            enter = Math.max(enter, Math.min(lower, upper));
            exit = Math.min(exit, Math.max(lower, upper));
            if (exit - enter < 1e-10) return null;
        }
        return [
            a.map((value, axis) => value + enter * direction[axis]),
            a.map((value, axis) => value + exit * direction[axis])
        ];
    }

    const api = { requireFiniteCell, fractionalToCartesian, cartesianToFractional, periodicFractionalCenter, nearestImageBetween, clipSegmentToCell, boundaryTranslationRanges, GeometryWorkLimitError };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalGeometry = api;
})(globalThis);
