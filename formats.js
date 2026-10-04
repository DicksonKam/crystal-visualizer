// File parsing independent of rendering and browser state.
(function (root) {
    function createFormats(Vector3, cartesianToFractional) {
        function cellVolume(lattice) {
            const [a, b, c] = lattice;
            return a[0] * (b[1] * c[2] - b[2] * c[1])
                - a[1] * (b[0] * c[2] - b[2] * c[0])
                + a[2] * (b[0] * c[1] - b[1] * c[0]);
        }

        function requireFiniteCell(lattice, format) {
            if (lattice.some(vector => vector.some(value => !Number.isFinite(value)))) {
                throw new Error(`Invalid ${format}: lattice has non-finite coordinates`);
            }
            const volume = cellVolume(lattice);
            if (!Number.isFinite(volume)) throw new Error(`Invalid ${format}: lattice volume is not finite`);
            if (Math.abs(volume) < 1e-10) throw new Error(`Invalid ${format}: lattice has zero volume`);
            return volume;
        }

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

            if (!/^\d+$/.test(line5Parts[0] || '')) {
                // VASP 5+ format: line 5 has element symbols
                elements = line5Parts;
                counts = lines[6].split(/\s+/).filter(p => p).map(Number);
                elementLine = 7;
            } else {
                // VASP 4 format: no element symbols, only counts
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

            return {
                comment,
                scale,
                lattice,
                elements,
                counts,
                atoms,
                isDirect,
                hasSelectiveDynamics,
                isXDATCAR: false
            };
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

            return {
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
            };
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

        function parseExtendedXYZLattice(comment) {
            if (!comment) return null;
            const match = comment.match(/Lattice\s*=\s*"([^"]+)"/i);
            if (!match) {
                if (/Lattice\s*=/i.test(comment)) throw new Error('Invalid extended XYZ: malformed Lattice field');
                return null;
            }
            const nums = match[1].trim().split(/\s+/).map(Number);
            if (nums.length !== 9 || nums.some(n => !Number.isFinite(n))) {
                throw new Error('Invalid extended XYZ: Lattice must contain nine finite numbers');
            }
            return [
                [nums[0], nums[1], nums[2]],
                [nums[3], nums[4], nums[5]],
                [nums[6], nums[7], nums[8]]
            ];
        }

        function parseExtendedXYZProperties(comment) {
            const match = comment.match(/Properties\s*=\s*(?:"([^"]+)"|(\S+))/i);
            if (!match) {
                if (/Properties\s*=/i.test(comment)) throw new Error('Invalid extended XYZ: malformed Properties field');
                return { species: 0, position: [1, 2, 3], columns: 4 };
            }
            const tokens = (match[1] || match[2]).split(':');
            if (tokens.length % 3 !== 0) throw new Error('Invalid extended XYZ: Properties must use name:type:count triples');
            let columns = 0;
            let species = null;
            let position = null;
            const coordinates = {};
            for (let i = 0; i < tokens.length; i += 3) {
                const name = tokens[i].toLowerCase();
                const count = Number(tokens[i + 2]);
                if (!Number.isSafeInteger(count) || count < 1) throw new Error('Invalid extended XYZ: invalid Properties column count');
                if ((name === 'species' || name === 'element') && count === 1) species = columns;
                if (name === 'pos' && count === 3) position = [columns, columns + 1, columns + 2];
                if (['x', 'y', 'z'].includes(name) && count === 1) coordinates[name] = columns;
                columns += count;
            }
            if (!position && ['x', 'y', 'z'].every(axis => coordinates[axis] !== undefined)) {
                position = ['x', 'y', 'z'].map(axis => coordinates[axis]);
            }
            if (species === null || !position) {
                throw new Error('Invalid extended XYZ: Properties must include species and three position columns');
            }
            return { species, position, columns };
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
                if (!/^[A-Za-z][A-Za-z0-9]*$/.test(parts[properties.species])) {
                    throw new Error(`Invalid XYZ element on atom line ${parsed + 1}`);
                }
                const element = parts[properties.species].replace(/\d+$/, '');
                const [x, y, z] = properties.position.map(index => Number(parts[index]));
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

            // Show the human description rather than metadata tokens in the sidebar
            // and in POSCAR exports converted from extended XYZ.
            const comment = rawComment
                .replace(/Lattice\s*=\s*"[^"]*"/gi, '')
                .replace(/Properties\s*=\s*(?:"[^"]*"|\S+)/gi, '')
                .trim() || 'XYZ structure';

            const order = [];
            const countsMap = Object.create(null);
            atoms.forEach(atom => {
                if (!(atom.element in countsMap)) {
                    order.push(atom.element);
                    countsMap[atom.element] = 0;
                }
                countsMap[atom.element]++;
            });

            return {
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
                hasExplicitLattice
            };
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
            
            // Line 6: Element symbols
            lines.push(structure.elements.join(' '));
            
            // Line 7: Number of atoms per element
            lines.push(structure.counts.join(' '));
            
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
            
            // Atom positions - group by element, preserving selective dynamics
            const atomsByElement = Object.create(null);
            structure.elements.forEach(elem => {
                atomsByElement[elem] = [];
            });
            
            structure.atoms.forEach(atom => {
                atomsByElement[atom.element].push({
                    position: atom.position,
                    selectiveDynamics: atom.selectiveDynamics || [true, true, true]
                });
            });
            
            // Write positions in element order
            structure.elements.forEach(elem => {
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

        function generateXYZ(structure) {
            if (!structure) return null;
            const description = structure.comment || 'Exported from Crystal Visualizer';
            const metadata = structure.hasExplicitLattice
                ? `Lattice="${structure.lattice.flat().map(value => value.toFixed(12)).join(' ')}" Properties=species:S:1:pos:R:3`
                : '';
            const lines = [String(structure.atoms.length), [description, metadata].filter(Boolean).join(' ')];
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

        return { parsePOSCAR, parseXDATCAR, isXDATCARFormat, isXYZFormat, parseXYZ, generatePOSCAR, generateXYZ, generateXDATCAR };
    }

    const api = { createFormats };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalFormats = api;
})(globalThis);
