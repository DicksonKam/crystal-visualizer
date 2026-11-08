const { test, expect, upload, setMode } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');

// A measured periodic copy is an annotation on a display copy: Move acts on the
// edit selection, the copy follows its real atom, and the measurement follows both.
for (const includeReal of [false, true]) test(`moving atoms carries a measured periodic copy (${includeReal ? 'copy and atom' : 'copy only'}) and keeps history`, async ({ page }) => {
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
    const measuredGhosts = () => page.evaluate(() => measuredAtoms().map(atom => Boolean(atom.isGhost)));
    expect(await measuredGhosts()).toEqual([true]);
    if (includeReal) {
        await page.locator('#atomJumpInput').fill('1');
        await page.locator('#atomJumpInput').press('Enter');
        expect(await measuredGhosts()).toEqual([true, false]);
    }
    await setMode(page, 'edit');
    const before = await capture(page);
    expect(before.selection.identities).toEqual([]);
    // Nothing is selected, so there is nothing to move; the readout is there.
    await expect(page.locator('#applyShiftBtn')).toHaveCount(0);
    await expect(page.locator('.measurement-readout')).toHaveCount(1);
    // Select the one real atom and move it by its coordinate field: its copy
    // moves with it, so the measured points keep their identities and the
    // copy-to-atom distance.
    await page.locator('#selectAllBtn').click();
    await page.locator('input[name="editAtomCoordMode"][value="cartesian"]').check();
    await page.locator('#editAtom0').fill('1.25');
    await page.locator('#editAtom0').press('Enter');
    const after = await capture(page);
    expect(after.violations).toEqual([]);
    expect(after.geometry.atoms[0].position[0]).toBeCloseTo(1.25, 8);
    expect(after.selection.measurements).toEqual(before.selection.measurements);
    expect(await measuredGhosts()).toEqual(includeReal ? [true, false] : [true]);
    if (includeReal) await expect(page.locator('.measurement-readout')).toContainText('4.0000 Å');
    expect(after.undo.at(-1).type).toBe('move_atom');
    expect(after.revision).toBe(before.revision + 1);
    await page.locator('#undoBtn').click();
    const undone = await capture(page);
    expect(undone.geometry).toEqual(before.geometry);
    expect(undone.selection.measurements).toEqual(before.selection.measurements);
});
