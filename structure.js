// Structure operations independent of the renderer and browser UI.
(function (root) {
    const geometry = typeof module !== 'undefined' && module.exports ? require('./geometry.js') : root.CrystalGeometry;
    const documentModel = typeof module !== 'undefined' && module.exports ? require('./document.js') : root.CrystalDocument;

    function prepareCellResize(structure, originalLattice, originalPositions, axis, handle, delta) {
        if (![0, 1, 2].includes(axis) || !['near', 'far'].includes(handle) || !Number.isFinite(delta)) {
            throw new Error('Invalid cell resize');
        }
        if (delta === 0) return {
            lattice: originalLattice.map(vector => [...vector]),
            updates: documentModel.preparePositions(structure, originalPositions, originalLattice)
        };
        const vector = originalLattice[axis];
        const length = Math.hypot(...vector);
        if (!Number.isFinite(length) || length <= 0) throw new Error('Invalid original cell length');
        const direction = vector.map(value => value / length);
        // Cell faces are constant fractional coordinates. A Cartesian dot
        // product along this vector includes contributions from the other
        // vectors in an oblique cell and can let a face pass through atoms.
        const axisCoordinates = originalPositions.map(pos => {
            const fractional = geometry.cartesianToFractional(pos, originalLattice);
            return fractional ? fractional[axis] * length : NaN;
        });
        if (!axisCoordinates.every(Number.isFinite)) throw new Error('Atom extent cannot be represented');
        const epsilon = 0.001;
        const max = axisCoordinates.reduce((value, coordinate) => Math.max(value, coordinate), -Infinity);
        const min = axisCoordinates.reduce((value, coordinate) => Math.min(value, coordinate), Infinity);
        const extent = axisCoordinates.length ? (handle === 'far' ? max + epsilon : length + epsilon - min) : epsilon;
        // Atom coordinates may lie outside the cell. Their extent alone must
        // never allow a zero or reversed cell vector.
        const newLength = Math.max(epsilon, extent, length + delta);
        if (!Number.isFinite(newLength)) throw new Error('Cell length cannot be represented');
        const lattice = originalLattice.map((vec, index) => index === axis
            ? vec.map(value => value * (newLength / length)) : [...vec]);
        const positions = originalPositions.map(pos => ({
            x: pos.x + (handle === 'near' ? direction[0] * (newLength - length) : 0),
            y: pos.y + (handle === 'near' ? direction[1] * (newLength - length) : 0),
            z: pos.z + (handle === 'near' ? direction[2] * (newLength - length) : 0)
        }));
        return { lattice, updates: documentModel.preparePositions(structure, positions, lattice) };
    }

    // Prepare every copy before the caller replaces the document or records history.
    function buildSupercell(structure, repeats) {
        if (repeats.length !== 3 || repeats.some(value => !Number.isSafeInteger(value) || value < 1 || value > 20)) {
            throw new Error('Supercell repeats must be integers from 1 to 20');
        }
        if (structure.atoms.length * repeats[0] * repeats[1] * repeats[2] > 3000) {
            throw new Error('Supercell limited to 3,000 atoms');
        }
        const lattice = structure.lattice.map((vector, axis) => vector.map(value => value * repeats[axis]));
        geometry.requireFiniteCell(lattice, 'supercell');
        const atoms = [];
        // Preserve each displayed copy's identity across conversion. Positions
        // alone cannot distinguish coincident atoms on periodic boundaries.
        const atomSources = [];
        let nextAtomId = structure.nextAtomId || structure.atoms.length + 1;
        for (let a = 0; a < repeats[0]; a++) for (let b = 0; b < repeats[1]; b++) for (let c = 0; c < repeats[2]; c++) {
            const translation = geometry.fractionalToCartesian([a, b, c], structure.lattice);
            for (const [originalIndex, atom] of structure.atoms.entries()) {
                const position = {
                    x: atom.position.x + translation[0],
                    y: atom.position.y + translation[1],
                    z: atom.position.z + translation[2]
                };
                const fractional = geometry.cartesianToFractional(position, lattice);
                if (![position.x, position.y, position.z].every(Number.isFinite) || !fractional) {
                    throw new Error('Supercell atom coordinates cannot be represented in this cell');
                }
                const id = a === 0 && b === 0 && c === 0 ? atom.id : `atom-${nextAtomId++}`;
                atoms.push({ ...atom, id, position, fractional, selectiveDynamics: [...(atom.selectiveDynamics || [true, true, true])] });
                atomSources.push({ originalIndex, cellOffset: { a, b, c } });
            }
        }
        return { lattice, atoms, nextAtomId, atomSources };
    }
    function summarizeConstraints(atoms) {
        const summary = { fixed: 0, partial: 0, free: 0, byElement: new Map() };
        for (const atom of atoms) {
            const flags = atom.selectiveDynamics || [true, true, true];
            const state = flags.every(value => value === false) ? 'fixed'
                : flags.some(value => value === false) ? 'partial' : 'free';
            let element = summary.byElement.get(atom.element);
            if (!element) {
                element = { fixed: 0, partial: 0, free: 0 };
                summary.byElement.set(atom.element, element);
            }
            summary[state]++;
            element[state]++;
        }
        return summary;
    }

    function zMidpoint(atoms) {
        if (atoms.length === 0) return 0;
        let min = Infinity;
        let max = -Infinity;
        for (const atom of atoms) {
            min = Math.min(min, atom.position.z);
            max = Math.max(max, atom.position.z);
        }
        // Halve before adding to avoid overflowing two finite coordinates.
        return min / 2 + max / 2;
    }

    // Indices of the atoms whose coordinate lies in [min, max]. Either bound
    // may be null for an open end; a bound is inclusive so a layer typed at
    // its own coordinate is selected. Non-finite coordinates never match.
    function atomsInRange(values, min, max) {
        const low = min === null || min === undefined ? -Infinity : min;
        const high = max === null || max === undefined ? Infinity : max;
        if (!Number.isFinite(low) && low !== -Infinity) throw new Error('Lower bound is not a number');
        if (!Number.isFinite(high) && high !== Infinity) throw new Error('Upper bound is not a number');
        if (low > high) throw new Error('Lower bound is above the upper bound');
        const indices = [];
        values.forEach((value, index) => {
            if (Number.isFinite(value) && value >= low && value <= high) indices.push(index);
        });
        return indices;
    }

    // The constraint changes that give every listed atom the flags in
    // `flags` (true = free to move along that axis). A null entry keeps that
    // axis as it is, so one axis can change while the others are left alone.
    // Atoms that already have the requested flags are left out.
    function constraintChanges(atoms, indices, flags) {
        if (!Array.isArray(flags) || flags.length !== 3) throw new Error('Constraint flags need three axes');
        const changes = [];
        for (const index of new Set(indices)) {
            const atom = atoms[index];
            if (!atom) continue;
            const oldSD = [...(atom.selectiveDynamics || [true, true, true])];
            const newSD = oldSD.map((value, axis) => flags[axis] === null || flags[axis] === undefined ? value : Boolean(flags[axis]));
            if (newSD.some((value, axis) => value !== oldSD[axis])) changes.push({ index, oldSD, newSD });
        }
        return changes;
    }

    // Per-axis state of a set of atoms: 'free', 'fixed' or 'mixed'.
    function constraintAxisStates(atoms, indices) {
        const states = [];
        for (let axis = 0; axis < 3; axis++) {
            let free = 0, fixed = 0;
            for (const index of indices) {
                const atom = atoms[index];
                if (!atom) continue;
                if ((atom.selectiveDynamics || [true, true, true])[axis]) free++; else fixed++;
            }
            states.push(free && fixed ? 'mixed' : fixed ? 'fixed' : 'free');
        }
        return states;
    }

    // Indices of the points ({ x, y }; null entries are skipped) inside the
    // rectangle spanned by any two opposite corners, edges included.
    function indicesInRectangle(points, rect) {
        const left = Math.min(rect.left, rect.right), right = Math.max(rect.left, rect.right);
        const top = Math.min(rect.top, rect.bottom), bottom = Math.max(rect.top, rect.bottom);
        const indices = [];
        points.forEach((point, index) => {
            if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
            if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) indices.push(index);
        });
        return indices;
    }

    const api = { buildSupercell, prepareCellResize, summarizeConstraints, zMidpoint, atomsInRange, constraintChanges, constraintAxisStates, indicesInRectangle };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalStructure = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
