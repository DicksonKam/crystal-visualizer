const {test,expect,upload}=require('./fixtures.cjs');
const {capture}=require('../stress/edit-scenario.cjs');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
const fs=require('node:fs/promises');
function denseTrajectory(){const p=[];for(let x=0;x<10;x++)for(let y=0;y<10;y++)for(let z=0;z<5;z++)p.push([x/10,y/10,z/6]);return `dense playback\n1\n20 0 0\n0 20 0\n0 0 12\nH\n499\n${Array.from({length:4},(_,f)=>`Direct configuration= ${f+1}\n${p.slice(0,499).map(([x,y,z])=>`${x+f*.005} ${y} ${z}`).join('\n')}`).join('\n')}\n`;}
for(const fixture of ['molecule','dense'])test(`${fixture} continuous playback survives periodic/display/window/sidebar rebuild combinations`,async({page},info)=>{
 test.setTimeout(240000);await page.setViewportSize({width:900,height:844});
 const source=fixture==='dense'?denseTrajectory():await fs.readFile(require('node:path').join(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8');await upload(page,source,fixture+'.xdatcar');
 for(const n of [1,2]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
 if(!await page.locator('#loopCheckbox').isChecked())await page.locator('.loop-toggle').click();await page.locator('#fpsSelect').selectOption('30');
 await page.evaluate(()=>{window.observedFrames=[];const original=switchToFrame;switchToFrame=function(i){const result=original(i);window.observedFrames.push(i);return result;};});
 const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});const {observe}=createVisualObserver(page,directory,907,1);
 await page.locator('#playPause').click();
 for(let step=0;step<24;step++){
  if(step%6===0)await page.getByRole('button',{name:step%12===0?'Increase a periodic images':'Decrease a periodic images',exact:true}).click();
  else if(step%6===1)await page.setViewportSize({width:[390,900,1440][Math.floor(step/6)%3],height:844});
  else if(step%6===2){await page.locator('#sidebarDivider').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await page.keyboard.press('End');}
  else if(step%6===3){const box=await page.locator('#showBonds');await box.setChecked(!await box.isChecked());}
  else if(step%6===4)await page.locator('#atomScale').press(step%12===4?'Home':'End');
  else {const labels=page.locator('#showLabels');await labels.setChecked(!await labels.isChecked());}
  const state=await capture(page);expect(state.violations).toEqual([]);expect(state.selection.identities).toHaveLength(2);
  expect(await page.evaluate(()=>animationState.isPlaying)).toBe(true);
  if(step%6===0||step===23)await observe({step,action:'playing-rebuild',stage:'settled'});
 }
 await page.locator('#playPause').click();expect(await page.evaluate(()=>animationState.isPlaying)).toBe(false);
 expect(await page.evaluate(()=>new Set(observedFrames).size)).toBeGreaterThan(1);
 const before=await capture(page);await page.locator('#undoBtn').click();
 expect((await capture(page)).geometry).toEqual(before.geometry);
 await observe({step:24,action:'selection-undo',stage:'settled'});
 await info.attach('coverage',{body:JSON.stringify({fixture,steps:24,frames:await page.evaluate(()=>observedFrames.length)}),contentType:'application/json'});
});
