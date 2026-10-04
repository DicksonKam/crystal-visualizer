const assert = require('node:assert/strict');
const test = require('node:test');
const { createFormats } = require('../formats.js');
const { cartesianToFractional } = require('../geometry.js');

class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    clone() { return new Vector3(this.x, this.y, this.z); }
}

const formats = createFormats(Vector3, () => [0, 0, 0]);
const strictFormats = createFormats(Vector3, cartesianToFractional);

test('POSCAR duplicate species groups round-trip positions and constraints exactly once', () => {
    const source = 'two hydrogen groups\n1\n10 0 0\n0 10 0\n0 0 10\nH H\n1 1\nSelective Dynamics\nCartesian\n0 0 0 F T F\n1 0 0 T F T\n';
    const structure = strictFormats.parsePOSCAR(source);
    const exported = strictFormats.generatePOSCAR(structure);
    const loaded = strictFormats.parsePOSCAR(exported);
    assert.deepEqual(loaded.elements, ['H', 'H']);
    assert.deepEqual(loaded.counts, [1, 1]);
    assert.equal(loaded.atoms.length, 2);
    assert.equal(loaded.hasAdditionalSections, false);
    assert.deepEqual(loaded.atoms.map(atom => [atom.position.x, atom.selectiveDynamics]), [[0, [false, true, false]], [1, [true, false, true]]]);
    assert.notEqual(structure.atoms[0].speciesId, structure.atoms[1].speciesId);
});

test('format parsers run without a browser or rendering engine', () => {
    const poscar = [
        'Hydrogen cell', '1', '2 0 0', '0 2 0', '0 0 2',
        'H', '1', 'Direct', '0.25 0.5 0.75'
    ].join('\n');
    const crystal = formats.parsePOSCAR(poscar);
    assert.deepEqual([crystal.atoms[0].position.x, crystal.atoms[0].position.y, crystal.atoms[0].position.z], [0.5, 1, 1.5]);
    assert.equal(formats.parsePOSCAR(formats.generatePOSCAR(crystal)).atoms[0].position.z, 1.5);

    const molecule = formats.parseXYZ('1\n\nH 0.1 0.2 0.3\n');
    assert.equal(molecule.atoms[0].element, 'H');
    assert.equal(molecule.hasExplicitLattice, false);
    assert.equal(formats.parseXYZ(formats.generateXYZ(molecule)).atoms[0].position.x, 0.1);
});

test('XYZ comments and POSCAR titles do not masquerade as trajectory headers', () => {
    const xyz = '1\nconfiguration=1 sample\nH 0 0 0\n';
    assert.equal(formats.isXDATCARFormat(xyz), false);
    assert.equal(formats.isXYZFormat(xyz), true);
    const poscar = [
        'configuration=1 static cell', '1', '2 0 0', '0 2 0', '0 0 2',
        'H', '1', 'Direct', '0 0 0'
    ].join('\n');
    assert.equal(formats.isXDATCARFormat(poscar), false);
    assert.equal(formats.parsePOSCAR(poscar).atoms.length, 1);
});

test('overflowing cell and atom coordinates are rejected before rendering', () => {
    const poscar = ['cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H', '1', 'Direct', '0 0 0'].join('\n');
    assert.throws(() => strictFormats.parsePOSCAR(poscar.replace('\n1\n', '\n1e308\n')), /non-finite/);
    assert.throws(() => strictFormats.parsePOSCAR(poscar.replace('Direct\n0 0 0', 'Direct\n1e308 0 0')), /not finite/);

    const xdatcar = ['cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H', '1', 'Direct configuration= 1', '0 0 0'].join('\n');
    assert.throws(() => strictFormats.parseXDATCAR(xdatcar.replace('\n1\n', '\n1e308\n')), /non-finite/);
    assert.throws(() => strictFormats.parseXDATCAR(xdatcar.replace('configuration= 1\n0 0 0', 'configuration= 1\n1e308 0 0')), /not finite/);

    assert.throws(() => strictFormats.parseXYZ('2\nlarge\nH -1e308 0 0\nH 1e308 0 0'), /non-finite/);
    assert.throws(() => strictFormats.parseXYZ('1\nLattice="1e150 0 0 0 1e150 0 0 0 1e150"\nH 0 0 0'), /volume is not finite/);
});

test('XDATCAR rejects atom counts larger than the available frame', () => {
    const xdatcar = ['cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H', '9007199254740991', 'Direct configuration= 1', '0 0 0'].join('\n');
    assert.throws(() => strictFormats.parseXDATCAR(xdatcar), /fewer atom lines/);
});

test('XDATCAR rejects unexpected frame text instead of silently dropping data', () => {
    const frame = ['cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H', '1', 'Direct configuration= 1', '0 0 0'].join('\n');
    assert.throws(() => strictFormats.parseXDATCAR(`${frame}\nunfinished frame`), /expected a Direct frame header on line 10/);
    assert.throws(() => strictFormats.parseXDATCAR(frame.replace('Direct configuration= 1', 'Direct configuration= nope')), /expected a Direct frame header on line 8/);
    const withSeparator = `${frame}\n\nDirect configuration= 2\n0.5 0.5 0.5\n`;
    const trajectory = strictFormats.parseXDATCAR(withSeparator);
    assert.equal(trajectory.frames.length, 2);
    assert.equal(strictFormats.parseXDATCAR(strictFormats.generateXDATCAR(trajectory)).frames.length, 2);
});

test('XYZ rejects a second frame instead of exporting only the first', () => {
    const firstFrame = '1\nfirst frame\nH 0 0 0\n';
    assert.throws(() => strictFormats.parseXYZ(`${firstFrame}1\nsecond frame\nH 1 0 0\n`), /only one frame is supported/);
    assert.equal(strictFormats.parseXYZ(`${firstFrame}\n`).atoms.length, 1);
});

test('XYZ detects atom data that a geometry-only edited export would omit', () => {
    assert.equal(strictFormats.parseXYZ('1\nsample\nH 0 0 0\n').hasAdditionalProperties, false);
    assert.equal(strictFormats.parseXYZ('1\nProperties=pos:R:3:species:S:1\n0 0 0 H\n').hasAdditionalProperties, false);
    assert.equal(strictFormats.parseXYZ('1\nProperties=charge:R:1:pos:R:3:species:S:1\n0.3 0 0 0 H\n').hasAdditionalProperties, true);
    assert.equal(strictFormats.parseXYZ('1\nsample\nH 0 0 0 0.3\n').hasAdditionalProperties, true);
    assert.equal(strictFormats.parseXYZ('1\nProperties=species:S:1:pos:R:3\nH 0 0 0 extra\n').hasAdditionalProperties, true);
});

test('POSCAR applies three scale factors to lattice components and Cartesian positions', () => {
    const header = ['anisotropic cell', '2 3 4', '1 1 0', '0 2 1', '0 0 3', 'H', '1'];
    const cartesian = strictFormats.parsePOSCAR([...header, 'Cartesian', '0.5 0.25 0.5'].join('\n'));
    assert.deepEqual(cartesian.lattice, [[2, 3, 0], [0, 6, 4], [0, 0, 12]]);
    assert.deepEqual([cartesian.atoms[0].position.x, cartesian.atoms[0].position.y, cartesian.atoms[0].position.z], [1, 0.75, 2]);
    assert.deepEqual(cartesian.scale, [2, 3, 4]);
    const direct = strictFormats.parsePOSCAR([...header, 'Direct', '0.5 0.25 0.5'].join('\n'));
    assert.deepEqual([direct.atoms[0].position.x, direct.atoms[0].position.y, direct.atoms[0].position.z], [1, 3, 7]);
    const roundTrip = strictFormats.parsePOSCAR(strictFormats.generatePOSCAR(direct));
    assert.deepEqual([roundTrip.atoms[0].position.x, roundTrip.atoms[0].position.y, roundTrip.atoms[0].position.z], [1, 3, 7]);
    assert.throws(() => strictFormats.parsePOSCAR([...header.slice(0, 1), '2 0 4', ...header.slice(2), 'Direct', '0 0 0'].join('\n')), /three positive factors/);
    assert.throws(() => strictFormats.parsePOSCAR([...header.slice(0, 1), '2 -3 4', ...header.slice(2), 'Direct', '0 0 0'].join('\n')), /three positive factors/);
});

test('POSCAR identifies additional data after atom positions without flagging blank lines', () => {
    const structure = ['cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H', '1', 'Direct', '0 0 0'].join('\n');
    assert.equal(strictFormats.parsePOSCAR(`${structure}\n\n`).hasAdditionalSections, false);
    assert.equal(strictFormats.parsePOSCAR(`${structure}\n\nCartesian\n0.1 0.2 0.3\n`).hasAdditionalSections, true);
});

test('counts-only POSCAR export does not invent species names', () => {
    const source = ['unnamed cell', '1', '2 0 0', '0 2 0', '0 0 2', '1', 'Direct', '0.25 0.5 0.75'].join('\n');
    const structure = strictFormats.parsePOSCAR(source);
    assert.equal(structure.hasElementSymbols, false);
    assert.equal(structure.elements[0], 'Atom1');
    const exported = strictFormats.generatePOSCAR(structure);
    assert.equal(exported.split('\n')[5], '1');
    assert.ok(!exported.includes('Atom1'));
    const reparsed = strictFormats.parsePOSCAR(exported);
    assert.equal(reparsed.hasElementSymbols, false);
    assert.equal(reparsed.atoms[0].position.x, 0.5);
});

test('XYZ reads per-axis periodicity and preserves it in edited exports', () => {
    const header = 'Lattice="10 0 0 0 10 0 0 0 10" Properties=species:S:1:pos:R:3';
    for (const field of ['pbc="T F F"', "pbc='True False False'", 'pbc=[T,F,F]', 'pbc={T F F}']) {
        const structure = strictFormats.parseXYZ(`1\n${header} ${field} sample\nH 9 20 30\n`);
        assert.deepEqual(structure.pbc, [true, false, false]);
        assert.equal(structure.comment, 'sample');
        structure.atoms[0].position.x = 8;
        const output = strictFormats.generateXYZ(structure);
        assert.match(output, /pbc="T F F"/);
        assert.deepEqual(strictFormats.parseXYZ(output).pbc, [true, false, false]);
    }
    assert.deepEqual(strictFormats.parseXYZ(`1\n${header}\nH 0 0 0\n`).pbc, [true, true, true]);
    assert.deepEqual(strictFormats.parseXYZ('1\nsample\nH 0 0 0\n').pbc, [false, false, false]);
    assert.deepEqual(strictFormats.parseXYZ(`1\n${header} pbc="F F F"\nH 0 0 0\n`).pbc, [false, false, false]);
    assert.throws(() => strictFormats.parseXYZ(`1\n${header} pbc="T F"\nH 0 0 0\n`), /three boolean flags/);
    assert.throws(() => strictFormats.parseXYZ(`1\n${header} pbc="T 0 F"\nH 0 0 0\n`), /three boolean flags/);
    assert.throws(() => strictFormats.parseXYZ(`1\n${header} pbc="T T T" pbc="F F F"\nH 0 0 0\n`), /duplicate/);
    assert.throws(() => strictFormats.parseXYZ('1\npbc="T F F"\nH 0 0 0\n'), /require a Lattice/);
});

test('XYZ validates property declarations before interpreting atom columns', () => {
    const parse = schema => strictFormats.parseXYZ(`1\nProperties=${schema}\nH 0 0 0 1 2 3\n`);
    for (const schema of [
        'species:S:1:pos:X:3', 'species:S:1:pos:S:3', 'species:R:1:pos:R:3',
        'species:S:2:pos:R:3', 'species:S:1:pos:R:2', 'species:S:1:pos:R:3:pos:R:3',
        'species:S:1:element:S:1:pos:R:3', 'species:S:1:pos:R:3::R:1',
        'species:S:1:pos:R:3:charge:Q:1', 'species:S:1:pos:R:3:charge:R:1e0',
        'species:S:1:pos:R:3:charge:R:9007199254740991',
        'species:S:1:x:R:1:y:R:1:z:S:1'
    ]) assert.throws(() => parse(schema), /Invalid extended XYZ/);
    const structure = strictFormats.parseXYZ('1\nProperties=species:S:1:pos:I:3:Z:I:1:flag:L:1:charge:R:1:tag:S:1\nH 1 2 3 1 T 0.5 example\n');
    assert.equal(structure.atoms[0].position.z, 3);
    assert.equal(structure.hasAdditionalProperties, true);
    assert.throws(() => strictFormats.parseXYZ('1\nProperties=species:S:1:pos:I:3\nH 0.5 2 3\n'), /coordinates/);
    const separate = strictFormats.parseXYZ('1\nProperties=z:R:1:species:S:1:x:I:1:y:R:1:Z:I:1\n3 H 1 2 1\n');
    assert.deepEqual([separate.atoms[0].position.x, separate.atoms[0].position.y, separate.atoms[0].position.z], [1, 2, 3]);
});

test('XYZ scientific numbers accept D exponents and reject non-decimal syntax', () => {
    const source = '1\nLattice="1D1 0 0 0 1d1 0 0 0 1E1" Properties=species:S:1:pos:R:3\nH +1D-1 -.2d+1 .3E1\n';
    const structure = strictFormats.parseXYZ(source);
    assert.deepEqual(structure.lattice, [[10, 0, 0], [0, 10, 0], [0, 0, 10]]);
    assert.deepEqual([structure.atoms[0].position.x, structure.atoms[0].position.y, structure.atoms[0].position.z], [0.1, -2, 3]);
    assert.equal(strictFormats.parseXYZ(strictFormats.generateXYZ(structure)).atoms[0].position.x, 0.1);
    for (const value of ['0x10', '0b11', '1_000', '1D', 'Infinity', '1e999']) {
        assert.throws(() => strictFormats.parseXYZ(`1\nsample\nH ${value} 0 0\n`), /coordinates/);
        assert.throws(() => strictFormats.parseXYZ(`1\nLattice="${value} 0 0 0 10 0 0 0 10"\nH 0 0 0\n`), /nine finite numbers/);
    }
});
