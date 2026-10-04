const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises');
const {createVisualObserver}=require('../stress/visual-observer.cjs');

test('trajectory periodic preview remains coherent at the last frame with edit actions gated',async({page},info)=>{
    test.setTimeout(60000);
    const source=await fs.readFile(require('node:path').join(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8');
    await upload(page,source,'H2.xdatcar');
    await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();
    const directory=info.outputPath('visual');
    await fs.mkdir(directory,{recursive:true});
    const {observe}=createVisualObserver(page,directory,906,1);
    await observe({step:0,action:'periodic',stage:'settled'});
    await expect(page.locator('[data-mode="edit"]')).toBeDisabled();
    await expect(page.locator('#makeSupercellBtn')).not.toBeVisible();
    await page.locator('#frameSlider').press('End');
    await observe({step:1,action:'last-frame',stage:'settled'});
    expect(await page.evaluate(()=>({
        atoms:currentStructure.atoms.length,
        framesConsistent:currentStructure.frames.every(frame=>frame.positions.length===currentStructure.atoms.length),
        lastFrame:currentStructure.currentFrameIndex===currentStructure.totalFrames-1
    }))).toEqual({atoms:2,framesConsistent:true,lastFrame:true});
    await info.attach('coverage',{body:JSON.stringify({periodicPreview:true,lastFrame:true,editDisabled:true,supercellHidden:true}),contentType:'application/json'});
});
