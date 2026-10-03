const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    clone() { return new Vector3(this.x, this.y, this.z); }
    copy(v) { Object.assign(this, { x: v.x, y: v.y, z: v.z }); return this; }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
}

function app() {
    const elements = new Map();
    const document = {
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, { value: '', textContent: '', classList: { add() {}, remove() {} } });
            return elements.get(id);
        }
    };
    const context = vm.createContext({ document, THREE: { Vector3, Vector2: class {}, Plane: class {} }, console });
    const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8').replace(/\ninit\(\);\s*$/, '');
    vm.runInContext(source, context);
    return context;
}

const example = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('all supplied structures parse', () => {
    const context = app();
    for (const file of fs.readdirSync(path.join(root, 'examples/poscar'))) {
        const structure = context.parsePOSCAR(example(`examples/poscar/${file}`));
        assert.equal(structure.atoms.length, structure.counts.reduce((a, b) => a + b, 0), file);
    }
    for (const file of fs.readdirSync(path.join(root, 'examples/xyz'))) {
        const structure = context.parseXYZ(example(`examples/xyz/${file}`));
        assert.equal(structure.atoms.length, structure.counts.reduce((a, b) => a + b, 0), file);
    }
    for (const file of fs.readdirSync(path.join(root, 'examples/xdatcar'))) {
        const structure = context.parseXDATCAR(example(`examples/xdatcar/${file}`));
        assert.ok(structure.frames.length > 1, file);
    }
});

test('POSCAR examples preserve coordinates and constraints after export', () => {
    const context = app();
    for (const file of fs.readdirSync(path.join(root, 'examples/poscar'))) {
        const original = context.parsePOSCAR(example(`examples/poscar/${file}`));
        context.structure = original;
        const exported = vm.runInContext('currentStructure = structure; generatePOSCAR()', context);
        const reparsed = context.parsePOSCAR(exported);
        assert.equal(reparsed.atoms.length, original.atoms.length, file);
        original.atoms.forEach((atom, index) => {
            assert.ok(atom.position.distanceTo(reparsed.atoms[index].position) < 1e-7, `${file} atom ${index}`);
            assert.deepEqual(Array.from(reparsed.atoms[index].selectiveDynamics), Array.from(atom.selectiveDynamics), `${file} atom ${index}`);
        });
    }
});

test('POSCAR scales Cartesian coordinates and supports volume scale', () => {
    const context = app();
    const header = ['scaled', '2', '1 0 0', '0 1 0', '0 0 1', 'H', '1', 'Cartesian', '0.25 0.5 0.75'].join('\n');
    const structure = context.parsePOSCAR(header);
    assert.deepEqual(Array.from(structure.lattice[0]), [2, 0, 0]);
    assert.deepEqual([structure.atoms[0].position.x, structure.atoms[0].position.y, structure.atoms[0].position.z], [0.5, 1, 1.5]);
    const volumeScaled = context.parsePOSCAR(header.replace('\n2\n', '\n-8\n'));
    assert.equal(volumeScaled.lattice[0][0], 2);
    assert.equal(volumeScaled.atoms[0].position.x, 0.5);
});

test('fractional and Cartesian coordinates round-trip in a tilted cell', () => {
    const context = app();
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    const expected = [0.2, 0.35, 0.7];
    const position = context.fractionalToCartesian(expected, lattice);
    const actual = context.cartesianToFractional(position, lattice);
    actual.forEach((value, index) => assert.ok(Math.abs(value - expected[index]) < 1e-12));
});

test('malformed coordinates and constraints report errors', () => {
    const context = app();
    const base = ['bad', '1', '1 0 0', '0 1 0', '0 0 1', 'H', '1', 'Direct', '0 0 x'].join('\n');
    assert.throws(() => context.parsePOSCAR(base), /coordinates on line 9/);
    assert.throws(() => context.parsePOSCAR(base.replace('Direct', 'Selective dynamics\nDirect').replace('0 0 x', '0 0 0 T X T')), /selective dynamics flags/);
    assert.throws(() => context.parsePOSCAR(base.replace('\n1\nDirect', '\n0\nDirect')), /element counts/);
    assert.throws(() => context.parseXYZ('1\nLattice="1 0 0"\nH 0 0 0'), /nine finite numbers/);
});

test('plain XYZ keeps molecule coordinates and exports XYZ', () => {
    const context = app();
    const structure = context.parseXYZ(example('examples/xyz/H2O.xyz'));
    assert.equal(context.isPeriodicStructure(structure), false);
    assert.equal(structure.hasExplicitLattice, false);
    assert.equal(structure.atoms[0].fractional, null);
    context.structure = structure;
    const exported = vm.runInContext('currentStructure = structure; generateXYZ()', context);
    const reparsed = context.parseXYZ(exported);
    assert.equal(reparsed.atoms.length, structure.atoms.length);
    for (let i = 0; i < structure.atoms.length; i++) {
        assert.ok(reparsed.atoms[i].position.distanceTo(structure.atoms[i].position) < 1e-8);
    }
    const crystal = context.parseXYZ(example('examples/xyz/Si_diamond_extended.xyz'));
    assert.equal(context.isPeriodicStructure(crystal), true);
});

test('a successful replacement clears undo history; a failed parse preserves it', () => {
    const context = app();
    vm.runInContext('renderStructure = () => {}; updateUI = () => {}; updateModeToggleForFileType = () => {}; updateSupercellButtonState = () => {}; stopAnimation = () => {}; hideTimelinePanel = () => {};', context);
    context.pushUndo({ type: 'add_atom', index: 0 });
    assert.throws(() => context.loadStructureFromText('invalid', 'POSCAR'));
    assert.equal(vm.runInContext('undoStack.length', context), 1);
    context.loadStructureFromText(example('examples/xyz/H2O.xyz'), 'H2O.xyz');
    assert.equal(vm.runInContext('undoStack.length', context), 0);
});

test('bond rebuild uses one policy for normal and periodic atoms', () => {
    const context = app();
    const positions = [0, 1, 2].map(x => new Vector3(x, 0, 0));
    context.positions = positions;
    vm.runInContext(`
        currentStructure = { atoms: [] };
        settings.showBonds = true;
        settings.bondThreshold = 1.5;
        atomMeshes = positions.map((position, index) => ({ position, userData: { isGhost: index === 2 } }));
        structureGroup = {
            children: [],
            add(child) { this.children.push(child); },
            remove(child) { this.children.splice(this.children.indexOf(child), 1); }
        };
        createBond = () => ({ userData: { isBond: true } });
        createGhostBond = () => ({ userData: { isGhostBond: true } });
        disposeObject3D = () => {};
        addBondsFromAtomMeshes();
    `, context);
    const counts = () => vm.runInContext('[structureGroup.children.filter(b => b.userData.isBond).length, structureGroup.children.filter(b => b.userData.isGhostBond).length]', context);
    assert.deepEqual(Array.from(counts()), [1, 1]);
    context.rebuildBonds();
    assert.deepEqual(Array.from(counts()), [1, 1]);
});

test('element radii exclude the false H–H bond in water', () => {
    const context = app();
    const water = context.parseXYZ(example('examples/xyz/H2O.xyz'));
    context.water = water;
    vm.runInContext(`
        currentStructure = water;
        settings.showBonds = true;
        settings.bondThreshold = 2.5;
        atomMeshes = water.atoms.map(atom => ({ position: atom.position, userData: { element: atom.element } }));
        structureGroup = { children: [], add(child) { this.children.push(child); } };
        createBond = () => ({ userData: { isBond: true } });
        settings.useElementRadii = true;
        addBondsFromAtomMeshes();
    `, context);
    assert.equal(vm.runInContext('structureGroup.children.length', context), 2);
    vm.runInContext('structureGroup.children = []; settings.useElementRadii = false; addBondsFromAtomMeshes();', context);
    assert.equal(vm.runInContext('structureGroup.children.length', context), 3);
});
