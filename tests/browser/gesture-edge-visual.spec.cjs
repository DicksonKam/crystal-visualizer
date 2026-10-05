const {test,expect,upload}=require('./fixtures.cjs');
const {capture}=require('../stress/edit-scenario.cjs');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
const fs=require('node:fs/promises');
const cells={cubic:[[10,0,0],[0,10,0],[0,0,10]],tilted:[[9,2,1],[1,11,2],[2,1,8]]};
const source=lattice=>`gesture edges\n1\n${lattice.map(v=>v.join(' ')).join('\n')}\nH O\n2 1\nSelective dynamics\nDirect\n0 .3 0 T T T\n.6 .6 0 T T T\n.3 .3 .3 T T T\n`;
async function prepare(page,kind){
 await page.waitForFunction(()=>{const r=renderer.domElement.getBoundingClientRect();return r.width===viewport.clientWidth&&r.height===viewport.clientHeight;});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return page.evaluate(kind=>{
    cancelCameraAlignment();controls.staticMoving=true;
    const axis=getLatticeVector(currentStructure.lattice,2).normalize();
    camera.position.copy(controls.target).addScaledVector(axis,40);camera.up.set(0,1,0);camera.zoom=.8;
    camera.updateProjectionMatrix();controls.update();camera.updateWorldMatrix(true,false);
    fitStructureToView(true);camera.updateWorldMatrix(true,false);
    structureGroup.updateWorldMatrix(true,true);updateCameraClipping();updateVacuumHandles();requestRender();
    const rect=renderer.domElement.getBoundingClientRect();
    const screen=world=>{const p=world.clone().project(camera);return {x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2};};
    if(kind==='atom'){
        const mesh=atomMeshes[0],point=screen(mesh.getWorldPosition(new THREE.Vector3()));
        if(getAtomIntersection({clientX:point.x,clientY:point.y})?.object!==mesh)throw Error('Fixture atom is obscured');
        const world=mesh.getWorldPosition(new THREE.Vector3());
        const normal=new THREE.Vector3();camera.getWorldDirection(normal);
        const section=CrystalGeometry.cellPlaneSection(currentStructure.lattice,currentStructure.atoms[0].position,normal);
        const target=new THREE.Vector3();section.forEach(p=>target.add(new THREE.Vector3(...p)));target.divideScalar(section.length).add(structureGroup.position);
        const end=screen(target);
        if(point.x<rect.left||point.x>rect.right||point.y<rect.top||point.y>rect.bottom)throw Error('Fixture target outside viewport');
        return {...point,dx:end.x-point.x,dy:end.y-point.y};
    }
    for(const h of vacuumDragState.handles.filter(h=>h.userData.extendAxis==='a'&&h.userData.handleType==='far')){
        const point=screen(h.getWorldPosition(new THREE.Vector3()));
        if(!getAtomIntersection({clientX:point.x,clientY:point.y}))return {...point,dx:30,dy:0};
    }
    throw Error('No unobscured fixture frame edge');
},kind);}
async function idle(page){expect(await page.evaluate(()=>({atom:draggedAtom,cell:vacuumDragState.isDragging,pointer:activeEditPointerId,enabled:controls.enabled,guide:!!dragGuidePlane}))).toEqual({atom:null,cell:false,pointer:null,enabled:true,guide:false});}
for(const [cell,lattice] of Object.entries(cells))for(const kind of ['atom','cell'])for(const interruption of ['escape','resize-escape','panel-escape','blur-event','release-outside','capture-loss-release']){
 test(`${cell} ${kind}: ${interruption} preserves measurement and the next gesture`,async({page},info)=>{
    test.setTimeout(150000);await page.setViewportSize({width:900,height:760});await upload(page,source(lattice),'gesture.poscar');
    for(const n of [1,2]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
    await page.locator('[data-mode="edit"]').click();
    const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});const {observe}=createVisualObserver(page,directory,901,1);
    for(let cycle=0;cycle<3;cycle++){
        await page.setViewportSize({width:900,height:760});
        if(interruption==='panel-escape'){
            await page.locator('#sidebarDivider').focus();await page.keyboard.press('End');
            expect(Number(await page.locator('#sidebarDivider').getAttribute('aria-valuenow'))).toBeGreaterThan(0);
        }
        const point=await prepare(page,kind);const before=await capture(page);
        await page.mouse.move(point.x,point.y);await page.mouse.down();
        expect(await page.evaluate(kind=>kind==='atom'?!!draggedAtom:vacuumDragState.isDragging,kind)).toBe(true);
        await page.mouse.move(point.x+point.dx,point.y+point.dy,{steps:4});
        if(cycle===0)await observe({step:cycle*10,action:kind,stage:'preview'});
        if(interruption==='escape')await page.keyboard.press('Escape');
        else if(interruption==='resize-escape'){
            await page.setViewportSize({width:390,height:844});
            if(cycle===0)await observe({step:cycle*10+1,action:'viewport',stage:'preview'});
            await page.keyboard.press('Escape');
        }else if(interruption==='panel-escape'){
            await page.locator('#sidebarDivider').focus();await page.keyboard.press('Home');
            await expect(page.locator('#sidebarDivider')).toHaveAttribute('aria-valuenow','0');
            if(cycle===0)await observe({step:cycle*10+1,action:'panel-collapse',stage:'preview'});
            await page.keyboard.press('Escape');
        }else if(interruption==='blur-event'){
            // Headless tab activation does not emit native window blur. Exercise
            // the browser event adapter explicitly; real focus loss is unproven.
            await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
        }else {
            if(interruption==='capture-loss-release'){
                await page.evaluate(()=>renderer.domElement.releasePointerCapture(activeEditPointerId));
            }
            await page.mouse.move(450,20,{steps:4});
            if(interruption==='capture-loss-release'){
                expect(await page.evaluate(kind=>kind==='atom'?!!draggedAtom:vacuumDragState.isDragging,kind)).toBe(true);
                // A constrained corner may be the nearest point to the header.
                // Return to the known changed preview so release must commit.
                await page.mouse.move(point.x+point.dx,point.y+point.dy,{steps:4});
                expect((await capture(page)).geometry).not.toEqual(before.geometry);
            }
        }
        await page.mouse.up();await idle(page);const after=await capture(page);expect(after.violations).toEqual([]);
        if(interruption==='release-outside'||interruption==='capture-loss-release'){
            const changed=after.undo.length!==before.undo.length;
            if(interruption==='capture-loss-release')expect(changed).toBe(true);
            if(changed){expect(after.undo.at(-1).type).toBe(kind==='atom'?'move_atom':'vacuum_drag');await page.locator('#undoBtn').click();}
            else expect(after.geometry).toEqual(before.geometry);
        }else expect(after.undo).toEqual(before.undo);
        expect((await capture(page)).geometry).toEqual(before.geometry);
        expect((await capture(page)).selection).toEqual(before.selection);
        if(cycle===0)await observe({step:cycle*10+2,action:interruption,stage:'settled'});
        // The first gesture after cancellation/commit must work without a reset.
        const next=await prepare(page,kind);const nextBefore=await capture(page);await page.mouse.move(next.x,next.y);await page.mouse.down();
        expect(await page.evaluate(kind=>kind==='atom'?!!draggedAtom:vacuumDragState.isDragging,kind)).toBe(true);
        await page.mouse.move(next.x+next.dx,next.y+next.dy,{steps:4});await page.mouse.up();await idle(page);
        const nextAfter=await capture(page);expect(nextAfter.violations).toEqual([]);
        expect(nextAfter.undo).toHaveLength(nextBefore.undo.length+1);
        expect(nextAfter.undo.at(-1).type).toBe(kind==='atom'?'move_atom':'vacuum_drag');
        expect(nextAfter.geometry).not.toEqual(nextBefore.geometry);
        await page.locator('#undoBtn').click();expect((await capture(page)).geometry).toEqual(before.geometry);
    }
    await info.attach('coverage',{body:JSON.stringify({cell,kind,interruption,cycles:3,realPointer:true}),contentType:'application/json'});
 });
}
