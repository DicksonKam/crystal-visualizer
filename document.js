// Document identity and validation. No DOM, renderer, or Three.js dependency.
(function (root) {
    const geometry = typeof module !== 'undefined' && module.exports ? require('./geometry.js') : root.CrystalGeometry;

    function capabilities(structure) {
        const cell = Boolean(structure && (!structure.isXYZ || structure.hasExplicitLattice));
        return {
            cell,
            periodicAxes: cell ? [...(structure.pbc || [true, true, true])] : [false, false, false],
            editable: Boolean(structure && !structure.isXDATCAR),
            constraints: Boolean(structure && !structure.isXYZ && !structure.isXDATCAR)
        };
    }

    function initialize(structure) {
        structure.speciesGroups = structure.elements.map((element, index) => ({ id: `species-${index + 1}`, element }));
        let offset = 0;
        structure.counts.forEach((count, index) => {
            for (let i = 0; i < count; i++) structure.atoms[offset++].speciesId = structure.speciesGroups[index].id;
        });
        if (structure.isXYZ) {
            const byElement = new Map(structure.speciesGroups.map(group => [group.element, group.id]));
            structure.atoms.forEach(atom => { atom.speciesId = byElement.get(atom.element); });
        }
        structure.atoms.forEach((atom, index) => { atom.id = `atom-${index + 1}`; });
        structure.nextAtomId = structure.atoms.length + 1;
        structure.nextSpeciesId = structure.speciesGroups.length + 1;
        return structure;
    }

    // Legacy callers can supply a plain structure with unique element names.
    // Ambiguous documents require explicit species IDs instead of guessing.
    function groupedAtoms(structure) {
        const groups = structure.speciesGroups || structure.elements.map((element, index) => ({ id: `species-${index + 1}`, element }));
        const byId = new Map(groups.map(group => [group.id, { ...group, atoms: [] }]));
        for (const atom of structure.atoms) {
            let group = byId.get(atom.speciesId);
            if (!group && atom.speciesId === undefined) {
                const matches = [...byId.values()].filter(candidate => candidate.element === atom.element);
                if (matches.length === 1) group = matches[0];
            }
            if (!group || group.element !== atom.element) throw new Error('Atom has an unknown or ambiguous species group');
            group.atoms.push(atom);
        }
        return [...byId.values()];
    }

    function recalculateCounts(structure) {
        const groups = groupedAtoms(structure);
        structure.elements = groups.map(group => group.element);
        structure.counts = groups.map(group => group.atoms.length);
    }

    function prepareNewAtom(structure, atom, speciesId = null) {
        const groups = structure.speciesGroups || [];
        const matches = groups.filter(group => group.element === atom.element);
        let group = speciesId ? groups.find(candidate => candidate.id === speciesId && candidate.element === atom.element) : null;
        if (speciesId && !group) throw new Error('Choose a species group matching the element');
        if (!group && matches.length > 1) throw new Error('Choose which species group the new atom belongs to');
        if (!group) group = matches[0];
        const nextAtomId = structure.nextAtomId || structure.atoms.length + 1;
        const nextSpeciesId = structure.nextSpeciesId || groups.length + 1;
        const newGroup = group ? null : { id: `species-${nextSpeciesId}`, element: atom.element };
        return { atom: { ...atom, id: `atom-${nextAtomId}`, speciesId: (group || newGroup).id }, newGroup, nextAtomId: nextAtomId + 1, nextSpeciesId: nextSpeciesId + (newGroup ? 1 : 0) };
    }

    function preparePositions(structure, positions, lattice = structure.lattice) {
        const { cell } = capabilities(structure);
        if (cell) geometry.requireFiniteCell(lattice, 'edited cell');
        return positions.map(position => {
            const point = Array.isArray(position) ? position : [position.x, position.y, position.z];
            if (point.length !== 3 || !point.every(Number.isFinite)) throw new Error('Coordinates must contain three finite values');
            const fractional = cell ? geometry.cartesianToFractional(point, lattice) : null;
            if (cell && !fractional) throw new Error('Coordinates cannot be represented in this cell');
            return { position: { x: point[0], y: point[1], z: point[2] }, fractional };
        });
    }

    function snapshot(structure) {
        return JSON.parse(JSON.stringify(structure));
    }

    function geometrySignature(structure) {
        return JSON.stringify({ lattice: capabilities(structure).cell ? structure.lattice : null, pbc: capabilities(structure).periodicAxes,
            atoms: structure.atoms.map(atom => [atom.element, atom.position.x, atom.position.y, atom.position.z]) });
    }

    const api = { capabilities, initialize, groupedAtoms, recalculateCounts, prepareNewAtom, preparePositions, snapshot, geometrySignature };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalDocument = api;
})(globalThis);
