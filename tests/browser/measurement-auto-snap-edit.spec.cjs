const { test, expect, upload } = require('./fixtures.cjs');
const { checkMeasurement, compareGeometry, dragTarget } = require('./measurement-edit-helpers.cjs');

test('automatic snap after a measured atom move preserves geometry and annotations', async ({ page }, info) => {
    test.setTimeout(90000);
    await upload(page, 'snap after edit\n1\n10 0 0\n0 10 0\n0 0 10\nH\n3\nDirect\n.2 .3 .4\n.7 .6 .5\n.4 .8 .7\n', 'measured.poscar');
    for (const n of [1,2,3]) {
        await page.locator('#atomJumpInput').fill(String(n));
        await page.locator('#atomJumpInput').press('Enter');
    }
    await page.locator('[data-mode="edit"]').click();
    await dragTarget(page, 'atom', 0); await page.mouse.up();
    const moved = await checkMeasurement(page);
    expect(moved.undo.at(-1).type).toBe('move_atom');
    // Seed an approach angle, then let normal mouse input and damping decide
    // whether to snap. Calling align directly would bypass that decision.
    const before = await page.evaluate(() => {
        cancelCameraAlignment(); clearManualCameraMotion(); controls.staticMoving = false;
        const angle = 8 * Math.PI / 180;
        applyCameraPose({ ...getCameraPose(), quaternion: cameraMath.orientation([Math.cos(angle),Math.sin(angle),0],[0,0,1]) });
        const original = cameraController.align;
        window.measuredSnapEvents = [];
        cameraController.align = function(q,time,kind,name) {
            measuredSnapEvents.push({kind,name}); return original.call(this,q,time,kind,name);
        };
        requestRender();
        return {pivot:controls.target.toArray(),zoom:camera.zoom};
    });
    await page.screenshot({path:info.outputPath('before-approach.png')});
    const box = await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
    const point = {x:box.x+box.width*.8,y:box.y+box.height*.2};
    expect(await page.evaluate(p => !!getAtomIntersection({clientX:p.x,clientY:p.y}),point)).toBe(false);
    await page.mouse.move(point.x,point.y); await page.mouse.down();
    await page.mouse.move(point.x+2,point.y); await page.waitForTimeout(45); await page.mouse.up();
    await expect.poll(() => page.evaluate(() => measuredSnapEvents.filter(e=>e.kind==='automatic').length), {timeout:10000}).toBe(1);
    await page.screenshot({path:info.outputPath('capture-or-transition.png')});
    await expect.poll(() => page.evaluate(() => cameraController.phase), {timeout:10000}).toBe('idle');
    compareGeometry((await checkMeasurement(page)).geometry,moved.geometry);
    const after=await page.evaluate(()=>({direction:cameraMath.back(camera.quaternion).toArray(),pivot:controls.target.toArray(),zoom:camera.zoom}));
    after.direction.forEach((v,i)=>expect(v).toBeCloseTo([1,0,0][i],7));
    after.pivot.forEach((v,i)=>expect(v).toBeCloseTo(before.pivot[i],7));
    expect(after.zoom).toBe(before.zoom);
    expect((await checkMeasurement(page)).undo).toEqual(moved.undo);
    await page.screenshot({path:info.outputPath('snapped-after-edit.png')});
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
    await checkMeasurement(page); await page.screenshot({path:info.outputPath('snapped-wide-panel.png')});
    await page.locator('#undoBtn').click(); await checkMeasurement(page);
    await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry,moved.geometry);
    await page.screenshot({path:info.outputPath('snapped-history-restored.png')});
});
