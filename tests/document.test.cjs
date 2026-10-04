const assert = require('node:assert/strict');
const test = require('node:test');
const documentModel = require('../document.js');
const { createFormats } = require('../formats.js');
const { cartesianToFractional } = require('../geometry.js');
const { buildSupercell } = require('../structure.js');
class Vector3 { constructor(x, y, z) { Object.assign(this, { x, y, z }); } }
const formats = createFormats(Vector3, cartesianToFractional);
const source = () => formats.parsePOSCAR('groups\n1\n10 0 0\n0 10 0\n0 0 10\nH H\n1 1\nCartesian\n0 0 0\n1 0 0\n');

test('deleting, restoring, adding and copying atoms retain independent species groups', () => {
    const structure = source();
    const removed = structure.atoms.shift();
    documentModel.recalculateCounts(structure);
    assert.deepEqual(structure.counts, [0, 1]);
    assert.deepEqual(formats.parsePOSCAR(formats.generatePOSCAR(structure)).counts, [0, 1]);
    structure.atoms.unshift(removed);
    documentModel.recalculateCounts(structure);
    const prepared = buildSupercell(structure, [2, 1, 1]);
    Object.assign(structure, prepared);
    documentModel.recalculateCounts(structure);
    assert.deepEqual(structure.counts, [2, 2]);
    assert.equal(new Set(structure.atoms.map(atom => atom.id)).size, 4);
    assert.equal(formats.parsePOSCAR(formats.generatePOSCAR(structure)).atoms.length, 4);
    assert.throws(() => documentModel.prepareNewAtom(structure, { element: 'H' }), /Choose which/);
    const added = documentModel.prepareNewAtom(structure, { element: 'H' }, structure.speciesGroups[1].id);
    assert.equal(added.atom.speciesId, structure.speciesGroups[1].id);
    assert.ok(!structure.atoms.some(atom => atom.id === added.atom.id));
});

test('capabilities distinguish molecules, cells, mixed periodicity, constraints and trajectories', () => {
    assert.deepEqual(documentModel.capabilities(null), { cell: false, periodicAxes: [false, false, false], editable: false, constraints: false });
    assert.equal(documentModel.capabilities({ isXYZ: true }).cell, false);
    assert.deepEqual(documentModel.capabilities({ isXYZ: true, hasExplicitLattice: true, pbc: [true, false, false] }).periodicAxes, [true, false, false]);
    assert.equal(documentModel.capabilities(source()).constraints, true);
    assert.equal(documentModel.capabilities({ isXDATCAR: true }).editable, false);
});

test('XYZ atom order may interleave elements without changing species membership', () => {
    const structure = formats.parseXYZ('3\nwater\nH 0 0 0\nO 1 0 0\nH 2 0 0\n');
    documentModel.recalculateCounts(structure);
    assert.deepEqual(structure.counts, [2, 1]);
    assert.deepEqual(documentModel.groupedAtoms(structure).map(group => group.atoms.map(atom => atom.position.x)), [[0, 2], [1]]);
});

test('coordinate preparation rejects malformed molecule coordinates without changing its document', () => {
    const molecule = { isXYZ: true, atoms: [], lattice: null };
    for (const point of [[], [1, 2], [1, 2, 3, 4], [NaN, 0, 0]]) {
        assert.throws(() => documentModel.preparePositions(molecule, [point]), /three finite/);
    }
    assert.deepEqual(documentModel.preparePositions(molecule, [[1, 2, 3]]), [{ position: { x: 1, y: 2, z: 3 }, fractional: null }]);
    assert.deepEqual(molecule, { isXYZ: true, atoms: [], lattice: null });
});
