// === Crystal Visualizer ===
// A VESTA-like crystal structure visualizer

// Element data: colors (CPK-like) and covalent radii
const ELEMENT_DATA = {
    H:  { color: 0xffffff, radius: 0.31, name: 'Hydrogen' },
    He: { color: 0xd9ffff, radius: 0.28, name: 'Helium' },
    Li: { color: 0xcc80ff, radius: 1.28, name: 'Lithium' },
    Be: { color: 0xc2ff00, radius: 0.96, name: 'Beryllium' },
    B:  { color: 0xffb5b5, radius: 0.84, name: 'Boron' },
    C:  { color: 0x909090, radius: 0.76, name: 'Carbon' },
    N:  { color: 0x3050f8, radius: 0.71, name: 'Nitrogen' },
    O:  { color: 0xff0d0d, radius: 0.66, name: 'Oxygen' },
    F:  { color: 0x90e050, radius: 0.57, name: 'Fluorine' },
    Ne: { color: 0xb3e3f5, radius: 0.58, name: 'Neon' },
    Na: { color: 0xab5cf2, radius: 1.66, name: 'Sodium' },
    Mg: { color: 0x8aff00, radius: 1.41, name: 'Magnesium' },
    Al: { color: 0xbfa6a6, radius: 1.21, name: 'Aluminum' },
    Si: { color: 0xf0c8a0, radius: 1.11, name: 'Silicon' },
    P:  { color: 0xff8000, radius: 1.07, name: 'Phosphorus' },
    S:  { color: 0xffff30, radius: 1.05, name: 'Sulfur' },
    Cl: { color: 0x1ff01f, radius: 1.02, name: 'Chlorine' },
    Ar: { color: 0x80d1e3, radius: 1.06, name: 'Argon' },
    K:  { color: 0x8f40d4, radius: 2.03, name: 'Potassium' },
    Ca: { color: 0x3dff00, radius: 1.76, name: 'Calcium' },
    Sc: { color: 0xe6e6e6, radius: 1.70, name: 'Scandium' },
    Ti: { color: 0xbfc2c7, radius: 1.60, name: 'Titanium' },
    V:  { color: 0xa6a6ab, radius: 1.53, name: 'Vanadium' },
    Cr: { color: 0x8a99c7, radius: 1.39, name: 'Chromium' },
    Mn: { color: 0x9c7ac7, radius: 1.39, name: 'Manganese' },
    Fe: { color: 0xe06633, radius: 1.32, name: 'Iron' },
    Co: { color: 0xf090a0, radius: 1.26, name: 'Cobalt' },
    Ni: { color: 0x50d050, radius: 1.24, name: 'Nickel' },
    Cu: { color: 0xc88033, radius: 1.32, name: 'Copper' },
    Zn: { color: 0x7d80b0, radius: 1.22, name: 'Zinc' },
    Ga: { color: 0xc28f8f, radius: 1.22, name: 'Gallium' },
    Ge: { color: 0x668f8f, radius: 1.20, name: 'Germanium' },
    As: { color: 0xbd80e3, radius: 1.19, name: 'Arsenic' },
    Se: { color: 0xffa100, radius: 1.20, name: 'Selenium' },
    Br: { color: 0xa62929, radius: 1.20, name: 'Bromine' },
    Kr: { color: 0x5cb8d1, radius: 1.16, name: 'Krypton' },
    Rb: { color: 0x702eb0, radius: 2.20, name: 'Rubidium' },
    Sr: { color: 0x00ff00, radius: 1.95, name: 'Strontium' },
    Y:  { color: 0x94ffff, radius: 1.90, name: 'Yttrium' },
    Zr: { color: 0x94e0e0, radius: 1.75, name: 'Zirconium' },
    Nb: { color: 0x73c2c9, radius: 1.64, name: 'Niobium' },
    Mo: { color: 0x54b5b5, radius: 1.54, name: 'Molybdenum' },
    Tc: { color: 0x3b9e9e, radius: 1.47, name: 'Technetium' },
    Ru: { color: 0x248f8f, radius: 1.46, name: 'Ruthenium' },
    Rh: { color: 0x0a7d8c, radius: 1.42, name: 'Rhodium' },
    Pd: { color: 0x006985, radius: 1.39, name: 'Palladium' },
    Ag: { color: 0xc0c0c0, radius: 1.45, name: 'Silver' },
    Cd: { color: 0xffd98f, radius: 1.44, name: 'Cadmium' },
    In: { color: 0xa67573, radius: 1.42, name: 'Indium' },
    Sn: { color: 0x668080, radius: 1.39, name: 'Tin' },
    Sb: { color: 0x9e63b5, radius: 1.39, name: 'Antimony' },
    Te: { color: 0xd47a00, radius: 1.38, name: 'Tellurium' },
    I:  { color: 0x940094, radius: 1.39, name: 'Iodine' },
    Xe: { color: 0x429eb0, radius: 1.40, name: 'Xenon' },
    Cs: { color: 0x57178f, radius: 2.44, name: 'Cesium' },
    Ba: { color: 0x00c900, radius: 2.15, name: 'Barium' },
    La: { color: 0x70d4ff, radius: 2.07, name: 'Lanthanum' },
    Ce: { color: 0xffffc7, radius: 2.04, name: 'Cerium' },
    Pr: { color: 0xd9ffc7, radius: 2.03, name: 'Praseodymium' },
    Nd: { color: 0xc7ffc7, radius: 2.01, name: 'Neodymium' },
    Pm: { color: 0xa3ffc7, radius: 1.99, name: 'Promethium' },
    Sm: { color: 0x8fffc7, radius: 1.98, name: 'Samarium' },
    Eu: { color: 0x61ffc7, radius: 1.98, name: 'Europium' },
    Gd: { color: 0x45ffc7, radius: 1.96, name: 'Gadolinium' },
    Tb: { color: 0x30ffc7, radius: 1.94, name: 'Terbium' },
    Dy: { color: 0x1fffc7, radius: 1.92, name: 'Dysprosium' },
    Ho: { color: 0x00ff9c, radius: 1.92, name: 'Holmium' },
    Er: { color: 0x00e675, radius: 1.89, name: 'Erbium' },
    Tm: { color: 0x00d452, radius: 1.90, name: 'Thulium' },
    Yb: { color: 0x00bf38, radius: 1.87, name: 'Ytterbium' },
    Lu: { color: 0x00ab24, radius: 1.87, name: 'Lutetium' },
    Hf: { color: 0x4dc2ff, radius: 1.75, name: 'Hafnium' },
    Ta: { color: 0x4da6ff, radius: 1.70, name: 'Tantalum' },
    W:  { color: 0x2194d6, radius: 1.62, name: 'Tungsten' },
    Re: { color: 0x267dab, radius: 1.51, name: 'Rhenium' },
    Os: { color: 0x266696, radius: 1.44, name: 'Osmium' },
    Ir: { color: 0x175487, radius: 1.41, name: 'Iridium' },
    Pt: { color: 0xd0d0e0, radius: 1.36, name: 'Platinum' },
    Au: { color: 0xffd123, radius: 1.36, name: 'Gold' },
    Hg: { color: 0xb8b8d0, radius: 1.32, name: 'Mercury' },
    Tl: { color: 0xa6544d, radius: 1.45, name: 'Thallium' },
    Pb: { color: 0x575961, radius: 1.46, name: 'Lead' },
    Bi: { color: 0x9e4fb5, radius: 1.48, name: 'Bismuth' },
    Po: { color: 0xab5c00, radius: 1.40, name: 'Polonium' },
    At: { color: 0x754f45, radius: 1.50, name: 'Astatine' },
    Rn: { color: 0x428296, radius: 1.50, name: 'Radon' },
    Fr: { color: 0x420066, radius: 2.60, name: 'Francium' },
    Ra: { color: 0x007d00, radius: 2.21, name: 'Radium' },
    Ac: { color: 0x70abfa, radius: 2.15, name: 'Actinium' },
    Th: { color: 0x00baff, radius: 2.06, name: 'Thorium' },
    Pa: { color: 0x00a1ff, radius: 2.00, name: 'Protactinium' },
    U:  { color: 0x008fff, radius: 1.96, name: 'Uranium' },
    Np: { color: 0x0080ff, radius: 1.90, name: 'Neptunium' },
    Pu: { color: 0x006bff, radius: 1.87, name: 'Plutonium' },
    Am: { color: 0x545cf2, radius: 1.80, name: 'Americium' },
    Cm: { color: 0x785ce3, radius: 1.69, name: 'Curium' },
    DEFAULT: { color: 0xff69b4, radius: 1.50, name: 'Unknown' }
};
Object.setPrototypeOf(ELEMENT_DATA, null);

// Global state
let scene, camera, renderer, controls;
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
let settings = {
    atomScale: 0.8,
    bondThreshold: 2.5,
    showBonds: true,
    useElementRadii: true,
    showLabels: false,
    showAxes: true,
    showCell: true,
    periodic: { a: 1, b: 1, c: 1 }, // Periodic images in each direction
    ghostOpacity: 0.75, // Opacity of ghost atoms (default 75%)
    showFixedIndicators: true // Show visual indicators for fixed atoms
};
let measurementMode = 'nearest'; // Or 'selected': measure the visible atom copies exactly.

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
let lastRenderedAt = -Infinity;
let lastCameraMotionAt = -Infinity;

const DENSE_VIEW_ATOMS = 500;
const ATOM_PICKING_LAYER = 1;

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
        const elemData = ELEMENT_DATA[element] || ELEMENT_DATA.DEFAULT;
        const material = new THREE.MeshPhysicalMaterial({
            color: elemData.color,
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
let lastZThreshold = null; // Remember user's z-threshold setting

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
// - 'select_atom': { atomData } (for deselecting)
// - 'deselect_atom': { atomData, selectionIndex } (for reselecting)
// - 'clear_selection': { selectedAtoms: [...], isMeasurementSelection }

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

function captureRedoState(operation) {
    return {
        structure: isSelectionOperation(operation) ? null : snapshotStructure(currentStructure),
        periodic: { ...settings.periodic },
        selected: selectedAtoms.map(atom => ({
            index: atom.index,
            originalIndex: atom.originalIndex,
            isGhost: Boolean(atom.isGhost),
            cellOffset: atom.cellOffset ? { ...atom.cellOffset } : null,
            element: atom.element
        })),
        isMeasurementSelection
    };
}

function restoreSelectedAtoms(savedSelections) {
    return savedSelections.map(saved => {
        const mesh = saved.isGhost
            ? atomMeshes.find(candidate => saved.cellOffset && candidate.userData.isGhost
                && candidate.userData.originalIndex === saved.originalIndex
                && candidate.userData.cellOffset
                && candidate.userData.cellOffset.a === saved.cellOffset.a
                && candidate.userData.cellOffset.b === saved.cellOffset.b
                && candidate.userData.cellOffset.c === saved.cellOffset.c)
            : atomMeshes[saved.index];
        if (!mesh || (!saved.isGhost && mesh.userData.isGhost)) return null;
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
}

function performRedo() {
    if (draggedAtom || vacuumDragState.isDragging) {
        cancelEditDrag();
        return;
    }
    if (editHistory.redoStack.length === 0) {
        statusText.textContent = 'Nothing to redo';
        statusText.className = '';
        return;
    }
    const { operation, state } = editHistory.redoStack.pop();
    if (isSelectionOperation(operation)) {
        selectedAtoms.forEach(atom => unhighlightAtomMesh(atom.mesh));
        selectedAtoms = restoreSelectedAtoms(state.selected);
        isMeasurementSelection = state.isMeasurementSelection;
        rebuildSelectionVisuals();
        updateUI_forCurrentMode();
        requestRender();
    } else {
        currentStructure = restoreStructure(state.structure);
        settings.periodic = { ...state.periodic };
        ['a', 'b', 'c'].forEach(axis => {
            const upper = axis.toUpperCase();
            document.getElementById(`periodic${upper}`).value = settings.periodic[axis];
            document.getElementById(`periodic${upper}Display`).textContent = settings.periodic[axis];
        });
        selectedAtoms = state.selected;
        isMeasurementSelection = state.isMeasurementSelection;
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
        cancelEditDrag();
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
            undoSelectAtom(op);
            break;
        case 'deselect_atom':
            undoDeselectAtom(op);
            break;
        case 'clear_selection':
            undoClearSelection(op);
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

function undoSelectAtom(op) {
    // Find and deselect the atom that was selected
    const idx = selectedAtoms.findIndex(a => 
        a.index === op.atomData.index && a.isGhost === op.atomData.isGhost
    );
    if (idx !== -1) {
        const atom = selectedAtoms[idx];
        if (atom && atom.mesh) {
            unhighlightAtomMesh(atom.mesh);
        }
        selectedAtoms.splice(idx, 1);
        if (selectedAtoms.length === 0) {
            isMeasurementSelection = false;
        }
        rebuildSelectionVisuals();
        updateUI_forCurrentMode();
    }
    statusText.textContent = 'Undid atom selection';
    statusText.className = '';
}

function undoDeselectAtom(op) {
    // Re-select the atom that was deselected
    // We need to find the mesh again
    const atomData = op.atomData;
    let mesh = null;
    
    if (atomData.isGhost) {
        // Find ghost atom mesh
        structureGroup.children.forEach(child => {
            if (child.userData.isGhost && 
                child.userData.originalIndex === atomData.originalIndex &&
                child.userData.cellOffset &&
                child.userData.cellOffset.a === atomData.cellOffset.a &&
                child.userData.cellOffset.b === atomData.cellOffset.b &&
                child.userData.cellOffset.c === atomData.cellOffset.c) {
                mesh = child;
            }
        });
    } else {
        mesh = atomMeshes[atomData.index];
    }
    
    if (mesh) {
        // Insert at the original position in the selection
        const insertIdx = Math.min(op.selectionIndex, selectedAtoms.length);
        selectedAtoms.splice(insertIdx, 0, {
            mesh: mesh,
            index: atomData.index,
            originalIndex: atomData.originalIndex,
            element: atomData.element,
            position: new THREE.Vector3(atomData.position.x, atomData.position.y, atomData.position.z),
            isGhost: atomData.isGhost,
            cellOffset: atomData.cellOffset
        });
        highlightAtomMesh(mesh);
        if (currentMode === 'measure') {
            isMeasurementSelection = true;
        }
        rebuildSelectionVisuals();
        updateUI_forCurrentMode();
    }
    statusText.textContent = 'Undid atom deselection';
    statusText.className = '';
}

function undoClearSelection(op) {
    // Restore the cleared selection
    op.savedSelection.forEach(atomData => {
        let mesh = null;
        if (atomData.isGhost) {
            structureGroup.children.forEach(child => {
                if (child.userData.isGhost && 
                    child.userData.originalIndex === atomData.originalIndex &&
                    child.userData.cellOffset &&
                    child.userData.cellOffset.a === atomData.cellOffset.a &&
                    child.userData.cellOffset.b === atomData.cellOffset.b &&
                    child.userData.cellOffset.c === atomData.cellOffset.c) {
                    mesh = child;
                }
            });
        } else {
            mesh = atomMeshes[atomData.index];
        }
        
        if (mesh) {
            selectedAtoms.push({
                mesh: mesh,
                index: atomData.index,
                originalIndex: atomData.originalIndex,
                element: atomData.element,
                position: new THREE.Vector3(atomData.position.x, atomData.position.y, atomData.position.z),
                isGhost: atomData.isGhost,
                cellOffset: atomData.cellOffset
            });
            highlightAtomMesh(mesh);
        }
    });
    isMeasurementSelection = op.wasMeasurementSelection;
    rebuildSelectionVisuals();
    updateUI_forCurrentMode();
    statusText.textContent = `Restored ${op.savedSelection.length} selected atom(s)`;
    statusText.className = '';
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
    scene.background = new THREE.Color(0x0a0a0f);
    
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
    
    // Controls - Use TrackballControls for VESTA-like rotation behavior
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 3.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false; // Enable damping
    controls.dynamicDampingFactor = 0.15;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.addEventListener('change', () => {
        lastCameraMotionAt = performance.now();
        requestRender();
    });
    
    // Hide vacuum handles when camera starts moving
    controls.addEventListener('start', () => {
        // Clear vacuum handles and highlight immediately when user starts rotating
        if (!vacuumDragState.isDragging) {
            clearVacuumHighlight();
            if (vacuumDragState.handles.length > 0) {
                vacuumDragState.handles.forEach(h => {
                    if (h.parent) h.parent.remove(h);
                    if (h.geometry) h.geometry.dispose();
                    if (h.material) h.material.dispose();
                });
                vacuumDragState.handles = [];
            }
            vacuumDragState.active = false;
            updateVacuumHintUI(null);
        }
    });
    
    // Check for axis snap on end of camera rotation
    controls.addEventListener('end', () => {
        // Small delay to let damping settle a bit
        setTimeout(() => {
            if (!isSnapping) {
                checkAndSnapToAxis();
            }
            // Update vacuum handles based on current alignment
            updateVacuumHandles();
        }, 100);
    });
    
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
    mouse = new THREE.Vector2();
    
    // Initialize axes HUD
    initAxesHUD();
    
    // Animation loop
    requestAnimationFrame(animate);
    
    // Handle resize
    window.addEventListener('resize', onWindowResize);
    
    // Handle mouse events for atom selection and dragging
    // Use capture phase to ensure we handle events before OrbitControls/TrackballControls
    renderer.domElement.addEventListener('pointerdown', onMouseDown, { capture: true });
    renderer.domElement.addEventListener('pointermove', onMouseMove);
    renderer.domElement.addEventListener('pointerup', onMouseUp, { capture: true });
    renderer.domElement.addEventListener('pointercancel', cancelEditDrag);
    renderer.domElement.addEventListener('lostpointercapture', cancelEditDrag);
    renderer.domElement.addEventListener('click', onClickFallback);
    window.addEventListener('blur', cancelEditDrag);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && (draggedAtom || vacuumDragState.isDragging)) {
            event.preventDefault();
            cancelEditDrag();
        }
    });
}

function animate(timestamp) {
    requestAnimationFrame(animate);
    controls.update();
    if (!currentStructure && !renderPending) return;

    const active = animationState.isPlaying || isDragging || vacuumDragState.isDragging || isSnapping
        || timestamp - lastCameraMotionAt < 250;
    const dense = displayedAtomCount > DENSE_VIEW_ATOMS;
    const interval = 1000 / (active ? (dense ? 30 : 60) : 5);
    if (!renderPending && timestamp - lastRenderedAt < interval) return;
    if (dense && timestamp - lastRenderedAt < 1000 / 30) return;
    lastRenderedAt = timestamp;
    renderPending = false;
    
    // Make selection rings face the camera
    if (measurementGroup) {
        measurementGroup.children.forEach(child => {
            if (child.userData.isBillboard) {
                child.lookAt(camera.position);
            }
        });
    }
    
    // Render main scene
    renderer.render(scene, camera);
    
    // Render axes HUD in bottom-left corner
    if (settings.showAxes && hasLattice(currentStructure) && axesScene && axesCamera && axesGroup) {
        // Sync axes rotation with main camera
        axesGroup.quaternion.copy(camera.quaternion).invert();
        
        // Set viewport for axes (bottom-left corner, 100x100 pixels)
        const axesSize = 100;
        renderer.setViewport(10, 10, axesSize, axesSize);
        renderer.setScissor(10, 10, axesSize, axesSize);
        renderer.setScissorTest(true);
        
        // Clear depth buffer so axes render on top
        renderer.clearDepth();
        renderer.render(axesScene, axesCamera);
        
        // Reset viewport to full size
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, viewport.clientWidth, viewport.clientHeight);
    }
}

function onWindowResize() {
    const aspect = viewport.clientWidth / viewport.clientHeight;
    const frustumSize = 15;
    
    // Update perspective camera
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();
    
    // Update orthographic camera
    orthographicCamera.left = frustumSize * aspect / -2;
    orthographicCamera.right = frustumSize * aspect / 2;
    orthographicCamera.top = frustumSize / 2;
    orthographicCamera.bottom = frustumSize / -2;
    orthographicCamera.updateProjectionMatrix();
    
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
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
const crystalFormats = CrystalFormats.createFormats(THREE.Vector3, cartesianToFractional);
function parsePOSCAR(content) { return crystalFormats.parsePOSCAR(content); }
function parseXDATCAR(content) { return crystalFormats.parseXDATCAR(content); }
function isXDATCARFormat(content) { return crystalFormats.isXDATCARFormat(content); }
function isXYZFormat(content) { return crystalFormats.isXYZFormat(content); }
function parseXYZ(content) { return crystalFormats.parseXYZ(content); }

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

// Get cell offset label like "[+a]", "[+ab]", "[+abc]"
function getCellOffsetLabel(cellOffset) {
    if (!cellOffset) return '';
    let label = '';
    if (cellOffset.a > 0) label += 'a';
    if (cellOffset.b > 0) label += 'b';
    if (cellOffset.c > 0) label += 'c';
    return label ? `[+${label}]` : '';
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
function formatAtomCoordinates(selectedAtom, atomIndex) {
    const originalPos = getOriginalAtomPosition(selectedAtom);
    
    if (hasLattice(currentStructure) && selectedAtomCoordMode === 'fractional') {
        // Get fractional coordinates
        const frac = cartesianToFractional(
            new THREE.Vector3(originalPos.x, originalPos.y, originalPos.z),
            currentStructure.lattice
        );
        
        if (frac) {
            // Fractional: yellow/gold with square brackets
            const coordStr = `[${frac[0].toFixed(3)}, ${frac[1].toFixed(3)}, ${frac[2].toFixed(3)}]`;
            return `<button type="button" id="selectedAtomCoords${atomIndex}" class="sel-coords sel-coords-frac clickable-coords" data-atom-idx="${atomIndex}" title="Show Cartesian coordinates">${coordStr}</button>`;
        }
    }
    
    // Cartesian: cyan with parentheses (default fallback)
    const coordStr = `(${originalPos.x.toFixed(2)}, ${originalPos.y.toFixed(2)}, ${originalPos.z.toFixed(2)})`;
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

function getMeasurementPair(atomA, atomB) {
    const start = atomA.position.clone();
    let end = atomB.position.clone();
    let offset = [0, 0, 0];
    const nearest = measurementMode === 'nearest' && isPeriodicStructure(currentStructure)
        && !atomA.isGhost && !atomB.isGhost;
    if (nearest) {
        let result;
        try {
            result = CrystalGeometry.nearestImageBetween(start, end, currentStructure.lattice, getPeriodicAxes(currentStructure));
        } catch (error) {
            setGeometryWarning('measurement', `${error.message}. Use Selected images to measure displayed copies.`);
            return { start, end, offset, distance: null, nearest: false, unavailable: true };
        }
        offset = result.offset;
        end = start.clone().add(new THREE.Vector3(...result.delta));
    }
    return { start, end, offset, distance: start.distanceTo(end), nearest };
}

function getMeasurementAngle() {
    if (selectedAtoms.length !== 3) return null;
    const first = getMeasurementPair(selectedAtoms[1], selectedAtoms[0]);
    const third = getMeasurementPair(selectedAtoms[1], selectedAtoms[2]);
    if (first.unavailable || third.unavailable) return null;
    const v1 = first.end.clone().sub(first.start);
    const v2 = third.end.clone().sub(third.start);
    if (v1.length() < 1e-10 || v2.length() < 1e-10) return null;
    const cosine = Math.max(-1, Math.min(1, v1.normalize().dot(v2.normalize())));
    return {
        first: first.end,
        vertex: first.start,
        third: third.end,
        angleDeg: THREE.MathUtils.radToDeg(Math.acos(cosine))
    };
}

function formatImageShift(offset) {
    const axes = ['a', 'b', 'c'];
    return offset.map((value, index) => value ? `${value > 0 ? '+' : '−'}${Math.abs(value) === 1 ? '' : Math.abs(value)}${axes[index]}` : '').filter(Boolean).join(' ');
}

function measurementModeControlHTML() {
    if (!isPeriodicStructure(currentStructure)) return '';
    const nearest = measurementMode === 'nearest';
    return `<div class="measurement-mode"><span>Distance mode</span><button type="button" id="measurementModeToggle" class="btn btn-secondary" title="Switch between shortest periodic distance and the displayed atom copies">${nearest ? 'Nearest periodic' : 'Selected images'}</button></div>`;
}

function setupMeasurementModeToggle() {
    const button = document.getElementById('measurementModeToggle');
    if (!button) return;
    button.addEventListener('click', () => {
        measurementMode = measurementMode === 'nearest' ? 'selected' : 'nearest';
        updateMeasurements();
        updateUI_forCurrentMode();
    });
}

// Compute fractional displacement only when requested; Cartesian values use world axes.
function computeDeltas(atomA, atomB) {
    if (!currentStructure || !currentStructure.lattice) return null;
    const pair = getMeasurementPair(atomA, atomB);
    if (pair.unavailable) return null;
    const delta = pair.end.clone().sub(pair.start);
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
function formatDelta(atomA, atomB) {
    const d = computeDeltas(atomA, atomB);
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
function formatDeltaCompact(atomA, atomB) {
    return formatDelta(atomA, atomB);
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

// Add periodic ghost atoms and bonds to structureGroup
// Called during renderStructure, before centering
function addPeriodicImages(structure) {
    if (!isPeriodicStructure(structure)) return;
    const { a: na, b: nb, c: nc } = getPeriodicRepeats(structure);
    
    // Skip if no periodic images
    if (na === 1 && nb === 1 && nc === 1) return;
    
    const lattice = structure.lattice;
    const aVec = new THREE.Vector3(...lattice[0]);
    const bVec = new THREE.Vector3(...lattice[1]);
    const cVec = new THREE.Vector3(...lattice[2]);
    
    // Add supercell wireframe
    if (settings.showCell) {
        const supercellWireframe = createSupercellWireframe(lattice, na, nb, nc);
        structureGroup.add(supercellWireframe);
    }
    
    // Generate ghost atoms for each periodic cell (excluding 0,0,0)
    for (let ia = 0; ia < na; ia++) {
        for (let ib = 0; ib < nb; ib++) {
            for (let ic = 0; ic < nc; ic++) {
                // Skip the original cell
                if (ia === 0 && ib === 0 && ic === 0) continue;
                
                // Translation vector for this cell
                const translation = new THREE.Vector3()
                    .addScaledVector(aVec, ia)
                    .addScaledVector(bVec, ib)
                    .addScaledVector(cVec, ic);
                
                // Create ghost atoms in this cell
                structure.atoms.forEach((atom, originalIndex) => {
                    const ghostPos = atom.position.clone().add(translation);
                    const cellOffset = { a: ia, b: ib, c: ic };
                    const ghostAtom = createGhostAtom(atom.element, ghostPos, originalIndex, cellOffset);
                    structureGroup.add(ghostAtom);
                    // Add to atomMeshes for raycasting (so ghost atoms can be selected)
                    atomMeshes.push(ghostAtom);
                });
            }
        }
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

// Mouse down handler
function onMouseDown(event) {
    if (!currentStructure) return;
    if (event.button !== 0) return; // Only left click
    if (activeEditPointerId !== null) return;
    
    pointerDownTime = Date.now();
    wasDragging = false;
    
    const mouseNDC = getMouseNDC(event);
    mouse.copy(mouseNDC);
    dragStartMouse.copy(mouseNDC);
    
    // Check for vacuum handle drag first (edit mode only)
    // ONLY start vacuum drag if the edge is already highlighted (user is hovering over it)
    // This prevents accidental vacuum drag when user intends to rotate the camera
    if (currentMode === 'edit' && vacuumDragState.active && vacuumDragState.hoveredEdge) {
        const handleInfo = {
            extendAxis: vacuumDragState.hoveredEdge.userData.extendAxis,
            handleType: vacuumDragState.hoveredEdge.userData.handleType
        };
        
        // IMPORTANT: Disable controls IMMEDIATELY to prevent rotation
        controls.enabled = false;
        event.preventDefault();
        event.stopPropagation();
        
        if (startVacuumDrag(handleInfo, event)) {
            captureEditPointer(event);
            return; // Vacuum drag started, don't process atom selection
        } else {
            // If drag didn't start, re-enable controls
            controls.enabled = true;
        }
    }
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(atomMeshes);
    
    // Reset drag state
    isDragging = false;
    draggedAtom = null;
    
    if (intersects.length > 0 && currentMode === 'edit') {
        const clickedMesh = intersects[0].object;
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
        
        // Create drag plane perpendicular to camera
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
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
    renderer.domElement.setPointerCapture(event.pointerId);
}

function releaseEditPointer() {
    const pointerId = activeEditPointerId;
    activeEditPointerId = null;
    if (pointerId !== null && renderer.domElement.hasPointerCapture(pointerId)) {
        renderer.domElement.releasePointerCapture(pointerId);
    }
}

// Interrupted drags restore the document without adding an undo entry.
function cancelEditDrag(event) {
    if (event?.pointerId !== undefined && event.pointerId !== activeEditPointerId) return;
    if (!draggedAtom && !vacuumDragState.isDragging) return;
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
        updateVacuumHandles();
        updateUI(currentStructure);
    } else {
        rebuildDisplayOptions();
    }
    updateUI_forCurrentMode();
    updateDirtyIndicator();
    requestRender();
    statusText.textContent = 'Drag canceled; original geometry restored';
    statusText.className = '';
}

// Store drag plane info
let dragPlaneNormal = null;
let dragPlaneConstant = 0;
let dragPolygonVertices = []; // Vertices of the bounded polygon (in world coords)
let dragPlaneRight = null; // Local X axis on plane
let dragPlaneUp = null; // Local Y axis on plane
let dragPolygon2D = []; // Polygon vertices in 2D plane coords

// Create visual guide plane perpendicular to camera, bounded by unit cell
function createDragGuidePlane() {
    if (!currentStructure || !draggedAtom) return;
    
    removeDragGuidePlane();
    if (!hasLattice(currentStructure)) return;
    
    const lattice = currentStructure.lattice;
    const a = new THREE.Vector3(...lattice[0]);
    const b = new THREE.Vector3(...lattice[1]);
    const c = new THREE.Vector3(...lattice[2]);
    
    // Get camera direction (this is the plane normal)
    dragPlaneNormal = new THREE.Vector3();
    camera.getWorldDirection(dragPlaneNormal);
    
    // Atom world position
    const atomWorldPos = draggedAtom.mesh.position.clone().add(structureGroup.position);
    
    // Plane constant (distance from origin along normal)
    dragPlaneConstant = dragPlaneNormal.dot(atomWorldPos);
    
    // Find intersection of camera-perpendicular plane with unit cell edges
    const cellOrigin = structureGroup.position.clone();
    const corners = [
        cellOrigin.clone(),
        cellOrigin.clone().add(a),
        cellOrigin.clone().add(b),
        cellOrigin.clone().add(c),
        cellOrigin.clone().add(a).add(b),
        cellOrigin.clone().add(a).add(c),
        cellOrigin.clone().add(b).add(c),
        cellOrigin.clone().add(a).add(b).add(c)
    ];
    
    // 12 edges of the unit cell
    const edges = [
        [0, 1], [0, 2], [0, 3],
        [1, 4], [1, 5],
        [2, 4], [2, 6],
        [3, 5], [3, 6],
        [4, 7], [5, 7], [6, 7]
    ];
    
    // Find intersection points
    const intersections = [];
    edges.forEach(([i, j]) => {
        const p1 = corners[i];
        const p2 = corners[j];
        const d1 = dragPlaneNormal.dot(p1) - dragPlaneConstant;
        const d2 = dragPlaneNormal.dot(p2) - dragPlaneConstant;
        
        if (d1 * d2 < 0) {
            const t = d1 / (d1 - d2);
            const intersection = p1.clone().lerp(p2, t);
            intersections.push(intersection);
        }
    });
    
    if (intersections.length >= 3) {
        const centroid = new THREE.Vector3();
        intersections.forEach(p => centroid.add(p));
        centroid.divideScalar(intersections.length);
        
        // Create local coordinate system on the plane
        const up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(dragPlaneNormal.dot(up)) > 0.9) {
            up.set(1, 0, 0);
        }
        dragPlaneRight = new THREE.Vector3().crossVectors(up, dragPlaneNormal).normalize();
        dragPlaneUp = new THREE.Vector3().crossVectors(dragPlaneNormal, dragPlaneRight).normalize();
        
        // Sort by angle
        intersections.sort((a, b) => {
            const da = a.clone().sub(centroid);
            const db = b.clone().sub(centroid);
            const angleA = Math.atan2(da.dot(dragPlaneUp), da.dot(dragPlaneRight));
            const angleB = Math.atan2(db.dot(dragPlaneUp), db.dot(dragPlaneRight));
            return angleA - angleB;
        });
        
        // Store polygon vertices for constraint checking
        dragPolygonVertices = intersections.slice();
        
        // Convert to 2D for point-in-polygon tests
        dragPolygon2D = intersections.map(p => ({
            x: p.dot(dragPlaneRight),
            y: p.dot(dragPlaneUp)
        }));
        
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
    dragPolygonVertices = [];
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
        const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)));
        
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
    if (!dragPlaneNormal || dragPolygon2D.length < 3) return worldPos;
    
    // Project to 2D plane coordinates
    const px = worldPos.dot(dragPlaneRight);
    const py = worldPos.dot(dragPlaneUp);
    
    // Check if inside polygon
    if (pointInPolygon2D(px, py, dragPolygon2D)) {
        return worldPos; // Already inside
    }
    
    // Find closest point on polygon boundary
    const closest = closestPointOnPolygon2D(px, py, dragPolygon2D);
    
    // Convert back to 3D
    const pn = dragPlaneConstant; // distance along normal
    const result = dragPlaneNormal.clone().multiplyScalar(pn)
        .add(dragPlaneRight.clone().multiplyScalar(closest.x))
        .add(dragPlaneUp.clone().multiplyScalar(closest.y));
    
    return result;
}

// Mouse move handler
function onMouseMove(event) {
    if (!currentStructure) return;
    if (activeEditPointerId !== null && event.pointerId !== activeEditPointerId) return;
    
    // Handle vacuum drag
    if (vacuumDragState.isDragging) {
        updateVacuumDrag(event);
        return;
    }
    if (draggedAtom && currentMode !== 'edit') {
        cancelEditDrag();
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
            renderer.domElement.style.cursor = 'default';
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
            
            // Keep selection during drag - don't deselect
            // Selection visuals will move with the atom during drag
            
            // Visual feedback - highlight dragged atom
            setAtomGlow(draggedAtom.mesh, 0x00f5d4, 0.3);
            
            // Show guide plane (camera-facing, bounded by cell)
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
            
            // Update selection visuals in real-time
            if (selectedAtoms.length > 0) {
                // Update the position in selectedAtoms for the dragged atom
                const selectedIdx = selectedAtoms.findIndex(a => a.index === draggedAtom.index);
                if (selectedIdx !== -1) {
                    selectedAtoms[selectedIdx].position.copy(newWorldPos);
                }
                
                // Update selection label positions (rings/checkmarks move with atoms)
                updateSelectionVisualPositions();
                
                // Update measurement lines/arcs if preserving measurement
                if (isMeasurementSelection) {
                    updateMeasurements();
                    updateEditUI(); // Update panel with new values
                }
            }
        }
    }
}

// Mouse up handler
function onMouseUp(event) {
    if (!currentStructure) return;
    if (event.button !== 0) return; // Only left click
    if (activeEditPointerId !== null && event.pointerId !== activeEditPointerId) return;
    
    // Handle vacuum drag end
    if (vacuumDragState.isDragging) {
        endVacuumDrag();
        controls.enabled = true;
        releaseEditPointer();
        return;
    }
    if (draggedAtom && currentMode !== 'edit') {
        cancelEditDrag();
        return;
    }
    
    // Always re-enable controls on mouse up
    controls.enabled = true;
    
    if (draggedAtom && currentMode === 'edit') {
        if (isDragging) {
            // Finalize the move - this was a drag, not a click
            wasDragging = true; // Prevent click handler from firing
            
            // Remove guide plane
            removeDragGuidePlane();
            
            // Restore the selection glow if this atom was selected before dragging.
            if (selectedAtoms.some(atom => atom.mesh === draggedAtom.mesh)) highlightAtomMesh(draggedAtom.mesh);
            else unhighlightAtomMesh(draggedAtom.mesh);
            
            // Save move for undo (unified undo stack)
            const oldPos = draggedAtom.startPosition.clone();
            const newPos = draggedAtom.mesh.position.clone();
            
            const changed = oldPos.distanceTo(newPos) >= 1e-10;
            if (changed) {
                pushUndo({
                    type: 'move_atom',
                    index: draggedAtom.index,
                    oldPosition: oldPos,
                    newPosition: newPos.clone()
                });
            } else {
                newPos.copy(oldPos);
                draggedAtom.mesh.position.copy(oldPos);
            }
            
            // Update structure data
            currentStructure.atoms[draggedAtom.index].position.copy(newPos);
            currentStructure.atoms[draggedAtom.index].fractional = hasLattice(currentStructure)
                ? cartesianToFractional(newPos, currentStructure.lattice) : null;
            
            // Rebuild all display options (bonds, fixed indicators, etc.)
            rebuildDisplayOptions();
            
            // Update status
            statusText.textContent = changed ? `Moved atom #${draggedAtom.index + 1}` : 'Atom position unchanged';
            statusText.className = changed ? 'success' : '';
            
            // Update edit UI to show undo option
            updateEditUI();
        }
        // Note: We don't handle click here anymore - let the click event handle it
        
        isDragging = false;
        draggedAtom = null;
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
    
    const intersects = raycaster.intersectObjects(atomMeshes);
    
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
function onClickFallback(event) {
    if (!currentStructure) return;
    
    // Skip if we just finished dragging
    if (wasDragging) {
        wasDragging = false;
        return;
    }
    
    const mouseNDC = getMouseNDC(event);
    mouse.copy(mouseNDC);
    raycaster.setFromCamera(mouse, camera);
    
    // Check if clicking on an atom
    const intersects = raycaster.intersectObjects(atomMeshes, false);
    
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
    
    const smallestRadius = getSmallestAtomRadius();
    const labelSize = smallestRadius * 1.4;
    sprite.scale.set(labelSize, labelSize, labelSize);
    sprite.renderOrder = 999;
    sprite.userData.isSelectionLabel = true;
    
    measurementGroup.add(sprite);
    selectionRings.push(sprite);
}

// Keep keyboard focus when a panel rebuild replaces the active control.
function restorePanelFocus(focusedId, fallbackId) {
    const restoreFocus = () => {
        const replacement = focusedId && document.getElementById(focusedId);
        (replacement || document.getElementById(fallbackId))?.focus();
    };
    restoreFocus();
    // A native select popup can clear focus after its change handler ends.
    requestAnimationFrame(() => {
        if (document.activeElement === document.body) restoreFocus();
    });
}

function replacePanelHTML(panel, html, fallbackId) {
    const active = document.activeElement;
    const hadFocus = Boolean(active && panel.contains(active));
    const focusedId = hadFocus ? active.id : null;
    panel.innerHTML = html;
    if (hadFocus) restorePanelFocus(focusedId, fallbackId);
}

// Update edit mode UI
function updateEditUI() {
    const panel = document.getElementById('measurementPanel');
    if (!panel) return;
    
    let html = '';
    
    // Instructions
    html += '<div class="edit-instructions">Click to select • Drag to move</div>';
    
    if (selectedAtoms.length === 0) {
        html += `<p class="placeholder-text">${currentStructure ? (currentStructure.atoms.length ? 'No atoms selected' : 'No atoms remain. Add an atom or Undo the deletion.') : 'Load a structure to start editing'}</p>`;
    } else {
        if (selectedAtoms.length > 0) {
            // Check if this is a preserved measurement from Measure mode
            if (isMeasurementSelection) {
                // Show compact measurement display (read-only)
                html += '<div class="preserved-measurement">';
                html += '<div class="preserved-measurement-header">📐 Measurement Preserved</div>';
                html += '<div class="preserved-measurement-hint">Click atom to start editing</div>';
                html += measurementModeControlHTML();
                
                // Show measurement values
                if (selectedAtoms.length >= 2) {
                    const pair = getMeasurementPair(selectedAtoms[0], selectedAtoms[1]);
                    html += `<div class="preserved-measurement-value">Distance (1—2): <strong>${formatMeasuredDistance(pair)}</strong></div>`;
                    html += formatDeltaCompact(selectedAtoms[0], selectedAtoms[1]);
                }
                if (selectedAtoms.length === 3) {
                    const pair = getMeasurementPair(selectedAtoms[1], selectedAtoms[2]);
                    html += `<div class="preserved-measurement-value">Distance (2—3): <strong>${formatMeasuredDistance(pair)}</strong></div>`;
                    html += formatDeltaCompact(selectedAtoms[1], selectedAtoms[2]);
                    const angle = getMeasurementAngle();
                    if (angle) html += `<div class="preserved-measurement-value">Angle (1—2—3): <strong>${angle.angleDeg.toFixed(2)}°</strong></div>`;
                }
                
                html += `<button id="clearSelectionBtn" class="btn btn-clear" style="margin-top: 0.5rem;">Clear Measurement</button>`;
                html += '</div>';
            } else {
                // Normal edit selection UI
                html += `<div class="edit-warning">✓ ${selectedAtoms.length} atom${selectedAtoms.length > 1 ? 's' : ''} selected</div>`;
                
                html += '<div class="selected-atoms edit-mode">';
                selectedAtoms.forEach((atom, i) => {
                    // Get selective dynamics status
                    const sd = currentStructure.atoms[atom.index]?.selectiveDynamics || [true, true, true];
                    const isFixed = sd.every(v => v === false);
                    const statusIcon = isFixed ? '🔒' : '🔓';
                    
                    // Get formatted coordinates (clickable to toggle between fractional/cartesian)
                    const coordsHtml = formatAtomCoordinates(atom, i);
                    
                    html += `
                        <div class="selected-atom edit">
                            <div class="color-strip" style="background: #00f5d4"></div>
                            <span class="sel-num" style="background: #00f5d4; color: #0d1117">✓</span>
                            <span class="sel-elem">${atom.element}</span>
                            <span class="sel-idx">#${atom.index + 1}</span>
                            ${supportsSelectiveDynamics(currentStructure) ? `<span class="sel-status" title="${isFixed ? 'Fixed' : 'Active'}">${statusIcon}</span>` : ''}
                            ${coordsHtml}
                        </div>
                    `;
                });
                html += '</div>';

                if (selectedAtoms.length === 1 && !selectedAtoms[0].isGhost) {
                    const atom = currentStructure.atoms[selectedAtoms[0].index];
                    const fractional = hasLattice(currentStructure) && selectedAtomCoordMode === 'fractional';
                    const values = fractional ? cartesianToFractional(atom.position, currentStructure.lattice)
                        : [atom.position.x, atom.position.y, atom.position.z];
                    if (values) html += `
                        <div class="exact-atom-section">
                            <div class="sd-batch-title">Set atom #${selectedAtoms[0].index + 1} coordinates</div>
                            <label for="editAtomCoordMode">Coordinate system</label>
                            <select id="editAtomCoordMode" class="element-select">
                                <option value="cartesian"${fractional ? '' : ' selected'}>Cartesian (Å)</option>
                                ${hasLattice(currentStructure) ? `<option value="fractional"${fractional ? ' selected' : ''}>Fractional</option>` : ''}
                            </select>
                            <div class="add-atom-coords">
                                ${values.map((value, axis) => `<div class="coord-input-group">
                                    <label for="editAtom${axis}">${fractional ? ['a', 'b', 'c'][axis] : ['x', 'y', 'z'][axis]}</label>
                                    <input id="editAtom${axis}" type="number" step="any" value="${Number(value.toFixed(9))}" class="coord-input" required>
                                </div>`).join('')}
                            </div>
                            <div id="editAtomError" class="add-atom-error" role="alert"></div>
                            <button id="saveAtomCoordinates" type="button" class="btn btn-add-atom">Apply Coordinates</button>
                        </div>
                    `;
                }
                
                // Selective dynamics buttons for selected atoms
                if (supportsSelectiveDynamics(currentStructure)) html += `
                    <div class="sd-buttons">
                        <button id="fixSelectedBtn" class="btn btn-fix" title="Fix selected atoms (F F F)">🔒 Fix</button>
                        <button id="unfixSelectedBtn" class="btn btn-unfix" title="Make selected atoms active (T T T)">🔓 Active</button>
                    </div>
                `;
                
                html += `
                    <button id="deleteSelectedBtn" class="btn btn-delete">🗑️ Delete Selected</button>
                    <button id="clearSelectionBtn" class="btn btn-clear">Cancel Selection</button>
                `;
            }
        }
        
    }
    
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
                <div class="add-atom-coord-type">
                    <label class="coord-type-label">
                        <input type="radio" name="coordType" value="cartesian"${isCartesian ? ' checked' : ''}>
                        <span>Cartesian (Å)</span>
                    </label>
                    ${hasLattice(currentStructure) ? `<label class="coord-type-label">
                        <input type="radio" name="coordType" value="fractional"${!isCartesian ? ' checked' : ''}>
                        <span>Fractional</span>
                    </label>` : ''}
                </div>
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
        
        // Periodic Shift section (context-aware: selected atoms or all)
        const shiftIsCartesian = !hasLattice(currentStructure) || lastShiftCoordType === 'cartesian';
        const shiftStep = shiftIsCartesian ? '0.1' : '0.01';
        const shiftLabelX = shiftIsCartesian ? 'Δx' : 'Δa';
        const shiftLabelY = shiftIsCartesian ? 'Δy' : 'Δb';
        const shiftLabelZ = shiftIsCartesian ? 'Δz' : 'Δc';
        
        // Context-aware hint and button text
        const hasSelection = selectedAtoms.length > 0;
        const shiftTargetHint = hasSelection 
            ? `Will shift ${selectedAtoms.length} selected atom${selectedAtoms.length > 1 ? 's' : ''}`
            : `Will shift all ${currentStructure.atoms.length} atoms`;
        const shiftBtnText = hasSelection 
            ? `Shift ${selectedAtoms.length} Selected`
            : 'Shift All';
        
        html += `
            <div class="sd-batch-section">
                <div class="sd-batch-title">${isPeriodicStructure(currentStructure) ? 'Periodic Shift' : 'Move Atoms'}</div>
                <div class="shift-target-hint">${shiftTargetHint}</div>
                <div class="add-atom-coord-type">
                    <label class="coord-type-label">
                        <input type="radio" name="shiftCoordType" value="cartesian"${shiftIsCartesian ? ' checked' : ''}>
                        <span>Cartesian (Å)</span>
                    </label>
                    ${hasLattice(currentStructure) ? `<label class="coord-type-label">
                        <input type="radio" name="shiftCoordType" value="fractional"${!shiftIsCartesian ? ' checked' : ''}>
                        <span>Fractional</span>
                    </label>` : ''}
                </div>
                <div class="shift-coords">
                    <div class="shift-input-group">
                        <label for="shiftA" id="shiftLabelA">${shiftLabelX}</label>
                        <input type="number" id="shiftA" step="${shiftStep}" value="${lastShiftCoords.a}" class="shift-input">
                    </div>
                    <div class="shift-input-group">
                        <label for="shiftB" id="shiftLabelB">${shiftLabelY}</label>
                        <input type="number" id="shiftB" step="${shiftStep}" value="${lastShiftCoords.b}" class="shift-input">
                    </div>
                    <div class="shift-input-group">
                        <label for="shiftC" id="shiftLabelC">${shiftLabelZ}</label>
                        <input type="number" id="shiftC" step="${shiftStep}" value="${lastShiftCoords.c}" class="shift-input">
                    </div>
                </div>
                <div id="shiftError" class="add-atom-error"></div>
                <button id="applyShiftBtn" class="btn btn-shift">${shiftBtnText}</button>
                ${!hasSelection && hasLattice(currentStructure) ? '<button id="shiftCenterBtn" class="btn btn-sm btn-quick" title="Center structure in cell" style="width: 100%; margin-top: 0.5rem;">Center in Cell</button>' : ''}
            </div>
        `;
        
        // Selective Dynamics section
        if (supportsSelectiveDynamics(currentStructure)) html += `
            <div class="sd-batch-section">
                <div class="sd-batch-title">Selective Dynamics</div>
                <div class="sd-batch-row">
                    <label for="fixZThreshold">Fix atoms with z &lt;</label>
                    <input type="number" id="fixZThreshold" step="0.5" value="${lastZThreshold !== null ? lastZThreshold : getDefaultZThreshold()}" class="z-threshold-input">
                    <span>Å</span>
                </div>
                <div class="sd-batch-buttons">
                    <button id="fixByZBtn" class="btn btn-sm btn-fix">Apply</button>
                    <button id="unfixAllBtn" class="btn btn-sm btn-unfix">Unfix All</button>
                </div>
                <div class="sd-stats" id="sdStats">${getSelectiveDynamicsStats()}</div>
            </div>
        `;
    }
    
    replacePanelHTML(panel, html, 'atomJumpInput');
    setupMeasurementModeToggle();
    const coordinateMode = document.getElementById('editAtomCoordMode');
    if (coordinateMode) coordinateMode.addEventListener('change', event => {
        selectedAtomCoordMode = event.target.value;
        updateEditUI();
        // Some native popups clear activeElement before firing change.
        restorePanelFocus('editAtomCoordMode', 'atomJumpInput');
    });
    const saveCoordinates = document.getElementById('saveAtomCoordinates');
    if (saveCoordinates) saveCoordinates.addEventListener('click', applyExactAtomCoordinates);
    
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
    
    const fixByZBtn = document.getElementById('fixByZBtn');
    if (fixByZBtn) {
        fixByZBtn.addEventListener('click', fixAtomsByZThreshold);
    }
    
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

function applyExactAtomCoordinates() {
    if (!currentStructure || selectedAtoms.length !== 1 || selectedAtoms[0].isGhost) return false;
    const index = selectedAtoms[0].index;
    const fields = [0, 1, 2].map(axis => document.getElementById(`editAtom${axis}`));
    const error = document.getElementById('editAtomError');
    const values = fields.map(field => field && field.value.trim() !== '' ? Number(field.value) : NaN);
    if (values.some(value => !Number.isFinite(value))) {
        error.textContent = 'Enter three finite coordinates';
        return false;
    }
    const fractionalInput = hasLattice(currentStructure) && selectedAtomCoordMode === 'fractional';
    const position = fractionalInput ? fractionalToCartesian(values, currentStructure.lattice)
        : new THREE.Vector3(...values);
    const atom = currentStructure.atoms[index];
    if (atom.position.distanceTo(position) < 1e-10) return false;
    const oldPosition = atom.position.clone();
    try {
        commitGeometryEdit({ type: 'move_atom', index, oldPosition, newPosition: position.clone() }, [{ index, position }]);
    } catch {
        error.textContent = 'Coordinates cannot be represented in this cell';
        return false;
    }
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    statusText.textContent = `Set coordinates for atom #${index + 1}`;
    statusText.className = 'success';
    return true;
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
    if (!settings.showBonds) return;
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
    const bucketSize = settings.bondThreshold;
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
                        const limit = getBondLimit(first.userData.element, second.userData.element);
                        if (distance < limit && distance > 0.5) {
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

function getBondLimit(elementA, elementB) {
    if (!settings.useElementRadii) return settings.bondThreshold;
    const radiusA = (ELEMENT_DATA[elementA] || ELEMENT_DATA.DEFAULT).radius;
    const radiusB = (ELEMENT_DATA[elementB] || ELEMENT_DATA.DEFAULT).radius;
    return Math.min(settings.bondThreshold, 1.3 * (radiusA + radiusB));
}

function addPeriodicBoundaryBonds(buckets, bucketSize, addGhostBond) {
    const lattice = currentStructure.lattice;
    const preview = getPeriodicRepeats(currentStructure);
    const repeats = [preview.a, preview.b, preview.c];
    const periodicAxes = getPeriodicAxes(currentStructure);
    let plans;
    try {
        plans = CrystalGeometry.boundaryTranslationRanges(atomMeshes.map(atom => atom.position), lattice, repeats, periodicAxes, settings.bondThreshold);
        setGeometryWarning('bonds', '');
    } catch (error) {
        setGeometryWarning('bonds', error.message);
        return;
    }
    for (let index = 0; index < atomMeshes.length; index++) {
        const atom = atomMeshes[index];
        const shifts = plans[index].map(([first, last], axis) => {
            const values = [];
            for (let count = first; count <= last; count++) values.push(count * repeats[axis]);
            return values;
        });
        for (const ia of shifts[0]) for (const ib of shifts[1]) for (const ic of shifts[2]) {
            if (ia === 0 && ib === 0 && ic === 0) continue;
            const offset = [ia, ib, ic];
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
                    const limit = getBondLimit(atom.userData.element, neighbor.userData.element);
                    if (distance <= 0.5 || distance >= limit) continue;
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
    if (settings.showLabels) {
        atomMeshes.forEach((mesh, index) => {
            // Skip ghost atoms - only label real atoms
            if (mesh.userData.isGhost) return;
            
            const label = createAtomLabel(index + 1, mesh.position);
            structureGroup.add(label);
        });
    }
    requestRender();
}

// Create a subtle, camera-facing label sprite for an atom
function createAtomLabel(indexNumber, position) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas (transparent)
    ctx.clearRect(0, 0, 128, 128);
    
    // Subtle text - no background, just the number
    ctx.font = 'bold 72px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Subtle dark outline for visibility against light atoms
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeText(indexNumber.toString(), 64, 64);
    
    // Semi-transparent light text - visible but not distracting
    ctx.fillStyle = 'rgba(220, 220, 240, 0.6)';
    ctx.fillText(indexNumber.toString(), 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,  // Always visible, even behind atoms
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
    
    sprite.userData = { isAtomLabel: true, atomIndex: indexNumber - 1 };
    
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
    const newValue = isFixed ? [false, false, false] : [true, true, true];
    const changes = selectedAtoms.filter(atom => !atom.isGhost && currentStructure.atoms[atom.index]).map(atom => ({
        index: atom.index,
        oldSD: [...(currentStructure.atoms[atom.index].selectiveDynamics || [true, true, true])],
        newSD: [...newValue]
    }));
    const changedCount = applySelectiveDynamicsChanges(changes);
    const action = isFixed ? 'Fixed' : 'Unfixed';
    statusText.textContent = changedCount ? `${action} ${changedCount} atom(s)` : 'Selected atoms already have those constraints';
    statusText.className = changedCount ? 'success' : '';
}

// Fix atoms below z threshold (common for surface slabs)
function fixAtomsByZThreshold() {
    if (!supportsSelectiveDynamics(currentStructure)) return;
    
    const thresholdInput = document.getElementById('fixZThreshold');
    const thresholdText = thresholdInput?.value?.trim() || '';
    const threshold = Number(thresholdText);
    if (!thresholdText || !Number.isFinite(threshold)) {
        statusText.textContent = 'Enter a finite z threshold';
        statusText.className = 'error';
        return;
    }
    
    // Remember the user's threshold value
    lastZThreshold = threshold;
    
    // Save old values for undo (unified undo stack)
    const changes = currentStructure.atoms.map((atom, index) => ({
        index: index,
        oldSD: [...(atom.selectiveDynamics || [true, true, true])],
        newSD: atom.position.z < threshold ? [false, false, false] : [true, true, true]
    }));
    const changedCount = applySelectiveDynamicsChanges(changes);
    const fixedCount = currentStructure.atoms.filter(atom => atom.position.z < threshold).length;
    statusText.textContent = changedCount
        ? `Fixed ${fixedCount} atoms below z = ${threshold.toFixed(2)} Å`
        : 'Atoms already have those z-threshold constraints';
    statusText.className = changedCount ? 'success' : '';
}

// Unfix all atoms
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

// Get default z threshold (midpoint of z-range)
function getDefaultZThreshold() {
    if (!currentStructure || currentStructure.atoms.length === 0) return 0;
    return CrystalStructure.zMidpoint(currentStructure.atoms).toFixed(2);
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

// Apply global periodic shift from UI inputs
// Context-aware periodic shift: shifts selected atoms if any, otherwise all atoms
function applyGlobalPeriodicShift() {
    if (!currentStructure) return;
    
    const errorDiv = document.getElementById('shiftError');
    errorDiv.textContent = '';
    errorDiv.className = 'add-atom-error';
    
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
            atomData: {
                index: atomIndex,
                originalIndex: originalIndex,
                element: element,
                position: { x: worldPos.x, y: worldPos.y, z: worldPos.z },
                isGhost: isGhost,
                cellOffset: cellOffset ? { a: cellOffset.a, b: cellOffset.b, c: cellOffset.c } : null
            }
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
            // Also update the stored position in selectedAtoms
            selectedAtoms[i].position.copy(worldPos);
        }
    });
}

// Deselect an atom by its index in selectedAtoms array
function deselectAtom(selectedIndex, skipUndo = false) {
    // Remove highlight from deselected atom
    const atom = selectedAtoms[selectedIndex];
    if (atom && atom.mesh) {
        unhighlightAtomMesh(atom.mesh);
    }
    
    // Save for undo (unified undo stack)
    if (!skipUndo && atom) {
        pushUndo({
            type: 'deselect_atom',
            atomData: {
                index: atom.index,
                originalIndex: atom.originalIndex,
                element: atom.element,
                position: { x: atom.position.x, y: atom.position.y, z: atom.position.z },
                isGhost: atom.isGhost,
                cellOffset: atom.cellOffset ? { a: atom.cellOffset.a, b: atom.cellOffset.b, c: atom.cellOffset.c } : null
            },
            selectionIndex: selectedIndex
        });
    }
    
    selectedAtoms.splice(selectedIndex, 1);
    rebuildSelectionVisuals();
}

// Clear all selections
function clearSelection(skipUndo = false) {
    // Only save to undo if there's something to clear
    if (!skipUndo && selectedAtoms.length > 0) {
        // Save for undo (unified undo stack)
        const savedSelection = selectedAtoms.map(atom => ({
            index: atom.index,
            originalIndex: atom.originalIndex,
            element: atom.element,
            position: { x: atom.position.x, y: atom.position.y, z: atom.position.z },
            isGhost: atom.isGhost,
            cellOffset: atom.cellOffset ? { a: atom.cellOffset.a, b: atom.cellOffset.b, c: atom.cellOffset.c } : null
        }));
        pushUndo({
            type: 'clear_selection',
            savedSelection: savedSelection,
            wasMeasurementSelection: isMeasurementSelection
        });
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
// Size scales with the smallest atom to ensure labels are always smaller
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
    
    // Scale label based on smallest atom - always 70% of smallest atom's diameter
    const smallestRadius = getSmallestAtomRadius();
    const labelSize = smallestRadius * 1.4; // 70% of diameter (radius * 2 * 0.7)
    sprite.scale.set(labelSize, labelSize, labelSize);
    
    sprite.renderOrder = 999; // Render last (on top)
    sprite.userData.isSelectionLabel = true;
    
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
    // Clear previous measurement lines/arcs/labels
    const toRemove = [];
    measurementGroup.children.forEach(child => {
        if (child.userData.isMeasurementLine || child.userData.isMeasurementArc || child.userData.isMeasurementLabel) {
            toRemove.push(child);
        }
    });
    toRemove.forEach(obj => {
        measurementGroup.remove(obj);
        disposeObject3D(obj);
    });
    
    setGeometryWarning('measurement', '');
    for (let index = 0; index < Math.min(2, selectedAtoms.length - 1); index++) {
        const pair = getMeasurementPair(selectedAtoms[index], selectedAtoms[index + 1]);
        if (pair.unavailable) continue;
        drawMeasurementLine(pair.start, pair.end, index === 0 ? 0x00f5d4 : 0xf15bb5);
        const midpoint = pair.start.clone().add(pair.end).multiplyScalar(0.5);
        createFloatingDistanceLabel(midpoint, pair.distance);
    }
    if (selectedAtoms.length === 3) {
        const angle = getMeasurementAngle();
        const arcData = angle ? drawAngleArc(angle.first, angle.vertex, angle.third) : null;
        if (arcData) createFloatingAngleLabel(arcData.labelPosition, arcData.angleDeg);
    }
    requestRender();
}

// Get the floating label size (matches selection label size)
function getFloatingLabelSize() {
    const smallestRadius = getSmallestAtomRadius();
    return smallestRadius * 1.4; // Same as selection labels
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
    ctx.font = 'bold 24px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow for contrast against any background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // White text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${distance.toFixed(3)} Å`, 64, 16);
    
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
    
    measurementGroup.add(sprite);
}

// Create floating angle label (clean text, always faces camera)
function createFloatingAngleLabel(position, angleDeg) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Text with subtle shadow for visibility
    ctx.font = 'bold 24px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow for contrast
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // White text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${angleDeg.toFixed(1)}°`, 40, 16);
    
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
    sprite.scale.set(labelSize * 1.5, labelSize * 0.6, 1);
    sprite.renderOrder = 998;
    sprite.userData.isMeasurementLabel = true;
    
    measurementGroup.add(sprite);
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
    
    measurementGroup.add(line);
}

// Draw angle arc between three points - returns label position data
// Arc radius scales based on the MIDDLE atom (vertex = atom 2 in angle 1-2-3)
function drawAngleArc(pos1, vertex, pos3) {
    // Calculate vectors from vertex to other points
    const v1 = new THREE.Vector3().subVectors(pos1, vertex).normalize();
    const v2 = new THREE.Vector3().subVectors(pos3, vertex).normalize();
    
    // Calculate angle
    const angle = Math.acos(Math.max(-1, Math.min(1, v1.dot(v2))));
    const angleDeg = THREE.MathUtils.radToDeg(angle);
    
    // Get the MIDDLE atom's (vertex/atom 2) radius for scaling
    // Handle both real and ghost atoms
    const vertexElement = selectedAtoms[1].element;
    const elemData = ELEMENT_DATA[vertexElement] || ELEMENT_DATA.DEFAULT;
    const middleAtomRadius = elemData.radius * 0.4 * settings.atomScale;
    
    // Arc radius = 1.6x the middle atom's radius (always outside, proportional)
    const arcRadius = middleAtomRadius * 1.6;
    const segments = 32;
    const arcPoints = [];
    
    // Create rotation axis (perpendicular to the plane of the angle)
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    
    // Handle case where vectors are parallel
    if (normal.length() < 0.001) return null;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const currentAngle = angle * t;
        
        // Rotate v1 around normal by currentAngle
        const point = v1.clone().applyAxisAngle(normal, currentAngle);
        point.multiplyScalar(arcRadius).add(vertex);
        arcPoints.push(point);
    }
    
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2,
        transparent: true,
        opacity: 0.9
    });
    
    const arc = new THREE.Line(arcGeometry, arcMaterial);
    arc.userData.isMeasurementArc = true;
    measurementGroup.add(arc);
    
    // Calculate label position (bisector of the angle, outside the arc)
    const bisector = v1.clone().add(v2).normalize();
    const labelPosition = bisector.multiplyScalar(arcRadius * 1.8).add(vertex);
    
    return {
        angleDeg: angleDeg,
        labelPosition: labelPosition
    };
}

// Update measurement panel in UI with proper multi-color strips
function updateMeasurementUI() {
    const panel = document.getElementById('measurementPanel');
    if (!panel) return;
    
    const colors = ['#00f5d4', '#f15bb5', '#fee440']; // cyan, pink, yellow
    let html = measurementModeControlHTML();
    
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
            const pair = getMeasurementPair(selectedAtoms[0], selectedAtoms[1]);
            // Build label with ghost indicators
            const label1 = selectedAtoms[0].isGhost ? "1'" : '1';
            const label2 = selectedAtoms[1].isGhost ? "2'" : '2';
            
            // Fractional delta for distance 1-2
            const deltaHtml12 = formatDelta(selectedAtoms[0], selectedAtoms[1]);
            
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
                        ${pair.nearest && formatImageShift(pair.offset) ? `<span class="meas-note">Atom ${label2} image ${formatImageShift(pair.offset)}</span>` : ''}
                        ${deltaHtml12}
                    </div>
                </div>
            `;
        }
        
        if (selectedAtoms.length === 3) {
            const angle = getMeasurementAngle();
            
            // Build labels with ghost indicators
            const label1 = selectedAtoms[0].isGhost ? "1'" : '1';
            const label2 = selectedAtoms[1].isGhost ? "2'" : '2';
            const label3 = selectedAtoms[2].isGhost ? "3'" : '3';
            
            // Distance 2-3: two color strips (pink + yellow)
            const pair = getMeasurementPair(selectedAtoms[1], selectedAtoms[2]);
            
            // Fractional delta for distance 2-3
            const deltaHtml23 = formatDelta(selectedAtoms[1], selectedAtoms[2]);
            
            html += `
                <div class="measurement-result">
                    <div class="multi-color-strip">
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                        <div class="strip-segment" style="background: ${colors[2]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Distance (${label2}—${label3})</span>
                        <span class="meas-value">${formatMeasuredDistance(pair)}</span>
                        ${pair.nearest && formatImageShift(pair.offset) ? `<span class="meas-note">Atom ${label3} image ${formatImageShift(pair.offset)}</span>` : ''}
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
    setupMeasurementModeToggle();
    
    // Add clear button listener
    const clearBtn = document.getElementById('clearSelectionBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSelection);
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
        color: 0x00f5d4,
        transparent: true,
        opacity: 0.6
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
    const savedCameraPos = preserveState ? camera.position.clone() : null;
    const savedControlsTarget = preserveState ? controls.target.clone() : null;
    
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
        
        // Add atom label if enabled
        if (settings.showLabels) {
            const label = createAtomLabel(index + 1, atom.position);
            structureGroup.add(label);
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
    
    // Center the structure (includes ghost atoms now)
    const box = new THREE.Box3().setFromObject(structureGroup);
    const center = box.getCenter(new THREE.Vector3());
    structureGroup.position.sub(center);
    
    if (preserveState && savedCameraPos) {
        // Restore camera position
        camera.position.copy(savedCameraPos);
        controls.target.copy(savedControlsTarget);
        controls.update();
        
        // Restore selections with correct mode-aware visuals.
        selectedAtoms = restoreSelectedAtoms(savedSelections);
        
        // Rebuild visuals based on current mode
        rebuildSelectionVisuals();
        
        // Update the correct UI
        if (currentMode === 'measure') {
            updateMeasurementUI();
        } else {
            updateEditUI();
        }
    } else {
        fitStructureToView();
    }
    requestRender();
}

function fitStructureToView(preserveOrientation = false) {
    const box = new THREE.Box3().setFromObject(structureGroup);
    const size = Math.max(box.getSize(new THREE.Vector3()).length(), 1);
    const direction = preserveOrientation
        ? camera.position.clone().sub(controls.target).normalize()
        : new THREE.Vector3(1, 0.8, 1).normalize();
    const distance = size * 1.5 * Math.hypot(1, 0.8, 1);
    perspectiveCamera.position.copy(direction).multiplyScalar(distance);
    orthographicCamera.position.copy(direction).multiplyScalar(distance);
    orthographicCamera.zoom = 15 / (size * 1.2);
    orthographicCamera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();
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
    const fileType = structure.isXDATCAR ? 'xdatcar' : (structure.isXYZ ? 'xyz' : 'poscar');
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
    const latticeInfo = hasLattice(structure) ? `
        <div class="info-item"><span class="info-label">a</span><span class="info-value">${latticeA} Å</span></div>
        <div class="info-item"><span class="info-label">b</span><span class="info-value">${latticeB} Å</span></div>
        <div class="info-item"><span class="info-label">c</span><span class="info-value">${latticeC} Å</span></div>` : '';
    
    structureInfo.innerHTML = `
        <div class="info-item"><span class="info-label">Type</span><span class="info-value">${fileTypeBadge}</span></div>
        <div class="info-item"><span class="info-label">File</span><span class="info-value" title="${escapeHTML(currentFilename || '')}">${escapeHTML(currentFilename || 'Untitled')}</span></div>
        <div class="info-item"><span class="info-label">Title</span><span class="info-value" title="${escapeHTML(structure.comment)}">${escapeHTML(structure.comment.substring(0, 20))}</span></div>
        <div class="info-item"><span class="info-label">Total Atoms</span><span class="info-value">${structure.atoms.length}</span></div>
        ${latticeInfo}
        ${structure.isXYZ && structure.hasExplicitLattice ? `<div class="info-item"><span class="info-label">Periodic axes</span><span class="info-value">${['a', 'b', 'c'].filter((_, axis) => getPeriodicAxes(structure)[axis]).join(', ') || 'None'}</span></div>` : ''}
        ${frameInfo}
        ${sdInfo}
        ${structure.hasAdditionalSections ? '<p class="info-warning" role="note">This file has additional POSCAR data. An edited export will omit it.</p>' : ''}
        ${structure.hasAdditionalProperties ? '<p class="info-warning" role="note">This file has additional XYZ atom data. An edited export will omit it.</p>' : ''}
    `;
    
    // Atom list - count fixed per element
    let atomHTML = '';
    structure.elements.forEach((elem, i) => {
        const elemData = ELEMENT_DATA[elem] || ELEMENT_DATA.DEFAULT;
        const colorHex = '#' + elemData.color.toString(16).padStart(6, '0');
        
        const elementConstraints = constraints?.byElement.get(elem);
        const elemFixedCount = elementConstraints?.fixed || 0;
        const elemPartialCount = elementConstraints?.partial || 0;
        
        const fixedBadge = [
            elemFixedCount > 0 ? `<span class="fixed-badge" title="${elemFixedCount} fully fixed">🔒${elemFixedCount}</span>` : '',
            elemPartialCount > 0 ? `<span class="fixed-badge" title="${elemPartialCount} partially fixed">◐${elemPartialCount}</span>` : ''
        ].join('');
        
        atomHTML += `
            <div class="atom-entry fade-in" style="animation-delay: ${i * 0.05}s">
                <div class="atom-sphere" style="background: radial-gradient(circle at 30% 30%, ${lightenColor(colorHex, 40)}, ${colorHex})"></div>
                <div class="atom-info">
                    <div class="atom-symbol">${escapeHTML(elem)} ${fixedBadge}</div>
                    <div class="atom-count">${structure.counts[i]} atom${structure.counts[i] > 1 ? 's' : ''}</div>
                </div>
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
    camera.position.add(target.clone().sub(controls.target));
    controls.target.copy(target);
    controls.update();
    if (currentMode === 'measure' || isMeasurementSelection) updateMeasurements();
    updateUI_forCurrentMode();
    statusText.textContent = `Selected atom #${index + 1} (${currentStructure.atoms[index].element})`;
    statusText.className = '';
    return true;
}

function setupAtomJump() {
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
    } else {
        nextStructure = parsePOSCAR(content);
    }

    if (hasUnsavedEdits() && !window.confirm('Discard unsaved structure edits and open another file?')) {
        statusText.textContent = 'Kept the current structure and unsaved edits';
        statusText.className = '';
        return false;
    }

    cancelEditDrag();
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
    measurementMode = 'nearest';
    currentFilename = filename || 'Untitled';
    selectedAtomCoordMode = hasLattice(currentStructure) ? 'fractional' : 'cartesian';
    lastAddAtomElement = null;
    lastAddAtomSpecies = null;
    lastAddAtomCoords = { x: 0, y: 0, z: 0 };
    lastShiftCoords = { a: 0, b: 0, c: 0 };
    lastZThreshold = null;
    lastAddAtomCoordType = hasLattice(currentStructure) ? 'fractional' : 'cartesian';
    lastShiftCoordType = lastAddAtomCoordType;
    if (currentStructure.isXDATCAR) {

        if (currentMode === 'edit') {
            switchToMeasureMode();
        }

        showTimelinePanel();
        updateTimelineUI();

        statusText.textContent = `Loaded XDATCAR: ${filename} (${currentStructure.totalFrames} frames)`;
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
    statusText.className = currentStructure.hasAdditionalSections || currentStructure.hasAdditionalProperties ? 'warning' : 'success';
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
    document.getElementById('toggleAxes').addEventListener('click', (e) => {
        settings.showAxes = !settings.showAxes;
        e.currentTarget.classList.toggle('active', settings.showAxes);
        e.currentTarget.setAttribute('aria-pressed', String(settings.showAxes));
        // Axes HUD visibility is controlled in animate() loop via settings.showAxes
        requestRender();
    });
    
    // Toggle unit cell
    document.getElementById('toggleCell').addEventListener('click', (e) => {
        settings.showCell = !settings.showCell;
        e.currentTarget.classList.toggle('active', settings.showCell);
        e.currentTarget.setAttribute('aria-pressed', String(settings.showCell));
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Atom scale
    document.getElementById('atomScale').addEventListener('input', (e) => {
        settings.atomScale = parseFloat(e.target.value);
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Bond threshold
    const bondThreshold = document.getElementById('bondThreshold');
    const bondThresholdValue = document.getElementById('bondThresholdValue');
    
    bondThreshold.addEventListener('input', (e) => {
        settings.bondThreshold = parseFloat(e.target.value);
        bondThresholdValue.textContent = settings.bondThreshold.toFixed(1);
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Show bonds
    document.getElementById('showBonds').addEventListener('change', (e) => {
        settings.showBonds = e.target.checked;
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });

    document.getElementById('useElementRadii').addEventListener('change', (e) => {
        settings.useElementRadii = e.target.checked;
        if (currentStructure) renderStructure(currentStructure, true);
    });
    
    // Show labels (placeholder for future)
    document.getElementById('showLabels').addEventListener('change', (e) => {
        settings.showLabels = e.target.checked;
        if (currentStructure) {
            rebuildLabels();
        }
    });
    
    // Show fixed atom indicators
    document.getElementById('showFixedIndicators').addEventListener('change', (e) => {
        settings.showFixedIndicators = e.target.checked;
        if (currentStructure) {
            renderStructure(currentStructure, true); // Preserve state
        }
    });
    
    // Ghost opacity slider removed - using default 75%
    // Keeping the settings.ghostOpacity for future use
    
    // Export POSCAR button
    const exportBtn = document.getElementById('exportPoscar');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportStructure);
    }
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
        
        // Update displays
        document.getElementById('periodicADisplay').textContent = settings.periodic.a;
        document.getElementById('periodicBDisplay').textContent = settings.periodic.b;
        document.getElementById('periodicCDisplay').textContent = settings.periodic.c;
        document.getElementById('periodicA').value = settings.periodic.a;
        document.getElementById('periodicB').value = settings.periodic.b;
        document.getElementById('periodicC').value = settings.periodic.c;
        
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
        oldPeriodic: { a: na, b: nb, c: nc }
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

// Setup mode toggle
function setupModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    const modeBtns = modeToggle.querySelectorAll('.mode-btn');
    const panelTitle = document.getElementById('actionPanelTitle');
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === currentMode) return;
            
            // Block edit mode for XDATCAR files
            if (mode === 'edit' && currentStructure && !CrystalDocument.capabilities(currentStructure).editable) {
                statusText.textContent = 'Edit mode is disabled for trajectory files (XDATCAR)';
                statusText.className = '';
                return;
            }
            
            // Update mode
            currentMode = mode;
            
            // Update button states
            updateModeButtonState();
            
            // Update panel title
            if (panelTitle) {
                panelTitle.textContent = mode === 'measure' ? '📐 Measurements' : '✏️ Edit Actions';
            }
            
            // Preserve measurement selection when switching modes
            // If switching FROM measure mode with a selection, mark it as preserved measurement
            if (mode === 'edit' && selectedAtoms.length > 0) {
                isMeasurementSelection = true;
                // Keep measurement visuals visible - don't clear
            } else if (mode === 'measure') {
                // Switching to measure mode - keep selection if it's a preserved measurement
                if (!isMeasurementSelection) {
                    // If we had an edit selection (not measurement), clear it
                    clearSelection();
                }
                // Rebuild visuals for measure mode
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
        });
    });
}

function updateModeButtonState() {
    document.querySelectorAll('#modeToggle .mode-btn').forEach(button => {
        const active = button.dataset.mode === currentMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
}

function generatePOSCAR() { return crystalFormats.generatePOSCAR(currentStructure); }
function generateXYZ() { return crystalFormats.generateXYZ(currentStructure); }

// Soft snap to orthogonal axis view
// NOTE: All snap logic uses actual lattice vectors (a, b, c), not world axes (x, y, z)
// This ensures correct behavior for tilted/non-cubic primitive cells
const snapSettings = {
    enabled: true,
    // Visual depth threshold: snap when projected depth < threshold × average cell dimension
    // Using average dimension as reference provides consistent behavior across all axes
    visualDepthRatio: 0.08, // 8% of average dimension
    animationDuration: 300 // ms
};

let isSnapping = false;
let snapAnimation = null;

// Get orthogonal view directions based on lattice vectors
function getOrthogonalDirections() {
    if (!currentStructure || !currentStructure.lattice) return [];
    
    const lattice = currentStructure.lattice;
    
    // Get lattice vector lengths
    const aVec = new THREE.Vector3(lattice[0][0], lattice[0][1], lattice[0][2]);
    const bVec = new THREE.Vector3(lattice[1][0], lattice[1][1], lattice[1][2]);
    const cVec = new THREE.Vector3(lattice[2][0], lattice[2][1], lattice[2][2]);
    
    const aLen = aVec.length();
    const bLen = bVec.length();
    const cLen = cVec.length();
    
    // Average cell dimension - universal reference for visual depth
    const avgDim = (aLen + bLen + cLen) / 3;
    
    const a = aVec.clone().normalize();
    const b = bVec.clone().normalize();
    const c = cVec.clone().normalize();
    
    // Each direction has: normalized direction, name, up vector, depth length, and avgDim reference
    const directions = [
        { dir: a.clone(), name: '+a', baseUp: c.clone(), depthLen: aLen, avgDim },
        { dir: a.clone().negate(), name: '-a', baseUp: c.clone(), depthLen: aLen, avgDim },
        { dir: b.clone(), name: '+b', baseUp: c.clone(), depthLen: bLen, avgDim },
        { dir: b.clone().negate(), name: '-b', baseUp: c.clone(), depthLen: bLen, avgDim },
        { dir: c.clone(), name: '+c', baseUp: b.clone(), depthLen: cLen, avgDim },
        { dir: c.clone().negate(), name: '-c', baseUp: b.clone(), depthLen: cLen, avgDim }
    ];
    
    return directions;
}

// Get 8 valid up vectors for a face (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315° roll)
// This allows finer control especially for tilted/non-cubic cells
function getValidUpVectors(viewDir, baseUp) {
    const ups = [];
    
    // Compute right vector (perpendicular to both viewDir and baseUp)
    const right = new THREE.Vector3().crossVectors(baseUp, viewDir).normalize();
    
    // Generate 8 orientations at 45° increments
    for (let i = 0; i < 8; i++) {
        const angle = (i * 45) * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // Rotate baseUp around viewDir by angle
        // up_rotated = baseUp * cos(angle) + right * sin(angle)
        const rotatedUp = new THREE.Vector3()
            .addScaledVector(baseUp, cos)
            .addScaledVector(right, sin)
            .normalize();
        
        ups.push(rotatedUp);
    }
    
    return ups;
}

// Check if camera is close to an orthogonal direction and snap if needed
// Uses visual depth criterion: snap when projected depth is small relative to average cell size
function checkAndSnapToAxis() {
    if (!snapSettings.enabled || isSnapping || !hasLattice(currentStructure)) return;
    if (isPerspective) return; // Only snap in orthographic mode
    
    const directions = getOrthogonalDirections();
    if (directions.length === 0) return;
    
    // Get current camera direction (from target to camera - where camera is looking FROM)
    const cameraFromDir = new THREE.Vector3();
    cameraFromDir.subVectors(camera.position, controls.target).normalize();
    
    // Find the direction with the smallest visual depth ratio
    // Visual depth = projected depth / average cell dimension
    let closestDir = null;
    let closestBaseUp = null;
    let closestName = '';
    let smallestVisualDepth = Infinity;
    
    for (const { dir, name, baseUp, depthLen, avgDim } of directions) {
        // Must be facing towards this direction (dot > 0)
        const dot = cameraFromDir.dot(dir);
        if (dot <= 0) continue;
        
        // Angle from this axis
        const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
        
        // Projected depth = depthLen × sin(angle)
        // Normalized by average cell dimension for consistent visual criterion
        const visualDepth = (depthLen * Math.sin(angle)) / avgDim;
        
        if (visualDepth < smallestVisualDepth) {
            smallestVisualDepth = visualDepth;
            closestDir = dir.clone();
            closestBaseUp = baseUp.clone();
            closestName = name;
        }
    }
    
    // Snap when visual depth is below threshold
    if (!closestDir || smallestVisualDepth > snapSettings.visualDepthRatio) return;
    
    // Now find the closest roll orientation (0°, 90°, 180°, 270°)
    const validUps = getValidUpVectors(closestDir, closestBaseUp);
    const currentUp = camera.up.clone().normalize();
    
    let closestUp = validUps[0];
    let closestUpDot = -Infinity;
    
    for (const up of validUps) {
        const dot = currentUp.dot(up);
        if (dot > closestUpDot) {
            closestUpDot = dot;
            closestUp = up;
        }
    }
    
    // Animate to the snapped position with the closest up vector
    animateSnapToDirection(closestDir, closestUp, closestName);
}

// Smoothly animate camera to snap to direction using quaternion interpolation
function animateSnapToDirection(targetDir, targetUp, axisName) {
    if (isSnapping) return;
    isSnapping = true;
    
    const distance = camera.position.distanceTo(controls.target);
    
    // Target position: target + direction * distance
    const targetPosition = new THREE.Vector3()
        .copy(controls.target)
        .addScaledVector(targetDir, distance);
    
    // Create quaternions for start and end orientations
    const startQuaternion = camera.quaternion.clone();
    
    // Create a temporary camera to compute target orientation with FIXED up vector
    const tempCamera = camera.clone();
    tempCamera.position.copy(targetPosition);
    tempCamera.up.copy(targetUp); // Use the fixed up vector from crystallographic convention
    tempCamera.lookAt(controls.target);
    let targetQuaternion = tempCamera.quaternion.clone();
    
    // CRITICAL: Ensure we take the shortest path for slerp
    // If dot product is negative, negate target quaternion to avoid "long way around"
    if (startQuaternion.dot(targetQuaternion) < 0) {
        targetQuaternion = new THREE.Quaternion(
            -targetQuaternion.x,
            -targetQuaternion.y,
            -targetQuaternion.z,
            -targetQuaternion.w
        );
    }
    
    const startPosition = camera.position.clone();
    const startUp = camera.up.clone();
    const startTime = performance.now();
    
    function animateFrame() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / snapSettings.animationDuration, 1);
        
        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate position
        camera.position.lerpVectors(startPosition, targetPosition, eased);
        
        // Interpolate orientation using quaternion slerp (avoids gimbal lock)
        camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, eased);
        
        // Also interpolate up vector for controls consistency
        camera.up.lerpVectors(startUp, targetUp, eased).normalize();
        
        // Update controls
        controls.update();
        
        if (progress < 1) {
            snapAnimation = requestAnimationFrame(animateFrame);
        } else {
            // Finalize - ensure exact alignment
            camera.position.copy(targetPosition);
            camera.quaternion.copy(targetQuaternion);
            camera.up.copy(targetUp);
            controls.update();
            
            isSnapping = false;
            snapAnimation = null;
            statusText.textContent = `Aligned to ${axisName} axis`;
            statusText.className = '';
            
            // Update vacuum handles now that we're aligned
            updateVacuumHandles();
        }
    }
    
    animateFrame();
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
}

// Create edge detector box for vacuum drag
function createEdgeDetector(edgeStart, edgeVec, extendAxisName, handleType, facePoints) {
    const edgeLength = edgeVec.length();
    const detectWidth = Math.max(VACUUM_CONFIG.edgeDetectWidth, edgeLength * VACUUM_CONFIG.edgeDetectRatio);
    
    const geometry = new THREE.BoxGeometry(detectWidth, edgeLength, detectWidth);
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
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
    
    if (currentMode !== 'edit' || !hasLattice(currentStructure)) {
        vacuumDragState.active = false;
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
        updateVacuumHandles();
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
    const stem = sourceName.replace(/\.(xyz|xdatcar|vasp|poscar)$/i, '') || 'structure';
    
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
    const canReuseMeshes = sameLattice && atomMeshes.length >= currentStructure.atoms.length
        && currentStructure.atoms.every((_, index) => atomMeshes[index] && !atomMeshes[index].userData.isGhost);
    currentStructure.currentFrameIndex = frameIndex;
    
    // Restore the lattice stored with this frame.
    currentStructure.lattice = frame.lattice.map(v => [...v]);
    
    // Update atom positions
    for (let i = 0; i < currentStructure.atoms.length; i++) {
        currentStructure.atoms[i].position.copy(frame.positions[i]);
        currentStructure.atoms[i].fractional = frame.fractional[i];
        if (canReuseMeshes) atomMeshes[i].position.copy(frame.positions[i]);
    }
    
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
                if (child.userData.isAtomLabel) child.position.copy(atomMeshes[child.userData.atomIndex].position);
            });
        }
        updateSelectionVisualPositions();
        selectedAtoms.forEach(atom => atom.mesh.getWorldPosition(atom.position));
        if (selectedAtoms.length > 0) updateMeasurements();
        requestRender();
    } else {
        // A changed lattice also changes the cell and axes, so rebuild that frame.
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
            const frameIndex = parseInt(e.target.value);
            switchToFrame(frameIndex);
        });
        
        // Stop animation when user interacts with slider
        slider.addEventListener('mousedown', () => {
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
    const editBtn = document.querySelector('.mode-btn[data-mode="edit"]');
    const exportBtn = document.getElementById('exportPoscar');
    const periodic = hasLattice(currentStructure);
    const fixedIndicators = document.getElementById('showFixedIndicators');
    fixedIndicators.disabled = !supportsSelectiveDynamics(currentStructure);
    fixedIndicators.title = supportsSelectiveDynamics(currentStructure)
        ? 'Show fixed atoms' : 'Selective dynamics are available in POSCAR files';
    const cellBtn = document.getElementById('toggleCell');
    const axesBtn = document.getElementById('toggleAxes');
    axesBtn.disabled = !periodic;
    axesBtn.title = periodic ? 'Toggle Axes' : 'No lattice axes in a molecule';
    cellBtn.disabled = !periodic;
    cellBtn.title = periodic ? 'Toggle Unit Cell' : 'No unit cell in a molecule';
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
            editBtn.title = 'Edit mode disabled for trajectory files';
        }
        // Update export button for XDATCAR
        if (exportBtn) {
            exportBtn.title = 'Export as XDATCAR';
        }
    } else {
        // Enable edit mode for POSCAR
        if (editBtn) {
            editBtn.disabled = false;
            editBtn.title = 'Edit Mode';
        }
        // Update export button for POSCAR
        if (exportBtn) {
            exportBtn.title = currentStructure && currentStructure.isXYZ ? 'Export as XYZ' : 'Export as POSCAR';
        }
    }
}

// Helper function to switch to measure mode (used when loading XDATCAR)
function switchToMeasureMode() {
    if (currentMode === 'measure') return;
    
    currentMode = 'measure';
    
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
