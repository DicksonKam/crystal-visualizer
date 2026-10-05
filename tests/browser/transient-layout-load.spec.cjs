const { test, expect, upload } = require('./fixtures.cjs');

test('file replacement during a zero-width layout retains a fitted view after the sidebar settles', async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await upload(page, '2\nold molecule\nH 0 0 0\nH 1 0 0\n', 'old.xyz');
    await page.evaluate(() => {
        // Reproduce the intermediate layout before the resize listener
        // clamps a previously wide sidebar to the new narrow window.
        document.querySelector('.main-content').style.setProperty('--sidebar-width', '414px');
    });
    expect(await page.evaluate(() => viewport.clientWidth)).toBe(0);
    await upload(page, '3\nreplacement\nH -2 0 0\nO 0 0 0\nH 2 0 0\n', 'replacement.xyz');
    expect(await page.evaluate(() => currentStructure.atoms.length)).toBe(3);
    expect(await page.evaluate(() => camera.projectionMatrix.elements.every(Number.isFinite)
        && camera.position.toArray().every(Number.isFinite))).toBe(true);
    await page.locator('#sidebarDivider').press('Home');
    await page.waitForFunction(() => viewport.clientWidth > 0 && renderer.domElement.clientWidth === viewport.clientWidth);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const points = await page.evaluate(() => {
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        return atomMeshes.filter(mesh => !mesh.userData.isGhost)
            .map(mesh => mesh.getWorldPosition(new THREE.Vector3()).project(camera).toArray());
    });
    for (const [x, y, z] of points) {
        expect(Math.abs(x)).toBeLessThanOrEqual(1);
        expect(Math.abs(y)).toBeLessThanOrEqual(1);
        expect(Math.abs(z)).toBeLessThanOrEqual(1);
    }
    await page.screenshot({ path: info.outputPath('replacement-after-layout.png') });
});
