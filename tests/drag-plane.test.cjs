const test = require('node:test');
const assert = require('node:assert/strict');
const { cellPlaneSection, fractionalToCartesian } = require('../geometry.js');

const cube = [[4, 0, 0], [0, 4, 0], [0, 0, 4]];
const tilted = [[4, 0.5, 0.2], [1, 5, 0.4], [0.3, 0.8, 6]];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm = a => Math.hypot(...a);

for (const [name, lattice] of [['cube', cube], ['tilted', tilted]]) {
    test(`${name}: all boundary faces include all four corners despite roundoff`, () => {
        for (let axis = 0; axis < 3; axis++) for (const side of [0, 1]) {
            const remaining = [0, 1, 2].filter(i => i !== axis);
            const faceNormal = cross(lattice[remaining[0]], lattice[remaining[1]]);
            const normal = faceNormal.map((v, i) => v / norm(faceNormal) + (i === 0 ? 1e-15 : -1e-15));
            // Test corner, edge and face-interior anchors, with numerical drift.
            for (const fraction of [[0, 0, 0], [0, 0.5, 0], [0, 0.5, 0.5]]) {
                const f = [...fraction]; f[axis] = side;
                const point = fractionalToCartesian(f, lattice).map(v => v + 1e-14);
                const section = cellPlaneSection(lattice, point, normal);
                assert.equal(section.length, 4, `axis ${axis}, side ${side}`);
                for (const u of [0, 1]) for (const v of [0, 1]) {
                    const expected = [0, 0, 0]; expected[axis] = side;
                    expected[remaining[0]] = u; expected[remaining[1]] = v;
                    const corner = fractionalToCartesian(expected, lattice);
                    assert.ok(section.some(vertex => norm(vertex.map((x, i) => x - corner[i])) < 1e-9));
                }
            }
        }
    });
}

test('sections retain true oblique slices, tangent edges/corners and empty planes', () => {
    assert.equal(cellPlaneSection(cube, [2, 2, 2], [1, 1, 1]).length, 6);
    assert.equal(cellPlaneSection(cube, [0, 0, 0], [1, 1, 1]).length, 1);
    assert.equal(cellPlaneSection(cube, [0, 0, 0], [1, 1, 0]).length, 2);
    assert.equal(cellPlaneSection(cube, [5, 0, 0], [1, 0, 0]).length, 0);
    const triangle = cellPlaneSection(cube, [0, 0, 0], [1, 1, -1]);
    assert.equal(triangle.length, 3);
    assert.ok(triangle.every(p => Math.abs(p[0]+p[1]-p[2]) < 1e-12));
});

test('boundary classification scales with cell size', () => {
    for (const scale of [1e-6, 1, 1e6]) {
        const lattice = cube.map(row => row.map(v => v * scale));
        assert.equal(cellPlaneSection(lattice, [0, 0, 0], [1, 1e-15, -1e-15]).length, 4);
        assert.equal(cellPlaneSection(lattice, [2*scale, 0, 0], [1, 0, 0]).length, 4);
    }
});
