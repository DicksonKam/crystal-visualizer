const { test, expect, upload } = require('./fixtures.cjs');
const { createVisualObserver } = require('../stress/visual-observer.cjs');
const fs = require('node:fs/promises');
const points=[];
for(let x=0;x<10;x++)for(let y=0;y<10;y++)for(let z=0;z<6;z++)points.push([x*2,y*2,z*2]);
const fixture=`dense edit\n1\n20 0 0\n0 20 0\n0 0 12\nAl\n501\nSelective dynamics\nCartesian\n${points.slice(0,501).map(p=>p.join(' ')+' T T T').join('\n')}\n`;
async function rendererState(page, count) {
    const state=await page.evaluate(()=>({count:currentStructure.atoms.length,displayed:displayedAtomCount,
        batches:structureGroup.children.filter(c=>c.userData.isAtomBatch).length,
        instances:atomMeshes.filter(m=>m.userData.atomInstance).length,
        stale:atomMeshes.some(m=>m.userData.atomInstance && m.userData.atomInstance.batch.parent!==structureGroup)}));
    expect(state).toEqual({count,displayed:count,batches:count>500?1:0,instances:count>500?count:0,stale:false});
}
async function visibleAtom(page) {
    return page.evaluate(()=>{
        camera.updateWorldMatrix(true,false);structureGroup.updateWorldMatrix(true,true);
        const rect=renderer.domElement.getBoundingClientRect();
        for(const mesh of atomMeshes){
            const p=mesh.getWorldPosition(new THREE.Vector3()).project(camera);
            const x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;
            if(p.z < -1 || p.z > 1 || x<rect.left+15||x>rect.right-15||y<rect.top+15||y>rect.bottom-15)continue;
            const hit=getAtomIntersection({clientX:x,clientY:y});
            if(hit?.object===mesh)return {x,y,index:mesh.userData.atomIndex};
        }
        return null;
    });
}
test('dense atom/bond rendering survives movement cancellation, 501/500 transitions and cell resizing',async({page},testInfo)=>{
    test.setTimeout(180000); await upload(page,fixture,'dense-501.poscar');
    await page.locator('[data-mode="edit"]').click();
    const directory=testInfo.outputPath('visual');await fs.mkdir(directory,{recursive:true});
    const {observe}=createVisualObserver(page,directory,501,1);
    const snap=async(step,action,stage='after')=>observe({step,action,stage});
    await rendererState(page,501);await snap(0,'load','initial');
    let atom=await visibleAtom(page);expect(atom).not.toBeNull();
    const before=await page.evaluate(index=>currentStructure.atoms[index].position.toArray(),atom.index);
    await page.mouse.move(atom.x,atom.y);await page.mouse.down();
    expect(await page.evaluate(()=>draggedAtom?.index)).toBe(atom.index);
    await page.mouse.move(atom.x+24,atom.y-18,{steps:5});await snap(1,'cancel','atom-preview');
    await page.keyboard.press('Escape');await page.mouse.up();
    const canceled=await page.evaluate(index=>currentStructure.atoms[index].position.toArray(),atom.index);
    canceled.forEach((v,i)=>expect(v).toBeCloseTo(before[i],8));await snap(2,'cancel');
    await page.mouse.move(atom.x,atom.y);await page.mouse.down();await page.mouse.move(atom.x+24,atom.y-18,{steps:5});
    await snap(3,'drag','atom-preview');await page.mouse.up();
    expect(await page.evaluate(()=>editHistory.undoStack.at(-1).type)).toBe('move_atom');
    await page.locator('#undoBtn').click();await snap(4,'undo');
    atom=await visibleAtom(page);await page.mouse.click(atom.x,atom.y);
    await page.locator('#deleteSelectedBtn').click();await rendererState(page,500);await snap(5,'delete');
    await page.locator('#undoBtn').click();await rendererState(page,501);await snap(6,'undo');
    await page.locator('#redoBtn').click();await rendererState(page,500);await snap(7,'redo');
    const deleted=await page.evaluate(()=>currentStructure.atoms.map(a=>a.position.toArray()));
    await page.locator('#addAtomElement').selectOption('Al');
    for(const [id,value] of [['#addAtomX','.95'],['#addAtomY','.95'],['#addAtomZ','.95']])await page.locator(id).fill(value);
    await page.locator('#addAtomBtn').click();await rendererState(page,501);await snap(8,'add');
    await page.locator('#undoBtn').click();await rendererState(page,500);
    expect(await page.evaluate(()=>currentStructure.atoms.map(a=>a.position.toArray()))).toEqual(deleted);
    await page.locator('#redoBtn').click();await rendererState(page,501);await snap(9,'redo');
    // Prepare an axis view; the resize itself is a real first pointer gesture.
    const edge=await page.evaluate(()=>{
        cancelCameraAlignment();controls.staticMoving=true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0,0,60));camera.up.set(0,1,0);
        camera.zoom=.5;camera.updateProjectionMatrix();controls.update();camera.updateMatrixWorld(true);
        updateCameraClipping();updateVacuumHandles();requestRender();
        const rect=renderer.domElement.getBoundingClientRect();
        for(const h of vacuumDragState.handles.filter(h=>h.userData.extendAxis==='a'&&h.userData.handleType==='far')){
            const p=h.getWorldPosition(new THREE.Vector3()).project(camera);
            const x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;
            if(!getAtomIntersection({clientX:x,clientY:y}))return {x,y};
        }
        return null;
    });
    expect(edge).not.toBeNull();const lattice=await page.evaluate(()=>currentStructure.lattice);
    await page.mouse.move(edge.x,edge.y);await page.mouse.down();expect(await page.evaluate(()=>vacuumDragState.isDragging)).toBe(true);
    await page.mouse.move(edge.x+30,edge.y,{steps:4});await snap(10,'resize','cell-preview');await page.mouse.up();
    await rendererState(page,501);await page.locator('#undoBtn').click();
    expect(await page.evaluate(()=>currentStructure.lattice)).toEqual(lattice);await snap(11,'undo');
    await page.locator('#redoBtn').click();await rendererState(page,501);await snap(12,'redo');
    await testInfo.attach('dense-coverage',{body:JSON.stringify({initialAtoms:501,transitions:[501,500,501,500,501,500,501],captures:13}),contentType:'application/json'});
});
