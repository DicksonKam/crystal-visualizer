const { test } = require('node:test');
const assert = require('node:assert/strict');
const { displayedSelection } = require('./stress/edit-scenario.cjs');
test('stress selection oracle omits hidden periodic copies from selections and measurements', () => {
    const hidden = ['ghost_0_010', true, { a: 0, b: 1, c: 0 }];
    const real = [4, false, null];
    const selection = { mode: 'edit', identities: [real], measurements: [[hidden, real]] };
    const state = { periodic: true, atomCount: 5, repeats: { a: 1, b: 1, c: 1 } };
    assert.deepEqual(displayedSelection(selection, state), { ...selection, measurements: [[real]] });
    assert.deepEqual(displayedSelection(selection, { ...state, repeats: { a: 1, b: 2, c: 1 } }), selection);
    // A measurement left without displayed points is dropped, not kept empty.
    assert.deepEqual(displayedSelection({ ...selection, measurements: [[hidden]] }, state), { ...selection, measurements: [] });
    // Deleted atoms leave the edit selection; order is kept.
    assert.deepEqual(displayedSelection({ ...selection, identities: [[7, false, null], real] }, state), { ...selection, identities: [real], measurements: [[real]] });
    assert.equal(selection.measurements[0].length, 2);
    // A copy on the far face of the displayed region is drawn even at 1×1×1.
    const geometry = { lattice: [[10, 0, 0], [0, 10, 0], [0, 0, 10]], atoms: [{ position: [0, 0, 0] }, {}, {}, {}, { position: [5, 5, 5] }] };
    const onFace = { ...state, geometry, periodicAxes: [true, true, true] };
    assert.deepEqual(displayedSelection(selection, onFace), selection);
    assert.deepEqual(displayedSelection(selection, { ...onFace, periodicAxes: [true, false, true] }), { ...selection, measurements: [[real]] });
    const interior = ['ghost_4_010', true, { a: 0, b: 1, c: 0 }];
    assert.deepEqual(displayedSelection({ ...selection, measurements: [[interior, real]] }, onFace), { ...selection, measurements: [[real]] });
});
