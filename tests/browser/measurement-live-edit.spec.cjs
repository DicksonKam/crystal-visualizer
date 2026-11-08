const { test, expect, upload, setMode } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');
const { dragTarget } = require('./measurement-edit-helpers.cjs');

// A measurement is a live annotation: Edit-mode selection never touches it,
// and its readout follows atom moves, cell resizes, undo and redo.
const source = 'live measurement\n1\n8 0 0\n0 8 0\n0 0 8\nH O\n3 2\nDirect\n0 .2 .2\n.6 .2 .2\n.6 .7 .2\n.3 .4 .5\n.8 .8 .7\n';
const measured = page => page.evaluate(() => measuredAtoms().map(atom => atom.index));
const selected = page => page.evaluate(() => selectedAtoms.map(atom => atom.index));
const distance = page => page.evaluate(() => {
    const [a, b] = measuredAtoms();
    return a.mesh.getWorldPosition(new THREE.Vector3()).distanceTo(b.mesh.getWorldPosition(new THREE.Vector3()));
});
async function expectReadout(page) {
    expect(await measured(page)).toEqual([0, 1]);
    await expect(page.locator('.measurement-readout')).toHaveCount(1);
    await expect(page.locator('.measurement-readout')).toContainText(`${(await distance(page)).toFixed(4)} Å`);
    expect((await capture(page)).violations).toEqual([]);
}

test('a measurement stays through Edit-mode selection and follows moves, resizes and history', async ({ page }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await upload(page, source, 'live.poscar');
    for (const n of [1, 2]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    const original = await distance(page);
    await setMode(page, 'edit');
    await expectReadout(page);
    expect(await selected(page)).toEqual([]);
    await page.screenshot({ path: info.outputPath('edit-with-measurement.png') });

    // Clicking another atom selects it for editing and leaves the measurement.
    const point = await page.evaluate(() => {
        cancelCameraAlignment(); controls.staticMoving = true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 30));
        camera.up.set(0, 1, 0); camera.zoom = .8; camera.updateProjectionMatrix();
        controls.update(); fitStructureToView(true); camera.updateWorldMatrix(true, false);
        structureGroup.updateWorldMatrix(true, true); requestRender();
        const r = renderer.domElement.getBoundingClientRect();
        for (const mesh of atomMeshes.filter(candidate => !candidate.userData.isGhost && candidate.userData.atomIndex > 1)) {
            const p = mesh.getWorldPosition(new THREE.Vector3()).project(camera);
            const screen = { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
            if (getAtomIntersection({ clientX: screen.x, clientY: screen.y })?.object === mesh) return { ...screen, index: mesh.userData.atomIndex };
        }
        throw Error('No exposed unmeasured atom');
    });
    await page.mouse.click(point.x, point.y);
    expect(await selected(page)).toEqual([point.index]);
    await expectReadout(page);

    // A box over the whole view selects every real atom, measured ones included.
    const canvas = await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
    await page.keyboard.down('Shift');
    await page.mouse.move(canvas.x + 5, canvas.y + 5); await page.mouse.down();
    await page.mouse.move(canvas.x + canvas.width - 5, canvas.y + canvas.height - 5, { steps: 6 });
    await page.mouse.up(); await page.keyboard.up('Shift');
    // The box adds to the clicked atom, as rules do.
    expect([...await selected(page)].sort()).toEqual([0, 1, 2, 3, 4]);
    await expectReadout(page);
    await page.screenshot({ path: info.outputPath('all-selected-with-measurement.png') });

    // Moving only the second measured atom changes the readout.
    await page.locator('#atomJumpInput').fill('2'); await page.locator('#atomJumpInput').press('Enter');
    expect(await selected(page)).toEqual([1]);
    await page.locator('input[name="editAtomCoordMode"][value="cartesian"]').check();
    const x = await page.locator('#editAtom0').inputValue();
    await page.locator('#editAtom0').fill(String(Number(x) + 0.5));
    await page.locator('#editAtom0').press('Enter');
    const moved = await distance(page);
    expect(moved).not.toBeCloseTo(original, 6);
    await expectReadout(page);
    await page.locator('#undoBtn').click();
    expect(await distance(page)).toBeCloseTo(original, 6);
    await expectReadout(page);
    await page.locator('#redoBtn').click();
    expect(await distance(page)).toBeCloseTo(moved, 6);
    await expectReadout(page);
    await page.locator('#selectNoneBtn').click();

    // Dragging the near cell face moves every atom with the cell: the measured
    // points move, their distance does not, and the readout follows live and after release.
    const positions = () => page.evaluate(() => measuredAtoms().map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()).toArray()));
    const placed = await positions();
    await dragTarget(page, 'cell', 1);
    await expectReadout(page);
    await page.screenshot({ path: info.outputPath('cell-drag-with-measurement.png') });
    await page.mouse.up();
    expect(await positions()).not.toEqual(placed);
    expect(await distance(page)).toBeCloseTo(moved, 6);
    await expectReadout(page);
    expect((await capture(page)).undo.at(-1).type).toBe('vacuum_drag');
    await page.locator('#undoBtn').click();
    expect(await positions()).toEqual(placed);
    await expectReadout(page);

    // Escape in Edit clears a selection, never the measurement; the readout's
    // clear removes it, and undo brings it back with the mode it was cleared in.
    await page.locator('#selectAllBtn').click();
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Escape');
    expect(await selected(page)).toEqual([]);
    await expectReadout(page);
    // Clearing from the readout removes the strip above Select Atoms; with the
    // panel scrolled, the section stays where it was under the pointer.
    const allBtn = page.locator('#selectAllBtn');
    await allBtn.scrollIntoViewIfNeeded();
    await page.locator('.sidebar').evaluate(sidebar => { sidebar.scrollTop = Math.max(0, sidebar.scrollTop - 60); });
    const row = await allBtn.boundingBox();
    await page.locator('#clearMeasurementBtn').click();
    expect(await measured(page)).toEqual([]);
    await expect(page.locator('.measurement-readout')).toHaveCount(0);
    expect(Math.abs((await allBtn.boundingBox()).y - row.y)).toBeLessThan(2);
    const state = await capture(page);
    expect(state.undo.at(-1).type).toBe('clear_measurement');
    expect(state.revision).toBe((await capture(page)).revision);
    await page.locator('#undoBtn').click();
    await expectReadout(page);
    expect((await capture(page)).selection.mode).toBe('edit');
});

test('Escape in Measure mode clears the measurement and the Measurements panel clears it too', async ({ page }) => {
    await upload(page, source, 'live.poscar');
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    expect(await measured(page)).toEqual([0, 1, 2]);
    const revision = (await capture(page)).revision;
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Escape');
    expect(await measured(page)).toEqual([]);
    await expect(page.locator('#statusText')).toHaveText('Measurement cleared');
    await page.locator('#undoBtn').click();
    expect(await measured(page)).toEqual([0, 1, 2]);
    await page.locator('#clearMeasurementBtn').click();
    expect(await measured(page)).toEqual([]);
    await expect(page.locator('#measurementPanel')).toContainText('Click atoms to measure');
    expect((await capture(page)).revision).toBe(revision);
    // A fourth atom starts a new measurement in one step.
    await page.locator('#undoBtn').click();
    await page.locator('#atomJumpInput').fill('4'); await page.locator('#atomJumpInput').press('Enter');
    expect(await measured(page)).toEqual([3]);
    const after = await capture(page);
    expect(after.undo.slice(-2).map(op => op.type)).toEqual(['measure_atom', 'measure_atom']);
    await page.locator('#undoBtn').click();
    expect(await measured(page)).toEqual([0, 1, 2]);
});
