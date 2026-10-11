const {test, expect, upload} = require('./fixtures.cjs');
const molecule = '3\nedited small molecule\nC -5 0 0\nO 0 0 0\nC 5 0 0\n';
test('manual orbit keeps all atom geometry inside the depth range', async ({page}, info) => {
    await upload(page, molecule, 'edited.xyz');
    await page.evaluate(() => {
        cameraController.setPose(cameraMath.fit(getStructureBounds(), cameraMath.orientation([0,0,1],[0,1,0]), perspectiveCamera.aspect), 'fit');
        clearManualCameraMotion(); controls.staticMoving = true;
    });
    const canvas = page.locator('canvas[aria-label^="3D structure"]');
    const box = await canvas.boundingBox();
    const failures = [];
    for (let i=0;i<24;i++) {
        const x=box.x+box.width*.7, y=box.y+box.height*.4;
        await page.mouse.move(x,y); await page.mouse.down();
        await page.mouse.move(x+35,y+5,{steps:4}); await page.mouse.up();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const result = await page.evaluate(() => {
            camera.updateMatrixWorld(true);
            return atomMeshes.map(mesh => {
                const depth = -mesh.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse).z;
                const radius = mesh.scale.x;
                return {depth, radius, near:camera.near, far:camera.far, clipped:depth-radius<camera.near || depth+radius>camera.far};
            });
        });
        if(result.some(atom=>atom.clipped)) failures.push({i,result});
        if(i%6===0 || result.some(atom=>atom.clipped)) await canvas.screenshot({path:info.outputPath(`orbit-${i}.png`)});
    }
    expect(failures).toEqual([]);
});

test('sidebar resizing draws each resized canvas before returning to the browser', async ({page}, info) => {
    await upload(page, '3\nwater\nO 0 0 .1173\nH .7572 0 -.4692\nH -.7572 0 -.4692\n', 'water.xyz');
    await page.evaluate(() => {
        window.blankResizeFrames = [];
        let draws = 0;
        const render = renderer.render.bind(renderer), resize = renderer.setSize.bind(renderer);
        renderer.render = (...args) => { draws++; return render(...args); };
        renderer.setSize = (...args) => {
            const before = draws;
            const result = resize(...args);
            queueMicrotask(() => { if(draws === before) blankResizeFrames.push(args.slice(0,2)); });
            return result;
        };
        window.poseBeforeResize = getCameraPose();
    });
    const divider = page.locator('#sidebarDivider');
    for(const target of [560,310,220,400,280]) {
        const box = await divider.boundingBox();
        await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
        await page.mouse.down();
        await page.mouse.move(target,box.y+box.height/2,{steps:15});
        await page.mouse.up();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        await page.screenshot({path:info.outputPath(`sidebar-${target}.png`)});
    }
    expect(await page.evaluate(() => blankResizeFrames)).toEqual([]);
    const state = await page.evaluate(() => ({before:poseBeforeResize.quaternion.toArray(), after:camera.quaternion.toArray(),
        panBefore:poseBeforeResize.pivot.toArray(), panAfter:controls.target.toArray()}));
    state.after.forEach((value,i) => expect(value).toBeCloseTo(state.before[i], 10));
    state.panAfter.forEach((value,i) => expect(value).toBeCloseTo(state.panBefore[i], 10));
});
