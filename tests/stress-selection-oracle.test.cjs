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
    // A copy on the far face of the displayed region is drawn even at 1×1×1.
    const geometry = { lattice: [[10, 0, 0], [0, 10, 0], [0, 0, 10]], atoms: [{ position: [0, 0, 0] }, {}, {}, {}, { position: [5, 5, 5] }] };
    const onFace = { ...state, geometry, periodicAxes: [true, true, true] };
    assert.deepEqual(displayedSelection(selection, onFace), selection);
    assert.deepEqual(displayedSelection(selection, { ...onFace, periodicAxes: [true, false, true] }), { ...selection, identities: [real] });
    const interior = ['ghost_4_010', true, { a: 0, b: 1, c: 0 }];
    assert.deepEqual(displayedSelection({ ...selection, identities: [interior, real] }, onFace), { ...selection, identities: [real] });
});
