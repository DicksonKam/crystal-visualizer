const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises'),path=require('node:path');
// Point markers sit on their atoms even when the view stacks atoms together;
// nothing is moved aside or tied to a leader line.
test('crowded edit checkmarks and measurement numbers stay on their atoms without guides',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1280,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples/poscar/SrTiO3_perovskite.vasp'),'utf8'),'SrTiO3_perovskite.vasp');
 const source=await page.evaluate(()=>generatePOSCAR());
 const crowd=async()=>{
  await page.evaluate(()=>{cameraController.setPose(cameraMath.fit(getStructureBounds(),cameraMath.orientation([1,.8,1],[0,1,0]),perspectiveCamera.aspect),'fit');clearManualCameraMotion();requestRender();});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForTimeout(250);
 };
 const markers=()=>page.evaluate(()=>selectionRings.map((s,i)=>({index:i,color:s.userData.annotationColor,
  offset:s.getWorldPosition(new THREE.Vector3()).distanceTo(selectedAtoms[i].mesh.getWorldPosition(new THREE.Vector3())),
  leaders:measurementGroup.children.filter(o=>o.userData.isAnnotationLeader&&o.visible).length})));
 await page.locator('[data-mode="edit"]').click();await page.locator('#atomJumpInput').fill('2');await page.locator('#atomJumpInput').press('Enter');await crowd();
 // Along the body diagonal several atoms stack; shift-click a real atom whose centre is actually the nearest hit.
 const point=await page.evaluate(()=>{const r=renderer.domElement.getBoundingClientRect();
  for(const mesh of atomMeshes.filter(m=>!m.userData.isGhost&&m.userData.atomIndex!==1)){const q=mesh.getWorldPosition(new THREE.Vector3()).project(camera);const p={x:r.left+(q.x+1)*r.width/2,y:r.top+(1-q.y)*r.height/2};
   if(getAtomIntersection({clientX:p.x,clientY:p.y})?.object===mesh)return{...p,index:mesh.userData.atomIndex};}
  throw Error('No exposed atom');});
 await page.keyboard.down('Shift');try{await page.mouse.click(point.x,point.y);}finally{await page.keyboard.up('Shift');}await page.waitForTimeout(250);
 expect(await page.evaluate(()=>selectedAtoms.map(a=>a.index))).toEqual([1,point.index]);
 const edit=await markers();expect(edit).toHaveLength(2);
 for(const m of edit){expect(m.offset).toBeLessThan(1e-6);expect(m.leaders).toBe(0);expect(m.color).toBe(0x00f5d4);}
 await page.screenshot({path:info.outputPath('edit-markers.png')});
 await page.locator('#clearSelectionBtn').click();await page.locator('[data-mode="measure"]').click();
 for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
 await page.locator('#resetView').click();await crowd();
 const measured=await markers();expect(measured).toHaveLength(3);
 for(const m of measured){expect(m.offset).toBeLessThan(1e-6);expect(m.leaders).toBe(0);expect(m.color).toBe([0x00f5d4,0xf15bb5,0xfee440][m.index]);}
 expect(await page.evaluate(()=>generatePOSCAR())).toBe(source);
 await page.screenshot({path:info.outputPath('measurement-markers.png')});
});
