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
