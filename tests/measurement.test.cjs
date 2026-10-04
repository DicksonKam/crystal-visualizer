const test = require('node:test');
const assert = require('node:assert/strict');
const geometry = require('../geometry.js');
const { createMeasurements } = require('../measurement.js');
const measurements = createMeasurements(geometry);
const cubic = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
const options = { lattice: cubic, nearest: true };
const atoms = positions => positions.map(position => ({ position }));
const close = (a, b, epsilon = 1e-10) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('periodic lines, displacement, angle and image notes share one geometry around atom 2', () => {
    const selected = atoms([[.1, 0, 0], [9.9, 0, 0], [9.9, 2, 0]]);
    const source = JSON.stringify(selected);
    const result = measurements.resolve(selected, options);
    assert.deepEqual(result.points.map(point => point.offset), [[1, 0, 0], [0, 0, 0], [0, 0, 0]]);
    close(result.points[0].position[0], 10.1);
    close(result.pairs[0].distance, .2);
    close(result.pairs[0].delta[0], -.2);
    close(result.pairs[1].distance, 2);
    close(result.angle.angleDeg, 90);
    assert.strictEqual(result.pairs[0].end, result.pairs[1].start);
    assert.strictEqual(result.angle.vertex, result.pairs[0].end);
    assert.strictEqual(result.angle.first, result.pairs[0].start);
    assert.strictEqual(result.angle.third, result.pairs[1].end);
    assert.strictEqual(result.pairs[0].images[0], result.points[0]);
    assert.deepEqual(result.pairs[0].offset, [-1, 0, 0]);
    assert.equal(JSON.stringify(selected), source);
});

test('adding the third atom does not change the first image, including half-cell ties', () => {
    for (const first of [[.1, 0, 0], [0, 0, 0], [10, 0, 0]]) {
        const selected = atoms([first, [5, 0, 0], [5, 2, 0]]);
        const pair = measurements.resolve(selected.slice(0, 2), options);
        const triple = measurements.resolve(selected, options);
        assert.deepEqual(triple.pairs[0], pair.pairs[0]);
        assert.deepEqual(triple.points[0], pair.points[0]);
        close(triple.angle.angleDeg, 90);
    }
});

test('skewed cells and mixed periodicity resolve only allowed lattice shifts around the same vertex', () => {
    const lattice = [[10, 0, 0], [4, 8, 0], [1, 2, 9]];
    const periodicAxes = [true, true, false];
    const selected = atoms([[.01, .02, .4], [.99, .98, .7], [.97, .99, .9]].map(point => geometry.fractionalToCartesian(point, lattice)));
    const result = measurements.resolve(selected, { lattice, periodicAxes, nearest: true });
    for (const index of [0, 2]) {
        const image = geometry.nearestImageBetween(selected[1].position, selected[index].position, lattice, periodicAxes);
        assert.deepEqual(result.points[index].offset, image.offset);
        assert.equal(result.points[index].offset[2], 0);
        result.points[index].position.forEach((value, axis) => close(value, selected[1].position[axis] + image.delta[axis]));
    }
    const first = result.pairs[0].delta.map(value => -value / result.pairs[0].distance);
    const third = result.pairs[1].delta.map(value => value / result.pairs[1].distance);
    close(result.angle.angleDeg, Math.acos(first.reduce((sum, value, axis) => sum + value * third[axis], 0)) * 180 / Math.PI);
});

test('selected images, molecules and ghost selections keep their displayed copies', () => {
    const selected = atoms([[.1, 0, 0], [9.9, 0, 0], [9.9, 9.8, 0]]);
    for (const config of [{ lattice: cubic, nearest: false }, { nearest: true }]) {
        const result = measurements.resolve(selected, config);
        assert.deepEqual(result.points.map(point => point.position), selected.map(atom => atom.position));
        assert.ok(result.points.every(point => !point.isImage));
        close(result.pairs[0].distance, 9.8);
    }
    selected[0].isGhost = true;
    let result = measurements.resolve(selected, options);
    assert.equal(result.points[0].isImage, false);
    assert.equal(result.points[2].isImage, true);
    selected[1].isGhost = true;
    result = measurements.resolve(selected, options);
    assert.ok(result.points.every(point => !point.isImage));
});

test('unreliable periodic work stays unavailable without fabricating an image or angle', () => {
    const result = measurements.resolve(atoms([[1e20, 0, 0], [0, 0, 0], [1, 0, 0]]), options);
    assert.equal(result.pairs[0].unavailable, true);
    assert.equal(result.pairs[0].distance, null);
    assert.equal(result.points[0].isImage, false);
    close(result.pairs[1].distance, 1);
    assert.equal(result.angle, null);
    assert.match(result.errors.join(), /integer precision/);
    assert.equal(measurements.resolve([], options).pairs.length, 0);
    assert.equal(measurements.resolve(atoms([[0, 0, 0]]), options).angle, null);
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
