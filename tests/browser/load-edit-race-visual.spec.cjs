const {test,expect,upload}=require('./fixtures.cjs');
const {capture}=require('../stress/edit-scenario.cjs');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
const fs=require('node:fs/promises');
const original='3\nloading during edits\nC -2 -1 0\nH 2 -1 0\nO 0 2 0\n';
const incoming='2\nincoming molecule\nNa -1 0 0\nCl 1 0 0\n';
const example='examples/xyz/H2O.xyz';
async function beginDelayed(page){
 let arrived;const request=new Promise(resolve=>arrived=resolve);let release;const gate=new Promise(resolve=>release=resolve);
 await page.route('**/'+example,async route=>{arrived();const response=await gate;await route.fulfill(response);});
 await page.locator('#examplesBtn').click();await page.locator(`[data-example-path="${example}"]`).click();await request;
 await page.locator('#closeDropZone').click();
 return response=>release(response);
}
async function atomPoint(page){return page.evaluate(()=>{
 camera.updateWorldMatrix(true,false);structureGroup.updateWorldMatrix(true,true);const rect=renderer.domElement.getBoundingClientRect();
 for(const mesh of atomMeshes.filter(m=>!m.userData.isGhost)){
  const p=mesh.getWorldPosition(new THREE.Vector3()).project(camera),x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;
  if(x<rect.left+20||x>rect.right-20||y<rect.top+20||y>rect.bottom-20)continue;
  if(getAtomIntersection({clientX:x,clientY:y})?.object===mesh)return {x,y,index:mesh.userData.atomIndex};
 }
 throw Error('No visible fixture atom');
});}
for(const outcome of ['decline','accept','404','malformed','superseded'])test(`delayed example ${outcome} during a live atom move preserves the right document and visuals`,async({page},info)=>{
 test.setTimeout(90000);await upload(page,original,'original.xyz');
 await page.locator('#atomJumpInput').fill('1');await page.locator('#atomJumpInput').press('Enter');
 await page.locator('[data-mode="edit"]').click();await page.getByRole('button',{name:'Reset View',exact:true}).click();
 await page.waitForFunction(()=>cameraController.phase==='idle');
 const before=await capture(page);const release=await beginDelayed(page);
 const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});const {observe}=createVisualObserver(page,directory,902,1);
 const point=await atomPoint(page);await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+30,point.y+20,{steps:5});
 expect(await page.evaluate(()=>isDragging)).toBe(true);await observe({step:0,action:'drag',stage:'preview'});
 let dialogCount=0;page.on('dialog',async dialog=>{dialogCount++;if(outcome==='decline')await dialog.dismiss();else await dialog.accept();});
 if(outcome==='superseded'){
  await page.locator('#fileInput').setInputFiles({name:'newer.xyz',mimeType:'text/plain',buffer:Buffer.from(incoming)});
  await expect(page.locator('#statusText')).toContainText('Loaded XYZ: newer.xyz');
  const staleResponse=page.waitForResponse(response=>response.url().endsWith(example));
  release({status:200,contentType:'text/plain',body:original});
  await (await staleResponse).finished();
  // Wait on completion of the real stale request, not a timing-only assertion.
  await expect.poll(()=>page.evaluate(()=>currentFilename)).toBe('newer.xyz');
 }else{
  release({status:outcome==='404'?404:200,contentType:'text/plain',body:outcome==='malformed'?'1\nbroken\nH nope 0 0\n':incoming});
  await expect(page.locator('#statusText')).toContainText(outcome==='decline'?'Kept the current':outcome==='accept'?'Loaded XYZ: H2O.xyz':'Could not load');
 }
 await page.mouse.up();const after=await capture(page);expect(after.violations).toEqual([]);
 if(outcome==='accept'||outcome==='superseded'){
  expect(after.geometry.atoms.map(a=>a.element)).toEqual(['Na','Cl']);expect(after.undo).toEqual([]);expect(after.selection.identities).toEqual([]);
 }else{
  expect(after.undo.at(-1).type).toBe('move_atom');await page.locator('#undoBtn').click();expect((await capture(page)).geometry).toEqual(before.geometry);
  expect((await capture(page)).selection).toEqual(before.selection);
 }
 expect(await page.evaluate(()=>({drag:draggedAtom,pointer:activeEditPointerId,enabled:controls.enabled,guide:!!dragGuidePlane}))).toEqual({drag:null,pointer:null,enabled:true,guide:false});
 expect(dialogCount).toBe(['decline','accept','superseded'].includes(outcome)?1:0);
 await observe({step:1,action:outcome,stage:'settled'});
});
