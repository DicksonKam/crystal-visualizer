const assert = require('node:assert/strict');
const test = require('node:test');
const { createFormats } = require('../formats.js');

class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    clone() { return new Vector3(this.x, this.y, this.z); }
}

const formats = createFormats(Vector3, () => [0, 0, 0]);

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
