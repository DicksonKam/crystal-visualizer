const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

test('releasing a cell drag over an atom preserves the measurement', async ({ page }, info) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples/poscar/Al_fcc_cartesian.poscar'), 'utf8'), 'Al.poscar');
    for (const n of [1, 2, 3]) {
        await page.locator('#atomJumpInput').fill(String(n));
        await page.locator('#atomJumpInput').press('Enter');
    }
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Home');
    await page.waitForFunction(() => renderer.domElement.clientWidth === viewport.clientWidth);
    const gesture = await page.evaluate(() => {
        cancelCameraAlignment(); controls.staticMoving = true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 30));
        camera.up.set(0, 1, 0); camera.zoom = .8; camera.updateProjectionMatrix();
        controls.update(); fitStructureToView(true); camera.updateWorldMatrix(true, false);
        structureGroup.updateWorldMatrix(true, true); updateVacuumHandles(); requestRender();
        const r = renderer.domElement.getBoundingClientRect();
        const screen = world => { const p = world.clone().project(camera); return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 }; };
        const end = screen(atomMeshes[0].getWorldPosition(new THREE.Vector3()));
        for (const handle of vacuumDragState.handles.filter(h => h.userData.extendAxis === 'a' && h.userData.handleType === 'near')) {
            for (const fraction of [.25, .75, .125, .875]) {
                const world = handle.userData.edgeStart.clone().lerp(handle.userData.edgeEnd, fraction);
                handle.parent.localToWorld(world);
                const start = screen(world);
                const hit = checkVacuumHandleIntersection({ clientX: start.x, clientY: start.y });
                if (hit?.extendAxis === 'a' && hit.handleType === 'near') return { start, end: { x: end.x + 12, y: end.y } };
            }
        }
        throw Error('No exposed near frame section');
    });
    await page.mouse.move(gesture.start.x, gesture.start.y); await page.mouse.down();
    expect(await page.evaluate(() => vacuumDragState.isDragging)).toBe(true);
    await page.mouse.move(gesture.end.x, gesture.end.y, { steps: 5 });
    expect(await page.evaluate(point => !!getAtomIntersection({ clientX: point.x, clientY: point.y }), gesture.end)).toBe(true);
    await page.screenshot({ path: info.outputPath('frame-before-release.png') });
    await page.mouse.up();
    await page.screenshot({ path: info.outputPath('frame-after-release.png') });
    const state = await page.evaluate(() => ({ selected: selectedAtoms.map(atom => atom.index), preserved: isMeasurementSelection, history: editHistory.undoStack.map(operation => operation.type) }));
    expect(state.selected).toEqual([0, 1, 2]);
    expect(state.preserved).toBe(true);
    expect(state.history.at(-1)).toBe('vacuum_drag');
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => selectedAtoms.map(atom => atom.index))).toEqual([0, 1, 2]);
    await page.locator('#redoBtn').click();
    expect(await page.evaluate(() => selectedAtoms.map(atom => atom.index))).toEqual([0, 1, 2]);
});
