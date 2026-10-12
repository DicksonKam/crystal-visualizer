const { test, expect, upload } = require('./fixtures.cjs');
const { checkMeasurement, compareGeometry } = require('./measurement-edit-helpers.cjs');
const path = require('node:path');

for (const [name, direction] of [['corner', [1,1,1]], ['edge', [1,1,0]]]) {
    test(`a camera plane tangent to a cell ${name} still permits measured atom movement`, async ({ page }, info) => {
        if (process.env.CRYSTAL_CORNER_CANDIDATE) {
            for (const file of ['app.js', 'geometry.js']) await page.route(`**/${file}?*`, route => route.fulfill({
                path: path.join(process.env.CRYSTAL_CORNER_CANDIDATE, file), contentType: 'text/javascript'
            }));
            await page.reload();
        }
        await upload(page, 'corner drag\n1\n4 0 0\n0 4 0\n0 0 4\nAl\n3\nDirect\n0 0 0\n0.5 0 0.5\n0 0.5 0.5\n', 'corner.poscar');
        for (const n of [1,2,3]) {
            await page.locator('#atomJumpInput').fill(String(n));
            await page.locator('#atomJumpInput').press('Enter');
        }
        await page.locator('[data-mode="edit"]').click();
        await page.evaluate(direction => {
            cameraController.setPose(cameraMath.fit(getStructureBounds(), cameraMath.orientation(direction,[0,1,0]), perspectiveCamera.aspect), 'fit');
            clearManualCameraMotion(); requestRender();
        }, direction);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const before = await checkMeasurement(page);
        const points = await page.evaluate(() => {
            const r = renderer.domElement.getBoundingClientRect();
            const project = p => { const q = p.project(camera); return {x:r.left+(q.x+1)*r.width/2,y:r.top+(1-q.y)*r.height/2}; };
            const origin = atomMeshes[0].getWorldPosition(new THREE.Vector3());
            const facing = camera.getWorldDirection(new THREE.Vector3());
            const axes = currentStructure.lattice.map((_,axis) => {
                const other = [0,1,2].filter(i => i!==axis);
                const normal = new THREE.Vector3(...currentStructure.lattice[other[0]]).cross(new THREE.Vector3(...currentStructure.lattice[other[1]])).normalize();
                return {axis,score:Math.abs(normal.dot(facing)),other};
            }).sort((a,b) => b.score-a.score);
            const target = origin.clone();
            for (const axis of axes[0].other) target.addScaledVector(new THREE.Vector3(...currentStructure.lattice[axis]),.2);
            const localTarget = target.clone().sub(structureGroup.position).toArray();
            return {start:project(origin),end:project(target),localTarget};
        });
        await page.mouse.move(points.start.x,points.start.y); await page.mouse.down();
        expect(await page.evaluate(() => draggedAtom?.index)).toBe(0);
        await page.mouse.move(points.end.x,points.end.y,{steps:12});
        await page.screenshot({path:info.outputPath('held.png')});
        await page.mouse.up();
        const placed = await checkMeasurement(page);
        await page.screenshot({path:info.outputPath('placed.png')});
        expect(placed.geometry).not.toEqual(before.geometry);
        expect(await page.evaluate(() => currentStructure.atoms[0].position.length())).toBeGreaterThan(.1);
        const targetError = await page.evaluate(target => currentStructure.atoms[0].position.distanceTo(new THREE.Vector3(...target)), points.localTarget);
        expect(targetError).toBeLessThan(.05);
        const fractions = await page.evaluate(() => currentStructure.atoms.map(a => CrystalGeometry.cartesianToFractional(a.position,currentStructure.lattice)));
        for (const f of fractions) for (const x of f) { expect(x).toBeGreaterThanOrEqual(-1e-8); expect(x).toBeLessThanOrEqual(1+1e-8); }
        await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry,before.geometry);
        await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry,placed.geometry);
        await page.screenshot({path:info.outputPath('redo.png')});
    });
}
