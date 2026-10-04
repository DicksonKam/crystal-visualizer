const {test,expect,upload}=require('./fixtures.cjs');
const {capture}=require('../stress/edit-scenario.cjs');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
const fs=require('node:fs/promises');
const {createFormats}=require('../../formats.js');
const {cartesianToFractional}=require('../../geometry.js');
class Vector3 {constructor(x,y,z){Object.assign(this,{x,y,z});}clone(){return new Vector3(this.x,this.y,this.z);}}
const formats=createFormats(Vector3,cartesianToFractional);
async function observer(page,info,seed){const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});return createVisualObserver(page,directory,seed,1).observe;}
async function check(page){const s=await capture(page);expect(s.violations).toEqual([]);return s;}
const grouped='empty species cycles\n1\n10 0 0\n0 10 0\n0 0 10\nH H O\n1 1 1\nSelective dynamics\nCartesian\n2 2 5 T T T\n6 2 5 F F F\n4 6 5 T F T\n';
test('empty periodic documents retain duplicate species, constraints and editable refill through history branches',async({page},info)=>{
 test.setTimeout(150000);await upload(page,grouped,'duplicate-empty.poscar');await page.locator('[data-mode="edit"]').click();
 const observe=await observer(page,info,903);
 for(let cycle=0;cycle<4;cycle++){
  const before=await check(page);
  const points=await page.evaluate(()=>{
   cancelCameraAlignment();controls.staticMoving=true;camera.position.copy(controls.target).add(new THREE.Vector3(0,0,40));camera.up.set(0,1,0);
   camera.updateProjectionMatrix();controls.update();fitStructureToView(true);camera.updateWorldMatrix(true,false);structureGroup.updateWorldMatrix(true,true);updateCameraClipping();
   const rect=renderer.domElement.getBoundingClientRect();return atomMeshes.filter(m=>!m.userData.isGhost).map(m=>{const p=m.getWorldPosition(new THREE.Vector3()).project(camera);return {x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2};});
  });
  for(const p of points)await page.mouse.click(p.x,p.y);
  expect((await check(page)).selection.identities).toHaveLength(before.atomCount);
  await page.locator('#deleteSelectedBtn').click();expect((await check(page)).atomCount).toBe(0);
  if(cycle===0)await observe({step:0,action:'delete-all',stage:'settled'});
  await page.getByRole('button',{name:'Reset View',exact:true}).click();
  await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();
  expect((await check(page)).atomCount).toBe(0);
  await page.locator('#exportPoscar').click();await expect(page.locator('#statusText')).toContainText('Cannot export an empty structure');
  await page.locator('#addAtomElement').selectOption('H');
  await expect(page.locator('#addAtomSpecies')).toBeVisible();
  const ids=await page.locator('#addAtomSpecies option').evaluateAll(options=>options.map(o=>o.value));await page.locator('#addAtomSpecies').selectOption(ids.at(-1));
  for(const [id,v] of [['#addAtomX','.5'],['#addAtomY','.5'],['#addAtomZ','.5']])await page.locator(id).fill(v);
  await page.locator('#addAtomBtn').click();const refill=await check(page);expect(refill.atomCount).toBe(1);expect(refill.geometry.counts).toEqual([0,1,0]);
  if(cycle===0)await observe({step:1,action:'refill',stage:'settled'});
  await page.locator('#undoBtn').click();expect((await check(page)).atomCount).toBe(0);
  await page.locator('#undoBtn').click();expect((await check(page)).geometry).toEqual(before.geometry);
  await page.locator('#redoBtn').click();await page.locator('#redoBtn').click();expect((await check(page)).geometry).toEqual(refill.geometry);
  await page.locator('#undoBtn').click();await page.locator('#undoBtn').click();
  // The next loop deletes again, replacing the redo branch through real UI.
  await page.locator('#clearMeasurementBtn').count().then(async n=>{if(n&&await page.locator('#clearMeasurementBtn').isVisible())await page.locator('#clearMeasurementBtn').click();});
  if(await page.locator('#clearSelectionBtn').isVisible())await page.locator('#clearSelectionBtn').click();
 }
 await observe({step:2,action:'history',stage:'settled'});
});
function dense(){const points=[];for(let x=0;x<10;x++)for(let y=0;y<10;y++)for(let z=0;z<5;z++)points.push([x*2,y*2,z*2]);return `mixed dense\n1\n20 0 0\n0 20 0\n0 0 12\nAl O\n249 250\nSelective dynamics\nCartesian\n${points.slice(0,499).map((p,i)=>p.join(' ')+(i%3?' T T T':' F F F')).join('\n')}\n`;}
test('mixed-element instancing, periodic copies, supercells, constraints and export survive rebuild history',async({page},info)=>{
 test.setTimeout(180000);await upload(page,dense(),'mixed-499.poscar');const observe=await observer(page,info,904);
 await observe({step:0,action:'load',stage:'initial'});
 for(let cycle=0;cycle<2;cycle++){
  const before=await check(page);expect(before.atomCount).toBe(499);
  await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();
  await page.getByRole('button',{name:'Reset View',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>atomMeshes.length)).toBe(998);
  const batch=await page.evaluate(()=>structureGroup.children.filter(c=>c.userData.isAtomBatch).map(c=>c.count).sort((a,b)=>a-b));expect(batch).toEqual([249,249,250,250]);
  if(cycle===0)await observe({step:1,action:'periodic',stage:'settled'});
  await page.locator('[data-mode="edit"]').click();await page.locator('#makeSupercellBtn').click();
  const supercell=await check(page);expect(supercell.atomCount).toBe(998);expect(supercell.geometry.counts).toEqual([498,500]);
  expect(await page.evaluate(()=>atomMeshes.filter(m=>m.userData.isGhost).length)).toBe(0);
  expect(await page.evaluate(()=>structureGroup.children.filter(c=>c.userData.isAtomBatch).map(c=>c.count).sort((a,b)=>a-b))).toEqual([498,500]);
  if(cycle===0)await observe({step:2,action:'supercell',stage:'settled'});
  await page.locator('#fixZThreshold').fill('4');await page.locator('#fixByZBtn').click();expect((await check(page)).geometry.atoms.some(a=>a.sd.every(v=>!v))).toBe(true);
  await page.locator('#undoBtn').click();expect((await check(page)).geometry).toEqual(supercell.geometry);
  await page.locator('#undoBtn').click();expect((await check(page)).geometry).toEqual(before.geometry);
  await page.locator('#redoBtn').click();expect((await check(page)).geometry).toEqual(supercell.geometry);
  const pending=page.waitForEvent('download');await page.locator('#exportPoscar').click();const file=await pending;const content=await fs.readFile(await file.path(),'utf8');
  const exported=formats.parsePOSCAR(content);expect(exported.counts).toEqual([498,500]);
  const canonical=atoms=>atoms.map(a=>[a.element,a.position.x??a.position[0],a.position.y??a.position[1],a.position.z??a.position[2],a.selectiveDynamics??a.sd]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  expect(canonical(exported.atoms)).toEqual(canonical(supercell.geometry.atoms));
  await page.locator('#undoBtn').click();expect((await check(page)).geometry).toEqual(before.geometry);
  await page.getByRole('button',{name:'Decrease a periodic images',exact:true}).click();expect(await page.evaluate(()=>atomMeshes.length)).toBe(499);
  expect(await page.evaluate(()=>structureGroup.children.filter(c=>c.userData.isAtomBatch).length)).toBe(0);
 }
 await observe({step:3,action:'history',stage:'settled'});
});
