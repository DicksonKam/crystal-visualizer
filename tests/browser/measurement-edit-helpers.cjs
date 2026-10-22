const { expect } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');

function compareGeometry(actual, expected) {
    expect(actual.atoms.map(atom => atom.sd)).toEqual(expected.atoms.map(atom => atom.sd));
    expect(actual.atoms.map(atom => [atom.id, atom.element, atom.speciesId])).toEqual(expected.atoms.map(atom => [atom.id, atom.element, atom.speciesId]));
    for (let i = 0; i < actual.atoms.length; i++) for (let axis = 0; axis < 3; axis++) expect(actual.atoms[i].position[axis]).toBeCloseTo(expected.atoms[i].position[axis], 7);
    for (let i = 0; i < actual.lattice.length; i++) for (let axis = 0; axis < 3; axis++) expect(actual.lattice[i][axis]).toBeCloseTo(expected.lattice[i][axis], 7);
}

async function checkMeasurement(page) {
    const state = await capture(page);
    expect(state.violations).toEqual([]);
    const view = await page.evaluate(() => {
        const points = selectedAtoms.map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()));
        const distances = points.slice(1).map((point, i) => point.distanceTo(points[i]));
        const a = points[0].clone().sub(points[1]);
        const b = points[2].clone().sub(points[1]);
        const angle = Math.acos(Math.max(-1, Math.min(1, a.dot(b) / (a.length() * b.length())))) * 180 / Math.PI;
        const labels = measurementGroup.children.filter(object => object.userData.isMeasurementLabel);
        const midpoints = points.slice(1).map((point, i) => point.clone().add(points[i]).multiplyScalar(.5));
        return {
            distances, angle,
            labelPositions: labels.slice(0, 2).map(label => (label.userData.annotationAnchor || label.position).toArray()),
            midpoints: midpoints.map(point => point.toArray()),
            markers: selectionRings.map(ring => (ring.userData.annotationAnchor || ring.position).toArray()),
            points: points.map(point => point.toArray()),
            arc: measurementGroup.children.filter(object => object.userData.isMeasurementArc).length
        };
    });
    expect(state.selection.identities).toHaveLength(3);
    expect(view.arc).toBe(1);
    for (let i = 0; i < 3; i++) for (let axis = 0; axis < 3; axis++) expect(view.markers[i][axis]).toBeCloseTo(view.points[i][axis], 6);
    for (let i = 0; i < 2; i++) {
        await expect(page.locator('#measurementPanel')).toContainText(`${view.distances[i].toFixed(4)} Å`);
        for (let axis = 0; axis < 3; axis++) expect(view.labelPositions[i][axis]).toBeCloseTo(view.midpoints[i][axis], 6);
    }
    await expect(page.locator('#measurementPanel')).toContainText(`${view.angle.toFixed(2)}°`);
    return state;
}

async function dragTarget(page, kind, cycle) {
    await page.waitForFunction(() => {
        const r = renderer.domElement.getBoundingClientRect();
        return r.width === viewport.clientWidth && r.height === viewport.clientHeight;
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    // Set a known face-on test view; all geometry changes use pointer events.
    const point = await page.evaluate(({ kind, cycle }) => {
        cancelCameraAlignment(); controls.staticMoving = true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 30));
        camera.up.set(0, 1, 0); camera.zoom = .8; camera.updateProjectionMatrix();
        controls.update(); fitStructureToView(true); camera.updateWorldMatrix(true, false);
        structureGroup.updateWorldMatrix(true, true); updateVacuumHandles(); requestRender();
        const r = renderer.domElement.getBoundingClientRect();
        const screen = world => { const p = world.clone().project(camera); return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 }; };
        if (kind === 'atom') {
            const mesh = atomMeshes[cycle % 3];
            let start = screen(mesh.getWorldPosition(new THREE.Vector3()));
            if (getAtomIntersection({ clientX: start.x, clientY: start.y })?.object !== mesh) {
                // Slab layers may overlap from above. Inspect the same atom
                // from below rather than dragging an obscuring neighbor.
                camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, -30));
                controls.update(); fitStructureToView(true); camera.updateWorldMatrix(true, false);
                structureGroup.updateWorldMatrix(true, true); requestRender();
                start = screen(mesh.getWorldPosition(new THREE.Vector3()));
            }
            if (getAtomIntersection({ clientX: start.x, clientY: start.y })?.object !== mesh) {
                // Periodic copies on the far face can cover an atom from both
                // face-on views; drag another real atom that is exposed instead.
                const exposed = atomMeshes.find(candidate => !candidate.userData.isGhost
                    && getAtomIntersection({ clientX: screen(candidate.getWorldPosition(new THREE.Vector3())).x, clientY: screen(candidate.getWorldPosition(new THREE.Vector3())).y })?.object === candidate);
                if (!exposed) throw Error('Fixture atom obscured from both face-on views');
                start = screen(exposed.getWorldPosition(new THREE.Vector3()));
            }
            return { ...start, dx: cycle % 2 ? -18 : 18, dy: -12 };
        }
        for (const handle of vacuumDragState.handles.filter(h => h.userData.extendAxis === 'a' && h.userData.handleType === (cycle % 2 ? 'near' : 'far'))) {
            // A boundary atom can cover the middle of a face edge. Find an
            // exposed section of that same edge, as a user would visually.
            for (const fraction of [.5, .25, .75, .125, .875, .375, .625]) {
                const world = handle.userData.edgeStart.clone().lerp(handle.userData.edgeEnd, fraction);
                if (handle.parent) handle.parent.localToWorld(world);
                const start = screen(world);
                const hit = checkVacuumHandleIntersection({ clientX: start.x, clientY: start.y });
                if (hit?.extendAxis === 'a' && hit.handleType === handle.userData.handleType) return { ...start, dx: [24, -24, -24, 24][cycle % 4], dy: 0 };
            }
        }
        throw Error('Fixture frame edge obscured');
    }, { kind, cycle });
    await page.mouse.move(point.x, point.y); await page.mouse.down();
    const ownership = await page.evaluate(({ kind, point }) => ({
        owns: kind === 'atom' ? !!draggedAtom : vacuumDragState.isDragging,
        pointer: activeEditPointerId,
        hit: getAtomIntersection({ clientX: point.x, clientY: point.y })?.object.userData.atomIndex,
        element: document.elementFromPoint(point.x, point.y)?.tagName,
        kind, point
    }), { kind, point });
    expect(ownership.owns, JSON.stringify(ownership)).toBe(true);
    await page.mouse.move(point.x + point.dx, point.y + point.dy, { steps: 5 });
}

// A display rebuild must reproduce the bonds already shown after an edit.
// This catches stale geometry that only disappears when a control is toggled.
async function checkBondRefresh(page) {
    if (!await page.locator('#showBonds').isChecked()) return;
    const segments = () => page.evaluate(() => structureGroup.children
        .filter(object => object.userData.isBond || object.userData.isGhostBond)
        .map(bond => {
            const half = new THREE.Vector3(0, bond.scale.y / 2, 0).applyQuaternion(bond.quaternion);
            const endpoints = [bond.position.clone().sub(half), bond.position.clone().add(half)]
                .map(point => point.toArray().map(value => Number(value.toFixed(6)))).sort();
            return JSON.stringify([Boolean(bond.userData.isGhostBond), ...endpoints, Number(bond.scale.x.toFixed(6))]);
        }).sort());
    const before = await segments();
    await page.locator('#showBonds').uncheck();
    await page.locator('#showBonds').check();
    expect(await segments()).toEqual(before);
    await checkMeasurement(page);
}

module.exports = { compareGeometry, checkMeasurement, dragTarget, checkBondRefresh };
