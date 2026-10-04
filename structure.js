// Structure summaries independent of the renderer and browser UI.
(function (root) {
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

    const api = { summarizeConstraints, zMidpoint };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CrystalStructure = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
