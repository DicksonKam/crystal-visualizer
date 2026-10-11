const {test, expect, upload} = require('./fixtures.cjs');
for(const deviceScaleFactor of [1,2]) test.describe(`ordinary labels at display scale ${deviceScaleFactor}`, () => {
    test.use({deviceScaleFactor});
    test('atom numbers remain readable without changing model bounds or measurements', async ({page},info) => {
        await page.setViewportSize({width:900,height:760});
        await upload(page,'3\nwater\nO 0 0 .1173\nH .7572 0 -.4692\nH -.7572 0 -.4692\n','water.xyz');
        await page.evaluate(() => {cameraController.setPose({...getCameraPose(),zoom:.6},'fit');clearManualCameraMotion();});
        const bounds = () => page.evaluate(() => {const b=getStructureBounds();return {min:b.min.toArray(),max:b.max.toArray()};});
        const before = await bounds();
        await page.locator('#showLabels').check();
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        await page.screenshot({path:info.outputPath('ordinary-labels-far.png')});
        const sizes = await page.evaluate(() => structureGroup.children.filter(o=>o.userData.isAtomLabel).map(o=> {
            const world=o.getWorldPosition(new THREE.Vector3());
            return o.getWorldScale(new THREE.Vector3()).y/getAnnotationWorldPerPixel(world,renderer.domElement.clientHeight);
        }));
        for(const size of sizes) expect(size).toBeGreaterThanOrEqual(24-.01);
        expect(await bounds()).toEqual(before);
        for(const n of [1,2,3]) {await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
        const measurement = await page.locator('#measurementPanel').innerText();
        await page.locator('[data-mode="edit"]').click();
        await page.screenshot({path:info.outputPath('labels-and-preserved-measurement.png')});
        await page.locator('#showLabels').uncheck();await page.locator('#showLabels').check();
        await page.locator('[data-mode="measure"]').click();
        expect(await page.locator('#measurementPanel').innerText()).toBe(measurement);
        await page.locator('#sidebarDivider').focus();await page.keyboard.press('Home');
        await page.screenshot({path:info.outputPath('labels-collapsed-sidebar.png')});
    });
});
