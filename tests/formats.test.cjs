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
