const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises'),path=require('node:path');
test('crowded edit checkmarks and measurement numbers retain matching guide colors',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1280,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples/poscar/SrTiO3_perovskite.vasp'),'utf8'),'SrTiO3_perovskite.vasp');
 const source=await page.evaluate(()=>generatePOSCAR());
 await page.locator('[data-mode="edit"]').click();await page.locator('#atomJumpInput').fill('2');await page.locator('#atomJumpInput').press('Enter');await page.locator('#resetView').click();await page.waitForTimeout(300);
 const point=await page.evaluate(()=>{const r=renderer.domElement.getBoundingClientRect(),q=atomMeshes[0].getWorldPosition(new THREE.Vector3()).project(camera);return{x:r.left+(q.x+1)*r.width/2,y:r.top+(1-q.y)*r.height/2+35};});
 await page.keyboard.down('Shift');try{await page.mouse.click(point.x,point.y);}finally{await page.keyboard.up('Shift');}await page.waitForTimeout(250);
 expect(await page.evaluate(()=>selectedAtoms.map(a=>a.index))).toEqual([1,0]);
 const colors=()=>page.evaluate(()=>selectionRings.map((s,i)=>({index:i,color:s.userData.annotationLeader?.material.color.getHex(),visible:!!s.userData.annotationLeader?.visible})).filter(s=>s.visible));
 await expect.poll(async()=> (await colors()).length).toBe(2);
 const edit=await colors();expect(edit).toHaveLength(2);expect(edit.map(s=>s.color)).toEqual([0x00f5d4,0x00f5d4]);
 await page.screenshot({path:info.outputPath('edit-guides.png')});
 await page.locator('#clearSelectionBtn').click();await page.locator('[data-mode="measure"]').click();
 for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
 await page.locator('#resetView').click();await page.waitForTimeout(250);
 const measured=await colors();expect(measured.length).toBeGreaterThanOrEqual(2);
 for(const item of measured)expect(item.color).toBe([0x00f5d4,0xf15bb5,0xfee440][item.index]);
 expect(await page.evaluate(()=>generatePOSCAR())).toBe(source);
 await page.screenshot({path:info.outputPath('measurement-guides.png')});
});
