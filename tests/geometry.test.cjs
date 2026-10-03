const assert = require('node:assert/strict');
const test = require('node:test');
const { nearestImageBetween, clipSegmentToCell } = require('../geometry.js');

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
