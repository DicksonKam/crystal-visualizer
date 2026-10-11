const { test, expect, upload } = require('./fixtures.cjs');

async function markerPoint(page) {
    await upload(page, 'marker interaction\n1\n8 0 0\n0 8 0\n0 0 8\nH O\n3 2\nDirect\n0 .2 .2\n.6 .2 .2\n.6 .7 .2\n.3 .4 .5\n.8 .8 .7\n', 'marker.poscar');
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
    await page.waitForFunction(() => renderer.domElement.clientWidth === viewport.clientWidth);
    await page.evaluate(() => {
        cancelCameraAlignment(); controls.staticMoving = true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 30));
        camera.up.set(0, 1, 0); camera.zoom = .8; camera.updateProjectionMatrix();
        controls.update(); fitStructureToView(true); requestRender();
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.evaluate(() => {
        const r = renderer.domElement.getBoundingClientRect();
        const p = selectedAtoms[0].mesh.getWorldPosition(new THREE.Vector3()).project(camera);
        return { x: r.left + (p.x + 1) * r.width / 2 + 4, y: r.top + (1 - p.y) * r.height / 2 };
    });
}

test('visible numbered marker edges select the atom in measure mode', async ({ page }, info) => {
    const point = await markerPoint(page);
    await page.screenshot({ path: info.outputPath('marker-before-click.png') });
    await page.mouse.click(point.x, point.y);
    await page.screenshot({ path: info.outputPath('marker-after-click.png') });
    expect(await page.evaluate(() => selectedAtoms.map(atom => atom.index))).toEqual([1, 2]);
});

test('visible numbered marker edges drag their boundary atom in edit mode', async ({ page }, info) => {
    const point = await markerPoint(page);
    await page.locator('[data-mode="edit"]').click();
    await page.screenshot({ path: info.outputPath('marker-before-drag.png') });
    const before = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    await page.mouse.move(point.x, point.y); await page.mouse.down();
    const owner = await page.evaluate(() => ({ atom: draggedAtom?.index, frame: vacuumDragState.isDragging }));
    try {
        expect(owner).toEqual({ atom: 0, frame: false });
        await page.mouse.move(point.x + 12, point.y - 8, { steps: 5 });
    } finally { await page.mouse.up(); }
    await page.screenshot({ path: info.outputPath('marker-after-drag.png') });
    const after = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    expect(after).not.toEqual(before);
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(before);
    await page.locator('#redoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(after);
});
