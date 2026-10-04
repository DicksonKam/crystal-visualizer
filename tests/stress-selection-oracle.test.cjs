const { test } = require('node:test');
const assert = require('node:assert/strict');
const { displayedSelection } = require('./stress/edit-scenario.cjs');
test('stress selection oracle omits hidden periodic copies without losing ordered visible selections', () => {
    const hidden = ['ghost_0_010', true, { a: 0, b: 1, c: 0 }];
    const real = [4, false, null];
    const selection = { mode: 'edit', measurement: true, identities: [hidden, real] };
    const state = { periodic: true, atomCount: 5, repeats: { a: 1, b: 1, c: 1 } };
    assert.deepEqual(displayedSelection(selection, state), { ...selection, identities: [real] });
    assert.deepEqual(displayedSelection(selection, { ...state, repeats: { a: 1, b: 2, c: 1 } }), selection);
    assert.deepEqual(displayedSelection({ ...selection, identities: [hidden] }, state), { ...selection, measurement: false, identities: [] });
    assert.equal(selection.identities.length, 2);
});
