const { test, expect, upload } = require('./fixtures.cjs');

test('a new mouse drag replaces the previous cancellation message before release', async ({ page }, info) => {
    await upload(page, '2\ndrag feedback\nH -1 0 0\nO 1 0 0\n', 'feedback.xyz');
    await page.locator('[data-mode="edit"]').click();
    await page.getByRole('button', { name: 'Reset View', exact: true }).click();
    await page.waitForFunction(() => cameraController.phase === 'idle');
    const point = await page.evaluate(() => {
        camera.updateWorldMatrix(true, false);
        structureGroup.updateWorldMatrix(true, true);
        const r = renderer.domElement.getBoundingClientRect();
        const p = atomMeshes[0].getWorldPosition(new THREE.Vector3()).project(camera);
        return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
    });
    const original = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    const start = async () => {
        await page.mouse.move(point.x, point.y);
        await page.mouse.down();
        await page.mouse.move(point.x + 45, point.y + 30, { steps: 5 });
        expect(await page.evaluate(() => isDragging)).toBe(true);
    };
    await start();
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(page.locator('#statusText')).toContainText('Drag canceled (Escape pressed)');
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(original);

    await start();
    await page.screenshot({ path: info.outputPath('next-drag-held.png') });
    await expect(page.locator('#statusText')).toHaveText('Moving atom #1');
    const preview = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    expect(preview).not.toEqual(original);
    await page.mouse.up();
    await expect(page.locator('#statusText')).toHaveText('Moved atom #1');
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(preview);
    expect(await page.evaluate(() => editHistory.undoStack.map(op => op.type))).toEqual(['move_atom']);
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(original);
    await page.locator('#redoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(preview);
});
