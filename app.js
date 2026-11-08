// === Crystal Visualizer ===
// A VESTA-like crystal structure visualizer

// Element data: VESTA's default element colours (from VESTA 3's elements.ini,
// so structures look as they do in VESTA) and covalent radii for ball size.
// Cm has no VESTA entry and keeps its CPK colour.
const ELEMENT_DATA = {
    H:  { color: 0xffcccc, radius: 0.31, name: 'Hydrogen' },
    He: { color: 0xfce9cf, radius: 0.28, name: 'Helium' },
    Li: { color: 0x86e074, radius: 1.28, name: 'Lithium' },
    Be: { color: 0x5fd87b, radius: 0.96, name: 'Beryllium' },
    B:  { color: 0x20a20f, radius: 0.84, name: 'Boron' },
    C:  { color: 0x814929, radius: 0.76, name: 'Carbon' },
    N:  { color: 0xb0bae6, radius: 0.71, name: 'Nitrogen' },
    O:  { color: 0xff0300, radius: 0.66, name: 'Oxygen' },
    F:  { color: 0xb0bae6, radius: 0.57, name: 'Fluorine' },
    Ne: { color: 0xff38b5, radius: 0.58, name: 'Neon' },
    Na: { color: 0xfadd3d, radius: 1.66, name: 'Sodium' },
    Mg: { color: 0xfc7c16, radius: 1.41, name: 'Magnesium' },
    Al: { color: 0x81b3d6, radius: 1.21, name: 'Aluminum' },
    Si: { color: 0x1b3bfa, radius: 1.11, name: 'Silicon' },
    P:  { color: 0xc19cc3, radius: 1.07, name: 'Phosphorus' },
    S:  { color: 0xfffa00, radius: 1.05, name: 'Sulfur' },
    Cl: { color: 0x32fc03, radius: 1.02, name: 'Chlorine' },
    Ar: { color: 0xcffec5, radius: 1.06, name: 'Argon' },
    K:  { color: 0xa122f7, radius: 2.03, name: 'Potassium' },
    Ca: { color: 0x5b96be, radius: 1.76, name: 'Calcium' },
    Sc: { color: 0xb663ac, radius: 1.70, name: 'Scandium' },
    Ti: { color: 0x78caff, radius: 1.60, name: 'Titanium' },
    V:  { color: 0xe61a00, radius: 1.53, name: 'Vanadium' },
    Cr: { color: 0x00009e, radius: 1.39, name: 'Chromium' },
    Mn: { color: 0xa9099e, radius: 1.39, name: 'Manganese' },
    Fe: { color: 0xb57200, radius: 1.32, name: 'Iron' },
    Co: { color: 0x0000af, radius: 1.26, name: 'Cobalt' },
    Ni: { color: 0xb8bcbe, radius: 1.24, name: 'Nickel' },
    Cu: { color: 0x2247dd, radius: 1.32, name: 'Copper' },
    Zn: { color: 0x8f9082, radius: 1.22, name: 'Zinc' },
    Ga: { color: 0x9fe474, radius: 1.22, name: 'Gallium' },
    Ge: { color: 0x7e6fa6, radius: 1.20, name: 'Germanium' },
    As: { color: 0x75d057, radius: 1.19, name: 'Arsenic' },
    Se: { color: 0x9aef10, radius: 1.20, name: 'Selenium' },
    Br: { color: 0x7f3103, radius: 1.20, name: 'Bromine' },
    Kr: { color: 0xfac1f3, radius: 1.16, name: 'Krypton' },
    Rb: { color: 0xff0099, radius: 2.20, name: 'Rubidium' },
    Sr: { color: 0x00ff27, radius: 1.95, name: 'Strontium' },
    Y:  { color: 0x67988e, radius: 1.90, name: 'Yttrium' },
    Zr: { color: 0x00ff00, radius: 1.75, name: 'Zirconium' },
    Nb: { color: 0x4cb376, radius: 1.64, name: 'Niobium' },
    Mo: { color: 0xb486b0, radius: 1.54, name: 'Molybdenum' },
    Tc: { color: 0xcdafcb, radius: 1.47, name: 'Technetium' },
    Ru: { color: 0xcfb8ae, radius: 1.46, name: 'Ruthenium' },
    Rh: { color: 0xced2ab, radius: 1.42, name: 'Rhodium' },
    Pd: { color: 0xc2c4b9, radius: 1.39, name: 'Palladium' },
    Ag: { color: 0xb8bcbe, radius: 1.45, name: 'Silver' },
    Cd: { color: 0xf31fdc, radius: 1.44, name: 'Cadmium' },
    In: { color: 0xd781bb, radius: 1.42, name: 'Indium' },
    Sn: { color: 0x9b8fba, radius: 1.39, name: 'Tin' },
    Sb: { color: 0xd88350, radius: 1.39, name: 'Antimony' },
    Te: { color: 0xada252, radius: 1.38, name: 'Tellurium' },
    I:  { color: 0x8f1f8b, radius: 1.39, name: 'Iodine' },
    Xe: { color: 0x9ba1f8, radius: 1.40, name: 'Xenon' },
    Cs: { color: 0x0fffb9, radius: 2.44, name: 'Cesium' },
    Ba: { color: 0x1ef02d, radius: 2.15, name: 'Barium' },
    La: { color: 0x5ac449, radius: 2.07, name: 'Lanthanum' },
    Ce: { color: 0xd1fd06, radius: 2.04, name: 'Cerium' },
    Pr: { color: 0xfde206, radius: 2.03, name: 'Praseodymium' },
    Nd: { color: 0xfc8e07, radius: 2.01, name: 'Neodymium' },
    Pm: { color: 0x0000f5, radius: 1.99, name: 'Promethium' },
    Sm: { color: 0xfd067d, radius: 1.98, name: 'Samarium' },
    Eu: { color: 0xfb08d5, radius: 1.98, name: 'Europium' },
    Gd: { color: 0xc004ff, radius: 1.96, name: 'Gadolinium' },
    Tb: { color: 0x7104fe, radius: 1.94, name: 'Terbium' },
    Dy: { color: 0x3106fd, radius: 1.92, name: 'Dysprosium' },
    Ho: { color: 0x0742fb, radius: 1.92, name: 'Holmium' },
    Er: { color: 0x49733b, radius: 1.89, name: 'Erbium' },
    Tm: { color: 0x0000e0, radius: 1.90, name: 'Thulium' },
    Yb: { color: 0x27fdf4, radius: 1.87, name: 'Ytterbium' },
    Lu: { color: 0x26fdb5, radius: 1.87, name: 'Lutetium' },
    Hf: { color: 0xb4b459, radius: 1.75, name: 'Hafnium' },
    Ta: { color: 0xb79b56, radius: 1.70, name: 'Tantalum' },
    W:  { color: 0x8e8a80, radius: 1.62, name: 'Tungsten' },
    Re: { color: 0xb3b18e, radius: 1.51, name: 'Rhenium' },
    Os: { color: 0xc9b179, radius: 1.44, name: 'Osmium' },
    Ir: { color: 0xc9cf73, radius: 1.41, name: 'Iridium' },
    Pt: { color: 0xccc6bf, radius: 1.36, name: 'Platinum' },
    Au: { color: 0xfeb338, radius: 1.36, name: 'Gold' },
    Hg: { color: 0xd3b8cc, radius: 1.32, name: 'Mercury' },
    Tl: { color: 0x96896d, radius: 1.45, name: 'Thallium' },
    Pb: { color: 0x53535b, radius: 1.46, name: 'Lead' },
    Bi: { color: 0xd230f8, radius: 1.48, name: 'Bismuth' },
    Po: { color: 0x0000ff, radius: 1.40, name: 'Polonium' },
    At: { color: 0x0000ff, radius: 1.50, name: 'Astatine' },
    Rn: { color: 0xffff00, radius: 1.50, name: 'Radon' },
    Fr: { color: 0x000000, radius: 2.60, name: 'Francium' },
    Ra: { color: 0x6eaa59, radius: 2.21, name: 'Radium' },
    Ac: { color: 0x649e73, radius: 2.15, name: 'Actinium' },
    Th: { color: 0x26fe78, radius: 2.06, name: 'Thorium' },
    Pa: { color: 0x29fb35, radius: 2.00, name: 'Protactinium' },
    U:  { color: 0x7aa2aa, radius: 1.96, name: 'Uranium' },
    Np: { color: 0x4c4c4c, radius: 1.90, name: 'Neptunium' },
    Pu: { color: 0x4c4c4c, radius: 1.87, name: 'Plutonium' },
    Am: { color: 0x4c4c4c, radius: 1.80, name: 'Americium' },
    Cm: { color: 0x785ce3, radius: 1.69, name: 'Curium' },
    DEFAULT: { color: 0x4d4d4d, radius: 1.50, name: 'Unknown' } // VESTA's grey for an element outside the table
};
Object.setPrototypeOf(ELEMENT_DATA, null);

// Global state
let scene, camera, renderer, controls;
let cameraMath, cameraController;
let cameraInputKind = 'rotate';
let cameraInputPosition = null;
let cameraManualInputPending = false;
let manualCameraTickAt = 0;
let perspectiveCamera, orthographicCamera;
let isPerspective = false; // Default to orthographic
let structureGroup, measurementGroup;
let currentStructure = null;
let currentFilename = null;
let currentSourceText = null;
let latestLoadRequest = 0;
let lastJumpAtomNumber = null;

// Axes HUD (separate scene rendered in corner)
let axesScene, axesCamera, axesGroup;
// Display options a visitor keeps between visits. The store remembers only
// the differences from these defaults, in this browser.
const DEFAULT_PREFERENCES = Object.freeze({
    atomScale: 0.8,
    bondThreshold: 2.5, // one cutoff for every pair; 0 draws no bonds
    showLabels: false,
    showAxes: true,
    showCell: true,
    showFixedIndicators: true, // Show visual indicators for fixed atoms
    background: '#0a0a0f', // Viewport colour behind the structure
    colors: {} // Per-element colour overrides, keyed by symbol
});
const preferenceStore = CrystalPreferences.createStore({
    key: 'crystal-visualizer-preferences',
    storage: availableStorage(),
    defaults: DEFAULT_PREFERENCES
});
let settings = {
    ...preferenceStore.load(),
    periodic: { a: 1, b: 1, c: 1 }, // Periodic images per structure; not remembered
    ghostOpacity: 0.4 // Periodic copies stay clearly fainter than the atoms they repeat
};

function availableStorage() {
    try {
        const storage = globalThis.localStorage;
        return storage && typeof storage.getItem === 'function' ? storage : null;
    } catch {
        return null; // Reading the property itself throws when site data is blocked.
    }
}

// Measurement state
let raycaster, mouse;
let selectedAtoms = []; // Array of { mesh, index, element, position }
let selectionRings = []; // Visual rings around selected atoms
let atomMeshes = []; // All atom meshes for raycasting
const sharedRenderResources = new Set();
const sharedAtomGeometries = new Map();
let sharedBondGeometry = null;
let sharedSolidBondMaterial = null;
let sharedGhostBondMaterial = null;
const sharedAtomMaterials = new Map();
let smallestAtomRadiusCache = null;
let displayedAtomCount = 0;
let renderPending = true;
let canvasClickGesture = null;
let viewportResizePending = false;
let lastRenderedAt = -Infinity;
let lastCameraMotionAt = -Infinity;

const DENSE_VIEW_ATOMS = 500;
const ATOM_PICKING_LAYER = 1;
const CELL_PICKING_LAYER = 2; // Raycasting only; neither structure camera renders this layer.

function requestRender() {
    renderPending = true;
}

function countDisplayedAtoms(structure) {
    if (!structure) return 0;
    const repeats = getPeriodicRepeats(structure);
    const copies = repeats.a * repeats.b * repeats.c;
    return structure.atoms.length * copies;
}

function atomSphereSegments() {
    return displayedAtomCount > DENSE_VIEW_ATOMS ? 12 : 24;
}

function configureRenderQuality(structure) {
    displayedAtomCount = countDisplayedAtoms(structure);
    const useShadows = displayedAtomCount <= DENSE_VIEW_ATOMS;
    if (renderer.shadowMap.enabled !== useShadows) {
        renderer.shadowMap.enabled = useShadows;
        renderer.shadowMap.needsUpdate = true;
    }
}

function getSharedAtomGeometry() {
    const segments = atomSphereSegments();
    if (!sharedAtomGeometries.has(segments)) {
        const geometry = new THREE.SphereGeometry(1, segments, segments);
        sharedAtomGeometries.set(segments, geometry);
        sharedRenderResources.add(geometry);
    }
    return sharedAtomGeometries.get(segments);
}

function getSharedBondGeometry() {
    if (!sharedBondGeometry) {
        sharedBondGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
        sharedRenderResources.add(sharedBondGeometry);
    }
    return sharedBondGeometry;
}

function getBondMaterial(isGhost) {
    if (isGhost) {
        if (!sharedGhostBondMaterial) {
            sharedGhostBondMaterial = new THREE.MeshBasicMaterial({
                color: 0x888899,
                transparent: true,
                opacity: settings.ghostOpacity * 0.6,
                depthWrite: false
            });
            sharedRenderResources.add(sharedGhostBondMaterial);
        }
        return sharedGhostBondMaterial;
    }
    if (!sharedSolidBondMaterial) {
        sharedSolidBondMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x888899,
            metalness: 0.3,
            roughness: 0.5
        });
        sharedRenderResources.add(sharedSolidBondMaterial);
    }
    return sharedSolidBondMaterial;
}

function getAtomMaterial(element, isGhost = false) {
    const key = `${element}:${isGhost ? 'ghost' : 'solid'}`;
    if (!sharedAtomMaterials.has(key)) {
        const material = new THREE.MeshPhysicalMaterial({
            color: elementColor(element),
            metalness: 0.1,
            roughness: 0.3,
            ...(isGhost ? { transparent: true, opacity: settings.ghostOpacity, depthWrite: false }
                : { clearcoat: 0.3, clearcoatRoughness: 0.2, envMapIntensity: 0.5 })
        });
        sharedAtomMaterials.set(key, material);
        sharedRenderResources.add(material);
    }
    return sharedAtomMaterials.get(key);
}

function updateAtomInstance(mesh) {
    const instance = mesh.userData.atomInstance;
    if (!instance) return;
    if (mesh.userData.atomHighlighted) {
        instance.batch.setMatrixAt(instance.index, new THREE.Matrix4().makeScale(0, 0, 0));
    } else {
        mesh.updateMatrix();
        instance.batch.setMatrixAt(instance.index, mesh.matrix);
    }
    instance.batch.instanceMatrix.needsUpdate = true;
}

function updateAtomInstances() {
    atomMeshes.forEach(updateAtomInstance);
}

function addInstancedAtoms() {
    if (displayedAtomCount <= DENSE_VIEW_ATOMS) return;
    const groups = new Map();
    atomMeshes.forEach(mesh => {
        const isGhost = Boolean(mesh.userData.isGhost);
        const key = `${mesh.userData.element}:${isGhost}`;
        if (!groups.has(key)) groups.set(key, { element: mesh.userData.element, isGhost, meshes: [] });
        groups.get(key).meshes.push(mesh);
    });
    groups.forEach(({ element, isGhost, meshes }) => {
        // A separate geometry lets disposal release this batch's instance buffer.
        const batch = new THREE.InstancedMesh(getSharedAtomGeometry().clone(), getAtomMaterial(element, isGhost), meshes.length);
        batch.frustumCulled = false;
        batch.userData.isAtomBatch = true;
        structureGroup.add(batch);
        meshes.forEach((mesh, index) => {
            mesh.userData.atomInstance = { batch, index };
            mesh.layers.set(ATOM_PICKING_LAYER);
            updateAtomInstance(mesh);
        });
    });
}

function setAtomGlow(mesh, color, intensity) {
    if (!mesh || !mesh.material) return;
    const base = getAtomMaterial(mesh.userData.element, Boolean(mesh.userData.isGhost));
    if (intensity > 0) {
        if (mesh.material === base) mesh.material = base.clone();
        mesh.material.emissive.setHex(color);
        mesh.material.emissiveIntensity = intensity;
    } else if (mesh.material !== base) {
        const oldMaterial = mesh.material;
        mesh.material = base;
        oldMaterial.dispose();
    }
    if (mesh.userData.atomInstance) {
        mesh.userData.atomHighlighted = intensity > 0;
        if (intensity > 0) mesh.layers.enable(0);
        else mesh.layers.disable(0);
        updateAtomInstance(mesh);
    }
    requestRender();
}

// Mode state: 'measure' or 'edit'
let currentMode = 'measure';
let lastSelectRange = null; // Remembered select-by-range inputs { axis, unit, min, max }
let coordinateEditSession = null; // { index, startPosition } while typed coordinates preview an atom
let coordinateEditTimer = null; // debounce for typed (not stepped) coordinate previews
let lastCoordinateStep = { fractional: '0.01', cartesian: '0.1' }; // arrow step of the coordinate fields
let boxSelectMode = false; // Box select is on: a left-drag on the canvas selects the atoms inside
let boxSelectDrag = null; // { pointerId, startX, startY, x, y } while a box is being drawn

// XDATCAR / Animation state
let animationState = {
    isPlaying: false,
    fps: 10,
    intervalId: null,
    loop: false // Default: stop at last frame
};

// ============================================
// Unified Undo System (Cmd+Z / Ctrl+Z)
// ============================================
// All reversible operations push to this stack
const editHistory = CrystalHistory.createHistory(50);

// Operation types:
// - 'move_atom': { index, oldPosition, newPosition }
// - 'delete_atoms': { deletedAtoms: [{ index, atom }] }
// - 'add_atom': { index } (the index of the added atom)
// - 'shift_atoms': { atomIndices, shiftVector, oldPositions }
// - 'fix_atoms': { changes: [{ index, oldSD, newSD }] }
// - 'make_supercell': { oldStructure } (deep copy)
// - 'vacuum_drag': { oldLattice, oldAtomPositions }
// - 'select_atom', 'deselect_atom', 'clear_selection': { selectionBefore }
//   selectionBefore: ordered identities, measurement purpose, and interaction mode

function pushUndo(operation) {
    editHistory.record(operation);
    updateUndoButton();
    updateDirtyIndicator();
}

function isSelectionOperation(operation) {
    return CrystalHistory.isSelectionOperation(operation);
}

function hasUnsavedEdits() {
    const pendingAtomMove = isDragging && draggedAtom && currentStructure?.atoms[draggedAtom.index]
        && currentStructure.atoms[draggedAtom.index].position.distanceTo(draggedAtom.startPosition) >= 1e-10;
    return editHistory.dirty || Boolean(pendingAtomMove) || hasVacuumDragChanges();
}

function updateDirtyIndicator() {
    const indicator = document.getElementById('unsavedIndicator');
    if (indicator) indicator.hidden = !hasUnsavedEdits();
    document.title = hasUnsavedEdits() ? '• Crystal Visualizer — unsaved edits' : 'Crystal Visualizer';
}

function updateUndoButton() {
    const button = document.getElementById('undoBtn');
    if (button) button.disabled = editHistory.undoStack.length === 0;
    const redoButton = document.getElementById('redoBtn');
    if (redoButton) redoButton.disabled = editHistory.redoStack.length === 0;
}

function snapshotStructure(structure) {
    return CrystalDocument.snapshot(structure);
}

function restoreStructure(snapshot) {
    const structure = snapshotStructure(snapshot);
    structure.atoms.forEach(atom => {
        atom.position = new THREE.Vector3(atom.position.x, atom.position.y, atom.position.z);
    });
    return structure;
}

// Selection history stores ordered identities and purpose, never cached positions.
function captureSelectionState() {
    return {
        selected: selectedAtoms.map(atom => ({
            index: atom.index,
            originalIndex: atom.originalIndex,
            isGhost: Boolean(atom.isGhost),
            cellOffset: atom.cellOffset ? { ...atom.cellOffset } : null,
            element: atom.element
        })),
        isMeasurementSelection,
        mode: currentMode
    };
}

function captureRedoState(operation) {
    return {
        structure: isSelectionOperation(operation) ? null : snapshotStructure(currentStructure),
        periodic: { ...settings.periodic },
        ...captureSelectionState()
    };
}

// Restore edit selections in their editing context rather than interpreting an
// arbitrary multi-selection as a measurement or silently discarding its atoms.
function restoreSelectionContext(state) {
    const mode = state.mode;
    setInteractionMode(mode, true);
    isMeasurementSelection = Boolean(state.selected.length && (state.isMeasurementSelection || mode === 'measure'));
}

function applySelectionState(state) {
    selectedAtoms.forEach(atom => unhighlightAtomMesh(atom.mesh));
    restoreSelectionContext(state);
    selectedAtoms = restoreSelectedAtoms(state.selected);
    if (!selectedAtoms.length) isMeasurementSelection = false;
    rebuildSelectionVisuals();
    updateUI_forCurrentMode();
    requestRender();
}

function restoreSelectedAtoms(savedSelections) {
    const seen = new Set();
    const restored = savedSelections.map(saved => {
        const mesh = saved.isGhost
            ? atomMeshes.find(candidate => saved.cellOffset && candidate.userData.isGhost
                && candidate.userData.originalIndex === saved.originalIndex
                && candidate.userData.cellOffset
                && candidate.userData.cellOffset.a === saved.cellOffset.a
                && candidate.userData.cellOffset.b === saved.cellOffset.b
                && candidate.userData.cellOffset.c === saved.cellOffset.c)
            : atomMeshes[saved.index];
        if (!mesh || (!saved.isGhost && mesh.userData.isGhost) || seen.has(mesh)) return null;
        seen.add(mesh);
        const position = new THREE.Vector3();
        mesh.getWorldPosition(position);
        return {
            mesh,
            index: saved.index,
            originalIndex: saved.originalIndex,
            element: saved.element,
            position,
            isGhost: Boolean(saved.isGhost),
            cellOffset: saved.cellOffset
        };
    }).filter(Boolean);
    return currentMode === 'measure' || isMeasurementSelection ? restored.slice(0, 3) : restored;
}

function performRedo() {
    if (draggedAtom || vacuumDragState.isDragging) {
        cancelEditDrag(null, 'Redo requested');
        return;
    }
    if (editHistory.redoStack.length === 0) {
        statusText.textContent = 'Nothing to redo';
        statusText.className = '';
        return;
    }
    const { operation, state } = editHistory.redoStack.pop();
    if (isSelectionOperation(operation)) {
        applySelectionState(state);
    } else {
        currentStructure = restoreStructure(state.structure);
        settings.periodic = { ...state.periodic };
        ['a', 'b', 'c'].forEach(axis => {
            const upper = axis.toUpperCase();
            document.getElementById(`periodic${upper}`).value = settings.periodic[axis];
            document.getElementById(`periodic${upper}Display`).textContent = settings.periodic[axis];
        });
        restoreSelectionContext(state);
        selectedAtoms = state.selected;
        renderStructure(currentStructure, true);
        updateUI(currentStructure);
        updateUI_forCurrentMode();
        updateSupercellButtonState();
    }
    editHistory.completeRedo(operation);
    updateUndoButton();
    updateDirtyIndicator();
    statusText.textContent = 'Redid last action';
    statusText.className = 'success';
}

function performUndo() {
    if (draggedAtom || vacuumDragState.isDragging) {
        cancelEditDrag(null, 'Undo requested');
        return;
    }
    if (editHistory.undoStack.length === 0) {
        statusText.textContent = 'Nothing to undo';
        statusText.className = '';
        return;
    }
    
    const op = editHistory.undoStack.pop();
    const redoState = captureRedoState(op);
    
    switch (op.type) {
        case 'move_atom':
            undoMoveAtom(op);
            break;
        case 'delete_atoms':
            undoDeleteAtoms(op);
            break;
        case 'add_atom':
            undoAddAtom(op);
            break;
        case 'shift_atoms':
            undoShiftAtoms(op);
            break;
        case 'fix_atoms':
            undoFixAtoms(op);
            break;
        case 'make_supercell':
            undoMakeSupercell(op);
            break;
        case 'vacuum_drag':
            undoVacuumDrag(op);
            break;
        case 'select_atom':
            applySelectionState(op.selectionBefore);
            statusText.textContent = 'Undid atom selection';
            statusText.className = '';
            break;
        case 'deselect_atom':
            applySelectionState(op.selectionBefore);
            statusText.textContent = 'Restored atom selection';
            statusText.className = '';
            break;
        case 'clear_selection':
            applySelectionState(op.selectionBefore);
            statusText.textContent = 'Restored atom selection';
            statusText.className = '';
            break;
        default:
            console.warn('Unknown undo operation type:', op.type);
    }
    editHistory.completeUndo(op, redoState);
    updateUndoButton();
    updateDirtyIndicator();
}

// --- Undo handlers for each operation type ---

function undoMoveAtom(op) {
    currentStructure.atoms[op.index].position.copy(op.oldPosition);
    currentStructure.atoms[op.index].fractional = hasLattice(currentStructure)
        ? cartesianToFractional(op.oldPosition, currentStructure.lattice) : null;
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    statusText.textContent = `Undid move of atom #${op.index + 1}`;
    statusText.className = 'success';
}

function undoDeleteAtoms(op) {
    // Restore atoms in order (sorted by index ascending)
    op.deletedAtoms.sort((a, b) => a.index - b.index).forEach(item => {
        currentStructure.atoms.splice(item.index, 0, {
            ...item.atom,
            element: item.atom.element,
            position: new THREE.Vector3(
                item.atom.position.x,
                item.atom.position.y,
                item.atom.position.z
            ),
            fractional: item.atom.fractional,
            selectiveDynamics: item.atom.selectiveDynamics || [true, true, true]
        });
    });
    recalculateElementCounts();
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    statusText.textContent = `Restored ${op.deletedAtoms.length} atom(s)`;
    statusText.className = 'success';
}

function undoAddAtom(op) {
    // Remove the added atom
    currentStructure.atoms.splice(op.index, 1);
    if (op.newGroupId) currentStructure.speciesGroups = currentStructure.speciesGroups.filter(group => group.id !== op.newGroupId);
    recalculateElementCounts();
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    statusText.textContent = `Undid add atom #${op.index + 1}`;
    statusText.className = 'success';
}

function undoShiftAtoms(op) {
    // Restore old positions
    op.atomIndices.forEach((atomIdx, i) => {
        if (currentStructure.atoms[atomIdx]) {
            const atom = currentStructure.atoms[atomIdx];
            atom.position.copy(op.oldPositions[i]);
            atom.fractional = hasLattice(currentStructure)
                ? cartesianToFractional(atom.position, currentStructure.lattice) : null;
        }
    });
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    const count = op.atomIndices.length;
    statusText.textContent = `Undid shift of ${count} atom${count > 1 ? 's' : ''}`;
    statusText.className = 'success';
}

function undoFixAtoms(op) {
    // Restore old selective dynamics
    op.changes.forEach(change => {
        if (currentStructure.atoms[change.index]) {
            currentStructure.atoms[change.index].selectiveDynamics = [...change.oldSD];
        }
    });
    // Check if any atoms still have selective dynamics
    currentStructure.hasSelectiveDynamics = currentStructure.atoms.some(
        atom => atom.selectiveDynamics && atom.selectiveDynamics.some(v => v === false)
    );
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    statusText.textContent = `Undid fix/unfix of ${op.changes.length} atom(s)`;
    statusText.className = 'success';
}

function undoMakeSupercell(op) {
    // Restore the old structure completely
    currentStructure = restoreStructure(op.oldStructure);
    // Restore periodic settings
    settings.periodic = { ...op.oldPeriodic };
    document.getElementById('periodicA').value = settings.periodic.a;
    document.getElementById('periodicB').value = settings.periodic.b;
    document.getElementById('periodicC').value = settings.periodic.c;
    document.getElementById('periodicADisplay').textContent = settings.periodic.a;
    document.getElementById('periodicBDisplay').textContent = settings.periodic.b;
    document.getElementById('periodicCDisplay').textContent = settings.periodic.c;
    if (op.selectionBefore) {
        restoreSelectionContext(op.selectionBefore);
        selectedAtoms = op.selectionBefore.selected;
    }
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    updateSupercellButtonState();
    statusText.textContent = 'Undid supercell conversion';
    statusText.className = 'success';
}

function undoVacuumDrag(op) {
    // Restore lattice and atom positions
    currentStructure.lattice = op.oldLattice.map(v => [...v]);
    op.oldAtomPositions.forEach((pos, i) => {
        if (currentStructure.atoms[i]) {
            currentStructure.atoms[i].position = new THREE.Vector3(pos.x, pos.y, pos.z);
            currentStructure.atoms[i].fractional = cartesianToFractional(currentStructure.atoms[i].position, currentStructure.lattice);
        }
    });
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    statusText.textContent = 'Undid cell resize';
    statusText.className = 'success';
}

// Setup keyboard listeners for undo and redo.
function setupUndoKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
        // Leave text editing to the browser (including contenteditable fields).
        const target = e.target;
        if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
        if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
            e.preventDefault();
            performUndo();
        } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
            e.preventDefault();
            performRedo();
        }
    });
}

// Remember Add Atom form values
let lastAddAtomElement = null;
let lastAddAtomSpecies = null;
let lastAddAtomCoords = { x: 0, y: 0, z: 0 };
let lastAddAtomCoordType = 'fractional'; // Default to fractional

// Remember Global Shift form values
let lastShiftCoords = { a: 0, b: 0, c: 0 };
let lastShiftCoordType = 'fractional'; // Default to fractional for shifts

// Selected atom coordinate display mode ('fractional' or 'cartesian')
let selectedAtomCoordMode = 'fractional'; // Default to fractional

// Track if current selection is a preserved measurement (from Measure mode)
let isMeasurementSelection = false;

// Drag state for moving atoms
let isDragging = false;
let wasDragging = false; // Flag to prevent click after drag
let draggedAtom = null; // { mesh, index, startPosition }
let activeEditPointerId = null;
let lastEditPointerEvent = null;
let dragStartMouse = new THREE.Vector2();
let dragPlane = new THREE.Plane();
let dragOffset = new THREE.Vector3();
let pointerDownTime = 0; // Track click duration
let dragGuidePlane = null; // Visual guide plane during drag

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const viewport = document.getElementById('viewport');
const statusText = document.getElementById('statusText');
const structureInfo = document.getElementById('structureInfo');
const atomList = document.getElementById('atomList');

// Initialize Three.js scene
function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.background);
    
    // Cameras
    const aspect = viewport.clientWidth / viewport.clientHeight;
    const frustumSize = 15;
    
    // Perspective camera (fisheye)
    perspectiveCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    perspectiveCamera.position.set(10, 8, 10);
    
    // Orthographic camera (default - no distortion)
    orthographicCamera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    orthographicCamera.position.set(10, 8, 10);
    orthographicCamera.zoom = 1;
    
    // Default to orthographic
    camera = orthographicCamera;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute('aria-label', '3D structure view; use Find atom by number to select atoms with the keyboard');
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.appendChild(renderer.domElement);
    
    initCameraController();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 20, 10);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0x00f5d4, 0.3);
    directionalLight2.position.set(-10, -5, -10);
    scene.add(directionalLight2);
    
    // Structure group
    structureGroup = new THREE.Group();
    scene.add(structureGroup);
    
    // Measurement group (for selection rings, lines, arcs)
    measurementGroup = new THREE.Group();
    measurementGroup.name = 'measurements';
    scene.add(measurementGroup);
    
    // Raycaster for atom selection
    raycaster = new THREE.Raycaster();
    raycaster.layers.enable(ATOM_PICKING_LAYER);
    raycaster.layers.enable(CELL_PICKING_LAYER);
    mouse = new THREE.Vector2();
    
    // Initialize axes HUD
    initAxesHUD();
    
    // Animation loop
    requestAnimationFrame(animate);
    
    // Handle resize
    window.addEventListener('resize', onWindowResize);
    CrystalLayout.initSidebar(onWindowResize);
    // Header/footer content and fonts can resize the view without a window
    // event. Follow the actual viewport, not only the gestures that affect it.
    const viewportResizeObserver = new ResizeObserver(onWindowResize);
    viewportResizeObserver.observe(viewport);
    
    // Handle mouse events for atom selection and dragging
    // Use capture phase to ensure we handle events before OrbitControls/TrackballControls
    renderer.domElement.addEventListener('pointerdown', onMouseDown, { capture: true });
    renderer.domElement.addEventListener('pointermove', event => {
        if (activeEditPointerId === null) onMouseMove(event);
    });
    // Capture is a routing aid, not ownership of the edit. Track the owned
    // pointer across the document even if the browser releases canvas capture.
    document.addEventListener('pointermove', trackEditPointer, { capture: true });
    // A browser emits click after pointerup even when TrackballControls has
    // rotated the view. Classify the entire pointer path, independently of
    // geometry editing and camera damping, before routing that click.
    document.addEventListener('pointermove', trackCanvasClickGesture, { capture: true });
    document.addEventListener('pointerup', trackCanvasClickGesture, { capture: true });
    document.addEventListener('pointercancel', trackCanvasClickGesture, { capture: true });
    document.addEventListener('pointerup', finishEditPointer, { capture: true });
    document.addEventListener('lostpointercapture', event => {
        // Some hosts drop pointerup before reporting capture loss on release.
        // Released mouse buttons finish the preview; held buttons keep tracking.
        if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) trackEditPointer(event);
    }, { capture: true });
    document.addEventListener('pointercancel', event => {
        if (activeEditPointerId !== null) cancelEditDrag(event);
    }, { capture: true });
    renderer.domElement.addEventListener('click', onClickFallback);
    document.addEventListener('pointerdown', event => {
        const sidebar = document.getElementById('sidebar');
        lastPanelPointerTarget = event.target instanceof Element && sidebar?.contains(event.target)
            ? event.target.closest('button, input, select, label, a') : null;
    }, { capture: true });
    window.addEventListener('blur', cancelEditDrag);
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (draggedAtom || vacuumDragState.isDragging || boxSelectDrag) {
            event.preventDefault();
            cancelEditDrag(event);
            return;
        }
        // With nothing in progress, Escape clears the edit selection. Fields
        // and dialogs handle their own Escape.
        const target = event.target;
        const typing = target instanceof Element && (target.matches('input, select, textarea') || target.isContentEditable || target.closest('#resetConfirm'));
        if (typing || currentMode !== 'edit' || !selectedAtoms.length || !dropZone.classList.contains('hidden')) return;
        clearSelection();
        updateEditUI();
        statusText.textContent = 'Selection cleared';
        statusText.className = '';
    });
}

function animate(timestamp) {
    requestAnimationFrame(animate);
    updateCamera(timestamp);
    if (!currentStructure && !renderPending) return;

    const active = animationState.isPlaying || isDragging || vacuumDragState.isDragging || cameraController?.transitioning
        || timestamp - lastCameraMotionAt < 250;
    const dense = displayedAtomCount > DENSE_VIEW_ATOMS;
    const interval = 1000 / (active ? (dense ? 30 : 60) : 5);
    if (!renderPending && timestamp - lastRenderedAt < interval) return;
    if (dense && timestamp - lastRenderedAt < 1000 / 30) return;
    lastRenderedAt = timestamp;
    renderPending = false;
    // Resizing clears the drawing buffer. Do it inside the render transaction,
    // never in a layout observer after the completed frame has been drawn.
    if (viewportResizePending) {
        viewportResizePending = false;
        resizeViewportForFrame();
    }
    
    drawFrame();
}

// One frame of the view: billboards, overlay sizes, clipping, the scene and
// the axes inset. The animation loop draws it to the screen; image export
// draws the same frame at a larger pixel size.
function drawFrame() {
    // Make selection rings face the camera
    if (measurementGroup) {
        measurementGroup.children.forEach(child => {
            if (child.userData.isBillboard) {
                child.lookAt(camera.position);
            }
        });
    }
    
    updateAnnotationSizes();
    updateAtomLabelPositions();

    // Manual controls, inertia and edit previews can change depth without
    // applying a controller pose. Refresh clipping for the frame we draw.
    updateCameraClipping();
    // Render main scene
    renderer.render(scene, camera);
    
    // Render axes HUD in bottom-left corner
    if (settings.showAxes && hasLattice(currentStructure) && axesScene && axesCamera && axesGroup) {
        // Sync axes rotation with main camera
        axesGroup.quaternion.copy(camera.quaternion).invert();
        
        // Set viewport for axes (bottom-left corner, 100x100 CSS pixels; the
        // renderer applies its pixel ratio, so an export keeps the proportion)
        const axesSize = 100;
        renderer.setViewport(10, 10, axesSize, axesSize);
        renderer.setScissor(10, 10, axesSize, axesSize);
        renderer.setScissorTest(true);
        
        // Overlay the axes on the existing color buffer. A second automatic
        // clear would erase this square and expose the CSS background beneath.
        const autoClear = renderer.autoClear;
        renderer.autoClear = false;
        try {
            renderer.clearDepth();
            renderer.render(axesScene, axesCamera);
        } finally {
            renderer.autoClear = autoClear;
            renderer.setScissorTest(false);
            renderer.setViewport(0, 0, viewport.clientWidth, viewport.clientHeight);
        }
    }
}

function onWindowResize() {
    viewportResizePending = true;
    requestRender();
}

function resizeViewportForFrame() {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    const aspect = viewport.clientWidth / viewport.clientHeight;
    const size = renderer.getSize(new THREE.Vector2());
    if (size.x === viewport.clientWidth && size.y === viewport.clientHeight
        && aspect === perspectiveCamera.aspect) return;
    const frustumSize = 15;
    let framing = null;
    if (currentStructure && cameraMath && cameraController && aspect !== perspectiveCamera.aspect) {
        const bounds = getFitBounds();
        const pose = getCameraPose();
        const fov = isPerspective ? perspectiveCamera.fov : null;
        const before = cameraMath.fit(bounds, pose.quaternion, perspectiveCamera.aspect,
            orthographicCamera.top - orthographicCamera.bottom, fov);
        const after = cameraMath.fit(bounds, pose.quaternion, aspect, frustumSize, fov);
        // Preserve the user's magnification relative to a fitted view. Layout
        // changes must not reset orientation, pan, or the document's history.
        framing = { zoom: after.zoom / before.zoom, distance: after.distance / before.distance };
    }
    
    // Update perspective camera
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();
    
    // Update orthographic camera
    orthographicCamera.left = frustumSize * aspect / -2;
    orthographicCamera.right = frustumSize * aspect / 2;
    orthographicCamera.top = frustumSize / 2;
    orthographicCamera.bottom = frustumSize / -2;
    orthographicCamera.updateProjectionMatrix();
    if (framing) cameraController.resizeView(framing);
    
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    controls.handleResize();
    requestRender();
}

// Initialize axes HUD (separate scene rendered in corner)
function initAxesHUD() {
    axesScene = new THREE.Scene();
    
    // Orthographic camera for axes (fixed size)
    const size = 2;
    axesCamera = new THREE.OrthographicCamera(-size, size, size, -size, 0.1, 100);
    axesCamera.position.set(0, 0, 5);
    
    // Create axes group
    axesGroup = new THREE.Group();
    
    // Default axes (will be updated when structure is loaded)
    updateAxesFromLattice(null);
    
    axesScene.add(axesGroup);
}

// Update axes HUD to reflect actual lattice vectors (supports tilted/non-cubic cells)
function updateAxesFromLattice(lattice) {
    // Clear existing axes
    while (axesGroup.children.length > 0) {
        const child = axesGroup.children[0];
        axesGroup.remove(child);
        disposeObject3D(child);
    }
    
    const headLength = 0.2;
    const headWidth = 0.1;
    
    // Get lattice vectors or default to world axes
    let aDir, bDir, cDir;
    if (lattice) {
        // Use actual lattice vectors (normalized for display)
        aDir = new THREE.Vector3(lattice[0][0], lattice[0][1], lattice[0][2]).normalize();
        bDir = new THREE.Vector3(lattice[1][0], lattice[1][1], lattice[1][2]).normalize();
        cDir = new THREE.Vector3(lattice[2][0], lattice[2][1], lattice[2][2]).normalize();
    } else {
        // Default to world axes before structure is loaded
        aDir = new THREE.Vector3(1, 0, 0);
        bDir = new THREE.Vector3(0, 1, 0);
        cDir = new THREE.Vector3(0, 0, 1);
    }
    
    const length = 1;
    
    // a axis (red) with arrow
    const aArrow = new THREE.ArrowHelper(aDir, new THREE.Vector3(0, 0, 0), length, 0xff6b6b, headLength, headWidth);
    axesGroup.add(aArrow);
    
    // b axis (green) with arrow
    const bArrow = new THREE.ArrowHelper(bDir, new THREE.Vector3(0, 0, 0), length, 0x51cf66, headLength, headWidth);
    axesGroup.add(bArrow);
    
    // c axis (blue) with arrow
    const cArrow = new THREE.ArrowHelper(cDir, new THREE.Vector3(0, 0, 0), length, 0x339af0, headLength, headWidth);
    axesGroup.add(cArrow);
    
    // Add axis labels at arrow tips
    const labelOffset = 1.15;
    addAxisLabel('a', aDir.clone().multiplyScalar(labelOffset), 0xff6b6b);
    addAxisLabel('b', bDir.clone().multiplyScalar(labelOffset), 0x51cf66);
    addAxisLabel('c', cDir.clone().multiplyScalar(labelOffset), 0x339af0);
}

// Add text label for axis
function addAxisLabel(text, position, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 16, 16);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(0.4, 0.4, 0.4);
    
    axesGroup.add(sprite);
}

// Update axes HUD visibility
function updateAxesHUD() {
    // Axes visibility is controlled by settings.showAxes
    // The actual rendering is done in animate()
}

// Legacy function - now a no-op since axes are in HUD
function addAxesHelper() {
    // Axes are now rendered as HUD in corner
    // This function is kept for compatibility but does nothing
}

// Keep the application entry points while format parsing lives in formats.js.
const crystalMeasurements = CrystalMeasurements.createMeasurements();
const crystalFormats = CrystalFormats.createFormats(THREE.Vector3, cartesianToFractional);
function parsePOSCAR(content) { return crystalFormats.parsePOSCAR(content); }
function parseXDATCAR(content) { return crystalFormats.parseXDATCAR(content); }
function isXDATCARFormat(content) { return crystalFormats.isXDATCARFormat(content); }
function isXYZFormat(content) { return crystalFormats.isXYZFormat(content); }
function parseXYZ(content) { return crystalFormats.parseXYZ(content); }
function isCIFFormat(content) { return crystalFormats.isCIFFormat(content); }
function parseCIF(content) { return crystalFormats.parseCIF(content); }

function hasLattice(structure) {
    return CrystalDocument.capabilities(structure).cell;
}

function getPeriodicAxes(structure) {
    return CrystalDocument.capabilities(structure).periodicAxes;
}

function isPeriodicStructure(structure) {
    return getPeriodicAxes(structure).some(Boolean);
}

function getPeriodicRepeats(structure, requested = settings.periodic) {
    const axes = getPeriodicAxes(structure);
    return Object.fromEntries(['a', 'b', 'c'].map((axis, index) => [axis, axes[index] ? requested[axis] : 1]));
}

function supportsSelectiveDynamics(structure) {
    return CrystalDocument.capabilities(structure).constraints;
}

// Create atom sphere
// selectiveDynamics: [xActive, yActive, zActive] - true means movable, false means fixed
function createAtom(element, position, atomIndex, selectiveDynamics = [true, true, true]) {
    const elemData = ELEMENT_DATA[element] || ELEMENT_DATA.DEFAULT;
    const radius = elemData.radius * 0.4 * settings.atomScale;
    
    const mesh = new THREE.Mesh(getSharedAtomGeometry(), getAtomMaterial(element));
    mesh.position.copy(position);
    mesh.scale.setScalar(radius);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { 
        element, 
        atomIndex, 
        isAtom: true,
        selectiveDynamics: selectiveDynamics
    };
    
    return mesh;
}

// Create visual indicator for fixed atoms (wireframe octahedron cage)
function createFixedAtomIndicator(position, radius, selectiveDynamics) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.userData = { isFixedIndicator: true };
    
    const isFullyFixed = selectiveDynamics.every(v => v === false);
    const indicatorRadius = radius * 1.6;
    
    if (isFullyFixed) {
        // Fully fixed: octahedron wireframe (cage)
        const octaGeometry = new THREE.OctahedronGeometry(indicatorRadius, 0);
        const wireframe = new THREE.WireframeGeometry(octaGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff6b6b, // Red-ish color for fixed
            transparent: true,
            opacity: 0.7,
            linewidth: 1
        });
        const cage = new THREE.LineSegments(wireframe, lineMaterial);
        group.add(cage);
    } else {
        // Partially fixed: show rings for fixed axes
        const ringMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffaa00, // Orange for partially fixed
            transparent: true,
            opacity: 0.6
        });
        
        // X-axis fixed: YZ ring (perpendicular to X)
        if (!selectiveDynamics[0]) {
            const ringGeom = new THREE.RingGeometry(indicatorRadius * 0.9, indicatorRadius, 24);
            const ring = new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints(
                    new THREE.Path().absarc(0, 0, indicatorRadius, 0, Math.PI * 2).getPoints(24)
                ),
                ringMaterial
            );
            ring.rotation.y = Math.PI / 2; // Perpendicular to X
            group.add(ring);
        }
        
        // Y-axis fixed: XZ ring (perpendicular to Y)
        if (!selectiveDynamics[1]) {
            const ring = new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints(
                    new THREE.Path().absarc(0, 0, indicatorRadius, 0, Math.PI * 2).getPoints(24)
                ),
                ringMaterial
            );
            ring.rotation.x = Math.PI / 2; // Perpendicular to Y
            group.add(ring);
        }
        
        // Z-axis fixed: XY ring (perpendicular to Z)
        if (!selectiveDynamics[2]) {
            const ring = new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints(
                    new THREE.Path().absarc(0, 0, indicatorRadius, 0, Math.PI * 2).getPoints(24)
                ),
                ringMaterial
            );
            // Default orientation is already perpendicular to Z
            group.add(ring);
        }
    }
    
    return group;
}

// Create ghost atom (semi-transparent periodic image)
// cellOffset: { a: 0-n, b: 0-n, c: 0-n } indicating which periodic cell
// originalIndex: index of the original atom this is a copy of
function createGhostAtom(element, position, originalIndex, cellOffset) {
    const elemData = ELEMENT_DATA[element] || ELEMENT_DATA.DEFAULT;
    const radius = elemData.radius * 0.4 * settings.atomScale;
    
    const mesh = new THREE.Mesh(getSharedAtomGeometry(), getAtomMaterial(element, true));
    mesh.position.copy(position);
    mesh.scale.setScalar(radius);
    mesh.userData = { 
        element, 
        isGhost: true, 
        isAtom: true,
        originalIndex: originalIndex,
        cellOffset: cellOffset,
        atomIndex: `ghost_${originalIndex}_${cellOffset.a}${cellOffset.b}${cellOffset.c}`
    };
    
    return mesh;
}

// Get cell offset label like "[+a]", "[+ab]", "[+abc]"; a boundary copy on
// the near side of the cell reads "[-a]" or "[+a-b]".
function getCellOffsetLabel(cellOffset) {
    if (!cellOffset) return '';
    const axes = ['a', 'b', 'c'].filter(axis => cellOffset[axis]);
    if (!axes.length) return '';
    if (axes.every(axis => cellOffset[axis] > 0)) return `[+${axes.join('')}]`;
    return `[${axes.map(axis => `${cellOffset[axis] > 0 ? '+' : '-'}${axis}`).join('')}]`;
}

// Get original POSCAR coordinates for an atom (not display coordinates)
function getOriginalAtomPosition(selectedAtom) {
    if (!currentStructure) return { x: 0, y: 0, z: 0 };
    
    // For regular atoms, use the stored position in currentStructure
    const atomIndex = selectedAtom.isGhost ? selectedAtom.originalIndex : selectedAtom.index;
    const originalAtom = currentStructure.atoms[atomIndex];
    
    if (!originalAtom) return { x: 0, y: 0, z: 0 };
    
    // Get the base position
    const basePos = originalAtom.position;
    
    if (selectedAtom.isGhost && selectedAtom.cellOffset) {
        // For ghost atoms, add the periodic translation
        const lattice = currentStructure.lattice;
        const aVec = new THREE.Vector3(...lattice[0]);
        const bVec = new THREE.Vector3(...lattice[1]);
        const cVec = new THREE.Vector3(...lattice[2]);
        
        const translation = new THREE.Vector3()
            .addScaledVector(aVec, selectedAtom.cellOffset.a)
            .addScaledVector(bVec, selectedAtom.cellOffset.b)
            .addScaledVector(cVec, selectedAtom.cellOffset.c);
        
        return {
            x: basePos.x + translation.x,
            y: basePos.y + translation.y,
            z: basePos.z + translation.z
        };
    }
    
    // Regular atom - return original position
    return { x: basePos.x, y: basePos.y, z: basePos.z };
}

// Format coordinates for display based on current mode (fractional or cartesian)
// Returns HTML string with clickable coordinates
// The coordinate readout of a selected atom in the current display system.
function coordinateReadoutText(selectedAtom) {
    const originalPos = getOriginalAtomPosition(selectedAtom);
    if (hasLattice(currentStructure) && selectedAtomCoordMode === 'fractional') {
        const frac = cartesianToFractional(new THREE.Vector3(originalPos.x, originalPos.y, originalPos.z), currentStructure.lattice);
        if (frac) return { fractional: true, text: `[${frac[0].toFixed(3)}, ${frac[1].toFixed(3)}, ${frac[2].toFixed(3)}]` };
    }
    return { fractional: false, text: `(${originalPos.x.toFixed(2)}, ${originalPos.y.toFixed(2)}, ${originalPos.z.toFixed(2)})` };
}

function formatAtomCoordinates(selectedAtom, atomIndex) {
    const readout = coordinateReadoutText(selectedAtom);
    if (readout.fractional) {
        // Fractional: yellow/gold with square brackets
        return `<button type="button" id="selectedAtomCoords${atomIndex}" class="sel-coords sel-coords-frac clickable-coords" data-atom-idx="${atomIndex}" title="Show Cartesian coordinates">${readout.text}</button>`;
    }
    
    // Cartesian: cyan with parentheses (default fallback)
    const coordStr = readout.text;
    const toggle = hasLattice(currentStructure) ? 'clickable-coords' : '';
    const title = hasLattice(currentStructure) ? 'Show fractional coordinates' : 'Cartesian coordinates (Å)';
    const tag = hasLattice(currentStructure) ? 'button type="button"' : 'div';
    const closingTag = hasLattice(currentStructure) ? 'button' : 'div';
    return `<${tag} id="selectedAtomCoords${atomIndex}" class="sel-coords sel-coords-cart ${toggle}" data-atom-idx="${atomIndex}" title="${title}">${coordStr}</${closingTag}>`;
}

const geometryWarnings = new Map();
function setGeometryWarning(kind, message) {
    if (message) geometryWarnings.set(kind, message);
    else geometryWarnings.delete(kind);
    const warning = document.getElementById('geometryWarning');
    if (warning) {
        warning.textContent = [...geometryWarnings.values()].join(' ');
        warning.hidden = geometryWarnings.size === 0;
    }
}
function formatMeasuredDistance(pair) {
    return pair.unavailable ? 'Unavailable' : `${pair.distance.toFixed(4)} Å`;
}

// Numbers and visuals share the actual selected positions, with atom 2 as the angle vertex.
function resolveMeasurementGeometry(atoms) {
    const resolved = crystalMeasurements.resolve(atoms);
    setGeometryWarning('measurement', resolved.errors.join('. '));
    const points = resolved.points.map(point => ({ ...point, position: new THREE.Vector3(...point.position) }));
    const pairs = resolved.pairs.map((pair, index) => ({ ...pair,
        start: points[index].position, end: points[index + 1].position,
        delta: new THREE.Vector3(...pair.delta)
    }));
    const angle = resolved.angle ? { ...resolved.angle,
        first: points[0].position, vertex: points[1].position, third: points[2].position } : null;
    return { points, pairs, angle };
}

function getMeasurementGeometry() { return resolveMeasurementGeometry(selectedAtoms); }

function getMeasurementPair(atomA, atomB, geometry = null) {
    const first = selectedAtoms.indexOf(atomA), second = selectedAtoms.indexOf(atomB);
    if (first >= 0 && second >= 0 && Math.abs(first - second) === 1) {
        const pair = (geometry || getMeasurementGeometry()).pairs[Math.min(first, second)];
        if (first < second) return pair;
        return { ...pair, start: pair.end, end: pair.start, delta: pair.delta.clone().multiplyScalar(-1) };
    }
    return resolveMeasurementGeometry([atomA, atomB]).pairs[0];
}

function getMeasurementAngle(geometry = null) { return (geometry || getMeasurementGeometry()).angle; }

// Compute fractional displacement only when requested; Cartesian values use world axes.
function computeDeltas(atomA, atomB, geometry = null) {
    if (!currentStructure || !currentStructure.lattice) return null;
    const pair = getMeasurementPair(atomA, atomB, geometry);
    if (pair.unavailable) return null;
    const delta = pair.delta;
    if (!hasLattice(currentStructure) || selectedAtomCoordMode !== 'fractional') {
        return { da: delta.x, db: delta.y, dc: delta.z, dp: 2, unit: 'Å' };
    }
    const fractional = cartesianToFractional(delta, currentStructure.lattice);
    if (!fractional) return null;
    const [dfa, dfb, dfc] = fractional;
    return { da: dfa, db: dfb, dc: dfc, dp: 3, unit: '' };
}

// Format delta display for measurement panel (used in both measure and edit modes)
// Clickable to toggle coordinate mode, colored to match atom coordinate display
function formatDelta(atomA, atomB, geometry = null) {
    const d = computeDeltas(atomA, atomB, geometry);
    if (!d) return '';
    
    // Avoid -0.000: treat values that round to zero as positive
    const fmt = (v) => {
        const rounded = parseFloat(v.toFixed(d.dp));
        const val = Object.is(rounded, -0) ? 0 : rounded;
        return (val >= 0 ? '+' : '') + val.toFixed(d.dp);
    };
    const periodic = hasLattice(currentStructure);
    const fractional = periodic && selectedAtomCoordMode === 'fractional';
    const colorClass = fractional ? 'delta-frac' : 'delta-cart';
    const title = !periodic ? 'Cartesian displacement (Å)' : fractional
        ? 'Fractional — show Cartesian'
        : 'Cartesian (Å) — show fractional';
    
    const tag = periodic ? 'button type="button"' : 'div';
    const closingTag = periodic ? 'button' : 'div';
    return `<${tag} id="deltaCoords${escapeHTML(atomA.index)}_${escapeHTML(atomB.index)}" class="meas-delta ${periodic ? 'clickable-delta' : ''} ${colorClass}" title="${title}">` +
        `<span class="delta-item"><span class="delta-label delta-a">Δ${fractional ? 'a' : 'x'}</span> ${fmt(d.da)}</span>` +
        `<span class="delta-item"><span class="delta-label delta-b">Δ${fractional ? 'b' : 'y'}</span> ${fmt(d.db)}</span>` +
        `<span class="delta-item"><span class="delta-label delta-c">Δ${fractional ? 'c' : 'z'}</span> ${fmt(d.dc)}</span>` +
        `</${closingTag}>`;
}

// Format delta for preserved measurement in edit mode (same style as formatDelta)
function formatDeltaCompact(atomA, atomB, geometry = null) {
    return formatDelta(atomA, atomB, geometry);
}

// Toggle coordinate display mode and refresh UI
function toggleCoordinateDisplayMode() {
    if (!hasLattice(currentStructure)) return;
    selectedAtomCoordMode = selectedAtomCoordMode === 'fractional' ? 'cartesian' : 'fractional';
    
    // Refresh the appropriate UI based on current mode
    if (currentMode === 'measure') {
        updateMeasurementUI();
    } else {
        updateEditUI();
    }
}

// Create ghost bond (semi-transparent)
function createGhostBond(pos1, pos2) {
    const direction = new THREE.Vector3().subVectors(pos2, pos1);
    const length = direction.length();
    
    const smallestRadius = getSmallestAtomRadius();
    const bondRadius = smallestRadius * 0.25;
    
    const bond = new THREE.Mesh(getSharedBondGeometry(), getBondMaterial(true));
    bond.scale.set(bondRadius, length, bondRadius);
    bond.position.copy(pos1).add(pos2).multiplyScalar(0.5);
    bond.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );
    bond.userData = { isGhost: true, isGhostBond: true };
    
    return bond;
}

// Create extended supercell wireframe
function createSupercellWireframe(lattice, na, nb, nc) {
    const cellGroup = new THREE.Group();
    cellGroup.name = 'supercellWireframe';
    
    const a = new THREE.Vector3(...lattice[0]);
    const b = new THREE.Vector3(...lattice[1]);
    const c = new THREE.Vector3(...lattice[2]);
    
    // Scale vectors by periodicity
    const aExt = a.clone().multiplyScalar(na);
    const bExt = b.clone().multiplyScalar(nb);
    const cExt = c.clone().multiplyScalar(nc);
    
    const origin = new THREE.Vector3(0, 0, 0);
    const corners = [
        origin.clone(),
        origin.clone().add(aExt),
        origin.clone().add(bExt),
        origin.clone().add(cExt),
        origin.clone().add(aExt).add(bExt),
        origin.clone().add(aExt).add(cExt),
        origin.clone().add(bExt).add(cExt),
        origin.clone().add(aExt).add(bExt).add(cExt)
    ];
    
    const edges = [
        [0, 1], [0, 2], [0, 3],
        [1, 4], [1, 5],
        [2, 4], [2, 6],
        [3, 5], [3, 6],
        [4, 7], [5, 7], [6, 7]
    ];
    
    const material = new THREE.LineDashedMaterial({
        color: 0x9b5de5,
        transparent: true,
        opacity: 0.6,
        dashSize: 0.2,
        gapSize: 0.1
    });
    
    edges.forEach(([i, j]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([corners[i], corners[j]]);
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        cellGroup.add(line);
    });
    
    return cellGroup;
}

// Periodic copies are displayed for the preview region [0, na] × [0, nb] × [0, nc]
// in fractional coordinates: every whole cell beyond the original, plus the
// copies that fall on the region's far faces, edges and corners. An atom at
// fractional 0 therefore also appears at 1, so a cubic cell shows its corner
// and face atoms the way a textbook drawing does, and a bond that crosses a
// face ends at a drawn copy instead of in empty space.
// Called during renderStructure, before centering.
const BOUNDARY_IMAGE_TOLERANCE = 1e-6;

// Every periodic copy the current geometry calls for, as
// { originalIndex, offsets: [ia, ib, ic], whole } with whole marking a copy in
// a previewed whole cell rather than on the region's boundary.
function listPeriodicCopies(structure) {
    const copies = [];
    if (!isPeriodicStructure(structure)) return copies;
    const { a: na, b: nb, c: nc } = getPeriodicRepeats(structure);
    const counts = [na, nb, nc];
    const lattice = structure.lattice;
    const periodicAxes = getPeriodicAxes(structure);
    const fractionals = structure.atoms.map(atom => cartesianToFractional(atom.position, lattice));
    const isWholeCell = offsets => offsets.every((offset, axis) => offset >= 0 && offset < counts[axis]);
    const onBoundary = (fractional, offsets) => Boolean(fractional) && periodicAxes.every((periodic, axis) => {
        if (!periodic) return true;
        const value = fractional[axis] + offsets[axis];
        return value >= -BOUNDARY_IMAGE_TOLERANCE && value <= counts[axis] + BOUNDARY_IMAGE_TOLERANCE;
    });
    // Whole cells use offsets 0..n-1; boundary copies may also come from -1 or n.
    const ranges = counts.map((count, axis) => periodicAxes[axis]
        ? Array.from({ length: count + 2 }, (_, index) => index - 1) : [0]);
    for (const ia of ranges[0]) for (const ib of ranges[1]) for (const ic of ranges[2]) {
        const offsets = [ia, ib, ic];
        if (ia === 0 && ib === 0 && ic === 0) continue; // the original cell
        const whole = isWholeCell(offsets);
        structure.atoms.forEach((atom, originalIndex) => {
            if (whole || onBoundary(fractionals[originalIndex], offsets)) copies.push({ originalIndex, offsets, whole });
        });
    }
    return copies;
}

const periodicCopyKey = (originalIndex, offsets) => `${originalIndex}|${offsets.join(',')}`;

// Moving an atom onto or off a cell face changes which boundary copies exist.
// Position updates alone cannot show that; the scene must be rebuilt.
function boundaryCopiesStale() {
    if (!currentStructure || !isPeriodicStructure(currentStructure)) return false;
    const wanted = new Set(listPeriodicCopies(currentStructure).filter(copy => !copy.whole)
        .map(copy => periodicCopyKey(copy.originalIndex, copy.offsets)));
    const { a: na, b: nb, c: nc } = getPeriodicRepeats(currentStructure);
    const counts = [na, nb, nc];
    const shown = new Set();
    for (const mesh of atomMeshes) {
        if (!mesh.userData.isGhost) continue;
        const offsets = ['a', 'b', 'c'].map(axis => mesh.userData.cellOffset[axis]);
        if (offsets.every((offset, axis) => offset >= 0 && offset < counts[axis])) continue;
        shown.add(periodicCopyKey(mesh.userData.originalIndex, offsets));
    }
    return shown.size !== wanted.size || [...wanted].some(key => !shown.has(key));
}

function addPeriodicImages(structure) {
    if (!isPeriodicStructure(structure)) return;
    const { a: na, b: nb, c: nc } = getPeriodicRepeats(structure);
    const lattice = structure.lattice;
    const vectors = lattice.map(vector => new THREE.Vector3(...vector));
    
    // Add supercell wireframe
    if (settings.showCell && !(na === 1 && nb === 1 && nc === 1)) {
        const supercellWireframe = createSupercellWireframe(lattice, na, nb, nc);
        structureGroup.add(supercellWireframe);
    }
    
    for (const { originalIndex, offsets } of listPeriodicCopies(structure)) {
        const atom = structure.atoms[originalIndex];
        const translation = new THREE.Vector3();
        offsets.forEach((offset, axis) => translation.addScaledVector(vectors[axis], offset));
        const ghostPos = atom.position.clone().add(translation);
        const cellOffset = { a: offsets[0], b: offsets[1], c: offsets[2] };
        const ghostAtom = createGhostAtom(atom.element, ghostPos, originalIndex, cellOffset);
        structureGroup.add(ghostAtom);
        // Add to atomMeshes for raycasting (so ghost atoms can be selected)
        atomMeshes.push(ghostAtom);
    }
}

// === ATOM SELECTION & MEASUREMENT FUNCTIONS ===

// Get mouse position in normalized device coordinates
function getMouseNDC(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
}

// Atoms take priority over invisible cell-resize hitboxes, regardless of the
// hitbox's depth. Refresh transforms so picking agrees with the current view.
function getAtomIntersection(event) {
    return getAtomIntersectionAt(getMouseNDC(event));
}

function getAtomIntersectionAt(mouseNDC) {
    camera.updateWorldMatrix(true, false);
    structureGroup.updateWorldMatrix(true, true);
    measurementGroup?.updateWorldMatrix(true, true);
    raycaster.setFromCamera(mouseNDC, camera);
    // Numbered markers are visible handles for their atoms. Their readable
    // screen size can exceed a small sphere, so they share the atom's action.
    const markerHit = raycaster.intersectObjects(selectionRings, false)[0];
    if (markerHit) {
        const selected = selectedAtoms[selectionRings.indexOf(markerHit.object)];
        if (selected?.mesh?.parent === structureGroup) return { ...markerHit, object: selected.mesh };
    }
    const hits = raycaster.intersectObjects(atomMeshes, false);
    const nearest = hits[0];
    if (!nearest || !nearest.object.userData.isGhost) return nearest || null;
    // Viewed along a lattice vector, an atom and its own periodic copy share
    // the same pixels. The copy is only an image of the real atom, so the real
    // atom receives the click: that is what editing, focus and history name.
    return hits.find(hit => !hit.object.userData.isGhost
        && hit.object.userData.atomIndex === nearest.object.userData.originalIndex) || nearest;
}

// Mouse down handler
function onMouseDown(event) {
    if (!currentStructure) return;
    if (event.button !== 0) return; // Only left click
    if (event.isPrimary === false) {
        if (canvasClickGesture) canvasClickGesture.moved = true;
        return;
    }
    if (activeEditPointerId !== null) return;
    canvasClickGesture = { id: event.pointerId, x: event.clientX, y: event.clientY, active: true, moved: false };
    if (currentMode === 'edit' && (boxSelectMode || event.shiftKey)) {
        beginBoxSelect(event);
        return;
    }
    
    pointerDownTime = Date.now();
    wasDragging = false;
    
    const mouseNDC = getMouseNDC(event);
    mouse.copy(mouseNDC);
    dragStartMouse.copy(mouseNDC);
    
    const atomHit = getAtomIntersection(event);
    // Hover is presentation state and may have been cleared by an atom drag
    // or rebuild. The current pointer hit alone determines gesture ownership.
    if (!atomHit && currentMode === 'edit' && vacuumDragState.active) {
        const handleInfo = checkVacuumHandleIntersection(event);
        if (handleInfo) {
            controls.enabled = false;
            event.preventDefault();
            event.stopPropagation();
            if (startVacuumDrag(handleInfo, event)) {
                captureEditPointer(event);
                return;
            }
            controls.enabled = true;
        }
    }
    if (atomHit && currentMode === 'edit') clearVacuumHighlight();

    // Reset drag state
    isDragging = false;
    draggedAtom = null;
    
    if (atomHit && currentMode === 'edit') {
        const clickedMesh = atomHit.object;
        const atomIndex = clickedMesh.userData.atomIndex;
        const isGhost = clickedMesh.userData.isGhost;
        
        // Ghost atoms cannot be dragged in Edit mode
        if (isGhost) {
            return;
        }
        
        // Immediately disable orbit controls to prevent any camera rotation
        controls.enabled = false;
        
        // Start potential drag
        draggedAtom = {
            mesh: clickedMesh,
            index: atomIndex,
            startPosition: clickedMesh.position.clone(),
            startWorldPosition: new THREE.Vector3()
        };
        captureEditPointer(event);
        clickedMesh.getWorldPosition(draggedAtom.startWorldPosition);
        
        // Capture one usable plane for picking, movement and the visual guide.
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
        if (hasLattice(currentStructure)) {
            const localAnchor = draggedAtom.startWorldPosition.clone().sub(structureGroup.position);
            cameraDirection.fromArray(CrystalGeometry.cellDragPlaneNormal(
                currentStructure.lattice, localAnchor, cameraDirection
            ));
        }
        dragPlane.setFromNormalAndCoplanarPoint(cameraDirection, draggedAtom.startWorldPosition);
        
        // Calculate offset from click point to atom center
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersectPoint);
        if (intersectPoint) {
            dragOffset.subVectors(draggedAtom.startWorldPosition, intersectPoint);
        }
    }
}

function captureEditPointer(event) {
    activeEditPointerId = event.pointerId;
    recordEditPointerEvent(event);
    renderer.domElement.setPointerCapture(event.pointerId);
}

function recordEditPointerEvent(event) {
    if (activeEditPointerId === null || event.pointerId !== activeEditPointerId) return;
    lastEditPointerEvent = { type: event.type, buttons: event.buttons, pointerType: event.pointerType };
}

function trackEditPointer(event) {
    if (activeEditPointerId === null || event.pointerId !== activeEditPointerId) return;
    // Mouse pointerup fires only when every button is released. The primary
    // button may already be up during a chord, or its up may have occurred
    // outside the document. Commit the last held preview, never a hover point.
    if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) {
        onMouseUp({ pointerId: event.pointerId, pointerType: event.pointerType,
            type: event.type, button: 0, buttons: event.buttons });
        return;
    }
    onMouseMove(event);
}

function finishEditPointer(event) {
    if (activeEditPointerId === null || event.pointerId !== activeEditPointerId) return;
    onMouseUp(event);
}

function releaseEditPointer() {
    const pointerId = activeEditPointerId;
    activeEditPointerId = null;
    lastEditPointerEvent = null;
    if (pointerId !== null && renderer.domElement.hasPointerCapture(pointerId)) {
        renderer.domElement.releasePointerCapture(pointerId);
    }
}

// Interrupted drags restore the document without adding an undo entry.
function cancelEditDrag(event, actionReason) {
    if (event?.pointerId !== undefined && event.pointerId !== activeEditPointerId) return;
    if (boxSelectDrag) {
        cancelBoxSelect(actionReason || event?.type);
        return;
    }
    if (!draggedAtom && !vacuumDragState.isDragging) return;
    const reason = actionReason || ({
        blur: 'app lost focus',
        pointercancel: 'browser canceled pointer input',
        keydown: 'Escape pressed'
    })[event?.type] || 'another action started';
    const diagnostic = {
        reason, eventType: event?.type || 'application action',
        eventButtons: event?.buttons ?? null, pointerId: activeEditPointerId,
        lastPointerEvent: lastEditPointerEvent, hadMoved: isDragging || vacuumDragState.isDragging,
        documentFocused: document.hasFocus?.() ?? null
    };
    console.debug('Edit drag canceled:', diagnostic);
    const wasVacuumDrag = vacuumDragState.isDragging;
    if (wasVacuumDrag) {
        const { originalLattice, originalAtomPositions } = vacuumDragState;
        currentStructure.lattice = originalLattice.map(vector => [...vector]);
        currentStructure.atoms.forEach((atom, index) => {
            atom.position.copy(originalAtomPositions[index]);
            atom.fractional = cartesianToFractional(atom.position, currentStructure.lattice);
        });
        resetVacuumDragState();
        clearVacuumHighlight();
    } else {
        const atom = currentStructure.atoms[draggedAtom.index];
        atom.position.copy(draggedAtom.startPosition);
        atom.fractional = hasLattice(currentStructure)
            ? cartesianToFractional(atom.position, currentStructure.lattice) : null;
        draggedAtom.mesh.position.copy(atom.position);
        if (selectedAtoms.some(selected => selected.mesh === draggedAtom.mesh)) highlightAtomMesh(draggedAtom.mesh);
        else unhighlightAtomMesh(draggedAtom.mesh);
    }
    removeDragGuidePlane();
    draggedAtom = null;
    isDragging = false;
    wasDragging = true;
    controls.enabled = true;
    releaseEditPointer();
    if (wasVacuumDrag) {
        renderStructure(currentStructure, true);
        updateUI(currentStructure);
    } else {
        rebuildDisplayOptions();
    }
    updateUI_forCurrentMode();
    updateDirtyIndicator();
    requestRender();
    statusText.setAttribute('data-drag-cancellation', JSON.stringify(diagnostic));
    statusText.textContent = `Drag canceled (${reason}); original geometry restored`;
    statusText.className = '';
}

// Store drag plane info
let dragPlaneNormal = null;
let dragPlaneOrigin = null; // World-space anchor for stable plane coordinates
let dragPlaneRight = null; // Local X axis on plane
let dragPlaneUp = null; // Local Y axis on plane
let dragPolygon2D = []; // Polygon vertices in 2D plane coords

// Show the captured movement plane, bounded by the unit cell.
function createDragGuidePlane() {
    if (!currentStructure || !draggedAtom) return;
    
    removeDragGuidePlane();
    if (!hasLattice(currentStructure)) return;
    
    // Use the plane captured at pointer-down for both movement and its guide.
    dragPlaneNormal = dragPlane.normal.clone();
    dragPlaneOrigin = draggedAtom.startWorldPosition.clone();
    const localOrigin = dragPlaneOrigin.clone().sub(structureGroup.position);
    const intersections = CrystalGeometry.cellPlaneSection(
        currentStructure.lattice, localOrigin, dragPlaneNormal
    ).map(point => new THREE.Vector3(...point).add(structureGroup.position));

    const up = Math.abs(dragPlaneNormal.y) > 0.9
        ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    dragPlaneRight = new THREE.Vector3().crossVectors(up, dragPlaneNormal).normalize();
    dragPlaneUp = new THREE.Vector3().crossVectors(dragPlaneNormal, dragPlaneRight).normalize();
    dragPolygon2D = intersections.map(point => {
        const relative = point.clone().sub(dragPlaneOrigin);
        return { x: relative.dot(dragPlaneRight), y: relative.dot(dragPlaneUp) };
    });

    if (intersections.length >= 3) {
        // Create polygon geometry
        const vertices = [];
        for (let i = 1; i < intersections.length - 1; i++) {
            vertices.push(
                intersections[0].x, intersections[0].y, intersections[0].z,
                intersections[i].x, intersections[i].y, intersections[i].z,
                intersections[i + 1].x, intersections[i + 1].y, intersections[i + 1].z
            );
        }
        
        const planeGeom = new THREE.BufferGeometry();
        planeGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        
        const planeMat = new THREE.MeshBasicMaterial({
            color: 0x00f5d4,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        dragGuidePlane = new THREE.Mesh(planeGeom, planeMat);
        dragGuidePlane.renderOrder = 997;
        
        scene.add(dragGuidePlane);
        requestRender();
    }
}

// Remove drag guide plane
function removeDragGuidePlane() {
    if (dragGuidePlane) {
        scene.remove(dragGuidePlane);
        if (dragGuidePlane.geometry) dragGuidePlane.geometry.dispose();
        if (dragGuidePlane.material) dragGuidePlane.material.dispose();
        dragGuidePlane = null;
        requestRender();
    }
    dragPlaneNormal = null;
    dragPlaneOrigin = null;
    dragPolygon2D = [];
    dragPlaneRight = null;
    dragPlaneUp = null;
}

// Check if 2D point is inside polygon (ray casting algorithm)
function pointInPolygon2D(px, py, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

// Find closest point on polygon edge to a given point
function closestPointOnPolygon2D(px, py, polygon) {
    let minDist = Infinity;
    let closest = { x: px, y: py };
    
    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        const ax = polygon[i].x, ay = polygon[i].y;
        const bx = polygon[j].x, by = polygon[j].y;
        
        // Project point onto line segment
        const abx = bx - ax, aby = by - ay;
        const apx = px - ax, apy = py - ay;
        const lengthSquared = abx * abx + aby * aby;
        const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / lengthSquared));
        
        const closestX = ax + t * abx;
        const closestY = ay + t * aby;
        const dist = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
        
        if (dist < minDist) {
            minDist = dist;
            closest = { x: closestX, y: closestY };
        }
    }
    
    return closest;
}

// Constrain position to the drag polygon (on the plane)
function constrainToPolygon(worldPos) {
    if (!dragPlaneNormal || !dragPolygon2D.length) return worldPos;
    
    // Project to 2D plane coordinates
    const relative = worldPos.clone().sub(dragPlaneOrigin);
    const px = relative.dot(dragPlaneRight);
    const py = relative.dot(dragPlaneUp);
    
    // Check if inside polygon
    if (dragPolygon2D.length >= 3 && pointInPolygon2D(px, py, dragPolygon2D)) {
        return worldPos; // Already inside
    }
    
    // Find closest point on polygon boundary
    const closest = closestPointOnPolygon2D(px, py, dragPolygon2D);
    
    // Convert back to 3D
    const result = dragPlaneOrigin.clone()
        .add(dragPlaneRight.clone().multiplyScalar(closest.x))
        .add(dragPlaneUp.clone().multiplyScalar(closest.y));
    
    return result;
}

// Mouse move handler
function onMouseMove(event) {
    if (!currentStructure) return;
    if (activeEditPointerId !== null && event.pointerId !== activeEditPointerId) return;
    recordEditPointerEvent(event);
    if (boxSelectDrag) {
        updateBoxSelect(event);
        return;
    }
    
    // Handle vacuum drag
    if (vacuumDragState.isDragging) {
        updateVacuumDrag(event);
        return;
    }
    if (draggedAtom && currentMode !== 'edit') {
        cancelEditDrag(null, 'mode changed');
        return;
    }
    
    // Check for vacuum handle hover (cursor feedback and highlight)
    if (currentMode === 'edit' && vacuumDragState.active && !draggedAtom) {
        const handle = checkVacuumHandleIntersection(event, true); // Show highlight on hover
        if (handle) {
            // Determine cursor based on screen-space direction of the axis being extended
            const cursor = getVacuumDragCursor(handle.extendAxis);
            renderer.domElement.style.cursor = cursor;
        } else {
            renderer.domElement.style.cursor = boxSelectMode ? 'crosshair' : 'default';
        }
    } else if (currentMode === 'edit') {
        // Clear highlight if not hovering vacuum handles
        clearVacuumHighlight();
    }
    
    if (!draggedAtom || currentMode !== 'edit') return;
    
    const mouseNDC = getMouseNDC(event);
    
    // Check if moved enough to be considered a drag
    const moveDistance = mouseNDC.distanceTo(dragStartMouse);
    if (moveDistance > 0.02) {
        if (!isDragging) {
            // First time detecting drag
            isDragging = true;
            controls.enabled = false;
            statusText.textContent = `Moving atom #${draggedAtom.index + 1}`;
            statusText.className = '';
            
            // Keep selection during drag - don't deselect
            // Selection visuals will move with the atom during drag
            
            // Visual feedback - highlight dragged atom
            setAtomGlow(draggedAtom.mesh, 0x00f5d4, 0.3);
            
            // Show the same bounded plane used for movement.
            createDragGuidePlane();
        }
        
        // Update atom position
        mouse.copy(mouseNDC);
        raycaster.setFromCamera(mouse, camera);
        
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
            // Apply offset and get new world position
            let newWorldPos = intersectPoint.add(dragOffset);
            
            // Constrain to the visible polygon on the plane
            newWorldPos = constrainToPolygon(newWorldPos);
            
            // Convert to local position
            const newLocalPos = newWorldPos.clone().sub(structureGroup.position);
            let prepared;
            try {
                [prepared] = CrystalDocument.preparePositions(currentStructure, [newLocalPos]);
            } catch {
                return;
            }
            
            // Update atom position (both mesh and structure data for live readouts)
            draggedAtom.mesh.position.copy(newLocalPos);
            currentStructure.atoms[draggedAtom.index].position.copy(newLocalPos);
            currentStructure.atoms[draggedAtom.index].fractional = prepared.fractional;
            updateDirtyIndicator();
            
            // A preview changes the same geometry as a committed move. Refresh
            // all derived visuals, including bonds and displayed periodic copies.
            rebuildDisplayOptions();
            if (selectedAtoms.length > 0) updateEditUI();
        }
    }
}

// Mouse up handler
function onMouseUp(event) {
    if (!currentStructure) return;
    if (event.button !== 0) return; // Only left click
    if (activeEditPointerId !== null && event.pointerId !== activeEditPointerId) return;
    recordEditPointerEvent(event);
    if (boxSelectDrag) {
        finishBoxSelect();
        return;
    }
    
    // Handle vacuum drag end
    if (vacuumDragState.isDragging) {
        // A frame gesture owns its release even if a resized atom is now
        // under the cursor. Suppress the subsequent compatibility click.
        wasDragging = true;
        endVacuumDrag();
        controls.enabled = true;
        releaseEditPointer();
        return;
    }
    if (draggedAtom && currentMode !== 'edit') {
        cancelEditDrag(null, 'mode changed');
        return;
    }
    
    // Always re-enable controls on mouse up
    controls.enabled = true;
    
    if (draggedAtom && currentMode === 'edit') {
        const completedDrag = draggedAtom;
        const moved = isDragging;
        // Pointer-up ends ownership before rendering or panel/focus work can
        // emit interruption events. A completed move must never be rolled back.
        draggedAtom = null;
        isDragging = false;
        releaseEditPointer();
        if (moved) {
            // Finalize the move - this was a drag, not a click
            wasDragging = true; // Prevent click handler from firing
            
            // Remove guide plane
            removeDragGuidePlane();
            
            // Restore the selection glow if this atom was selected before dragging.
            if (selectedAtoms.some(atom => atom.mesh === completedDrag.mesh)) highlightAtomMesh(completedDrag.mesh);
            else unhighlightAtomMesh(completedDrag.mesh);
            
            // Save move for undo (unified undo stack)
            const oldPos = completedDrag.startPosition.clone();
            const newPos = completedDrag.mesh.position.clone();
            
            const changed = oldPos.distanceTo(newPos) >= 1e-10;
            if (changed) {
                pushUndo({
                    type: 'move_atom',
                    index: completedDrag.index,
                    oldPosition: oldPos,
                    newPosition: newPos.clone()
                });
            } else {
                newPos.copy(oldPos);
                completedDrag.mesh.position.copy(oldPos);
            }
            
            // Update structure data
            currentStructure.atoms[completedDrag.index].position.copy(newPos);
            currentStructure.atoms[completedDrag.index].fractional = hasLattice(currentStructure)
                ? cartesianToFractional(newPos, currentStructure.lattice) : null;
            
            // Rebuild all display options (bonds, fixed indicators, etc.). An
            // atom that reached or left a cell face also changes which
            // periodic copies are drawn, which only a scene rebuild can show.
            if (boundaryCopiesStale()) renderStructure(currentStructure, true);
            else rebuildDisplayOptions();
            
            // Update status
            statusText.textContent = changed ? `Moved atom #${completedDrag.index + 1}` : 'Atom position unchanged';
            statusText.className = changed ? 'success' : '';
            
            // Update edit UI to show undo option
            updateEditUI();
        }
        // Note: We don't handle click here anymore - let the click event handle it
        
    }
    releaseEditPointer();
    // Note: Measure mode clicks are handled by onClickFallback
}

// Handle click for edit mode (selection for deletion)
function handleEditClick(mesh, atomIndex) {
    const existingIndex = selectedAtoms.findIndex(a => a.index === atomIndex);
    
    if (existingIndex !== -1) {
        deselectAtom(existingIndex);
    } else {
        selectAtomForEdit(mesh, atomIndex);
    }
    
    updateEditUI();
}

// Handle click for measure mode
function handleMeasureClick(mouseNDC) {
    if (currentMode !== 'measure') return;
    
    mouse.copy(mouseNDC);
    raycaster.setFromCamera(mouse, camera);
    
    const hit = getAtomIntersectionAt(mouseNDC);
    const intersects = hit ? [hit] : [];
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const atomIndex = clickedMesh.userData.atomIndex;
        
        const existingIndex = selectedAtoms.findIndex(a => a.index === atomIndex);
        
        if (existingIndex !== -1) {
            deselectAtom(existingIndex);
        } else if (selectedAtoms.length < 3) {
            selectAtom(clickedMesh, atomIndex);
        } else {
            clearSelection();
            selectAtom(clickedMesh, atomIndex);
        }
        
        updateMeasurements();
        updateMeasurementUI();
    }
}

// Click handler for atom selection
function trackCanvasClickGesture(event) {
    const gesture = canvasClickGesture;
    if (!gesture?.active || event.pointerId !== gesture.id) return;
    // Retain maximum displacement: returning to the start is still a drag.
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 3) gesture.moved = true;
    if (event.type === 'pointercancel') gesture.moved = true;
    if (event.type !== 'pointermove') gesture.active = false;
}

function onClickFallback(event) {
    if (!currentStructure) return;
    const gesture = canvasClickGesture;
    canvasClickGesture = null;
    
    // Skip if we just finished dragging
    if (wasDragging || gesture?.moved) {
        wasDragging = false;
        return;
    }
    
    const mouseNDC = getMouseNDC(event);
    mouse.copy(mouseNDC);
    raycaster.setFromCamera(mouse, camera);
    
    // Check if clicking on an atom
    const hit = getAtomIntersection(event);
    const intersects = hit ? [hit] : [];
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const atomIndex = clickedMesh.userData.atomIndex;
        const isGhost = clickedMesh.userData.isGhost;
        
        if (currentMode === 'measure') {
            // In Measure mode, both real and ghost atoms can be selected
            const existingIndex = selectedAtoms.findIndex(a => a.index === atomIndex);
            
            if (existingIndex !== -1) {
                deselectAtom(existingIndex);
            } else if (selectedAtoms.length < 3) {
                selectAtom(clickedMesh, atomIndex);
            } else {
                clearSelection();
                selectAtom(clickedMesh, atomIndex);
            }
            
            updateMeasurements();
            updateMeasurementUI();
        } else if (currentMode === 'edit') {
            // In Edit mode, ghost atoms cannot be edited - skip them
            if (isGhost) {
                statusText.textContent = 'Ghost atoms cannot be edited. Use "Make Supercell" to convert.';
                statusText.className = '';
                return;
            }
            
            // If there's a preserved measurement selection, clear it first
            // This starts a fresh edit selection
            if (isMeasurementSelection) {
                clearSelection();
                isMeasurementSelection = false;
            }
            
            // Handle edit mode click - select/deselect for editing
            const existingIndex = selectedAtoms.findIndex(a => a.index === atomIndex);
            
            if (existingIndex !== -1) {
                deselectAtom(existingIndex);
            } else {
                selectAtomForEdit(clickedMesh, atomIndex);
            }
            
            updateEditUI();
        }
    }
}

// Select atom for edit mode (reuses common selection logic)
function selectAtomForEdit(mesh, atomIndex) {
    // Use the common selectAtom function - it's mode-aware
    selectAtom(mesh, atomIndex);
}

// Create selection marker for edit mode (cyan checkmark)
function createEditSelectionMarker(atomMesh, selectionNumber) {
    const worldPos = new THREE.Vector3();
    atomMesh.getWorldPosition(worldPos);
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Cyan circle with checkmark
    ctx.beginPath();
    ctx.arc(32, 32, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 245, 212, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw checkmark
    ctx.strokeStyle = '#0d1117';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(18, 32);
    ctx.lineTo(28, 42);
    ctx.lineTo(46, 22);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(worldPos);
    
    const labelSize = getSelectionLabelSize(atomMesh.userData.element);
    sprite.scale.set(labelSize, labelSize, labelSize);
    sprite.renderOrder = 999;
    sprite.userData.isSelectionLabel = true;
    sprite.userData.annotationColor = 0x00f5d4;
    
    measurementGroup.add(sprite);
    selectionRings.push(sprite);
}

// Keep keyboard focus when a panel rebuild replaces the active control.
function restorePanelFocus(focusedId, fallbackId) {
    const restoreFocus = () => {
        const replacement = focusedId && document.getElementById(focusedId);
        // A control that the rebuild disabled (None with nothing selected)
        // keeps no focus, and nothing else should take it either.
        if (replacement && replacement.disabled) return;
        (replacement || document.getElementById(fallbackId))?.focus({ preventScroll: true });
    };
    restoreFocus();
    // A native select popup can clear focus after its change handler ends.
    requestAnimationFrame(() => {
        if (document.activeElement === document.body) restoreFocus();
    });
}

// The control the pointer last went down on inside the side panel. Chrome
// focuses a clicked button, Safari does not, so focus alone cannot say which
// control a rebuild should keep in place.
let lastPanelPointerTarget = null;

function replacePanelHTML(panel, html, fallbackId) {
    const active = document.activeElement;
    const hadFocus = Boolean(active && panel.contains(active));
    const focusedId = hadFocus ? active.id : null;
    // Keep the control that caused this rebuild where it is on screen, so a
    // selection card growing above it cannot push it out from under the
    // pointer and break the user's flow.
    const scroller = typeof panel.closest === 'function' ? panel.closest('.sidebar') : null;
    const anchors = [];
    const control = hadFocus && active.id ? active
        : lastPanelPointerTarget?.id && panel.contains(lastPanelPointerTarget) ? lastPanelPointerTarget : null;
    if (control && scroller && typeof control.getBoundingClientRect === 'function') anchors.push({ id: control.id, top: control.getBoundingClientRect().top });
    // A rebuild caused outside the panel (a click on an atom, Escape) keeps
    // the first control that starts inside the visible panel where it is.
    // Every later control is a fallback, because the rebuild may drop the
    // first ones (clearing a selection removes its whole card).
    if (!anchors.length && scroller && typeof panel.querySelectorAll === 'function') {
        const top = scroller.getBoundingClientRect().top - 1;
        const inCard = [];
        for (const element of panel.querySelectorAll('[id]')) {
            const rect = element.getBoundingClientRect();
            if (rect.top < top) continue;
            // The selection card is what grows; a visible control outside it
            // (Select Atoms, Add Atom, …) is the better thing to hold still,
            // so the card's new rows appear above it rather than pushing it.
            (element.closest('.selection-card') ? inCard : anchors).push({ id: element.id, top: rect.top });
        }
        anchors.push(...inCard);
    }
    panel.innerHTML = html;
    for (const anchor of anchors) {
        const replacement = document.getElementById(anchor.id);
        if (!replacement) continue;
        scroller.scrollTop += replacement.getBoundingClientRect().top - anchor.top;
        break;
    }
    if (hadFocus) restorePanelFocus(focusedId, fallbackId);
}

// Update edit mode UI
function updateEditUI() {
    // A coordinate edit whose atom is no longer the single selection is over.
    if (coordinateEditSession && (selectedAtoms.length !== 1 || selectedAtoms[0].isGhost || selectedAtoms[0].index !== coordinateEditSession.index)) commitCoordinateSession();
    const panel = document.getElementById('measurementPanel');
    if (!panel) return;
    
    let html = '';
    
    // Instructions
    html += '<div class="edit-instructions">Click an atom to select · drag it to move</div>';
    // Select atoms by element, region or range; the selection feeds everything below.
    if (currentStructure && currentStructure.atoms.length) html += selectByRuleHTML();

    html += '<div class="sd-batch-section selection-section"><div class="sd-batch-title">Selection</div>';
    if (selectedAtoms.length === 0) {
        html += `<p class="placeholder-text">${currentStructure ? (currentStructure.atoms.length ? 'No atoms selected' : 'No atoms remain. Add an atom or Undo the deletion.') : 'Load a structure to start editing'}</p>`;
    } else {
        if (selectedAtoms.length > 0) {
            // Check if this is a preserved measurement from Measure mode
            if (isMeasurementSelection) {
                // Show compact measurement display (read-only)
                const geometry = getMeasurementGeometry();
                const labels = selectedAtoms.map((_, index) => measurementPointLabel(index));
                html += '<div class="preserved-measurement">';
                html += '<div class="preserved-measurement-header">📐 Measurement Preserved</div>';
                html += '<div class="preserved-measurement-hint">Click atom to start editing</div>';
                
                // Show measurement values
                if (selectedAtoms.length >= 2) {
                    const pair = geometry.pairs[0];
                    html += `<div class="preserved-measurement-value">Distance (${labels[0]}—${labels[1]}): <strong>${formatMeasuredDistance(pair)}</strong></div>`;
                    html += formatDeltaCompact(selectedAtoms[0], selectedAtoms[1], geometry);
                }
                if (selectedAtoms.length === 3) {
                    const pair = geometry.pairs[1];
                    html += `<div class="preserved-measurement-value">Distance (${labels[1]}—${labels[2]}): <strong>${formatMeasuredDistance(pair)}</strong></div>`;
                    html += formatDeltaCompact(selectedAtoms[1], selectedAtoms[2], geometry);
                    const angle = geometry.angle;
                    if (angle) html += `<div class="preserved-measurement-value">Angle (${labels.join("—")}): <strong>${angle.angleDeg.toFixed(2)}°</strong></div>`;
                }
                
                html += moveBlockHTML();
                html += `<button id="clearSelectionBtn" class="btn btn-clear" style="margin-top: 0.5rem;">Clear Measurement</button>`;
                html += '</div>';
            } else {
                // Normal edit selection UI. The card grows and shrinks with the
                // selection, so panel rebuilds prefer to anchor outside it.
                html += '<div class="selection-card">';
                html += `<div class="edit-warning">✓ ${selectedAtoms.length} atom${selectedAtoms.length > 1 ? 's' : ''} selected</div>`;
                
                // A long selection lists its first rows only; the count above
                // and the status line carry the total.
                const SELECTED_ROWS = 12;
                html += '<div class="selected-atoms edit-mode">';
                selectedAtoms.slice(0, SELECTED_ROWS).forEach((atom, i) => {
                    // Get selective dynamics status
                    const sd = currentStructure.atoms[atom.index]?.selectiveDynamics || [true, true, true];
                    const isFixed = sd.every(v => v === false);
                    const isFree = sd.every(Boolean);
                    const flagText = sd.map(v => v ? 'T' : 'F').join(' ');
                    const statusIcon = isFixed ? '🔒' : isFree ? '🔓' : flagText;
                    const statusTitle = isFixed ? 'Fixed (F F F)' : isFree ? 'Free (T T T)' : `Partly fixed (${flagText})`;
                    
                    // Get formatted coordinates (clickable to toggle between fractional/cartesian)
                    const coordsHtml = formatAtomCoordinates(atom, i);
                    
                    html += `
                        <div class="selected-atom edit">
                            <div class="color-strip" style="background: #00f5d4"></div>
                            <span class="sel-num" style="background: #00f5d4; color: #0d1117">✓</span>
                            <span class="sel-elem">${atom.element}</span>
                            <span class="sel-idx">#${atom.index + 1}</span>
                            ${supportsSelectiveDynamics(currentStructure) ? `<span class="sel-status${isFixed || isFree ? '' : ' partial'}" title="${statusTitle}">${statusIcon}</span>` : ''}
                            ${coordsHtml}
                        </div>
                    `;
                });
                if (selectedAtoms.length > SELECTED_ROWS) html += `<div class="selected-atoms-more">… and ${selectedAtoms.length - SELECTED_ROWS} more</div>`;
                html += '</div>';

                if (selectedAtoms.length === 1 && !selectedAtoms[0].isGhost) {
                    const atom = currentStructure.atoms[selectedAtoms[0].index];
                    const fractional = hasLattice(currentStructure) && selectedAtomCoordMode === 'fractional';
                    const values = fractional ? cartesianToFractional(atom.position, currentStructure.lattice)
                        : [atom.position.x, atom.position.y, atom.position.z];
                    if (values) {
                        const step = currentCoordinateStep(fractional);
                        html += `
                        <div class="exact-atom-section" id="exactAtomSection">
                            <div class="move-head">
                                <div class="constraint-label">Move atom #${selectedAtoms[0].index + 1}</div>
                                ${coordinateChoiceHTML('editAtomCoordMode', fractional ? 'fractional' : 'cartesian')}
                            </div>
                            <div class="coord-step-row" role="group" aria-label="Arrow step">
                                <span class="coord-step-label">Step</span>
                                ${coordinateStepOptions(fractional).map(option => `<button type="button" id="coordStep-${option}" class="coord-step" data-step="${option}" aria-pressed="${option === step}">${option}${fractional ? '' : ' Å'}</button>`).join('')}
                            </div>
                            <div class="add-atom-coords">
                                ${values.map((value, axis) => `<div class="coord-input-group">
                                    <label for="editAtom${axis}">${fractional ? ['a', 'b', 'c'][axis] : ['x', 'y', 'z'][axis]}</label>
                                    <input id="editAtom${axis}" type="number" step="${step}" value="${Number(value.toFixed(9))}" class="coord-input" required>
                                </div>`).join('')}
                            </div>
                            <div id="editAtomError" class="add-atom-error" role="alert"></div>
                            <div class="coord-edit-hint">Arrows and typing move the atom live · Enter keeps · Esc reverts</div>
                        </div>
                    `;
                    }
                } else {
                    html += moveBlockHTML();
                }
                
                // Constraints of the selected atoms: one toggle per axis plus
                // the all-axes presets.
                if (supportsSelectiveDynamics(currentStructure)) html += constraintControlsHTML();
                
                html += `
                    <button id="deleteSelectedBtn" class="btn btn-delete">🗑️ Delete ${selectedAtoms.length} atom${selectedAtoms.length === 1 ? '' : 's'}</button>
                </div>`;
            }
        }
        
    }
    
    html += '</div>';

    // Add Atom section (always show when structure loaded)
    if (currentStructure) {
        // Get available elements from current structure + common elements
        const existingElements = currentStructure.elements || [];
        const commonElements = ['H', 'C', 'N', 'O', 'S', 'Si', 'Fe', 'Cu', 'Zn', 'W', 'Ti', 'Pt', 'Au', 'Ag'];
        const allElements = [...new Set([...existingElements, ...commonElements])].sort();
        
        // Use last selected element or default to first in list
        const selectedElement = lastAddAtomElement || existingElements[0] || allElements[0];
        const elementOptions = allElements.map(e => 
            `<option value="${e}"${e === selectedElement ? ' selected' : ''}>${e}</option>`
        ).join('');
        
        // Use last coordinate type
        const isCartesian = !hasLattice(currentStructure) || lastAddAtomCoordType === 'cartesian';
        const step = isCartesian ? '0.1' : '0.01';
        
        html += `
            <div class="add-atom-section">
                <div class="sd-batch-title">Add Atom</div>
                <div class="add-atom-row">
                    <label for="addAtomElement">Element</label>
                    <select id="addAtomElement" class="element-select">
                        ${elementOptions}
                    </select>
                </div>
                ${(currentStructure.speciesGroups || []).filter(group => group.element === selectedElement).length > 1 ? `
                <div class="add-atom-row">
                    <label for="addAtomSpecies">Species group</label>
                    <select id="addAtomSpecies" class="element-select">
                        ${currentStructure.speciesGroups.map((group, index) => group.element === selectedElement
                            ? `<option value="${group.id}"${group.id === lastAddAtomSpecies ? ' selected' : ''}>${group.element} — group ${index + 1}</option>` : '').join('')}
                    </select>
                </div>` : ''}
                ${coordinateChoiceHTML('coordType', isCartesian ? 'cartesian' : 'fractional')}
                <div class="add-atom-coords">
                    <div class="coord-input-group">
                        <label for="addAtomX" id="addAtomLabelX">${isCartesian ? 'x' : 'a'}</label>
                        <input type="number" id="addAtomX" step="${step}" value="${lastAddAtomCoords.x}" class="coord-input">
                    </div>
                    <div class="coord-input-group">
                        <label for="addAtomY" id="addAtomLabelY">${isCartesian ? 'y' : 'b'}</label>
                        <input type="number" id="addAtomY" step="${step}" value="${lastAddAtomCoords.y}" class="coord-input">
                    </div>
                    <div class="coord-input-group">
                        <label for="addAtomZ" id="addAtomLabelZ">${isCartesian ? 'z' : 'c'}</label>
                        <input type="number" id="addAtomZ" step="${step}" value="${lastAddAtomCoords.z}" class="coord-input">
                    </div>
                </div>
                <div id="addAtomError" class="add-atom-error"></div>
                <button id="addAtomBtn" class="btn btn-add-atom">+ Add Atom</button>
            </div>
        `;
        
        // Whole-structure actions.
        const structureActions = [
            hasLattice(currentStructure) ? '<button id="shiftCenterBtn" class="btn btn-sm" title="Shift every atom so the structure sits in the middle of the cell">Center in cell</button>' : '',
            supportsSelectiveDynamics(currentStructure) ? '<button id="unfixAllBtn" class="btn btn-sm" title="Make every atom free to move (T T T)">Free all atoms</button>' : ''
        ].filter(Boolean);
        if (structureActions.length) html += `
            <div class="sd-batch-section structure-section">
                <div class="select-head">
                    <div class="sd-batch-title">Structure</div>
                    ${supportsSelectiveDynamics(currentStructure) ? `<div class="sd-stats" id="sdStats">${getSelectiveDynamicsStats()}</div>` : ''}
                </div>
                <div class="structure-actions">${structureActions.join('')}</div>
            </div>
        `;
    }
    
    replacePanelHTML(panel, html, 'atomJumpInput');
    document.querySelectorAll('input[name="editAtomCoordMode"]').forEach(radio => radio.addEventListener('change', event => {
        selectedAtomCoordMode = event.target.value;
        updateEditUI();
        restorePanelFocus(event.target.id, 'atomJumpInput');
    }));
    // Coordinate fields preview live; the section commits when focus leaves it.
    [0, 1, 2].forEach(axis => {
        const field = document.getElementById(`editAtom${axis}`);
        if (!field) return;
        field.addEventListener('input', scheduleCoordinatePreview);
        field.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyExactAtomCoordinates();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                cancelCoordinateEdit();
            }
        });
    });
    const exactAtomSection = document.getElementById('exactAtomSection');
    if (exactAtomSection) exactAtomSection.addEventListener('focusout', event => {
        if (event.relatedTarget && exactAtomSection.contains(event.relatedTarget)) return;
        // A panel rebuild (for instance after switching the coordinate system)
        // removes the focused field and restores focus into the new section;
        // only focus that really settles outside the section ends the session.
        if (!exactAtomSection.isConnected) return;
        setTimeout(() => {
            const section = document.getElementById('exactAtomSection');
            if (!section || !section.contains(document.activeElement)) commitCoordinateSession();
        }, 0);
    });
    document.querySelectorAll('.coord-step').forEach(button => {
        button.addEventListener('click', () => setCoordinateStep(button.dataset.step));
    });
    
    // Add button listeners
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteSelectedAtoms);
    }
    
    const clearBtn = document.getElementById('clearSelectionBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearSelection();
            updateEditUI();
        });
    }
    
    // Selective dynamics buttons
    const fixSelectedBtn = document.getElementById('fixSelectedBtn');
    if (fixSelectedBtn) {
        fixSelectedBtn.addEventListener('click', () => setSelectedAtomsFixed(true));
    }
    
    const unfixSelectedBtn = document.getElementById('unfixSelectedBtn');
    if (unfixSelectedBtn) {
        unfixSelectedBtn.addEventListener('click', () => setSelectedAtomsFixed(false));
    }
    
    ['X', 'Y', 'Z'].forEach((axis, index) => {
        const toggle = document.getElementById(`constraintAxis${axis}`);
        if (toggle) toggle.addEventListener('click', () => toggleConstraintAxis(index));
    });

    // Select-by-rule controls
    const selectRangeBtn = document.getElementById('selectRangeBtn');
    if (selectRangeBtn) selectRangeBtn.addEventListener('click', event => selectAtomsByRange(Boolean(event.altKey)));
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllAtoms);
    const selectNoneBtn = document.getElementById('selectNoneBtn');
    if (selectNoneBtn) selectNoneBtn.addEventListener('click', () => { clearSelection(); updateEditUI(); });
    const selectInvertBtn = document.getElementById('selectInvertBtn');
    if (selectInvertBtn) selectInvertBtn.addEventListener('click', invertSelection);
    const boxSelectToggle = document.getElementById('boxSelectToggle');
    if (boxSelectToggle) boxSelectToggle.addEventListener('click', () => setBoxSelectMode(!boxSelectMode));
    ['selectRangeMin', 'selectRangeMax'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.addEventListener('input', rememberSelectRange);
    });
    const selectRangeAxis = document.getElementById('selectRangeAxis');
    if (selectRangeAxis) selectRangeAxis.addEventListener('change', () => {
        const unitBefore = (lastSelectRange || defaultSelectRange()).unit;
        rememberSelectRange();
        // A new unit changes the fields' step; the axis alone needs no rebuild.
        if (lastSelectRange.unit !== unitBefore) {
            updateEditUI();
            restorePanelFocus('selectRangeAxis', 'selectRangeMin');
        } else updateSelectRangePlaceholders();
    });
    document.querySelectorAll('.element-chip').forEach(chip => {
        chip.addEventListener('click', event => toggleElementSelection(chip.dataset.element, Boolean(event.altKey)));
    });
    
    const unfixAllBtn = document.getElementById('unfixAllBtn');
    if (unfixAllBtn) {
        unfixAllBtn.addEventListener('click', unfixAllAtoms);
    }
    
    // Global Periodic Shift buttons
    const applyShiftBtn = document.getElementById('applyShiftBtn');
    if (applyShiftBtn) {
        applyShiftBtn.addEventListener('click', applyGlobalPeriodicShift);
    }
    
    const shiftCenterBtn = document.getElementById('shiftCenterBtn');
    if (shiftCenterBtn) {
        shiftCenterBtn.addEventListener('click', centerStructureInCell);
    }
    
    // Shift coordinate type radio buttons
    const shiftCoordTypeRadios = document.querySelectorAll('input[name="shiftCoordType"]');
    shiftCoordTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isCartesian = e.target.value === 'cartesian';
            const step = isCartesian ? '0.1' : '0.01';
            document.getElementById('shiftA').step = step;
            document.getElementById('shiftB').step = step;
            document.getElementById('shiftC').step = step;
            
            // Update labels
            document.getElementById('shiftLabelA').textContent = isCartesian ? 'Δx' : 'Δa';
            document.getElementById('shiftLabelB').textContent = isCartesian ? 'Δy' : 'Δb';
            document.getElementById('shiftLabelC').textContent = isCartesian ? 'Δz' : 'Δc';
            
            // Remember coordinate type
            lastShiftCoordType = e.target.value;
            
            // Clear error
            document.getElementById('shiftError').textContent = '';
        });
    });
    
    // Add Atom button
    const addAtomBtn = document.getElementById('addAtomBtn');
    if (addAtomBtn) {
        addAtomBtn.addEventListener('click', addAtomFromInput);
    }
    
    // Element select - remember choice
    const addAtomElement = document.getElementById('addAtomElement');
    if (addAtomElement) {
        addAtomElement.addEventListener('change', (e) => {
            lastAddAtomElement = e.target.value;
            lastAddAtomCoords = Object.fromEntries(['x', 'y', 'z'].map(axis => [axis, document.getElementById(`addAtom${axis.toUpperCase()}`).value]));
            updateEditUI();
        });
    }
    document.getElementById('addAtomSpecies')?.addEventListener('change', event => { lastAddAtomSpecies = event.target.value; });
    
    // Coordinate type radio buttons - update step values and remember choice
    const coordTypeRadios = document.querySelectorAll('input[name="coordType"]');
    coordTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isFractional = e.target.value === 'fractional';
            const step = isFractional ? '0.01' : '0.1';
            document.getElementById('addAtomX').step = step;
            document.getElementById('addAtomY').step = step;
            document.getElementById('addAtomZ').step = step;
            ['X', 'Y', 'Z'].forEach((axis, index) => {
                document.getElementById(`addAtomLabel${axis}`).textContent = isFractional
                    ? ['a', 'b', 'c'][index] : ['x', 'y', 'z'][index];
            });
            
            // Remember coordinate type
            lastAddAtomCoordType = e.target.value;
            
            // Clear error when switching modes
            document.getElementById('addAtomError').textContent = '';
        });
    });
    
    // Clickable coordinates toggle (atom coords and delta rows)
    document.querySelectorAll('.clickable-coords, .clickable-delta').forEach(el => {
        el.addEventListener('click', toggleCoordinateDisplayMode);
    });
}

// === LIVE COORDINATE EDITING ===
// The single-atom coordinate fields preview the atom as they change, like a
// drag does: arrow and spinner steps at once, typing after a short pause.
// One history entry covers the whole editing session; it is recorded when
// focus leaves the section or Enter is pressed, and Escape puts the atom
// back where the session started.

function coordinateInputsFractional() {
    return hasLattice(currentStructure) && selectedAtomCoordMode === 'fractional';
}

function coordinateStepOptions(fractional) {
    return fractional ? ['0.01', '0.05', '0.1'] : ['0.1', '0.5', '1'];
}

function currentCoordinateStep(fractional) {
    return lastCoordinateStep[fractional ? 'fractional' : 'cartesian'];
}

function setCoordinateStep(step) {
    const fractional = coordinateInputsFractional();
    if (!coordinateStepOptions(fractional).includes(step)) return;
    lastCoordinateStep[fractional ? 'fractional' : 'cartesian'] = step;
    [0, 1, 2].forEach(axis => {
        const field = document.getElementById(`editAtom${axis}`);
        if (field) field.step = step;
    });
    document.querySelectorAll('.coord-step').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.step === step)));
}

// The atom the coordinate fields edit, or null when there is no single real
// selected atom.
function coordinateEditTarget() {
    if (!currentStructure || selectedAtoms.length !== 1 || selectedAtoms[0].isGhost) return null;
    const index = selectedAtoms[0].index;
    return currentStructure.atoms[index] ? index : null;
}

// Timers exist only in the browser; the unit tests drive the functions directly.
function clearCoordinatePreviewTimer() {
    if (coordinateEditTimer !== null && typeof clearTimeout === 'function') clearTimeout(coordinateEditTimer);
    coordinateEditTimer = null;
}

function scheduleCoordinatePreview(event) {
    clearCoordinatePreviewTimer();
    // Typing reports an inputType (insertText, deleteContentBackward, …);
    // arrow keys, the spinner and programmatic changes do not.
    const typing = typeof event?.inputType === 'string' && event.inputType.length > 0;
    if (typing) coordinateEditTimer = setTimeout(() => previewTypedCoordinates(false), 300);
    else previewTypedCoordinates(false);
}

// Move the selected atom to the typed coordinates without recording history.
function previewTypedCoordinates(report = false) {
    const index = coordinateEditTarget();
    if (index === null) return false;
    const fields = [0, 1, 2].map(axis => document.getElementById(`editAtom${axis}`));
    if (fields.some(field => !field)) return false;
    const error = document.getElementById('editAtomError');
    const values = fields.map(field => String(field.value).trim() !== '' ? Number(field.value) : NaN);
    if (values.some(value => !Number.isFinite(value))) {
        if (error) error.textContent = report ? 'Enter three finite coordinates' : '';
        return false;
    }
    const position = coordinateInputsFractional() ? fractionalToCartesian(values, currentStructure.lattice) : new THREE.Vector3(...values);
    let prepared;
    try {
        [prepared] = CrystalDocument.preparePositions(currentStructure, [position]);
    } catch {
        if (error) error.textContent = 'Coordinates cannot be represented in this cell';
        return false;
    }
    if (error) error.textContent = '';
    const atom = currentStructure.atoms[index];
    if (!coordinateEditSession || coordinateEditSession.index !== index) {
        coordinateEditSession = { index, startPosition: atom.position.clone() };
    }
    if (atom.position.distanceTo(prepared.position) < 1e-12) return true;
    atom.position.copy(prepared.position);
    atom.fractional = prepared.fractional;
    if (atomMeshes[index]) atomMeshes[index].position.copy(atom.position);
    updateDirtyIndicator();
    rebuildDisplayOptions();
    refreshSelectedAtomReadout();
    return true;
}

function refreshSelectedAtomReadout() {
    const readout = document.getElementById('selectedAtomCoords0');
    if (readout && selectedAtoms.length === 1) readout.textContent = coordinateReadoutText(selectedAtoms[0]).text;
}

// Record the session's move as one history entry. Returns whether a move
// was recorded.
function commitCoordinateSession() {
    clearCoordinatePreviewTimer();
    if (!coordinateEditSession) return false;
    const { index, startPosition } = coordinateEditSession;
    coordinateEditSession = null;
    const atom = currentStructure?.atoms[index];
    if (!atom) return false;
    const newPosition = atom.position.clone();
    if (startPosition.distanceTo(newPosition) < 1e-10) return false;
    pushUndo({ type: 'move_atom', index, oldPosition: startPosition.clone(), newPosition });
    // An atom that reached or left a cell face changes which periodic copies
    // are drawn, which only a scene rebuild can show.
    if (boundaryCopiesStale()) renderStructure(currentStructure, true);
    else rebuildDisplayOptions();
    updateUI(currentStructure);
    updateEditUI();
    statusText.textContent = `Set coordinates for atom #${index + 1}`;
    statusText.className = 'success';
    return true;
}

// Enter: preview whatever is typed, then keep it.
function applyExactAtomCoordinates() {
    if (!previewTypedCoordinates(true)) return false;
    if (commitCoordinateSession()) return true;
    statusText.textContent = 'Atom position unchanged';
    statusText.className = '';
    return false;
}

// Escape in a field: put the atom back where the session started.
function cancelCoordinateEdit() {
    clearCoordinatePreviewTimer();
    if (coordinateEditSession) {
        const { index, startPosition } = coordinateEditSession;
        coordinateEditSession = null;
        const atom = currentStructure?.atoms[index];
        if (atom) {
            atom.position.copy(startPosition);
            atom.fractional = hasLattice(currentStructure) ? cartesianToFractional(atom.position, currentStructure.lattice) : null;
            if (atomMeshes[index]) atomMeshes[index].position.copy(atom.position);
            updateDirtyIndicator();
            rebuildDisplayOptions();
        }
        statusText.textContent = `Coordinate edit canceled; atom #${index + 1} restored`;
        statusText.className = '';
    }
    updateEditUI();
}

// All discrete coordinate edits validate the complete proposal before writing
// positions or recording history. Drag previews use the same document validator.
function commitGeometryEdit(operation, updates, lattice = null) {
    const prepared = CrystalDocument.preparePositions(currentStructure, updates.map(update => update.position), lattice || currentStructure.lattice);
    if (updates.some(({ index }) => !Number.isInteger(index) || !currentStructure.atoms[index])) throw new Error('Unknown atom in edit');
    if (lattice) currentStructure.lattice = lattice;
    prepared.forEach(({ position, fractional }, offset) => {
        const atom = currentStructure.atoms[updates[offset].index];
        atom.position.copy(position);
        atom.fractional = fractional;
    });
    pushUndo(operation);
}

// Rebuild bonds based on current atom positions
// ============================================
// Display Options Rebuild Functions
// ============================================
// These functions update visual elements when atoms are moved or settings change.
// To add a new display feature (e.g., labels), add a rebuild function here
// and call it from rebuildDisplayOptions().

// Master function to rebuild ALL display options
// Call this whenever atom positions change (drag, undo, etc.)
function rebuildDisplayOptions() {
    if (!currentStructure) return;
    // Keep displayed periodic images aligned when a real atom is moved.
    atomMeshes.forEach(mesh => {
        if (!mesh.userData.isGhost) return;
        const { originalIndex, cellOffset } = mesh.userData;
        mesh.position.copy(currentStructure.atoms[originalIndex].position);
        ['a', 'b', 'c'].forEach((axis, index) => {
            mesh.position.addScaledVector(new THREE.Vector3(...currentStructure.lattice[index]), cellOffset[axis]);
        });
    });
    updateAtomInstances();
    rebuildBonds();
    rebuildFixedIndicators();
    rebuildLabels();
    updateSelectionVisualPositions();
    // Measurements are derived from the refreshed positions too, including
    // rollback after Escape and periodic-copy updates at drag completion.
    if (selectedAtoms.length > 0 && (currentMode === 'measure' || isMeasurementSelection)) updateMeasurements();
    requestRender();
}

// Rebuild bonds between atoms
function rebuildBonds() {
    if (!currentStructure) return;
    const toRemove = [];
    structureGroup.children.forEach(child => {
        if (child.userData.isBond || child.userData.isGhostBond) {
            toRemove.push(child);
        }
    });
    toRemove.forEach(bond => {
        structureGroup.remove(bond);
        disposeObject3D(bond);
    });
    addBondsFromAtomMeshes();
}

function addBondsFromAtomMeshes() {
    setGeometryWarning('bonds', '');
    // The cutoff also bounds the spatial search; zero means bonds are off.
    const bucketSize = settings.bondThreshold;
    if (!(bucketSize > 0)) return;
    const dense = displayedAtomCount > DENSE_VIEW_ATOMS;
    const solidSegments = [];
    const ghostSegments = [];
    const addBond = (first, second, isGhost) => {
        if (dense) {
            (isGhost ? ghostSegments : solidSegments).push([first, second]);
        } else {
            structureGroup.add(isGhost ? createGhostBond(first, second) : createBond(first, second));
        }
    };
    // Spatial buckets keep bond searches close to linear for sparse structures.
    const buckets = new Map();
    for (let i = 0; i < atomMeshes.length; i++) {
        const first = atomMeshes[i];
        const x = Math.floor(first.position.x / bucketSize);
        const y = Math.floor(first.position.y / bucketSize);
        const z = Math.floor(first.position.z / bucketSize);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    for (const second of buckets.get(`${x + dx},${y + dy},${z + dz}`) || []) {
                        const distance = first.position.distanceTo(second.position);
                        if (distance < bucketSize && distance > 0.5) {
                            addBond(first.position, second.position, first.userData.isGhost || second.userData.isGhost);
                        }
                    }
                }
            }
        }
        const key = `${x},${y},${z}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(first);
    }
    if (isPeriodicStructure(currentStructure) && currentStructure.lattice) {
        addPeriodicBoundaryBonds(buckets, bucketSize, (first, second) => addBond(first, second, true));
    }
    if (dense) {
        addInstancedBonds(solidSegments, false);
        addInstancedBonds(ghostSegments, true);
    }
}

function addInstancedBonds(segments, isGhost) {
    if (!segments.length) return;
    // Each batch owns its geometry so removing it also releases its GPU instance data.
    const bonds = new THREE.InstancedMesh(getSharedBondGeometry().clone(), getBondMaterial(isGhost), segments.length);
    const transform = new THREE.Object3D();
    const direction = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const radius = getSmallestAtomRadius() * 0.25;
    segments.forEach(([first, second], index) => {
        direction.subVectors(second, first);
        const length = direction.length();
        transform.position.copy(first).add(second).multiplyScalar(0.5);
        transform.quaternion.setFromUnitVectors(up, direction.normalize());
        transform.scale.set(radius, length, radius);
        transform.updateMatrix();
        bonds.setMatrixAt(index, transform.matrix);
    });
    bonds.instanceMatrix.needsUpdate = true;
    // The base cylinder's bounds do not include the positions of its instances.
    bonds.frustumCulled = false;
    bonds.castShadow = !isGhost;
    bonds.userData = isGhost ? { isGhost: true, isGhostBond: true } : { isBond: true };
    structureGroup.add(bonds);
}

function addPeriodicBoundaryBonds(buckets, bucketSize, addGhostBond) {
    const lattice = currentStructure.lattice;
    const preview = getPeriodicRepeats(currentStructure);
    const repeats = [preview.a, preview.b, preview.c];
    const periodicAxes = getPeriodicAxes(currentStructure);
    let plans;
    try {
        plans = CrystalGeometry.boundaryTranslationRanges(atomMeshes.map(atom => atom.position), lattice, repeats, periodicAxes, bucketSize);
        setGeometryWarning('bonds', '');
    } catch (error) {
        setGeometryWarning('bonds', error.message);
        return;
    }
    // Copies that are drawn (whole preview cells and boundary copies) already
    // bond through the ordinary pass; only undrawn translations need stubs.
    const copyKey = (originalIndex, offsets) => `${originalIndex}|${offsets.join(',')}`;
    const identity = (atom, index) => atom.userData.isGhost
        ? [atom.userData.originalIndex, ['a', 'b', 'c'].map(axis => atom.userData.cellOffset?.[axis] || 0)]
        : [atom.userData.atomIndex ?? index, [0, 0, 0]];
    const drawnCopies = new Set(atomMeshes.map((atom, index) => copyKey(...identity(atom, index))));
    for (let index = 0; index < atomMeshes.length; index++) {
        const atom = atomMeshes[index];
        const [originalIndex, baseOffset] = identity(atom, index);
        const shifts = plans[index].map(([first, last], axis) => {
            const values = [];
            for (let count = first; count <= last; count++) values.push(count * repeats[axis]);
            return values;
        });
        for (const ia of shifts[0]) for (const ib of shifts[1]) for (const ic of shifts[2]) {
            if (ia === 0 && ib === 0 && ic === 0) continue;
            const offset = [ia, ib, ic];
            if (drawnCopies.has(copyKey(originalIndex, offset.map((shift, axis) => baseOffset[axis] + shift)))) continue;
            const translated = new THREE.Vector3(...[0, 1, 2].map(axis =>
                atom.position.getComponent(axis) + offset.reduce((sum, count, vector) =>
                    sum + count * lattice[vector][axis], 0)
            ));
            const x = Math.floor(translated.x / bucketSize);
            const y = Math.floor(translated.y / bucketSize);
            const z = Math.floor(translated.z / bucketSize);
            for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
                for (const neighbor of buckets.get(`${x + dx},${y + dy},${z + dz}`) || []) {
                    const distance = translated.distanceTo(neighbor.position);
                    if (distance <= 0.5 || distance >= bucketSize) continue;
                    const clipped = CrystalGeometry.clipSegmentToCell(translated, neighbor.position, lattice, repeats, periodicAxes);
                    if (!clipped) continue;
                    addGhostBond(new THREE.Vector3(...clipped[0]), new THREE.Vector3(...clipped[1]));
                }
            }
        }
    }
}

// Rebuild fixed atom indicators (octahedrons/rings)
function rebuildFixedIndicators() {
    if (!currentStructure) return;
    
    // Remove existing fixed indicators
    const toRemove = [];
    structureGroup.children.forEach(child => {
        if (child.userData && child.userData.isFixedIndicator) {
            toRemove.push(child);
        }
    });
    toRemove.forEach(indicator => {
        structureGroup.remove(indicator);
        disposeObject3D(indicator);
    });
    
    // Rebuild fixed indicators if enabled
    if (settings.showFixedIndicators && supportsSelectiveDynamics(currentStructure)) {
        currentStructure.atoms.forEach((atom, index) => {
            const selectiveDynamics = atom.selectiveDynamics || [true, true, true];
            if (selectiveDynamics.some(v => v === false)) {
                const elemData = ELEMENT_DATA[atom.element] || ELEMENT_DATA.DEFAULT;
                const radius = elemData.radius * 0.4 * settings.atomScale;
                // Use the mesh position (which is updated during drag)
                const indicator = createFixedAtomIndicator(atomMeshes[index].position, radius, selectiveDynamics);
                structureGroup.add(indicator);
            }
        });
    }
}

// Rebuild atom index labels (subtle, camera-facing)
function rebuildLabels() {
    if (!currentStructure) return;
    
    // Remove existing labels
    const toRemove = [];
    structureGroup.children.forEach(child => {
        if (child.userData && child.userData.isAtomLabel) {
            toRemove.push(child);
        }
    });
    toRemove.forEach(label => {
        structureGroup.remove(label);
        disposeObject3D(label);
    });
    
    // Rebuild if enabled
    if (settings.showLabels) addAtomLabels();
    requestRender();
}

// A periodic copy is the same atom, so it carries that atom's number. The
// label remembers which mesh it follows and that mesh's picking identity.
function addAtomLabels() {
    atomMeshes.forEach((mesh, meshIndex) => {
        const number = (mesh.userData.isGhost ? mesh.userData.originalIndex : meshIndex) + 1;
        const label = createAtomLabel(number, mesh.position);
        Object.assign(label.userData, { meshIndex, atomIndex: mesh.userData.atomIndex });
        structureGroup.add(label);
    });
}

// Keep every glyph and its outline/shadow inside the fixed-size texture.
function setFittedLabelFont(ctx, text, preferredSize) {
    ctx.font = `bold ${preferredSize}px JetBrains Mono, monospace`;
    const textWidth = ctx.measureText(text).width;
    const availableWidth = ctx.canvas.width - 16;
    const fontSize = Math.max(1, Math.min(preferredSize, Math.floor(preferredSize * availableWidth / textWidth)));
    ctx.font = `bold ${fontSize}px JetBrains Mono, monospace`;
}

// Create a subtle, camera-facing label sprite for an atom
function updateAtomLabelPositions() {
    if (!settings.showLabels || !structureGroup) return;
    const height = renderer.domElement.clientHeight;
    if (!height) return;
    structureGroup.updateWorldMatrix(true, false);
    const facing = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const direction = new THREE.Vector3();
    // A numbered measurement marker is the atom's active annotation. Keeping
    // its index underneath creates two competing numbers when that marker
    // moves aside. Ordinary edit checkmarks do not replace atom indices.
    const numberedMeshes = new Set(selectedAtoms.filter((atom, index) => {
        const marker = selectionRings[index];
        return marker?.userData.isNumberedAtomMarker && marker.visible && marker.parent === measurementGroup;
    }).map(atom => atom.mesh));
    structureGroup.children.forEach(label => {
        if (!label.userData.isAtomLabel) return;
        const mesh = atomMeshes[label.userData.meshIndex ?? label.userData.atomIndex];
        if (!mesh) return;
        label.visible = !numberedMeshes.has(mesh);
        if (!label.visible) return;
        mesh.getWorldPosition(position);
        mesh.getWorldScale(scale);
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        const radius = mesh.geometry.boundingSphere.radius * Math.max(scale.x, scale.y, scale.z);
        if (camera.isOrthographicCamera) direction.copy(facing);
        else direction.copy(camera.position).sub(position).normalize();
        // Keep the text just outside its own sphere, while allowing nearer
        // atoms and bonds to obscure it through normal scene depth testing.
        position.addScaledVector(direction, radius * 1.001);
        label.position.copy(structureGroup.worldToLocal(position));
        const worldPerPixel = getAnnotationWorldPerPixel(label.getWorldPosition(position), height);
        if (worldPerPixel > 0) {
            // Size in CSS pixels, independent of display density. Preserve
            // natural proportions between a readable floor and a modest cap.
            const base = label.userData.labelBaseScale;
            const size = THREE.MathUtils.clamp(base.y / worldPerPixel, 24, 40) * worldPerPixel;
            label.scale.copy(base).multiplyScalar(size / base.y);
        }
    });
}

function createAtomLabel(indexNumber, position) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas (transparent)
    ctx.clearRect(0, 0, 128, 128);
    
    // Subtle text - no background, just the number
    const labelText = String(indexNumber);
    setFittedLabelFont(ctx, labelText, 72);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Subtle dark outline for visibility against light atoms
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.lineWidth = 8;
    ctx.strokeText(labelText, 64, 64);
    
    // Semi-transparent light text - visible but not distracting
    ctx.fillStyle = 'rgba(245, 245, 250, 0.95)';
    ctx.fillText(labelText, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        sizeAttenuation: true
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    
    // Scale based on smallest atom radius for consistency
    const smallestRadius = getSmallestAtomRadius();
    sprite.scale.set(smallestRadius * 2.5, smallestRadius * 2.5, 1);
    
    // Lower render order so selection markers appear on top
    sprite.renderOrder = -10;
    
    sprite.userData = { isAtomLabel: true, atomIndex: indexNumber - 1, meshIndex: indexNumber - 1, labelBaseScale: sprite.scale.clone() };
    
    return sprite;
}

// Delete selected atoms
function deleteSelectedAtoms() {
    if (selectedAtoms.length === 0) return;
    
    // Save for undo (unified undo stack)
    const deletedIndices = selectedAtoms.map(a => a.index).sort((a, b) => b - a);
    const deletedAtoms = deletedIndices.map(i => ({
        index: i,
        atom: { 
            ...currentStructure.atoms[i],
            position: { 
                x: currentStructure.atoms[i].position.x,
                y: currentStructure.atoms[i].position.y,
                z: currentStructure.atoms[i].position.z
            }
        }
    }));
    pushUndo({
        type: 'delete_atoms',
        deletedAtoms: deletedAtoms
    });
    
    // Remove atoms from structure (in reverse order to preserve indices)
    deletedIndices.forEach(index => {
        currentStructure.atoms.splice(index, 1);
    });
    
    // Recalculate element counts
    recalculateElementCounts();
    
    // Clear selection and re-render (don't track this clear in undo - it's part of delete)
    clearSelectionWithoutUndo();
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    // Update status
    statusText.textContent = `Deleted ${deletedIndices.length} atom(s)`;
    statusText.className = 'success';
}

function applySelectiveDynamicsChanges(changes) {
    if (!supportsSelectiveDynamics(currentStructure)) return 0;
    const changed = changes.filter(({ index, oldSD, newSD }) =>
        currentStructure.atoms[index] && oldSD.some((value, axis) => value !== newSD[axis]));
    if (changed.length === 0) return 0;
    pushUndo({ type: 'fix_atoms', changes: changed });
    changed.forEach(({ index, newSD }) => {
        currentStructure.atoms[index].selectiveDynamics = [...newSD];
    });
    currentStructure.hasSelectiveDynamics = currentStructure.atoms.some(atom =>
        atom.selectiveDynamics?.some(value => value === false));
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    return changed.length;
}

// Set selected atoms as fixed or active
function setSelectedAtomsFixed(isFixed) {
    if (selectedAtoms.length === 0 || !supportsSelectiveDynamics(currentStructure)) return;
    const flags = isFixed ? [false, false, false] : [true, true, true];
    const changedCount = applySelectiveDynamicsChanges(CrystalStructure.constraintChanges(currentStructure.atoms, selectedRealIndices(), flags));
    const action = isFixed ? 'Fixed' : 'Unfixed';
    statusText.textContent = changedCount ? `${action} ${changedCount} atom(s)` : 'Selected atoms already have those constraints';
    statusText.className = changedCount ? 'success' : '';
}

// A Cartesian / fractional choice as a pill pair; the radios keep their
// names so the handlers and tests see ordinary radio buttons.
function coordinateChoiceHTML(name, current) {
    const options = [['cartesian', 'Å'], ...(hasLattice(currentStructure) ? [['fractional', 'Fractional']] : [])];
    return `<div class="choice-pills" role="radiogroup" aria-label="Coordinate system">${options.map(([value, label]) =>
        `<label class="pill"><input type="radio" name="${name}" id="${name}${value === 'cartesian' ? 'Cartesian' : 'Fractional'}" value="${value}"${current === value ? ' checked' : ''}><span>${label}</span></label>`).join('')}</div>`;
}

// Shift the selected atoms by a vector (several atoms, or a kept measurement).
function moveBlockHTML() {
    const count = selectedAtoms.length;
    if (!count) return '';
    const cartesian = !hasLattice(currentStructure) || lastShiftCoordType === 'cartesian';
    const step = cartesian ? '0.1' : '0.01';
    const labels = cartesian ? ['Δx', 'Δy', 'Δz'] : ['Δa', 'Δb', 'Δc'];
    const error = getShiftSelectionError();
    return `
        <div class="exact-atom-section move-section">
            <div class="move-head">
                <div class="constraint-label">Move ${count} atom${count === 1 ? '' : 's'}</div>
                ${coordinateChoiceHTML('shiftCoordType', cartesian ? 'cartesian' : 'fractional')}
            </div>
            ${error ? `<div class="shift-target-hint">${error}</div>` : ''}
            <div class="shift-coords">
                ${['A', 'B', 'C'].map((axis, index) => `<div class="shift-input-group">
                    <label for="shift${axis}" id="shiftLabel${axis}">${labels[index]}</label>
                    <input type="number" id="shift${axis}" step="${step}" value="${lastShiftCoords[axis.toLowerCase()]}" class="shift-input">
                </div>`).join('')}
            </div>
            <div id="shiftError" class="add-atom-error"></div>
            <button id="applyShiftBtn" class="btn btn-shift">Shift ${count} atom${count === 1 ? '' : 's'}</button>
        </div>
    `;
}

// === SELECT BY RULE ===
// Bulk selection replaces the whole edit selection in one undoable step, so a
// thousand atoms do not cost a thousand history entries or visual rebuilds.

function selectedRealIndices() {
    if (!currentStructure) return [];
    return selectedAtoms.filter(atom => !atom.isGhost && currentStructure.atoms[atom.index]).map(atom => atom.index);
}

function elementIndices(element) {
    return currentStructure.atoms.map((atom, index) => atom.element === element ? index : -1).filter(index => index >= 0);
}

// Replace the edit selection with the given real atoms, recording one
// history entry. A preserved measurement is replaced rather than extended.
function setEditSelection(indices, type) {
    const atoms = currentStructure.atoms;
    const seen = new Set();
    const selected = [];
    for (const index of indices) {
        if (seen.has(index) || !atoms[index] || !atomMeshes[index] || atomMeshes[index].userData.isGhost) continue;
        seen.add(index);
        selected.push({ index, originalIndex: index, isGhost: false, cellOffset: null, element: atoms[index].element });
    }
    const selectionBefore = captureSelectionState();
    applySelectionState({ selected, isMeasurementSelection: false, mode: currentMode });
    pushUndo({ type, selectionBefore });
}

function reportSelection(message, changed) {
    statusText.textContent = `${message} (${selectedRealIndices().length} of ${currentStructure.atoms.length} selected)`;
    statusText.className = changed ? 'success' : '';
}

// Add real atoms to the selection; returns how many were new.
function addAtomsToSelection(indices, description) {
    if (!currentStructure) return 0;
    const current = isMeasurementSelection ? [] : selectedRealIndices();
    const already = new Set(current);
    const added = [...new Set(indices)].filter(index => currentStructure.atoms[index] && !already.has(index));
    if (!added.length) {
        reportSelection(indices.length ? `${description}: already selected` : `${description}: no atoms match`, false);
        return 0;
    }
    setEditSelection([...current, ...added], 'select_atom');
    reportSelection(`${description}: selected ${added.length} atom${added.length === 1 ? '' : 's'}`, true);
    return added.length;
}

function removeAtomsFromSelection(indices, description) {
    const wanted = new Set(indices);
    const current = selectedRealIndices();
    const remaining = current.filter(index => !wanted.has(index));
    const removed = current.length - remaining.length;
    if (!removed) {
        reportSelection(`${description}: none of those atoms are selected`, false);
        return 0;
    }
    setEditSelection(remaining, 'deselect_atom');
    reportSelection(`${description}: deselected ${removed} atom${removed === 1 ? '' : 's'}`, true);
    return removed;
}

// A chip adds its element, or removes it when every atom of that element is
// already selected; Alt+click always removes.
function toggleElementSelection(element, remove = false) {
    if (!currentStructure) return;
    const indices = elementIndices(element);
    const selected = new Set(isMeasurementSelection ? [] : selectedRealIndices());
    if (remove || (indices.length && indices.every(index => selected.has(index)))) removeAtomsFromSelection(indices, element);
    else addAtomsToSelection(indices, `All ${element}`);
}

function selectAllAtoms() {
    if (!currentStructure) return;
    addAtomsToSelection(currentStructure.atoms.map((_, index) => index), 'All atoms');
}

function invertSelection() {
    if (!currentStructure) return;
    const selected = new Set(isMeasurementSelection ? [] : selectedRealIndices());
    const inverse = currentStructure.atoms.map((_, index) => index).filter(index => !selected.has(index));
    setEditSelection(inverse, inverse.length ? 'select_atom' : 'clear_selection');
    reportSelection('Inverted the selection', true);
}

function defaultSelectRange() {
    return { axis: 2, unit: 'cartesian', min: '', max: '' };
}

// Read the range inputs back into lastSelectRange so a panel rebuild keeps
// what was typed. The unit is set by its radio handler.
function rememberSelectRange() {
    const range = { ...(lastSelectRange || defaultSelectRange()) };
    const axisText = String(document.getElementById('selectRangeAxis')?.value ?? '');
    const match = axisText.match(/^(?:(cartesian|fractional):)?([012])$/);
    if (match) {
        range.axis = Number(match[2]);
        if (match[1]) range.unit = match[1];
    }
    const min = document.getElementById('selectRangeMin');
    const max = document.getElementById('selectRangeMax');
    if (min) range.min = min.value;
    if (max) range.max = max.value;
    lastSelectRange = range;
    return range;
}

function selectRangeUsesFractional(range) {
    return range.unit === 'fractional' && hasLattice(currentStructure);
}

// The coordinates of every real atom along the range's axis.
function selectRangeValues(range) {
    const fractional = selectRangeUsesFractional(range);
    return currentStructure.atoms.map(atom => {
        if (!fractional) return [atom.position.x, atom.position.y, atom.position.z][range.axis];
        const coords = cartesianToFractional(atom.position, currentStructure.lattice);
        return coords ? coords[range.axis] : NaN;
    });
}

// The extent of the structure along the range's axis, as placeholder text:
// an empty bound is open, and the placeholder shows what that reaches.
function selectRangeExtent(range) {
    const values = selectRangeValues(range).filter(Number.isFinite);
    if (!values.length) return { min: 'min', max: 'max' };
    const digits = selectRangeUsesFractional(range) ? 3 : 2;
    const trim = value => String(Number(value.toFixed(digits)));
    return { min: trim(Math.min(...values)), max: trim(Math.max(...values)) };
}

function updateSelectRangePlaceholders() {
    if (!currentStructure) return;
    const extent = selectRangeExtent(lastSelectRange || defaultSelectRange());
    const min = document.getElementById('selectRangeMin');
    const max = document.getElementById('selectRangeMax');
    if (min) min.placeholder = extent.min;
    if (max) max.placeholder = extent.max;
}

// Select (or, with remove, deselect) every real atom whose coordinate along
// one axis lies in the typed range. Either end may be left empty.
function selectAtomsByRange(remove = false) {
    if (!currentStructure) return;
    const range = rememberSelectRange();
    const parse = text => {
        const trimmed = String(text ?? '').trim();
        if (!trimmed) return null;
        const value = Number(trimmed);
        return Number.isFinite(value) ? value : NaN;
    };
    const min = parse(range.min);
    const max = parse(range.max);
    const fractional = selectRangeUsesFractional(range);
    const axisName = (fractional ? ['a', 'b', 'c'] : ['x', 'y', 'z'])[range.axis];
    const errorBox = document.getElementById('selectRangeError');
    const fail = message => {
        if (errorBox) errorBox.textContent = message;
        statusText.textContent = message;
        statusText.className = 'error';
    };
    if (Number.isNaN(min) || Number.isNaN(max)) return fail('Range bounds must be numbers; leave an end empty for no bound');
    if (min === null && max === null) return fail('Enter at least one end of the range');
    let indices;
    try {
        indices = CrystalStructure.atomsInRange(selectRangeValues(range), min, max);
    } catch (error) {
        return fail(error.message);
    }
    if (errorBox) errorBox.textContent = '';
    const unit = fractional ? '' : ' Å';
    const bounds = min !== null && max !== null ? `${min} ≤ ${axisName} ≤ ${max}${unit}`
        : min !== null ? `${axisName} ≥ ${min}${unit}` : `${axisName} ≤ ${max}${unit}`;
    if (remove) removeAtomsFromSelection(indices, bounds);
    else addAtomsToSelection(indices, bounds);
}

function selectByRuleHTML() {
    const atoms = currentStructure.atoms;
    const selected = new Set(isMeasurementSelection ? [] : selectedRealIndices());
    const elements = currentStructure.elements?.length ? currentStructure.elements : [...new Set(atoms.map(atom => atom.element))];
    const chips = elements.map(element => {
        const indices = elementIndices(element);
        if (!indices.length) return '';
        const count = indices.filter(index => selected.has(index)).length;
        const state = count === 0 ? 'none' : count === indices.length ? 'all' : 'some';
        const verb = state === 'all' ? 'Deselect' : 'Select';
        return `<button type="button" id="elementChip-${element}" class="element-chip pill" data-element="${element}" data-state="${state}" style="--chip-color: ${elementColorHex(element)}" aria-pressed="${state === 'all'}" title="${verb} all ${indices.length} ${element} atom${indices.length === 1 ? '' : 's'} (Alt+click removes them)"><span class="chip-dot" aria-hidden="true"></span><span class="chip-element">${element}</span><span class="chip-count">${count && state !== 'all' ? `${count}/` : ''}${indices.length}</span></button>`;
    }).join('');
    const range = lastSelectRange || defaultSelectRange();
    const fractional = selectRangeUsesFractional(range);
    const step = fractional ? '0.01' : '0.5';
    const extent = selectRangeExtent(range);
    // One dropdown names the axis and, through it, the unit: x, y, z in Å
    // and a, b, c along the lattice vectors.
    const axisGroup = (unit, names, label) => `<optgroup label="${label}">${names.map((name, axis) =>
        `<option value="${unit}:${axis}"${(fractional ? 'fractional' : 'cartesian') === unit && range.axis === axis ? ' selected' : ''}>${name}</option>`).join('')}</optgroup>`;
    const axisOptions = axisGroup('cartesian', ['x', 'y', 'z'], 'Cartesian (Å)')
        + (hasLattice(currentStructure) ? axisGroup('fractional', ['a', 'b', 'c'], 'Fractional') : '');
    return `
        <div class="sd-batch-section select-rule-section">
            <div class="select-head">
                <div class="sd-batch-title">Select Atoms</div>
                <div class="select-set-actions" role="group" aria-label="Whole selection">
                    <button type="button" id="selectAllBtn" class="text-action">All</button>
                    <span class="text-action-sep" aria-hidden="true">·</span>
                    <button type="button" id="selectInvertBtn" class="text-action">Invert</button>
                    <span class="text-action-sep" aria-hidden="true">·</span>
                    <button type="button" id="selectNoneBtn" class="text-action"${selected.size ? '' : ' disabled'}>None</button>
                </div>
            </div>
            <div class="select-row">
                <span class="select-label">Element</span>
                <div class="element-chips" role="group" aria-label="Select by element">${chips}</div>
            </div>
            <div class="select-row">
                <span class="select-label">Region</span>
                <button type="button" id="boxSelectToggle" class="pill" aria-pressed="${boxSelectMode}" title="${boxSelectMode ? 'On: every left-drag on the canvas selects the atoms inside the rectangle; Alt+drag deselects; Esc cancels a box.' : 'Every left-drag on the canvas selects the atoms inside a rectangle. Shift+drag does the same at any time; Alt+Shift+drag deselects.'}">Box select</button>
            </div>
            <div class="select-row">
                <label class="select-label" for="selectRangeAxis">Range</label>
                <select id="selectRangeAxis" class="pill pill-select" aria-label="Axis and unit">${axisOptions}</select>
            </div>
            <div class="select-row select-row-indent">
                <div class="select-range-row">
                    <input type="number" id="selectRangeMin" class="pill pill-input" step="${step}" value="${range.min}" placeholder="${extent.min}" aria-label="Lower bound (empty: open)">
                    <span class="select-range-to" aria-hidden="true">–</span>
                    <input type="number" id="selectRangeMax" class="pill pill-input" step="${step}" value="${range.max}" placeholder="${extent.max}" aria-label="Upper bound (empty: open)">
                </div>
            </div>
            <button id="selectRangeBtn" class="btn btn-select select-range-btn" title="Select the atoms in this range (Alt+click deselects them)">Select in range</button>
            <div id="selectRangeError" class="add-atom-error"></div>
        </div>
    `;
}

// === BOX SELECTION ===
// A left-drag on the canvas, with Box select on or Shift held, draws a
// rectangle and selects the real atoms whose projected centres lie inside it,
// at any depth. The drag owns the pointer like an atom drag does, so the
// camera and atom-drag handlers stay out of the way.

function boxSelectOverlay() {
    let overlay = document.getElementById('boxSelectRect');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'boxSelectRect';
        overlay.hidden = true;
        viewport.appendChild(overlay);
    }
    return overlay;
}

function setBoxSelectMode(enabled) {
    const next = Boolean(enabled) && currentMode === 'edit';
    if (next === boxSelectMode) return;
    boxSelectMode = next;
    if (renderer?.domElement) renderer.domElement.style.cursor = boxSelectMode ? 'crosshair' : '';
    if (boxSelectMode) {
        statusText.textContent = 'Box select: drag a rectangle over the atoms to select them; Esc cancels';
        statusText.className = '';
    }
    if (currentMode === 'edit') updateEditUI();
}

function beginBoxSelect(event) {
    controls.enabled = false;
    event.preventDefault();
    event.stopPropagation();
    boxSelectDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, remove: Boolean(event.altKey) };
    captureEditPointer(event);
    drawBoxSelect();
}

function boxSelectRectangle() {
    const { startX, startY, x, y } = boxSelectDrag;
    return { left: Math.min(startX, x), top: Math.min(startY, y), right: Math.max(startX, x), bottom: Math.max(startY, y) };
}

function drawBoxSelect() {
    const overlay = boxSelectOverlay();
    const rect = boxSelectRectangle();
    const host = viewport.getBoundingClientRect();
    overlay.hidden = false;
    overlay.classList.toggle('remove', boxSelectDrag.remove);
    overlay.style.left = `${rect.left - host.left}px`;
    overlay.style.top = `${rect.top - host.top}px`;
    overlay.style.width = `${rect.right - rect.left}px`;
    overlay.style.height = `${rect.bottom - rect.top}px`;
}

function updateBoxSelect(event) {
    boxSelectDrag.x = event.clientX;
    boxSelectDrag.y = event.clientY;
    drawBoxSelect();
    const inside = atomsInBox(boxSelectRectangle());
    if (boxSelectDrag.remove) {
        const selected = new Set(selectedRealIndices());
        const count = inside.filter(index => selected.has(index)).length;
        statusText.textContent = `Box deselect: ${count} selected atom${count === 1 ? '' : 's'} inside`;
    } else {
        statusText.textContent = `Box select: ${inside.length} atom${inside.length === 1 ? '' : 's'} inside`;
    }
    statusText.className = '';
}

// Real atoms whose projected centre lies inside a client-space rectangle.
function atomsInBox(rect) {
    const canvasRect = renderer.domElement.getBoundingClientRect();
    camera.updateMatrixWorld();
    const point = new THREE.Vector3();
    const points = currentStructure.atoms.map((atom, index) => {
        const mesh = atomMeshes[index];
        if (!mesh || mesh.userData.isGhost) return null;
        mesh.getWorldPosition(point);
        point.project(camera);
        if (point.z < -1 || point.z > 1) return null;
        return { x: canvasRect.left + (point.x + 1) / 2 * canvasRect.width, y: canvasRect.top + (1 - point.y) / 2 * canvasRect.height };
    });
    return CrystalStructure.indicesInRectangle(points, rect);
}

function endBoxSelect() {
    boxSelectOverlay().hidden = true;
    boxSelectDrag = null;
    controls.enabled = true;
    releaseEditPointer();
}

function finishBoxSelect() {
    const rect = boxSelectRectangle();
    const remove = boxSelectDrag.remove;
    const tiny = rect.right - rect.left < 3 && rect.bottom - rect.top < 3;
    endBoxSelect();
    // A box too small to be a drag is a click: the click handler selects the
    // atom under the pointer as usual.
    if (tiny) return;
    wasDragging = true;
    const indices = atomsInBox(rect);
    if (!indices.length) {
        statusText.textContent = `Box ${remove ? 'deselect' : 'select'}: no atoms inside`;
        statusText.className = '';
        return;
    }
    if (remove) removeAtomsFromSelection(indices, 'Box');
    else addAtomsToSelection(indices, 'Box');
}

function cancelBoxSelect(reason) {
    endBoxSelect();
    wasDragging = true;
    statusText.textContent = reason === 'keydown' ? 'Box select canceled (Escape pressed)' : 'Box select canceled';
    statusText.className = '';
}

// === CONSTRAINTS ===

function constraintControlsHTML() {
    const indices = selectedRealIndices();
    const states = CrystalStructure.constraintAxisStates(currentStructure.atoms, indices);
    const toggles = ['x', 'y', 'z'].map((axis, index) => {
        const state = states[index];
        const next = state === 'fixed' ? 'free' : 'fix';
        const title = `${axis}: ${state === 'mixed' ? 'fixed for some selected atoms' : state}. Click to ${next} ${axis} for the selection.`;
        return `<button type="button" id="constraintAxis${axis.toUpperCase()}" class="axis-toggle" data-state="${state}" aria-pressed="${state === 'fixed' ? 'true' : state === 'mixed' ? 'mixed' : 'false'}" title="${title}"><span class="axis-name">${axis}</span><span class="axis-state">${state}</span></button>`;
    }).join('');
    return `
        <div class="constraint-controls">
            <div class="constraint-label">Constraints</div>
            <div class="sd-buttons">
                <button id="fixSelectedBtn" class="btn btn-fix" title="Fix selected atoms on all axes (F F F)">🔒 Fix</button>
                <button id="unfixSelectedBtn" class="btn btn-unfix" title="Free selected atoms on all axes (T T T)">🔓 Free</button>
            </div>
            <div class="constraint-axes" role="group" aria-label="Fix or free the selected atoms along each axis">${toggles}</div>
        </div>
    `;
}

// Toggle one axis for the selected atoms: fix it unless it is already fixed
// for every one of them, in which case free it.
function toggleConstraintAxis(axis) {
    if (!supportsSelectiveDynamics(currentStructure)) return;
    const indices = selectedRealIndices();
    if (!indices.length) return;
    const state = CrystalStructure.constraintAxisStates(currentStructure.atoms, indices)[axis];
    const flags = [null, null, null];
    flags[axis] = state === 'fixed';
    const changedCount = applySelectiveDynamicsChanges(CrystalStructure.constraintChanges(currentStructure.atoms, indices, flags));
    const name = 'xyz'[axis];
    statusText.textContent = changedCount
        ? `${state === 'fixed' ? 'Freed' : 'Fixed'} ${name} for ${changedCount} atom${changedCount === 1 ? '' : 's'}`
        : `Selected atoms already have that ${name} constraint`;
    statusText.className = changedCount ? 'success' : '';
}

function unfixAllAtoms() {
    if (!supportsSelectiveDynamics(currentStructure)) return;
    
    // Save old values for undo (unified undo stack)
    const changes = currentStructure.atoms.map((atom, index) => ({
        index: index,
        oldSD: [...(atom.selectiveDynamics || [true, true, true])],
        newSD: [true, true, true]
    }));
    const changedCount = applySelectiveDynamicsChanges(changes);
    statusText.textContent = changedCount ? 'All atoms set to active' : 'All atoms are already active';
    statusText.className = changedCount ? 'success' : '';
}

// Get selective dynamics statistics
function getSelectiveDynamicsStats() {
    if (!supportsSelectiveDynamics(currentStructure) || currentStructure.atoms.length === 0) return '';
    
    const summary = CrystalStructure.summarizeConstraints(currentStructure.atoms);
    return `${summary.fixed} fixed • ${summary.partial} partial • ${summary.free} free`;
}

// ============================================
// Global Periodic Shift Functions
// ============================================

function getShiftSelectionError() {
    return selectedAtoms.some(atom => atom.isGhost)
        ? 'Periodic copies cannot be moved. Clear the measurement or make a supercell first.'
        : '';
}

// Apply global periodic shift from UI inputs
// Context-aware periodic shift: shifts selected atoms if any, otherwise all atoms
function applyGlobalPeriodicShift() {
    if (!currentStructure) return;
    
    const errorDiv = document.getElementById('shiftError');
    errorDiv.textContent = '';
    errorDiv.className = 'add-atom-error';

    const selectionError = getShiftSelectionError();
    if (selectionError) {
        errorDiv.textContent = selectionError;
        return;
    }
    
    const values = ['shiftA', 'shiftB', 'shiftC'].map(id => document.getElementById(id).value.trim());
    const [val1, val2, val3] = values.map(value => value === '' ? 0 : Number(value));
    const coordType = document.querySelector('input[name="shiftCoordType"]:checked').value;
    if (![val1, val2, val3].every(Number.isFinite)) {
        errorDiv.textContent = 'Enter three finite shift values';
        return;
    }
    
    if (val1 === 0 && val2 === 0 && val3 === 0) {
        errorDiv.textContent = 'Enter a non-zero shift';
        return;
    }
    
    // Determine which atoms to shift (selected or all)
    const atomIndicesToShift = selectedAtoms.length > 0 
        ? selectedAtoms.map(a => a.index)
        : null; // null means shift all
    
    const targetDesc = selectedAtoms.length > 0 
        ? `${selectedAtoms.length} atom${selectedAtoms.length > 1 ? 's' : ''}`
        : 'all atoms';
    
    const previousCoords = lastShiftCoords;
    const previousType = lastShiftCoordType;
    lastShiftCoords = { a: val1, b: val2, c: val3 };
    lastShiftCoordType = coordType;
    const shifted = coordType === 'fractional'
        ? applyPeriodicShiftByFractional(val1, val2, val3, atomIndicesToShift)
        : applyPeriodicShiftByCartesian(val1, val2, val3, atomIndicesToShift);
    if (!shifted) {
        lastShiftCoords = previousCoords;
        lastShiftCoordType = previousType;
        errorDiv.textContent = 'Shift cannot be represented in this cell';
        return;
    }
    const result = document.getElementById('shiftError');
    result.textContent = shifted.changedCount
        ? `Shifted ${targetDesc} by (${val1.toFixed(2)}, ${val2.toFixed(2)}, ${val3.toFixed(2)}) ${coordType === 'fractional' ? 'frac' : 'Å'}`
        : 'Shift leaves atom positions unchanged';
    result.className = shifted.changedCount ? 'add-atom-error success' : 'add-atom-error';
}

// Apply periodic shift by Cartesian coordinates (Å)
// atomIndices: optional array of indices to shift (null = shift all)
function applyPeriodicShiftByCartesian(deltaX, deltaY, deltaZ, atomIndices = null) {
    return applyCartesianShift(new THREE.Vector3(deltaX, deltaY, deltaZ), atomIndices);
}

// Apply periodic shift by fractional coordinates
// atomIndices: optional array of indices to shift (null = shift all)
function applyPeriodicShiftByFractional(deltaA, deltaB, deltaC, atomIndices = null) {
    if (!currentStructure || !hasLattice(currentStructure)) return false;
    
    const lattice = currentStructure.lattice;
    
    // Convert fractional shift to Cartesian
    const shiftCartesian = new THREE.Vector3(
        deltaA * lattice[0][0] + deltaB * lattice[1][0] + deltaC * lattice[2][0],
        deltaA * lattice[0][1] + deltaB * lattice[1][1] + deltaC * lattice[2][1],
        deltaA * lattice[0][2] + deltaB * lattice[1][2] + deltaC * lattice[2][2]
    );
    
    return applyCartesianShift(shiftCartesian, atomIndices);
}

// A valid shift reports how many positions changed; invalid input returns false.
function applyCartesianShift(shiftCartesian, atomIndices) {
    if (!currentStructure || ![shiftCartesian.x, shiftCartesian.y, shiftCartesian.z].every(Number.isFinite)) return false;
    const indicesToShift = atomIndices ? [...new Set(atomIndices)] : currentStructure.atoms.map((_, index) => index);
    const periodic = hasLattice(currentStructure);
    const periodicAxes = getPeriodicAxes(currentStructure);
    const updates = [];
    for (const index of indicesToShift) {
        const atom = currentStructure.atoms[index];
        if (!atom) return false;
        let position = atom.position.clone().add(shiftCartesian);
        if (![position.x, position.y, position.z].every(Number.isFinite)) return false;
        let fractional = null;
        if (periodic) {
            fractional = cartesianToFractional(position, currentStructure.lattice);
            if (!fractional || fractional.some(value => !Number.isFinite(value))) return false;
            fractional = fractional.map((value, axis) => periodicAxes[axis] ? ((value % 1) + 1) % 1 : value);
            position = fractionalToCartesian(fractional, currentStructure.lattice);
            if (![position.x, position.y, position.z].every(Number.isFinite)) return false;
        }
        updates.push({ index, position, fractional });
    }
    const changedUpdates = updates.filter(({ index, position }) => currentStructure.atoms[index].position.distanceTo(position) >= 1e-10);
    if (changedUpdates.length === 0) {
        statusText.textContent = 'Shift leaves atom positions unchanged';
        statusText.className = '';
        return { changedCount: 0 };
    }
    const oldPositions = changedUpdates.map(({ index }) => currentStructure.atoms[index].position.clone());
    commitGeometryEdit({
        type: 'shift_atoms',
        atomIndices: changedUpdates.map(({ index }) => index),
        shiftVector: shiftCartesian.clone(),
        oldPositions
    }, changedUpdates);
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    const targetDesc = atomIndices ? `${indicesToShift.length} atom${indicesToShift.length > 1 ? 's' : ''}` : 'all atoms';
    statusText.textContent = `Shifted ${targetDesc}`;
    statusText.className = 'success';
    return { changedCount: changedUpdates.length };
}

// Center structure in the unit cell
function centerStructureInCell() {
    if (!hasLattice(currentStructure) || currentStructure.atoms.length === 0) return;
    
    const lattice = currentStructure.lattice;
    const fractionalPositions = currentStructure.atoms.map(atom => {
        const frac = cartesianToFractional(atom.position, lattice);
        return frac && frac.every(Number.isFinite) ? frac : null;
    });
    if (fractionalPositions.some(frac => !frac)) {
        statusText.textContent = 'Cannot center atoms in this cell';
        statusText.className = 'error';
        return;
    }
    const center = CrystalGeometry.periodicFractionalCenter(fractionalPositions, getPeriodicAxes(currentStructure));
    const [deltaA, deltaB, deltaC] = center.map(value => 0.5 - value);
    
    const shifted = applyPeriodicShiftByFractional(deltaA, deltaB, deltaC);
    if (!shifted) {
        statusText.textContent = 'Cannot center atoms in this cell';
        statusText.className = 'error';
        return;
    }
    
    const errorDiv = document.getElementById('shiftError');
    if (errorDiv) {
        errorDiv.textContent = shifted.changedCount ? 'Structure centered in cell' : 'Structure is already centered in cell';
        errorDiv.className = shifted.changedCount ? 'add-atom-error success' : 'add-atom-error';
    }
    statusText.textContent = shifted.changedCount ? 'Structure centered in cell' : 'Structure is already centered in cell';
}

// Add atom from input form
function addAtomFromInput() {
    if (!currentStructure) return;
    
    const errorDiv = document.getElementById('addAtomError');
    errorDiv.textContent = '';
    errorDiv.className = 'add-atom-error';
    
    // Get input values
    const element = document.getElementById('addAtomElement').value;
    const xInput = document.getElementById('addAtomX').value;
    const yInput = document.getElementById('addAtomY').value;
    const zInput = document.getElementById('addAtomZ').value;
    const coordType = document.querySelector('input[name="coordType"]:checked').value;
    
    // Validate element
    if (!element || element.trim() === '') {
        errorDiv.textContent = 'Please select an element';
        return;
    }
    
    // Validate coordinates are numbers
    const x = Number(xInput);
    const y = Number(yInput);
    const z = Number(zInput);
    
    if ([xInput, yInput, zInput].some(value => value.trim() === '') || ![x, y, z].every(Number.isFinite)) {
        errorDiv.textContent = 'Invalid coordinates';
        return;
    }
    
    // Check for unreasonable values
    if (Math.abs(x) > 1000 || Math.abs(y) > 1000 || Math.abs(z) > 1000) {
        errorDiv.textContent = 'Coordinates too large';
        return;
    }
    
    let cartesianPos;
    let fractionalPos;
    
    if (coordType === 'fractional') {
        // Only periodic axes wrap into the unit cell.
        if ([x, y, z].some((value, axis) => getPeriodicAxes(currentStructure)[axis] && (value < 0 || value > 1))) {
            errorDiv.textContent = 'Periodic fractional coords must be in [0, 1]';
            return;
        }
        
        fractionalPos = [x, y, z];
        cartesianPos = fractionalToCartesian(fractionalPos, currentStructure.lattice);
    } else {
        // Cartesian coordinates - validate within cell
        cartesianPos = new THREE.Vector3(x, y, z);
        
        if (hasLattice(currentStructure)) {
            const validation = isPositionInCell(cartesianPos, currentStructure.lattice, getPeriodicAxes(currentStructure));
            if (!validation.valid) {
                errorDiv.textContent = validation.message;
                return;
            }
            fractionalPos = validation.fractional;
        } else {
            fractionalPos = null;
        }
    }
    try {
        const [prepared] = CrystalDocument.preparePositions(currentStructure, [cartesianPos]);
        fractionalPos = prepared.fractional;
    } catch {
        errorDiv.textContent = 'Coordinates cannot be represented in this cell';
        return;
    }
    
    // Remember form values for next time
    lastAddAtomElement = element;
    lastAddAtomCoords = { x, y, z };
    lastAddAtomCoordType = coordType;
    
    // Add the atom
    const newAtom = {
        element: element,
        position: cartesianPos instanceof THREE.Vector3 ? cartesianPos : new THREE.Vector3(cartesianPos.x, cartesianPos.y, cartesianPos.z),
        fractional: fractionalPos,
        selectiveDynamics: [true, true, true] // New atoms are active by default
    };
    
    let prepared;
    try {
        prepared = CrystalDocument.prepareNewAtom(currentStructure, newAtom, document.getElementById('addAtomSpecies')?.value || null);
    } catch (error) {
        errorDiv.textContent = error.message;
        return;
    }
    if (prepared.newGroup) currentStructure.speciesGroups.push(prepared.newGroup);
    lastAddAtomSpecies = prepared.atom.speciesId;
    currentStructure.nextAtomId = prepared.nextAtomId;
    currentStructure.nextSpeciesId = prepared.nextSpeciesId;
    currentStructure.atoms.push(prepared.atom);
    const newIndex = currentStructure.atoms.length - 1;
    
    // Save for undo (unified undo stack)
    pushUndo({
        type: 'add_atom',
        index: newIndex,
        newGroupId: prepared.newGroup?.id || null
    });
    
    // Recalculate element counts
    recalculateElementCounts();
    
    // Re-render
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    // Show success message
    const result = document.getElementById('addAtomError');
    result.textContent = `Added ${element} at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;
    result.className = 'add-atom-error success';
    
    statusText.textContent = `Added ${element} atom`;
    statusText.className = 'success';
}

// Convert fractional coordinates to Cartesian
function fractionalToCartesian(frac, lattice) {
    return new THREE.Vector3(...CrystalGeometry.fractionalToCartesian(frac, lattice));
}

// Convert Cartesian coordinates to fractional
function cartesianToFractional(pos, lattice) {
    return CrystalGeometry.cartesianToFractional(pos, lattice);
}

// Check if Cartesian position is within unit cell (fractional coords in [0, 1])
function isPositionInCell(pos, lattice, periodicAxes = [true, true, true]) {
    const frac = cartesianToFractional(pos, lattice);
    
    if (!frac) {
        return { valid: false, message: 'Invalid lattice' };
    }
    
    const tolerance = 1e-6; // Small tolerance for boundary
    const [fx, fy, fz] = frac;
    
    // Check if fractional coordinates are in [0, 1] with small tolerance
    if (periodicAxes[0] && (fx < -tolerance || fx > 1 + tolerance)) {
        return { valid: false, message: `Outside cell: x (frac=${fx.toFixed(3)})` };
    }
    if (periodicAxes[1] && (fy < -tolerance || fy > 1 + tolerance)) {
        return { valid: false, message: `Outside cell: y (frac=${fy.toFixed(3)})` };
    }
    if (periodicAxes[2] && (fz < -tolerance || fz > 1 + tolerance)) {
        return { valid: false, message: `Outside cell: z (frac=${fz.toFixed(3)})` };
    }
    
    // Clamp to [0, 1] for atoms exactly on boundary
    const clampedFrac = frac.map((value, axis) => periodicAxes[axis] ? Math.max(0, Math.min(1, value)) : value);
    
    return { valid: true, fractional: clampedFrac };
}

// Recalculate element counts after deletion
function recalculateElementCounts() {
    CrystalDocument.recalculateCounts(currentStructure);
}

// Select an atom (mode-aware)
// For ghost atoms, atomIndex is a string like "ghost_0_100"
function selectAtom(mesh, atomIndex, skipUndo = false) {
    if (selectedAtoms.some(atom => atom.mesh === mesh)) return;
    if ((currentMode === 'measure' || isMeasurementSelection) && selectedAtoms.length >= 3) return;
    const selectionBefore = captureSelectionState();
    const isGhost = mesh.userData.isGhost;
    let element, originalIndex, cellOffset;
    
    if (isGhost) {
        element = mesh.userData.element;
        originalIndex = mesh.userData.originalIndex;
        cellOffset = mesh.userData.cellOffset;
    } else {
        const atom = currentStructure.atoms[atomIndex];
        element = atom.element;
        originalIndex = atomIndex;
        cellOffset = null;
    }
    
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    
    const atomData = {
        mesh: mesh,
        index: atomIndex,
        originalIndex: originalIndex,
        element: element,
        position: worldPos.clone(),
        isGhost: isGhost,
        cellOffset: cellOffset
    };
    
    selectedAtoms.push(atomData);
    
    // Save for undo (unified undo stack)
    if (!skipUndo) {
        pushUndo({
            type: 'select_atom',
            selectionBefore
        });
    }
    
    // Track whether this is a measurement selection
    if (currentMode === 'measure') {
        isMeasurementSelection = true;
    }
    
    // Highlight the selected atom (lighten it)
    highlightAtomMesh(mesh);
    
    // Create appropriate visual based on current mode
    createSelectionVisual(mesh, selectedAtoms.length, isGhost);
}

// Highlight an atom mesh (lighten it with emissive glow)
function highlightAtomMesh(mesh) {
    setAtomGlow(mesh, 0xffffff, 0.35);
}

// Remove highlight from an atom mesh
function unhighlightAtomMesh(mesh) {
    setAtomGlow(mesh, 0, 0);
}

// Create selection visual based on current mode
function createSelectionVisual(mesh, selectionNumber, isGhost = false) {
    // Use measurement visuals if in measure mode OR if preserving a measurement in edit mode
    if (currentMode === 'measure' || isMeasurementSelection) {
        createSelectionRing(mesh, selectionNumber, isGhost);
    } else {
        createEditSelectionMarker(mesh, selectionNumber);
    }
    requestRender();
}

// Rebuild all selection visuals (used after mode change or re-render)
function rebuildSelectionVisuals() {
    clearMeasurementVisuals();
    selectedAtoms.forEach((atom, i) => {
        // Reapply highlight to selected atoms
        highlightAtomMesh(atom.mesh);
        // Use measurement visuals if this is a preserved measurement, otherwise mode-appropriate
        if (isMeasurementSelection || currentMode === 'measure') {
            createSelectionRing(atom.mesh, i + 1, atom.isGhost);
        } else {
            createEditSelectionMarker(atom.mesh, i + 1);
        }
    });
    
    // Show measurement lines/arcs if in measure mode OR if preserving measurement in edit mode
    if (currentMode === 'measure' || isMeasurementSelection) {
        updateMeasurements();
    }
}

// Update selection visual positions (called during atom drag to move labels with atoms)
function updateSelectionVisualPositions() {
    // Update each selection ring/marker position to match its atom
    selectionRings.forEach((sprite, i) => {
        if (i < selectedAtoms.length && selectedAtoms[i].mesh) {
            const worldPos = new THREE.Vector3();
            selectedAtoms[i].mesh.getWorldPosition(worldPos);
            sprite.position.copy(worldPos);
            if (sprite.userData.annotationAnchor) sprite.userData.annotationAnchor.copy(worldPos);
            // Also update the stored position in selectedAtoms
            selectedAtoms[i].position.copy(worldPos);
        }
    });
}

// Deselect an atom by its index in selectedAtoms array
function deselectAtom(selectedIndex, skipUndo = false) {
    if (!selectedAtoms[selectedIndex]) return;
    const selectionBefore = captureSelectionState();
    // Remove highlight from deselected atom
    const atom = selectedAtoms[selectedIndex];
    if (atom && atom.mesh) {
        unhighlightAtomMesh(atom.mesh);
    }
    
    // Save for undo (unified undo stack)
    if (!skipUndo && atom) {
        pushUndo({
            type: 'deselect_atom',
            selectionBefore
        });
    }
    
    selectedAtoms.splice(selectedIndex, 1);
    if (!selectedAtoms.length) isMeasurementSelection = false;
    rebuildSelectionVisuals();
}

// Clear all selections
function clearSelection(skipUndo = false) {
    // Only save to undo if there's something to clear
    if (!skipUndo && selectedAtoms.length > 0) {
        pushUndo({ type: 'clear_selection', selectionBefore: captureSelectionState() });
    }
    
    // Remove highlight from all selected atoms
    selectedAtoms.forEach(atom => {
        if (atom && atom.mesh) {
            unhighlightAtomMesh(atom.mesh);
        }
    });
    
    selectedAtoms = [];
    isMeasurementSelection = false; // Reset measurement state
    clearMeasurementVisuals();
    updateUI_forCurrentMode();
}

// Clear selection without adding to undo stack (used when clear is part of another operation)
function clearSelectionWithoutUndo() {
    clearSelection(true);
}

// Update the correct UI based on current mode
function updateUI_forCurrentMode() {
    if (currentMode === 'measure') {
        updateMeasurementUI();
    } else {
        updateEditUI();
    }
}

// Clear visual measurement objects
function clearMeasurementVisuals() {
    setGeometryWarning('measurement', '');
    while (measurementGroup.children.length > 0) {
        const child = measurementGroup.children[0];
        measurementGroup.remove(child);
        disposeObject3D(child);
    }
    selectionRings = [];
    requestRender();
}

function disposeObject3D(object) {
    const resources = new Set();
    object.traverse(child => {
        if (child.geometry) resources.add(child.geometry);
        const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
        materials.forEach(material => {
            for (const value of Object.values(material)) {
                if (value && value.isTexture) resources.add(value);
            }
            resources.add(material);
        });
    });
    resources.forEach(resource => {
        if (!sharedRenderResources.has(resource)) resource.dispose();
    });
}

// Get the smallest atom radius in the current structure
function getSmallestAtomRadius() {
    if (!currentStructure) return 0.3;
    if (smallestAtomRadiusCache && smallestAtomRadiusCache.structure === currentStructure
        && smallestAtomRadiusCache.scale === settings.atomScale
        && smallestAtomRadiusCache.count === currentStructure.atoms.length) {
        return smallestAtomRadiusCache.value;
    }
    
    let minRadius = Infinity;
    currentStructure.atoms.forEach(atom => {
        const elemData = ELEMENT_DATA[atom.element] || ELEMENT_DATA.DEFAULT;
        const radius = elemData.radius * 0.4 * settings.atomScale;
        if (radius < minRadius) {
            minRadius = radius;
        }
    });
    
    const value = Number.isFinite(minRadius) ? minRadius : 0.3;
    smallestAtomRadiusCache = {
        structure: currentStructure,
        scale: settings.atomScale,
        count: currentStructure.atoms.length,
        value
    };
    return value;
}

// Create selection label directly on atom center (no ring)
// Each marker stays smaller than the atom it identifies.
// isGhost: if true, creates a dashed circle style for ghost atoms
function createSelectionRing(atomMesh, selectionNumber, isGhost = false) {
    const worldPos = new THREE.Vector3();
    atomMesh.getWorldPosition(worldPos);
    
    // Create sprite with canvas texture - small label on atom center
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const baseColor = selectionNumber === 1 ? 'rgba(0, 245, 212, 0.95)' : 
                      selectionNumber === 2 ? 'rgba(241, 91, 181, 0.95)' : 
                      'rgba(254, 228, 64, 0.95)';
    
    const solidColor = selectionNumber === 1 ? '#00f5d4' : 
                       selectionNumber === 2 ? '#f15bb5' : 
                       '#fee440';
    
    if (isGhost) {
        // Dashed circle for ghost atoms - hollow with dashed border
        ctx.beginPath();
        ctx.arc(32, 32, 24, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fill();
        
        // Dashed border
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = solidColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw number with prime indicator
        ctx.fillStyle = solidColor;
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectionNumber.toString(), 28, 33);
        
        // Small apostrophe/prime
        ctx.font = 'bold 18px Outfit, sans-serif';
        ctx.fillText("'", 44, 24);
    } else {
        // Solid circle for real atoms
        ctx.beginPath();
        ctx.arc(32, 32, 24, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        
        // Add thin white border for visibility
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw number - bold and clear
        ctx.fillStyle = '#000';
        ctx.font = 'bold 32px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectionNumber.toString(), 32, 33);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,  // Always render on top
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(worldPos);
    
    // Start proportional to the atom; the screen-size floor keeps its number readable.
    const labelSize = getSelectionLabelSize(atomMesh.userData.element);
    sprite.scale.set(labelSize, labelSize, labelSize);
    
    sprite.renderOrder = 999; // Render last (on top)
    sprite.userData.isSelectionLabel = true;
    sprite.userData.isNumberedAtomMarker = true;
    sprite.userData.annotationColor = getSelectionColor(selectionNumber);
    
    measurementGroup.add(sprite);
    selectionRings.push(sprite);
}

// Get color for selection number
function getSelectionColor(num) {
    const colors = [0x00f5d4, 0xf15bb5, 0xfee440]; // cyan, pink, yellow
    return colors[(num - 1) % colors.length];
}

// Get hex color string for selection number
function getSelectionColorHex(num) {
    const colors = ['#00f5d4', '#f15bb5', '#fee440']; // cyan, pink, yellow
    return colors[(num - 1) % colors.length];
}

// Update measurement visuals (lines, arcs, and floating labels)
function updateMeasurements() {
    const toRemove = measurementGroup.children.filter(child => child.userData.isMeasurementVisual);
    toRemove.forEach(object => {
        measurementGroup.remove(object);
        disposeObject3D(object);
    });
    const geometry = getMeasurementGeometry();
    geometry.pairs.forEach((pair, index) => {
        if (pair.unavailable) return;
        drawMeasurementLine(pair.start, pair.end, overlayInk().measure[index === 0 ? 0 : 1]);
        const midpoint = pair.start.clone().multiplyScalar(0.5).addScaledVector(pair.end, 0.5);
        const label = createFloatingDistanceLabel(midpoint, pair.distance);
        label.userData.annotationSegment = [pair.start.clone(), pair.end.clone()];
    });
    if (geometry.angle) {
        const arc = drawAngleArc(geometry.angle);
        const label = createFloatingAngleLabel(arc.labelPosition, geometry.angle.angleDeg);
        label.userData.annotationVertex = geometry.angle.vertex.clone();
    }
    requestRender();
}

// Keep annotation text readable in CSS pixels as the camera and panel change.
// Markers and captions both stay within a readable size range: a floor so they
// survive zooming out, a cap so zooming in does not turn them into headlines.
// Measured positions are left untouched.
function updateAnnotationSizes() {
    if (!measurementGroup || !renderer || !camera) return;
    const height = renderer.domElement.clientHeight;
    if (!height) return;
    camera.updateMatrixWorld();
    for (const sprite of measurementGroup.children) {
        if (sprite.userData.isSelectionLabel) {
            const selected = selectedAtoms[selectionRings.indexOf(sprite)];
            if (selected?.mesh) {
                const anchor = sprite.userData.annotationAnchor || (sprite.userData.annotationAnchor = new THREE.Vector3());
                selected.mesh.getWorldPosition(anchor);
                measurementGroup.worldToLocal(anchor);
                sprite.position.copy(anchor);
            }
        } else if (sprite.userData.isMeasurementLabel) {
            const anchor = sprite.userData.annotationAnchor || (sprite.userData.annotationAnchor = sprite.position.clone());
            sprite.position.copy(anchor);
        }
        const minimumPixels = sprite.userData.isMeasurementLabel ? 18
            : sprite.userData.isSelectionLabel ? 14 : 0;
        if (!minimumPixels) continue;
        const base = sprite.userData.annotationBaseScale || (sprite.userData.annotationBaseScale = sprite.scale.clone());
        const worldPerPixel = getAnnotationWorldPerPixel(sprite.getWorldPosition(new THREE.Vector3()), height);
        const maximumPixels = sprite.userData.isSelectionLabel ? 32 : 26;
        const upperFactor = Math.min(1, maximumPixels * worldPerPixel / base.y);
        const factor = Math.max(upperFactor, minimumPixels * worldPerPixel / base.y);
        sprite.scale.copy(base).multiplyScalar(factor);
        sprite.userData.annotationWorldPerPixel = worldPerPixel;
    }
    positionMeasurementLabels();
}

function getAnnotationWorldPerPixel(position, height) {
    if (camera.isOrthographicCamera) return (camera.top - camera.bottom) / (camera.zoom * height);
    const depth = -position.clone().applyMatrix4(camera.matrixWorldInverse).z;
    return depth > 0 ? 2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / (camera.zoom * height) : 0;
}

function positionMeasurementLabels() {
    const width = renderer.domElement.clientWidth, height = renderer.domElement.clientHeight;
    if (!width || !height) return;
    const toScreen = point => {
        const p = point.clone().project(camera);
        return { x: (p.x + 1) * width / 2, y: (1 - p.y) * height / 2 };
    };
    const screenRect = sprite => {
        const point = sprite.getWorldPosition(new THREE.Vector3()).project(camera);
        const unit = sprite.userData.annotationWorldPerPixel;
        if (!(unit > 0) || !Number.isFinite(unit) || ![point.x, point.y, point.z, sprite.scale.x / unit, sprite.scale.y / unit].every(Number.isFinite) || Math.abs(point.x) > 1 || Math.abs(point.y) > 1 || Math.abs(point.z) > 1) return null;
        return { x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2,
            width: sprite.scale.x / unit, height: sprite.scale.y / unit, depth: point.z };
    };
    const labels = measurementGroup.children.filter(sprite => sprite.userData.isMeasurementLabel);
    const items = labels.map(sprite => ({ sprite, rect: screenRect(sprite) })).filter(item => item.rect);
    if (!items.length) return;
    const world = point => measurementGroup.localToWorld(point.clone());
    const unitVector = (x, y) => { const length = Math.hypot(x, y); return length > 1e-6 ? { x: x / length, y: y / length } : { x: 0, y: -1 }; };
    // Point markers always sit on their atoms. Captions sit on their anchors
    // (set by updateAnnotationSizes) and move only to clear another caption:
    // a distance slides across its line, the angle slides out along its
    // bisector and also keeps clear of the vertex marker.
    const vertexMarker = selectionRings[1] ? screenRect(selectionRings[1]) : null;
    const requests = items.map(({ sprite, rect }) => {
        const { annotationSegment: segment, annotationVertex: vertex } = sprite.userData;
        if (vertex) {
            const from = toScreen(world(vertex));
            return { ...rect, slide: unitVector(rect.x - from.x, rect.y - from.y), flip: false, obstacles: vertexMarker ? [vertexMarker] : [] };
        }
        if (segment) {
            const a = toScreen(world(segment[0])), b = toScreen(world(segment[1]));
            return { ...rect, slide: unitVector(-(b.y - a.y), b.x - a.x), flip: true, obstacles: [] };
        }
        return { ...rect, slide: { x: 0, y: -1 }, flip: true, obstacles: [] };
    });
    // A 6 px gap keeps captions visibly apart after sub-pixel rounding.
    const placed = CrystalAnnotations.separateLabels(requests, 6);
    items.forEach(({ sprite, rect }, index) => {
        const target = placed[index];
        if (Math.hypot(target.x - rect.x, target.y - rect.y) < .01) return;
        sprite.position.copy(measurementGroup.worldToLocal(new THREE.Vector3(target.x / width * 2 - 1, 1 - target.y / height * 2, rect.depth).unproject(camera)));
    });
}

function getSelectionLabelSize(element) {
    const radius = (ELEMENT_DATA[element] || ELEMENT_DATA.DEFAULT).radius;
    return radius * 0.4 * settings.atomScale * 1.4;
}

// Only the measured atoms determine the size of their measurement text.
function getFloatingLabelSize() {
    return selectedAtoms.length
        ? Math.min(...selectedAtoms.map(atom => getSelectionLabelSize(atom.element)))
        : getSmallestAtomRadius() * 1.4;
}

// Helper: Draw rounded rectangle on canvas
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Create floating distance label (clean text, always faces camera)
function createFloatingDistanceLabel(position, distance) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Text with subtle shadow for visibility
    const labelText = `${distance.toFixed(3)} Å`;
    setFittedLabelFont(ctx, labelText, 24);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow for contrast against any background
    ctx.shadowColor = overlayInk().shadow;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillStyle = overlayInk().text;
    ctx.fillText(labelText, 64, 16);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    
    // Size proportional to selection labels
    const labelSize = getFloatingLabelSize();
    sprite.scale.set(labelSize * 2.2, labelSize * 0.55, 1);
    sprite.renderOrder = 998;
    sprite.userData.isMeasurementLabel = true;
    sprite.userData.isMeasurementVisual = true;
    
    measurementGroup.add(sprite);
    return sprite;
}

// Create floating angle label (clean text, always faces camera)
function createFloatingAngleLabel(position, angleDeg) {
    const canvas = document.createElement('canvas');
    // Reserve room for ordinary three-digit angles at the intended font size.
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Text with subtle shadow for visibility
    const labelText = `${angleDeg.toFixed(1)}°`;
    setFittedLabelFont(ctx, labelText, 24);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow for contrast
    ctx.shadowColor = overlayInk().shadow;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillStyle = overlayInk().text;
    ctx.fillText(labelText, canvas.width / 2, 16);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    
    // Size proportional to selection labels
    const labelSize = getFloatingLabelSize();
    sprite.scale.set(labelSize * 0.6 * canvas.width / canvas.height, labelSize * 0.6, 1);
    sprite.renderOrder = 998;
    sprite.userData.isMeasurementLabel = true;
    sprite.userData.isMeasurementVisual = true;
    
    measurementGroup.add(sprite);
    return sprite;
}

// Draw a dashed line between two points
function drawMeasurementLine(pos1, pos2, color) {
    const points = [pos1, pos2];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 0.12,
        gapSize: 0.08,
        linewidth: 2,
        transparent: true,
        opacity: 0.8
    });
    
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.userData.isMeasurementLine = true;
    line.userData.isMeasurementVisual = true;
    
    measurementGroup.add(line);
}

// Draw angle arc between three points - returns label position data
// Arc radius scales based on the MIDDLE atom (vertex = atom 2 in angle 1-2-3)
function drawAngleArc(angleData) {
    const { vertex, angleDeg } = angleData;
    const v1 = new THREE.Vector3(...angleData.firstDirection);
    const v2 = new THREE.Vector3(...angleData.thirdDirection);
    const angle = angleDeg * Math.PI / 180;
    const normal = new THREE.Vector3().crossVectors(v1, v2);
    if (normal.length() < 1e-8) {
        // Collinear arms still have valid 0°/180° values. Choose a stable plane
        // and obtain the label from its half-angle rather than a zero bisector.
        const references = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
        references.sort((a, b) => Math.abs(v1.dot(a)) - Math.abs(v1.dot(b)));
        normal.crossVectors(v1, references[0]);
    }
    normal.normalize();
    const vertexElement = selectedAtoms[1].element;
    const middleAtomRadius = (ELEMENT_DATA[vertexElement] || ELEMENT_DATA.DEFAULT).radius * 0.4 * settings.atomScale;
    const arcRadius = middleAtomRadius * 1.6;
    const points = Array.from({ length: 33 }, (_, index) =>
        v1.clone().applyAxisAngle(normal, angle * index / 32).multiplyScalar(arcRadius).add(vertex));
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: overlayInk().line, linewidth: 2, transparent: true, opacity: 0.9 }));
    arc.userData = { isMeasurementArc: true, isMeasurementVisual: true };
    measurementGroup.add(arc);
    return { labelPosition: v1.clone().applyAxisAngle(normal, angle / 2).multiplyScalar(arcRadius * 1.8).add(vertex) };
}

function measurementPointLabel(index) {
    return `${index + 1}${selectedAtoms[index].isGhost ? "′" : ''}`;
}

// Update measurement panel in UI with proper multi-color strips
function updateMeasurementUI() {
    const panel = document.getElementById('measurementPanel');
    if (!panel) return;
    
    const geometry = getMeasurementGeometry();
    const colors = ['#00f5d4', '#f15bb5', '#fee440']; // cyan, pink, yellow
    let html = '';
    
    if (selectedAtoms.length === 0) {
        html += '<p class="placeholder-text">Click atoms to measure</p>';
    } else {
        // List selected atoms
        html += '<div class="selected-atoms">';
        selectedAtoms.forEach((atom, i) => {
            const offsetLabel = atom.isGhost ? getCellOffsetLabel(atom.cellOffset) : '';
            const ghostClass = atom.isGhost ? ' ghost' : '';
            const displayIndex = atom.isGhost ? atom.originalIndex + 1 : atom.index + 1;
            
            // Get formatted coordinates (clickable to toggle between fractional/cartesian)
            const coordsHtml = formatAtomCoordinates(atom, i);
            
            html += `
                <div class="selected-atom${ghostClass}">
                    <div class="color-strip" style="background: ${colors[i]}${atom.isGhost ? '; border-style: dashed' : ''}"></div>
                    <span class="sel-num${ghostClass}" style="background: ${atom.isGhost ? 'transparent; border: 2px dashed ' + colors[i] + '; color: ' + colors[i] : colors[i]}">${i + 1}${atom.isGhost ? "'" : ''}</span>
                    <span class="sel-elem">${atom.element}</span>
                    <span class="sel-idx">#${displayIndex}${offsetLabel ? ' ' + offsetLabel : ''}</span>
                    ${coordsHtml}
                </div>
            `;
        });
        html += '</div>';
        
        // Show measurements
        if (selectedAtoms.length >= 2) {
            const pair = geometry.pairs[0];
            // Build label with ghost indicators
            const label1 = measurementPointLabel(0);
            const label2 = measurementPointLabel(1);
            
            // Fractional delta for distance 1-2
            const deltaHtml12 = formatDelta(selectedAtoms[0], selectedAtoms[1], geometry);
            
            // Distance 1-2: two color strips (cyan + pink)
            html += `
                <div class="measurement-result">
                    <div class="multi-color-strip">
                        <div class="strip-segment" style="background: ${colors[0]}"></div>
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Distance (${label1}—${label2})</span>
                        <span class="meas-value">${formatMeasuredDistance(pair)}</span>
                        ${deltaHtml12}
                    </div>
                </div>
            `;
        }
        
        if (selectedAtoms.length === 3) {
            const angle = geometry.angle;
            
            // Build labels with ghost indicators
            const label1 = measurementPointLabel(0);
            const label2 = measurementPointLabel(1);
            const label3 = measurementPointLabel(2);
            
            // Distance 2-3: two color strips (pink + yellow)
            const pair = geometry.pairs[1];
            
            // Fractional delta for distance 2-3
            const deltaHtml23 = formatDelta(selectedAtoms[1], selectedAtoms[2], geometry);
            
            html += `
                <div class="measurement-result">
                    <div class="multi-color-strip">
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                        <div class="strip-segment" style="background: ${colors[2]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Distance (${label2}—${label3})</span>
                        <span class="meas-value">${formatMeasuredDistance(pair)}</span>
                        ${deltaHtml23}
                    </div>
                </div>
            `;
            
            // Angle 1-2-3: three color strips (cyan + pink + yellow)
            if (angle) html += `
                <div class="measurement-result">
                    <div class="multi-color-strip triple">
                        <div class="strip-segment" style="background: ${colors[0]}"></div>
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                        <div class="strip-segment" style="background: ${colors[2]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Angle (${label1}—${label2}—${label3})</span>
                        <span class="meas-value angle-value">${angle.angleDeg.toFixed(2)}°</span>
                    </div>
                </div>
            `;
        }
        
        // Clear button
        html += `<button id="clearSelectionBtn" class="btn btn-clear">Clear Selection</button>`;
    }
    
    replacePanelHTML(panel, html, 'atomJumpInput');
    
    // Add clear button listener
    const clearBtn = document.getElementById('clearSelectionBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => clearSelection());
    }
    
    // Clickable coordinates toggle (atom coords and delta rows)
    document.querySelectorAll('.clickable-coords, .clickable-delta').forEach(el => {
        el.addEventListener('click', toggleCoordinateDisplayMode);
    });
}

// Create bond between two atoms
// Bond thickness scales with smallest atom size
function createBond(pos1, pos2) {
    const direction = new THREE.Vector3().subVectors(pos2, pos1);
    const length = direction.length();
    
    // Bond thickness = 25% of smallest atom radius
    const smallestRadius = getSmallestAtomRadius();
    const bondRadius = smallestRadius * 0.25;
    
    const bond = new THREE.Mesh(getSharedBondGeometry(), getBondMaterial(false));
    bond.scale.set(bondRadius, length, bondRadius);
    
    // Position at midpoint
    bond.position.copy(pos1).add(pos2).multiplyScalar(0.5);
    
    // Orient along the bond direction
    bond.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );
    
    bond.castShadow = true;
    bond.userData.isBond = true;
    
    return bond;
}

// Store references to unit cell edge lines for highlighting
let unitCellEdgeLines = [];

// Create unit cell wireframe
function createUnitCell(lattice) {
    const cellGroup = new THREE.Group();
    cellGroup.name = 'unitCell';
    unitCellEdgeLines = []; // Reset edge references
    
    // Lattice vectors
    const a = new THREE.Vector3(...lattice[0]);
    const b = new THREE.Vector3(...lattice[1]);
    const c = new THREE.Vector3(...lattice[2]);
    
    // 8 corners of the unit cell
    const origin = new THREE.Vector3(0, 0, 0);
    const corners = [
        origin.clone(),           // 0: origin
        origin.clone().add(a),    // 1: a
        origin.clone().add(b),    // 2: b
        origin.clone().add(c),    // 3: c
        origin.clone().add(a).add(b),    // 4: a+b
        origin.clone().add(a).add(c),    // 5: a+c
        origin.clone().add(b).add(c),    // 6: b+c
        origin.clone().add(a).add(b).add(c)  // 7: a+b+c
    ];
    
    // 12 edges with their axis direction (which lattice vector they're parallel to)
    // Edge direction: 'a' = parallel to a-vector, 'b' = parallel to b-vector, 'c' = parallel to c-vector
    const edges = [
        { corners: [0, 1], axis: 'a' }, // origin to a
        { corners: [0, 2], axis: 'b' }, // origin to b
        { corners: [0, 3], axis: 'c' }, // origin to c
        { corners: [1, 4], axis: 'b' }, // a to a+b
        { corners: [1, 5], axis: 'c' }, // a to a+c
        { corners: [2, 4], axis: 'a' }, // b to a+b
        { corners: [2, 6], axis: 'c' }, // b to b+c
        { corners: [3, 5], axis: 'a' }, // c to a+c
        { corners: [3, 6], axis: 'b' }, // c to b+c
        { corners: [4, 7], axis: 'c' }, // a+b to a+b+c
        { corners: [5, 7], axis: 'b' }, // a+c to a+b+c
        { corners: [6, 7], axis: 'a' }  // b+c to a+b+c
    ];
    
    edges.forEach(({ corners: [i, j], axis }) => {
    const material = new THREE.LineBasicMaterial({
        color: overlayInk().cell,
        transparent: true,
        opacity: overlayInk().cellOpacity
    });
        const geometry = new THREE.BufferGeometry().setFromPoints([corners[i], corners[j]]);
        const line = new THREE.Line(geometry, material);
        line.userData.edgeAxis = axis;
        line.userData.startCorner = corners[i].clone();
        line.userData.endCorner = corners[j].clone();
        cellGroup.add(line);
        unitCellEdgeLines.push(line);
    });
    
    return cellGroup;
}

// Render the structure
// preserveState: if true, keeps selections and camera position (for display option changes)
function renderStructure(structure, preserveState = false) {
    // A new document cancels camera motion; a rebuild of the same document
    // keeps a gesture or alignment in progress (see restoreCameraAfterRebuild).
    if (!preserveState) cancelCameraAlignment();
    // Remove interaction references before disposing the old scene objects.
    cleanupVacuumHandles();
    unitCellEdgeLines = [];
    smallestAtomRadiusCache = null;
    configureRenderQuality(structure);
    // Save current selection info including ghost atoms
    const savedSelections = preserveState ? selectedAtoms.map(a => ({
        index: a.index,
        originalIndex: a.originalIndex,
        isGhost: a.isGhost || false,
        cellOffset: a.cellOffset ? { ...a.cellOffset } : null,
        element: a.element
    })) : [];
    const savedMeasurementSelection = preserveState && isMeasurementSelection;
    const savedCameraPose = preserveState ? getCameraPose() : null;
    
    // Update axes HUD to reflect actual lattice vectors (for tilted/non-cubic cells)
    if (structure.lattice) {
        updateAxesFromLattice(structure.lattice);
    }
    
    // Clear previous structure
    while (structureGroup.children.length > 0) {
        const child = structureGroup.children[0];
        structureGroup.remove(child);
        disposeObject3D(child);
    }
    
    // Clear measurement visuals (will rebuild if preserving)
    clearMeasurementVisuals();
    selectedAtoms = [];
    isMeasurementSelection = false;
    atomMeshes = [];
    
    // Add atoms
    structure.atoms.forEach((atom, index) => {
        const selectiveDynamics = atom.selectiveDynamics || [true, true, true];
        const mesh = createAtom(atom.element, atom.position, index, selectiveDynamics);
        structureGroup.add(mesh);
        atomMeshes.push(mesh);
        
        // Add fixed atom indicator if any axis is fixed and setting is enabled
        if (settings.showFixedIndicators && supportsSelectiveDynamics(structure) && selectiveDynamics.some(v => v === false)) {
            const elemData = ELEMENT_DATA[atom.element] || ELEMENT_DATA.DEFAULT;
            const radius = elemData.radius * 0.4 * settings.atomScale;
            const indicator = createFixedAtomIndicator(atom.position, radius, selectiveDynamics);
            structureGroup.add(indicator);
        }
    });
    
    // Add unit cell
    if (settings.showCell && hasLattice(structure)) {
        const unitCell = createUnitCell(structure.lattice);
        structureGroup.add(unitCell);
    }
    
    // Add periodic ghost atoms (before centering so they get centered too)
    addPeriodicImages(structure);
    addInstancedAtoms();
    addBondsFromAtomMeshes();
    // Labels number every displayed sphere, copies included, once they exist.
    if (settings.showLabels) addAtomLabels();
    
    // Establish an origin for a newly loaded document. Rebuilding the same
    // document must retain its placement: display bounds change with atom
    // radii, bonds and cell visibility, without moving the atoms themselves.
    if (!savedCameraPose) {
        const box = getFitBounds();
        const center = box.getCenter(new THREE.Vector3());
        structureGroup.position.sub(center);
    }
    
    if (savedCameraPose) {
        restoreCameraAfterRebuild(savedCameraPose);
        
        // Restore selections with correct mode-aware visuals.
        isMeasurementSelection = savedMeasurementSelection;
        selectedAtoms = restoreSelectedAtoms(savedSelections);
        if (!selectedAtoms.length) isMeasurementSelection = false;
        
        // Rebuild visuals based on current mode
        rebuildSelectionVisuals();
        
        // Update the correct UI
        if (currentMode === 'measure') {
            updateMeasurementUI();
        } else {
            updateEditUI();
        }
        updateCameraClipping();
        updateVacuumHandles();
    } else {
        fitStructureToView();
    }
    requestRender();
}

// Picking volumes must not change the apparent size or center of the document.
function getStructureBounds() {
    structureGroup.updateWorldMatrix(true, false);
    const box = new THREE.Box3();
    const childBox = new THREE.Box3();
    structureGroup.children.forEach(child => {
        // Labels describe atoms; their screen size must never enlarge the
        // physical model bounds used for fitting and camera clipping.
        if (!child.userData.vacuumEdge && !child.userData.isAtomLabel) box.union(childBox.setFromObject(child));
    });
    return box;
}

// Framing: atoms and bonds set the view. The cell joins them unless it leaves
// more than this much empty space along some axis, in which case a molecule,
// slab or sheet in a vacuum box fills the view and the cell may extend beyond
// it. Clipping planes still use the full bounds so the cell stays drawn.
const VACUUM_FRAMING_ANGSTROM = 6;

function getFitBounds() {
    const full = getStructureBounds();
    if (!currentStructure || !hasLattice(currentStructure) || !atomMeshes.length) return full;
    structureGroup.updateWorldMatrix(true, false);
    const content = new THREE.Box3();
    const childBox = new THREE.Box3();
    structureGroup.children.forEach(child => {
        if (child.userData.vacuumEdge || child.userData.isAtomLabel || child.name === 'unitCell' || child.name === 'supercellWireframe') return;
        content.union(childBox.setFromObject(child));
    });
    if (content.isEmpty()) return full;
    // A lone atom has nothing to frame but itself; keep its cell in view.
    const diameter = 2 * Math.max(...atomMeshes.map(mesh => mesh.scale.x));
    const size = content.getSize(new THREE.Vector3());
    if (Math.max(size.x, size.y, size.z) <= 2 * diameter) return full;
    const lattice = currentStructure.lattice;
    const { a, b, c } = getPeriodicRepeats(currentStructure);
    const counts = [a, b, c];
    const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
    for (const mesh of atomMeshes) {
        const fractional = cartesianToFractional(mesh.position, lattice);
        if (!fractional) return full;
        fractional.forEach((value, axis) => { low[axis] = Math.min(low[axis], value); high[axis] = Math.max(high[axis], value); });
    }
    const vacuum = lattice.map((vector, axis) => (counts[axis] - (high[axis] - low[axis])) * Math.hypot(...vector));
    return vacuum.some(value => value > VACUUM_FRAMING_ANGSTROM) ? content : full;
}

function fitStructureToView(preserveOrientation = false) {
    // Reset looks at a periodic cell from a lattice-based direction that avoids
    // the body diagonal, so symmetric cells do not stack their atoms; see
    // CrystalCamera.defaultOrientation and docs/camera.md.
    const quaternion = preserveOrientation ? camera.quaternion.clone()
        : cameraMath.defaultOrientation(hasLattice(currentStructure) ? currentStructure.lattice : null);
    // Fit the projection actually in use. A file can finish loading before a
    // window/sidebar resize has settled, when the DOM canvas width is zero.
    // The resize handler preserves this fit when it updates the projection.
    const frustumHeight = orthographicCamera.top - orthographicCamera.bottom;
    const aspect = isPerspective ? perspectiveCamera.aspect
        : (orthographicCamera.right - orthographicCamera.left) / frustumHeight;
    const fitted = cameraMath.fit(getFitBounds(), quaternion, aspect,
        frustumHeight, isPerspective ? perspectiveCamera.fov : null);
    // Framing may leave the cell outside the view, but never outside the
    // clipping planes: whatever part of it is on screen must still draw.
    Object.assign(fitted, cameraMath.clipping(getStructureBounds(), fitted));
    cameraController.setPose(fitted, preserveOrientation ? 'fit' : 'reset');
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

// Update UI with structure info
function updateUI(structure) {
    // Structure info
    const latticeA = Math.sqrt(structure.lattice[0].reduce((s, v) => s + v * v, 0)).toFixed(4);
    const latticeB = Math.sqrt(structure.lattice[1].reduce((s, v) => s + v * v, 0)).toFixed(4);
    const latticeC = Math.sqrt(structure.lattice[2].reduce((s, v) => s + v * v, 0)).toFixed(4);
    
    // File type badge
    const fileType = structure.isXDATCAR ? 'xdatcar' : structure.isXYZ ? 'xyz' : structure.isCIF ? 'cif' : 'poscar';
    const fileTypeBadge = `<span class="file-type-badge ${fileType}">${fileType.toUpperCase()}</span>`;
    
    // Frame info for XDATCAR (combined into single row)
    const frameInfo = structure.isXDATCAR 
        ? `<div class="info-item"><span class="info-label">Frame</span><span class="info-value" id="sidebarFrameDisplay">${structure.currentFrameIndex + 1} / ${structure.totalFrames}</span></div>`
        : '';
    
    // Reuse one pass for overall and per-element constraint counts.
    const constraints = supportsSelectiveDynamics(structure)
        ? CrystalStructure.summarizeConstraints(structure.atoms) : null;
    
    // Show selective dynamics info if any atoms are fixed (POSCAR only)
    const sdInfo = constraints && (constraints.fixed > 0 || constraints.partial > 0)
        ? `<div class="info-item"><span class="info-label">Constraints</span><span class="info-value sd-info">${constraints.fixed} fixed / ${constraints.partial} partial / ${constraints.free} free</span></div>`
        : '';
    // Cell angles (α between b and c, β between a and c, γ between a and b) and
    // volume describe skewed and hexagonal cells that the lengths alone cannot.
    const cellAngle = (first, second) => {
        const dot = first.reduce((sum, value, axis) => sum + value * second[axis], 0);
        const product = Math.hypot(...first) * Math.hypot(...second);
        return product > 0 ? (Math.acos(Math.max(-1, Math.min(1, dot / product))) * 180 / Math.PI).toFixed(2) : '—';
    };
    const [va, vb, vc] = hasLattice(structure) ? structure.lattice : [[], [], []];
    const cellVolume = hasLattice(structure) ? Math.abs(
        va[0] * (vb[1] * vc[2] - vb[2] * vc[1]) - va[1] * (vb[0] * vc[2] - vb[2] * vc[0]) + va[2] * (vb[0] * vc[1] - vb[1] * vc[0])).toFixed(3) : null;
    const latticeInfo = hasLattice(structure) ? `
        <div class="info-item"><span class="info-label">a</span><span class="info-value">${latticeA} Å</span></div>
        <div class="info-item"><span class="info-label">b</span><span class="info-value">${latticeB} Å</span></div>
        <div class="info-item"><span class="info-label">c</span><span class="info-value">${latticeC} Å</span></div>
        <div class="info-item"><span class="info-label">α</span><span class="info-value">${cellAngle(vb, vc)}°</span></div>
        <div class="info-item"><span class="info-label">β</span><span class="info-value">${cellAngle(va, vc)}°</span></div>
        <div class="info-item"><span class="info-label">γ</span><span class="info-value">${cellAngle(va, vb)}°</span></div>
        <div class="info-item"><span class="info-label">Volume</span><span class="info-value">${cellVolume} Å³</span></div>` : '';
    // A CIF names its space group and lists an asymmetric unit; the viewer
    // shows the expanded cell, so say where the atoms came from.
    const cifInfo = structure.cifInfo ? `
        <div class="info-item"><span class="info-label">Space group</span><span class="info-value" title="As named in the file">${escapeHTML(structure.cifInfo.spaceGroup || '—')}${structure.cifInfo.spaceGroupNumber ? ` (No. ${structure.cifInfo.spaceGroupNumber})` : ''}</span></div>
        <div class="info-item"><span class="info-label">Sites</span><span class="info-value" title="Atom sites in the file × symmetry operations applied">${structure.cifInfo.sites} × ${structure.cifInfo.operations} op${structure.cifInfo.operations === 1 ? '' : 's'}</span></div>
        <div class="info-item"><span class="info-label">Export</span><span class="info-value">POSCAR (P1 cell)</span></div>
        ${structure.cifInfo.notices.map(notice => `<p class="info-warning" role="note">${escapeHTML(notice)}</p>`).join('')}` : '';
    
    structureInfo.innerHTML = `
        <div class="info-item"><span class="info-label">Type</span><span class="info-value">${fileTypeBadge}</span></div>
        <div class="info-item"><span class="info-label">File</span><span class="info-value" title="${escapeHTML(currentFilename || '')}">${escapeHTML(currentFilename || 'Untitled')}</span></div>
        <div class="info-item"><span class="info-label">Title</span><span class="info-value" title="${escapeHTML(structure.comment)}">${escapeHTML(structure.comment)}</span></div>
        <div class="info-item"><span class="info-label">Total Atoms</span><span class="info-value">${structure.atoms.length}</span></div>
        ${latticeInfo}
        ${cifInfo}
        ${structure.isXYZ && structure.hasExplicitLattice ? `<div class="info-item"><span class="info-label">Periodic axes</span><span class="info-value">${['a', 'b', 'c'].filter((_, axis) => getPeriodicAxes(structure)[axis]).join(', ') || 'None'}</span></div>` : ''}
        ${frameInfo}
        ${sdInfo}
        ${structure.hasAdditionalSections ? '<p class="info-warning" role="note">This file has additional POSCAR data. An edited export will omit it.</p>' : ''}
        ${structure.hasAdditionalProperties ? '<p class="info-warning" role="note">This file has additional XYZ atom data. An edited export will omit it.</p>' : ''}
    `;
    
    // Atom list - count fixed per element
    let atomHTML = '';
    structure.elements.forEach((elem, i) => {
        const colorHex = elementColorHex(elem);
        const symbol = escapeHTML(elem);
        
        const elementConstraints = constraints?.byElement.get(elem);
        const elemFixedCount = elementConstraints?.fixed || 0;
        const elemPartialCount = elementConstraints?.partial || 0;
        
        const fixedBadge = [
            elemFixedCount > 0 ? `<span class="fixed-badge" title="${elemFixedCount} fully fixed">🔒${elemFixedCount}</span>` : '',
            elemPartialCount > 0 ? `<span class="fixed-badge" title="${elemPartialCount} partially fixed">◐${elemPartialCount}</span>` : ''
        ].join('');
        
        atomHTML += `
            <div class="atom-entry fade-in${Object.hasOwn(settings.colors, elem) ? ' recoloured' : ''}" data-element="${symbol}" style="animation-delay: ${i * 0.05}s">
                <label class="atom-sphere" style="background: ${atomSphereGradient(colorHex)}" title="Change the colour of ${symbol}">
                    <input type="color" class="atom-color-input" data-element="${symbol}" value="${colorHex}" aria-label="Colour of ${symbol}">
                </label>
                <div class="atom-info">
                    <div class="atom-symbol">${symbol} ${fixedBadge}</div>
                    <div class="atom-count">${structure.counts[i]} atom${structure.counts[i] > 1 ? 's' : ''}</div>
                </div>
                <button type="button" class="atom-color-reset" data-element="${symbol}" title="Back to the default colour">default</button>
            </div>
        `;
    });
    atomHTML += `
        <form id="atomJumpForm" class="atom-jump-form">
            <label for="atomJumpInput">Find atom by number</label>
            <div class="atom-jump-row">
                <input id="atomJumpInput" type="number" min="1" max="${Math.max(1, structure.atoms.length)}" step="1" placeholder="${structure.atoms.length ? `1–${structure.atoms.length}` : 'No atoms'}" value="${lastJumpAtomNumber <= structure.atoms.length ? lastJumpAtomNumber || '' : ''}" required${structure.atoms.length ? '' : ' disabled'}>
                <button type="submit" class="btn btn-secondary"${structure.atoms.length ? '' : ' disabled'}>Select</button>
            </div>
        </form>
    `;
    atomList.innerHTML = atomHTML;
}

function jumpToAtom(number) {
    const index = Number(number) - 1;
    if (!currentStructure || !Number.isInteger(index) || index < 0 || index >= currentStructure.atoms.length) {
        statusText.textContent = 'Enter an atom number shown in the structure';
        statusText.className = 'error';
        return false;
    }
    const mesh = atomMeshes[index];
    if (!mesh) return false;
    lastJumpAtomNumber = index + 1;
    if (currentMode === 'edit') {
        if (selectedAtoms.length > 0) clearSelection();
        isMeasurementSelection = false;
        selectAtomForEdit(mesh, index);
    } else if (!selectedAtoms.some(atom => atom.index === index)) {
        if (selectedAtoms.length >= 3) clearSelection();
        selectAtom(mesh, index);
    }
    const target = new THREE.Vector3();
    mesh.getWorldPosition(target);
    const pose = getCameraPose();
    pose.pivot.copy(target);
    cameraController.setPose(pose, 'focus');
    if (currentMode === 'measure' || isMeasurementSelection) updateMeasurements();
    updateUI_forCurrentMode();
    statusText.textContent = `Selected atom #${index + 1} (${currentStructure.atoms[index].element})`;
    statusText.className = '';
    return true;
}

function setupAtomJump() {
    atomList.addEventListener('input', event => {
        const input = event.target.closest('.atom-color-input');
        if (input) setElementColor(input.dataset.element, input.value);
    });
    atomList.addEventListener('click', event => {
        const reset = event.target.closest('.atom-color-reset');
        if (reset) setElementColor(reset.dataset.element, null);
    });
    atomList.addEventListener('submit', event => {
        if (event.target.id !== 'atomJumpForm') return;
        event.preventDefault();
        jumpToAtom(document.getElementById('atomJumpInput').value);
    });
}

// Helper: Lighten a hex color
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

const EXAMPLE_CATALOG = [
    {
        group: 'POSCAR',
        items: [
            { title: 'Si diamond', meta: 'Direct · cubic', path: 'examples/poscar/Si_diamond.poscar' },
            { title: 'Al FCC', meta: 'Cartesian', path: 'examples/poscar/Al_fcc_cartesian.poscar' },
            { title: 'NaCl rocksalt', meta: 'binary crystal', path: 'examples/poscar/NaCl_rocksalt.poscar' },
            { title: 'Graphene sheet', meta: 'hexagonal + vacuum', path: 'examples/poscar/graphene_sheet.poscar' },
            { title: 'Al slab', meta: 'selective dynamics', path: 'examples/poscar/Al_slab_selective.poscar' },
            { title: 'SrTiO₃', meta: '.vasp perovskite', path: 'examples/poscar/SrTiO3_perovskite.vasp' },
            { title: 'Si scaled', meta: 'scale factor', path: 'examples/poscar/Si_diamond_scaled.poscar' }
        ]
    },
    {
        group: 'XYZ',
        items: [
            { title: 'Water', meta: 'H₂O molecule', path: 'examples/xyz/H2O.xyz' },
            { title: 'Methane', meta: 'CH₄ tetrahedral', path: 'examples/xyz/CH4.xyz' },
            { title: 'Benzene', meta: 'C₆H₆ ring', path: 'examples/xyz/benzene.xyz' },
            { title: 'Si diamond', meta: 'extended XYZ lattice', path: 'examples/xyz/Si_diamond_extended.xyz' }
        ]
    },
    {
        group: 'CIF',
        items: [
            { title: 'ZnS wurtzite', meta: 'hexagonal · P6₃mc', path: 'examples/cif/ZnS_wurtzite.cif' },
            { title: 'TiO₂ rutile', meta: 'tetragonal · P4₂/mnm', path: 'examples/cif/TiO2_rutile.cif' },
            { title: 'α-quartz', meta: 'trigonal · P3₂21', path: 'examples/cif/SiO2_quartz.cif' },
            { title: 'Vanthoffite', meta: 'monoclinic · 54 atoms', path: 'examples/cif/vanthoffite_monoclinic.cif' }
        ]
    },
    {
        group: 'XDATCAR',
        items: [
            { title: 'H₂ vibration', meta: '16-frame animation', path: 'examples/xdatcar/H2_vibration.xdatcar' },
            { title: 'H₂O wobble', meta: '24-frame animation', path: 'examples/xdatcar/H2O_wobble.xdatcar' }
        ]
    }
];

function loadStructureFromText(content, filename, requestId = null) {
    if (requestId !== null && requestId !== latestLoadRequest) return false;
    if (requestId === null) latestLoadRequest++;
    const nameLower = (filename || '').toLowerCase();
    let nextStructure;
    if (nameLower.endsWith('.xdatcar') || isXDATCARFormat(content)) {
        nextStructure = parseXDATCAR(content);
    } else if (nameLower.endsWith('.xyz') || isXYZFormat(content)) {
        nextStructure = parseXYZ(content);
    } else if (nameLower.endsWith('.cif') || isCIFFormat(content)) {
        nextStructure = parseCIF(content);
    } else {
        nextStructure = parsePOSCAR(content);
    }

    if (hasUnsavedEdits() && !window.confirm('Discard unsaved structure edits and open another file?')) {
        statusText.textContent = 'Kept the current structure and unsaved edits';
        statusText.className = '';
        return false;
    }

    cancelEditDrag(null, 'file replaced');
    stopAnimation();
    editHistory.reset();
    updateUndoButton();
    updateDirtyIndicator();
    settings.periodic = { a: 1, b: 1, c: 1 };
    ['A', 'B', 'C'].forEach(axis => {
        document.getElementById(`periodic${axis}`).value = 1;
        document.getElementById(`periodic${axis}Display`).textContent = 1;
    });
    geometryWarnings.clear();
    setGeometryWarning('measurement', '');
    currentStructure = nextStructure;
    currentSourceText = nextStructure.isXYZ || nextStructure.hasAdditionalSections ? content : null;
    lastJumpAtomNumber = null;
    currentFilename = filename || 'Untitled';
    selectedAtomCoordMode = hasLattice(currentStructure) ? 'fractional' : 'cartesian';
    lastAddAtomElement = null;
    lastAddAtomSpecies = null;
    lastAddAtomCoords = { x: 0, y: 0, z: 0 };
    lastShiftCoords = { a: 0, b: 0, c: 0 };
    lastSelectRange = null;
    setBoxSelectMode(false);
    coordinateEditSession = null;
    clearCoordinatePreviewTimer();
    lastAddAtomCoordType = hasLattice(currentStructure) ? 'fractional' : 'cartesian';
    lastShiftCoordType = lastAddAtomCoordType;
    if (currentStructure.isXDATCAR) {

        if (currentMode === 'edit') {
            switchToMeasureMode();
        }

        showTimelinePanel();
        updateTimelineUI();

        statusText.textContent = `Loaded XDATCAR: ${filename} (${currentStructure.totalFrames} frames)`;
    } else if (currentStructure.isCIF) {
        hideTimelinePanel();
        const info = currentStructure.cifInfo;
        statusText.textContent = `Loaded CIF: ${filename} (${currentStructure.atoms.length} atoms from ${info.sites} site${info.sites === 1 ? '' : 's'}`
            + `${info.spaceGroup ? `, ${info.spaceGroup}` : ''})${info.notices.length ? `. ${info.notices.join(' ')}` : ''}`;
    } else if (currentStructure.isXYZ) {
        hideTimelinePanel();
        statusText.textContent = currentStructure.hasAdditionalProperties
            ? `Loaded XYZ: ${filename}. Additional atom data can only be preserved in an unchanged export.`
            : `Loaded XYZ: ${filename} (${currentStructure.atoms.length} atoms)`;
    } else {
        hideTimelinePanel();
        statusText.textContent = currentStructure.hasAdditionalSections
            ? `Loaded: ${filename}. Additional POSCAR data can only be preserved in an unchanged export.`
            : `Loaded: ${filename}`;
    }

    renderStructure(currentStructure);
    updateUI(currentStructure);
    updateUI_forCurrentMode();
    updateModeToggleForFileType();
    updateSupercellButtonState();

    const focusWasInDropZone = dropZone.contains(document.activeElement);
    dropZone.classList.add('hidden');
    const examplesBtn = document.getElementById('examplesBtn');
    examplesBtn?.setAttribute('aria-expanded', 'false');
    if (focusWasInDropZone) examplesBtn?.focus();
    statusText.className = currentStructure.hasAdditionalSections || currentStructure.hasAdditionalProperties
        || (currentStructure.cifInfo && currentStructure.cifInfo.notices.length) ? 'warning' : 'success';
    return true;
}

function beginStructureLoad(filename) {
    const requestId = ++latestLoadRequest;
    statusText.textContent = `Loading ${filename}...`;
    statusText.className = '';
    return requestId;
}

function handleFile(file) {
    const requestId = beginStructureLoad(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
        if (requestId !== latestLoadRequest) return;
        try {
            loadStructureFromText(e.target.result, file.name, requestId);
        } catch (error) {
            console.error('Error parsing file:', error);
            statusText.textContent = `Error: ${error.message}`;
            statusText.className = 'error';
        }
    };
    const reportReadFailure = error => {
        if (requestId !== latestLoadRequest) return;
        statusText.textContent = `Could not read ${file.name}: ${error?.message || 'File read failed'}`;
        statusText.className = 'error';
    };
    reader.onerror = () => reportReadFailure(reader.error);
    reader.onabort = () => {
        if (requestId !== latestLoadRequest) return;
        statusText.textContent = `Opening ${file.name} canceled`;
        statusText.className = '';
    };
    try {
        reader.readAsText(file);
    } catch (error) {
        reportReadFailure(error);
    }
}

async function loadExampleFile(path) {
    const filename = path.split('/').pop();
    const requestId = beginStructureLoad(filename);
    try {
        const response = await fetch(path);
        if (requestId !== latestLoadRequest) return false;
        if (!response.ok) {
            throw new Error(`Could not fetch ${filename} (${response.status})`);
        }
        const content = await response.text();
        return loadStructureFromText(content, filename, requestId);
    } catch (error) {
        if (requestId !== latestLoadRequest) return false;
        console.error('Error loading example:', error);
        statusText.textContent = window.location?.protocol === 'file:'
            ? `Could not load ${filename}. Open this app over HTTP using GitHub Pages or a local server.`
            : `Could not load ${filename}: ${error.message}`;
        statusText.className = 'error';
        return false;
    }
}

function setupExamplePicker() {
    const list = document.getElementById('exampleList');
    if (!list) return;

    list.innerHTML = EXAMPLE_CATALOG.map(group => {
        const buttons = group.items.map(item => `
            <button type="button" class="example-chip" data-example-path="${item.path}">
                <span class="example-chip-title">${item.title}</span>
                <span class="example-chip-meta">${item.meta}</span>
            </button>
        `).join('');
        return `
            <div class="example-group">
                <div class="example-group-label">${group.group}</div>
                <div class="example-group-buttons">${buttons}</div>
            </div>
        `;
    }).join('');

    list.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-example-path]');
        if (!chip) return;
        e.preventDefault();
        e.stopPropagation();
        loadExampleFile(chip.dataset.examplePath);
    });

    const openBtn = document.getElementById('openFileBtn');
    if (openBtn) {
        openBtn.addEventListener('click', () => fileInput.click());
    }

    const examplesBtn = document.getElementById('examplesBtn');
    const closeDropZone = document.getElementById('closeDropZone');

    function showExampleOverlay() {
        dropZone.classList.remove('hidden');
        examplesBtn?.setAttribute('aria-expanded', 'true');
        if (closeDropZone) {
            closeDropZone.classList.toggle('hidden', !currentStructure);
        }
        (currentStructure ? closeDropZone : list.querySelector('[data-example-path]'))?.focus();
    }

    function hideExampleOverlay() {
        if (!currentStructure) return;
        dropZone.classList.add('hidden');
        examplesBtn?.setAttribute('aria-expanded', 'false');
        examplesBtn?.focus();
    }

    if (examplesBtn) {
        examplesBtn.addEventListener('click', showExampleOverlay);
    }
    if (closeDropZone) {
        closeDropZone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideExampleOverlay();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !dropZone.classList.contains('hidden') && currentStructure) {
            e.preventDefault();
            hideExampleOverlay();
        }
    });
}

// Setup drag and drop
function setupDragDrop() {
    // CRITICAL: Prevent default drag behavior on the ENTIRE document
    // This stops browsers from navigating to the file
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    // Drag events on drop zone
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    // File input change handler - triggered by native <label> click
    // The drop zone is now a <label for="fileInput"> so clicking it
    // automatically opens the file browser - no JS needed!
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
        // Reset so the same file can be loaded again
        fileInput.value = '';
    });
    
    // Also allow dropping on the viewport when a structure is loaded
    viewport.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    viewport.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// === Trackpad pinch ===
// Chrome, Edge and Firefox report a trackpad pinch as a wheel event with
// ctrlKey set and deltas a small fraction of a scroll's. TrackballControls
// scales every pixel the same, so a whole pinch moved the camera less than one
// wheel tick. Here the pinch is re-issued as a plain wheel event with its own
// gain, so the controls, their damping and their start/end events all behave as
// for a scroll. Safari reports a pinch as gesture events carrying a scale; those
// are converted the same way, and ctrl-wheel is ignored while a gesture runs.
const WHEEL_BURST_GAP_MS = 250;    // a longer pause starts a new scroll or pinch
const PINCH_GAIN = 4;              // wheel pixels per pinch pixel
const PINCH_PIXELS_PER_SCALE = 600; // wheel pixels for a Safari scale change of 1.0
const PINCH_MAX_STEP = 300;        // wheel pixels per event, so a fast pinch cannot jump

function setupPinchZoom() {
    const canvas = renderer.domElement;
    let gestureActive = false, gestureScale = 1;
    const reissue = (source, deltaY) => {
        const step = Math.sign(deltaY) * Math.min(Math.abs(deltaY), PINCH_MAX_STEP);
        const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: source.clientX, clientY: source.clientY, deltaY: step, deltaMode: 0 });
        wheel.fromPinch = true;
        canvas.dispatchEvent(wheel);
    };
    document.addEventListener('wheel', event => {
        if (event.fromPinch || !event.ctrlKey || event.target !== canvas || gestureActive) return;
        event.preventDefault(); // otherwise the browser zooms the whole page
        event.stopImmediatePropagation();
        reissue(event, event.deltaY * PINCH_GAIN);
    }, { capture: true, passive: false });
    canvas.addEventListener('gesturestart', event => { event.preventDefault(); gestureActive = true; gestureScale = event.scale || 1; }, { passive: false });
    canvas.addEventListener('gesturechange', event => {
        event.preventDefault();
        const scale = event.scale || 1, ratio = scale / gestureScale;
        gestureScale = scale;
        if (ratio > 0 && ratio !== 1) reissue(event, -(ratio - 1) * PINCH_PIXELS_PER_SCALE);
    }, { passive: false });
    canvas.addEventListener('gestureend', event => { event.preventDefault(); gestureActive = false; }, { passive: false });
}

// Setup controls
function setupControls() {
    document.getElementById('undoBtn').addEventListener('click', performUndo);
    document.getElementById('redoBtn').addEventListener('click', performRedo);
    // Reset view
    document.getElementById('resetView').addEventListener('click', () => {
        if (currentStructure) {
            fitStructureToView();
        }
    });
    
    // Toggle axes
    document.getElementById('showAxes').addEventListener('change', (e) => setShowAxes(e.target.checked));
    document.getElementById('showCell').addEventListener('change', (e) => {
        settings.showCell = e.target.checked;
        savePreferences();
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Atom scale
    document.getElementById('atomScale').addEventListener('input', (e) => {
        settings.atomScale = parseFloat(e.target.value);
        savePreferences();
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Bond threshold
    document.getElementById('bondThreshold').addEventListener('input', (e) => {
        settings.bondThreshold = parseFloat(e.target.value);
        showBondThresholdValue();
        savePreferences();
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Show labels (placeholder for future)
    document.getElementById('showLabels').addEventListener('change', (e) => {
        settings.showLabels = e.target.checked;
        savePreferences();
        if (currentStructure) {
            rebuildLabels();
        }
    });
    
    // Show fixed atom indicators
    document.getElementById('showFixedIndicators').addEventListener('change', (e) => {
        settings.showFixedIndicators = e.target.checked;
        savePreferences();
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Ghost opacity slider removed - using default 75%
    // Keeping the settings.ghostOpacity for future use
    
    setupExportMenu();

    document.querySelectorAll('#backgroundSwatches .swatch[data-color]').forEach(swatch => {
        swatch.addEventListener('click', () => setBackground(swatch.dataset.color));
    });
    document.getElementById('backgroundColor').addEventListener('input', (e) => setBackground(e.target.value));
    document.getElementById('resetPreferences').addEventListener('click', askResetPreferences);
    document.getElementById('resetConfirmYes').addEventListener('click', () => { hideResetConfirm(); resetPreferences(); });
    document.getElementById('resetConfirmNo').addEventListener('click', () => hideResetConfirm(true));
    document.getElementById('resetConfirm').addEventListener('keydown', (e) => { if (e.key === 'Escape') hideResetConfirm(true); });
    applyPreferencesToControls();
}

function setShowAxes(on) {
    settings.showAxes = on;
    document.getElementById('showAxes').checked = on;
    savePreferences();
    requestRender(); // The axes HUD reads settings.showAxes in the animation loop.
}

// Mirror the settings in the sidebar and toolbar controls, so a remembered
// preference and a reset both show where they apply.
function applyPreferencesToControls() {
    document.getElementById('atomScale').value = settings.atomScale;
    document.getElementById('bondThreshold').value = settings.bondThreshold;
    showBondThresholdValue();
    document.getElementById('showLabels').checked = settings.showLabels;
    document.getElementById('showFixedIndicators').checked = settings.showFixedIndicators;
    document.getElementById('showAxes').checked = settings.showAxes;
    document.getElementById('showCell').checked = settings.showCell;
    applyBackground();
    applyElementColors();
    updateResetButton();
}

function backgroundLuminance(hex) {
    const channel = offset => {
        const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function isLightBackground() {
    return backgroundLuminance(settings.background) > 0.4;
}

// Overlay text and thin lines (measurement captions, the angle arc) are
// drawn in ink that contrasts with the background: light on dark, dark on
// light. Atom colours, bonds and the cell keep their own colours.
function overlayInk() {
    return isLightBackground()
        ? { text: '#16161d', shadow: 'rgba(255, 255, 255, 0.85)', line: 0x16161d, cell: 0x0f6e56, cellOpacity: 0.75, measure: [0x0f6e56, 0x993556] }
        : { text: '#ffffff', shadow: 'rgba(0, 0, 0, 0.8)', line: 0xffffff, cell: 0x00f5d4, cellOpacity: 0.6, measure: [0x00f5d4, 0xf15bb5] };
}

function applyBackground() {
    if (!/^#[0-9a-f]{6}$/i.test(settings.background)) settings.background = DEFAULT_PREFERENCES.background;
    settings.background = settings.background.toLowerCase();
    if (scene) scene.background = new THREE.Color(settings.background);
    let matched = false;
    document.querySelectorAll('#backgroundSwatches .swatch[data-color]').forEach(swatch => {
        const selected = swatch.dataset.color.toLowerCase() === settings.background;
        matched = matched || selected;
        swatch.classList.toggle('selected', selected);
        swatch.setAttribute('aria-checked', String(selected));
    });
    const custom = document.getElementById('backgroundColor');
    custom.value = settings.background;
    custom.parentElement.classList.toggle('selected', !matched);
    custom.parentElement.style.setProperty('--swatch', matched ? '' : settings.background);
    document.body.classList.toggle('light-scene', isLightBackground());
}

// The colour an element is drawn in: the visitor's override, else the table.
function defaultElementColorHex(element) {
    return '#' + (ELEMENT_DATA[element] || ELEMENT_DATA.DEFAULT).color.toString(16).padStart(6, '0');
}

function elementColorHex(element) {
    const override = settings.colors[element];
    return typeof override === 'string' && /^#[0-9a-f]{6}$/i.test(override) ? override.toLowerCase() : defaultElementColorHex(element);
}

function elementColor(element) {
    return parseInt(elementColorHex(element).slice(1), 16);
}

function atomSphereGradient(hex) {
    return `radial-gradient(circle at 30% 30%, ${lightenColor(hex, 40)}, ${hex})`;
}

// Recolour an element everywhere it shows: the shared atom materials, so
// every atom and copy changes at once without a rebuild, and its list entry.
function applyElementColors() {
    for (const [key, material] of sharedAtomMaterials) {
        material.color.set(elementColor(key.split(':')[0]));
    }
    document.querySelectorAll('#atomList .atom-entry[data-element]').forEach(entry => {
        const element = entry.dataset.element;
        const hex = elementColorHex(element);
        entry.querySelector('.atom-sphere').style.background = atomSphereGradient(hex);
        entry.querySelector('.atom-color-input').value = hex;
        entry.classList.toggle('recoloured', Object.hasOwn(settings.colors, element));
    });
    requestRender();
}

function setElementColor(element, hex) {
    if (!hex || hex.toLowerCase() === defaultElementColorHex(element)) delete settings.colors[element];
    else settings.colors[element] = hex.toLowerCase();
    applyElementColors();
    savePreferences();
}

// Hand a file to the browser's download. Returns false when the click
// itself failed; the Blob URL stays alive while the download starts.
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    try {
        a.click();
        return true;
    } catch {
        return false;
    } finally {
        setTimeout(() => {
            a.remove();
            URL.revokeObjectURL(url);
        }, 60000);
    }
}

// === Export menu: a structure file, or an image of the view ===
let exportScale = 1;

function setupExportMenu() {
    const button = document.getElementById('exportMenuButton');
    const menu = document.getElementById('exportMenu');
    if (!button || !menu) return;
    const open = () => { menu.hidden = false; button.setAttribute('aria-expanded', 'true'); updateExportMenu(); };
    const close = () => { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); };
    button.addEventListener('click', () => (menu.hidden ? open() : close()));
    document.addEventListener('pointerdown', (e) => {
        if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (movieRecording) movieRecording.cancel();
        if (!menu.hidden) { close(); button.focus(); }
    });
    document.getElementById('exportMovie').addEventListener('click', () => { close(); exportMovie(); });
    document.getElementById('exportPoscar').addEventListener('click', () => { close(); exportStructure(); });
    menu.querySelectorAll('.export-size').forEach(size => size.addEventListener('click', () => {
        exportScale = Number(size.dataset.scale);
        updateExportMenu();
    }));
    document.getElementById('exportImage').addEventListener('click', () => { close(); exportImage(); });
}

function updateExportMenu() {
    const menu = document.getElementById('exportMenu');
    if (!menu || typeof menu.querySelectorAll !== 'function') return; // Not in the page (unit tests stub the document)
    document.getElementById('exportFormatLabel').textContent =
        !currentStructure ? '—' : currentStructure.isXDATCAR ? 'XDATCAR' : currentStructure.isXYZ ? 'XYZ' : 'POSCAR';
    menu.querySelectorAll('.export-size').forEach(size => {
        const on = Number(size.dataset.scale) === exportScale;
        size.classList.toggle('active', on);
        size.setAttribute('aria-checked', String(on));
    });
    document.getElementById('exportPixels').textContent = `${viewport.clientWidth * exportScale} × ${viewport.clientHeight * exportScale} px`;
    const trajectory = Boolean(currentStructure && currentStructure.isXDATCAR);
    menu.querySelectorAll('.export-movie-only').forEach(part => { part.hidden = !trajectory; });
    if (trajectory) {
        const total = currentStructure.totalFrames, fps = animationState.fps;
        document.getElementById('exportMovieInfo').textContent = `${total} at ${fps} fps · ${(total / fps).toFixed(1)} s`;
        const format = movieFormat();
        document.getElementById('exportMovie').textContent = format ? `Save ${format.label}` : 'Save movie';
        document.getElementById('exportMovieHint').textContent = format && format.extension === 'webm'
            ? 'This browser records WebM, not MP4; VLC and any video tool convert it.'
            : "Plays every frame at the timeline's FPS, at the image size above.";
    }
}

// The movie format this browser can record: MP4 (H.264) where it can, since
// that plays in Keynote, PowerPoint and QuickTime; WebM otherwise (Firefox).
function movieFormat() {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return null;
    const candidates = [
        ['video/mp4;codecs=avc1', 'mp4', 'MP4'],
        ['video/mp4', 'mp4', 'MP4'],
        ['video/webm;codecs=vp9', 'webm', 'WebM'],
        ['video/webm;codecs=vp8', 'webm', 'WebM'],
        ['video/webm', 'webm', 'WebM']
    ];
    const found = candidates.find(([type]) => MediaRecorder.isTypeSupported(type));
    return found ? { mimeType: found[0], extension: found[1], label: found[2] } : null;
}

// === Movie export: every frame of the trajectory, recorded from the canvas ===
// The browser encodes it (MP4 where it can, else WebM), so no library is needed.
// Frames are drawn and paced in real time at the timeline's FPS, which is
// what gives the file its playback speed; Escape cancels.
let movieRecording = null;

async function exportMovie() {
    if (!currentStructure || !currentStructure.isXDATCAR || movieRecording) return;
    const canvas = renderer.domElement;
    if (typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function') {
        statusText.textContent = 'This browser cannot record a movie; Chrome, Edge or Firefox can';
        statusText.className = 'error';
        return;
    }
    const format = movieFormat();
    if (!format) {
        statusText.textContent = 'This browser cannot record a movie; Chrome, Edge or Firefox can';
        statusText.className = 'error';
        return;
    }
    const width = viewport.clientWidth * exportScale, height = viewport.clientHeight * exportScale;
    if (Math.max(width, height) > 16384) {
        statusText.textContent = `${width} × ${height} px is more than the browser can draw; choose a smaller size`;
        statusText.className = 'error';
        return;
    }
    stopAnimation();
    const total = currentStructure.totalFrames, fps = animationState.fps, startFrame = currentStructure.currentFrameIndex;
    const frameMs = 1000 / fps;
    const previousRatio = renderer.getPixelRatio();
    renderer.setPixelRatio(exportScale);
    const stream = canvas.captureStream(0);
    const track = stream.getVideoTracks()[0];
    const requestFrame = () => { if (track.requestFrame) track.requestFrame(); else if (stream.requestFrame) stream.requestFrame(); };
    const recorder = new MediaRecorder(stream, { mimeType: format.mimeType, videoBitsPerSecond: Math.min(50e6, 6e6 * exportScale * exportScale) });
    const chunks = [];
    recorder.ondataavailable = event => { if (event.data && event.data.size) chunks.push(event.data); };
    const stopped = new Promise(resolve => { recorder.onstop = resolve; });
    let cancelled = false;
    movieRecording = { cancel: () => { cancelled = true; } };
    // Draw nothing until the recorder reports it has started: frames requested
    // before that can be lost, leaving a file with a header and no pictures.
    const started = new Promise(resolve => { recorder.onstart = resolve; });
    recorder.start();
    await started;
    try {
        for (let index = 0; index < total && !cancelled; index++) {
            const frameStart = performance.now();
            switchToFrame(index);
            drawFrame();
            requestFrame();
            statusText.textContent = `Recording movie: frame ${index + 1} of ${total} (Escape cancels)`;
            statusText.className = '';
            await new Promise(resolve => setTimeout(resolve, Math.max(0, frameMs - (performance.now() - frameStart))));
        }
        if (!cancelled) {
            // Hold the last frame for one more interval so it gets its full time.
            drawFrame();
            requestFrame();
            await new Promise(resolve => setTimeout(resolve, frameMs));
        }
    } finally {
        recorder.stop();
        await stopped;
        track.stop();
        renderer.setPixelRatio(previousRatio);
        switchToFrame(startFrame);
        requestRender();
        movieRecording = null;
    }
    if (cancelled) {
        statusText.textContent = 'Movie recording cancelled';
        statusText.className = '';
        return;
    }
    const { extension } = format;
    const blob = new Blob(chunks, { type: format.mimeType.split(';')[0] });
    const stem = (currentFilename || 'trajectory').replace(/\.[^.]+$/, '');
    if (!blob.size || !downloadBlob(blob, `${stem}.${extension}`)) {
        statusText.textContent = 'Could not save the movie';
        statusText.className = 'error';
        return;
    }
    statusText.textContent = `Started ${format.label} download (${total} frames at ${fps} fps, ${width} × ${height} px)`;
    statusText.className = '';
}

// Draw the view again with more pixels and hand back a PNG. The CSS size,
// camera and overlay sizes stay as on screen, so the picture is the screen's
// picture at a larger size; the on-screen canvas is restored afterwards.
function renderImageBlob({ scale = 1, transparent = false } = {}) {
    const previousRatio = renderer.getPixelRatio();
    const previousBackground = scene.background;
    try {
        if (transparent) scene.background = null;
        renderer.setPixelRatio(scale);
        drawFrame();
        return new Promise(resolve => renderer.domElement.toBlob(resolve, 'image/png'));
    } finally {
        scene.background = previousBackground;
        renderer.setPixelRatio(previousRatio);
        requestRender();
    }
}

function imageFilename() {
    const stem = (currentFilename || 'structure').replace(/\.[^.]+$/, '');
    const frame = currentStructure.isXDATCAR ? `_frame${(currentStructure.currentFrameIndex || 0) + 1}` : '';
    return `${stem}${frame}.png`;
}

async function exportImage() {
    if (!currentStructure) {
        statusText.textContent = 'No structure to export';
        statusText.className = '';
        return;
    }
    const transparent = document.getElementById('exportTransparent').checked;
    const width = viewport.clientWidth * exportScale, height = viewport.clientHeight * exportScale;
    if (Math.max(width, height) > 16384) {
        statusText.textContent = `${width} × ${height} px is more than the browser can draw; choose a smaller size`;
        statusText.className = 'error';
        return;
    }
    const blob = await renderImageBlob({ scale: exportScale, transparent });
    if (!blob || !downloadBlob(blob, imageFilename())) {
        statusText.textContent = 'Could not save the image';
        statusText.className = 'error';
        return;
    }
    statusText.textContent = `Started PNG download (${width} × ${height} px${transparent ? ', transparent' : ''})`;
    statusText.className = '';
}

// Style files: the same preferences as a small JSON file, for carrying a look
// to another browser or keeping more than one look. The Save style / Load
// style buttons were removed from the panel to keep it simple; these two
// functions stay so they can be offered again elsewhere.
function saveStyle() {
    const blob = new Blob([preferenceStore.serialize(settings)], { type: 'application/json' });
    if (downloadBlob(blob, 'crystal-visualizer-style.json')) {
        statusText.textContent = 'Started style download';
        statusText.className = '';
    } else {
        statusText.textContent = 'Could not start the style download';
        statusText.className = 'error';
    }
}

function loadStyleFile(file) {
    if (!file) return;
    file.text().then(text => {
        let loaded;
        try {
            loaded = preferenceStore.parse(text);
        } catch (error) {
            statusText.textContent = `${file.name}: ${error.message}`;
            statusText.className = 'error';
            return;
        }
        Object.assign(settings, loaded);
        applyPreferencesToControls();
        savePreferences();
        if (currentStructure) renderStructure(currentStructure, true);
        requestRender();
        statusText.textContent = `Style loaded from ${file.name}`;
        statusText.className = '';
    }, () => {
        statusText.textContent = `Could not read ${file.name}`;
        statusText.className = 'error';
    });
}

function setBackground(color) {
    settings.background = color;
    applyBackground();
    savePreferences();
    if (currentStructure) renderStructure(currentStructure, true); // Overlays take the new ink
    requestRender();
}

function showBondThresholdValue() {
    document.getElementById('bondThresholdValue').textContent = settings.bondThreshold > 0 ? settings.bondThreshold.toFixed(1) : 'none';
}

function showPeriodicControls() {
    for (const axis of ['a', 'b', 'c']) {
        const upper = axis.toUpperCase();
        document.getElementById(`periodic${upper}Display`).textContent = settings.periodic[axis];
        document.getElementById(`periodic${upper}`).value = settings.periodic[axis];
    }
    updateResetButton();
}

function savePreferences() {
    preferenceStore.save(settings);
    updateResetButton();
}

// Reset all is live only while something differs from the defaults, so the
// button itself shows whether there is anything to reset.
function updateResetButton() {
    const button = document.getElementById('resetPreferences');
    if (!button) return;
    const { a, b, c } = settings.periodic;
    const changed = Object.keys(CrystalPreferences.differences(settings, DEFAULT_PREFERENCES)).length > 0 || a !== 1 || b !== 1 || c !== 1;
    button.disabled = !changed;
    button.title = changed ? 'Restore the defaults above and the atom colours' : 'Nothing to reset: everything is at its default';
}

// Reset all: every display option returns to its default, the browser forgets
// the remembered ones, and the view redraws. The loaded structure, its edits
// and the camera are left alone.
// Reset all asks first, in the page rather than a browser dialog (embedded
// browsers may not show those): the button gives way to "Reset everything?"
// with Reset and Cancel, and the question withdraws on Cancel, Escape, or
// after a few seconds without an answer.
let resetConfirmTimer = null;

function askResetPreferences() {
    document.getElementById('resetPreferences').hidden = true;
    const confirmBox = document.getElementById('resetConfirm');
    confirmBox.hidden = false;
    document.getElementById('resetConfirmYes').focus();
    clearTimeout(resetConfirmTimer);
    resetConfirmTimer = setTimeout(() => hideResetConfirm(), 6000);
}

function hideResetConfirm(refocus = false) {
    clearTimeout(resetConfirmTimer);
    resetConfirmTimer = null;
    document.getElementById('resetConfirm').hidden = true;
    const button = document.getElementById('resetPreferences');
    button.hidden = false;
    if (refocus) button.focus();
}

function resetPreferences() {
    Object.assign(settings, preferenceStore.reset());
    settings.periodic = { a: 1, b: 1, c: 1 };
    applyPreferencesToControls();
    showPeriodicControls();
    if (currentStructure) {
        updateSupercellButtonState();
        renderStructure(currentStructure, true);
    }
    requestRender();
    statusText.textContent = 'Defaults restored: background, atom colours, display options';
    statusText.className = '';
}

// Update Make Supercell button state based on periodicity
function updateSupercellButtonState() {
    const makeSupercellBtn = document.getElementById('makeSupercellBtn');
    if (!makeSupercellBtn) return;
    
    const { a, b, c } = getPeriodicRepeats(currentStructure);
    const hasPeriodicImages = a > 1 || b > 1 || c > 1;
    
    makeSupercellBtn.disabled = !isPeriodicStructure(currentStructure) || !hasPeriodicImages;
    makeSupercellBtn.title = !isPeriodicStructure(currentStructure) ? 'Requires a periodic structure' : hasPeriodicImages
        ? `Convert ${a}×${b}×${c} periodic images to actual supercell`
        : 'Set periodicity > 1×1×1 first';
}

// Setup periodic controls
function setupPeriodicControls() {
    const periodicBtns = document.querySelectorAll('.stepper-btn');
    
    // Helper to update periodic settings and re-render
    function updatePeriodic() {
        const a = parseInt(document.getElementById('periodicA').value) || 1;
        const b = parseInt(document.getElementById('periodicB').value) || 1;
        const c = parseInt(document.getElementById('periodicC').value) || 1;
        const next = getPeriodicRepeats(currentStructure, { a: Math.max(1, Math.min(20, a)), b: Math.max(1, Math.min(20, b)), c: Math.max(1, Math.min(20, c)) });
        if (currentStructure && currentStructure.atoms.length * next.a * next.b * next.c > 3000) {
            ['A', 'B', 'C'].forEach(axis => {
                document.getElementById(`periodic${axis}`).value = settings.periodic[axis.toLowerCase()];
            });
            statusText.textContent = 'Periodic preview limited to 3,000 displayed atoms';
            statusText.className = 'error';
            return;
        }
        
        // Clamp values (minimum 1, reasonable max of 20 for performance)
        settings.periodic = next;
        
        showPeriodicControls();
        
        // Update Make Supercell button state
        updateSupercellButtonState();
        
        // Re-render structure with periodic images
        if (currentStructure) {
            renderStructure(currentStructure, true);
            fitStructureToView(true);
            
            // Update status
            if (settings.periodic.a > 1 || settings.periodic.b > 1 || settings.periodic.c > 1) {
                statusText.textContent = `Periodic: ${settings.periodic.a}×${settings.periodic.b}×${settings.periodic.c}`;
                statusText.className = '';
            } else {
                statusText.textContent = 'Single unit cell';
                statusText.className = '';
            }
        }
    }
    
    // +/- button listeners
    periodicBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const axis = btn.dataset.axis;
            const dir = btn.dataset.dir;
            const input = document.getElementById(`periodic${axis.toUpperCase()}`);
            const currentVal = parseInt(input.value) || 1;
            
            if (dir === 'plus') {
                input.value = Math.min(20, currentVal + 1);
            } else {
                input.value = Math.max(1, currentVal - 1);
            }
            
            updatePeriodic();
        });
    });
    
    // Make Supercell button
    const makeSupercellBtn = document.getElementById('makeSupercellBtn');
    if (makeSupercellBtn) {
        makeSupercellBtn.addEventListener('click', () => {
            if (!currentStructure) return;
            
            const { a, b, c } = settings.periodic;
            if (a === 1 && b === 1 && c === 1) {
                statusText.textContent = 'Already 1×1×1 - nothing to convert';
                statusText.className = '';
                return;
            }
            
            const converted = convertToSupercell();
            if (converted) {
                renderStructure(currentStructure, true); // Preserve camera angle
                updateUI(currentStructure);
                updateSupercellButtonState(); // Disable button since now 1×1×1
                statusText.textContent = `Converted to ${a}×${b}×${c} supercell`;
                statusText.className = 'success';
            }
        });
    }
}

// Convert periodic images to actual supercell
function convertToSupercell() {
    if (!currentStructure) return false;
    
    const { a: na, b: nb, c: nc } = getPeriodicRepeats(currentStructure);
    
    // Skip if already 1×1×1
    if (na === 1 && nb === 1 && nc === 1) return false;

    let prepared;
    try {
        prepared = CrystalStructure.buildSupercell(currentStructure, [na, nb, nc]);
    } catch (error) {
        statusText.textContent = `Cannot create supercell: ${error.message}`;
        statusText.className = 'error';
        return false;
    }
    const newAtoms = prepared.atoms.map(atom => ({
        ...atom, position: new THREE.Vector3(atom.position.x, atom.position.y, atom.position.z)
    }));
    
    // Keep all parsed metadata in the undo snapshot as formats evolve.
    const oldStructure = snapshotStructure(currentStructure);
    pushUndo({
        type: 'make_supercell',
        oldStructure: oldStructure,
        oldPeriodic: { a: na, b: nb, c: nc },
        selectionBefore: captureSelectionState()
    });

    // A periodic copy becomes a real atom without moving. Remap its identity
    // before rebuilding meshes so measurements keep the same physical points.
    // A boundary copy beyond the converted cells stays a copy of the new atom
    // that lands in the matching cell, one supercell vector away.
    const counts = { a: na, b: nb, c: nc };
    selectedAtoms = selectedAtoms.map(atom => {
        if (!atom.isGhost) return atom;
        const source = {}, offset = {};
        for (const axis of ['a', 'b', 'c']) {
            const count = counts[axis];
            source[axis] = ((atom.cellOffset[axis] % count) + count) % count;
            offset[axis] = (atom.cellOffset[axis] - source[axis]) / count;
        }
        const index = prepared.atomSources.findIndex(candidate => candidate.originalIndex === atom.originalIndex
            && candidate.cellOffset.a === source.a
            && candidate.cellOffset.b === source.b
            && candidate.cellOffset.c === source.c);
        const stillCopy = offset.a !== 0 || offset.b !== 0 || offset.c !== 0;
        return stillCopy ? { ...atom, index: `ghost_${index}_${offset.a}${offset.b}${offset.c}`, originalIndex: index, isGhost: true, cellOffset: offset }
            : { ...atom, index, originalIndex: index, isGhost: false, cellOffset: null };
    });
    
    // Update structure
    currentStructure.atoms = newAtoms;
    currentStructure.lattice = prepared.lattice;
    currentStructure.nextAtomId = prepared.nextAtomId;
    currentStructure.comment = `${currentStructure.comment} (${na}×${nb}×${nc} supercell)`;
    
    // Recalculate element counts
    recalculateElementCounts();
    
    // Reset periodicity to 1×1×1
    settings.periodic = { a: 1, b: 1, c: 1 };
    document.getElementById('periodicA').value = 1;
    document.getElementById('periodicB').value = 1;
    document.getElementById('periodicC').value = 1;
    document.getElementById('periodicADisplay').textContent = 1;
    document.getElementById('periodicBDisplay').textContent = 1;
    document.getElementById('periodicCDisplay').textContent = 1;
    
    return true;
}

// The Edit toggle: pressed is edit mode, released is measure mode.
function setupModeToggle() {
    document.getElementById('editToggle').addEventListener('click', () => {
        setInteractionMode(currentMode === 'edit' ? 'measure' : 'edit');
    });
}

function setInteractionMode(mode, restoringSelection = false) {
    const panelTitle = document.getElementById('actionPanelTitle');
    if (mode === currentMode) return;

    // Block edit mode for XDATCAR files
    if (mode === 'edit' && currentStructure && !CrystalDocument.capabilities(currentStructure).editable) {
        statusText.textContent = 'Edit mode is disabled for trajectory files (XDATCAR)';
        statusText.className = '';
        return;
    }

    // Update mode
    cancelEditDrag(null, 'mode changed');
    cancelCameraAlignment();
    // Record a mode-induced clear in the context that owns the selection.
    if (!restoringSelection && mode === 'measure' && !isMeasurementSelection) clearSelection();
    currentMode = mode;
    if (mode !== 'edit') setBoxSelectMode(false);

    // Update button states
    updateModeButtonState();

    // Update panel title
    if (panelTitle) {
        panelTitle.textContent = mode === 'measure' ? '📐 Measurements' : '✏️ Edit Actions';
    }

    // Preserve measurement selection when switching modes
    // If switching FROM measure mode with a selection, mark it as preserved measurement
    if (!restoringSelection && mode === 'edit' && selectedAtoms.length > 0) {
        isMeasurementSelection = true;
        // Keep measurement visuals visible - don't clear
    } else if (!restoringSelection && mode === 'measure') {
        // Rebuild visuals for the preserved measurement.
        rebuildSelectionVisuals();
    }

    // Update UI for the new mode
    updateUI_forCurrentMode();

    // Update body class for CSS styling
    if (mode === 'measure') {
        document.body.classList.remove('edit-mode-active');
    } else {
        document.body.classList.add('edit-mode-active');
    }

    // Show/hide Edit Mode controls (Make Supercell, etc.)
    const editModeControls = document.getElementById('editModeControls');
    if (editModeControls) {
        editModeControls.style.display = (mode === 'edit') ? 'block' : 'none';
    }

    // Periodicity controls are now enabled in both modes
    // Ghost atoms are visible but not editable in Edit mode

    // Update status
    if (statusText.textContent.indexOf('supercell') === -1) {
        statusText.textContent = mode === 'measure'
            ? 'Measure mode: Click atoms to measure distances/angles'
            : 'Edit mode: Click to select, drag to move atoms';
    }

    // Update vacuum handles (only visible in edit mode when aligned to axis)
    updateVacuumHandles();
}

function updateModeButtonState() {
    const toggle = document.getElementById('editToggle');
    if (!toggle || typeof toggle.setAttribute !== 'function') return;
    const editing = currentMode === 'edit';
    toggle.classList.toggle('active', editing);
    toggle.setAttribute('aria-pressed', String(editing));
}

function generatePOSCAR() { return crystalFormats.generatePOSCAR(currentStructure); }
function generateXYZ() { return crystalFormats.generateXYZ(currentStructure); }

// Camera actions share one controller and the app's animation loop.
function getCameraPose() {
    return { quaternion: camera.quaternion.clone(), pivot: controls.target.clone(),
        distance: camera.position.distanceTo(controls.target), zoom: camera.zoom };
}

function updateCameraClipping() {
    if (!cameraMath || !structureGroup) return;
    const bounds = getStructureBounds(), pose = getCameraPose();
    if (camera.isOrthographicCamera) {
        const distance = cameraMath.orthographicDistance(bounds, pose);
        if (distance > pose.distance) {
            // Orthographic magnification depends on zoom, not eye distance.
            // Keep geometry in front of the eye so both rendering and the
            // controls' camera-origin picking rays can reach every visible atom.
            pose.distance = distance;
            camera.position.copy(cameraMath.position(pose));
            camera.updateMatrixWorld(true);
        }
    }
    const planes = cameraMath.clipping(bounds, pose);
    if (camera.near === planes.near && camera.far === planes.far) return;
    camera.near = planes.near;
    camera.far = planes.far;
    camera.updateProjectionMatrix();
}

// A rebuild of the same document keeps the camera where it was. Trajectory
// playback rebuilds whenever the boundary copies change, so this must not
// cancel a drag or motion in progress: it only refreshes the clipping planes
// and the vacuum handles for the new scene bounds.
function restoreCameraAfterRebuild(pose) {
    cleanupVacuumHandles();
    updateVacuumHintUI(null);
    applyCameraPose(pose);
    updateVacuumHandles();
}

function applyCameraPose(pose) {
    camera.quaternion.copy(pose.quaternion);
    camera.up.set(0, 1, 0).applyQuaternion(pose.quaternion);
    controls.target.copy(pose.pivot);
    camera.position.copy(cameraMath.position(pose));
    camera.zoom = pose.zoom;
    // Zoom changes projection even when the depth planes remain unchanged.
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    updateCameraClipping();
    requestRender();
}

// TrackballControls stores inertia in private closure state. Recreate its
// adapter to discard that state while preserving the camera and public options.
function clearManualCameraMotion() {
    cameraManualInputPending = false;
    if (typeof THREE.TrackballControls !== 'function' || !renderer) return;
    const previous = controls;
    const pivot = previous ? previous.target.clone() : new THREE.Vector3();
    const position = camera.position.clone(), quaternion = camera.quaternion.clone(), up = camera.up.clone();
    const enabled = previous ? previous.enabled : true;
    if (previous) previous.dispose();
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.target.copy(pivot);
    camera.position.copy(position); camera.quaternion.copy(quaternion); camera.up.copy(up);
    controls.rotateSpeed = previous?.rotateSpeed ?? 3;
    controls.zoomSpeed = previous?.zoomSpeed ?? 1.2;
    controls.panSpeed = previous?.panSpeed ?? 0.8;
    controls.staticMoving = previous?.staticMoving ?? false;
    controls.dynamicDampingFactor = previous?.dynamicDampingFactor ?? 0.15;
    controls.noRotate = previous?.noRotate ?? false;
    controls.noZoom = previous?.noZoom ?? false;
    controls.noPan = previous?.noPan ?? false;
    controls.minDistance = 2; controls.maxDistance = Infinity;
    controls.keys = []; // Camera keys must not intercept coordinate/text input.
    controls.enabled = enabled;
    controls.update();
    manualCameraTickAt = performance.now();
    controls.addEventListener('change', () => {
        lastCameraMotionAt = performance.now();
        requestRender();
    });
    controls.addEventListener('start', () => {
        if (vacuumDragState.isDragging) return;
        cameraController.begin(cameraInputKind, performance.now());
        cleanupVacuumHandles();
        updateVacuumHintUI(null);
    });
    controls.addEventListener('end', () => {
        const time = performance.now();
        controls.update(); // Consume the gesture's final input before measuring it.
        manualCameraTickAt = time;
        cameraController.end(time, cameraManualInputPending);
        cameraManualInputPending = false;
        if (!cameraController.settling) updateVacuumHandles();
    });
}

function cancelCameraAlignment() {
    if (!cameraController) return;
    const transitioning = cameraController.transitioning;
    cameraController.cancel();
    if (!transitioning) clearManualCameraMotion();
}

function initCameraController() {
    cameraMath = CrystalCamera.createMath(THREE);
    clearManualCameraMotion();
    cameraController = CrystalCamera.createController({
        math: cameraMath, getPose: getCameraPose, applyPose: applyCameraPose,
        clearMotion: clearManualCameraMotion,
        getAxes: () => hasLattice(currentStructure) ? cameraMath.axes(currentStructure.lattice) : [],
        reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onStart: () => { cleanupVacuumHandles(); updateVacuumHintUI(null); requestRender(); },
        onComplete: (kind, name) => {
            updateVacuumHandles();
            if (kind === 'automatic' || kind === 'explicit') {
                statusText.textContent = `Aligned to ${name} axis`;
                statusText.className = '';
            }
            requestRender();
        }
    });
    // Capture before TrackballControls begins a gesture, so replacing its
    // adapter cannot discard the pointerdown that should interrupt a transition.
    document.addEventListener('pointerdown', event => {
        if (activeEditPointerId !== null) return;
        cancelCameraAlignment();
        if (event.target === renderer.domElement) {
            cameraInputKind = event.button === 0 ? 'rotate' : event.button === 1 ? 'zoom' : 'pan';
            cameraInputPosition = [event.clientX, event.clientY];
        } else updateVacuumHandles();
    }, { capture: true });
    // A scroll or pinch arrives as a burst of wheel events, dozens per frame
    // from a trackpad. Cancelling an alignment rebuilds the controls, which
    // discards the zoom input the burst has queued but not yet applied, so
    // only the burst's first event (or one that interrupts an alignment
    // animation) does that; the rest only keep an alignment from starting.
    let lastWheelAt = -Infinity;
    document.addEventListener('wheel', event => {
        if (activeEditPointerId !== null) return;
        const now = performance.now();
        if (cameraController.transitioning || now - lastWheelAt > WHEEL_BURST_GAP_MS) cancelCameraAlignment();
        else cameraController.cancel();
        lastWheelAt = now;
        cameraInputKind = 'zoom';
        if (event.target !== renderer.domElement) updateVacuumHandles();
    }, { capture: true, passive: true });
    setupPinchZoom();
    renderer.domElement.addEventListener('touchstart', event => {
        cancelCameraAlignment();
        cameraInputKind = event.touches.length === 1 ? 'rotate' : 'zoom';
        cameraInputPosition = event.touches.length === 1 ? [event.touches[0].clientX, event.touches[0].clientY] : null;
    }, { capture: true, passive: true });
    // Mark input before the controls consume it. Damping-only updates still
    // contribute to angular speed, but cannot masquerade as a deliberate drag.
    const markRotationInput = (x, y) => {
        if (!cameraController.interacting || cameraInputKind !== 'rotate') return;
        if (cameraInputPosition && (x !== cameraInputPosition[0] || y !== cameraInputPosition[1])) {
            cameraManualInputPending = true;
        }
        cameraInputPosition = [x, y];
    };
    document.addEventListener('pointermove', event => {
        // The pinned controls consume touchmove, not touch pointermove. Marking
        // both could attribute a damping step to unconsumed touch coordinates.
        if (event.pointerType !== 'touch') markRotationInput(event.clientX, event.clientY);
    }, { capture: true });
    renderer.domElement.addEventListener('touchmove', event => {
        if (event.touches.length === 1) markRotationInput(event.touches[0].clientX, event.touches[0].clientY);
    }, { capture: true, passive: true });
    const interrupt = () => { cancelCameraAlignment(); updateVacuumHandles(); };
    window.addEventListener('blur', interrupt);
    document.addEventListener('keydown', event => {
        if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key) && activeEditPointerId === null) interrupt();
    }, { capture: true });
    renderer.domElement.addEventListener('pointercancel', interrupt);
}

// TrackballControls scales panning by the camera distance, which is arbitrary
// for an orthographic view and made a right-drag move the structure by a small
// fraction of the pointer motion. Choose the speed at which the structure
// follows the pointer one-to-one in the pivot plane for the projection in use.
function syncPanSpeed() {
    const width = renderer?.domElement?.clientWidth;
    if (!(width > 0) || !camera?.position || !controls?.target) return;
    const distance = camera.position.distanceTo(controls.target);
    if (!(distance > 0) || !Number.isFinite(distance)) return;
    // With damping, each update applies the whole remaining pointer delta
    // while only closing a fraction of it, so the steps sum to 1/factor.
    const damping = controls.staticMoving ? 1 : controls.dynamicDampingFactor;
    controls.panSpeed = damping * (camera.isOrthographicCamera ? width / distance
        : 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
}

function updateCamera(time) {
    if (!cameraController) { syncPanSpeed(); controls.update(); return; }
    const before = cameraController.phase;
    if (!cameraController.transitioning) {
        // The legacy controls damping is per-update. A fixed simulation step
        // keeps its decay consistent across display rates, with bounded catch-up.
        const step = CrystalCamera.POLICY.controlsStepMilliseconds;
        if (time - manualCameraTickAt > CrystalCamera.POLICY.controlsCatchUpMilliseconds) manualCameraTickAt = time - step;
        while (time - manualCameraTickAt >= step && !cameraController.transitioning) {
            syncPanSpeed();
            controls.update();
            manualCameraTickAt += step;
            cameraController.tick(manualCameraTickAt, cameraManualInputPending);
            cameraManualInputPending = false;
        }
    }
    if (cameraController.transitioning) {
        manualCameraTickAt = time;
        cameraController.tick(time);
    }
    const handleAxis = currentMode === 'edit' && settings.showCell && !vacuumDragState.isDragging
        ? getCurrentAxisAlignment()?.axis || null : null;
    if (cameraController.phase === 'idle' && (before !== 'idle'
        || vacuumDragState.currentAxis !== handleAxis)) updateVacuumHandles();
}

// ==========================================
// VACUUM DRAG FEATURE
// Drag cell faces to add vacuum space when viewing along ±a, ±b, ±c
// ==========================================

// Constants for vacuum drag
const VACUUM_CONFIG = {
    alignmentThreshold: 0.996,  // cos(5°) - camera alignment detection
    atomPadding: 0.5,           // Angstroms - minimum distance from atoms to cell boundary
    dragSensitivity: 0.03,      // Mouse movement to length conversion
    edgeDetectWidth: 0.5,       // Minimum width for edge detection boxes (reduced to avoid interference)
    edgeDetectRatio: 0.06,      // Edge detection width as ratio of edge length (reduced)
    highlightColor: 0x9b5de5    // Purple for all face highlights
};

// Axis utilities
const AXIS_NAMES = ['a', 'b', 'c'];
const AXIS_TO_INDEX = { 'a': 0, 'b': 1, 'c': 2 };

function axisToIndex(axis) {
    return AXIS_TO_INDEX[axis];
}

function indexToAxis(idx) {
    return AXIS_NAMES[idx];
}

function getLatticeVector(lattice, idx) {
    return new THREE.Vector3(lattice[idx][0], lattice[idx][1], lattice[idx][2]);
}

function getAllLatticeVectors(lattice) {
    return [0, 1, 2].map(function(i) { return getLatticeVector(lattice, i); });
}

// Vacuum drag state
let vacuumDragState = {
    active: false,
    currentAxis: null,          // View axis ('a', 'b', or 'c')
    handles: [],                // Edge detector meshes
    highlightLine: null,        // Highlight line for hovered face
    hoveredEdge: null,          // Currently hovered edge mesh
    isDragging: false,
    dragExtendAxis: null,       // Axis being extended
    dragHandle: null,           // 'near' or 'far'
    startX: 0,
    startY: 0,
    startLatticeLen: 0,
    screenDir: null,            // Screen-space drag direction
    originalLattice: null,      // Original lattice for restoration
    originalAtomPositions: null // Original atom positions
};

// Check if camera is aligned to a principal axis
function getCurrentAxisAlignment() {
    if (!currentStructure || !currentStructure.lattice) return null;
    
    const lattice = currentStructure.lattice;
    const latticeVecs = getAllLatticeVectors(lattice);
    const normalizedVecs = latticeVecs.map(v => v.clone().normalize());
    
    const cameraDir = new THREE.Vector3()
        .subVectors(camera.position, controls.target)
        .normalize();
    
    // Find best aligned axis
    const candidates = AXIS_NAMES
        .map((name, idx) => ({
            axis: name,
            idx: idx,
            dot: Math.abs(cameraDir.dot(normalizedVecs[idx])),
            sign: Math.sign(cameraDir.dot(normalizedVecs[idx])),
            vec: latticeVecs[idx],
            norm: normalizedVecs[idx]
        }))
        .filter(c => c.dot > VACUUM_CONFIG.alignmentThreshold)
        .sort((a, b) => b.dot - a.dot);
    
    return candidates[0] || null;
}

// Clean up vacuum handles and highlights
function cleanupVacuumHandles() {
    clearVacuumHighlight();
    vacuumDragState.handles.forEach(h => {
        if (h.parent) h.parent.remove(h);
        if (h.geometry) h.geometry.dispose();
        if (h.material) h.material.dispose();
    });
    vacuumDragState.handles = [];
    vacuumDragState.active = false;
    vacuumDragState.currentAxis = null;
}

// Create edge detector box for vacuum drag
function createEdgeDetector(edgeStart, edgeVec, extendAxisName, handleType, facePoints) {
    const edgeLength = edgeVec.length();
    const detectWidth = Math.max(VACUUM_CONFIG.edgeDetectWidth, edgeLength * VACUUM_CONFIG.edgeDetectRatio);
    
    const geometry = new THREE.BoxGeometry(detectWidth, edgeLength, detectWidth);
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        // Defense in depth: even accidental rendering cannot obscure cell lines.
        depthWrite: false,
        colorWrite: false,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.layers.set(CELL_PICKING_LAYER);
    mesh.position.copy(edgeStart.clone().add(edgeVec.clone().multiplyScalar(0.5)));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), edgeVec.clone().normalize());
    
    mesh.userData = {
        vacuumEdge: true,
        extendAxis: extendAxisName,
        handleType: handleType,
        faceEdgePoints: facePoints,
        edgeStart: edgeStart.clone(),
        edgeEnd: edgeStart.clone().add(edgeVec)
    };
    
    return mesh;
}

// Get face corner points for highlighting
function getFaceCornerPoints(lattice, extendAxisIdx, handleType) {
    const axes = getAllLatticeVectors(lattice);
    const otherAxes = [0, 1, 2].filter(i => i !== extendAxisIdx);
    const [vec1, vec2] = [axes[otherAxes[0]], axes[otherAxes[1]]];
    const offset = handleType === 'far' ? axes[extendAxisIdx] : new THREE.Vector3(0, 0, 0);
    
    return [
        offset.clone(),
        offset.clone().add(vec1),
        offset.clone().add(vec1).add(vec2),
        offset.clone().add(vec2)
    ];
}

// Create/update vacuum drag handles
function updateVacuumHandles() {
    cleanupVacuumHandles();
    
    if (currentMode !== 'edit' || !settings.showCell || cameraController?.transitioning || cameraController?.interacting || cameraController?.settling
        || vacuumDragState.isDragging || !hasLattice(currentStructure)) {
        updateVacuumHintUI(null);
        return;
    }
    
    const alignment = getCurrentAxisAlignment();
    if (!alignment) {
        vacuumDragState.active = false;
        vacuumDragState.currentAxis = null;
        updateVacuumHintUI(null);
        return;
    }
    
    vacuumDragState.active = true;
    vacuumDragState.currentAxis = alignment.axis;
    updateVacuumHintUI(alignment.axis);
    
    const { lattice } = currentStructure;
    const viewAxisIdx = alignment.idx;
    const viewAxisVec = alignment.vec;
    const perpAxes = [0, 1, 2].filter(i => i !== viewAxisIdx);
    
    // Create edge detectors for each perpendicular axis
    for (const extendAxisIdx of perpAxes) {
        const extendAxisName = indexToAxis(extendAxisIdx);
        const extendAxisVec = getLatticeVector(lattice, extendAxisIdx);
        const edgeAxisIdx = perpAxes.find(i => i !== extendAxisIdx);
        const edgeAxisVec = getLatticeVector(lattice, edgeAxisIdx);
        
        // Edge positions: 2 on near face (at 0), 2 on far face (at extendAxis)
        const edgeConfigs = [
            { start: new THREE.Vector3(0, 0, 0), type: 'near' },
            { start: viewAxisVec.clone(), type: 'near' },
            { start: extendAxisVec.clone(), type: 'far' },
            { start: extendAxisVec.clone().add(viewAxisVec), type: 'far' }
        ];
        
        for (const config of edgeConfigs) {
            const facePoints = getFaceCornerPoints(lattice, extendAxisIdx, config.type);
            const detector = createEdgeDetector(config.start, edgeAxisVec, extendAxisName, config.type, facePoints);
            structureGroup.add(detector);
            vacuumDragState.handles.push(detector);
        }
    }
}

// Update UI hint for vacuum drag availability
function updateVacuumHintUI(axis) {
    const hint = document.querySelector('.vacuum-hint');
    if (!hint) return;
    
    if (axis) {
        hint.textContent = `✓ Aligned to ${axis}-axis. Drag edges to add vacuum.`;
        hint.classList.add('active');
    } else {
        hint.textContent = '💡 Align to ±a/b/c axis to drag cell edges and add vacuum';
        hint.classList.remove('active');
    }
}

// Get atom extent along a lattice direction (Cartesian projection)
function getAtomExtentAlongDirection(direction, atomPositions) {
    const dir = direction.clone().normalize();
    let min = Infinity, max = -Infinity;
    
    atomPositions.forEach(pos => {
        const v = pos instanceof THREE.Vector3 ? pos : new THREE.Vector3(pos.x, pos.y, pos.z);
        const proj = v.dot(dir);
        min = Math.min(min, proj);
        max = Math.max(max, proj);
    });
    
    return { min, max };
}

// Calculate screen-space direction for a 3D vector
function getScreenSpaceDirection(vec3) {
    const start = new THREE.Vector3(0, 0, 0).project(camera);
    const end = vec3.clone().project(camera);
    return new THREE.Vector2(end.x - start.x, end.y - start.y).normalize();
}

// Get appropriate cursor for vacuum drag based on screen-space direction
function getVacuumDragCursor(extendAxis) {
    if (!currentStructure || !currentStructure.lattice) return 'move';
    
    const axisIdx = axisToIndex(extendAxis);
    const axisVec = getLatticeVector(currentStructure.lattice, axisIdx);
    const screenDir = getScreenSpaceDirection(axisVec);
    
    // If the axis is more horizontal in screen space, use ew-resize (left-right)
    // If more vertical, use ns-resize (up-down)
    const absX = Math.abs(screenDir.x);
    const absY = Math.abs(screenDir.y);
    
    if (absX > absY) {
        return 'ew-resize'; // Left-right arrow
    } else {
        return 'ns-resize'; // Up-down arrow
    }
}

// Start vacuum drag operation
function startVacuumDrag(handleInfo, event) {
    if (!vacuumDragState.active || currentMode !== 'edit' || !handleInfo) return false;
    cancelCameraAlignment();
    
    const axisIdx = axisToIndex(handleInfo.extendAxis);
    const axisVec = getLatticeVector(currentStructure.lattice, axisIdx);
    
    Object.assign(vacuumDragState, {
        isDragging: true,
        dragExtendAxis: handleInfo.extendAxis,
        dragHandle: handleInfo.handleType,
        startX: event.clientX,
        startY: event.clientY,
        startLatticeLen: axisVec.length(),
        screenDir: getScreenSpaceDirection(axisVec),
        originalLattice: JSON.parse(JSON.stringify(currentStructure.lattice)),
        originalAtomPositions: currentStructure.atoms.map(a => ({
            x: a.position.x, y: a.position.y, z: a.position.z
        }))
    });
    
    return true;
}

// Calculate drag delta from mouse movement
function calculateDragDelta(event) {
    const { screenDir, dragHandle, startX, startY } = vacuumDragState;
    const deltaX = event.clientX - startX;
    const deltaY = startY - event.clientY; // Inverted Y
    const dragAmount = deltaX * screenDir.x + deltaY * screenDir.y;
    const dirMultiplier = dragHandle === 'far' ? 1 : -1;
    return dragAmount * VACUUM_CONFIG.dragSensitivity * dirMultiplier;
}

// Handle vacuum drag movement
function updateVacuumDrag(event) {
    if (!vacuumDragState.isDragging) return;
    
    const { dragExtendAxis: axis, dragHandle, originalLattice, originalAtomPositions } = vacuumDragState;
    const axisIdx = axisToIndex(axis);
    let prepared;
    try {
        prepared = CrystalStructure.prepareCellResize(currentStructure, originalLattice, originalAtomPositions,
            axisIdx, dragHandle, calculateDragDelta(event));
    } catch (error) {
        statusText.textContent = `Cell resize stopped: ${error.message}`;
        statusText.className = 'warning';
        return false;
    }
    // Commit only after every coordinate and the cell pass validation.
    currentStructure.lattice = prepared.lattice;
    prepared.updates.forEach(({ position, fractional }, index) => {
        currentStructure.atoms[index].position.copy(position);
        currentStructure.atoms[index].fractional = fractional;
    });
    updateDirtyIndicator();
    renderStructure(currentStructure, true);
    createDragFaceHighlight(axis, dragHandle);
    
    // Update measurements in real-time during vacuum drag
    if (isMeasurementSelection && selectedAtoms.length > 0) {
        // Update positions in selectedAtoms from the new mesh positions
        selectedAtoms.forEach(atom => {
            if (atom.mesh) {
                atom.mesh.getWorldPosition(atom.position);
            }
        });
        updateMeasurements();
        updateEditUI();
    }
    
    // Update status with current axis length
    const finalLen = getLatticeVector(currentStructure.lattice, axisIdx).length();
    statusText.textContent = `${axis}-axis: ${finalLen.toFixed(3)} Å`;
    statusText.className = '';
}

// Create face highlight during drag
function createDragFaceHighlight(extendAxis, handleType) {
    if (!currentStructure || !currentStructure.lattice) return;
    
    const facePoints = getFaceCornerPoints(currentStructure.lattice, axisToIndex(extendAxis), handleType);
    facePoints.push(facePoints[0].clone()); // Close the loop
    
    const material = new THREE.LineBasicMaterial({ 
        color: VACUUM_CONFIG.highlightColor, 
        linewidth: 3,
        transparent: true,
        opacity: 1.0
    });
    
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(facePoints), material);
    line.renderOrder = 999;
    line.name = 'dragHighlight';
    structureGroup.add(line);
}

function hasVacuumDragChanges() {
    const { isDragging, originalLattice, originalAtomPositions } = vacuumDragState;
    return Boolean(isDragging && originalLattice && originalAtomPositions && currentStructure && (
        currentStructure.lattice.some((vector, axis) => vector.some((value, component) => Math.abs(value - originalLattice[axis][component]) >= 1e-10))
        || currentStructure.atoms.some((atom, index) => atom.position.distanceTo(originalAtomPositions[index]) >= 1e-10)
    ));
}

// Clear state shared by completed and canceled cell drags.
function resetVacuumDragState() {
    Object.assign(vacuumDragState, {
        isDragging: false,
        dragHandle: null,
        dragExtendAxis: null,
        originalLattice: null,
        originalAtomPositions: null
    });
}

// End vacuum drag operation
function endVacuumDrag() {
    if (!vacuumDragState.isDragging) return;
    
    const { dragExtendAxis: axis, originalLattice, originalAtomPositions } = vacuumDragState;
    
    // Save for undo before clearing (unified undo stack)
    // Only save if there was an actual change
    const changed = hasVacuumDragChanges();
    if (changed) {
        pushUndo({
            type: 'vacuum_drag',
            oldLattice: originalLattice.map(v => [...v]),
            oldAtomPositions: originalAtomPositions.map(p => ({ x: p.x, y: p.y, z: p.z }))
        });
    } else if (originalLattice && originalAtomPositions) {
        currentStructure.lattice = originalLattice.map(vector => [...vector]);
        currentStructure.atoms.forEach((atom, index) => atom.position.copy(originalAtomPositions[index]));
    }
    currentStructure.atoms.forEach(atom => {
        atom.fractional = cartesianToFractional(atom.position, currentStructure.lattice);
    });
    
    // Reset drag state
    resetVacuumDragState();
    updateDirtyIndicator();
    
    clearVacuumHighlight();
    
    // Final render and status
    if (currentStructure && axis) {
        const newLen = getLatticeVector(currentStructure.lattice, axisToIndex(axis)).length();
        renderStructure(currentStructure, true);
        updateUI(currentStructure);
        statusText.textContent = changed ? `Cell ${axis}-axis set to ${newLen.toFixed(3)} Å` : 'Cell geometry unchanged';
        statusText.className = changed ? 'success' : '';
    }
}

// Check for vacuum edge intersection
function checkVacuumHandleIntersection(event, showHighlight = false) {
    if (!vacuumDragState.active || vacuumDragState.handles.length === 0) {
        if (showHighlight) clearVacuumHighlight();
        return null;
    }
    
    // A rendered atom (including a noneditable ghost) owns its visible pixels.
    // A larger invisible resize detector must never intercept them.
    if (getAtomIntersection(event)) {
        if (showHighlight) clearVacuumHighlight();
        return null;
    }

    // New handles must be pickable before the next (possibly throttled) render.
    camera.updateWorldMatrix(true, false);
    vacuumDragState.handles.forEach(handle => handle.updateWorldMatrix(true, false));
    raycaster.setFromCamera(getMouseNDC(event), camera);
    const intersects = raycaster.intersectObjects(vacuumDragState.handles);
    
    if (intersects.length === 0) {
        if (showHighlight) clearVacuumHighlight();
        return null;
    }
    
    const hitEdge = intersects[0].object;
    if (showHighlight) showVacuumHighlight(hitEdge);
    
    return {
        extendAxis: hitEdge.userData.extendAxis,
        handleType: hitEdge.userData.handleType
    };
}

// Create face outline for highlighting
function createFaceOutline(facePoints, handleType) {
    const material = new THREE.LineBasicMaterial({ 
        color: VACUUM_CONFIG.highlightColor, 
        linewidth: 3,
        transparent: true,
        opacity: 1.0
    });
    
    const points = [...facePoints, facePoints[0].clone()];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    line.renderOrder = 999;
    return line;
}

// Show highlight for hovered edge
function showVacuumHighlight(edgeMesh) {
    clearVacuumHighlight();
    
    const { faceEdgePoints, handleType, edgeStart, edgeEnd } = edgeMesh.userData;
    if (!faceEdgePoints) return;
    
    // Create a group to hold face outline
    const highlightGroup = new THREE.Group();
    highlightGroup.name = 'vacuumHighlight';
    
    // Add face outline
    const faceOutline = createFaceOutline(faceEdgePoints, handleType);
    highlightGroup.add(faceOutline);
    
    // Highlight the actual unit cell edge by changing its color
    if (edgeStart && edgeEnd) {
        const tolerance = 0.01;
        unitCellEdgeLines.forEach(line => {
            const lineStart = line.userData.startCorner;
            const lineEnd = line.userData.endCorner;
            
            // Check if this line matches the hovered edge (either direction)
            const matchesForward = lineStart.distanceTo(edgeStart) < tolerance && lineEnd.distanceTo(edgeEnd) < tolerance;
            const matchesReverse = lineStart.distanceTo(edgeEnd) < tolerance && lineEnd.distanceTo(edgeStart) < tolerance;
            
            if (matchesForward || matchesReverse) {
                // Change this edge to purple
                line.material.color.setHex(VACUUM_CONFIG.highlightColor);
                line.material.opacity = 1.0;
                line.userData.wasHighlighted = true;
            }
        });
    }
    
    structureGroup.add(highlightGroup);
    vacuumDragState.highlightLine = highlightGroup;
    vacuumDragState.hoveredEdge = edgeMesh;
    requestRender();
}

// Clear vacuum highlight
function clearVacuumHighlight() {
    const highlight = vacuumDragState.highlightLine;
    if (highlight) {
        if (highlight.parent) highlight.parent.remove(highlight);
        
        // Dispose of all children if it's a group
        if (highlight.children) {
            highlight.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        // Also dispose if it's a single line
        if (highlight.geometry) highlight.geometry.dispose();
        if (highlight.material) highlight.material.dispose();
        
        vacuumDragState.highlightLine = null;
    }
    
    // Restore original color of any highlighted unit cell edges
    unitCellEdgeLines.forEach(line => {
        if (line.userData.wasHighlighted) {
            line.material.color.setHex(0x00f5d4); // Original cyan color
            line.material.opacity = 0.6;
            line.userData.wasHighlighted = false;
        }
    });
    
    vacuumDragState.hoveredEdge = null;
    requestRender();
}

// Export in the source structure's format.
function exportStructure() {
    if (!currentStructure) {
        statusText.textContent = 'No structure to export';
        statusText.className = '';
        return;
    }
    if (draggedAtom || vacuumDragState.isDragging) {
        onMouseUp({ button: 0, pointerId: activeEditPointerId });
    }
    if (currentStructure.atoms.length === 0) {
        statusText.textContent = 'Cannot export an empty structure. Add an atom or Undo the deletion.';
        statusText.className = 'warning';
        return;
    }
    
    let content, filename;
    let omittedSourceData = false;
    const sourceName = (currentFilename || 'structure').replace(/[\\/]/g, '_');
    const stem = sourceName.replace(/\.(xyz|xdatcar|vasp|poscar|cif)$/i, '').replace(/(?:_edited)+$/i, '') || 'structure';
    
    if (currentStructure.isXDATCAR) {
        content = generateXDATCAR();
        filename = `${stem}_edited.xdatcar`;
    } else if (currentStructure.isXYZ) {
        if (editHistory.currentEditRevision === 0 && currentSourceText !== null) {
            content = currentSourceText;
        } else {
            const staleMetadata = crystalFormats.omittedXYZMetadata(currentStructure);
            if (currentStructure.hasAdditionalProperties || staleMetadata.length) {
                const reasons = [];
                if (currentStructure.hasAdditionalProperties) reasons.push('This XYZ has additional atom data, such as charges or forces. The edited export will omit that data.');
                if (staleMetadata.length) reasons.push(`Geometry has changed. The edited export will omit source metadata (${[...new Set(staleMetadata.map(field => field.key))].join(', ')}) because it may no longer describe this structure.`);
                if (!window.confirm(`${reasons.join(' ')} Export species and positions only?`)) {
                    statusText.textContent = 'Export canceled; source XYZ data was not discarded';
                    statusText.className = 'warning';
                    return;
                }
                omittedSourceData = true;
            }
            content = generateXYZ();
        }
        filename = `${stem}_edited.xyz`;
    } else {
        if (currentStructure.hasAdditionalSections && editHistory.currentEditRevision === 0 && currentSourceText !== null) {
            content = currentSourceText;
        } else {
            if (currentStructure.hasAdditionalSections) {
                if (!window.confirm('This POSCAR has additional data after the atom positions. The edited export will omit that data. Export the structure only?')) {
                    statusText.textContent = 'Export canceled; additional POSCAR data was not discarded';
                    statusText.className = 'warning';
                    return;
                }
                omittedSourceData = true;
            }
            content = generatePOSCAR();
        }
        filename = `${stem}_edited.poscar`;
    }
    
    if (!content) return;
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    try {
        a.click();
    } catch (error) {
        statusText.textContent = `Could not start ${filename} download`;
        statusText.className = 'error';
        return;
    } finally {
        // Keep the Blob URL available while the browser starts its download.
        setTimeout(() => {
            a.remove();
            URL.revokeObjectURL(url);
        }, 60000);
    }
    editHistory.markSaved();
    updateDirtyIndicator();
    
    const fileType = currentStructure.isXDATCAR ? 'XDATCAR' : (currentStructure.isXYZ ? 'XYZ' : 'POSCAR');
    statusText.textContent = omittedSourceData
        ? `Started ${fileType} download without additional source data`
        : `Started ${fileType} download`;
    statusText.className = omittedSourceData ? 'warning' : 'success';
}

function generateXDATCAR() { return crystalFormats.generateXDATCAR(currentStructure); }

// ============================================
// XDATCAR Timeline / Frame Navigation
// ============================================

// Show timeline panel
function showTimelinePanel() {
    const panel = document.getElementById('timelinePanel');
    if (panel) {
        panel.classList.remove('hidden');
        // Timeline changes layout height - renderer must resize to match
        requestAnimationFrame(() => onWindowResize());
    }
}

// Hide timeline panel
function hideTimelinePanel() {
    const panel = document.getElementById('timelinePanel');
    if (panel) {
        panel.classList.add('hidden');
        // Restore full viewport height
        requestAnimationFrame(() => onWindowResize());
    }
    // Also stop any playing animation
    stopAnimation();
}

// Update timeline UI to reflect current state
function updateTimelineUI() {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    
    const slider = document.getElementById('frameSlider');
    const display = document.getElementById('frameDisplay');
    
    if (slider) {
        slider.max = currentStructure.totalFrames - 1;
        slider.value = currentStructure.currentFrameIndex;
        slider.setAttribute('aria-valuetext', `Frame ${currentStructure.currentFrameIndex + 1} of ${currentStructure.totalFrames}`);
    }
    
    if (display) {
        display.textContent = `${currentStructure.currentFrameIndex + 1} / ${currentStructure.totalFrames}`;
    }
}

// Switch to a specific frame
function switchToFrame(frameIndex) {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    if (frameIndex < 0 || frameIndex >= currentStructure.totalFrames) return;
    
    const frame = currentStructure.frames[frameIndex];
    const sameLattice = currentStructure.lattice.every((vector, axis) =>
        vector.every((value, component) => value === frame.lattice[axis][component]));
    const sameMeshes = sameLattice && atomMeshes.length >= currentStructure.atoms.length
        && currentStructure.atoms.every((_, index) => atomMeshes[index] && !atomMeshes[index].userData.isGhost);
    currentStructure.currentFrameIndex = frameIndex;
    
    // Restore the lattice stored with this frame.
    currentStructure.lattice = frame.lattice.map(v => [...v]);
    
    // Update atom positions
    for (let i = 0; i < currentStructure.atoms.length; i++) {
        currentStructure.atoms[i].position.copy(frame.positions[i]);
        currentStructure.atoms[i].fractional = frame.fractional[i];
        if (sameMeshes) atomMeshes[i].position.copy(frame.positions[i]);
    }
    
    // A frame can also carry an atom onto or off a cell face, which changes
    // which boundary copies exist. Moving the existing meshes cannot show
    // that, so such frames rebuild the scene, as a completed drag does.
    const canReuseMeshes = sameMeshes && !boundaryCopiesStale();
    
    if (canReuseMeshes) {
        atomMeshes.forEach(mesh => {
            if (!mesh.userData.isGhost) return;
            const { originalIndex, cellOffset } = mesh.userData;
            mesh.position.copy(currentStructure.atoms[originalIndex].position);
            ['a', 'b', 'c'].forEach((axis, index) => {
                mesh.position.addScaledVector(new THREE.Vector3(...frame.lattice[index]), cellOffset[axis]);
            });
        });
        updateAtomInstances();
        rebuildBonds();
        if (settings.showLabels) {
            structureGroup.children.forEach(child => {
                if (child.userData.isAtomLabel) child.position.copy(atomMeshes[child.userData.meshIndex ?? child.userData.atomIndex].position);
            });
        }
        updateSelectionVisualPositions();
        selectedAtoms.forEach(atom => atom.mesh.getWorldPosition(atom.position));
        if (selectedAtoms.length > 0) updateMeasurements();
        requestRender();
    } else {
        // A changed lattice also changes the cell and axes; a changed set of
        // boundary copies needs the same rebuild.
        renderStructure(currentStructure, true);
    }
    
    // Update timeline UI (slider + frame counter)
    updateTimelineUI();
    
    // Update only the frame display in sidebar (not full UI to avoid flicker)
    updateSidebarFrameDisplay();
    
    // Update measurements if atoms are selected
    if (selectedAtoms.length > 0) {
        updateMeasurementUI();
    }
}

// Update only the frame display in sidebar (avoids full UI rebuild and flicker)
function updateSidebarFrameDisplay() {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    
    const sidebarDisplay = document.getElementById('sidebarFrameDisplay');
    if (sidebarDisplay) {
        sidebarDisplay.textContent = `${currentStructure.currentFrameIndex + 1} / ${currentStructure.totalFrames}`;
    }
}

// Frame navigation functions
function goToFirstFrame() {
    switchToFrame(0);
}

function goToLastFrame() {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    switchToFrame(currentStructure.totalFrames - 1);
}

function goToPrevFrame() {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    const newIndex = Math.max(0, currentStructure.currentFrameIndex - 1);
    switchToFrame(newIndex);
}

function goToNextFrame() {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    const newIndex = currentStructure.currentFrameIndex + 1;
    
    if (newIndex >= currentStructure.totalFrames) {
        if (animationState.loop) {
            switchToFrame(0);
        } else {
            // Stop at last frame
            stopAnimation();
        }
    } else {
        switchToFrame(newIndex);
    }
}

// Animation playback
function playAnimation() {
    if (!currentStructure || !currentStructure.isXDATCAR) return;
    if (animationState.isPlaying) return;
    
    // If at last frame and not looping, go to first frame before playing
    if (currentStructure.currentFrameIndex >= currentStructure.totalFrames - 1 && !animationState.loop) {
        switchToFrame(0);
    }
    
    animationState.isPlaying = true;
    updatePlayPauseButton();
    
    const intervalMs = 1000 / animationState.fps;
    animationState.intervalId = setInterval(() => {
        goToNextFrame();
    }, intervalMs);
}

function stopAnimation() {
    if (animationState.intervalId) {
        clearInterval(animationState.intervalId);
        animationState.intervalId = null;
    }
    animationState.isPlaying = false;
    updatePlayPauseButton();
}

function togglePlayPause() {
    if (animationState.isPlaying) {
        stopAnimation();
    } else {
        playAnimation();
    }
}

function updatePlayPauseButton() {
    const btn = document.getElementById('playPause');
    if (btn) {
        btn.classList.toggle('playing', animationState.isPlaying);
        btn.setAttribute('aria-label', animationState.isPlaying ? 'Pause trajectory' : 'Play trajectory');
        btn.title = animationState.isPlaying ? 'Pause (Space)' : 'Play (Space)';
    }
}

// Update FPS and restart animation if playing
function setAnimationFPS(fps) {
    animationState.fps = fps;
    if (animationState.isPlaying) {
        stopAnimation();
        playAnimation();
    }
}

// Setup timeline event listeners
function setupTimelineControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('playPause');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // Frame slider
    const slider = document.getElementById('frameSlider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            // Every user scrub, including keyboard input, owns the chosen frame.
            // Playback must not overwrite it on the next interval tick.
            stopAnimation();
            const frameIndex = parseInt(e.target.value);
            switchToFrame(frameIndex);
        });
        
        // A range emits no input event for a key that stays at its endpoint.
        // Scrubbing still owns the frame, even when its value cannot change.
        slider.addEventListener('keydown', (event) => {
            if (!event.altKey && !event.ctrlKey && !event.metaKey &&
                ['Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(event.key)) {
                stopAnimation();
            }
        });

        // Stop animation when user interacts with slider
        slider.addEventListener('pointerdown', () => {
            if (animationState.isPlaying) {
                stopAnimation();
            }
        });
    }
    
    // Loop checkbox
    const loopCheckbox = document.getElementById('loopCheckbox');
    if (loopCheckbox) {
        loopCheckbox.checked = animationState.loop;
        loopCheckbox.addEventListener('change', (e) => {
            animationState.loop = e.target.checked;
        });
    }
    
    // FPS select
    const fpsSelect = document.getElementById('fpsSelect');
    if (fpsSelect) {
        fpsSelect.value = animationState.fps;
        fpsSelect.addEventListener('change', (e) => {
            setAnimationFPS(parseInt(e.target.value));
        });
    }
    
    // Keyboard shortcuts for timeline
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when the user is not operating another control.
        if (!currentStructure || !currentStructure.isXDATCAR) return;
        if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('button, input, select, textarea, a[href], [contenteditable="true"]')) return;
        
        switch (e.key) {
            case ' ': // Space - play/pause
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                goToPrevFrame();
                break;
            case 'ArrowRight':
                e.preventDefault();
                goToNextFrame();
                break;
            case 'Home':
                e.preventDefault();
                goToFirstFrame();
                break;
            case 'End':
                e.preventDefault();
                goToLastFrame();
                break;
        }
    });
}

// Update mode toggle button state based on file type
function updateModeToggleForFileType() {
    const editBtn = document.getElementById('editToggle');
    const exportBtn = document.getElementById('exportPoscar');
    const resetView = document.getElementById('resetView');
    if (resetView) resetView.hidden = !currentStructure;
    const periodic = hasLattice(currentStructure);
    const fixedIndicators = document.getElementById('showFixedIndicators');
    fixedIndicators.disabled = !supportsSelectiveDynamics(currentStructure);
    fixedIndicators.title = supportsSelectiveDynamics(currentStructure)
        ? 'Draw a cage around atoms fixed by selective dynamics' : 'Selective dynamics are available in POSCAR files';
    const unavailable = periodic ? '' : 'A molecule has no unit cell or lattice axes';
    for (const id of ['showCell', 'showAxes']) {
        const checkbox = document.getElementById(id);
        checkbox.disabled = !periodic;
        checkbox.title = unavailable;
    }
    const periodicAxes = getPeriodicAxes(currentStructure);
    document.querySelectorAll('#periodicControls .stepper-btn').forEach(button => {
        button.disabled = !periodicAxes[['a', 'b', 'c'].indexOf(button.dataset.axis)];
    });
    document.getElementById('periodicControls').classList.toggle('disabled', !periodicAxes.some(Boolean));
    document.getElementById('vacuumInfo').style.display = periodic ? '' : 'none';
    
    if (currentStructure && currentStructure.isXDATCAR) {
        // Disable edit mode for XDATCAR
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.title = 'A trajectory cannot be edited';
        }
        // Update export button for XDATCAR
        if (exportBtn) {
            exportBtn.title = 'Export as XDATCAR';
        }
    } else {
        // Enable edit mode for POSCAR
        if (editBtn) {
            editBtn.disabled = false;
            editBtn.title = 'Edit mode: move, add and delete atoms (off: measure only)';
        }
        // Update export button for POSCAR
        if (exportBtn) {
            exportBtn.title = currentStructure && currentStructure.isXYZ ? 'Export as XYZ' : 'Export as POSCAR';
        }
    }
    updateExportMenu();
}

// Helper function to switch to measure mode (used when loading XDATCAR)
function switchToMeasureMode() {
    if (currentMode === 'measure') return;
    cancelEditDrag(null, 'mode changed');
    cancelCameraAlignment();
    cleanupVacuumHandles();
    currentMode = 'measure';
    setBoxSelectMode(false);
    
    updateModeButtonState();
    
    // Update body class
    document.body.classList.remove('edit-mode-active');
    
    // Hide edit-only controls
    const editControls = document.getElementById('editModeControls');
    if (editControls) editControls.style.display = 'none';
    
    // Update panel title
    const panelTitle = document.getElementById('actionPanelTitle');
    if (panelTitle) panelTitle.textContent = '📐 Measurements';
    
    // Clear selection and update UI
    clearSelection(true);
    updateMeasurementUI();
}

// Initialize app
function init() {
    initScene();
    setupDragDrop();
    setupControls();
    setupModeToggle();
    setupPeriodicControls();
    setupUndoKeyboardShortcut();
    setupTimelineControls();
    setupExamplePicker();
    setupAtomJump();
    window.addEventListener('beforeunload', event => {
        if (!hasUnsavedEdits()) return;
        event.preventDefault();
        event.returnValue = '';
    });
    updateDirtyIndicator();
    
    statusText.textContent = 'Ready — drop a file or try a public example';
}

// Start the app
init();
