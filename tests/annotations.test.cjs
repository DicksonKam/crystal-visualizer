const { test } = require('node:test');
const assert = require('node:assert/strict');
const { placeLabels } = require('../annotations.js');
const intersects = (a, b) => Math.abs(a.x - b.x) < (a.width + b.width) / 2 + 3.99
    && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + 3.99;

test('unobstructed measurement labels retain their anchor and proportions', () => {
    const label = { x: 150, y: 100, width: 72, height: 18, depth: .2 };
    assert.deepEqual(placeLabels([label], [], { width: 300, height: 200 }), [label]);
});

test('crowded distance and angle labels avoid each other and atom markers deterministically', () => {
    const labels = [72, 72, 45].map(width => ({ x: 150, y: 100, width, height: 18 }));
    const markers = [{ x: 150, y: 100, width: 14, height: 14 }];
    const original = JSON.stringify({ labels, markers });
    const placed = placeLabels(labels, markers, { width: 300, height: 200 });
    placed.forEach((label, index) => {
        for (const occupied of [...markers, ...placed.slice(0, index)]) assert.equal(intersects(label, occupied), false);
        assert.ok(Math.hypot(label.x - labels[index].x, label.y - labels[index].y) <= Math.SQRT2 * 96);
    });
    assert.equal(JSON.stringify({ labels, markers }), original);
    assert.deepEqual(placeLabels(labels, markers, { width: 300, height: 200 }), placed);
});

test('labels near viewport edges remain within the visible area', () => {
    const labels = [{ x: 2, y: 2, width: 72, height: 18 }, { x: 298, y: 198, width: 45, height: 18 }];
    const placed = placeLabels(labels, [], { width: 300, height: 200 });
    for (const label of placed) {
        assert.ok(label.x - label.width / 2 >= 4);
        assert.ok(label.x + label.width / 2 <= 296);
        assert.ok(label.y - label.height / 2 >= 4);
        assert.ok(label.y + label.height / 2 <= 196);
    }
});

test('viewport clamping retains collisions far from the original anchor', () => {
    const label = { x: 0, y: 200, width: 400, height: 100 };
    const obstacle = { x: 400, y: 200, width: 50, height: 50 };
    const [placed] = placeLabels([label], [obstacle], { width: 900, height: 400 });
    const separated = Math.abs(placed.x - obstacle.x) >= (placed.width + obstacle.width) / 2 + 4
        || Math.abs(placed.y - obstacle.y) >= (placed.height + obstacle.height) / 2 + 4;
    assert.equal(separated, true);
    assert.ok(placed.x - placed.width / 2 >= 4);
    assert.ok(placed.x + placed.width / 2 <= 896);
    assert.ok(placed.y - placed.height / 2 >= 4);
    assert.ok(placed.y + placed.height / 2 <= 396);
});


test('close-view atom bodies can move a caption beyond the local search radius', () => {
    const label = { x: 500, y: 400, width: 100, height: 40 };
    const body = { x: 500, y: 400, width: 320, height: 320 };
    const [placed] = placeLabels([label], [body], { width: 1000, height: 800 });
    assert.equal(intersects(placed, body), false);
    assert.ok(Math.hypot(placed.x - label.x, placed.y - label.y) > 96);
    assert.equal(placed.width, label.width);
    assert.equal(placed.height, label.height);
});

test('perimeter fallback checks obstacles outside the original search area', () => {
    const label = { x: 500, y: 400, width: 100, height: 40 };
    const bodies = [{ x: 500, y: 400, width: 320, height: 320 },
        { x: 500, y: 210, width: 120, height: 40 }];
    const [placed] = placeLabels([label], bodies, { width: 1000, height: 800 });
    for (const body of bodies) assert.equal(intersects(placed, body), false);
});
