const {test,expect,upload}=require('./fixtures.cjs');
for(const interrupt of ['blur','capture-loss'])test('release UI refresh cannot roll back a committed mouse move: '+interrupt,async({page},info)=>{
 await upload(page,'2\ncommit race\nH -1 0 0\nO 1 0 0\n','race.xyz');await page.locator('[data-mode="edit"]').click();
 await page.getByRole('button',{name:'Reset View',exact:true}).click();await page.waitForFunction(()=>cameraController.phase==='idle');
 const p=await page.evaluate(()=>{const r=renderer.domElement.getBoundingClientRect();camera.updateWorldMatrix(true,false);structureGroup.updateWorldMatrix(true,true);const p=atomMeshes[0].getWorldPosition(new THREE.Vector3()).project(camera);return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};});
 const before=await page.evaluate(()=>currentStructure.atoms[0].position.toArray());
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+45,p.y+30,{steps:5});
 const preview=await page.evaluate(()=>currentStructure.atoms[0].position.toArray());expect(preview).not.toEqual(before);
 // Model a browser/host interruption emitted synchronously during release UI work.
 // This is deliberately injected; it does not prove native focus-loss ordering.
 await page.evaluate(interrupt=>{const original=updateEditUI;let fired=false;updateEditUI=function(){if(!fired){fired=true;if(interrupt==='blur')window.dispatchEvent(new Event('blur'));else renderer.domElement.dispatchEvent(new PointerEvent('lostpointercapture',{pointerId:activeEditPointerId??1,pointerType:'mouse',buttons:0}));}return original();};},interrupt);
 await page.mouse.up();
 await page.screenshot({path:info.outputPath('settled.png')});
 expect(await page.evaluate(()=>currentStructure.atoms[0].position.toArray())).toEqual(preview);
 expect(await page.evaluate(()=>editHistory.undoStack.at(-1).type)).toBe('move_atom');
 await expect(page.locator('#statusText')).toContainText('Moved atom');
 await page.locator('#undoBtn').click();expect(await page.evaluate(()=>currentStructure.atoms[0].position.toArray())).toEqual(before);
 await page.locator('#redoBtn').click();expect(await page.evaluate(()=>currentStructure.atoms[0].position.toArray())).toEqual(preview);
});
