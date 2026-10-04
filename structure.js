// Structure operations independent of the renderer and browser UI.
(function (root) {
    const geometry = typeof module !== 'undefined' && module.exports ? require('./geometry.js') : root.CrystalGeometry;

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
        let nextAtomId = structure.nextAtomId || structure.atoms.length + 1;
        for (let a = 0; a < repeats[0]; a++) for (let b = 0; b < repeats[1]; b++) for (let c = 0; c < repeats[2]; c++) {
            const translation = geometry.fractionalToCartesian([a, b, c], structure.lattice);
            for (const atom of structure.atoms) {
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
            }
        }
        return { lattice, atoms, nextAtomId };
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

    const api = { buildSupercell, summarizeConstraints, zMidpoint };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalStructure = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
