// File parsing independent of rendering and browser state.
// POSCAR, XDATCAR, XYZ and CIF readers; POSCAR, XYZ and XDATCAR writers.
(function (root) {
    const { requireFiniteCell } = typeof module !== 'undefined' && module.exports ? require('./geometry.js') : root.CrystalGeometry;
    const documentModel = typeof module !== 'undefined' && module.exports ? require('./document.js') : root.CrystalDocument;
    function createFormats(Vector3, cartesianToFractional) {
        // Parse POSCAR file
        function parsePOSCAR(content) {
            const lines = content.trim().split('\n').map(line => line.trim());
            if (lines.length < 8) throw new Error('Invalid POSCAR: header is incomplete');

            // Line 0: Comment
            const comment = lines[0];

            // Line 1: one universal factor (or target volume), or three Cartesian factors.
            const scaleParts = lines[1].split(/\s+/).map(Number);
            if (![1, 3].includes(scaleParts.length) || scaleParts.some(value => !Number.isFinite(value) || value === 0)
                || (scaleParts.length === 3 && scaleParts.some(value => value < 0))) {
                throw new Error('Invalid POSCAR: expected one non-zero scale factor or three positive factors');
            }
            const scale = scaleParts.length === 1 ? scaleParts[0] : scaleParts;

            // Lines 2-4: Lattice vectors
            const lattice = [];
            for (let i = 2; i <= 4; i++) {
                const parts = lines[i].split(/\s+/).filter(p => p).map(Number);
                if (parts.length < 3 || parts.slice(0, 3).some(v => !Number.isFinite(v))) {
                    throw new Error(`Invalid POSCAR: lattice vector on line ${i + 1}`);
                }
                lattice.push(parts.slice(0, 3));
            }
            // A negative scale specifies the desired cell volume in Å³.
            const determinant = requireFiniteCell(lattice, 'POSCAR');
            const lengthScale = scaleParts.length === 1
                ? (scale > 0 ? scale : Math.cbrt(-scale / Math.abs(determinant)))
                : null;
            const cartesianScales = scaleParts.length === 3 ? scaleParts : [lengthScale, lengthScale, lengthScale];
            lattice.forEach(vector => vector.forEach((value, index) => { vector[index] = value * cartesianScales[index]; }));
            requireFiniteCell(lattice, 'POSCAR');

            // Line 5: Element symbols (VASP 5+ format)
            // Line 6: Number of atoms per element
            let elementLine = 5;

            // Check if line 5 contains numbers (VASP 4 format) or symbols (VASP 5+)
            const line5Parts = lines[5].split(/\s+/).filter(p => p);
            let elements = [];
            let counts = [];
            let hasElementSymbols = true;

            if (!/^\d+$/.test(line5Parts[0] || '')) {
                // VASP 5+ format: line 5 has element symbols
                elements = line5Parts;
                counts = lines[6].split(/\s+/).filter(p => p).map(Number);
                elementLine = 7;
            } else {
                // VASP 4 format: no element symbols, only counts
                hasElementSymbols = false;
                counts = line5Parts.map(Number);
                elements = counts.map((_, i) => `Atom${i + 1}`);
                elementLine = 6;
            }
            if (!counts.length || counts.length !== elements.length || counts.some(n => !Number.isSafeInteger(n) || n < 0) || counts.every(n => n === 0)) {
                throw new Error('Invalid POSCAR: element counts are missing or invalid');
            }
            if (elements.some(element => !/^[A-Za-z][A-Za-z0-9]*$/.test(element))) {
                throw new Error('Invalid POSCAR: element symbols contain unsupported characters');
            }

            // Check for "Selective Dynamics" line (optional, starts with 'S' or 's')
            let hasSelectiveDynamics = false;
            const possibleSelectiveLine = (lines[elementLine] || '').toLowerCase();
            if (possibleSelectiveLine.startsWith('s')) {
                hasSelectiveDynamics = true;
                elementLine++; // Move past the "Selective Dynamics" line
            }

            // Coordinate type (Direct/Cartesian)
            const coordType = (lines[elementLine] || '').toLowerCase();
            if (!/^[dcfk]/.test(coordType)) throw new Error('Invalid POSCAR: expected Direct or Cartesian coordinates');
            const isDirect = coordType.startsWith('d') || coordType.startsWith('f');
            if (counts.reduce((sum, count) => sum + count, 0) > lines.length - elementLine - 1) {
                throw new Error('Invalid POSCAR: fewer atom lines than the element counts require');
            }

            // Parse atomic positions
            const atoms = [];
            let atomIndex = elementLine + 1;

            for (let i = 0; i < elements.length; i++) {
                for (let j = 0; j < counts[i]; j++) {
                    const posLine = lines[atomIndex];
                    if (!posLine) throw new Error(`Invalid POSCAR: missing atom coordinates on line ${atomIndex + 1}`);
                    // Handle comments at end of line
                    const cleanLine = posLine.split('!')[0].split('#')[0];
                    const allParts = cleanLine.split(/\s+/).filter(p => p);

                    // First 3 parts are coordinates
                    let x = Number(allParts[0]);
                    let y = Number(allParts[1]);
                    let z = Number(allParts[2]);
                    if (allParts.length < 3 || ![x, y, z].every(Number.isFinite)) {
                        throw new Error(`Invalid POSCAR: coordinates on line ${atomIndex + 1}`);
                    }

                    // Parse selective dynamics flags (T/F for x, y, z)
                    // Default to all active (true) if no selective dynamics
                    let selectiveDynamics = [true, true, true];
                    if (hasSelectiveDynamics) {
                        if (allParts.length < 6 || allParts.slice(3, 6).some(flag => !/^[TF]$/i.test(flag))) {
                            throw new Error(`Invalid POSCAR: selective dynamics flags on line ${atomIndex + 1}`);
                        }
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
                    } else {
                        // In POSCAR, Cartesian positions are scaled along with lattice vectors.
                        x *= cartesianScales[0];
                        y *= cartesianScales[1];
                        z *= cartesianScales[2];
                    }
                    if (![x, y, z].every(Number.isFinite)) {
                        throw new Error(`Invalid POSCAR: scaled coordinates on line ${atomIndex + 1} are not finite`);
                    }

                    atoms.push({
                        element: elements[i],
                        position: new Vector3(x, y, z),
                        fractional: originalFractional,
                        selectiveDynamics: selectiveDynamics // [xActive, yActive, zActive]
                    });

                    atomIndex++;
                }
            }
            const hasAdditionalSections = lines.slice(atomIndex).some(Boolean);

            return documentModel.initialize({
                comment,
                scale,
                lattice,
                elements,
                counts,
                hasElementSymbols,
                atoms,
                isDirect,
                hasSelectiveDynamics,
                hasAdditionalSections,
                isXDATCAR: false
            });
        }

        // Parse XDATCAR file format (multi-frame trajectory)
        function parseXDATCAR(content) {
            const lines = content.trim().split('\n').map(line => line.trim());
            if (lines.length < 9) throw new Error('Invalid XDATCAR: header or frames are incomplete');

            // Line 0: Comment
            const comment = lines[0];

            // Line 1: Universal scaling factor
            const scale = Number(lines[1]);
            if (!Number.isFinite(scale) || scale <= 0) throw new Error('Invalid XDATCAR: scale factor must be positive');

            // Lines 2-4: Lattice vectors (this is the initial/reference lattice)
            const baseLattice = [];
            for (let i = 2; i <= 4; i++) {
                const parts = lines[i].split(/\s+/).filter(p => p).map(Number);
                if (parts.length < 3 || parts.slice(0, 3).some(v => !Number.isFinite(v))) {
                    throw new Error(`Invalid XDATCAR: lattice vector on line ${i + 1}`);
                }
                baseLattice.push(parts.slice(0, 3).map(v => v * scale));
            }
            requireFiniteCell(baseLattice, 'XDATCAR');

            // Line 5: Element symbols
            const elements = lines[5].split(/\s+/).filter(p => p);
            if (!elements.length || elements.some(element => !/^[A-Za-z][A-Za-z0-9]*$/.test(element))) {
                throw new Error('Invalid XDATCAR: element symbols are missing or invalid');
            }

            // Line 6: Number of atoms per element
            const counts = lines[6].split(/\s+/).filter(p => p).map(Number);
            if (counts.length !== elements.length || counts.some(n => !Number.isSafeInteger(n) || n < 0) || counts.every(n => n === 0)) {
                throw new Error('Invalid XDATCAR: element counts are missing or invalid');
            }
            const totalAtoms = counts.reduce((a, b) => a + b, 0);
            if (!Number.isSafeInteger(totalAtoms) || totalAtoms > lines.length - 8) {
                throw new Error('Invalid XDATCAR: fewer atom lines than the element counts require');
            }

            // Build element array for each atom
            const atomElements = [];
            for (let i = 0; i < elements.length; i++) {
                for (let j = 0; j < counts[i]; j++) {
                    atomElements.push(elements[i]);
                }
            }

            // Parse all frames
            const frames = [];
            let lineIndex = 7;

            while (lineIndex < lines.length) {
                const headerLine = lines[lineIndex];

                // Check for configuration header: "Direct configuration= N" or just "Direct"
                if (!headerLine) {
                    lineIndex++;
                    continue;
                }
                if (!/^direct(?:\s+configuration\s*=\s*\d+)?$/i.test(headerLine)) {
                    throw new Error(`Invalid XDATCAR: expected a Direct frame header on line ${lineIndex + 1}`);
                }

                lineIndex++; // Move past header

                // Parse atom positions for this frame
                const positions = [];
                const fractionalCoords = [];

                // XDATCAR uses the header lattice for every frame.
                const frameLattice = baseLattice.map(v => [...v]);

                for (let atomIdx = 0; atomIdx < totalAtoms; atomIdx++) {
                    if (lineIndex >= lines.length) {
                        throw new Error(`Invalid XDATCAR: frame ${frames.length + 1} is incomplete`);
                    }

                    const posLine = lines[lineIndex];
                    const parts = posLine.split(/\s+/).filter(p => p).map(Number);

                    if (parts.length < 3 || parts.slice(0, 3).some(v => !Number.isFinite(v))) {
                        throw new Error(`Invalid XDATCAR: coordinates on line ${lineIndex + 1}`);
                    }

                    const fx = parts[0];
                    const fy = parts[1];
                    const fz = parts[2];

                    // Store fractional coordinates
                    fractionalCoords.push([fx, fy, fz]);

                    // Convert to Cartesian
                    const cartX = fx * frameLattice[0][0] + fy * frameLattice[1][0] + fz * frameLattice[2][0];
                    const cartY = fx * frameLattice[0][1] + fy * frameLattice[1][1] + fz * frameLattice[2][1];
                    const cartZ = fx * frameLattice[0][2] + fy * frameLattice[1][2] + fz * frameLattice[2][2];
                    if (![cartX, cartY, cartZ].every(Number.isFinite)) {
                        throw new Error(`Invalid XDATCAR: Cartesian coordinates on line ${lineIndex + 1} are not finite`);
                    }

                    positions.push(new Vector3(cartX, cartY, cartZ));
                    lineIndex++;
                }

                frames.push({ lattice: frameLattice, positions, fractional: fractionalCoords });
            }

            if (frames.length === 0) {
                throw new Error('No valid frames found in XDATCAR file');
            }

            // Build initial atoms array from first frame
            const atoms = [];
            for (let i = 0; i < totalAtoms; i++) {
                atoms.push({
                    element: atomElements[i],
                    position: frames[0].positions[i].clone(),
                    fractional: frames[0].fractional[i],
                    selectiveDynamics: [true, true, true] // XDATCAR doesn't have selective dynamics
                });
            }

            return documentModel.initialize({
                comment,
                scale,
                lattice: frames[0].lattice, // Current lattice (from current frame)
                elements,
                counts,
                atoms,
                isDirect: true,
                hasSelectiveDynamics: false,
                isXDATCAR: true,
                frames: frames,
                currentFrameIndex: 0,
                totalFrames: frames.length
            });
        }

        // Detect if content is XDATCAR format
        function isXDATCARFormat(content) {
            // XDATCAR has multiple "Direct configuration=" lines or multiple "Direct" lines
            // after the header
            const lines = content.trim().split('\n');
            if (/^\d+$/.test((lines[0] || '').trim())) return false; // XYZ atom count
            let directCount = 0;

            for (let i = 7; i < lines.length; i++) {
                const line = lines[i].trim().toLowerCase();
                if (/^direct\s+configuration\s*=\s*\d+$/.test(line)) return true;
                if (line.startsWith('direct')) {
                    directCount++;
                    if (directCount > 1) return true; // Multiple Direct lines = XDATCAR
                }
            }

            return false;
        }

        // Detect standard / extended XYZ (first line = atom count, later lines = Element x y z)
        function isXYZFormat(content) {
            const lines = content.trimStart().split('\n').map(line => line.trim());
            if (lines.length < 3 || !/^\d+$/.test(lines[0])) return false;
            const nAtoms = Number(lines[0]);
            if (!Number.isSafeInteger(nAtoms) || nAtoms < 1) return false;
            const atomLines = lines.slice(2).filter(Boolean);
            if (atomLines.length < nAtoms) return false;
            try {
                const properties = parseExtendedXYZProperties(lines[1]);
                const parts = atomLines[0].split(/\s+/);
                return parts.length >= properties.columns && /^[A-Za-z][A-Za-z0-9]*$/.test(parts[properties.species]);
            } catch {
                return false;
            }
        }

        // Read top-level key/value spans; quoted strings may themselves contain
        // words such as pbc= or Properties=. Those are values, not new fields.
        function xyzHeaderFields(comment) {
            const fields = [];
            let index = 0;
            function token(strict = false) {
                const start = index;
                const open = comment[index];
                if (open === '"' || open === "'") {
                    index++;
                    while (index < comment.length) {
                        if (comment[index] === '\\') index += 2;
                        else if (comment[index++] === open) return comment.slice(start, index);
                    }
                    if (strict) throw new Error('Invalid extended XYZ: unterminated quoted field');
                    return comment.slice(start);
                }
                if (open === '[' || open === '{') {
                    const close = open === '[' ? ']' : '}';
                    index++;
                    while (index < comment.length && comment[index] !== close) {
                        if ('"\'[{'.includes(comment[index])) token(strict);
                        else index++;
                    }
                    if (index >= comment.length) {
                        if (strict) throw new Error('Invalid extended XYZ: unterminated array field');
                        return comment.slice(start);
                    }
                    index++;
                    return comment.slice(start, index);
                }
                while (index < comment.length && !/[\s=]/.test(comment[index])) index++;
                return comment.slice(start, index);
            }
            while (index < comment.length) {
                if (/\s/.test(comment[index])) { index++; continue; }
                const start = index;
                const rawKey = token();
                if (!rawKey) { index++; continue; }
                while (/\s/.test(comment[index] || '') && index < comment.length) index++;
                if (comment[index] !== '=') continue;
                index++;
                while (/\s/.test(comment[index] || '') && index < comment.length) index++;
                const rawValue = token(true);
                if (!rawValue) throw new Error('Invalid extended XYZ: missing field value');
                const unwrap = value => /^["'\[{]/.test(value) ? value.slice(1, -1) : value;
                fields.push({ key: unwrap(rawKey), value: unwrap(rawValue), raw: comment.slice(start, index), start, end: index });
            }
            return fields;
        }

        function xyzField(comment, name) {
            const matches = xyzHeaderFields(comment).filter(field => field.key.toLowerCase() === name.toLowerCase());
            if (matches.length > 1) throw new Error(`Invalid extended XYZ: duplicate ${name} fields`);
            return matches[0];
        }

        function parseExtendedXYZLattice(comment) {
            const field = xyzField(comment, 'Lattice');
            if (!field) return null;
            const nums = field.value.trim().split(/[\s,]+/).map(parseXYZReal);
            if (nums.length !== 9 || nums.some(n => !Number.isFinite(n))) {
                throw new Error('Invalid extended XYZ: Lattice must contain nine finite numbers');
            }
            return [nums.slice(0, 3), nums.slice(3, 6), nums.slice(6, 9)];
        }

        function parseXYZReal(value) {
            if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eEdD][+-]?\d+)?$/.test(value)) return NaN;
            return Number(value.replace(/[dD]/, 'e'));
        }

        function parseXYZPeriodicity(comment, hasLattice) {
            const field = xyzField(comment, 'pbc');
            if (!field) return [hasLattice, hasLattice, hasLattice];
            const values = field.value.trim().split(/[\s,]+/);
            if (values.length !== 3 || values.some(value => !/^(T|F|true|false)$/i.test(value))) {
                throw new Error('Invalid extended XYZ: pbc must contain three boolean flags');
            }
            const axes = values.map(value => /^(T|true)$/i.test(value));
            if (!hasLattice && axes.some(Boolean)) throw new Error('Invalid extended XYZ: periodic axes require a Lattice field');
            return axes;
        }

        function parseExtendedXYZProperties(comment) {
            const field = xyzField(comment, 'Properties');
            if (!field) return { species: 0, position: [1, 2, 3], positionTypes: ['R', 'R', 'R'], columns: 4 };
            const tokens = field.value.split(':');
            if (tokens.length % 3 !== 0) throw new Error('Invalid extended XYZ: Properties must use name:type:count triples');
            let columns = 0;
            let species = null;
            let position = null;
            let positionTypes = null;
            const coordinates = {};
            const names = new Set();
            for (let i = 0; i < tokens.length; i += 3) {
                const name = tokens[i].toLowerCase();
                const type = tokens[i + 1];
                const count = Number(tokens[i + 2]);
                if (!name || names.has(tokens[i])) throw new Error('Invalid extended XYZ: missing or duplicate Properties name');
                names.add(tokens[i]);
                if (!['S', 'I', 'R', 'L'].includes(type)) throw new Error(`Invalid extended XYZ: unknown Properties type for ${name}`);
                if (!/^\d+$/.test(tokens[i + 2]) || !Number.isSafeInteger(count) || count < 1
                    || !Number.isSafeInteger(columns + count)) throw new Error('Invalid extended XYZ: invalid Properties column count');
                if (name === 'species' || name === 'element') {
                    if (type !== 'S' || count !== 1 || species !== null) throw new Error('Invalid extended XYZ: species must be one string column');
                    species = columns;
                }
                if (name === 'pos') {
                    if (!['R', 'I'].includes(type) || count !== 3 || position !== null) throw new Error('Invalid extended XYZ: pos must be three numeric columns');
                    position = [columns, columns + 1, columns + 2];
                    positionTypes = [type, type, type];
                }
                if (['x', 'y', 'z'].includes(name) && tokens[i] !== 'Z') coordinates[name] = { column: columns, type, count };
                columns += count;
            }
            if (!position && ['x', 'y', 'z'].every(axis => coordinates[axis] !== undefined)) {
                position = ['x', 'y', 'z'].map(axis => {
                    const coordinate = coordinates[axis];
                    if (!['R', 'I'].includes(coordinate.type) || coordinate.count !== 1) {
                        throw new Error(`Invalid extended XYZ: ${axis} must be one numeric column`);
                    }
                    return coordinate.column;
                });
                positionTypes = ['x', 'y', 'z'].map(axis => coordinates[axis].type);
            }
            if (species === null || !position) {
                throw new Error('Invalid extended XYZ: Properties must include species and three position columns');
            }
            return { species, position, positionTypes, columns };
        }

        function latticeFromCartesianAtoms(positions, vacuum = 5) {
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
            positions.forEach(p => {
                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
                minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
            });
            const origin = new Vector3(minX - vacuum, minY - vacuum, minZ - vacuum);
            const lx = Math.max(maxX - minX + 2 * vacuum, 1);
            const ly = Math.max(maxY - minY + 2 * vacuum, 1);
            const lz = Math.max(maxZ - minZ + 2 * vacuum, 1);
            return {
                origin,
                lattice: [
                    [lx, 0, 0],
                    [0, ly, 0],
                    [0, 0, lz]
                ]
            };
        }

        function parseXYZ(content) {
            const rawLines = content.split('\n').map(line => line.trim());
            const countIndex = rawLines.findIndex(line => line.length > 0);
            if (countIndex < 0 || rawLines.length < countIndex + 3) {
                throw new Error('Invalid XYZ file: not enough lines');
            }

            if (!/^\d+$/.test(rawLines[countIndex])) {
                throw new Error('Invalid XYZ file: first line must be the number of atoms');
            }
            const nAtoms = Number(rawLines[countIndex]);
            if (!Number.isSafeInteger(nAtoms) || nAtoms < 1) throw new Error('Invalid XYZ file: atom count is invalid');

            // Keep the comment even if blank: second raw line after the count
            const rawComment = (rawLines[countIndex + 1] || '').trim();
            const properties = parseExtendedXYZProperties(rawComment);
            let hasAdditionalProperties = properties.columns > 4;

            const atoms = [];
            let parsed = 0;
            let lastAtomLine = countIndex + 1;
            for (let i = countIndex + 2; i < rawLines.length && parsed < nAtoms; i++) {
                const line = rawLines[i];
                if (!line) continue;
                const parts = line.split(/\s+/).filter(p => p);
                if (parts.length < properties.columns) {
                    throw new Error(`Invalid XYZ atom line ${parsed + 1}: expected ${properties.columns} columns`);
                }
                if (parts.length > properties.columns) hasAdditionalProperties = true;
                if (!/^[A-Za-z][A-Za-z0-9]*$/.test(parts[properties.species])) {
                    throw new Error(`Invalid XYZ element on atom line ${parsed + 1}`);
                }
                const element = parts[properties.species].replace(/\d+$/, '');
                const [x, y, z] = properties.position.map((index, axis) => {
                    if (properties.positionTypes[axis] === 'I' && !/^[+-]?\d+$/.test(parts[index])) return NaN;
                    return parseXYZReal(parts[index]);
                });
                if ([x, y, z].some(n => !Number.isFinite(n))) {
                    throw new Error(`Invalid XYZ coordinates on atom line ${parsed + 1}`);
                }
                atoms.push({
                    element,
                    position: new Vector3(x, y, z),
                    fractional: null,
                    selectiveDynamics: [true, true, true]
                });
                parsed++;
                lastAtomLine = i;
            }

            if (parsed !== nAtoms) {
                throw new Error(`XYZ file declared ${nAtoms} atoms but found ${parsed}`);
            }
            for (let i = lastAtomLine + 1; i < rawLines.length; i++) {
                if (rawLines[i]) {
                    throw new Error('XYZ file contains another frame or trailing data; only one frame is supported');
                }
            }

            let lattice = parseExtendedXYZLattice(rawComment);
            const hasExplicitLattice = Boolean(lattice);
            const pbc = parseXYZPeriodicity(rawComment, hasExplicitLattice);
            if (!lattice) {
                const box = latticeFromCartesianAtoms(atoms.map(a => a.position));
                lattice = box.lattice;
            }
            requireFiniteCell(lattice, hasExplicitLattice ? 'extended XYZ' : 'XYZ');

            if (hasExplicitLattice) {
                atoms.forEach(atom => {
                    atom.fractional = cartesianToFractional(atom.position, lattice);
                    if (!atom.fractional || atom.fractional.some(value => !Number.isFinite(value))) {
                        throw new Error('Invalid extended XYZ: coordinates cannot be represented in the lattice');
                    }
                });
            }

            const fields = xyzHeaderFields(rawComment);
            const structuralKeys = new Set(['lattice', 'properties', 'pbc']);
            const xyzMetadata = fields.filter(field => !structuralKeys.has(field.key.toLowerCase()))
                .map(({ key, raw }) => ({ key, raw }));
            let description = rawComment;
            for (const field of [...fields].reverse()) description = description.slice(0, field.start) + description.slice(field.end);
            const comment = description.trim() || 'XYZ structure';

            const order = [];
            const countsMap = Object.create(null);
            atoms.forEach(atom => {
                if (!(atom.element in countsMap)) {
                    order.push(atom.element);
                    countsMap[atom.element] = 0;
                }
                countsMap[atom.element]++;
            });

            const structure = documentModel.initialize({
                comment,
                scale: 1,
                lattice,
                elements: order,
                counts: order.map(el => countsMap[el]),
                atoms,
                isDirect: false,
                hasSelectiveDynamics: false,
                isXDATCAR: false,
                isXYZ: true,
                hasExplicitLattice,
                pbc,
                hasAdditionalProperties,
                xyzMetadata
            });
            structure.xyzSourceGeometry = documentModel.geometrySignature(structure);
            return structure;
        }
        // Generate POSCAR content from current structure
        function generatePOSCAR(structure) {
            if (!structure) return null;
            
            const lines = [];
            
            // Line 1: Comment
            lines.push(structure.comment || 'Exported from Crystal Visualizer');
            
            // Line 2: Scale factor
            lines.push('1.0');
            
            // Lines 3-5: Lattice vectors
            structure.lattice.forEach(vec => {
                lines.push(`  ${vec[0].toFixed(9)}  ${vec[1].toFixed(9)}  ${vec[2].toFixed(9)}`);
            });
            
            // Keep the counts-only layout when the source omitted species names.
            if (structure.hasElementSymbols !== false) lines.push(structure.elements.join(' '));
            
            // Species groups remain distinct even when their labels match.
            const groups = documentModel.groupedAtoms(structure);
            lines.push(groups.map(group => group.atoms.length).join(' '));
            
            // Check if any atoms actually have fixed axes (not just if original had Selective Dynamics)
            // Only output Selective Dynamics if at least one atom has a fixed axis
            const hasAnyFixedAtoms = structure.atoms.some(atom => 
                atom.selectiveDynamics && atom.selectiveDynamics.some(v => v === false)
            );
            
            // Line 8: Selective Dynamics (optional) - only if there are actually fixed atoms
            if (hasAnyFixedAtoms) {
                lines.push('Selective Dynamics');
            }
            
            // Line 9 (or 8): Coordinate type (Cartesian)
            lines.push('Cartesian');
            
            // Each atom belongs to one group; never group solely by label.
            for (const group of groups) for (const atom of group.atoms) {
                const pos = atom.position;
                let line = `  ${pos.x.toFixed(9)}  ${pos.y.toFixed(9)}  ${pos.z.toFixed(9)}`;
                if (hasAnyFixedAtoms) {
                    const sd = atom.selectiveDynamics || [true, true, true];
                    line += `  ${sd[0] ? 'T' : 'F'} ${sd[1] ? 'T' : 'F'} ${sd[2] ? 'T' : 'F'}`;
                }
                lines.push(line);
            }

            return lines.join('\n');
        }

        const descriptiveXYZKeys = new Set(['name', 'label', 'comment', 'config_type']);
        function omittedXYZMetadata(structure) {
            if (!structure.xyzSourceGeometry || structure.xyzSourceGeometry === documentModel.geometrySignature(structure)) return [];
            return (structure.xyzMetadata || []).filter(field => !descriptiveXYZKeys.has(field.key.toLowerCase()));
        }

        function generateXYZ(structure) {
            if (!structure) return null;
            const description = structure.comment || 'Exported from Crystal Visualizer';
            const metadata = structure.hasExplicitLattice
                ? `Lattice="${structure.lattice.flat().map(value => value.toFixed(12)).join(' ')}" Properties=species:S:1:pos:R:3 pbc="${(structure.pbc || [true, true, true]).map(value => value ? 'T' : 'F').join(' ')}"`
                : '';
            const omitted = new Set(omittedXYZMetadata(structure).map(field => field.key));
            const retained = (structure.xyzMetadata || []).filter(field => !omitted.has(field.key)).map(field => field.raw);
            const lines = [String(structure.atoms.length), [description, ...retained, metadata].filter(Boolean).join(' ')];
            structure.atoms.forEach(atom => {
                const { x, y, z } = atom.position;
                lines.push(`${atom.element} ${x.toFixed(9)} ${y.toFixed(9)} ${z.toFixed(9)}`);
            });
            return lines.join('\n') + '\n';
        }

        // Generate XDATCAR content from current structure
        function generateXDATCAR(structure) {
            if (!structure || !structure.isXDATCAR) return null;
            
            const lines = [];
            
            // Line 1: Comment
            lines.push(structure.comment || 'Exported from Crystal Visualizer');
            
            // Line 2: Scale factor (always 1.0 for output)
            lines.push('           1');
            
            // Lines 3-5: Lattice vectors (use first frame's lattice as reference)
            const refLattice = structure.frames[0].lattice;
            refLattice.forEach(vec => {
                lines.push(`     ${vec[0].toFixed(12)}    ${vec[1].toFixed(12)}    ${vec[2].toFixed(12)}`);
            });
            
            // Line 6: Element symbols
            lines.push('   ' + structure.elements.join('    '));
            
            // Line 7: Number of atoms per element
            lines.push('  ' + structure.counts.join('  '));
            
            // Write each frame
            structure.frames.forEach((frame, frameIdx) => {
                // Frame header
                lines.push(`Direct configuration=     ${frameIdx + 1}`);
                
                // Atom positions in fractional coordinates
                frame.fractional.forEach(frac => {
                    lines.push(`   ${frac[0].toFixed(12)}  ${frac[1].toFixed(12)}  ${frac[2].toFixed(12)}`);
                });
            });
            
            return lines.join('\n');
        }

        // ---- CIF (Crystallographic Information File) ----
        // Reads the structural subset of CIF 1.1: cell parameters, the
        // symmetry operations loop and the atom-site loop of one data block,
        // and expands the asymmetric unit into a full P1 cell. Occupancies,
        // displacement parameters and everything else are left unread.
        const CIF_ELEMENTS = new Set(('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr '
            + 'Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt '
            + 'Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' '));
        const CIF_MAX_ATOMS = 10000;
        const CIF_DUPLICATE_TOLERANCE = 1e-3;

        function isCIFFormat(content) {
            // A data block header alone is not enough: an XYZ comment line may start with "data_".
            const head = String(content).slice(0, 20000);
            const structural = /^[ \t]*(_cell[._]length_a|_atom_site[._]fract_x|_atom_site[._]cartn_x|_symmetry_equiv_pos_as_xyz|_space_group_symop[._]operation_xyz)\b/mi.test(head);
            return structural || (/^[ \t]*data_\S/m.test(head) && /^[ \t]*(loop_|_cell|_atom_site|_symmetry|_space_group)/mi.test(head));
        }

        // CIF2 and mmCIF write categories with a dot; treat both spellings alike.
        function normalizeCIFTag(word) {
            return word.toLowerCase().replace('.', '_');
        }

        function tokenizeCIF(content) {
            const tokens = [];
            const lines = String(content).split(/\r\n|\r|\n/);
            for (let index = 0; index < lines.length; index++) {
                let line = lines[index];
                if (line.startsWith(';')) {
                    const parts = [line.slice(1)];
                    index++;
                    while (index < lines.length && !lines[index].startsWith(';')) parts.push(lines[index++]);
                    if (index >= lines.length) throw new Error('Invalid CIF: a text field opened with ";" is never closed');
                    tokens.push({ kind: 'value', value: parts.join('\n') });
                    line = lines[index].slice(1);
                }
                let position = 0;
                while (position < line.length) {
                    const character = line[position];
                    if (character === ' ' || character === '\t') { position++; continue; }
                    if (character === '#') break;
                    if (character === "'" || character === '"') {
                        let end = position + 1;
                        while (end < line.length && !(line[end] === character && (end + 1 >= line.length || /\s/.test(line[end + 1])))) end++;
                        if (end >= line.length) throw new Error(`Invalid CIF: unterminated quoted string on line ${index + 1}`);
                        tokens.push({ kind: 'value', value: line.slice(position + 1, end) });
                        position = end + 1;
                        continue;
                    }
                    let end = position;
                    while (end < line.length && line[end] !== ' ' && line[end] !== '\t') end++;
                    const word = line.slice(position, end);
                    position = end;
                    const lower = word.toLowerCase();
                    if (word[0] === '_') tokens.push({ kind: 'tag', value: normalizeCIFTag(word) });
                    else if (lower === 'loop_') tokens.push({ kind: 'loop' });
                    else if (lower.startsWith('data_')) tokens.push({ kind: 'data', value: word.slice(5) });
                    else if (lower.startsWith('save_')) tokens.push({ kind: 'save' });
                    else if (lower === 'global_' || lower === 'stop_') tokens.push({ kind: 'reserved' });
                    else tokens.push({ kind: 'value', value: word });
                }
            }
            return tokens;
        }

        function parseCIFBlocks(tokens) {
            const blocks = [];
            let block = null;
            const currentBlock = () => {
                if (!block) {
                    block = { name: '', items: new Map(), loops: [] };
                    blocks.push(block);
                }
                return block;
            };
            let index = 0;
            while (index < tokens.length) {
                const token = tokens[index];
                if (token.kind === 'data') {
                    block = { name: token.value, items: new Map(), loops: [] };
                    blocks.push(block);
                    index++;
                } else if (token.kind === 'tag') {
                    const next = tokens[index + 1];
                    if (!next || next.kind !== 'value') throw new Error(`Invalid CIF: ${token.value} has no value`);
                    currentBlock().items.set(token.value, next.value);
                    index += 2;
                } else if (token.kind === 'loop') {
                    index++;
                    const tags = [];
                    while (index < tokens.length && tokens[index].kind === 'tag') tags.push(tokens[index++].value);
                    if (!tags.length) throw new Error('Invalid CIF: loop_ without column names');
                    const values = [];
                    while (index < tokens.length && tokens[index].kind === 'value') values.push(tokens[index++].value);
                    if (values.length % tags.length !== 0) {
                        throw new Error(`Invalid CIF: the ${tags[0]} loop has ${tags.length} columns but ${values.length} values`);
                    }
                    const rows = [];
                    for (let start = 0; start < values.length; start += tags.length) {
                        const row = Object.create(null);
                        tags.forEach((tag, column) => { row[tag] = values[start + column]; });
                        rows.push(row);
                    }
                    currentBlock().loops.push({ tags, rows });
                } else {
                    // Stray values, save frames and reserved words carry nothing this viewer uses.
                    index++;
                }
            }
            return blocks;
        }

        function cifItem(block, ...names) {
            for (const name of names) if (block.items.has(name)) return block.items.get(name);
            return null;
        }

        function cifLoop(block, ...names) {
            for (const name of names) {
                const loop = block.loops.find(candidate => candidate.tags.includes(name));
                if (loop) return { loop, tag: name };
            }
            return null;
        }

        // "5.43070", "0.3748(2)" and "1.2E-3" are numbers; "." and "?" are missing values.
        function cifNumber(value) {
            if (value === null || value === undefined) return null;
            const text = String(value).trim();
            if (text === '.' || text === '?' || text === '') return null;
            const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eEdD][+-]?\d+)?)(?:\(\d+\))?$/.exec(text);
            return match ? Number(match[1].replace(/[dD]/, 'e')) : NaN;
        }

        function cifRequiredNumber(block, name, label) {
            const value = cifNumber(cifItem(block, name));
            if (value === null) throw new Error(`Invalid CIF: ${label} (${name}) is missing`);
            if (!Number.isFinite(value)) throw new Error(`Invalid CIF: ${label} (${name}) is not a number`);
            return value;
        }

        // Conventional Cartesian frame: a along x, b in the xy plane, c completing a right-handed cell.
        function latticeFromCellParameters(a, b, c, alpha, beta, gamma) {
            if ([a, b, c].some(length => !(length > 0))) throw new Error('Invalid CIF: cell lengths must be positive');
            if ([alpha, beta, gamma].some(angle => !(angle > 0 && angle < 180))) throw new Error('Invalid CIF: cell angles must lie between 0° and 180°');
            const radians = degrees => degrees * Math.PI / 180;
            const cosAlpha = Math.cos(radians(alpha));
            const cosBeta = Math.cos(radians(beta));
            const cosGamma = Math.cos(radians(gamma));
            const sinGamma = Math.sin(radians(gamma));
            const volumeFactor = 1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma + 2 * cosAlpha * cosBeta * cosGamma;
            if (!(volumeFactor > 0)) throw new Error('Invalid CIF: cell angles do not describe a three-dimensional cell');
            const clean = value => (Math.abs(value) < 1e-12 ? 0 : value);
            return [
                [a, 0, 0],
                [clean(b * cosGamma), b * sinGamma, 0],
                [clean(c * cosBeta), clean(c * (cosAlpha - cosBeta * cosGamma) / sinGamma), c * Math.sqrt(volumeFactor) / sinGamma]
            ];
        }

        // "1/2-x, y, -z+1/2" becomes a 3×3 rotation and a translation in fractional units.
        function parseSymmetryOperation(text) {
            const parts = String(text).replace(/\s+/g, '').toLowerCase().split(',');
            if (parts.length !== 3) throw new Error(`Invalid CIF: symmetry operation "${text}" does not have three components`);
            const rotation = [];
            const translation = [];
            const term = /^([+-]?)(?:(\d+\/\d+|\d*\.\d+|\d+)\*?)?([xyz])?/;
            for (const part of parts) {
                const row = [0, 0, 0];
                let shift = 0;
                let rest = part;
                if (!rest) throw new Error(`Invalid CIF: symmetry operation "${text}" has an empty component`);
                while (rest.length) {
                    const match = term.exec(rest);
                    if (!match || !match[0].length || (!match[2] && !match[3])) {
                        throw new Error(`Invalid CIF: cannot read symmetry operation "${text}"`);
                    }
                    const sign = match[1] === '-' ? -1 : 1;
                    let coefficient = 1;
                    if (match[2]) {
                        const fraction = match[2].split('/');
                        coefficient = fraction.length === 2 ? Number(fraction[0]) / Number(fraction[1]) : Number(match[2]);
                    }
                    if (match[3]) row['xyz'.indexOf(match[3])] += sign * coefficient;
                    else shift += sign * coefficient;
                    rest = rest.slice(match[0].length);
                }
                rotation.push(row);
                translation.push(shift);
            }
            const [r0, r1, r2] = rotation;
            const determinant = r0[0] * (r1[1] * r2[2] - r1[2] * r2[1]) - r0[1] * (r1[0] * r2[2] - r1[2] * r2[0]) + r0[2] * (r1[0] * r2[1] - r1[1] * r2[0]);
            if (Math.abs(Math.abs(determinant) - 1) > 1e-9) throw new Error(`Invalid CIF: symmetry operation "${text}" is not a proper or improper rotation`);
            return { rotation, translation };
        }

        function cifElementSymbol(typeSymbol, label) {
            for (const candidate of [typeSymbol, label]) {
                const letters = /^([A-Za-z]{1,2})/.exec(String(candidate || '').trim());
                if (!letters) continue;
                const text = letters[1];
                if (text.length === 2) {
                    const two = text[0].toUpperCase() + text[1].toLowerCase();
                    if (CIF_ELEMENTS.has(two)) return two;
                }
                const one = text[0].toUpperCase();
                if (one === 'D' || one === 'T') return 'H';
                if (CIF_ELEMENTS.has(one)) return one;
            }
            return null;
        }

        function wrapFractional(value) {
            let wrapped = value - Math.floor(value);
            if (wrapped > 1 - 1e-6 || wrapped < 1e-6) wrapped = 0;
            return wrapped;
        }

        function periodicallyClose(first, second, tolerance) {
            return [0, 1, 2].every(axis => {
                const difference = Math.abs(first[axis] - second[axis]);
                return Math.min(difference, 1 - difference) < tolerance;
            });
        }

        // Apply every operation to one site and keep each distinct position once.
        function expandSite(fractional, operations) {
            const points = [];
            for (const { rotation, translation } of operations) {
                const point = [0, 1, 2].map(row => wrapFractional(
                    rotation[row][0] * fractional[0] + rotation[row][1] * fractional[1] + rotation[row][2] * fractional[2] + translation[row]));
                if (!points.some(existing => periodicallyClose(existing, point, CIF_DUPLICATE_TOLERANCE))) points.push(point);
            }
            return points;
        }

        function cifSymmetryOperations(block, notices) {
            const found = cifLoop(block, '_space_group_symop_operation_xyz', '_symmetry_equiv_pos_as_xyz');
            if (found) {
                const operations = found.loop.rows.map(row => parseSymmetryOperation(row[found.tag]));
                if (!operations.length) throw new Error('Invalid CIF: the symmetry operations loop is empty');
                return operations;
            }
            const symbol = cifItem(block, '_space_group_name_h-m_alt', '_symmetry_space_group_name_h-m');
            const number = cifNumber(cifItem(block, '_space_group_it_number', '_symmetry_int_tables_number'));
            const identity = [parseSymmetryOperation('x,y,z')];
            if (!symbol && !number) {
                notices.push('No space group or symmetry operations are listed, so the atom sites are shown as given.');
                return identity;
            }
            if (number === 1 || (symbol && symbol.replace(/\s+/g, '').toLowerCase() === 'p1')) return identity;
            throw new Error(`Invalid CIF: space group ${symbol || `No. ${number}`} is named but no symmetry operations are listed. `
                + 'This viewer needs the _symmetry_equiv_pos_as_xyz or _space_group_symop_operation_xyz loop, which VESTA, the Materials Project and COD write.');
        }

        function parseCIF(content) {
            const blocks = parseCIFBlocks(tokenizeCIF(content));
            const structural = blocks.filter(block => cifLoop(block, '_atom_site_fract_x', '_atom_site_cartn_x'));
            if (!structural.length) throw new Error('Invalid CIF: no atom sites found (no _atom_site_fract_x loop)');
            const block = structural[0];
            const notices = [];
            if (structural.length > 1) notices.push(`The file has ${structural.length} data blocks with atoms; only the first (${block.name || 'unnamed'}) is shown.`);

            const lattice = latticeFromCellParameters(
                cifRequiredNumber(block, '_cell_length_a', 'cell length a'),
                cifRequiredNumber(block, '_cell_length_b', 'cell length b'),
                cifRequiredNumber(block, '_cell_length_c', 'cell length c'),
                cifRequiredNumber(block, '_cell_angle_alpha', 'cell angle alpha'),
                cifRequiredNumber(block, '_cell_angle_beta', 'cell angle beta'),
                cifRequiredNumber(block, '_cell_angle_gamma', 'cell angle gamma'));
            requireFiniteCell(lattice, 'CIF');

            const operations = cifSymmetryOperations(block, notices);
            const { loop: siteLoop } = cifLoop(block, '_atom_site_fract_x', '_atom_site_cartn_x');
            const hasFractional = siteLoop.tags.includes('_atom_site_fract_x');
            if (siteLoop.rows.length * operations.length > CIF_MAX_ATOMS * 20) {
                throw new Error(`CIF too large: ${siteLoop.rows.length} sites × ${operations.length} operations exceed what this viewer can display`);
            }

            const sites = [];
            let skippedSites = 0;
            let partialOccupancy = 0;
            siteLoop.rows.forEach((row, rowIndex) => {
                const label = row._atom_site_label || row._atom_site_type_symbol || `site ${rowIndex + 1}`;
                const axes = hasFractional
                    ? ['_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z']
                    : ['_atom_site_cartn_x', '_atom_site_cartn_y', '_atom_site_cartn_z'];
                const values = axes.map(tag => cifNumber(row[tag]));
                if (values.some(value => value === null)) { skippedSites++; return; }
                if (!values.every(Number.isFinite)) throw new Error(`Invalid CIF: coordinates of site ${label} are not finite numbers`);
                let fractional = values;
                if (!hasFractional) {
                    fractional = cartesianToFractional({ x: values[0], y: values[1], z: values[2] }, lattice);
                    if (!fractional || !fractional.every(Number.isFinite)) throw new Error(`Invalid CIF: Cartesian coordinates of site ${label} cannot be placed in the cell`);
                }
                const element = cifElementSymbol(row._atom_site_type_symbol, row._atom_site_label);
                if (!element) throw new Error(`Invalid CIF: cannot tell the element of site ${label}`);
                const occupancy = cifNumber(row._atom_site_occupancy);
                if ((Number.isFinite(occupancy) && occupancy < 1) || (row._atom_site_disorder_group && row._atom_site_disorder_group !== '.')) partialOccupancy++;
                sites.push({ label, element, fractional });
            });
            if (!sites.length) throw new Error('Invalid CIF: every atom site is missing coordinates');
            if (skippedSites) notices.push(`${skippedSites} atom site${skippedSites === 1 ? ' has' : 's have'} no coordinates and ${skippedSites === 1 ? 'is' : 'are'} left out.`);
            if (partialOccupancy) notices.push(`${partialOccupancy} site${partialOccupancy === 1 ? ' is' : 's are'} partially occupied or disordered; every position is shown.`);

            const elements = [];
            const atomsByElement = new Map();
            let total = 0;
            for (const site of sites) {
                const points = expandSite(site.fractional, operations);
                total += points.length;
                if (total > CIF_MAX_ATOMS) throw new Error(`CIF too large: more than ${CIF_MAX_ATOMS.toLocaleString()} atoms after applying the symmetry operations`);
                if (!atomsByElement.has(site.element)) {
                    elements.push(site.element);
                    atomsByElement.set(site.element, []);
                }
                const list = atomsByElement.get(site.element);
                for (const fractional of points) {
                    const x = fractional[0] * lattice[0][0] + fractional[1] * lattice[1][0] + fractional[2] * lattice[2][0];
                    const y = fractional[0] * lattice[0][1] + fractional[1] * lattice[1][1] + fractional[2] * lattice[2][1];
                    const z = fractional[0] * lattice[0][2] + fractional[1] * lattice[1][2] + fractional[2] * lattice[2][2];
                    if (![x, y, z].every(Number.isFinite)) throw new Error(`Invalid CIF: a position of site ${site.label} is not finite`);
                    list.push({ element: site.element, position: new Vector3(x, y, z), fractional, selectiveDynamics: [true, true, true], siteLabel: site.label });
                }
            }
            const atoms = elements.flatMap(element => atomsByElement.get(element));
            const counts = elements.map(element => atomsByElement.get(element).length);

            const spaceGroup = cifItem(block, '_space_group_name_h-m_alt', '_symmetry_space_group_name_h-m');
            const spaceGroupNumber = cifNumber(cifItem(block, '_space_group_it_number', '_symmetry_int_tables_number'));
            const comment = cifItem(block, '_chemical_name_mineral', '_chemical_name_common', '_chemical_name_systematic', '_chemical_formula_sum')
                || (block.name ? `CIF ${block.name}` : 'CIF structure');

            return documentModel.initialize({
                comment: String(comment).replace(/\s+/g, ' ').trim(),
                scale: 1,
                lattice,
                elements,
                counts,
                hasElementSymbols: true,
                atoms,
                isDirect: true,
                hasSelectiveDynamics: false,
                hasAdditionalSections: false,
                isXDATCAR: false,
                isCIF: true,
                cifInfo: {
                    spaceGroup: spaceGroup ? String(spaceGroup).trim() : null,
                    spaceGroupNumber: Number.isFinite(spaceGroupNumber) ? spaceGroupNumber : null,
                    operations: operations.length,
                    sites: sites.length,
                    notices
                }
            });
        }

        return { parsePOSCAR, parseXDATCAR, isXDATCARFormat, isXYZFormat, parseXYZ, isCIFFormat, parseCIF, generatePOSCAR, generateXYZ, generateXDATCAR, omittedXYZMetadata };
    }

    const api = { createFormats };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalFormats = api;
})(globalThis);
