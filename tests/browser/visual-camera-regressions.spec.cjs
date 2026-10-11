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
