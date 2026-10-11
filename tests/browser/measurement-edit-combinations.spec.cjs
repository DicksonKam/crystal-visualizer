const { test, expect, upload } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');

function compareGeometry(actual, expected) {
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
            labelPositions: labels.slice(0, 2).map(label => label.position.toArray()),
            midpoints: midpoints.map(point => point.toArray()),
            markers: selectionRings.map(ring => ring.position.toArray()),
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
            const start = screen(mesh.getWorldPosition(new THREE.Vector3()));
            if (getAtomIntersection({ clientX: start.x, clientY: start.y })?.object !== mesh) throw Error('Fixture atom obscured');
            return { ...start, dx: cycle % 2 ? -18 : 18, dy: -12 };
        }
        for (const handle of vacuumDragState.handles.filter(h => h.userData.extendAxis === 'a' && h.userData.handleType === 'far')) {
            const start = screen(handle.getWorldPosition(new THREE.Vector3()));
            if (!getAtomIntersection({ clientX: start.x, clientY: start.y })) return { ...start, dx: 24, dy: 0 };
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

for (const width of [900, 1440]) test(`measurement survives a sustained edit chain at ${width}px`, async ({ page }, info) => {
    test.setTimeout(180000);
    page.setDefaultTimeout(10000);
    await page.setViewportSize({ width, height: 900 });
    await upload(page, 'measured editing\n1\n8 0 0\n0 8 0\n0 0 8\nH O\n3 2\nDirect\n0 .2 .2\n.6 .2 .2\n.6 .7 .2\n.3 .4 .5\n.8 .8 .7\n', 'measured-editing.poscar');
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    const snap = async name => page.screenshot({ path: info.outputPath(`${name}.png`) });
    await checkMeasurement(page); await snap('initial');
    for (let cycle = 0; cycle < 4; cycle++) {
        await page.locator('#sidebarDivider').focus(); await page.keyboard.press(cycle % 2 ? 'End' : 'Home');
        await page.keyboard.press('ArrowRight');
        for (const kind of ['atom', 'cell']) {
            const before = await checkMeasurement(page);
            await dragTarget(page, kind, cycle);
            await checkMeasurement(page); await snap(`${cycle}-${kind}-preview`);
            await page.mouse.up();
            const after = await checkMeasurement(page); await snap(`${cycle}-${kind}-committed`);
            expect(after.undo.at(-1).type).toBe(kind === 'atom' ? 'move_atom' : 'vacuum_drag');
            await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, before.geometry, 'undo');
            await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, after.geometry, 'redo');
        }
        await page.locator('#shiftA').fill('.1'); await page.locator('#shiftB').fill('0'); await page.locator('#shiftC').fill('0');
        await page.locator('#applyShiftBtn').click(); await checkMeasurement(page); await snap(`${cycle}-shift`);
        await page.locator('#addAtomElement').selectOption('C');
        for (const axis of ['X', 'Y', 'Z']) await page.locator(`#addAtom${axis}`).fill('.4');
        await page.locator('#addAtomBtn').click(); await checkMeasurement(page); await snap(`${cycle}-add`);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
        await page.locator('#redoBtn').click(); await checkMeasurement(page);
        await page.locator('[data-mode="measure"]').click(); await checkMeasurement(page);
        await page.locator('[data-mode="edit"]').click(); await checkMeasurement(page);
    }
    // Switch from the measured trio to an edit selection, delete, and walk
    // back through both geometry history and the measurement context.
    const measured = await checkMeasurement(page);
    await page.locator('#clearSelectionBtn').click();
    await page.locator('#atomJumpInput').fill('4'); await page.locator('#atomJumpInput').press('Enter');
    await page.locator('#deleteSelectedBtn').click(); await snap('deleted-after-measurement');
    expect((await capture(page)).atomCount).toBe(measured.atomCount - 1);
    expect(await page.evaluate(() => measurementGroup.children.filter(object => object.userData.isMeasurementVisual).length)).toBe(0);
    await page.locator('#undoBtn').click();
    expect((await capture(page)).selection.identities).toHaveLength(1);
    await page.locator('#undoBtn').click();
    expect((await capture(page)).selection.identities).toHaveLength(0);
    await page.locator('#undoBtn').click();
    compareGeometry((await checkMeasurement(page)).geometry, measured.geometry);
    await snap('measurement-restored-through-deletion');
    for (let i = 0; i < 3; i++) await page.locator('#redoBtn').click();
    expect((await capture(page)).atomCount).toBe(measured.atomCount - 1);
    await page.locator('#undoBtn').click();
    // Start a fresh measurement branch after restoring the deleted atom.
    await page.locator('[data-mode="measure"]').click();
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await checkMeasurement(page);
    await page.locator('[data-mode="edit"]').click(); await checkMeasurement(page);
    await snap('final');
});
