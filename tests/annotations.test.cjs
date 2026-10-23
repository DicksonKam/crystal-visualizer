const { test } = require('node:test');
const assert = require('node:assert/strict');
const { separateLabels } = require('../annotations.js');
const clear = (a, b, gap = 4) => Math.abs(a.x - b.x) >= (a.width + b.width) / 2 + gap || Math.abs(a.y - b.y) >= (a.height + b.height) / 2 + gap;
const at = (x, y, extra = {}) => ({ x, y, width: 80, height: 20, slide: { x: 0, y: 1 }, flip: true, ...extra });

test('captions that cover nothing stay exactly on their anchors', () => {
    const labels = [at(100, 100), at(300, 100), at(100, 300, { slide: { x: 1, y: 0 } })];
    assert.deepEqual(separateLabels(labels), labels);
});

test('a caption covering an earlier caption slides along its own direction until clear', () => {
    const [first, second] = separateLabels([at(100, 100), at(110, 105)]);
    assert.deepEqual([first.x, first.y], [100, 100]);
    assert.equal(second.x, 110);
    assert.equal(second.y, 125);
    assert.ok(clear(first, second));
});

test('a flippable caption moves away from what it covers', () => {
    const [, second] = separateLabels([at(100, 100), at(110, 95)]);
    assert.equal(second.y, 75);
});

test('the angle caption keeps its outward direction and clears the vertex marker', () => {
    const marker = { x: 100, y: 100, width: 30, height: 30 };
    const [angle] = separateLabels([at(100, 95, { width: 60, flip: false, obstacles: [marker] })]);
    assert.equal(angle.y, 135);
    assert.ok(clear(angle, marker));
});

test('separation is bounded and deterministic for stacked captions', () => {
    const stacked = separateLabels([at(100, 100), at(100, 100), at(100, 100)]);
    assert.deepEqual(stacked.map(label => label.y), [100, 130, 160]);
    assert.deepEqual(separateLabels([at(100, 100), at(100, 100), at(100, 100)]), stacked);
    const [capped] = separateLabels([{ x: 0, y: 0, width: 10, height: 10, slide: { x: 0, y: 1 }, obstacles: [{ x: 0, y: 0, width: 10000, height: 10000 }] }]);
    assert.equal(capped.y, 60);
});
