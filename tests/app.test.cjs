const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const CrystalGeometry = require('../geometry.js');
const CrystalFormats = require('../formats.js');

const root = path.resolve(__dirname, '..');

class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    clone() { return new Vector3(this.x, this.y, this.z); }
    copy(v) { Object.assign(this, { x: v.x, y: v.y, z: v.z }); return this; }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
    multiplyScalar(factor) { this.x *= factor; this.y *= factor; this.z *= factor; return this; }
    addScaledVector(v, factor) { this.x += v.x * factor; this.y += v.y * factor; this.z += v.z * factor; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
    length() { return Math.hypot(this.x, this.y, this.z); }
    normalize() { const length = this.length(); if (length) { this.x /= length; this.y /= length; this.z /= length; } return this; }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
    getComponent(axis) { return [this.x, this.y, this.z][axis]; }
}

function app() {
    const elements = new Map();
    const document = {
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, { value: '', textContent: '', classList: { add() {}, remove() {} } });
            return elements.get(id);
        }
    };
    const context = vm.createContext({ document, window: { confirm: () => true }, THREE: { Vector3, Vector2: class {}, Plane: class {}, MathUtils: { radToDeg: radians => radians * 180 / Math.PI } }, CrystalGeometry, CrystalFormats, console });
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

test('atom materials are reused without sharing selection glow', () => {
    const context = app();
    let created = 0;
    class Material {
        constructor(options) {
            this.options = options;
            this.emissive = { value: 0, setHex(value) { this.value = value; } };
            this.emissiveIntensity = 0;
            created++;
        }
        clone() { return new Material(this.options); }
        dispose() { this.disposed = true; }
    }
    context.THREE.MeshPhysicalMaterial = Material;
    const first = { userData: { element: 'Si' } };
    const second = { userData: { element: 'Si' } };
    first.material = context.getAtomMaterial('Si');
    second.material = context.getAtomMaterial('Si');
    assert.equal(first.material, second.material);
    assert.equal(created, 1);
    context.highlightAtomMesh(first);
    assert.notEqual(first.material, second.material);
    assert.equal(first.material.emissive.value, 0xffffff);
    assert.equal(second.material.emissive.value, 0);
    const selectedMaterial = first.material;
    context.unhighlightAtomMesh(first);
    assert.equal(first.material, second.material);
    assert.equal(selectedMaterial.disposed, true);
    const ghost = context.getAtomMaterial('Si', true);
    assert.notEqual(ghost, first.material);
    assert.equal(ghost.options.transparent, true);
});

test('dense views use lower-detail spheres and skip shadow passes', () => {
    const context = app();
    context.THREE.SphereGeometry = class {
        constructor(radius, widthSegments, heightSegments) {
            Object.assign(this, { radius, widthSegments, heightSegments });
        }
    };
    const structure = { atoms: Array(300).fill({ element: 'Si' }), lattice: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };
    context.structure = structure;
    vm.runInContext('renderer = { shadowMap: { enabled: true } }; configureRenderQuality(structure)', context);
    const detailed = context.getSharedAtomGeometry();
    assert.equal(detailed.widthSegments, 24);
    assert.equal(vm.runInContext('renderer.shadowMap.enabled', context), true);
    vm.runInContext('settings.periodic = { a: 2, b: 1, c: 1 }; configureRenderQuality(structure)', context);
    const compact = context.getSharedAtomGeometry();
    assert.equal(compact.widthSegments, 12);
    assert.notEqual(compact, detailed);
    assert.equal(vm.runInContext('renderer.shadowMap.enabled', context), false);
    assert.equal(vm.runInContext('renderer.shadowMap.needsUpdate', context), true);
    vm.runInContext('settings.periodic = { a: 1, b: 1, c: 1 }; configureRenderQuality(structure)', context);
    assert.equal(context.getSharedAtomGeometry(), detailed);
    assert.equal(vm.runInContext('renderer.shadowMap.enabled', context), true);
});

test('idle frames skip WebGL work while edits and camera movement render promptly', () => {
    const context = app();
    context.frames = { count: 0 };
    context.requestAnimationFrame = () => {};
    vm.runInContext(`
        controls = { update() {} };
        renderer = { render() { frames.count++; } };
        scene = {};
        camera = {};
        currentStructure = { atoms: [] };
        measurementGroup = null;
        settings.showAxes = false;
        animate(100);
        animate(110);
    `, context);
    assert.equal(context.frames.count, 1);
    vm.runInContext('requestRender(); animate(120)', context);
    assert.equal(context.frames.count, 2);
    vm.runInContext('lastCameraMotionAt = 125; animate(140); animate(145)', context);
    assert.equal(context.frames.count, 3);
    vm.runInContext('displayedAtomCount = 600; requestRender(); animate(155); animate(175)', context);
    assert.equal(context.frames.count, 4);
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

test('periodic measurements use nearest image unless selected images are requested', () => {
    const context = app();
    context.points = [new Vector3(0.1, 0, 0), new Vector3(9.9, 0, 0)];
    vm.runInContext(`
        currentStructure = { lattice: [[10, 0, 0], [0, 10, 0], [0, 0, 10]], hasExplicitLattice: true };
        selectedAtoms = points.map(position => ({ position, isGhost: false }));
        measurementMode = 'nearest';
    `, context);
    const nearest = vm.runInContext('getMeasurementPair(selectedAtoms[0], selectedAtoms[1])', context);
    assert.ok(Math.abs(nearest.distance - 0.2) < 1e-10);
    assert.deepEqual(Array.from(nearest.offset), [-1, 0, 0]);
    const delta = vm.runInContext('computeDeltas(selectedAtoms[0], selectedAtoms[1])', context);
    assert.ok(Math.abs(delta.da + 0.02) < 1e-10);

    vm.runInContext("measurementMode = 'selected'", context);
    assert.ok(Math.abs(vm.runInContext('getMeasurementPair(selectedAtoms[0], selectedAtoms[1]).distance', context) - 9.8) < 1e-10);
    vm.runInContext("measurementMode = 'nearest'; selectedAtoms[1].isGhost = true", context);
    assert.ok(Math.abs(vm.runInContext('getMeasurementPair(selectedAtoms[0], selectedAtoms[1]).distance', context) - 9.8) < 1e-10);
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
    assert.equal(crystal.comment, 'silicon diamond cubic');
});

test('extended XYZ honors declared property order and blank comments', () => {
    const context = app();
    const extended = [
        '2',
        'Lattice="4 0 0 0 4 0 0 0 4" Properties=charge:R:1:pos:R:3:species:S:1',
        '0.4 1.25 2.5 3.75 C',
        '-0.1 0.5 0.75 1.25 O'
    ].join('\n');
    assert.equal(context.isXYZFormat(extended), true);
    const structure = context.parseXYZ(extended);
    assert.equal(structure.atoms[0].element, 'C');
    assert.deepEqual([structure.atoms[0].position.x, structure.atoms[0].position.y, structure.atoms[0].position.z], [1.25, 2.5, 3.75]);
    assert.equal(structure.hasExplicitLattice, true);

    const oneAtom = '1\n\nHe 0 0 0\n';
    assert.equal(context.isXYZFormat(oneAtom), true);
    assert.equal(context.parseXYZ(oneAtom).atoms[0].element, 'He');
    assert.throws(() => context.parseXYZ('1garbage\ncomment\nH 0 0 0'), /first line/);
    assert.throws(() => context.parseXYZ('1\nProperties=charge:R:1:species:S:1\n0.2 H'), /three position columns/);
});

test('extended XYZ export updates lattice metadata and column schema', () => {
    const context = app();
    const structure = context.parseXYZ([
        '1',
        'Lattice="4 0 0 1 4 0 0 0 4" Properties=charge:R:1:pos:R:3:species:S:1 sample',
        '0.2 1 2 3 C'
    ].join('\n'));
    structure.lattice[0][0] = 8;
    structure.atoms[0].position.x = 2;
    const output = CrystalFormats.createFormats(Vector3, context.cartesianToFractional).generateXYZ(structure);
    assert.match(output.split('\n')[1], /Lattice="8\.000000000000/);
    assert.match(output.split('\n')[1], /Properties=species:S:1:pos:R:3/);
    const reparsed = context.parseXYZ(output);
    assert.equal(reparsed.hasExplicitLattice, true);
    assert.equal(reparsed.lattice[0][0], 8);
    assert.equal(reparsed.atoms[0].position.x, 2);
    assert.equal(reparsed.comment, 'sample');
});

test('XDATCAR export preserves every frame and its fractional coordinates', () => {
    const context = app();
    for (const file of fs.readdirSync(path.join(root, 'examples/xdatcar'))) {
        const original = context.parseXDATCAR(example(`examples/xdatcar/${file}`));
        context.structure = original;
        const exported = vm.runInContext('currentStructure = structure; generateXDATCAR()', context);
        const reparsed = context.parseXDATCAR(exported);
        assert.equal(reparsed.totalFrames, original.totalFrames, file);
        reparsed.frames.forEach((frame, index) => {
            assert.deepEqual(frame.fractional, original.frames[index].fractional, `${file} frame ${index + 1}`);
        });
    }
});

test('trajectory frames reuse atom meshes and update periodic copies', () => {
    const context = app();
    const structure = context.parseXDATCAR(example('examples/xdatcar/H2_vibration.xdatcar'));
    const calls = { bonds: 0, renders: 0, measurements: 0 };
    context.structure = structure;
    context.calls = calls;
    vm.runInContext(`
        currentStructure = structure;
        settings.periodic = { a: 2, b: 1, c: 1 };
        atomMeshes = structure.atoms.map(atom => ({
            position: atom.position.clone(), userData: { isGhost: false },
            getWorldPosition(target) { return target.copy(this.position); }
        }));
        const ghost = {
            position: structure.atoms[0].position.clone().add(new THREE.Vector3(...structure.lattice[0])),
            userData: { isGhost: true, originalIndex: 0, cellOffset: { a: 1, b: 0, c: 0 } }
        };
        atomMeshes.push(ghost);
        selectedAtoms = [{ mesh: atomMeshes[0], position: atomMeshes[0].position.clone() }];
        structureGroup = { children: [{ userData: { isAtomLabel: true, atomIndex: 0 }, position: atomMeshes[0].position.clone() }] };
        settings.showLabels = true;
        rebuildBonds = () => { calls.bonds++; };
        renderStructure = () => { calls.renders++; };
        updateSelectionVisualPositions = () => {};
        updateMeasurements = () => { calls.measurements++; };
        updateMeasurementUI = () => {};
        updateTimelineUI = () => {};
        updateSidebarFrameDisplay = () => {};
        switchToFrame(1);
    `, context);
    assert.equal(calls.renders, 0);
    assert.equal(calls.bonds, 1);
    assert.equal(calls.measurements, 1);
    assert.ok(vm.runInContext('atomMeshes[0].position.distanceTo(currentStructure.frames[1].positions[0])', context) < 1e-10);
    assert.ok(vm.runInContext('atomMeshes[2].position.distanceTo(atomMeshes[0].position.clone().add(new THREE.Vector3(...currentStructure.lattice[0])))', context) < 1e-10);
    assert.ok(vm.runInContext('selectedAtoms[0].position.distanceTo(atomMeshes[0].position)', context) < 1e-10);
    assert.ok(vm.runInContext('structureGroup.children[0].position.distanceTo(atomMeshes[0].position)', context) < 1e-10);
    vm.runInContext('currentStructure.frames[2].lattice[0][0] += 1; switchToFrame(2)', context);
    assert.equal(calls.renders, 1);
});

test('a successful replacement clears undo history; a failed parse preserves it', () => {
    const context = app();
    vm.runInContext('renderStructure = () => {}; updateUI = () => {}; updateUI_forCurrentMode = () => {}; updateModeToggleForFileType = () => {}; updateSupercellButtonState = () => {}; stopAnimation = () => {}; hideTimelinePanel = () => {};', context);
    context.pushUndo({ type: 'add_atom', index: 0 });
    assert.throws(() => context.loadStructureFromText('invalid', 'POSCAR'));
    assert.equal(vm.runInContext('undoStack.length', context), 1);
    context.loadStructureFromText(example('examples/xyz/H2O.xyz'), 'H2O.xyz');
    assert.equal(vm.runInContext('undoStack.length', context), 0);
});

test('canceling a replacement preserves unsaved structure and history', () => {
    const context = app();
    vm.runInContext('renderStructure = () => {}; updateUI = () => {}; updateUI_forCurrentMode = () => {}; updateModeToggleForFileType = () => {}; updateSupercellButtonState = () => {}; stopAnimation = () => {}; hideTimelinePanel = () => {};', context);
    context.loadStructureFromText(example('examples/xyz/H2O.xyz'), 'H2O.xyz');
    context.pushUndo({ type: 'add_atom', index: 0 });
    context.window.confirm = () => false;
    const kept = context.loadStructureFromText(example('examples/xyz/CH4.xyz'), 'CH4.xyz');
    assert.equal(kept, false);
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 3);
    assert.equal(vm.runInContext('undoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), true);
    context.window.confirm = () => true;
    assert.equal(context.loadStructureFromText(example('examples/xyz/CH4.xyz'), 'CH4.xyz'), true);
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 5);
    assert.equal(context.hasUnsavedEdits(), false);
});

test('undo and redo restore an edit; a new edit invalidates redo', () => {
    const context = app();
    context.structure = context.parseXYZ(example('examples/xyz/H2O.xyz'));
    vm.runInContext(`
        currentStructure = structure;
        atomMeshes = structure.atoms.map(atom => ({ position: atom.position.clone() }));
        rebuildDisplayOptions = () => {};
        updateEditUI = () => {};
        renderStructure = () => {};
        updateUI = () => {};
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
        const original = currentStructure.atoms[0].position.clone();
        pushUndo({ type: 'move_atom', index: 0, oldPosition: original });
        currentStructure.atoms[0].position.x += 1;
        atomMeshes[0].position.x += 1;
    `, context);
    assert.equal(context.hasUnsavedEdits(), true);
    const moved = vm.runInContext('currentStructure.atoms[0].position.x', context);
    context.performUndo();
    assert.ok(Math.abs(vm.runInContext('currentStructure.atoms[0].position.x', context) - (moved - 1)) < 1e-10);
    assert.equal(context.hasUnsavedEdits(), false);
    context.performRedo();
    assert.ok(Math.abs(vm.runInContext('currentStructure.atoms[0].position.x', context) - moved) < 1e-10);
    assert.equal(context.hasUnsavedEdits(), true);
    context.performUndo();
    context.pushUndo({ type: 'move_atom', index: 0, oldPosition: new Vector3() });
    assert.equal(vm.runInContext('redoStack.length', context), 0);
});

test('supercell undo and redo preserve lattice-bearing XYZ metadata', () => {
    const context = app();
    context.structure = context.parseXYZ(example('examples/xyz/Si_diamond_extended.xyz'));
    const initialAtoms = context.structure.atoms.length;
    vm.runInContext(`
        currentStructure = structure;
        settings.periodic = { a: 2, b: 1, c: 1 };
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = () => {};
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
        convertToSupercell();
    `, context);
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), initialAtoms * 2);
    context.performUndo();
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), initialAtoms);
    assert.equal(vm.runInContext('currentStructure.isXYZ && currentStructure.hasExplicitLattice', context), true);
    context.performRedo();
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), initialAtoms * 2);
    assert.equal(vm.runInContext('currentStructure.isXYZ && currentStructure.hasExplicitLattice', context), true);
});

test('exact fractional coordinates update one atom and round-trip through undo', () => {
    const context = app();
    context.structure = context.parsePOSCAR(example('examples/poscar/Si_diamond.poscar'));
    const oldPosition = context.structure.atoms[0].position.clone();
    vm.runInContext(`
        currentStructure = structure;
        selectedAtoms = [{ index: 0, isGhost: false, element: 'Si' }];
        selectedAtomCoordMode = 'fractional';
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = () => {};
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
    `, context);
    [0.125, 0.25, 0.375].forEach((value, axis) => {
        context.document.getElementById(`editAtom${axis}`).value = String(value);
    });
    assert.equal(context.applyExactAtomCoordinates(), true);
    const expected = context.fractionalToCartesian([0.125, 0.25, 0.375], context.structure.lattice);
    assert.ok(context.structure.atoms[0].position.distanceTo(expected) < 1e-10);
    assert.equal(context.hasUnsavedEdits(), true);
    context.performUndo();
    assert.ok(context.structure.atoms[0].position.distanceTo(oldPosition) < 1e-10);
    context.performRedo();
    context.expected = expected;
    assert.ok(vm.runInContext('currentStructure.atoms[0].position.distanceTo(expected)', context) < 1e-10);
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

test('dense bonds use two disposable batches with correct transforms', () => {
    const context = app();
    class Geometry {
        clone() { return new Geometry(); }
        dispose() { this.disposed = true; }
    }
    class Material {
        dispose() { this.disposed = true; }
    }
    class Object3D {
        constructor() {
            this.position = new Vector3();
            this.scale = { set: (x, y, z) => { this.radius = x; this.length = y; this.depth = z; } };
            this.quaternion = { setFromUnitVectors() {} };
        }
        updateMatrix() {
            this.matrix = { center: this.position.clone(), radius: this.radius, length: this.length };
        }
    }
    class InstancedMesh {
        constructor(geometry, material, count) {
            Object.assign(this, { geometry, material, count, matrices: [], instanceMatrix: {}, userData: {} });
        }
        setMatrixAt(index, matrix) { this.matrices[index] = matrix; }
        traverse(visitor) { visitor(this); }
    }
    Object.assign(context.THREE, {
        CylinderGeometry: Geometry,
        MeshBasicMaterial: Material,
        MeshPhysicalMaterial: Material,
        Object3D,
        InstancedMesh
    });
    context.positions = [0, 1, 2].map(x => new Vector3(x, 0, 0));
    vm.runInContext(`
        currentStructure = { atoms: positions.map(position => ({ element: 'H', position })) };
        settings.showBonds = true;
        settings.useElementRadii = false;
        settings.bondThreshold = 1.5;
        displayedAtomCount = 600;
        atomMeshes = positions.map((position, index) => ({ position, userData: { element: 'H', isGhost: index === 2 } }));
        structureGroup = {
            children: [],
            add(child) { this.children.push(child); },
            remove(child) { this.children.splice(this.children.indexOf(child), 1); }
        };
        addBondsFromAtomMeshes();
    `, context);
    const firstBatches = Array.from(vm.runInContext('structureGroup.children', context));
    assert.equal(firstBatches.length, 2);
    assert.deepEqual(Array.from(firstBatches, batch => batch.count), [1, 1]);
    assert.deepEqual(Array.from(firstBatches, batch => batch.matrices[0].center.x), [0.5, 1.5]);
    assert.ok(firstBatches.every(batch => batch.matrices[0].length === 1 && batch.frustumCulled === false));
    context.rebuildBonds();
    assert.equal(vm.runInContext('structureGroup.children.length', context), 2);
    assert.ok(firstBatches.every(batch => batch.geometry.disposed));
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

test('periodic bonds cross opposite cell faces without a long interior bond', () => {
    const context = app();
    context.points = [new Vector3(0.4, 0, 0), new Vector3(9.6, 0, 0)];
    vm.runInContext(`
        currentStructure = { lattice: [[10, 0, 0], [0, 10, 0], [0, 0, 10]] };
        settings.periodic = { a: 1, b: 1, c: 1 };
        settings.showBonds = true;
        settings.useElementRadii = false;
        settings.bondThreshold = 1.5;
        atomMeshes = points.map(position => ({ position, userData: { element: 'H' } }));
        structureGroup = { children: [], add(child) { this.children.push(child); } };
        createBond = (a, b) => ({ kind: 'interior', start: a, end: b });
        createGhostBond = (a, b) => ({ kind: 'boundary', start: a, end: b });
        addBondsFromAtomMeshes();
    `, context);
    const bonds = vm.runInContext('structureGroup.children', context);
    assert.equal(bonds.length, 2);
    assert.ok(bonds.every(bond => bond.kind === 'boundary'));
    const endpoints = bonds.flatMap(bond => [bond.start.x, bond.end.x]);
    assert.ok(endpoints.some(x => Math.abs(x) < 1e-10));
    assert.ok(endpoints.some(x => Math.abs(x - 10) < 1e-10));
    assert.ok(bonds.every(bond => bond.start.distanceTo(bond.end) <= 0.401));
});

test('dense periodic boundary segments join the ghost batch', () => {
    const context = app();
    context.points = [new Vector3(0.4, 0, 0), new Vector3(9.6, 0, 0)];
    vm.runInContext(`
        currentStructure = { lattice: [[10, 0, 0], [0, 10, 0], [0, 0, 10]] };
        settings.periodic = { a: 1, b: 1, c: 1 };
        settings.showBonds = true;
        settings.useElementRadii = false;
        settings.bondThreshold = 1.5;
        displayedAtomCount = 600;
        atomMeshes = points.map(position => ({ position, userData: { element: 'H' } }));
        structureGroup = { children: [], add(child) { this.children.push(child); } };
        addInstancedBonds = (segments, isGhost) => {
            if (segments.length) structureGroup.add({ segments, isGhost });
        };
        addBondsFromAtomMeshes();
    `, context);
    const batches = vm.runInContext('structureGroup.children', context);
    assert.equal(batches.length, 1);
    assert.equal(batches[0].isGhost, true);
    assert.equal(batches[0].segments.length, 2);
    const endpoints = batches[0].segments.flatMap(([start, end]) => [start.x, end.x]);
    assert.ok(endpoints.some(x => Math.abs(x) < 1e-10));
    assert.ok(endpoints.some(x => Math.abs(x - 10) < 1e-10));
});

test('periodic bonds reach neighbors across multiple vectors of a tilted basis', () => {
    const context = app();
    const lattice = [[1, 0, 0], [11, 3, 0], [0, 0, 10]];
    context.points = [[0.1, 0.1, 0], [0.1, 0.9, 0]].map(frac => context.fractionalToCartesian(frac, lattice));
    context.lattice = lattice;
    vm.runInContext(`
        currentStructure = { lattice };
        settings.periodic = { a: 1, b: 1, c: 1 };
        settings.showBonds = true;
        settings.useElementRadii = false;
        settings.bondThreshold = 0.9;
        atomMeshes = points.map(position => ({ position, userData: { element: 'H' } }));
        structureGroup = { children: [], add(child) { this.children.push(child); } };
        createBond = () => ({ kind: 'interior' });
        createGhostBond = (start, end) => ({ kind: 'boundary', start, end });
        addBondsFromAtomMeshes();
    `, context);
    const bonds = vm.runInContext('structureGroup.children', context);
    assert.ok(bonds.length > 0);
    assert.ok(bonds.every(bond => bond.kind === 'boundary'));
});

test('smallest atom radius is reused until render scale changes', () => {
    const context = app();
    let reads = 0;
    context.atom = { get element() { reads++; return 'H'; } };
    vm.runInContext('currentStructure = { atoms: [atom] }; getSmallestAtomRadius(); getSmallestAtomRadius();', context);
    assert.equal(reads, 1);
    vm.runInContext('settings.atomScale = 1.2; getSmallestAtomRadius();', context);
    assert.equal(reads, 2);
});
