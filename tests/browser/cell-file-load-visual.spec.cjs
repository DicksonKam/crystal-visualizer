const {test,expect,upload}=require('./fixtures.cjs');
const {capture,sourceFor}=require('../stress/edit-scenario.cjs');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
const fs=require('node:fs/promises');

async function framePoint(page){
    await page.waitForFunction(()=>renderer.domElement.clientWidth===viewport.clientWidth && renderer.domElement.clientHeight===viewport.clientHeight);
    return page.evaluate(()=>{
        cancelCameraAlignment();controls.staticMoving=true;
        camera.position.copy(controls.target).addScaledVector(getLatticeVector(currentStructure.lattice,2).normalize(),40);
        camera.up.set(0,1,0);camera.updateProjectionMatrix();controls.update();camera.updateWorldMatrix(true,false);
        fitStructureToView(true);camera.updateWorldMatrix(true,false);structureGroup.updateWorldMatrix(true,true);
        updateCameraClipping();updateVacuumHandles();requestRender();
        const r=renderer.domElement.getBoundingClientRect();
        for(const handle of vacuumDragState.handles.filter(h=>h.userData.extendAxis==='a' && h.userData.handleType==='far')){
            // Boundary atoms and their periodic copies can cover the middle of an edge; find an exposed section.
            for(const fraction of [.5,.25,.75,.125,.875,.375,.625]){
                const world=handle.userData.edgeStart.clone().lerp(handle.userData.edgeEnd,fraction);
                if(handle.parent)handle.parent.localToWorld(world);
                const p=world.project(camera);
                const point={x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
                const hit=checkVacuumHandleIntersection({clientX:point.x,clientY:point.y});
                if(hit?.extendAxis==='a' && hit.handleType==='far')return point;
            }
        }
        throw Error('No unobscured frame handle');
    });
}
async function dragFrame(page){
    const point=await framePoint(page);
    await page.mouse.move(point.x,point.y);await page.mouse.down();
    expect(await page.evaluate(()=>vacuumDragState.isDragging)).toBe(true);
    await page.mouse.move(point.x+24,point.y,{steps:4});
}
for(const outcome of ['accept','decline','invalid'])for(const resize of [false,true]){
    test(`local ${outcome} load during cell drag${resize?' after portrait resize':''} preserves geometry and the next frame drag`,async({page},info)=>{
        test.setTimeout(120000);await page.setViewportSize({width:900,height:760});
        await upload(page,sourceFor(1).content,'original.poscar');
        for(const n of [1,2]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
        await page.locator('[data-mode="edit"]').click();
        const before=await capture(page);await dragFrame(page);
        expect((await capture(page)).geometry).not.toEqual(before.geometry);
        const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});
        const {observe}=createVisualObserver(page,directory,3300,1);
        await observe({step:0,action:'cell',stage:'preview'});
        if(resize)await page.setViewportSize({width:390,height:844});
        let dialogs=0;page.on('dialog',async dialog=>{dialogs++;if(outcome==='decline')await dialog.dismiss();else await dialog.accept();});
        const replacement=outcome==='invalid'?'2\nbad\nH invalid 0 0\nH 0 0 0\n':sourceFor(2).content;
        await page.locator('#fileInput').setInputFiles({name:outcome==='invalid'?'bad.xyz':'replacement.poscar',mimeType:'text/plain',buffer:Buffer.from(replacement)});
        await expect(page.locator('#statusText')).toContainText(outcome==='invalid'?'Error: Invalid XYZ coordinates':outcome==='decline'?'Kept the current':'Loaded: replacement.poscar');
        await page.mouse.up();
        const settled=await capture(page);expect(settled.violations).toEqual([]);
        if(outcome==='accept'){
            expect(settled.geometry.lattice).toEqual([[8,1,.5],[2,9,1],[1,2,10]]);
            expect(settled.undo).toEqual([]);expect(settled.redo).toEqual([]);expect(settled.dirty).toBe(false);
            expect(settled.selection.identities).toEqual([]);
        }else{
            expect(settled.undo.at(-1).type).toBe('vacuum_drag');
            await page.locator('#undoBtn').click();
            expect((await capture(page)).geometry).toEqual(before.geometry);
            expect((await capture(page)).selection).toEqual(before.selection);
        }
        expect(dialogs).toBe(outcome==='invalid'?0:1);
        expect(await page.evaluate(()=>({pointer:activeEditPointerId,cell:vacuumDragState.isDragging,enabled:controls.enabled}))).toEqual({pointer:null,cell:false,enabled:true});
        await observe({step:1,action:outcome,stage:'settled'});
        const nextBefore=await capture(page);await dragFrame(page);await page.mouse.up();
        const next=await capture(page);expect(next.violations).toEqual([]);
        expect(next.undo).toHaveLength(nextBefore.undo.length+1);expect(next.undo.at(-1).type).toBe('vacuum_drag');
        await observe({step:2,action:'first-next-frame-drag',stage:'settled'});
        await page.locator('#undoBtn').click();expect((await capture(page)).geometry).toEqual(nextBefore.geometry);
    });
}
