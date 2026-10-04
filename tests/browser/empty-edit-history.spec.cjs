const { test, expect, upload } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');

test('complete deletion, refill and history branching remain coherent across repeated edit cycles', async ({ page }) => {
    test.setTimeout(120000);
    page.setDefaultTimeout(5000);
    await upload(page, '4\nempty document cycles\nH -2 -2 0\nO 2 -2 0\nH -2 2 0\nO 2 2 0\n', 'empty-cycles.xyz');
    await page.locator('[data-mode="edit"]').click();
    async function add(element) {
        await page.locator('#addAtomElement').selectOption(element);
        await page.locator('input[name="coordType"][value="cartesian"]').check();
        for (const input of ['#addAtomX', '#addAtomY', '#addAtomZ']) await page.locator(input).fill('0');
        await page.locator('#addAtomBtn').click();
    }
    async function checkedState() {
        const state = await capture(page);
        expect(state.violations).toEqual([]);
        return state;
    }
    for (let cycle = 0; cycle < 8; cycle++) {
        // Prepare a face-on view, then use real pointer clicks for multi-selection.
        const points = await page.evaluate(() => {
            cancelCameraAlignment();
            controls.staticMoving = true;
            controls.target.set(0, 0, 0); camera.position.set(0, 0, 30);
            camera.up.set(0, 1, 0); camera.zoom = .8;
            camera.updateProjectionMatrix(); controls.update();
            camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
            const rect = renderer.domElement.getBoundingClientRect();
            return atomMeshes.filter(mesh => !mesh.userData.isGhost).map(mesh => {
                const p = mesh.getWorldPosition(new THREE.Vector3()).project(camera);
                return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
            });
        });
        for (const p of points) await page.mouse.click(p.x, p.y);
        const selected = await checkedState();
        expect(selected.selection.identities).toHaveLength(selected.atomCount);
        await page.locator('#deleteSelectedBtn').click();
        const empty = await checkedState();
        expect(empty.atomCount).toBe(0);
        expect(empty.selection.identities).toEqual([]);
        await page.locator('#exportPoscar').click();
        await expect(page.locator('#statusText')).toContainText('Cannot export an empty structure');
        await add('C');
        expect((await checkedState()).geometry.atoms.map(atom => atom.element)).toEqual(['C']);
        await page.locator('#undoBtn').click();
        expect((await checkedState()).atomCount).toBe(0);
        await page.locator('#undoBtn').click();
        expect((await checkedState()).geometry).toEqual(selected.geometry);
        await page.locator('#redoBtn').click();
        expect((await checkedState()).atomCount).toBe(0);
        await page.locator('#redoBtn').click();
        expect((await checkedState()).geometry.atoms.map(atom => atom.element)).toEqual(['C']);
        await page.locator('#undoBtn').click();
        await add('H');
        const branch = await checkedState();
        expect(branch.geometry.atoms.map(atom => atom.element)).toEqual(['H']);
        expect(branch.redo).toEqual([]);
        await expect(page.locator('#redoBtn')).toBeDisabled();
    }
});
