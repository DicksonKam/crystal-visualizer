// === POSCAR Visualizer App ===
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

// Global state
let scene, camera, renderer, controls;
let perspectiveCamera, orthographicCamera;
let isPerspective = false; // Default to orthographic
let structureGroup, measurementGroup;
let currentStructure = null;

// Axes HUD (separate scene rendered in corner)
let axesScene, axesCamera, axesGroup;
let settings = {
    atomScale: 0.8,
    bondThreshold: 2.5,
    showBonds: true,
    showLabels: false,
    showAxes: true,
    showCell: true,
    periodic: { a: 1, b: 1, c: 1 }, // Periodic images in each direction
    ghostOpacity: 0.75, // Opacity of ghost atoms (default 75%)
    showFixedIndicators: true // Show visual indicators for fixed atoms
};

// Measurement state
let raycaster, mouse;
let selectedAtoms = []; // Array of { mesh, index, element, position }
let selectionRings = []; // Visual rings around selected atoms
let atomMeshes = []; // All atom meshes for raycasting

// Mode state: 'measure' or 'edit'
let currentMode = 'measure';
let deletedAtomsHistory = []; // For undo functionality
let moveHistory = []; // For undo atom moves
let lastZThreshold = null; // Remember user's z-threshold setting

// Remember Add Atom form values
let lastAddAtomElement = null;
let lastAddAtomCoords = { x: 0, y: 0, z: 0 };
let lastAddAtomCoordType = 'fractional'; // Default to fractional

// Remember Global Shift form values
let lastShiftCoords = { a: 0, b: 0, c: 0 };
let lastShiftCoordType = 'fractional'; // Default to fractional for shifts

// Selected atom coordinate display mode ('fractional' or 'cartesian')
let selectedAtomCoordMode = 'fractional'; // Default to fractional

// Drag state for moving atoms
let isDragging = false;
let wasDragging = false; // Flag to prevent click after drag
let draggedAtom = null; // { mesh, index, startPosition }
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
    mouse = new THREE.Vector2();
    
    // Initialize axes HUD
    initAxesHUD();
    
    // Animation loop
    animate();
    
    // Handle resize
    window.addEventListener('resize', onWindowResize);
    
    // Handle mouse events for atom selection and dragging
    // Use capture phase to ensure we handle events before OrbitControls/TrackballControls
    renderer.domElement.addEventListener('pointerdown', onMouseDown, { capture: true });
    renderer.domElement.addEventListener('pointermove', onMouseMove);
    renderer.domElement.addEventListener('pointerup', onMouseUp, { capture: true });
    renderer.domElement.addEventListener('click', onClickFallback);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
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
    if (settings.showAxes && axesScene && axesCamera && axesGroup) {
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
        axesGroup.remove(axesGroup.children[0]);
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

// Parse POSCAR file
function parsePOSCAR(content) {
    const lines = content.trim().split('\n').map(line => line.trim());
    
    // Line 0: Comment
    const comment = lines[0];
    
    // Line 1: Universal scaling factor
    const scale = parseFloat(lines[1]);
    
    // Lines 2-4: Lattice vectors
    const lattice = [];
    for (let i = 2; i <= 4; i++) {
        const parts = lines[i].split(/\s+/).filter(p => p).map(parseFloat);
        lattice.push(parts.map(v => v * scale));
    }
    
    // Line 5: Element symbols (VASP 5+ format)
    // Line 6: Number of atoms per element
    let elementLine = 5;
    let countLine = 6;
    
    // Check if line 5 contains numbers (VASP 4 format) or symbols (VASP 5+)
    const line5Parts = lines[5].split(/\s+/).filter(p => p);
    let elements = [];
    let counts = [];
    
    if (isNaN(parseInt(line5Parts[0]))) {
        // VASP 5+ format: line 5 has element symbols
        elements = line5Parts;
        counts = lines[6].split(/\s+/).filter(p => p).map(p => parseInt(p));
        elementLine = 7;
    } else {
        // VASP 4 format: no element symbols, only counts
        counts = line5Parts.map(p => parseInt(p));
        elements = counts.map((_, i) => `Atom${i + 1}`);
        elementLine = 6;
    }
    
    // Check for "Selective Dynamics" line (optional, starts with 'S' or 's')
    let hasSelectiveDynamics = false;
    const possibleSelectiveLine = lines[elementLine].toLowerCase();
    if (possibleSelectiveLine.startsWith('s')) {
        hasSelectiveDynamics = true;
        elementLine++; // Move past the "Selective Dynamics" line
    }
    
    // Coordinate type (Direct/Cartesian)
    const coordType = lines[elementLine].toLowerCase();
    const isDirect = coordType.startsWith('d') || coordType.startsWith('f');
    
    // Parse atomic positions
    const atoms = [];
    let atomIndex = elementLine + 1;
    
    for (let i = 0; i < elements.length; i++) {
        for (let j = 0; j < counts[i]; j++) {
            const posLine = lines[atomIndex];
            // Handle comments at end of line
            const cleanLine = posLine.split('!')[0].split('#')[0];
            const allParts = cleanLine.split(/\s+/).filter(p => p);
            
            // First 3 parts are coordinates
            let x = parseFloat(allParts[0]);
            let y = parseFloat(allParts[1]);
            let z = parseFloat(allParts[2]);
            
            // Parse selective dynamics flags (T/F for x, y, z)
            // Default to all active (true) if no selective dynamics
            let selectiveDynamics = [true, true, true];
            if (hasSelectiveDynamics && allParts.length >= 6) {
                selectiveDynamics = [
                    allParts[3].toUpperCase() === 'T',
                    allParts[4].toUpperCase() === 'T',
                    allParts[5].toUpperCase() === 'T'
                ];
            }
            
            // Store original fractional coordinates before conversion
            const originalFractional = isDirect ? [x, y, z] : null;
            
            // Convert to Cartesian if in direct/fractional coordinates
            if (isDirect) {
                const cartX = x * lattice[0][0] + y * lattice[1][0] + z * lattice[2][0];
                const cartY = x * lattice[0][1] + y * lattice[1][1] + z * lattice[2][1];
                const cartZ = x * lattice[0][2] + y * lattice[1][2] + z * lattice[2][2];
                x = cartX;
                y = cartY;
                z = cartZ;
            }
            
            atoms.push({
                element: elements[i],
                position: new THREE.Vector3(x, y, z),
                fractional: originalFractional,
                selectiveDynamics: selectiveDynamics // [xActive, yActive, zActive]
            });
            
            atomIndex++;
        }
    }
    
    return {
        comment,
        scale,
        lattice,
        elements,
        counts,
        atoms,
        isDirect,
        hasSelectiveDynamics
    };
}

// Create atom sphere
// selectiveDynamics: [xActive, yActive, zActive] - true means movable, false means fixed
function createAtom(element, position, atomIndex, selectiveDynamics = [true, true, true]) {
    const elemData = ELEMENT_DATA[element] || ELEMENT_DATA.DEFAULT;
    const radius = elemData.radius * 0.4 * settings.atomScale;
    
    // Check if any axis is fixed
    const isFullyFixed = selectiveDynamics.every(v => v === false);
    const isPartiallyFixed = selectiveDynamics.some(v => v === false) && !isFullyFixed;
    
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
        color: elemData.color,
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
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
    
    const geometry = new THREE.SphereGeometry(radius, 24, 24);
    const material = new THREE.MeshPhysicalMaterial({
        color: elemData.color,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: settings.ghostOpacity,
        depthWrite: false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
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
    
    if (selectedAtomCoordMode === 'fractional') {
        // Get fractional coordinates
        const frac = cartesianToFractional(
            new THREE.Vector3(originalPos.x, originalPos.y, originalPos.z),
            currentStructure.lattice
        );
        
        if (frac) {
            // Fractional: yellow/gold with square brackets
            const coordStr = `[${frac[0].toFixed(3)}, ${frac[1].toFixed(3)}, ${frac[2].toFixed(3)}]`;
            return `<div class="sel-coords sel-coords-frac clickable-coords" data-atom-idx="${atomIndex}" title="Click to show Cartesian">${coordStr}</div>`;
        }
    }
    
    // Cartesian: cyan with parentheses (default fallback)
    const coordStr = `(${originalPos.x.toFixed(2)}, ${originalPos.y.toFixed(2)}, ${originalPos.z.toFixed(2)})`;
    return `<div class="sel-coords sel-coords-cart clickable-coords" data-atom-idx="${atomIndex}" title="Click to show Fractional">${coordStr}</div>`;
}

// Toggle coordinate display mode and refresh UI
function toggleCoordinateDisplayMode() {
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
    
    const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0x888899,
        transparent: true,
        opacity: settings.ghostOpacity * 0.6, // Bonds slightly more transparent than atoms
        depthWrite: false
    });
    
    const bond = new THREE.Mesh(geometry, material);
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
    const { a: na, b: nb, c: nc } = settings.periodic;
    
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
    
    const ghostAtomPositions = [];
    
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
                    ghostAtomPositions.push({ position: ghostPos, element: atom.element });
                });
            }
        }
    }
    
    // Create ghost bonds if bonds are enabled
    if (settings.showBonds) {
        // Bonds within ghost cells
        for (let i = 0; i < ghostAtomPositions.length; i++) {
            for (let j = i + 1; j < ghostAtomPositions.length; j++) {
                const dist = ghostAtomPositions[i].position.distanceTo(ghostAtomPositions[j].position);
                if (dist < settings.bondThreshold && dist > 0.5) {
                    const bond = createGhostBond(ghostAtomPositions[i].position, ghostAtomPositions[j].position);
                    structureGroup.add(bond);
                }
            }
        }
        
        // Bonds between original atoms and ghost atoms (cross-boundary bonds)
        structure.atoms.forEach(atom => {
            ghostAtomPositions.forEach(ghost => {
                const dist = atom.position.distanceTo(ghost.position);
                if (dist < settings.bondThreshold && dist > 0.5) {
                    const bond = createGhostBond(atom.position, ghost.position);
                    structureGroup.add(bond);
                }
            });
        });
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
    }
}

// Remove drag guide plane
function removeDragGuidePlane() {
    if (dragGuidePlane) {
        scene.remove(dragGuidePlane);
        if (dragGuidePlane.geometry) dragGuidePlane.geometry.dispose();
        if (dragGuidePlane.material) dragGuidePlane.material.dispose();
        dragGuidePlane = null;
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
    
    // Handle vacuum drag
    if (vacuumDragState.isDragging) {
        updateVacuumDrag(event);
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
            
            // If atom was selected for deletion, deselect it immediately when dragging starts
            const selectedIndex = selectedAtoms.findIndex(a => a.index === draggedAtom.index);
            if (selectedIndex !== -1) {
                deselectAtom(selectedIndex);
                updateEditUI();
            }
            
            // Visual feedback - highlight dragged atom
            if (draggedAtom.mesh.material) {
                draggedAtom.mesh.material.emissive = new THREE.Color(0x00f5d4);
                draggedAtom.mesh.material.emissiveIntensity = 0.3;
            }
            
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
            
            // Update atom position
            draggedAtom.mesh.position.copy(newLocalPos);
        }
    }
}

// Mouse up handler
function onMouseUp(event) {
    if (!currentStructure) return;
    if (event.button !== 0) return; // Only left click
    
    // Handle vacuum drag end
    if (vacuumDragState.isDragging) {
        endVacuumDrag();
        controls.enabled = true;
        return;
    }
    
    // Always re-enable controls on mouse up
    controls.enabled = true;
    
    const mouseNDC = getMouseNDC(event);
    
    if (draggedAtom && currentMode === 'edit') {
        if (isDragging) {
            // Finalize the move - this was a drag, not a click
            wasDragging = true; // Prevent click handler from firing
            
            // Remove guide plane
            removeDragGuidePlane();
            
            // Remove highlight
            if (draggedAtom.mesh.material) {
                draggedAtom.mesh.material.emissive = new THREE.Color(0x000000);
                draggedAtom.mesh.material.emissiveIntensity = 0;
            }
            
            // Save move for undo
            const oldPos = draggedAtom.startPosition.clone();
            const newPos = draggedAtom.mesh.position.clone();
            
            moveHistory.push({
                index: draggedAtom.index,
                oldPosition: oldPos,
                newPosition: newPos.clone()
            });
            
            // Update structure data
            currentStructure.atoms[draggedAtom.index].position.copy(newPos);
            
            // Rebuild all display options (bonds, fixed indicators, etc.)
            rebuildDisplayOptions();
            
            // Update status
            statusText.textContent = `Moved atom #${draggedAtom.index + 1}`;
            statusText.className = 'success';
            
            // Update edit UI to show undo option
            updateEditUI();
        }
        // Note: We don't handle click here anymore - let the click event handle it
        
        isDragging = false;
        draggedAtom = null;
    }
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
            
            // Handle edit mode click - select/deselect for deletion
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

// Create red X marker for edit mode selection
function createEditSelectionMarker(atomMesh, selectionNumber) {
    const worldPos = new THREE.Vector3();
    atomMesh.getWorldPosition(worldPos);
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Red circle with X
    ctx.beginPath();
    ctx.arc(32, 32, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 80, 80, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw X
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(44, 44);
    ctx.moveTo(44, 20);
    ctx.lineTo(20, 44);
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

// Update edit mode UI
function updateEditUI() {
    const panel = document.getElementById('measurementPanel');
    if (!panel) return;
    
    let html = '';
    
    // Instructions
    html += '<div class="edit-instructions">Click to select • Drag to move</div>';
    
    if (selectedAtoms.length === 0 && moveHistory.length === 0 && deletedAtomsHistory.length === 0) {
        html += '<p class="placeholder-text">No edits yet</p>';
    } else {
        if (selectedAtoms.length > 0) {
            html += `<div class="edit-warning">⚠️ ${selectedAtoms.length} atom${selectedAtoms.length > 1 ? 's' : ''} selected</div>`;
            
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
                        <div class="color-strip" style="background: #ff5050"></div>
                        <span class="sel-num" style="background: #ff5050">✕</span>
                        <span class="sel-elem">${atom.element}</span>
                        <span class="sel-idx">#${atom.index + 1}</span>
                        <span class="sel-status" title="${isFixed ? 'Fixed' : 'Active'}">${statusIcon}</span>
                        ${coordsHtml}
                    </div>
                `;
            });
            html += '</div>';
            
            // Selective dynamics buttons for selected atoms
            html += `
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
        
        // Undo buttons
        if (moveHistory.length > 0 || deletedAtomsHistory.length > 0) {
            html += '<div class="undo-section">';
            if (moveHistory.length > 0) {
                html += `<button id="undoMoveBtn" class="btn btn-undo">↩️ Undo Move (${moveHistory.length})</button>`;
            }
            if (deletedAtomsHistory.length > 0) {
                html += `<button id="undoDeleteBtn" class="btn btn-undo">↩️ Undo Delete (${deletedAtomsHistory.length})</button>`;
            }
            html += '</div>';
        }
    }
    
    // Add Atom section (always show when structure loaded)
    if (currentStructure) {
        // Get available elements from current structure + common elements
        const existingElements = currentStructure.elements || [];
        const commonElements = ['H', 'C', 'N', 'O', 'S', 'Si', 'Fe', 'Cu', 'Zn', 'W', 'Ti', 'Pt', 'Au', 'Ag'];
        const allElements = [...new Set([...existingElements, ...commonElements])].sort();
        
        // Use last selected element or default to first in list
        const selectedElement = lastAddAtomElement || allElements[0];
        const elementOptions = allElements.map(e => 
            `<option value="${e}"${e === selectedElement ? ' selected' : ''}>${e}</option>`
        ).join('');
        
        // Use last coordinate type
        const isCartesian = lastAddAtomCoordType === 'cartesian';
        const step = isCartesian ? '0.1' : '0.01';
        
        html += `
            <div class="add-atom-section">
                <div class="sd-batch-title">Add Atom</div>
                <div class="add-atom-row">
                    <label>Element</label>
                    <select id="addAtomElement" class="element-select">
                        ${elementOptions}
                    </select>
                </div>
                <div class="add-atom-coord-type">
                    <label class="coord-type-label">
                        <input type="radio" name="coordType" value="cartesian"${isCartesian ? ' checked' : ''}>
                        <span>Cartesian (Å)</span>
                    </label>
                    <label class="coord-type-label">
                        <input type="radio" name="coordType" value="fractional"${!isCartesian ? ' checked' : ''}>
                        <span>Fractional</span>
                    </label>
                </div>
                <div class="add-atom-coords">
                    <div class="coord-input-group">
                        <label>x</label>
                        <input type="number" id="addAtomX" step="${step}" value="${lastAddAtomCoords.x}" class="coord-input">
                    </div>
                    <div class="coord-input-group">
                        <label>y</label>
                        <input type="number" id="addAtomY" step="${step}" value="${lastAddAtomCoords.y}" class="coord-input">
                    </div>
                    <div class="coord-input-group">
                        <label>z</label>
                        <input type="number" id="addAtomZ" step="${step}" value="${lastAddAtomCoords.z}" class="coord-input">
                    </div>
                </div>
                <div id="addAtomError" class="add-atom-error"></div>
                <button id="addAtomBtn" class="btn btn-add-atom">+ Add Atom</button>
            </div>
        `;
        
        // Global Periodic Shift section
        const shiftIsCartesian = lastShiftCoordType === 'cartesian';
        const shiftStep = shiftIsCartesian ? '0.1' : '0.01';
        const shiftLabelX = shiftIsCartesian ? 'Δx' : 'Δa';
        const shiftLabelY = shiftIsCartesian ? 'Δy' : 'Δb';
        const shiftLabelZ = shiftIsCartesian ? 'Δz' : 'Δc';
        
        html += `
            <div class="sd-batch-section">
                <div class="sd-batch-title">Global Periodic Shift</div>
                <div class="add-atom-coord-type">
                    <label class="coord-type-label">
                        <input type="radio" name="shiftCoordType" value="cartesian"${shiftIsCartesian ? ' checked' : ''}>
                        <span>Cartesian (Å)</span>
                    </label>
                    <label class="coord-type-label">
                        <input type="radio" name="shiftCoordType" value="fractional"${!shiftIsCartesian ? ' checked' : ''}>
                        <span>Fractional</span>
                    </label>
                </div>
                <div class="shift-coords">
                    <div class="shift-input-group">
                        <label id="shiftLabelA">${shiftLabelX}</label>
                        <input type="number" id="shiftA" step="${shiftStep}" value="${lastShiftCoords.a}" class="shift-input">
                    </div>
                    <div class="shift-input-group">
                        <label id="shiftLabelB">${shiftLabelY}</label>
                        <input type="number" id="shiftB" step="${shiftStep}" value="${lastShiftCoords.b}" class="shift-input">
                    </div>
                    <div class="shift-input-group">
                        <label id="shiftLabelC">${shiftLabelZ}</label>
                        <input type="number" id="shiftC" step="${shiftStep}" value="${lastShiftCoords.c}" class="shift-input">
                    </div>
                </div>
                <div id="shiftError" class="add-atom-error"></div>
                <button id="applyShiftBtn" class="btn btn-shift">Apply Shift</button>
                <div class="shift-quick-buttons">
                    <button id="shiftHalfCBtn" class="btn btn-sm btn-quick" title="Shift +0.5 along c-axis (fractional)">+½c</button>
                    <button id="shiftCenterBtn" class="btn btn-sm btn-quick" title="Center structure in cell">Center</button>
                </div>
            </div>
        `;
        
        // Selective Dynamics section
        html += `
            <div class="sd-batch-section">
                <div class="sd-batch-title">Selective Dynamics</div>
                <div class="sd-batch-row">
                    <label>Fix atoms with z &lt;</label>
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
    
    panel.innerHTML = html;
    
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
    
    const undoMoveBtn = document.getElementById('undoMoveBtn');
    if (undoMoveBtn) {
        undoMoveBtn.addEventListener('click', undoMove);
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
    
    const shiftHalfCBtn = document.getElementById('shiftHalfCBtn');
    if (shiftHalfCBtn) {
        shiftHalfCBtn.addEventListener('click', () => {
            applyPeriodicShiftByFractional(0, 0, 0.5);
        });
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
        });
    }
    
    // Coordinate type radio buttons - update step values and remember choice
    const coordTypeRadios = document.querySelectorAll('input[name="coordType"]');
    coordTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isFractional = e.target.value === 'fractional';
            const step = isFractional ? '0.01' : '0.1';
            document.getElementById('addAtomX').step = step;
            document.getElementById('addAtomY').step = step;
            document.getElementById('addAtomZ').step = step;
            
            // Remember coordinate type
            lastAddAtomCoordType = e.target.value;
            
            // Clear error when switching modes
            document.getElementById('addAtomError').textContent = '';
        });
    });
    
    const undoDeleteBtn = document.getElementById('undoDeleteBtn');
    if (undoDeleteBtn) {
        undoDeleteBtn.addEventListener('click', undoDelete);
    }
    
    // Clickable coordinates toggle
    const clickableCoords = document.querySelectorAll('.clickable-coords');
    clickableCoords.forEach(coord => {
        coord.addEventListener('click', toggleCoordinateDisplayMode);
    });
}

// Undo last atom move
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    
    // Restore position
    currentStructure.atoms[lastMove.index].position.copy(lastMove.oldPosition);
    atomMeshes[lastMove.index].position.copy(lastMove.oldPosition);
    
    // Rebuild all display options (bonds, fixed indicators, etc.)
    rebuildDisplayOptions();
    
    statusText.textContent = `Undid move of atom #${lastMove.index + 1}`;
    statusText.className = 'success';
    
    updateEditUI();
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
    
    rebuildBonds();
    rebuildFixedIndicators();
    rebuildLabels();
}

// Rebuild bonds between atoms
function rebuildBonds() {
    if (!currentStructure) return;
    
    // Remove existing bonds
    const toRemove = [];
    structureGroup.children.forEach(child => {
        // Bonds are cylinders (but not ghost bonds which have isGhostBond flag)
        if (child.geometry && child.geometry.type === 'CylinderGeometry' && !child.userData.isGhostBond) {
            toRemove.push(child);
        }
    });
    toRemove.forEach(bond => structureGroup.remove(bond));
    
    // Rebuild bonds if enabled
    if (settings.showBonds) {
        for (let i = 0; i < atomMeshes.length; i++) {
            for (let j = i + 1; j < atomMeshes.length; j++) {
                const pos1 = atomMeshes[i].position;
                const pos2 = atomMeshes[j].position;
                const dist = pos1.distanceTo(pos2);
                
                if (dist < settings.bondThreshold && dist > 0.5) {
                    const bond = createBond(pos1, pos2);
                    structureGroup.add(bond);
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
    toRemove.forEach(indicator => structureGroup.remove(indicator));
    
    // Rebuild fixed indicators if enabled
    if (settings.showFixedIndicators) {
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
    toRemove.forEach(label => structureGroup.remove(label));
    
    // Rebuild if enabled
    if (settings.showLabels) {
        atomMeshes.forEach((mesh, index) => {
            // Skip ghost atoms - only label real atoms
            if (mesh.userData.isGhost) return;
            
            const label = createAtomLabel(index + 1, mesh.position);
            structureGroup.add(label);
        });
    }
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
    
    // Save for undo
    const deletedIndices = selectedAtoms.map(a => a.index).sort((a, b) => b - a);
    const deletedAtoms = deletedIndices.map(i => ({
        index: i,
        atom: { ...currentStructure.atoms[i] }
    }));
    deletedAtomsHistory.push(deletedAtoms);
    
    // Remove atoms from structure (in reverse order to preserve indices)
    deletedIndices.forEach(index => {
        currentStructure.atoms.splice(index, 1);
    });
    
    // Recalculate element counts
    recalculateElementCounts();
    
    // Clear selection and re-render
    clearSelection();
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    // Update status
    statusText.textContent = `Deleted ${deletedIndices.length} atom(s)`;
    statusText.className = 'success';
}

// Undo last delete
function undoDelete() {
    if (deletedAtomsHistory.length === 0) return;
    
    const lastDeleted = deletedAtomsHistory.pop();
    
    // Restore atoms in order
    lastDeleted.sort((a, b) => a.index - b.index).forEach(item => {
        currentStructure.atoms.splice(item.index, 0, {
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
    
    // Recalculate element counts
    recalculateElementCounts();
    
    // Re-render
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    statusText.textContent = `Restored ${lastDeleted.length} atom(s)`;
    statusText.className = 'success';
}

// Set selected atoms as fixed or active
function setSelectedAtomsFixed(isFixed) {
    if (selectedAtoms.length === 0 || !currentStructure) return;
    
    const newValue = isFixed ? [false, false, false] : [true, true, true];
    
    selectedAtoms.forEach(atom => {
        if (currentStructure.atoms[atom.index]) {
            currentStructure.atoms[atom.index].selectiveDynamics = [...newValue];
        }
    });
    
    // Mark that structure has selective dynamics
    currentStructure.hasSelectiveDynamics = true;
    
    // Re-render to update indicators
    renderStructure(currentStructure, true);
    updateUI(currentStructure); // Update Structure Info and Atoms panels
    updateEditUI();
    
    const action = isFixed ? 'Fixed' : 'Unfixed';
    statusText.textContent = `${action} ${selectedAtoms.length} atom(s)`;
    statusText.className = 'success';
}

// Fix atoms below z threshold (common for surface slabs)
function fixAtomsByZThreshold() {
    if (!currentStructure) return;
    
    const thresholdInput = document.getElementById('fixZThreshold');
    const threshold = parseFloat(thresholdInput?.value || 0);
    
    // Remember the user's threshold value
    lastZThreshold = threshold;
    
    let fixedCount = 0;
    currentStructure.atoms.forEach(atom => {
        if (atom.position.z < threshold) {
            atom.selectiveDynamics = [false, false, false];
            fixedCount++;
        } else {
            atom.selectiveDynamics = [true, true, true];
        }
    });
    
    // Mark that structure has selective dynamics
    currentStructure.hasSelectiveDynamics = true;
    
    // Re-render
    renderStructure(currentStructure, true);
    updateUI(currentStructure); // Update Structure Info and Atoms panels
    updateEditUI();
    
    statusText.textContent = `Fixed ${fixedCount} atoms below z = ${threshold.toFixed(2)} Å`;
    statusText.className = 'success';
}

// Unfix all atoms
function unfixAllAtoms() {
    if (!currentStructure) return;
    
    currentStructure.atoms.forEach(atom => {
        atom.selectiveDynamics = [true, true, true];
    });
    
    currentStructure.hasSelectiveDynamics = false;
    
    // Re-render
    renderStructure(currentStructure, true);
    updateUI(currentStructure); // Update Structure Info and Atoms panels
    updateEditUI();
    
    statusText.textContent = 'All atoms set to active';
    statusText.className = 'success';
}

// Get default z threshold (midpoint of z-range)
function getDefaultZThreshold() {
    if (!currentStructure || currentStructure.atoms.length === 0) return 0;
    
    const zValues = currentStructure.atoms.map(a => a.position.z);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);
    
    return ((minZ + maxZ) / 2).toFixed(2);
}

// Get selective dynamics statistics
function getSelectiveDynamicsStats() {
    if (!currentStructure || currentStructure.atoms.length === 0) return '';
    
    let fixedCount = 0;
    let activeCount = 0;
    
    currentStructure.atoms.forEach(atom => {
        const sd = atom.selectiveDynamics || [true, true, true];
        if (sd.every(v => v === false)) {
            fixedCount++;
        } else {
            activeCount++;
        }
    });
    
    return `🔒 ${fixedCount} fixed • 🔓 ${activeCount} active`;
}

// ============================================
// Global Periodic Shift Functions
// ============================================

// Apply global periodic shift from UI inputs
function applyGlobalPeriodicShift() {
    if (!currentStructure) return;
    
    const errorDiv = document.getElementById('shiftError');
    errorDiv.textContent = '';
    errorDiv.className = 'add-atom-error';
    
    const val1 = parseFloat(document.getElementById('shiftA').value) || 0;
    const val2 = parseFloat(document.getElementById('shiftB').value) || 0;
    const val3 = parseFloat(document.getElementById('shiftC').value) || 0;
    const coordType = document.querySelector('input[name="shiftCoordType"]:checked').value;
    
    if (val1 === 0 && val2 === 0 && val3 === 0) {
        errorDiv.textContent = 'Enter a non-zero shift';
        return;
    }
    
    // Remember values
    lastShiftCoords = { a: val1, b: val2, c: val3 };
    lastShiftCoordType = coordType;
    
    if (coordType === 'fractional') {
        applyPeriodicShiftByFractional(val1, val2, val3);
        errorDiv.textContent = `Shifted by (${val1.toFixed(2)}, ${val2.toFixed(2)}, ${val3.toFixed(2)}) frac`;
    } else {
        applyPeriodicShiftByCartesian(val1, val2, val3);
        errorDiv.textContent = `Shifted by (${val1.toFixed(2)}, ${val2.toFixed(2)}, ${val3.toFixed(2)}) Å`;
    }
    errorDiv.className = 'add-atom-error success';
}

// Apply periodic shift by Cartesian coordinates (Å)
function applyPeriodicShiftByCartesian(deltaX, deltaY, deltaZ) {
    if (!currentStructure) return;
    
    const lattice = currentStructure.lattice;
    const shiftCartesian = new THREE.Vector3(deltaX, deltaY, deltaZ);
    
    // Apply shift to all atoms and wrap periodically
    currentStructure.atoms.forEach(atom => {
        // Shift in Cartesian
        atom.position.add(shiftCartesian);
        
        // Convert to fractional for wrapping
        const frac = cartesianToFractional(atom.position, lattice);
        
        if (frac) {
            // Wrap to [0, 1) range
            frac[0] = ((frac[0] % 1) + 1) % 1;
            frac[1] = ((frac[1] % 1) + 1) % 1;
            frac[2] = ((frac[2] % 1) + 1) % 1;
            
            // Convert back to Cartesian
            const newPos = fractionalToCartesian(frac, lattice);
            atom.position.copy(newPos);
            atom.fractional = frac;
        }
    });
    
    // Re-render structure
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    statusText.textContent = `Applied periodic shift`;
    statusText.className = 'success';
}

// Apply periodic shift by fractional coordinates
function applyPeriodicShiftByFractional(deltaA, deltaB, deltaC) {
    if (!currentStructure) return;
    
    const lattice = currentStructure.lattice;
    
    // Convert fractional shift to Cartesian
    const shiftCartesian = new THREE.Vector3(
        deltaA * lattice[0][0] + deltaB * lattice[1][0] + deltaC * lattice[2][0],
        deltaA * lattice[0][1] + deltaB * lattice[1][1] + deltaC * lattice[2][1],
        deltaA * lattice[0][2] + deltaB * lattice[1][2] + deltaC * lattice[2][2]
    );
    
    // Apply shift to all atoms and wrap periodically
    currentStructure.atoms.forEach(atom => {
        // Shift in Cartesian
        atom.position.add(shiftCartesian);
        
        // Convert to fractional for wrapping
        const frac = cartesianToFractional(atom.position, lattice);
        
        if (frac) {
            // Wrap to [0, 1) range
            frac[0] = ((frac[0] % 1) + 1) % 1;
            frac[1] = ((frac[1] % 1) + 1) % 1;
            frac[2] = ((frac[2] % 1) + 1) % 1;
            
            // Convert back to Cartesian
            const newPos = fractionalToCartesian(frac, lattice);
            atom.position.copy(newPos);
            atom.fractional = frac;
        }
    });
    
    // Re-render structure
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    statusText.textContent = `Applied periodic shift`;
    statusText.className = 'success';
}

// Center structure in the unit cell
function centerStructureInCell() {
    if (!currentStructure) return;
    
    const lattice = currentStructure.lattice;
    
    // Calculate current center of mass in fractional coordinates
    let sumFracA = 0, sumFracB = 0, sumFracC = 0;
    
    currentStructure.atoms.forEach(atom => {
        const frac = cartesianToFractional(atom.position, lattice);
        if (frac) {
            // Wrap to [0, 1) first
            sumFracA += ((frac[0] % 1) + 1) % 1;
            sumFracB += ((frac[1] % 1) + 1) % 1;
            sumFracC += ((frac[2] % 1) + 1) % 1;
        }
    });
    
    const n = currentStructure.atoms.length;
    const centerFracA = sumFracA / n;
    const centerFracB = sumFracB / n;
    const centerFracC = sumFracC / n;
    
    // Calculate shift to move center to (0.5, 0.5, 0.5)
    const deltaA = 0.5 - centerFracA;
    const deltaB = 0.5 - centerFracB;
    const deltaC = 0.5 - centerFracC;
    
    applyPeriodicShiftByFractional(deltaA, deltaB, deltaC);
    
    const errorDiv = document.getElementById('shiftError');
    if (errorDiv) {
        errorDiv.textContent = 'Structure centered in cell';
        errorDiv.className = 'add-atom-error success';
    }
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
    const x = parseFloat(xInput);
    const y = parseFloat(yInput);
    const z = parseFloat(zInput);
    
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
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
        // Validate fractional coordinates are in [0, 1]
        if (x < 0 || x > 1 || y < 0 || y > 1 || z < 0 || z > 1) {
            errorDiv.textContent = 'Fractional coords must be in [0, 1]';
            return;
        }
        
        fractionalPos = [x, y, z];
        cartesianPos = fractionalToCartesian(fractionalPos, currentStructure.lattice);
    } else {
        // Cartesian coordinates - validate within cell
        cartesianPos = new THREE.Vector3(x, y, z);
        
        const validation = isPositionInCell(cartesianPos, currentStructure.lattice);
        if (!validation.valid) {
            errorDiv.textContent = validation.message;
            return;
        }
        
        fractionalPos = validation.fractional;
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
    
    currentStructure.atoms.push(newAtom);
    
    // Recalculate element counts
    recalculateElementCounts();
    
    // Re-render
    renderStructure(currentStructure, true);
    updateUI(currentStructure);
    updateEditUI();
    
    // Show success message
    errorDiv.textContent = `Added ${element} at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;
    errorDiv.className = 'add-atom-error success';
    
    statusText.textContent = `Added ${element} atom`;
    statusText.className = 'success';
}

// Convert fractional coordinates to Cartesian
function fractionalToCartesian(frac, lattice) {
    const x = frac[0] * lattice[0][0] + frac[1] * lattice[1][0] + frac[2] * lattice[2][0];
    const y = frac[0] * lattice[0][1] + frac[1] * lattice[1][1] + frac[2] * lattice[2][1];
    const z = frac[0] * lattice[0][2] + frac[1] * lattice[1][2] + frac[2] * lattice[2][2];
    return new THREE.Vector3(x, y, z);
}

// Convert Cartesian coordinates to fractional
function cartesianToFractional(pos, lattice) {
    // Solve: pos = f[0]*a + f[1]*b + f[2]*c
    // Using matrix inversion
    const a = lattice[0];
    const b = lattice[1];
    const c = lattice[2];
    
    // Create 3x3 matrix from lattice vectors (column vectors)
    const det = a[0] * (b[1] * c[2] - b[2] * c[1])
              - a[1] * (b[0] * c[2] - b[2] * c[0])
              + a[2] * (b[0] * c[1] - b[1] * c[0]);
    
    if (Math.abs(det) < 1e-10) {
        return null; // Degenerate lattice
    }
    
    // Inverse matrix elements (transposed cofactor matrix / det)
    const invDet = 1.0 / det;
    
    const inv = [
        [(b[1] * c[2] - b[2] * c[1]) * invDet, (a[2] * c[1] - a[1] * c[2]) * invDet, (a[1] * b[2] - a[2] * b[1]) * invDet],
        [(b[2] * c[0] - b[0] * c[2]) * invDet, (a[0] * c[2] - a[2] * c[0]) * invDet, (a[2] * b[0] - a[0] * b[2]) * invDet],
        [(b[0] * c[1] - b[1] * c[0]) * invDet, (a[1] * c[0] - a[0] * c[1]) * invDet, (a[0] * b[1] - a[1] * b[0]) * invDet]
    ];
    
    // Multiply inverse by position
    const fx = inv[0][0] * pos.x + inv[0][1] * pos.y + inv[0][2] * pos.z;
    const fy = inv[1][0] * pos.x + inv[1][1] * pos.y + inv[1][2] * pos.z;
    const fz = inv[2][0] * pos.x + inv[2][1] * pos.y + inv[2][2] * pos.z;
    
    return [fx, fy, fz];
}

// Check if Cartesian position is within unit cell (fractional coords in [0, 1])
function isPositionInCell(pos, lattice) {
    const frac = cartesianToFractional(pos, lattice);
    
    if (!frac) {
        return { valid: false, message: 'Invalid lattice' };
    }
    
    const tolerance = 1e-6; // Small tolerance for boundary
    const [fx, fy, fz] = frac;
    
    // Check if fractional coordinates are in [0, 1] with small tolerance
    if (fx < -tolerance || fx > 1 + tolerance) {
        return { valid: false, message: `Outside cell: x (frac=${fx.toFixed(3)})` };
    }
    if (fy < -tolerance || fy > 1 + tolerance) {
        return { valid: false, message: `Outside cell: y (frac=${fy.toFixed(3)})` };
    }
    if (fz < -tolerance || fz > 1 + tolerance) {
        return { valid: false, message: `Outside cell: z (frac=${fz.toFixed(3)})` };
    }
    
    // Clamp to [0, 1] for atoms exactly on boundary
    const clampedFrac = [
        Math.max(0, Math.min(1, fx)),
        Math.max(0, Math.min(1, fy)),
        Math.max(0, Math.min(1, fz))
    ];
    
    return { valid: true, fractional: clampedFrac };
}

// Recalculate element counts after deletion
function recalculateElementCounts() {
    const elementMap = {};
    currentStructure.atoms.forEach(atom => {
        elementMap[atom.element] = (elementMap[atom.element] || 0) + 1;
    });
    
    currentStructure.elements = Object.keys(elementMap);
    currentStructure.counts = currentStructure.elements.map(e => elementMap[e]);
}

// Select an atom (mode-aware)
// For ghost atoms, atomIndex is a string like "ghost_0_100"
function selectAtom(mesh, atomIndex) {
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
    
    selectedAtoms.push({
        mesh: mesh,
        index: atomIndex,
        originalIndex: originalIndex,
        element: element,
        position: worldPos.clone(),
        isGhost: isGhost,
        cellOffset: cellOffset
    });
    
    // Create appropriate visual based on current mode
    createSelectionVisual(mesh, selectedAtoms.length, isGhost);
}

// Create selection visual based on current mode
function createSelectionVisual(mesh, selectionNumber, isGhost = false) {
    if (currentMode === 'measure') {
        createSelectionRing(mesh, selectionNumber, isGhost);
    } else {
        createEditSelectionMarker(mesh, selectionNumber);
    }
}

// Rebuild all selection visuals (used after mode change or re-render)
function rebuildSelectionVisuals() {
    clearMeasurementVisuals();
    selectedAtoms.forEach((atom, i) => {
        createSelectionVisual(atom.mesh, i + 1, atom.isGhost);
    });
    
    // Also rebuild measurement lines/arcs if in measure mode
    if (currentMode === 'measure') {
        updateMeasurements();
    }
}

// Deselect an atom by its index in selectedAtoms array
function deselectAtom(selectedIndex) {
    selectedAtoms.splice(selectedIndex, 1);
    rebuildSelectionVisuals();
}

// Clear all selections
function clearSelection() {
    selectedAtoms = [];
    clearMeasurementVisuals();
    updateUI_forCurrentMode();
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
    while (measurementGroup.children.length > 0) {
        measurementGroup.remove(measurementGroup.children[0]);
    }
    selectionRings = [];
}

// Get the smallest atom radius in the current structure
function getSmallestAtomRadius() {
    if (!currentStructure) return 0.3;
    
    let minRadius = Infinity;
    currentStructure.atoms.forEach(atom => {
        const elemData = ELEMENT_DATA[atom.element] || ELEMENT_DATA.DEFAULT;
        const radius = elemData.radius * 0.4 * settings.atomScale;
        if (radius < minRadius) {
            minRadius = radius;
        }
    });
    
    return minRadius;
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
    toRemove.forEach(obj => measurementGroup.remove(obj));
    
    if (selectedAtoms.length >= 2) {
        // Draw dashed line between atoms 1-2
        drawMeasurementLine(selectedAtoms[0].position, selectedAtoms[1].position, 0x00f5d4);
        
        // Add floating distance label at midpoint
        const midpoint = new THREE.Vector3().addVectors(
            selectedAtoms[0].position, 
            selectedAtoms[1].position
        ).multiplyScalar(0.5);
        const distance = selectedAtoms[0].position.distanceTo(selectedAtoms[1].position);
        createFloatingDistanceLabel(midpoint, distance);
    }
    
    if (selectedAtoms.length === 3) {
        // Draw line between atoms 2-3
        drawMeasurementLine(selectedAtoms[1].position, selectedAtoms[2].position, 0xf15bb5);
        
        // Add floating distance label for 2-3 at midpoint
        const midpoint23 = new THREE.Vector3().addVectors(
            selectedAtoms[1].position, 
            selectedAtoms[2].position
        ).multiplyScalar(0.5);
        const distance23 = selectedAtoms[1].position.distanceTo(selectedAtoms[2].position);
        createFloatingDistanceLabel(midpoint23, distance23);
        
        // Draw angle arc at vertex and get label position
        const arcData = drawAngleArc(
            selectedAtoms[0].position,
            selectedAtoms[1].position, // vertex
            selectedAtoms[2].position
        );
        
        // Add floating angle label near the arc
        if (arcData) {
            createFloatingAngleLabel(arcData.labelPosition, arcData.angleDeg);
        }
    }
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
    let html = '';
    
    if (selectedAtoms.length === 0) {
        html = '<p class="placeholder-text">Click atoms to measure</p>';
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
            const dist = selectedAtoms[0].position.distanceTo(selectedAtoms[1].position);
            // Build label with ghost indicators
            const label1 = selectedAtoms[0].isGhost ? "1'" : '1';
            const label2 = selectedAtoms[1].isGhost ? "2'" : '2';
            
            // Distance 1-2: two color strips (cyan + pink)
            html += `
                <div class="measurement-result">
                    <div class="multi-color-strip">
                        <div class="strip-segment" style="background: ${colors[0]}"></div>
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Distance (${label1}—${label2})</span>
                        <span class="meas-value">${dist.toFixed(4)} Å</span>
                    </div>
                </div>
            `;
        }
        
        if (selectedAtoms.length === 3) {
            const v1 = new THREE.Vector3().subVectors(selectedAtoms[0].position, selectedAtoms[1].position).normalize();
            const v2 = new THREE.Vector3().subVectors(selectedAtoms[2].position, selectedAtoms[1].position).normalize();
            const angle = Math.acos(Math.max(-1, Math.min(1, v1.dot(v2))));
            const angleDeg = THREE.MathUtils.radToDeg(angle);
            
            // Build labels with ghost indicators
            const label1 = selectedAtoms[0].isGhost ? "1'" : '1';
            const label2 = selectedAtoms[1].isGhost ? "2'" : '2';
            const label3 = selectedAtoms[2].isGhost ? "3'" : '3';
            
            // Distance 2-3: two color strips (pink + yellow)
            const dist23 = selectedAtoms[1].position.distanceTo(selectedAtoms[2].position);
            
            html += `
                <div class="measurement-result">
                    <div class="multi-color-strip">
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                        <div class="strip-segment" style="background: ${colors[2]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Distance (${label2}—${label3})</span>
                        <span class="meas-value">${dist23.toFixed(4)} Å</span>
                    </div>
                </div>
            `;
            
            // Angle 1-2-3: three color strips (cyan + pink + yellow)
            html += `
                <div class="measurement-result">
                    <div class="multi-color-strip triple">
                        <div class="strip-segment" style="background: ${colors[0]}"></div>
                        <div class="strip-segment" style="background: ${colors[1]}"></div>
                        <div class="strip-segment" style="background: ${colors[2]}"></div>
                    </div>
                    <div class="meas-content">
                        <span class="meas-label">Angle (${label1}—${label2}—${label3})</span>
                        <span class="meas-value angle-value">${angleDeg.toFixed(2)}°</span>
                    </div>
                </div>
            `;
        }
        
        // Clear button
        html += `<button id="clearSelectionBtn" class="btn btn-clear">Clear Selection</button>`;
    }
    
    panel.innerHTML = html;
    
    // Add clear button listener
    const clearBtn = document.getElementById('clearSelectionBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSelection);
    }
    
    // Clickable coordinates toggle
    const clickableCoords = document.querySelectorAll('.clickable-coords');
    clickableCoords.forEach(coord => {
        coord.addEventListener('click', toggleCoordinateDisplayMode);
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
    
    const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x888899,
        metalness: 0.3,
        roughness: 0.5
    });
    
    const bond = new THREE.Mesh(geometry, material);
    
    // Position at midpoint
    bond.position.copy(pos1).add(pos2).multiplyScalar(0.5);
    
    // Orient along the bond direction
    bond.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );
    
    bond.castShadow = true;
    
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
    // Save current selection indices and camera if preserving state
    const savedSelectionIndices = preserveState ? selectedAtoms.map(a => a.index) : [];
    const savedCameraPos = preserveState ? camera.position.clone() : null;
    const savedControlsTarget = preserveState ? controls.target.clone() : null;
    
    // Update axes HUD to reflect actual lattice vectors (for tilted/non-cubic cells)
    if (structure.lattice) {
        updateAxesFromLattice(structure.lattice);
    }
    
    // Clear previous structure
    while (structureGroup.children.length > 0) {
        structureGroup.remove(structureGroup.children[0]);
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
        if (settings.showFixedIndicators && selectiveDynamics.some(v => v === false)) {
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
    
    // Add bonds
    if (settings.showBonds) {
        for (let i = 0; i < structure.atoms.length; i++) {
            for (let j = i + 1; j < structure.atoms.length; j++) {
                const dist = structure.atoms[i].position.distanceTo(structure.atoms[j].position);
                if (dist < settings.bondThreshold && dist > 0.5) {
                    const bond = createBond(
                        structure.atoms[i].position,
                        structure.atoms[j].position
                    );
                    structureGroup.add(bond);
                }
            }
        }
    }
    
    // Add unit cell
    if (settings.showCell) {
        const unitCell = createUnitCell(structure.lattice);
        structureGroup.add(unitCell);
    }
    
    // Add periodic ghost atoms (before centering so they get centered too)
    addPeriodicImages(structure);
    
    // Center the structure (includes ghost atoms now)
    const box = new THREE.Box3().setFromObject(structureGroup);
    const center = box.getCenter(new THREE.Vector3());
    structureGroup.position.sub(center);
    
    if (preserveState && savedCameraPos) {
        // Restore camera position
        camera.position.copy(savedCameraPos);
        controls.target.copy(savedControlsTarget);
        controls.update();
        
        // Restore selections with correct mode-aware visuals
        savedSelectionIndices.forEach(atomIndex => {
            if (atomIndex < atomMeshes.length) {
                const atom = currentStructure.atoms[atomIndex];
                const mesh = atomMeshes[atomIndex];
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                
                selectedAtoms.push({
                    mesh: mesh,
                    index: atomIndex,
                    element: atom.element,
                    position: worldPos.clone()
                });
            }
        });
        
        // Rebuild visuals based on current mode
        rebuildSelectionVisuals();
        
        // Update the correct UI
        if (currentMode === 'measure') {
            updateMeasurementUI();
        } else {
            updateEditUI();
        }
    } else {
        // Initial load - set up both cameras
        const size = box.getSize(new THREE.Vector3()).length();
        const distance = size * 1.5;
        
        // Position both cameras
        perspectiveCamera.position.set(distance, distance * 0.8, distance);
        orthographicCamera.position.set(distance, distance * 0.8, distance);
        
        // Adjust orthographic zoom based on structure size
        orthographicCamera.zoom = 15 / (size * 1.2);
        orthographicCamera.updateProjectionMatrix();
        
        controls.target.set(0, 0, 0);
        controls.update();
    }
}

// Update UI with structure info
function updateUI(structure) {
    // Structure info
    const latticeA = Math.sqrt(structure.lattice[0].reduce((s, v) => s + v * v, 0)).toFixed(4);
    const latticeB = Math.sqrt(structure.lattice[1].reduce((s, v) => s + v * v, 0)).toFixed(4);
    const latticeC = Math.sqrt(structure.lattice[2].reduce((s, v) => s + v * v, 0)).toFixed(4);
    
    // Count fixed/active atoms
    let fixedCount = 0;
    structure.atoms.forEach(atom => {
        const sd = atom.selectiveDynamics || [true, true, true];
        if (sd.every(v => v === false)) fixedCount++;
    });
    const activeCount = structure.atoms.length - fixedCount;
    
    // Show selective dynamics info if any atoms are fixed
    const sdInfo = fixedCount > 0 
        ? `<div class="info-item"><span class="info-label">Fixed/Active</span><span class="info-value sd-info">🔒${fixedCount} / 🔓${activeCount}</span></div>`
        : '';
    
    structureInfo.innerHTML = `
        <div class="info-item"><span class="info-label">Title</span><span class="info-value">${structure.comment.substring(0, 20)}</span></div>
        <div class="info-item"><span class="info-label">Total Atoms</span><span class="info-value">${structure.atoms.length}</span></div>
        <div class="info-item"><span class="info-label">a</span><span class="info-value">${latticeA} Å</span></div>
        <div class="info-item"><span class="info-label">b</span><span class="info-value">${latticeB} Å</span></div>
        <div class="info-item"><span class="info-label">c</span><span class="info-value">${latticeC} Å</span></div>
        ${sdInfo}
    `;
    
    // Atom list - count fixed per element
    let atomHTML = '';
    structure.elements.forEach((elem, i) => {
        const elemData = ELEMENT_DATA[elem] || ELEMENT_DATA.DEFAULT;
        const colorHex = '#' + elemData.color.toString(16).padStart(6, '0');
        
        // Count fixed atoms of this element
        let elemFixedCount = 0;
        structure.atoms.forEach(atom => {
            if (atom.element === elem) {
                const sd = atom.selectiveDynamics || [true, true, true];
                if (sd.every(v => v === false)) elemFixedCount++;
            }
        });
        
        const fixedBadge = elemFixedCount > 0 
            ? `<span class="fixed-badge" title="${elemFixedCount} fixed">🔒${elemFixedCount}</span>` 
            : '';
        
        atomHTML += `
            <div class="atom-entry fade-in" style="animation-delay: ${i * 0.05}s">
                <div class="atom-sphere" style="background: radial-gradient(circle at 30% 30%, ${lightenColor(colorHex, 40)}, ${colorHex})"></div>
                <div class="atom-info">
                    <div class="atom-symbol">${elem} ${fixedBadge}</div>
                    <div class="atom-count">${structure.counts[i]} atom${structure.counts[i] > 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    });
    atomList.innerHTML = atomHTML;
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

// Handle file load
function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            currentStructure = parsePOSCAR(content);
            renderStructure(currentStructure);
            updateUI(currentStructure);
            
            // Hide drop zone
            dropZone.classList.add('hidden');
            
            // Update status
            statusText.textContent = `Loaded: ${file.name}`;
            statusText.className = 'success';
            
        } catch (error) {
            console.error('Error parsing POSCAR:', error);
            statusText.textContent = `Error: ${error.message}`;
            statusText.className = 'error';
        }
    };
    reader.readAsText(file);
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
    // Reset view
    document.getElementById('resetView').addEventListener('click', () => {
        if (currentStructure) {
            const box = new THREE.Box3().setFromObject(structureGroup);
            const size = box.getSize(new THREE.Vector3()).length();
            const distance = size * 1.5;
            
            // Reset both cameras
            perspectiveCamera.position.set(distance, distance * 0.8, distance);
            orthographicCamera.position.set(distance, distance * 0.8, distance);
            
            // Reset orthographic zoom
            orthographicCamera.zoom = 15 / (size * 1.2);
            orthographicCamera.updateProjectionMatrix();
            
            controls.target.set(0, 0, 0);
            controls.update();
        }
    });
    
    // Toggle axes
    document.getElementById('toggleAxes').addEventListener('click', (e) => {
        settings.showAxes = !settings.showAxes;
        e.currentTarget.classList.toggle('active', settings.showAxes);
        // Axes HUD visibility is controlled in animate() loop via settings.showAxes
    });
    
    // Toggle unit cell
    document.getElementById('toggleCell').addEventListener('click', (e) => {
        settings.showCell = !settings.showCell;
        e.currentTarget.classList.toggle('active', settings.showCell);
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
        exportBtn.addEventListener('click', exportPOSCAR);
    }
}

// Update Make Supercell button state based on periodicity
function updateSupercellButtonState() {
    const makeSupercellBtn = document.getElementById('makeSupercellBtn');
    if (!makeSupercellBtn) return;
    
    const { a, b, c } = settings.periodic;
    const hasPeriodicImages = a > 1 || b > 1 || c > 1;
    
    makeSupercellBtn.disabled = !hasPeriodicImages;
    makeSupercellBtn.title = hasPeriodicImages 
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
        
        // Clamp values
        settings.periodic.a = Math.max(1, Math.min(5, a));
        settings.periodic.b = Math.max(1, Math.min(5, b));
        settings.periodic.c = Math.max(1, Math.min(5, c));
        
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
                input.value = Math.min(5, currentVal + 1);
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
    
    const { a: na, b: nb, c: nc } = settings.periodic;
    
    // Skip if already 1×1×1
    if (na === 1 && nb === 1 && nc === 1) return false;
    
    const lattice = currentStructure.lattice;
    const aVec = new THREE.Vector3(...lattice[0]);
    const bVec = new THREE.Vector3(...lattice[1]);
    const cVec = new THREE.Vector3(...lattice[2]);
    
    // Create new atoms array with all periodic copies
    const newAtoms = [];
    
    for (let ia = 0; ia < na; ia++) {
        for (let ib = 0; ib < nb; ib++) {
            for (let ic = 0; ic < nc; ic++) {
                const translation = new THREE.Vector3()
                    .addScaledVector(aVec, ia)
                    .addScaledVector(bVec, ib)
                    .addScaledVector(cVec, ic);
                
                currentStructure.atoms.forEach(atom => {
                    const newPos = atom.position.clone().add(translation);
                    newAtoms.push({
                        element: atom.element,
                        position: newPos,
                        fractional: null, // Will need recalculation if needed
                        selectiveDynamics: atom.selectiveDynamics ? [...atom.selectiveDynamics] : [true, true, true]
                    });
                });
            }
        }
    }
    
    // Update lattice vectors for supercell
    const newLattice = [
        lattice[0].map(v => v * na),
        lattice[1].map(v => v * nb),
        lattice[2].map(v => v * nc)
    ];
    
    // Update structure
    currentStructure.atoms = newAtoms;
    currentStructure.lattice = newLattice;
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
            
            // Update mode
            currentMode = mode;
            
            // Update button states
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update panel title
            if (panelTitle) {
                panelTitle.textContent = mode === 'measure' ? '📐 Measurements' : '✏️ Edit Actions';
            }
            
            // Clear selections when switching modes (cleaner UX)
            clearSelection();
            
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

// Generate POSCAR content from current structure
function generatePOSCAR() {
    if (!currentStructure) return null;
    
    const lines = [];
    
    // Line 1: Comment
    lines.push(currentStructure.comment || 'Exported from Crystal Visualizer');
    
    // Line 2: Scale factor
    lines.push('1.0');
    
    // Lines 3-5: Lattice vectors
    currentStructure.lattice.forEach(vec => {
        lines.push(`  ${vec[0].toFixed(9)}  ${vec[1].toFixed(9)}  ${vec[2].toFixed(9)}`);
    });
    
    // Line 6: Element symbols
    lines.push(currentStructure.elements.join(' '));
    
    // Line 7: Number of atoms per element
    lines.push(currentStructure.counts.join(' '));
    
    // Check if any atoms actually have fixed axes (not just if original had Selective Dynamics)
    // Only output Selective Dynamics if at least one atom has a fixed axis
    const hasAnyFixedAtoms = currentStructure.atoms.some(atom => 
        atom.selectiveDynamics && atom.selectiveDynamics.some(v => v === false)
    );
    
    // Line 8: Selective Dynamics (optional) - only if there are actually fixed atoms
    if (hasAnyFixedAtoms) {
        lines.push('Selective Dynamics');
    }
    
    // Line 9 (or 8): Coordinate type (Cartesian)
    lines.push('Cartesian');
    
    // Atom positions - group by element, preserving selective dynamics
    const atomsByElement = {};
    currentStructure.elements.forEach(elem => {
        atomsByElement[elem] = [];
    });
    
    currentStructure.atoms.forEach(atom => {
        atomsByElement[atom.element].push({
            position: atom.position,
            selectiveDynamics: atom.selectiveDynamics || [true, true, true]
        });
    });
    
    // Write positions in element order
    currentStructure.elements.forEach(elem => {
        atomsByElement[elem].forEach(atomData => {
            const pos = atomData.position;
            let line = `  ${pos.x.toFixed(9)}  ${pos.y.toFixed(9)}  ${pos.z.toFixed(9)}`;
            
            // Add selective dynamics flags only if there are fixed atoms
            if (hasAnyFixedAtoms) {
                const sd = atomData.selectiveDynamics;
                line += `  ${sd[0] ? 'T' : 'F'} ${sd[1] ? 'T' : 'F'} ${sd[2] ? 'T' : 'F'}`;
            }
            
            lines.push(line);
        });
    });
    
    return lines.join('\n');
}

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
    if (!snapSettings.enabled || isSnapping || !currentStructure) return;
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
    
    if (currentMode !== 'edit' || !currentStructure) {
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

// Scale lattice vector by a factor
function scaleLatticeVector(lattice, axisIdx, scale) {
    return lattice[axisIdx].map(v => v * scale);
}

// Restore atoms and lattice to original state
function restoreOriginalState(axisIdx) {
    const { originalLattice, originalAtomPositions } = vacuumDragState;
    
    currentStructure.atoms.forEach((atom, i) => {
        const orig = originalAtomPositions[i];
        atom.position.set(orig.x, orig.y, orig.z);
    });
    currentStructure.lattice[axisIdx] = [...originalLattice[axisIdx]];
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
    
    const { dragExtendAxis: axis, dragHandle, originalLattice, originalAtomPositions, startLatticeLen: originalLen } = vacuumDragState;
    const axisIdx = axisToIndex(axis);
    const originalVec = getLatticeVector(originalLattice, axisIdx);
    const latticeDir = originalVec.clone().normalize();
    
    // Restore original state before applying new transformation
    restoreOriginalState(axisIdx);
    
    // Calculate new length from mouse movement
    const deltaLen = calculateDragDelta(event);
    let newLen = originalLen + deltaLen;
    
    // Get atom extent for bounds checking (use atom center coordinates, no padding)
    const { min: minProj, max: maxProj } = getAtomExtentAlongDirection(latticeDir, originalAtomPositions);
    
    // Minimum length: boundary must not pass through any atom's coordinate
    // Use a tiny epsilon to prevent floating point issues, not visual padding
    const epsilon = 0.001;
    
    if (dragHandle === 'far') {
        // Far face: boundary moves, atoms stay in place
        // Minimum: boundary must be beyond the farthest atom's coordinate
        newLen = Math.max(maxProj + epsilon, newLen);
        currentStructure.lattice[axisIdx] = scaleLatticeVector(originalLattice, axisIdx, newLen / originalLen);
    } else {
        // Near face: atoms shift with origin
        // After shift, the nearest atom must still be at or beyond the origin
        const minAllowedLen = originalLen + (epsilon - minProj);
        newLen = Math.max(minAllowedLen, newLen);
        
        currentStructure.lattice[axisIdx] = scaleLatticeVector(originalLattice, axisIdx, newLen / originalLen);
        
        // Shift atoms in lattice direction
        const shiftVec = latticeDir.clone().multiplyScalar(newLen - originalLen);
        currentStructure.atoms.forEach(atom => atom.position.add(shiftVec));
    }
    
    // Re-render and show drag highlight
    renderStructure(currentStructure, true);
    createDragFaceHighlight(axis, dragHandle);
    
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

// End vacuum drag operation
function endVacuumDrag() {
    if (!vacuumDragState.isDragging) return;
    
    const { dragExtendAxis: axis } = vacuumDragState;
    
    // Reset drag state
    Object.assign(vacuumDragState, {
        isDragging: false,
        dragHandle: null,
        dragExtendAxis: null,
        originalLattice: null,
        originalAtomPositions: null
    });
    
    clearVacuumHighlight();
    
    // Final render and status
    if (currentStructure && axis) {
        const newLen = getLatticeVector(currentStructure.lattice, axisToIndex(axis)).length();
        renderStructure(currentStructure, true);
        updateVacuumHandles();
        statusText.textContent = `Cell ${axis}-axis set to ${newLen.toFixed(3)} Å`;
        statusText.className = 'success';
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
}

// Export POSCAR file
function exportPOSCAR() {
    if (!currentStructure) {
        statusText.textContent = 'No structure to export';
        statusText.className = '';
        return;
    }
    
    const content = generatePOSCAR();
    if (!content) return;
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'POSCAR_exported';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    statusText.textContent = 'Exported POSCAR file';
    statusText.className = 'success';
}

// Initialize app
function init() {
    initScene();
    setupDragDrop();
    setupControls();
    setupModeToggle();
    setupPeriodicControls();
    
    statusText.textContent = 'Ready - Drop a POSCAR file to visualize';
}

// Start the app
init();

