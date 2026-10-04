const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../../examples/poscar/Al_fcc_cartesian.poscar'),'utf8');
for (const size of [{width:1440,height:900},{width:900,height:760}]) {
    test(`visual boundary editing with changing panel width at ${size.width}px`, async ({page},testInfo) => {
        test.setTimeout(180000);
        await page.setViewportSize(size); await upload(page,source,'Al_fcc_cartesian.poscar');
        await page.locator('[data-mode="edit"]').click();
        await page.evaluate(() => {
            cancelCameraAlignment(); controls.staticMoving=true;
            camera.position.copy(controls.target).add(new THREE.Vector3(25,0,0));
            camera.up.set(0,1,0); camera.zoom=.8; camera.updateProjectionMatrix();
            controls.update(); camera.updateMatrixWorld(true); updateCameraClipping(); updateVacuumHandles(); requestRender();
        });
        const initial=await page.evaluate(()=>currentStructure.atoms.map(a=>a.position.toArray()));
        const screenshot=async name=>{await page.evaluate(()=>{requestRender(); return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.screenshot({path:testInfo.outputPath(name+'.png')});};
        await screenshot('initial');
        for (let cycle=0;cycle<16;cycle++) {
            const box=await page.locator('#sidebarDivider').boundingBox();
            await page.mouse.move(box.x+5,box.y+box.height/2); await page.mouse.down();
            const widths=[0,260,420,320]; const target=Math.min(widths[cycle%4],size.width*.45);
            await page.mouse.move(target,box.y+box.height/2,{steps:5}); await page.mouse.up();
            await expect.poll(()=>page.evaluate(()=>Math.abs(renderer.domElement.getBoundingClientRect().width-viewport.clientWidth)<1)).toBe(true);
            const points=await page.evaluate(cycle=>{
                const rect=renderer.domElement.getBoundingClientRect();
                camera.updateMatrixWorld(true); structureGroup.updateMatrixWorld(true);
                const screen=world=>{const p=world.clone().project(camera);return {x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2};};
                const anchor=atomMeshes[0].getWorldPosition(new THREE.Vector3());
                return {start:screen(anchor),end:screen(anchor.clone().add(new THREE.Vector3(0,.5+(cycle%3)*.2,.6)))};
            },cycle);
            await page.mouse.move(points.start.x,points.start.y); await page.mouse.down();
            expect(await page.evaluate(()=>draggedAtom?.index)).toBe(0);
            await page.mouse.move(points.end.x,points.end.y,{steps:5});
            if(cycle===0||cycle===7)await screenshot('atom-preview-'+cycle);
            await page.mouse.up();
            const edge=await page.evaluate(()=>{
                const handle=vacuumDragState.handles.find(h=>h.userData.extendAxis==='b'&&h.userData.handleType==='far');
                const rect=renderer.domElement.getBoundingClientRect();
                const p=handle.getWorldPosition(new THREE.Vector3()).project(camera);
                const d=getScreenSpaceDirection(getLatticeVector(currentStructure.lattice,1));
                return {x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2,dx:d.x*24,dy:-d.y*24};
            });
            await page.mouse.move(edge.x,edge.y); await page.mouse.down();
            expect(await page.evaluate(()=>vacuumDragState.isDragging)).toBe(true);
            await page.mouse.move(edge.x+edge.dx,edge.y+edge.dy,{steps:4});
            if(cycle===0||cycle===7)await screenshot('frame-preview-'+cycle);
            await page.mouse.up();
            expect(await page.evaluate(()=>editHistory.undoStack.at(-1).type)).toBe('vacuum_drag');
            // Document keyboard shortcuts remain available with the panel collapsed.
            await page.locator('#sidebarDivider').focus();
            await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');
            const restored=await page.evaluate(()=>currentStructure.atoms.map(a=>a.position.toArray()));
            restored.forEach((xyz,i)=>xyz.forEach((v,j)=>expect(v).toBeCloseTo(initial[i][j],7)));
            await page.keyboard.press('Control+Shift+z'); await page.keyboard.press('Control+Shift+z');
            await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');
            // Verify visible bond geometry is freshly regenerated, not accumulated.
            expect(await page.evaluate(()=>{
                const before=structureGroup.children.filter(c=>c.userData.isBond||c.userData.isGhostBond).length;
                rebuildBonds(); return structureGroup.children.filter(c=>c.userData.isBond||c.userData.isGhostBond).length===before;
            })).toBe(true);
        }
        await screenshot('final');
        const canvasBox=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
        await page.mouse.move(canvasBox.x+15,canvasBox.y+15); await page.mouse.down();
        await page.mouse.move(canvasBox.x+80,canvasBox.y+40,{steps:6}); await page.mouse.up();
        await screenshot('rotated');
        await testInfo.attach('coverage',{body:JSON.stringify({viewport:size,cycles:16,actionsPerCycle:['panel drag','atom drag','first frame drag','undo twice','redo twice','undo twice'],screenshots:7}),contentType:'application/json'});
    });
}
