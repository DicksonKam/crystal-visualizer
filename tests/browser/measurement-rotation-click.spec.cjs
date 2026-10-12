const {test,expect,upload}=require('./fixtures.cjs');
const {dragTarget}=require('./measurement-edit-helpers.cjs');
test('known issue: rotating over a measured atom must not deselect it',async({page},info)=>{
 test.fail(true,'Version 187 handles the click emitted after a camera drag as an atom selection.');
 await page.setViewportSize({width:900,height:800});
 await upload(page,'3\nwater\nO 0 0 .1173\nH .7572 0 -.4692\nH -.7572 0 -.4692\n','water.xyz');
 await page.locator('[data-mode="edit"]').click();
 await dragTarget(page,'atom',0);await page.mouse.up();
 await page.locator('[data-mode="measure"]').click();
 for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
 const before=await page.evaluate(()=>selectedAtoms.map(a=>a.index));
 await page.screenshot({path:info.outputPath('before-rotation.png')});
 const p=await page.evaluate(()=>{
  const r=renderer.domElement.getBoundingClientRect();camera.updateMatrixWorld(true);
  const world=atomMeshes[2].getWorldPosition(new THREE.Vector3()).project(camera);
  return {x:r.left+(world.x+1)*r.width/2,y:r.top+(1-world.y)*r.height/2,q:camera.quaternion.toArray()};
 });
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+12,p.y+8,{steps:5});await page.mouse.up();
 await page.screenshot({path:info.outputPath('after-rotation.png')});
 const after=await page.evaluate(()=>({selection:selectedAtoms.map(a=>a.index),q:camera.quaternion.toArray()}));
 await info.attach('rotation-selection',{body:JSON.stringify({before,after,initialQuaternion:p.q}),contentType:'application/json'});
 expect(after.q).not.toEqual(p.q);
 expect(after.selection).toEqual(before);
});
