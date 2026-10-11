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
