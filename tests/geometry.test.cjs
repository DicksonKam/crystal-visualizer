const assert = require('node:assert/strict');
const test = require('node:test');
const { requireFiniteCell, fractionalToCartesian, cartesianToFractional, periodicFractionalCenter, nearestImageBetween, clipSegmentToCell } = require('../geometry.js');
const { boundaryTranslationRanges, GeometryWorkLimitError } = require('../geometry.js');

test('cell validation and coordinate conversion reject non-finite results', () => {
    assert.equal(requireFiniteCell([[2, 0, 0], [0, 3, 0], [0, 0, -4]]), -24);
    const overflowing = [[2e103, 0, 0], [0, 2e103, 0], [0, 0, 1e102]];
    assert.throws(() => requireFiniteCell(overflowing), /volume is not finite/);
    assert.equal(cartesianToFractional([1, 1, 1], overflowing), null);
    assert.throws(() => requireFiniteCell([[Infinity, 0, 0], [0, 1, 0], [0, 0, 1]]), /non-finite coordinates/);
    assert.throws(() => requireFiniteCell([[1, 0, 0], [2, 0, 0], [0, 0, 1]]), /zero volume/);
    assert.equal(cartesianToFractional([1e308, 0, 0], [[10, 0, 0], [0, 10, 0], [0, 0, 10]]), null);
});

test('coordinate conversion round-trips arrays and objects in a tilted cell', () => {
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    const fractional = [0.2, 0.35, 0.7];
    const position = fractionalToCartesian(fractional, lattice);
    const restored = cartesianToFractional({ x: position[0], y: position[1], z: position[2] }, lattice);
    restored.forEach((value, axis) => assert.ok(Math.abs(value - fractional[axis]) < 1e-12));
    assert.equal(cartesianToFractional(position, [[1, 0, 0], [2, 0, 0], [0, 0, 1]]), null);
});

test('nearest images honor every periodic-axis mask in tilted cells', () => {
    const lattice = [[4, 0, 0], [1.3, 3, 0], [0.4, 0.7, 5]];
    for (let mask = 0; mask < 8; mask++) {
        const axes = [0, 1, 2].map(axis => Boolean(mask & (1 << axis)));
        for (let sample = 0; sample < 12; sample++) {
            const a = fractionalToCartesian([sample * 0.137 - 0.4, 0.2, sample * 0.211], lattice);
            const b = fractionalToCartesian([1.8 - sample * 0.117, sample * 0.193, -0.7], lattice);
            const result = nearestImageBetween(a, b, lattice, axes);
            let exhaustive = Infinity;
            const ranges = axes.map(enabled => enabled ? [-4, -3, -2, -1, 0, 1, 2, 3, 4] : [0]);
            for (const i of ranges[0]) for (const j of ranges[1]) for (const k of ranges[2]) {
                const translated = fractionalToCartesian([i, j, k], lattice);
                exhaustive = Math.min(exhaustive, Math.hypot(...b.map((value, axis) => value + translated[axis] - a[axis])));
            }
            assert.ok(Math.abs(result.distance - exhaustive) < 1e-10, `mask ${mask}, sample ${sample}`);
            axes.forEach((enabled, axis) => { if (!enabled) assert.equal(result.offset[axis], 0); });
        }
    }
    const distant = nearestImageBetween([0, 0, 0], [9, 1e12, 0], [[10, 0, 0], [0, 10, 0], [0, 0, 10]], [true, false, false]);
    assert.deepEqual(distant.offset, [-1, 0, 0]);
    assert.deepEqual(distant.delta, [-1, 1e12, 0]);
});

test('centering and bond clipping wrap only periodic axes', () => {
    const center = periodicFractionalCenter([[0.99, -2, -1], [0.01, 2, 1]], [true, false, false]);
    assert.ok(Math.abs(center[0]) < 1e-10 || Math.abs(center[0] - 1) < 1e-10);
    assert.equal(center[1], 0);
    assert.equal(center[2], 0);
    const clipped = clipSegmentToCell([-1, 20, 0], [1, 20, 0], [[10, 0, 0], [0, 10, 0], [0, 0, 10]], [1, 1, 1], [true, false, false]);
    assert.deepEqual(clipped, [[0, 20, 0], [1, 20, 0]]);
});

test('periodic center keeps atoms together across a cell boundary', () => {
    const center = periodicFractionalCenter([[0.99, 0.5, 0.5], [0.01, 0.5, 0.5]]);
    assert.ok(Math.min(center[0], 1 - center[0]) < 1e-12);
    assert.ok(Math.abs(center[1] - 0.5) < 1e-12);
    assert.equal(periodicFractionalCenter([]), null);
    assert.ok(Math.abs(periodicFractionalCenter([[0, 0, 0], [0.5, 0.5, 0.5]])[0] - 0.25) < 1e-12);
});

function bruteNearest(a, b, lattice, range = 4) {
    let distance = Infinity;
    for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
            for (let k = -range; k <= range; k++) {
                const delta = [0, 1, 2].map(axis => b[axis] - a[axis]
                    + i * lattice[0][axis] + j * lattice[1][axis] + k * lattice[2][axis]);
                distance = Math.min(distance, Math.hypot(...delta));
            }
        }
    }
    return distance;
}

test('minimum image crosses a cubic cell boundary', () => {
    const result = nearestImageBetween([0.1, 0, 0], [9.9, 0, 0], [[10, 0, 0], [0, 10, 0], [0, 0, 10]]);
    assert.deepEqual(result.offset, [-1, 0, 0]);
    assert.ok(Math.abs(result.distance - 0.2) < 1e-12);
});

test('tilted-cell nearest image agrees with exhaustive lattice search', () => {
    const lattices = [
        [[2, 0, 0], [1.8, 0.4, 0], [0.2, 0.1, 5]],
        [[3, 0, 0], [1.1, 2, 0], [0.4, 0.7, 2.5]],
        [[4, 0.2, 0], [-1.5, 3, 0], [0.5, -1.2, 2]]
    ];
    const points = [[0.1, 0.2, 0.3], [1.7, 0.35, 0.1], [3.8, -0.2, 1.9]];
    for (const lattice of lattices) {
        for (const a of points) {
            for (const b of points) {
                const result = nearestImageBetween(a, b, lattice);
                assert.ok(Math.abs(result.distance - bruteNearest(a, b, lattice)) < 1e-10);
            }
        }
    }
});

test('translated copies and singular lattices are handled', () => {
    const lattice = [[2, 0, 0], [0, 2, 0], [0, 0, 2]];
    const result = nearestImageBetween([0, 0, 0], [6.1, 0, 0], lattice);
    assert.deepEqual(result.offset, [-3, 0, 0]);
    assert.ok(Math.abs(result.distance - 0.1) < 1e-12);
    assert.throws(() => nearestImageBetween([0, 0, 0], [1, 1, 1], [[1, 0, 0], [2, 0, 0], [0, 0, 1]]), /zero volume/);
});

test('periodic bond segments clip at cell faces in cubic and tilted cells', () => {
    const cubic = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
    const segment = clipSegmentToCell([0.4, 0, 0], [-0.4, 0, 0], cubic, [1, 1, 1]);
    assert.ok(Math.abs(segment[0][0] - 0.4) < 1e-10);
    assert.ok(Math.abs(segment[1][0]) < 1e-10);
    const tilted = [[2, 0, 0], [1.5, 2, 0], [0, 0, 3]];
    const edge = [3.5, 2, 0];
    const clipped = clipSegmentToCell([3.2, 1.8, 0], [3.8, 2.2, 0], tilted, [1, 1, 1]);
    assert.ok(Math.hypot(...clipped[1].map((x, i) => x - edge[i])) < 1e-10);
    assert.equal(clipSegmentToCell([-2, 0, 0], [-1, 0, 0], cubic, [1, 1, 1]), null);
});

test('near-degenerate periodic distances complete within a bounded process deadline', () => {
    const { execFileSync } = require('node:child_process');
    const output = execFileSync(process.execPath, ['-e', `
        const g = require('./geometry.js');
        const lattice = [[1, 0, 0], [1, 1e-8, 0], [0, 0, 1]];
        g.requireFiniteCell(lattice);
        console.log(JSON.stringify(g.nearestImageBetween([0, 0, 0], [.5, .25, 0], lattice)));
    `], { cwd: require('node:path').resolve(__dirname, '..'), timeout: 1500, encoding: 'utf8' });
    const result = JSON.parse(output);
    assert.equal(result.distance, 0.5);
    assert.deepEqual(result.delta, [0.5, 0, 0]);
    assert.deepEqual(result.offset, [25000000, -25000000, 0]);
});

test('reduced-basis measurements preserve exact distances and offsets in the source basis', () => {
    const lattice = [[1, 0, 0], [1000000, 1, 0], [3000001, 3, 1]];
    for (let sample = 0; sample < 40; sample++) {
        const point = [sample * 0.123 - 2, sample * 0.197 - 3, sample * 0.217 - 4];
        const result = nearestImageBetween([0, 0, 0], point, lattice);
        const expected = Math.hypot(...point.map(value => value - Math.round(value)));
        assert.ok(Math.abs(result.distance - expected) < 1e-8);
        const translation = fractionalToCartesian(result.offset, lattice);
        result.delta.forEach((value, axis) => assert.ok(Math.abs(value - point[axis] - translation[axis]) < 1e-8));
    }
    assert.throws(() => nearestImageBetween([0, 0, 0], [1e20, 0, 0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]), GeometryWorkLimitError);
});

test('boundary bond workload is rejected before allocating huge ranges', () => {
    const thin = [[1, 0, 0], [1, 1e-8, 0], [0, 0, 1]];
    assert.throws(() => boundaryTranslationRanges([[0, 0, 0]], thin, [1, 1, 1], [true, true, true], 2.5), /work limit/);
    const ordinary = boundaryTranslationRanges([[0.1, 0, 0]], [[10, 0, 0], [0, 10, 0], [0, 0, 10]], [1, 1, 1], [true, false, false], 2.5);
    assert.deepEqual(ordinary, [[[0, 1], [0, 0], [0, 0]]]);
    assert.throws(() => boundaryTranslationRanges([[1e20, 0, 0]], [[10, 0, 0], [0, 10, 0], [0, 0, 10]], [1, 1, 1], [true, true, true], 2.5), /integer precision/);
});

test('nearest-image accuracy does not depend on an absolute squared-distance tolerance', () => {
    const lattice = [[1.2e-5, 0, 0], [6e-6, 1.2e-5, 0], [0, 0, 1]];
    requireFiniteCell(lattice);
    const point = [8.99e-6, 6e-6, 0];
    const result = nearestImageBetween([0, 0, 0], point, lattice);
    assert.ok(Math.abs(result.distance - bruteNearest([0, 0, 0], point, lattice, 2)) < 1e-15);
});
