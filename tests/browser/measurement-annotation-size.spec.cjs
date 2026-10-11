const { test, expect, upload } = require('./fixtures.cjs');

async function annotationSizes(page) {
    return page.evaluate(() => {
        camera.updateWorldMatrix(true, false);
        const height = renderer.domElement.getBoundingClientRect().height;
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        const pixels = sprite => {
            const center = sprite.getWorldPosition(new THREE.Vector3());
            const half = sprite.getWorldScale(new THREE.Vector3()).y / 2;
            const top = center.clone().addScaledVector(up, half).project(camera);
            const bottom = center.clone().addScaledVector(up, -half).project(camera);
            return Math.abs(top.y - bottom.y) * height / 2;
        };
        return {
            labels: measurementGroup.children.filter(object => object.userData.isMeasurementLabel).map(pixels),
            markers: selectionRings.map(pixels)
        };
    });
}

for (const deviceScaleFactor of [1, 2]) test.describe(`annotation CSS sizing at device scale ${deviceScaleFactor}`, () => {
    test.use({ deviceScaleFactor });
    for (const width of [900, 1440]) test(`small atom annotations survive sidebar resizing and zoom at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await upload(page, 'small atom measurements\n1\n8 0 0\n0 8 0\n0 0 8\nH O\n3 2\nDirect\n0 .2 .2\n.6 .2 .2\n.6 .7 .2\n.3 .4 .5\n.8 .8 .7\n', 'small-atoms.poscar');
    for (const n of [1, 2, 3]) {
        await page.locator('#atomJumpInput').fill(String(n));
        await page.locator('#atomJumpInput').press('Enter');
    }
    const geometry = () => page.evaluate(() => ({ atoms: currentStructure.atoms.map(atom => atom.position.toArray()), lattice: currentStructure.lattice }));
    const original = await geometry();
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
    await page.locator('#resetView').click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: info.outputPath('small-atom-measurement.png') });
    const sizes = await annotationSizes(page);
    await info.attach('annotation-css-pixels', { body: JSON.stringify(sizes), contentType: 'application/json' });
    expect(sizes.labels).toHaveLength(3);
    for (const height of sizes.labels) expect(height).toBeGreaterThanOrEqual(18 - .01);
    for (const height of sizes.markers) expect(height).toBeGreaterThanOrEqual(14 - .01);
    const canvas = await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
    await page.mouse.move(canvas.x + canvas.width * .75, canvas.y + canvas.height * .5);
    await page.mouse.wheel(0, 180);
    await page.screenshot({ path: info.outputPath('zoomed-out-measurement.png') });
    await expect.poll(async () => Math.min(...(await annotationSizes(page)).labels)).toBeGreaterThanOrEqual(18 - .01);
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Home');
    await page.locator('#resetView').click();
    await page.locator('#atomScale').focus(); await page.keyboard.press('ArrowLeft');
    await page.screenshot({ path: info.outputPath('restored-panel-measurement.png') });
    await expect.poll(async () => Math.min(...(await annotationSizes(page)).labels)).toBeGreaterThanOrEqual(18 - .01);
    await expect.poll(async () => Math.min(...(await annotationSizes(page)).markers)).toBeGreaterThanOrEqual(14 - .01);
    expect(await geometry()).toEqual(original);
    expect(await page.evaluate(() => selectedAtoms.map(atom => atom.index))).toEqual([0, 1, 2]);
    await expect(page.locator('#measurementPanel')).toContainText('4.8000 Å');
    await expect(page.locator('#measurementPanel')).toContainText('90.00°');
});
});
