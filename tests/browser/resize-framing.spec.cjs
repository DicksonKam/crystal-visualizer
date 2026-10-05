const { test, expect, upload } = require('./fixtures.cjs');

async function visibleAtoms(page) {
    return page.evaluate(() => {
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        return atomMeshes.filter(m => !m.userData.isGhost).map(m => {
            const world = m.getWorldPosition(new THREE.Vector3());
            const radius = m.scale.x;
            return [world, world.clone().addScaledVector(right, radius), world.clone().addScaledVector(right, -radius),
                world.clone().addScaledVector(up, radius), world.clone().addScaledVector(up, -radius)]
                .map(p => p.project(camera).toArray());
        });
    });
}

test('sidebar and window resizing retain fitted atoms without changing orientation or document history', async ({ page }, info) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await upload(page, '3\nwide molecule\nH -2 0 0\nO 0 0 0\nH 2 0 0\n', 'wide.xyz');
    await page.getByRole('button', { name: 'Reset View', exact: true }).click();
    const before = await page.evaluate(() => ({ q: camera.quaternion.toArray(), target: controls.target.toArray(),
        history: editHistory.undoStack.length, zoom: camera.zoom }));
    for (let cycle = 0; cycle < 3; cycle++) {
        await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
        await page.screenshot({ path: info.outputPath(`narrow-${cycle}.png`) });
        for (const points of await visibleAtoms(page)) for (const [x, y] of points) {
            expect(Math.abs(x)).toBeLessThanOrEqual(1); expect(Math.abs(y)).toBeLessThanOrEqual(1);
        }
        (await page.evaluate(() => camera.quaternion.toArray())).forEach((value, i) => expect(value).toBeCloseTo(before.q[i], 12));
        expect(await page.evaluate(() => controls.target.toArray())).toEqual(before.target);
        await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Home');
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.getByRole('button', { name: 'Reset View', exact: true }).click();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: info.outputPath(`portrait-${cycle}.png`) });
        for (const points of await visibleAtoms(page)) for (const [x, y] of points) {
            expect(Math.abs(x)).toBeLessThanOrEqual(1); expect(Math.abs(y)).toBeLessThanOrEqual(1);
        }
        await page.setViewportSize({ width: 1280, height: 800 });
    }
    expect(await page.evaluate(() => editHistory.undoStack.length)).toBe(before.history);
});

test('repeated layout round trips preserve deliberate zoom and pan without magnification drift', async ({ page }, info) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await upload(page, '3\nwide molecule\nH -2 0 0\nO 0 0 0\nH 2 0 0\n', 'wide.xyz');
    await page.evaluate(() => { controls.staticMoving = true; });
    const canvas = await page.locator('#viewport').boundingBox();
    const initialZoom = await page.evaluate(() => camera.zoom);
    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
    await page.mouse.wheel(0, 70);
    await page.waitForFunction(z => camera.zoom !== z, initialZoom);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(canvas.x + canvas.width / 2 + 20, canvas.y + canvas.height / 2 + 10, { steps: 4 });
    await page.mouse.up({ button: 'right' });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const before = await page.evaluate(() => ({ zoom: camera.zoom, q: camera.quaternion.toArray(),
        pivot: controls.target.toArray(), width: Number(document.getElementById('sidebarDivider').getAttribute('aria-valuenow')) }));
    for (let cycle = 0; cycle < 3; cycle++) {
        await page.locator('#sidebarDivider').press('End');
        const box = await page.locator('#sidebarDivider').boundingBox();
        const width = Number(await page.locator('#sidebarDivider').getAttribute('aria-valuenow'));
        await page.mouse.move(box.x + 5, box.y + 80); await page.mouse.down();
        await page.mouse.move(box.x + 5 + before.width - width, box.y + 80, { steps: 5 }); await page.mouse.up();
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        expect(await page.evaluate(() => camera.zoom)).toBeCloseTo(before.zoom, 10);
        (await page.evaluate(() => controls.target.toArray())).forEach((value, i) => expect(value).toBeCloseTo(before.pivot[i], 10));
        (await page.evaluate(() => camera.quaternion.toArray())).forEach((value, i) => expect(value).toBeCloseTo(before.q[i], 10));
    }
    await page.screenshot({ path: info.outputPath('restored-user-view.png') });
});
