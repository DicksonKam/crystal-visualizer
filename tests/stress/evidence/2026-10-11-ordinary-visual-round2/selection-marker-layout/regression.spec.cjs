const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises');
const path=require('node:path');
test('ordinary rotated perovskite retains readable and selectable measurement point numbers',async({page},info)=>{
 test.setTimeout(120000);await page.setViewportSize({width:1280,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples/poscar/SrTiO3_perovskite.vasp'),'utf8'),'SrTiO3_perovskite.vasp');
 for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
 await page.locator('#resetView').click();await page.waitForTimeout(300);
 const source=await page.evaluate(()=>generatePOSCAR());
 const box=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
 for(let view=0;view<12;view++){
  const x=box.x+box.width*.85,y=box.y+box.height*.15;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+15,y+35,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
  const state=await page.evaluate(()=>{
   const r=renderer.domElement.getBoundingClientRect();
   const markers=selectionRings.map((sprite,i)=>{
    const world=sprite.getWorldPosition(new THREE.Vector3()),q=world.clone().project(camera),unit=getAnnotationWorldPerPixel(world,r.height);
    const x=r.left+(q.x+1)*r.width/2,y=r.top+(1-q.y)*r.height/2;
    const anchor=sprite.userData.annotationAnchor||sprite.position;
    const mesh=selectedAtoms[i].mesh;const leader=sprite.userData.annotationLeader;
    return{x,y,width:sprite.scale.x/unit,height:sprite.scale.y/unit,anchorError:anchor.distanceTo(mesh.getWorldPosition(new THREE.Vector3())),hit:getAtomIntersection({clientX:x,clientY:y})?.object===mesh,leaderStartError:leader?.visible?new THREE.Vector3().fromBufferAttribute(leader.geometry.attributes.position,0).distanceTo(anchor):0};
   });
   return{markers,source:generatePOSCAR(),distances:getMeasurementGeometry().distances};
  });
  expect(state.source).toBe(source);expect(state.markers).toHaveLength(3);
  for(const m of state.markers){expect(m.anchorError).toBeLessThan(1e-6);expect(m.leaderStartError).toBeLessThan(1e-5);expect(m.hit,'point number must select its owner').toBe(true);expect(m.height).toBeLessThanOrEqual(32.01);}
  for(let i=0;i<3;i++)for(let j=0;j<i;j++){
   const a=state.markers[i],b=state.markers[j];
   expect(Math.abs(a.x-b.x)>=(a.width+b.width)/2-1 || Math.abs(a.y-b.y)>=(a.height+b.height)/2-1,'point numbers overlap').toBe(true);
  }
  if([0,9,11].includes(view))await page.screenshot({path:info.outputPath(`view-${view}.png`)});
 }
 await page.locator('#clearSelectionBtn').click();
 expect(await page.evaluate(()=>measurementGroup.children.length)).toBe(0);
});
