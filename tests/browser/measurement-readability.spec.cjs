const { test, expect, upload } = require('./fixtures.cjs');

test('measurement annotations remain readable for small atoms after sidebar resizing', async ({ page }, info) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await upload(page, 'small atom measurements\n1\n8 0 0\n0 8 0\n0 0 8\nH O\n3 2\nDirect\n0 .2 .2\n.6 .2 .2\n.6 .7 .2\n.3 .4 .5\n.8 .8 .7\n', 'small-atoms.poscar');
    for (const n of [1, 2, 3]) {
        await page.locator('#atomJumpInput').fill(String(n));
        await page.locator('#atomJumpInput').press('Enter');
    }
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
    await page.locator('#resetView').click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: info.outputPath('small-atom-measurement.png') });
    const sizes = await page.evaluate(() => {
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
    await info.attach('annotation-css-pixels', { body: JSON.stringify(sizes), contentType: 'application/json' });
    expect(sizes.labels).toHaveLength(3);
    for (const height of sizes.labels) expect(height).toBeGreaterThanOrEqual(18 - .01);
    for (const height of sizes.markers) expect(height).toBeGreaterThanOrEqual(14 - .01);
});
