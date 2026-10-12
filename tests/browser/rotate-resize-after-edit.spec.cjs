const {test, expect, upload}=require('./fixtures.cjs');
const {dragTarget,checkMeasurement}=require('./measurement-edit-helpers.cjs');
const fs=require('node:fs/promises'), path=require('node:path');
const cases=[['xyz/H2O.xyz',900],['xyz/benzene.xyz',1280],['poscar/NaCl_rocksalt.poscar',900],['poscar/graphene_sheet.poscar',1280]];
for(const [file,width] of cases) test(`visual rotate/resize after edits and measurements: ${file} at ${width}px`,async({page},info)=>{
 test.setTimeout(240000);
 await page.setViewportSize({width,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples',file),'utf8'),path.basename(file));
 await page.locator('#showLabels').check();
 const findings=[];
 const snapshot=async(name)=>{
  await page.screenshot({path:info.outputPath(name+'.png')});
  const view=await page.evaluate(()=>{
   camera.updateMatrixWorld(true);structureGroup.updateWorldMatrix(true,true);
   const atoms=atomMeshes.filter(m=>!m.userData.isGhost).map(m=>{
    const p=m.getWorldPosition(new THREE.Vector3()), depth=-p.clone().applyMatrix4(camera.matrixWorldInverse).z;
    return {index:m.userData.atomIndex,screen:p.project(camera).toArray(),depth,radius:m.scale.x};
   });
   return {near:camera.near,far:camera.far,zoom:camera.zoom,atoms,mode:currentMode,
    panel:document.querySelector('.sidebar').clientWidth,selected:selectedAtoms.map(a=>a.index)};
  });
  await info.attach(name,{body:JSON.stringify(view),contentType:'application/json'});
  expect(view.atoms.every(a=>a.depth-a.radius>=view.near-1e-6 && a.depth+a.radius<=view.far+1e-6)).toBe(true);
 };
 for(let cycle=0;cycle<4;cycle++){
  await page.locator('#sidebarDivider').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
  await page.locator('[data-mode="edit"]').click();
  await dragTarget(page,'atom',cycle);await snapshot(`${cycle}-held-atom`);await page.mouse.up();
  await expect(page.locator('#statusText')).toContainText('Moved atom');
  if(await page.locator('#clearSelectionBtn').count())await page.locator('#clearSelectionBtn').click();
  await page.locator('[data-mode="measure"]').click();
  if(cycle%2===0){
   for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
  } else {
   const points=await page.evaluate(()=>{
    camera.updateMatrixWorld(true);structureGroup.updateWorldMatrix(true,true);
    const r=renderer.domElement.getBoundingClientRect();
    return atomMeshes.filter(m=>!m.userData.isGhost).map(m=>{
     const p=m.getWorldPosition(new THREE.Vector3()).project(camera);
     const point={x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
     return Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&getAtomIntersection({clientX:point.x,clientY:point.y})?.object===m?point:null;
    }).filter(Boolean).slice(0,3);
   });
   expect(points).toHaveLength(3);
   for(const p of points)await page.mouse.click(p.x,p.y);
  }
  await checkMeasurement(page);await snapshot(`${cycle}-measured`);
  if(cycle%2)await page.locator('[data-mode="edit"]').click();
  // Restore ordinary damping after the deterministic atom-drag fixture.
  await page.evaluate(()=>{controls.staticMoving=false;controls.dynamicDampingFactor=.15;});
  for(let view=0;view<3;view++){
   const box=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
   const x=box.x+box.width*.75,y=box.y+box.height*.2;
   const selectionBefore=await page.evaluate(()=>selectedAtoms.map(a=>a.index));
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x+[45,-65,85][view],y+[30,45,-55][view],{steps:8});await page.mouse.up();
   await page.waitForTimeout(120);await snapshot(`${cycle}-rotation-${view}`);
   const selectionAfter=await page.evaluate(()=>selectedAtoms.map(a=>a.index));
   if(JSON.stringify(selectionBefore)!==JSON.stringify(selectionAfter)){
    findings.push({cycle,view,type:'rotation changed selection',selectionBefore,selectionAfter,mode:await page.evaluate(()=>currentMode)});
    if(await page.locator('#clearSelectionBtn').count())await page.locator('#clearSelectionBtn').click();
    await page.locator('[data-mode="measure"]').click();
    for(const n of selectionBefore){await page.locator('#atomJumpInput').fill(String(n+1));await page.locator('#atomJumpInput').press('Enter');}
    if(cycle%2)await page.locator('[data-mode="edit"]').click();
   }
   await checkMeasurement(page);
  }
  const divider=await page.locator('#sidebarDivider').boundingBox();
  const target=[width*.5,0,width*.3,220][cycle];
  await page.mouse.move(divider.x+divider.width/2,divider.y+divider.height/2);await page.mouse.down();
  await page.mouse.move(target,divider.y+divider.height/2,{steps:18});await snapshot(`${cycle}-held-resize`);
  await page.mouse.up();await checkMeasurement(page);await snapshot(`${cycle}-resized`);
  await page.locator('#undoBtn').click();await page.locator('#redoBtn').click();
  await checkMeasurement(page);await snapshot(`${cycle}-undo-redo`);
 }
 await fs.writeFile(info.outputPath('findings.json'),JSON.stringify(findings,null,2));
});
