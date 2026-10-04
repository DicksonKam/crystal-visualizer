const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const CrystalGeometry = require('../geometry.js');
const CrystalFormats = require('../formats.js');
const CrystalStructure = require('../structure.js');
const CrystalDocument = require('../document.js');
const CrystalHistory = require('../history.js');

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
            if (!elements.has(id)) {
                const classes = new Set();
                const attributes = new Map();
                elements.set(id, {
                    value: '', textContent: '',
                    classList: {
                        add(name) { classes.add(name); },
                        remove(name) { classes.delete(name); },
                        contains(name) { return classes.has(name); },
                        toggle(name, force) {
                            if (force === undefined) force = !classes.has(name);
                            if (force) classes.add(name);
                            else classes.delete(name);
                            return force;
                        }
                    },
                    contains(target) { return target === this; },
                    setAttribute(name, value) { attributes.set(name, value); },
                    getAttribute(name) { return attributes.get(name); },
                    focus() { document.activeElement = this; }
                });
            }
            return elements.get(id);
        }
    };
    const context = vm.createContext({ document, window: { confirm: () => true }, THREE: { Vector3, Vector2: class {}, Plane: class {}, MathUtils: { radToDeg: radians => radians * 180 / Math.PI } }, CrystalGeometry, CrystalFormats, CrystalStructure, CrystalDocument, CrystalHistory, console });
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

test('dense atoms batch by element and ghost state while preserving pick and selection meshes', () => {
    const context = app();
    class Geometry {
        clone() { return new Geometry(); }
        dispose() { this.disposed = true; }
    }
    class Material {
        constructor() { this.emissive = { setHex() {} }; }
        clone() { return new Material(); }
        dispose() { this.disposed = true; }
    }
    class Matrix4 {
        makeScale(x, y, z) { this.hidden = x === 0 && y === 0 && z === 0; return this; }
    }
    class InstancedMesh {
        constructor(geometry, material, count) {
            Object.assign(this, { geometry, material, count, matrices: [], instanceMatrix: {}, userData: {} });
        }
        setMatrixAt(index, matrix) { this.matrices[index] = matrix; }
        traverse(visitor) { visitor(this); }
    }
    Object.assign(context.THREE, { SphereGeometry: Geometry, MeshPhysicalMaterial: Material, Matrix4, InstancedMesh });
    const layers = () => ({
        mask: 1,
        set(layer) { this.mask = 1 << layer; },
        enable(layer) { this.mask |= 1 << layer; },
        disable(layer) { this.mask &= ~(1 << layer); }
    });
    const atom = (x, isGhost = false, element = 'Si') => ({
        position: new Vector3(x, 0, 0),
        layers: layers(),
        userData: { element, isGhost },
        updateMatrix() { this.matrix = { x: this.position.x }; }
    });
    context.proxies = [atom(0), atom(1), atom(2, true), atom(3, false, 'O')];
    vm.runInContext(`
        displayedAtomCount = 600;
        atomMeshes = proxies;
        structureGroup = { children: [], add(child) { this.children.push(child); } };
        proxies.forEach(mesh => { mesh.material = getAtomMaterial(mesh.userData.element, mesh.userData.isGhost); });
        addInstancedAtoms();
    `, context);
    const batches = vm.runInContext('structureGroup.children', context);
    assert.deepEqual(Array.from(batches, batch => batch.count), [2, 1, 1]);
    assert.ok(context.proxies.every(mesh => mesh.layers.mask === 2));
    assert.equal(batches[0].matrices[1].x, 1);
    context.highlightAtomMesh(context.proxies[0]);
    assert.equal(context.proxies[0].layers.mask, 3);
    assert.equal(batches[0].matrices[0].hidden, true);
    context.unhighlightAtomMesh(context.proxies[0]);
    assert.equal(context.proxies[0].layers.mask, 2);
    assert.equal(batches[0].matrices[0].x, 0);
    context.proxies[2].position.x = 4;
    context.updateAtomInstances();
    assert.equal(batches[1].matrices[0].x, 4);
    context.disposeObject3D(batches[0]);
    assert.equal(batches[0].geometry.disposed, true);
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

test('Cartesian measurement deltas use x/y/z components in a tilted cell', () => {
    const context = app();
    const lattice = [[2, 0, 0], [1, 2, 0], [0, 0, 3]];
    const first = { position: new Vector3(0, 0, 0), isGhost: false };
    const second = { position: new Vector3(0.7, 0.6, 0), isGhost: false };
    context.first = first;
    context.second = second;
    context.lattice = lattice;
    vm.runInContext('currentStructure = { lattice }; measurementMode = "selected"; selectedAtomCoordMode = "cartesian";', context);
    const cartesian = context.computeDeltas(first, second);
    assert.ok(Math.abs(cartesian.da - 0.7) < 1e-12);
    assert.ok(Math.abs(cartesian.db - 0.6) < 1e-12);
    assert.match(context.formatDelta(first, second), /Δx<\/span> \+0\.70/);
    vm.runInContext('selectedAtomCoordMode = "fractional";', context);
    const fractional = context.computeDeltas(first, second);
    assert.ok(Math.abs(fractional.da - 0.2) < 1e-12);
    assert.ok(Math.abs(fractional.db - 0.3) < 1e-12);
    assert.match(context.formatDelta(first, second), /Δa<\/span> \+0\.200/);
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

test('XYZ nearest-image measurements translate only periodic axes', () => {
    const context = app();
    context.structure = context.parseXYZ('2\nLattice="10 0 0 0 10 0 0 0 10" pbc="T F F"\nH 1 1 1\nH 9 9 9\n');
    vm.runInContext('currentStructure = structure; measurementMode = "nearest";', context);
    const first = { position: context.structure.atoms[0].position };
    const second = { position: context.structure.atoms[1].position };
    const pair = context.getMeasurementPair(first, second);
    assert.deepEqual(Array.from(pair.offset), [-1, 0, 0]);
    assert.ok(Math.abs(pair.distance - Math.sqrt(132)) < 1e-10);
    context.structure.pbc = [false, false, false];
    assert.equal(context.hasLattice(context.structure), true);
    assert.equal(context.isPeriodicStructure(context.structure), false);
    assert.equal(context.getMeasurementPair(first, second).nearest, false);
    assert.equal(context.measurementModeControlHTML(), '');
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
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    context.loadStructureFromText(example('examples/xyz/H2O.xyz'), 'H2O.xyz');
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
});

test('loading an example hides the picker and restores focus to its trigger', () => {
    const context = app();
    vm.runInContext('renderStructure = () => {}; updateUI = () => {}; updateUI_forCurrentMode = () => {}; updateModeToggleForFileType = () => {}; updateSupercellButtonState = () => {}; stopAnimation = () => {}; hideTimelinePanel = () => {};', context);
    const chip = {};
    const dropZone = context.document.getElementById('dropZone');
    dropZone.contains = target => target === chip;
    context.document.activeElement = chip;
    assert.equal(context.loadStructureFromText(example('examples/xyz/H2O.xyz'), 'H2O.xyz'), true);
    const examplesButton = context.document.getElementById('examplesBtn');
    assert.equal(dropZone.classList.contains('hidden'), true);
    assert.equal(examplesButton.getAttribute('aria-expanded'), 'false');
    assert.equal(context.document.activeElement, examplesButton);
});

function loadingApp() {
    const context = app();
    context.console = { error() {} };
    vm.runInContext('renderStructure = () => {}; updateUI = () => {}; updateUI_forCurrentMode = () => {}; updateModeToggleForFileType = () => {}; updateSupercellButtonState = () => {}; stopAnimation = () => {}; hideTimelinePanel = () => {};', context);
    return context;
}

test('a malformed XYZ property schema preserves the open document, source, and edit history', () => {
    const context = loadingApp();
    const source = '1\noriginal\nH 0 0 0\n';
    context.loadStructureFromText(source, 'original.xyz');
    vm.runInContext('currentStructure.atoms[0].position.x = 0.5; pushUndo({ type: "move_atom", index: 0 });', context);
    const structure = vm.runInContext('currentStructure', context);
    assert.throws(() => context.loadStructureFromText('1\nProperties=species:S:1:pos:X:3\nH 1 2 3\n', 'invalid.xyz'), /unknown Properties type/);
    assert.equal(vm.runInContext('currentStructure', context), structure);
    assert.equal(vm.runInContext('currentFilename', context), 'original.xyz');
    assert.equal(vm.runInContext('currentSourceText', context), source);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), true);
});

function deferred() {
    let resolve, reject;
    const promise = new Promise((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise; });
    return { promise, resolve, reject };
}

test('a slow example response cannot replace a newer document or its edits', async () => {
    const context = loadingApp();
    const slowBody = deferred();
    const bodyStarted = deferred();
    context.fetch = async path => ({
        ok: true,
        text: () => path === 'slow.xyz'
            ? (bodyStarted.resolve(), slowBody.promise)
            : Promise.resolve(example('examples/xyz/CH4.xyz'))
    });
    const slowLoad = context.loadExampleFile('slow.xyz');
    await bodyStarted.promise;
    assert.equal(await context.loadExampleFile('new.xyz'), true);
    context.pushUndo({ type: 'add_atom', index: 0 });
    const newStatus = context.document.getElementById('statusText').textContent;
    slowBody.resolve(example('examples/xyz/H2O.xyz'));
    assert.equal(await slowLoad, false);
    assert.equal(vm.runInContext('currentFilename', context), 'new.xyz');
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 5);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), true);
    assert.equal(context.document.getElementById('statusText').textContent, newStatus);
});

test('local opens supersede pending examples and stale file callbacks', async () => {
    const context = loadingApp();
    const slowResponse = deferred();
    context.fetch = () => slowResponse.promise;
    const readers = [];
    context.FileReader = class {
        constructor() { readers.push(this); }
        readAsText() {}
    };
    const slowExample = context.loadExampleFile('slow.xyz');
    context.handleFile({ name: 'old-local.xyz' });
    context.handleFile({ name: 'new-local.xyz' });
    readers[1].onload({ target: { result: example('examples/xyz/H2O.xyz') } });
    const newStatus = context.document.getElementById('statusText').textContent;
    readers[0].onload({ target: { result: example('examples/xyz/CH4.xyz') } });
    readers[0].error = new Error('Old read failed');
    readers[0].onerror();
    slowResponse.reject(new Error('Old fetch failed'));
    assert.equal(await slowExample, false);
    assert.equal(vm.runInContext('currentFilename', context), 'new-local.xyz');
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 3);
    assert.equal(context.document.getElementById('statusText').textContent, newStatus);
});

test('file read failures preserve the current document and undo history', () => {
    for (const synchronous of [false, true]) {
        const context = loadingApp();
        context.loadStructureFromText(example('examples/xyz/H2O.xyz'), 'current.xyz');
        context.pushUndo({ type: 'add_atom', index: 0 });
        let reader;
        context.FileReader = class {
            constructor() { reader = this; }
            readAsText() { if (synchronous) throw new Error('Access denied'); }
        };
        context.handleFile({ name: 'unreadable.xyz' });
        if (!synchronous) {
            reader.error = new Error('Access denied');
            reader.onerror();
        }
        assert.equal(vm.runInContext('currentFilename', context), 'current.xyz');
        assert.equal(vm.runInContext('currentStructure.atoms.length', context), 3);
        assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
        assert.equal(context.hasUnsavedEdits(), true);
        assert.match(context.document.getElementById('statusText').textContent, /Could not read unreadable\.xyz: Access denied/);
    }
});

test('trajectory controls announce the frame and next playback action', () => {
    const context = app();
    vm.runInContext('currentStructure = { isXDATCAR: true, totalFrames: 16, currentFrameIndex: 4 }; animationState.isPlaying = false;', context);
    context.updateTimelineUI();
    const slider = context.document.getElementById('frameSlider');
    assert.equal(slider.value, 4);
    assert.equal(slider.max, 15);
    assert.equal(slider.getAttribute('aria-valuetext'), 'Frame 5 of 16');
    context.updatePlayPauseButton();
    const button = context.document.getElementById('playPause');
    assert.equal(button.getAttribute('aria-label'), 'Play trajectory');
    vm.runInContext('animationState.isPlaying = true;', context);
    context.updatePlayPauseButton();
    assert.equal(button.getAttribute('aria-label'), 'Pause trajectory');
    assert.equal(button.classList.contains('playing'), true);
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
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), true);
    context.window.confirm = () => true;
    assert.equal(context.loadStructureFromText(example('examples/xyz/CH4.xyz'), 'CH4.xyz'), true);
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 5);
    assert.equal(context.hasUnsavedEdits(), false);
});

test('export keeps its Blob URL alive during download and preserves edits if click fails', () => {
    for (const shouldFail of [false, true]) {
        const context = app();
        context.structure = context.parseXYZ(example('examples/xyz/H2O.xyz'));
        const calls = { revoked: [], timer: null, anchor: null };
        context.Blob = Blob;
        context.URL = {
            createObjectURL() { return 'blob:export-test'; },
            revokeObjectURL(url) { calls.revoked.push(url); }
        };
        context.setTimeout = (callback, delay) => { calls.timer = { callback, delay }; };
        context.document.body = { appendChild(anchor) { calls.anchor = anchor; } };
        context.document.createElement = () => ({
            style: {},
            click() { if (shouldFail) throw new Error('download blocked'); },
            remove() { this.removed = true; }
        });
        vm.runInContext(`
            currentStructure = structure;
            currentFilename = 'H2O.xyz';
            pushUndo({ type: 'move_atom', index: 0 });
        `, context);
        assert.equal(context.hasUnsavedEdits(), true);
        context.exportStructure();
        assert.equal(calls.anchor.href, 'blob:export-test');
        assert.equal(calls.anchor.download, 'H2O_edited.xyz');
        assert.equal(calls.anchor.removed, undefined);
        assert.deepEqual(calls.revoked, []);
        assert.equal(calls.timer.delay, 60000);
        assert.equal(context.hasUnsavedEdits(), shouldFail);
        assert.match(context.document.getElementById('statusText').textContent,
            shouldFail ? /Could not start/ : /Started XYZ download/);
        calls.timer.callback();
        assert.equal(calls.anchor.removed, true);
        assert.deepEqual(calls.revoked, ['blob:export-test']);
    }
});

test('POSCAR with extra data exports unchanged text and asks before a lossy edited export', () => {
    const context = app();
    const source = ['cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H', '1', 'Direct', '0 0 0', '', 'Cartesian', '0.1 0.2 0.3', ''].join('\n');
    vm.runInContext('renderStructure = () => {}; updateUI = () => {}; updateUI_forCurrentMode = () => {}; updateModeToggleForFileType = () => {}; updateSupercellButtonState = () => {}; stopAnimation = () => {}; hideTimelinePanel = () => {};', context);
    context.loadStructureFromText(source, 'velocity.poscar');
    assert.equal(context.document.getElementById('statusText').className, 'warning');
    const downloads = [];
    context.Blob = class { constructor(parts) { this.content = parts.join(''); } };
    context.URL = { createObjectURL(blob) { downloads.push(blob.content); return 'blob:test'; }, revokeObjectURL() {} };
    context.setTimeout = () => {};
    context.document.body = { appendChild() {} };
    context.document.createElement = () => ({ style: {}, click() {}, remove() {} });
    let confirmations = 0;
    context.window.confirm = () => { confirmations++; return false; };
    context.exportStructure();
    assert.equal(downloads[0], source);
    assert.equal(confirmations, 0);
    vm.runInContext('currentStructure.atoms[0].position.x = 0.25; pushUndo({ type: "move_atom", index: 0 });', context);
    context.exportStructure();
    assert.equal(downloads.length, 1);
    assert.equal(confirmations, 1);
    assert.equal(context.hasUnsavedEdits(), true);
    context.window.confirm = () => { confirmations++; return true; };
    context.exportStructure();
    assert.equal(downloads.length, 2);
    assert.ok(!downloads[1].includes('0.1 0.2 0.3'));
    assert.match(downloads[1], /0\.250000000/);
    assert.equal(context.hasUnsavedEdits(), false);
});

test('XYZ exports exact source until edited and asks before omitting extra atom data', () => {
    const sources = [
        '1\nLattice="2 0 0 0 2 0 0 0 2" Properties=charge:R:1:pos:R:3:species:S:1 sample\n0.314159 0.123456789123 0 0 H\n',
        '1\nsample\nH 0.123456789123 0 0 0.314159\n'
    ];
    for (const source of sources) {
        const context = loadingApp();
        context.loadStructureFromText(source, 'charge.xyz');
        assert.equal(context.document.getElementById('statusText').className, 'warning');
        const downloads = [];
        context.Blob = class { constructor(parts) { this.content = parts.join(''); } };
        context.URL = { createObjectURL(blob) { downloads.push(blob.content); return 'blob:test'; }, revokeObjectURL() {} };
        context.setTimeout = () => {};
        context.document.body = { appendChild() {} };
        context.document.createElement = () => ({ style: {}, click() {}, remove() {} });
        const confirmations = [];
        context.window.confirm = message => { confirmations.push(message); return false; };
        context.exportStructure();
        assert.equal(downloads[0], source);
        assert.equal(confirmations.length, 0);
        vm.runInContext(`
            const oldPosition = currentStructure.atoms[0].position.clone();
            currentStructure.atoms[0].position.x = 0.25;
            pushUndo({ type: 'move_atom', index: 0, oldPosition });
        `, context);
        context.exportStructure();
        assert.equal(downloads.length, 1);
        assert.match(confirmations[0], /charges or forces/);
        assert.equal(context.hasUnsavedEdits(), true);
        assert.match(context.document.getElementById('statusText').textContent, /Export canceled/);
        context.window.confirm = () => true;
        context.exportStructure();
        assert.equal(downloads.length, 2);
        assert.ok(!downloads[1].includes('0.314159'));
        assert.equal(context.parseXYZ(downloads[1]).atoms[0].position.x, 0.25);
        assert.equal(context.parseXYZ(downloads[1]).hasAdditionalProperties, false);
        assert.equal(context.hasUnsavedEdits(), false);
        assert.match(context.document.getElementById('statusText').textContent, /XYZ download without additional source data/);
        context.performUndo();
        context.window.confirm = () => { throw new Error('Restored source should not require confirmation'); };
        context.exportStructure();
        assert.equal(downloads[2], source);
    }
});

test('unchanged geometry-only XYZ export preserves precision and a blank comment', () => {
    const context = loadingApp();
    const source = '1\n\nHe 0.12345678912345 0 0\n';
    context.loadStructureFromText(source, 'precision.xyz');
    const downloads = [];
    context.Blob = class { constructor(parts) { this.content = parts.join(''); } };
    context.URL = { createObjectURL(blob) { downloads.push(blob.content); return 'blob:test'; }, revokeObjectURL() {} };
    context.setTimeout = () => {};
    context.document.body = { appendChild() {} };
    context.document.createElement = () => ({ style: {}, click() {}, remove() {} });
    context.window.confirm = () => { throw new Error('Geometry-only export should not require confirmation'); };
    context.exportStructure();
    assert.equal(downloads[0], source);
});

test('deleting every atom remains reversible and exports only after atoms are restored or added', () => {
    const sources = [
        { text: example('examples/xyz/H2O.xyz'), name: 'water.xyz', parse: 'parseXYZ' },
        { text: ['mixed cell', '1', '2 0 0', '0 2 0', '0 0 2', 'H O', '1 1', 'Selective Dynamics', 'Cartesian', '0 0 0 F T F', '1 1 1 T T T'].join('\n'), name: 'mixed.poscar', parse: 'parsePOSCAR' }
    ];
    for (const source of sources) {
        const context = loadingApp();
        context.loadStructureFromText(source.text, source.name);
        const original = vm.runInContext('JSON.stringify(currentStructure.atoms)', context);
        vm.runInContext(`
            updateEditUI = () => {};
            clearSelectionWithoutUndo = () => { selectedAtoms = []; };
            selectedAtoms = currentStructure.atoms.map((_, index) => ({ index }));
        `, context);
        const downloads = [];
        context.Blob = class { constructor(parts) { this.content = parts.join(''); } };
        context.URL = { createObjectURL(blob) { downloads.push(blob.content); return 'blob:test'; }, revokeObjectURL() {} };
        context.setTimeout = () => {};
        context.document.body = { appendChild() {} };
        context.document.createElement = () => ({ style: {}, click() {}, remove() {} });
        context.deleteSelectedAtoms();
        assert.equal(vm.runInContext('currentStructure.atoms.length', context), 0);
        assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
        context.exportStructure();
        assert.equal(downloads.length, 0);
        assert.equal(context.hasUnsavedEdits(), true);
        assert.match(context.document.getElementById('statusText').textContent, /empty structure.*Add an atom or Undo/);
        context.performUndo();
        assert.equal(vm.runInContext('JSON.stringify(currentStructure.atoms)', context), original);
        context.exportStructure();
        assert.equal(context[source.parse](downloads[0]).atoms.length, JSON.parse(original).length);
        context.performRedo();
        context.exportStructure();
        assert.equal(downloads.length, 1);
        assert.equal(context.hasUnsavedEdits(), true);
        context.document.querySelector = () => ({ value: 'cartesian' });
        context.document.getElementById('addAtomElement').value = 'H';
        for (const axis of ['X', 'Y', 'Z']) context.document.getElementById(`addAtom${axis}`).value = '0';
        context.addAtomFromInput();
        context.exportStructure();
        const restored = context[source.parse](downloads[1]);
        assert.equal(restored.atoms.length, 1);
        assert.equal(restored.atoms[0].element, 'H');
        assert.equal(context.hasUnsavedEdits(), false);
    }
});

test('empty structures show recovery guidance and disable atom-number navigation', () => {
    const context = app();
    context.structure = context.parseXYZ('1\nempty check\nH 0 0 0\n');
    context.structure.atoms = [];
    context.structure.elements = [];
    context.structure.counts = [];
    context.updateUI(context.structure);
    const atomHTML = context.document.getElementById('atomList').innerHTML;
    assert.match(atomHTML, /id="atomJumpInput"[^>]*placeholder="No atoms"[^>]*disabled/);
    assert.match(atomHTML, /<button[^>]*disabled>Select<\/button>/);
    const getElement = context.document.getElementById;
    context.document.getElementById = id => { const element = getElement(id); element.addEventListener = () => {}; return element; };
    context.document.querySelectorAll = () => [];
    vm.runInContext('currentStructure = structure; updateEditUI();', context);
    assert.match(context.document.getElementById('measurementPanel').innerHTML, /No atoms remain. Add an atom or Undo the deletion/);
    assert.match(context.document.getElementById('measurementPanel').innerHTML, /id="addAtomBtn"/);
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
    assert.equal(vm.runInContext('editHistory.redoStack.length', context), 0);
});

test('redoing regular and periodic-image selections reuses atom meshes', () => {
    for (const isGhost of [false, true]) {
        const context = app();
        const offset = { a: 1, b: 0, c: 0 };
        const regularMesh = {
            userData: { isGhost: false },
            getWorldPosition(target) { target.copy(new Vector3(1, 2, 3)); }
        };
        const ghostMesh = {
            userData: { isGhost: true, originalIndex: 0, cellOffset: offset },
            getWorldPosition(target) { target.copy(new Vector3(4, 2, 3)); }
        };
        Object.assign(context, { regularMesh, ghostMesh });
        vm.runInContext(`
            atomMeshes = [regularMesh, ghostMesh];
            settings.periodic = { a: 2, b: 1, c: 1 };
            renderStructure = () => { throw new Error('selection redo rebuilt the structure'); };
            rebuildSelectionVisuals = () => {};
            updateUI_forCurrentMode = () => {};
            unhighlightAtomMesh = () => {};
        `, context);
        context.isGhost = isGhost;
        vm.runInContext(`
            selectedAtoms = [{
                mesh: isGhost ? ghostMesh : regularMesh,
                index: isGhost ? 'ghost_0_100' : 0,
                originalIndex: 0,
                element: 'Si',
                position: new THREE.Vector3(isGhost ? 4 : 1, 2, 3),
                isGhost,
                cellOffset: isGhost ? { a: 1, b: 0, c: 0 } : null
            }];
            isMeasurementSelection = true;
            pushUndo({ type: 'select_atom', atomData: { index: selectedAtoms[0].index, isGhost } });
        `, context);
        context.performUndo();
        assert.equal(vm.runInContext('selectedAtoms.length', context), 0);
        vm.runInContext('settings.periodic.a = 3', context);
        context.performRedo();
        assert.equal(vm.runInContext('selectedAtoms.length', context), 1);
        assert.equal(vm.runInContext('selectedAtoms[0].mesh === (isGhost ? ghostMesh : regularMesh)', context), true);
        assert.equal(vm.runInContext('selectedAtoms[0].position.x', context), isGhost ? 4 : 1);
        assert.equal(vm.runInContext('isMeasurementSelection', context), true);
        assert.equal(vm.runInContext('settings.periodic.a', context), 3);
        assert.equal(context.hasUnsavedEdits(), false);
    }
});

test('redoing cleared selections does not rebuild the structure', () => {
    const context = app();
    const mesh = {
        userData: { isGhost: false },
        getWorldPosition(target) { target.copy(new Vector3(1, 2, 3)); }
    };
    context.mesh = mesh;
    vm.runInContext(`
        atomMeshes = [mesh];
        selectedAtoms = [{ mesh, index: 0, originalIndex: 0, element: 'Si',
            position: new THREE.Vector3(1, 2, 3), isGhost: false, cellOffset: null }];
        renderStructure = () => { throw new Error('clear redo rebuilt the structure'); };
        rebuildSelectionVisuals = () => {};
        updateUI_forCurrentMode = () => {};
        clearMeasurementVisuals = () => {};
        highlightAtomMesh = () => {};
        unhighlightAtomMesh = () => {};
        clearSelection();
    `, context);
    assert.equal(vm.runInContext('selectedAtoms.length', context), 0);
    context.performUndo();
    assert.equal(vm.runInContext('selectedAtoms.length', context), 1);
    context.performRedo();
    assert.equal(vm.runInContext('selectedAtoms.length', context), 0);
    assert.equal(context.hasUnsavedEdits(), false);
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
    assert.equal(vm.runInContext('currentStructure.isDirect', context), false);
    context.performRedo();
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), initialAtoms * 2);
    assert.equal(vm.runInContext('currentStructure.isXYZ && currentStructure.hasExplicitLattice', context), true);
    assert.equal(vm.runInContext('currentStructure.isDirect', context), false);
});

test('failed supercell preparation preserves structure, preview, selections, and both history stacks', () => {
    for (const source of [
        '1\nLattice="1e102 0 0 0 1e102 0 0 0 1e102"\nH 0 0 0\n',
        '1\nLattice="8e307 0 0 0 1e-154 0 0 0 1e-154"\nH 1.4e308 0 0\n'
    ]) {
        const context = loadingApp();
        context.loadStructureFromText(source, 'extreme.xyz');
        context.source = source;
        vm.runInContext(`
            settings.periodic = { a: 20, b: currentStructure.lattice[0][0] < 1e200 ? 20 : 1, c: 1 };
            if (currentStructure.lattice[0][0] > 1e200) settings.periodic.a = 2;
            selectedAtoms = [{ index: 0, element: 'H' }];
            pushUndo({ type: 'select_atom', atomData: { index: 0 } });
            editHistory.redoStack = [{ operation: { type: 'clear_selection' } }];
            globalThis.beforeState = JSON.stringify({ structure: currentStructure, periodic: settings.periodic, selectedAtoms, undoStack: editHistory.undoStack, redoStack: editHistory.redoStack });
        `, context);
        assert.equal(context.convertToSupercell(), false);
        assert.equal(vm.runInContext('JSON.stringify({ structure: currentStructure, periodic: settings.periodic, selectedAtoms, undoStack: editHistory.undoStack, redoStack: editHistory.redoStack })', context), context.beforeState);
        assert.equal(context.hasUnsavedEdits(), false);
        assert.match(context.document.getElementById('statusText').textContent, /Cannot create supercell/);
        assert.equal(vm.runInContext('currentSourceText', context), source);
    }
});

test('prepared supercells export and reopen with matching positions, constraints, and fractional coordinates', () => {
    const context = loadingApp();
    context.loadStructureFromText(example('examples/poscar/Al_slab_selective.poscar'), 'slab.poscar');
    vm.runInContext('settings.periodic = { a: 2, b: 2, c: 1 };', context);
    assert.equal(context.convertToSupercell(), true);
    const generated = context.generatePOSCAR();
    const reparsed = context.parsePOSCAR(generated);
    const atoms = vm.runInContext('currentStructure.atoms', context);
    assert.equal(reparsed.atoms.length, atoms.length);
    atoms.forEach((atom, index) => {
        assert.ok(atom.fractional.every(Number.isFinite));
        const position = context.fractionalToCartesian(atom.fractional, reparsed.lattice);
        assert.ok(atom.position.distanceTo(position) < 1e-9);
        assert.ok(atom.position.distanceTo(reparsed.atoms[index].position) < 1e-9);
        assert.deepEqual(Array.from(atom.selectiveDynamics), Array.from(reparsed.atoms[index].selectiveDynamics));
    });
    assert.equal(reparsed.atoms.filter(atom => atom.selectiveDynamics.some(value => !value)).length,
        atoms.filter(atom => atom.selectiveDynamics.some(value => !value)).length);
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

test('overflowing exact coordinates leave the atom and undo history unchanged', () => {
    const context = app();
    context.structure = context.parsePOSCAR(example('examples/poscar/Si_diamond.poscar'));
    vm.runInContext(`
        currentStructure = structure;
        selectedAtoms = [{ index: 0, isGhost: false, element: 'Si' }];
        selectedAtomCoordMode = 'fractional';
    `, context);
    context.document.getElementById('editAtom0').value = '1e308';
    context.document.getElementById('editAtom1').value = '0';
    context.document.getElementById('editAtom2').value = '0';
    const oldPosition = context.structure.atoms[0].position.clone();
    assert.equal(context.applyExactAtomCoordinates(), false);
    assert.equal(context.structure.atoms[0].position.distanceTo(oldPosition), 0);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.match(context.document.getElementById('editAtomError').textContent, /cannot be represented/);
});

function prepareDragContext(structure) {
    const context = app();
    context.structure = structure;
    const captured = new Set();
    context.canvas = {
        setPointerCapture(id) { captured.add(id); },
        hasPointerCapture(id) { return captured.has(id); },
        releasePointerCapture(id) { captured.delete(id); }
    };
    vm.runInContext(`
        currentStructure = structure;
        currentMode = 'edit';
        renderer = { domElement: canvas };
        controls = { enabled: false };
        removeDragGuidePlane = () => {};
        createDragGuidePlane = () => {};
        clearVacuumHighlight = () => {};
        rebuildDisplayOptions = () => {};
        renderStructure = () => {};
        updateVacuumHandles = () => {};
        updateUI = structure => { lastUiLattice = structure.lattice?.[0][0]; };
        updateEditUI = () => {};
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
        highlightAtomMesh = () => {};
        unhighlightAtomMesh = () => {};
        captureEditPointer({ pointerId: 7 });
    `, context);
    return { context, captured };
}

test('atom drag keeps tilted-cell coordinates current and skips a stationary drag', () => {
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    for (const moved of [false, true]) {
        const start = new Vector3(...CrystalGeometry.fractionalToCartesian([0.2, 0.3, 0.4], lattice));
        const end = new Vector3(...CrystalGeometry.fractionalToCartesian([moved ? 0.4 : 0.2, 0.3, 0.4], lattice));
        const { context, captured } = prepareDragContext({ lattice, atoms: [{ element: 'H', position: start.clone(), fractional: [0.2, 0.3, 0.4] }] });
        Object.assign(context, { start, end });
        vm.runInContext(`
            draggedAtom = { index: 0, mesh: { position: start.clone() }, startPosition: start.clone() };
            structureGroup = { position: new THREE.Vector3() };
            getMouseNDC = () => ({ distanceTo: () => 0.1 });
            mouse = { copy() {} };
            raycaster = { setFromCamera() {}, ray: { intersectPlane(plane, target) { return target.copy(end); } } };
            constrainToPolygon = point => point;
            onMouseMove({ pointerId: 7 });
        `, context);
        assert.ok(Math.abs(context.structure.atoms[0].fractional[0] - (moved ? 0.4 : 0.2)) < 1e-10);
        assert.equal(context.hasUnsavedEdits(), moved);
        context.onMouseUp({ button: 0, pointerId: 7 });
        assert.equal(vm.runInContext('editHistory.undoStack.length', context), moved ? 1 : 0);
        assert.equal(context.hasUnsavedEdits(), moved);
        assert.equal(vm.runInContext('draggedAtom', context), null);
        assert.equal(vm.runInContext('controls.enabled', context), true);
        assert.equal(captured.size, 0);
    }
});

test('canceled atom drag restores coordinates, history, and pointer control', () => {
    const lattice = [[2, 0, 0], [0, 2, 0], [0, 0, 2]];
    const { context, captured } = prepareDragContext({ lattice, atoms: [{ element: 'H', position: new Vector3(1.5, 0, 0), fractional: [0.75, 0, 0] }] });
    vm.runInContext(`
        draggedAtom = { index: 0, mesh: { position: new THREE.Vector3(1.5, 0, 0) }, startPosition: new THREE.Vector3(1, 0, 0) };
        isDragging = true;
        editHistory.redoStack = [{ operation: { type: 'select_atom' } }];
    `, context);
    assert.equal(context.hasUnsavedEdits(), true);
    context.cancelEditDrag({ pointerId: 8 });
    assert.equal(context.structure.atoms[0].position.x, 1.5);
    assert.equal(captured.size, 1);
    context.cancelEditDrag({ pointerId: 7 });
    assert.equal(context.structure.atoms[0].position.x, 1);
    assert.deepEqual(Array.from(context.structure.atoms[0].fractional), [0.5, 0, 0]);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.equal(vm.runInContext('editHistory.redoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), false);
    assert.equal(vm.runInContext('controls.enabled && !isDragging && draggedAtom === null', context), true);
    assert.equal(captured.size, 0);
});

test('undo cancels an unfinished drag before touching existing history', () => {
    const { context } = prepareDragContext({ isXYZ: true, atoms: [{ element: 'H', position: new Vector3(2, 0, 0) }] });
    vm.runInContext(`
        pushUndo({ type: 'select_atom', atomData: { index: 0 } });
        draggedAtom = { index: 0, mesh: { position: new THREE.Vector3(2, 0, 0) }, startPosition: new THREE.Vector3(1, 0, 0) };
        isDragging = true;
    `, context);
    context.performUndo();
    assert.equal(context.structure.atoms[0].position.x, 1);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), false);
});

test('export finishes a live drag and saves the moved coordinates with undo intact', () => {
    const { context, captured } = prepareDragContext({ isXYZ: true, atoms: [{ element: 'H', position: new Vector3(2, 0, 0) }] });
    let download;
    context.Blob = class { constructor(parts) { this.content = parts.join(''); } };
    context.URL = { createObjectURL(blob) { download = blob.content; return 'blob:test'; }, revokeObjectURL() {} };
    context.setTimeout = () => {};
    context.document.body = { appendChild() {} };
    context.document.createElement = () => ({ style: {}, click() {}, remove() {} });
    vm.runInContext(`
        draggedAtom = { index: 0, mesh: { position: new THREE.Vector3(2, 0, 0) }, startPosition: new THREE.Vector3(1, 0, 0) };
        isDragging = true;
    `, context);
    context.exportStructure();
    assert.match(download, /H 2\.000000000 0\.000000000 0\.000000000/);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), false);
    assert.equal(captured.size, 0);
    context.performUndo();
    assert.equal(context.structure.atoms[0].position.x, 1);
    assert.equal(context.hasUnsavedEdits(), true);
});

test('cell drags update fractional coordinates, skip no changes, and roll back cancellation', () => {
    for (const action of ['unchanged', 'commit', 'cancel']) {
        const { context, captured } = prepareDragContext({ lattice: [[action === 'unchanged' ? 2 : 4, 0, 0], [0, 2, 0], [0, 0, 2]], atoms: [{ element: 'H', position: new Vector3(1, 0, 0), fractional: [0.5, 0, 0] }] });
        vm.runInContext(`
            vacuumDragState.isDragging = true;
            vacuumDragState.dragExtendAxis = 'a';
            vacuumDragState.originalLattice = [[2, 0, 0], [0, 2, 0], [0, 0, 2]];
            vacuumDragState.originalAtomPositions = [{ x: 1, y: 0, z: 0 }];
        `, context);
        assert.equal(context.hasUnsavedEdits(), action !== 'unchanged');
        if (action === 'cancel') context.cancelEditDrag();
        else context.onMouseUp({ button: 0, pointerId: 7 });
        assert.equal(context.structure.lattice[0][0], action === 'commit' ? 4 : 2);
        assert.equal(context.structure.atoms[0].fractional[0], action === 'commit' ? 0.25 : 0.5);
        assert.equal(vm.runInContext('editHistory.undoStack.length', context), action === 'commit' ? 1 : 0);
        assert.equal(vm.runInContext('lastUiLattice', context), action === 'commit' ? 4 : 2);
        assert.equal(captured.size, 0);
        if (action === 'commit') {
            context.performUndo();
            assert.equal(vm.runInContext('currentStructure.lattice[0][0]', context), 2);
            assert.equal(vm.runInContext('currentStructure.atoms[0].fractional[0]', context), 0.5);
            assert.equal(context.hasUnsavedEdits(), false);
            context.performRedo();
            assert.equal(vm.runInContext('currentStructure.lattice[0][0]', context), 4);
            assert.equal(vm.runInContext('currentStructure.atoms[0].fractional[0]', context), 0.25);
            assert.equal(context.hasUnsavedEdits(), true);
        }
        if (action === 'commit') {
            context.performUndo();
            assert.equal(context.structure.atoms[0].fractional[0], 0.5);
            context.performRedo();
            assert.equal(vm.runInContext('currentStructure.atoms[0].fractional[0]', context), 0.25);
        }
    }
});

test('cell drag proposals stay valid and rejected proposals preserve preview and history', () => {
    const context = app();
    context.structure = context.parsePOSCAR('cell\n1\n10 0 0\n0 10 0\n0 0 10\nH\n1\nCartesian\n-2 0 0\n');
    vm.runInContext(`
        currentStructure = structure;
        Object.assign(vacuumDragState, { isDragging: true, dragExtendAxis: 'a', dragHandle: 'far',
            originalLattice: currentStructure.lattice.map(vector => [...vector]),
            originalAtomPositions: currentStructure.atoms.map(atom => atom.position.clone()) });
        renderStructure = () => {};
        createDragFaceHighlight = () => {};
        calculateDragDelta = () => -10;
        updateVacuumDrag({});
    `, context);
    assert.equal(context.structure.lattice[0][0], 0.001);
    assert.ok(context.structure.atoms[0].fractional.every(Number.isFinite));
    const preview = JSON.stringify(context.structure);
    vm.runInContext('calculateDragDelta = () => Infinity; updateVacuumDrag({});', context);
    assert.equal(JSON.stringify(context.structure), preview);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.equal(vm.runInContext('editHistory.currentEditRevision', context), 0);
    assert.match(context.document.getElementById('statusText').textContent, /Cell resize stopped/);
});

test('coordinate edit proposals reject every invalid atom before changing document or history', () => {
    const context = app();
    context.structure = context.parsePOSCAR(example('examples/poscar/Si_diamond.poscar'));
    vm.runInContext('currentStructure = structure;', context);
    const before = JSON.stringify(context.structure);
    assert.throws(() => context.commitGeometryEdit({ type: 'shift_atoms' }, [{ index: 0, position: new Vector3(1, 2, 3) }, { index: 1, position: new Vector3(Infinity, 0, 0) }]), /finite/);
    assert.equal(JSON.stringify(context.structure), before);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
});

test('shift form rejects invalid moves atomically and keeps success feedback visible', () => {
    const context = app();
    context.structure = context.parsePOSCAR(example('examples/poscar/Si_diamond.poscar'));
    const elements = new Map();
    context.document.getElementById = id => {
        if (!elements.has(id)) elements.set(id, { value: '', textContent: '', className: '', classList: { add() {}, remove() {} } });
        return elements.get(id);
    };
    let mode = 'cartesian';
    context.document.querySelector = () => ({ value: mode });
    context.replaceFeedback = () => elements.set('shiftError', { textContent: '', className: '' });
    vm.runInContext(`
        currentStructure = structure;
        selectedAtoms = [];
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = () => {
            replaceFeedback();
            renderedShift = { ...lastShiftCoords };
        };
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
    `, context);
    const original = context.structure.atoms[0].position.clone();
    context.document.getElementById('shiftA').value = '1oops';
    context.applyGlobalPeriodicShift();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.equal(context.structure.atoms[0].position.distanceTo(original), 0);
    assert.match(context.document.getElementById('shiftError').textContent, /finite shift/);

    mode = 'fractional';
    context.document.getElementById('shiftA').value = '1e308';
    context.applyGlobalPeriodicShift();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.equal(context.structure.atoms[0].position.distanceTo(original), 0);
    assert.match(context.document.getElementById('shiftError').textContent, /cannot be represented/);

    mode = 'cartesian';
    context.document.getElementById('shiftA').value = '0.25';
    context.applyGlobalPeriodicShift();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.ok(Math.abs(context.structure.atoms[0].position.x - 0.25) < 1e-10);
    assert.equal(vm.runInContext('renderedShift.a', context), 0.25);
    assert.match(context.document.getElementById('shiftError').textContent, /Shifted all atoms/);
    context.performUndo();
    assert.equal(context.structure.atoms[0].position.distanceTo(original), 0);
    assert.deepEqual(Array.from(context.structure.atoms[0].fractional), [0, 0, 0]);
    context.performRedo();
    assert.ok(Math.abs(vm.runInContext('currentStructure.atoms[0].position.x', context) - 0.25) < 1e-10);
});

test('add atom form rejects partial numbers and shows feedback after rebuilding', () => {
    const context = app();
    context.structure = context.parseXYZ(example('examples/xyz/H2O.xyz'));
    const elements = new Map();
    context.document.getElementById = id => {
        if (!elements.has(id)) elements.set(id, { value: '', textContent: '', className: '', classList: { add() {}, remove() {} } });
        return elements.get(id);
    };
    context.document.querySelector = () => ({ value: 'cartesian' });
    context.replaceFeedback = () => elements.set('addAtomError', { textContent: '', className: '' });
    vm.runInContext(`
        currentStructure = structure;
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = replaceFeedback;
    `, context);
    context.document.getElementById('addAtomElement').value = 'H';
    context.document.getElementById('addAtomX').value = '1oops';
    context.document.getElementById('addAtomY').value = '0';
    context.document.getElementById('addAtomZ').value = '2';
    context.addAtomFromInput();
    assert.equal(context.structure.atoms.length, 3);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.match(context.document.getElementById('addAtomError').textContent, /Invalid coordinates/);

    context.document.getElementById('addAtomX').value = '1';
    context.addAtomFromInput();
    assert.equal(context.structure.atoms.length, 4);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.match(context.document.getElementById('addAtomError').textContent, /Added H/);
});

test('selected fractional shift wraps in a tilted cell and undo restores coordinates', () => {
    const context = app();
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    const first = context.fractionalToCartesian([0.9, 0.1, 0.1], lattice);
    const originalFirst = first.clone();
    const second = context.fractionalToCartesian([0.2, 0.2, 0.2], lattice);
    const originalSecond = second.clone();
    context.structure = { lattice, atoms: [
        { element: 'H', position: first, fractional: [0.9, 0.1, 0.1] },
        { element: 'H', position: second, fractional: [0.2, 0.2, 0.2] }
    ] };
    vm.runInContext(`
        currentStructure = structure;
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = () => {};
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
    `, context);
    assert.equal(context.applyPeriodicShiftByFractional(0.3, 0, 0, [0]).changedCount, 1);
    const shifted = context.cartesianToFractional(context.structure.atoms[0].position, lattice);
    assert.ok(Math.abs(shifted[0] - 0.2) < 1e-10);
    assert.equal(context.structure.atoms[1].position.distanceTo(originalSecond), 0);
    context.performUndo();
    assert.equal(context.structure.atoms[0].position.distanceTo(originalFirst), 0);
    assert.ok(Math.abs(context.structure.atoms[0].fractional[0] - 0.9) < 1e-10);
    context.performRedo();
    assert.ok(Math.abs(vm.runInContext('currentStructure.atoms[0].fractional[0]', context) - 0.2) < 1e-10);
});

test('center in cell moves a boundary-spanning cluster to the middle of a tilted cell', () => {
    const context = app();
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    context.structure = { lattice, atoms: [0.99, 0.01].map(a => ({
        element: 'H', position: context.fractionalToCartesian([a, 0.5, 0.5], lattice),
        fractional: [a, 0.5, 0.5]
    })) };
    vm.runInContext(`
        currentStructure = structure;
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = () => {};
        updateUI_forCurrentMode = () => {};
    `, context);
    context.centerStructureInCell();
    const centered = context.structure.atoms.map(atom => context.cartesianToFractional(atom.position, lattice));
    assert.ok(Math.abs(centered[0][0] - 0.49) < 1e-10);
    assert.ok(Math.abs(centered[1][0] - 0.51) < 1e-10);
    assert.ok(centered.every(frac => Math.abs(frac[1] - 0.5) < 1e-10 && Math.abs(frac[2] - 0.5) < 1e-10));
    context.centerStructureInCell();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.match(context.document.getElementById('shiftError').textContent, /already centered/);
    context.performUndo();
    assert.ok(Math.abs(context.cartesianToFractional(context.structure.atoms[0].position, lattice)[0] - 0.99) < 1e-10);
    assert.equal(context.hasUnsavedEdits(), false);
    context.performRedo();
    assert.ok(Math.abs(vm.runInContext('currentStructure.atoms[0].fractional[0]', context) - 0.49) < 1e-10);
});

test('whole-cell periodic shifts preserve exact positions, redo history, and the clean state', () => {
    const context = app();
    const lattice = [[2, 0, 0], [0.8, 3, 0], [0.4, 0.5, 4]];
    context.structure = { lattice, atoms: [0.2, 0.4].map(a => ({
        element: 'H', position: context.fractionalToCartesian([a, 0.3, 0.4], lattice), fractional: [a, 0.3, 0.4]
    })) };
    const originalPositions = context.structure.atoms.map(atom => atom.position.clone());
    context.document.querySelector = () => ({ value: 'fractional' });
    vm.runInContext(`
        currentStructure = structure;
        editHistory.redoStack = [{ operation: { type: 'select_atom' } }];
        renderStructure = () => { throw new Error('unchanged shift rebuilt the structure'); };
    `, context);
    assert.equal(context.applyPeriodicShiftByFractional(1, 0, 0).changedCount, 0);
    context.document.getElementById('shiftA').value = '1';
    context.applyGlobalPeriodicShift();
    context.structure.atoms.forEach((atom, index) => assert.equal(atom.position.distanceTo(originalPositions[index]), 0));
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.equal(vm.runInContext('editHistory.redoStack.length', context), 1);
    assert.equal(context.hasUnsavedEdits(), false);
    assert.match(context.document.getElementById('shiftError').textContent, /positions unchanged/);
});

test('XYZ shifts wrap periodic axes and retain unrestricted coordinates through undo and export', () => {
    const context = loadingApp();
    vm.runInContext('updateEditUI = () => {}', context);
    context.loadStructureFromText('1\nLattice="10 0 0 0 10 0 0 0 10" pbc="T F F"\nH 9 9 9\n', 'partial.xyz');
    assert.equal(context.applyPeriodicShiftByFractional(0.3, 0.3, 0.3).changedCount, 1);
    const shifted = context.parseXYZ(context.generateXYZ());
    assert.ok(Math.abs(shifted.atoms[0].position.x - 2) < 1e-10);
    assert.equal(shifted.atoms[0].position.y, 12);
    assert.equal(shifted.atoms[0].position.z, 12);
    assert.deepEqual(Array.from(shifted.pbc), [true, false, false]);
    context.performUndo();
    assert.equal(vm.runInContext('currentStructure.atoms[0].position.y', context), 9);
    context.performRedo();
    assert.equal(vm.runInContext('currentStructure.atoms[0].position.y', context), 12);
    assert.deepEqual(Array.from(vm.runInContext('currentStructure.pbc', context)), [true, false, false]);
    const outside = context.isPositionInCell(new Vector3(5, 20, -10), shifted.lattice, shifted.pbc);
    assert.equal(outside.valid, true);
    assert.deepEqual(Array.from(outside.fractional), [0.5, 2, -1]);
});

test('XYZ previews and supercells repeat only permitted axes', () => {
    const context = loadingApp();
    context.loadStructureFromText('1\nLattice="10 0 0 0 10 0 0 0 10" pbc="T F F"\nH 1 1 1\n', 'partial.xyz');
    vm.runInContext('settings.periodic = { a: 2, b: 3, c: 4 };', context);
    assert.equal(vm.runInContext('countDisplayedAtoms(currentStructure)', context), 2);
    vm.runInContext(`
        settings.showCell = false;
        structureGroup = { children: [], add(child) { this.children.push(child); } };
        atomMeshes = [];
        createGhostAtom = (element, position, originalIndex, cellOffset) => ({ position, cellOffset });
        addPeriodicImages(currentStructure);
    `, context);
    assert.equal(vm.runInContext('atomMeshes.length', context), 1);
    assert.deepEqual(Array.from(vm.runInContext('[atomMeshes[0].position.x, atomMeshes[0].position.y, atomMeshes[0].position.z]', context)), [11, 1, 1]);
    assert.equal(context.convertToSupercell(), true);
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 2);
    assert.deepEqual(Array.from(vm.runInContext('currentStructure.lattice.map(row => Math.hypot(...row))', context)), [20, 10, 10]);
    assert.deepEqual(Array.from(vm.runInContext('currentStructure.pbc', context)), [true, false, false]);
    context.performUndo();
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 1);
    context.performRedo();
    assert.equal(vm.runInContext('currentStructure.atoms.length', context), 2);
    assert.deepEqual(Array.from(vm.runInContext('currentStructure.pbc', context)), [true, false, false]);
});

test('XYZ periodic controls disable individual axes while retaining the cell display', () => {
    const context = app();
    context.structure = context.parseXYZ('1\nLattice="10 0 0 0 10 0 0 0 10" pbc="T F F"\nH 1 1 1\n');
    const buttons = ['a', 'b', 'c'].map(axis => ({ dataset: { axis } }));
    context.document.querySelectorAll = () => buttons;
    context.document.querySelector = () => ({});
    context.document.getElementById('vacuumInfo').style = {};
    vm.runInContext('currentStructure = structure;', context);
    context.updateModeToggleForFileType();
    assert.deepEqual(buttons.map(button => button.disabled), [false, true, true]);
    assert.equal(context.document.getElementById('toggleCell').disabled, false);
    context.structure.pbc = [false, false, false];
    context.updateModeToggleForFileType();
    assert.ok(buttons.every(button => button.disabled));
    assert.equal(context.document.getElementById('toggleCell').disabled, false);
});

test('a nonperiodic XYZ cell translates without wrapping and centers using its actual coordinates', () => {
    const context = loadingApp();
    vm.runInContext('updateEditUI = () => {}', context);
    context.loadStructureFromText('2\nLattice="10 0 0 0 10 0 0 0 10" pbc="F F F"\nH -10 -20 -30\nH 10 20 30\n', 'finite.xyz');
    context.centerStructureInCell();
    const centered = context.parseXYZ(context.generateXYZ());
    assert.deepEqual([centered.atoms[0].position.x, centered.atoms[0].position.y, centered.atoms[0].position.z], [-5, -15, -25]);
    assert.deepEqual([centered.atoms[1].position.x, centered.atoms[1].position.y, centered.atoms[1].position.z], [15, 25, 35]);
    assert.equal(context.applyPeriodicShiftByFractional(1, 0, 0).changedCount, 2);
    const moved = context.parseXYZ(context.generateXYZ());
    assert.equal(moved.atoms[1].position.x, 25);
    assert.deepEqual(Array.from(moved.pbc), [false, false, false]);
});

test('constraint controls reject invalid thresholds and skip unchanged atoms', () => {
    const context = app();
    context.structure = { lattice: [[2, 0, 0], [0, 2, 0], [0, 0, 2]], atoms: [
        { element: 'H', position: new Vector3(0, 0, 0), selectiveDynamics: [true, true, true] },
        { element: 'H', position: new Vector3(0, 0, 1), selectiveDynamics: [true, true, true] }
    ] };
    vm.runInContext(`
        currentStructure = structure;
        renderStructure = () => {};
        updateUI = () => {};
        updateEditUI = () => {};
        updateUI_forCurrentMode = () => {};
        updateSupercellButtonState = () => {};
    `, context);
    const input = context.document.getElementById('fixZThreshold');
    input.value = '0.5oops';
    context.fixAtomsByZThreshold();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
    assert.deepEqual(context.structure.atoms[0].selectiveDynamics, [true, true, true]);
    assert.match(context.document.getElementById('statusText').textContent, /finite z threshold/);

    input.value = '0.5';
    context.fixAtomsByZThreshold();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    assert.deepEqual(Array.from(context.structure.atoms[0].selectiveDynamics), [false, false, false]);
    assert.deepEqual(context.structure.atoms[1].selectiveDynamics, [true, true, true]);
    context.fixAtomsByZThreshold();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    context.performUndo();
    assert.deepEqual(Array.from(context.structure.atoms[0].selectiveDynamics), [true, true, true]);
    context.performRedo();
    assert.deepEqual(Array.from(vm.runInContext('currentStructure.atoms[0].selectiveDynamics', context)), [false, false, false]);

    vm.runInContext('selectedAtoms = [{ index: 0, isGhost: false }]', context);
    context.setSelectedAtomsFixed(true);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 1);
    context.unfixAllAtoms();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 2);
    context.unfixAllAtoms();
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 2);
});

test('XYZ and trajectory constraint calls leave atoms, history, and dirty state unchanged', () => {
    for (const flags of [{ isXYZ: true, hasExplicitLattice: false }, { isXYZ: true, hasExplicitLattice: true }, { isXDATCAR: true }]) {
        const context = app();
        context.structure = { ...flags, atoms: [{ element: 'H', position: new Vector3(0, 0, 0), selectiveDynamics: [true, true, true] }] };
        vm.runInContext(`
            currentStructure = structure;
            selectedAtoms = [{ index: 0, isGhost: false }];
            editHistory.redoStack = [{ operation: { type: 'select_atom' } }];
            renderStructure = () => { throw new Error('Unsupported constraint edit rendered'); };
        `, context);
        context.document.getElementById('fixZThreshold').value = '1';
        context.setSelectedAtomsFixed(true);
        context.fixAtomsByZThreshold();
        assert.equal(context.applySelectiveDynamicsChanges([{ index: 0, oldSD: [true, true, true], newSD: [false, false, false] }]), 0);
        context.unfixAllAtoms();
        assert.deepEqual(context.structure.atoms[0].selectiveDynamics, [true, true, true]);
        assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
        assert.equal(vm.runInContext('editHistory.redoStack.length', context), 1);
        assert.equal(context.hasUnsavedEdits(), false);
        assert.equal(context.getSelectiveDynamicsStats(), '');
    }
});

test('only POSCAR edit panels offer constraints while XYZ keeps coordinate editing', () => {
    for (const isXYZ of [false, true]) {
        const context = app();
        context.structure = isXYZ
            ? context.parseXYZ(example('examples/xyz/Si_diamond_extended.xyz'))
            : context.parsePOSCAR(example('examples/poscar/Si_diamond.poscar'));
        const originalGetElement = context.document.getElementById;
        context.document.getElementById = id => {
            const element = originalGetElement(id);
            element.addEventListener = () => {};
            return element;
        };
        context.document.querySelectorAll = () => [];
        vm.runInContext(`
            currentStructure = structure;
            selectedAtoms = [{ index: 0, element: structure.atoms[0].element, position: structure.atoms[0].position }];
            updateEditUI();
        `, context);
        const html = context.document.getElementById('measurementPanel').innerHTML;
        assert.equal(html.includes('id="fixSelectedBtn"'), !isXYZ);
        assert.equal(html.includes('id="fixByZBtn"'), !isXYZ);
        assert.equal(html.includes('class="sel-status"'), !isXYZ);
        assert.ok(html.includes('id="saveAtomCoordinates"'));
        assert.ok(html.includes('id="applyShiftBtn"'));
    }
});

test('POSCAR constraint edits survive export and undo restores the original flags', () => {
    const context = loadingApp();
    vm.runInContext('updateEditUI = () => {}', context);
    context.loadStructureFromText(example('examples/poscar/Si_diamond.poscar'), 'Si_diamond.poscar');
    vm.runInContext('selectedAtoms = [{ index: 0, isGhost: false }]', context);
    context.setSelectedAtomsFixed(true);
    const exported = context.generatePOSCAR();
    assert.match(exported, /Selective Dynamics/);
    assert.deepEqual(Array.from(context.parsePOSCAR(exported).atoms[0].selectiveDynamics), [false, false, false]);
    context.performUndo();
    assert.deepEqual(Array.from(vm.runInContext('currentStructure.atoms[0].selectiveDynamics', context)), [true, true, true]);
    assert.equal(context.hasUnsavedEdits(), false);
});

test('panel refresh retains keyboard focus, falls back for removed controls, and leaves outside focus alone', () => {
    const context = app();
    let pendingFocus;
    context.requestAnimationFrame = callback => { pendingFocus = callback; };
    context.document.body = {};
    const oldControl = { id: 'editAtomCoordMode' };
    const outsideControl = { id: 'exportPoscar' };
    const replacement = context.document.getElementById(oldControl.id);
    const fallback = context.document.getElementById('atomJumpInput');
    const panel = { contains: control => control === oldControl };
    context.document.activeElement = oldControl;
    context.replacePanelHTML(panel, '<select id="editAtomCoordMode"></select>', 'atomJumpInput');
    assert.equal(context.document.activeElement, replacement);
    context.document.activeElement = context.document.body;
    pendingFocus();
    assert.equal(context.document.activeElement, replacement);
    context.document.activeElement = outsideControl;
    pendingFocus();
    assert.equal(context.document.activeElement, outsideControl);

    const getElement = context.document.getElementById;
    context.document.getElementById = id => id === oldControl.id ? null : getElement(id);
    context.document.activeElement = oldControl;
    context.replacePanelHTML(panel, '<p>No atoms selected</p>', 'atomJumpInput');
    assert.equal(context.document.activeElement, fallback);

    context.document.activeElement = outsideControl;
    context.replacePanelHTML(panel, '<p>No atoms selected</p>', 'atomJumpInput');
    assert.equal(context.document.activeElement, outsideControl);
});

test('default constraint threshold handles large structures without overflowing the call stack', () => {
    const context = app();
    context.structure = { atoms: Array.from({ length: 200000 }, (_, index) => ({ position: { z: index === 0 ? -2 : 10 } })) };
    vm.runInContext('currentStructure = structure', context);
    assert.equal(context.getDefaultZThreshold(), '4.00');
});

test('sidebar counts constraints in one pass while preserving totals and element badges', () => {
    const context = app();
    let elementReads = 0;
    let flagReads = 0;
    const flags = [[false, false, false], [false, true, true], [true, true, true]];
    context.structure = {
        comment: 'mixed cell', lattice: [[2, 0, 0], [0, 2, 0], [0, 0, 2]],
        elements: Array.from({ length: 50 }, (_, index) => `Element${index}`),
        counts: Array(50).fill(200),
        atoms: Array.from({ length: 10000 }, (_, index) => ({
            get element() { elementReads++; return `Element${index % 50}`; },
            get selectiveDynamics() { flagReads++; return flags[index % 3]; }
        }))
    };
    context.updateUI(context.structure);
    assert.match(context.document.getElementById('structureInfo').innerHTML, /3334 fixed \/ 3333 partial \/ 3333 free/);
    const html = context.document.getElementById('atomList').innerHTML;
    assert.ok(html.includes('Element0'));
    assert.ok(html.includes('67 fully fixed'));
    assert.ok(html.includes('200 atoms'));
    assert.equal(flagReads, 10000);
    assert.ok(elementReads <= 20000, `Expected linear atom visits, got ${elementReads}`);
});

test('multi-atom shift validates every result before changing any atom', () => {
    const context = app();
    context.structure = { isXYZ: true, hasExplicitLattice: false, atoms: [
        { element: 'H', position: new Vector3(0, 0, 0) },
        { element: 'H', position: new Vector3(1e308, 0, 0) }
    ] };
    vm.runInContext('currentStructure = structure', context);
    assert.equal(context.applyPeriodicShiftByCartesian(1e308, 0, 0), false);
    assert.equal(context.structure.atoms[0].position.x, 0);
    assert.equal(context.structure.atoms[1].position.x, 1e308);
    assert.equal(vm.runInContext('editHistory.undoStack.length', context), 0);
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

test('XYZ boundary bonds do not cross a nonperiodic face', () => {
    for (const axis of [0, 2]) {
        const context = app();
        const positions = [0.2, 9.2].map(value => {
            const point = [5, 5, 5]; point[axis] = value;
            return new Vector3(...point);
        });
        context.positions = positions;
        vm.runInContext(`
            currentStructure = { lattice: [[10, 0, 0], [0, 10, 0], [0, 0, 10]], pbc: [true, false, false], atoms: [] };
            settings.useElementRadii = false;
            settings.bondThreshold = 1.5;
            atomMeshes = positions.map(position => ({ position, userData: { element: 'H' } }));
            structureGroup = { children: [], add(child) { this.children.push(child); } };
            createGhostBond = () => ({ userData: { isGhostBond: true } });
            addBondsFromAtomMeshes();
        `, context);
        const count = vm.runInContext('structureGroup.children.length', context);
        assert.equal(count, axis === 0 ? 2 : 0);
    }
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
