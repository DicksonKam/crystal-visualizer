const assert = require('node:assert/strict');
const test = require('node:test');
const { summarizeConstraints, zMidpoint } = require('../structure.js');

test('constraint summaries keep global and per-element counts consistent', () => {
    const summary = summarizeConstraints([
        { element: 'H', selectiveDynamics: [false, false, false] },
        { element: 'H', selectiveDynamics: [false, true, true] },
        { element: 'H', selectiveDynamics: [true, true, true] },
        { element: 'O' },
        { element: '__proto__', selectiveDynamics: [false, false, false] }
    ]);
    assert.deepEqual([summary.fixed, summary.partial, summary.free], [2, 1, 2]);
    assert.deepEqual(summary.byElement.get('H'), { fixed: 1, partial: 1, free: 1 });
    assert.deepEqual(summary.byElement.get('O'), { fixed: 0, partial: 0, free: 1 });
    assert.deepEqual(summary.byElement.get('__proto__'), { fixed: 1, partial: 0, free: 0 });
    assert.equal(summarizeConstraints([]).byElement.size, 0);
});

test('z midpoint remains finite for extreme coordinates and handles empty or one-atom structures', () => {
    const midpoint = values => zMidpoint(values.map(z => ({ position: { z } })));
    assert.equal(midpoint([]), 0);
    assert.equal(midpoint([-3]), -3);
    assert.equal(midpoint([-10, 2, 10]), 0);
    assert.equal(midpoint([1e308, 1.2e308]), 1.1e308);
    assert.equal(midpoint([-1e308, -1.2e308]), -1.1e308);
    assert.equal(midpoint([-1e308, 1e308]), 0);
});
