const test = require('node:test');
const assert = require('node:assert/strict');
const { createMeasurements } = require('../measurement.js');
const measurements = createMeasurements();
const atoms = positions => positions.map(position => ({ position }));
const close = (a, b, epsilon = 1e-10) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('distances, signed displacements and angle share the actual selected positions', () => {
    const selected = atoms([[.1, 0, 0], [9.9, 0, 0], [9.9, 2, 0]]);
    const source = JSON.stringify(selected);
    const result = measurements.resolve(selected);
    assert.deepEqual(result.points.map(point => point.position), selected.map(atom => atom.position));
    close(result.pairs[0].distance, 9.8);
    close(result.pairs[0].delta[0], 9.8);
    close(result.pairs[1].distance, 2);
    close(result.angle.angleDeg, 90);
    assert.strictEqual(result.pairs[0].end, result.pairs[1].start);
    assert.strictEqual(result.angle.vertex, result.pairs[0].end);
    assert.strictEqual(result.angle.first, result.pairs[0].start);
    assert.strictEqual(result.angle.third, result.pairs[1].end);
    assert.equal(JSON.stringify(selected), source);
});

test('adding the third atom never changes the first measured arm', () => {
    for (const first of [[.1, 0, 0], [0, 0, 0], [10, 0, 0]]) {
        const selected = atoms([first, [5, 0, 0], [5, 2, 0]]);
        const pair = measurements.resolve(selected.slice(0, 2));
        const triple = measurements.resolve(selected);
        assert.deepEqual(triple.pairs[0], pair.pairs[0]);
        assert.deepEqual(triple.points[0], pair.points[0]);
        close(triple.angle.angleDeg, 90);
    }
});

test('ghost copies are measured at their selected world positions', () => {
    const selected = atoms([[.1, 0, 0], [19.9, 0, 0], [19.9, 2, 0]]);
    selected[1].isGhost = true;
    const result = measurements.resolve(selected);
    close(result.pairs[0].distance, 19.8);
    close(result.angle.angleDeg, 90);
    assert.deepEqual(result.points.map(point => point.position), selected.map(atom => atom.position));
});

test('invalid coordinates and unrepresentable distances omit the affected arm and angle', () => {
    for (const first of [[NaN, 0, 0], [Infinity, 0, 0], [-1e308, 0, 0]]) {
        const result = measurements.resolve(atoms([first, [1e308, 0, 0], [1e308, 1, 0]]));
        assert.equal(result.pairs[0].unavailable, true);
        assert.equal(result.pairs[0].distance, null);
        close(result.pairs[1].distance, 1);
        assert.equal(result.angle, null);
        assert.ok(result.errors.length);
    }
    assert.equal(measurements.resolve([]).pairs.length, 0);
    assert.equal(measurements.resolve(atoms([[0, 0, 0]])).angle, null);
});

test('large finite coordinates require no periodic search or safe-integer offsets', () => {
    const result = measurements.resolve(atoms([[1e20, 0, 0], [0, 0, 0], [0, 1, 0]]));
    assert.equal(result.pairs[0].distance, 1e20);
    assert.equal(result.pairs[0].unavailable, false);
    assert.deepEqual(result.errors, []);
    close(result.angle.angleDeg, 90);
});

test('coincident and collinear selections remain finite, with correct zero and straight angles', () => {
    for (const [positions, expected] of [
        [[[0, 0, 0], [1, 0, 0], [2, 0, 0]], 180],
        [[[0, 0, 0], [1, 0, 0], [-1, 0, 0]], 0],
        [[[0, 0, 0], [0, 0, 0], [2, 0, 0]], null]
    ]) {
        const result = measurements.resolve(atoms(positions));
        if (expected === null) assert.equal(result.angle, null);
        else {
            close(result.angle.angleDeg, expected);
            assert.ok([...result.angle.firstDirection, ...result.angle.thirdDirection].every(Number.isFinite));
        }
    }
    const large = measurements.resolve(atoms([[1e160, 0, 0], [0, 0, 0], [0, 1e160, 0]]));
    assert.ok(large.pairs.every(pair => !pair.unavailable));
    close(large.angle.angleDeg, 90);
});

test('the silicon example measures the selected atoms without translating an endpoint', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const THREE = require('three');
    const geometry = require('../geometry.js');
    const { createFormats } = require('../formats.js');
    const silicon = createFormats(THREE.Vector3, geometry.cartesianToFractional).parsePOSCAR(
        fs.readFileSync(path.resolve(__dirname, '../examples/poscar/Si_diamond.poscar'), 'utf8'));
    const selected = [1, 6, 4].map(index => silicon.atoms[index]);
    const result = measurements.resolve(selected);
    assert.equal(result.pairs[0].distance.toFixed(3), '4.503');
    assert.equal(result.pairs[1].distance.toFixed(3), '3.840');
    assert.equal(result.angle.angleDeg.toFixed(1), '31.5');
    result.points.forEach((point, i) => assert.deepEqual(point.position, selected[i].position.toArray()));
    assert.strictEqual(result.angle.vertex, result.pairs[0].end);
    assert.strictEqual(result.pairs[0].end, result.pairs[1].start);
});
