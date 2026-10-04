const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
test('trajectory periodic preview and supercell action keep every frame consistent',async({page},info)=>{
 test.setTimeout(60000);const source=await fs.readFile(require('node:path').join(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8');await upload(page,source,'H2.xdatcar');
 await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();
 const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});const {observe}=createVisualObserver(page,directory,906,1);await observe({step:0,action:'periodic',stage:'settled'});
 const button=page.locator('#makeSupercellBtn');
 const visible=await button.isVisible();const enabled=await button.isEnabled();await info.attach('button-state',{body:JSON.stringify({visible,enabled}),contentType:'application/json'});
 if(visible&&enabled){await button.click();await page.locator('#frameSlider').press('End');await observe({step:1,action:'supercell-frame',stage:'settled'});
  expect(await page.evaluate(()=>currentStructure.frames.every(f=>f.positions.length===currentStructure.atoms.length))).toBe(true);
 }else expect(await page.evaluate(()=>currentStructure.atoms.length)).toBe(2);
});
