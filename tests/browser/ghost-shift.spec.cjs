const { test, expect, upload } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');

for (const includeReal of [false, true]) test(`shifting a preserved periodic-copy measurement (${includeReal ? 'mixed' : 'copy only'}) reports its editability and preserves history`, async ({ page }) => {
    await upload(page, 'ghost shift\n1\n4 0 0\n0 4 0\n0 0 4\nH\n1\nCartesian\n1 1 1\n', 'ghost-shift.poscar');
    await page.getByRole('button', { name: 'Increase a periodic images', exact: true }).click();
    const point = await page.evaluate(() => {
        cancelCameraAlignment(); controls.staticMoving = true;
        controls.target.set(3, 1, 1); camera.position.set(3, 1, 31);
        camera.up.set(0, 1, 0); camera.zoom = .8;
        camera.updateProjectionMatrix(); controls.update();
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        const mesh = atomMeshes.find(atom => atom.userData.isGhost);
        const p = mesh.getWorldPosition(new THREE.Vector3()).project(camera);
        const r = renderer.domElement.getBoundingClientRect();
        return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
    });
    await page.mouse.click(point.x, point.y);
    expect(await page.evaluate(() => selectedAtoms.map(atom => Boolean(atom.isGhost)))).toEqual([true]);
    if (includeReal) {
        await page.locator('#atomJumpInput').fill('1');
        await page.locator('#atomJumpInput').press('Enter');
        expect(await page.evaluate(() => selectedAtoms.map(atom => Boolean(atom.isGhost)))).toEqual([true, false]);
    }
    await page.locator('[data-mode="edit"]').click();
    const before = await capture(page);
    await page.locator('input[name="shiftCoordType"][value="cartesian"]').check();
    await page.locator('#shiftA').fill('0.25');
    await page.locator('#applyShiftBtn').click();
    await expect(page.locator('#shiftError')).toContainText('Periodic copies cannot be moved');
    await expect(page.locator('.shift-target-hint')).toContainText('Periodic copies cannot be moved');
    const after = await capture(page);
    expect(after.violations).toEqual([]);
    expect(after.geometry).toEqual(before.geometry);
    expect(after.selection).toEqual(before.selection);
    expect(after.undo).toEqual(before.undo); expect(after.redo).toEqual(before.redo);
    expect(after.revision).toBe(before.revision); expect(after.dirty).toBe(before.dirty);
    // Clear the read-only selection, then the same valid vector shifts real atoms.
    await page.locator('#clearSelectionBtn').click();
    await page.locator('#shiftA').fill('0.25');
    await page.locator('#applyShiftBtn').click();
    const shifted = await capture(page);
    expect(shifted.violations).toEqual([]);
    expect(shifted.geometry.atoms[0].position[0]).toBeCloseTo(1.25, 8);
    expect(shifted.undo.at(-1).type).toBe('shift_atoms');
    await page.locator('#undoBtn').click();
    expect((await capture(page)).geometry).toEqual(before.geometry);
});
