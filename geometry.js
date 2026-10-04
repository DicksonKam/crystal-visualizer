// Geometry independent of Three.js and the browser UI.
(function (root) {
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const subtract = (a, b) => a.map((value, index) => value - b[index]);
    const scale = (a, factor) => a.map(value => value * factor);
    const length = a => Math.sqrt(dot(a, a));
    const components = point => Array.isArray(point) ? point : [point.x, point.y, point.z];

    function fractionalToCartesian(fractional, lattice) {
        return [0, 1, 2].map(axis => fractional.reduce((sum, value, index) => sum + value * lattice[index][axis], 0));
    }

    function cartesianToFractional(point, lattice) {
        const [a, b, c] = lattice;
        const reciprocal = [cross(b, c), cross(c, a), cross(a, b)];
        const volume = dot(a, reciprocal[0]);
        if (Math.abs(volume) < 1e-10) return null;
        const position = components(point);
        return reciprocal.map(row => dot(position, row) / volume);
    }

    // Average positions on each periodic axis. A linear average puts atoms at
    // 0.99 and 0.01 on opposite sides of the cell instead of beside each other.
    function periodicFractionalCenter(positions) {
        if (!positions.length) return null;
        return [0, 1, 2].map(axis => {
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
    function nearestImageBetween(pointA, pointB, lattice) {
        const a = components(pointA);
        const b = components(pointB);
        const delta = subtract(b, a);
        const basis = lattice.map(vector => [...vector]);
        const q = [];
        const r = [Array(3).fill(0), Array(3).fill(0), Array(3).fill(0)];

        for (let column = 0; column < 3; column++) {
            let orthogonal = [...basis[column]];
            for (let row = 0; row < column; row++) {
                r[row][column] = dot(q[row], basis[column]);
                orthogonal = subtract(orthogonal, scale(q[row], r[row][column]));
            }
            r[column][column] = length(orthogonal);
            if (r[column][column] < 1e-10) {
                throw new Error('Cannot measure periodic distance: lattice has zero volume');
            }
            q[column] = scale(orthogonal, 1 / r[column][column]);
        }

        const target = q.map(axis => -dot(axis, delta));
        const candidate = [0, 0, 0];
        for (let row = 2; row >= 0; row--) {
            let remainder = target[row];
            for (let column = row + 1; column < 3; column++) {
                remainder -= r[row][column] * candidate[column];
            }
            candidate[row] = Math.round(remainder / r[row][row]);
        }

        function displacement(offset) {
            return delta.map((value, axis) => value + offset.reduce((sum, count, index) => sum + count * basis[index][axis], 0));
        }

        let bestOffset = [...candidate];
        let bestDelta = displacement(bestOffset);
        let bestSquared = dot(bestDelta, bestDelta);
        const trial = [0, 0, 0];

        function search(row, partialSquared) {
            if (row < 0) {
                const vector = displacement(trial);
                const squared = dot(vector, vector);
                if (squared < bestSquared - 1e-12) {
                    bestSquared = squared;
                    bestOffset = [...trial];
                    bestDelta = vector;
                }
                return;
            }
            let remainder = target[row];
            for (let column = row + 1; column < 3; column++) {
                remainder -= r[row][column] * trial[column];
            }
            const center = remainder / r[row][row];
            const radius = Math.sqrt(Math.max(0, bestSquared - partialSquared)) / r[row][row];
            for (let integer = Math.ceil(center - radius); integer <= Math.floor(center + radius); integer++) {
                const residual = r[row][row] * (integer - center);
                const nextSquared = partialSquared + residual * residual;
                if (nextSquared <= bestSquared + 1e-12) {
                    trial[row] = integer;
                    search(row - 1, nextSquared);
                }
            }
        }

        search(2, 0);
        return { offset: bestOffset.map(value => value || 0), delta: bestDelta, distance: Math.sqrt(bestSquared) };
    }

    // Clip a bond to the fractional bounds of the displayed cell or supercell.
    function clipSegmentToCell(pointA, pointB, lattice, repeats) {
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

    const api = { fractionalToCartesian, cartesianToFractional, periodicFractionalCenter, nearestImageBetween, clipSegmentToCell };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalGeometry = api;
})(globalThis);
