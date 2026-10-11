const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises');
const path=require('node:path');
for(const width of [1280,900])test(`precise atom coordinates stay readable while resizing the sidebar at ${width}px`,async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples/xyz/H2O.xyz'),'utf8'),'H2O.xyz');
 await page.locator('[data-mode="edit"]').click();await page.waitForTimeout(300);
 const point=await page.evaluate(()=>{const r=renderer.domElement.getBoundingClientRect(),p=atomMeshes[0].getWorldPosition(new THREE.Vector3()).project(camera);return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};});
 await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+37,point.y-22,{steps:6});await page.mouse.up();
 await page.locator('#atomJumpInput').fill('1');await page.locator('#atomJumpInput').press('Enter');
 const values=await page.locator('.exact-atom-section input').evaluateAll(inputs=>inputs.map(o=>o.value));
 expect(values.some(v=>v.length>9)).toBe(true);
 for(const [name,keys] of [['default',[]],['narrow',Array(3).fill('ArrowLeft')],['wide',Array(15).fill('ArrowRight')]]){
  await page.locator('#sidebarDivider').focus();for(const key of keys)await page.keyboard.press(key);
  await page.locator('#editAtomCoordMode').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath(name+'.png')});
  const metrics=await page.locator('.exact-atom-section input').evaluateAll(inputs=>inputs.map(o=>{const s=getComputedStyle(o),c=document.createElement('canvas').getContext('2d');c.font=s.font;return{value:o.value,available:o.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-18,text:c.measureText(o.value).width};}));
  expect(metrics.map(o=>o.value)).toEqual(values);
  for(const field of metrics)expect(field.text,`${name}: complete value ${field.value} is clipped`).toBeLessThanOrEqual(field.available);
 }
});
