const assert = require('node:assert/strict');
const test = require('node:test');
const { buildSupercell, prepareCellResize, summarizeConstraints, zMidpoint } = require('../structure.js');
const { fractionalToCartesian } = require('../geometry.js');

test('supercells prepare tilted-cell copies with current fractional coordinates and independent constraints', () => {
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    const fractional = [0.2, 0.35, 0.7];
    const coordinates = fractionalToCartesian(fractional, lattice);
    const source = { lattice, atoms: [{ element: 'Si', position: { x: coordinates[0], y: coordinates[1], z: coordinates[2] }, fractional, selectiveDynamics: [false, true, false] }] };
    const before = JSON.stringify(source);
    const prepared = buildSupercell(source, [2, 3, 1]);
    const expectedLattice = [[4, 0, 0], [2.4, 9, 0], [0.4, 0.5, 4]];
    prepared.lattice.forEach((vector, axis) => vector.forEach((value, component) => assert.ok(Math.abs(value - expectedLattice[axis][component]) < 1e-12)));
    assert.equal(prepared.atoms.length, 6);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) {
        const atom = prepared.atoms[a * 3 + b];
        const expected = [(fractional[0] + a) / 2, (fractional[1] + b) / 3, fractional[2]];
        atom.fractional.forEach((value, axis) => assert.ok(Math.abs(value - expected[axis]) < 1e-12));
        assert.deepEqual(atom.selectiveDynamics, [false, true, false]);
        assert.notEqual(atom.selectiveDynamics, source.atoms[0].selectiveDynamics);
    }
    assert.equal(JSON.stringify(source), before);
});

test('supercell validation rejects overflow, invalid repeats, and excessive copies without changing the source', () => {
    const source = { lattice: [[1e102, 0, 0], [0, 1e102, 0], [0, 0, 1e102]], atoms: [{ element: 'H', position: { x: 0, y: 0, z: 0 } }] };
    const before = JSON.stringify(source);
    assert.throws(() => buildSupercell(source, [20, 20, 1]), /volume is not finite/);
    assert.equal(JSON.stringify(source), before);
    for (const repeats of [[0, 1, 1], [1.5, 1, 1], [21, 1, 1], [2, 1], ['2', 1, 1]]) {
        assert.throws(() => buildSupercell(source, repeats), /integers from 1 to 20/);
    }
    assert.throws(() => buildSupercell({ atoms: { length: 1001 } }, [3, 1, 1]), /3,000 atoms/);
    const wide = { lattice: [[8e307, 0, 0], [0, 1e-154, 0], [0, 0, 1e-154]], atoms: [{ element: 'H', position: { x: 1.4e308, y: 0, z: 0 } }] };
    const wideBefore = JSON.stringify(wide);
    assert.throws(() => buildSupercell(wide, [2, 1, 1]), /atom coordinates cannot be represented/);
    assert.equal(JSON.stringify(wide), wideBefore);
    assert.throws(() => buildSupercell(wide, [3, 1, 1]), /non-finite coordinates/);
});

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

test('cell resize cannot collapse or reverse a cell with atoms outside its bounds', () => {
    const lattice = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
    const structure = { lattice, atoms: [{ position: { x: -2, y: 0, z: 0 } }] };
    const before = JSON.stringify(structure);
    for (const delta of [-10, -100]) {
        const prepared = prepareCellResize(structure, lattice, structure.atoms.map(atom => atom.position), 0, 'far', delta);
        assert.equal(prepared.lattice[0][0], 0.001);
        assert.ok(prepared.updates[0].fractional.every(Number.isFinite));
    }
    const near = prepareCellResize(structure, lattice, [{ x: 20, y: 0, z: 0 }], 0, 'near', -100);
    assert.equal(near.lattice[0][0], 0.001);
    assert.equal(JSON.stringify(structure), before);
});

test('cell resize validates every proposed position before committing a tilted near-face shift', () => {
    const lattice = [[3, 4, 0], [0, 10, 0], [0, 0, 10]];
    const structure = { lattice, atoms: [{ position: { x: 3, y: 4, z: 1 } }] };
    const prepared = prepareCellResize(structure, lattice, structure.atoms.map(atom => atom.position), 0, 'near', 5);
    assert.deepEqual(prepared.lattice[0], [6, 8, 0]);
    assert.deepEqual(prepared.updates[0].position, { x: 6, y: 8, z: 1 });
    assert.throws(() => prepareCellResize(structure, lattice, structure.atoms.map(atom => atom.position), 0, 'far', Infinity), /Invalid cell resize/);
    const extreme = { lattice: [[1e102, 0, 0], [0, 1e102, 0], [0, 0, 1e102]], atoms: [] };
    assert.throws(() => prepareCellResize(extreme, extreme.lattice, [], 0, 'far', 1e308), /volume is not finite/);
    assert.deepEqual(structure.atoms[0].position, { x: 3, y: 4, z: 1 });
    const unchanged = prepareCellResize(structure, lattice, [{ x: 3, y: 4, z: 1 }], 0, 'far', 0);
    assert.deepEqual(unchanged.lattice, lattice);
    assert.deepEqual(unchanged.updates[0].position, { x: 3, y: 4, z: 1 });
});
