const {test,expect,upload}=require('../../../../browser/fixtures.cjs');
for(const kind of ['blur','lostpointercapture','pointercancel','Escape','Undo'])test('held mouse drag reports actual cancellation cause '+kind,async({page},info)=>{
 await upload(page,'2\nreason\nH -1 0 0\nO 1 0 0\n','reason.xyz');await page.locator('[data-mode="edit"]').click();
 await page.getByRole('button',{name:'Reset View',exact:true}).click();await page.waitForFunction(()=>cameraController.phase==='idle');
 const p=await page.evaluate(()=>{const r=renderer.domElement.getBoundingClientRect();const p=atomMeshes[0].getWorldPosition(new THREE.Vector3()).project(camera);return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};});
 const before=await page.evaluate(()=>currentStructure.atoms[0].position.toArray());await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+40,p.y+30,{steps:5});
 expect(await page.evaluate(()=>isDragging)).toBe(true);
 if(kind==='Escape')await page.keyboard.press('Escape');else if(kind==='Undo')await page.keyboard.press('Control+z');else await page.evaluate(kind=>{if(kind==='blur')window.dispatchEvent(new Event('blur'));else renderer.domElement.dispatchEvent(new PointerEvent(kind,{pointerId:activeEditPointerId,pointerType:'mouse',buttons:1}));},kind);
 await page.mouse.up();
 const d=JSON.parse(await page.locator('#statusText').getAttribute('data-drag-cancellation'));
 expect(d.reason).toBe({blur:'app lost focus',lostpointercapture:'mouse tracking interrupted',pointercancel:'browser canceled pointer input',Escape:'Escape pressed',Undo:'Undo requested'}[kind]);
 expect(d.lastPointerEvent.type).toBe('pointermove');expect(d.lastPointerEvent.buttons).toBe(1);expect(d.hadMoved).toBe(true);
 await expect(page.locator('#statusText')).toContainText('Drag canceled ('+d.reason+');');
 expect(await page.evaluate(()=>currentStructure.atoms[0].position.toArray())).toEqual(before);expect(await page.evaluate(()=>editHistory.undoStack.length)).toBe(0);
 await page.screenshot({path:info.outputPath('reason.png')});await info.attach('cancellation',{body:JSON.stringify(d),contentType:'application/json'});
});
