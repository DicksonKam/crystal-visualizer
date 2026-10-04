const {test,expect,upload}=require('./fixtures.cjs');
const {createVisualObserver}=require('../stress/visual-observer.cjs');
const {capture}=require('../stress/edit-scenario.cjs');
const fs=require('node:fs/promises');
const trajectory=`trajectory interactions\n1\n8 0 0\n0 8 0\n0 0 8\nH\n2\n${Array.from({length:24},(_,i)=>`Direct configuration= ${i+1}\n.2 .5 .5\n${(.4+i*.005).toFixed(6)} .5 .5`).join('\n')}\n`;
for(const width of [900,390])for(const key of ['ArrowRight','Home','End'])test(`keyboard trajectory scrubbing ${key} pauses playback at ${width}px`,async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:900,height:844});await upload(page,trajectory,'scrubbing.xdatcar');
 for(const n of [1,2]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
 if(!await page.locator('#loopCheckbox').isChecked())await page.locator('.loop-toggle').click();await page.locator('#fpsSelect').selectOption('1');
 await page.setViewportSize({width,height:844});
 await page.locator('#frameSlider').press('End');await page.locator('#frameSlider').press('ArrowLeft');
 const directory=info.outputPath('visual');await fs.mkdir(directory,{recursive:true});const {observe}=createVisualObserver(page,directory,905,1);
 await page.locator('#playPause').click();expect(await page.evaluate(()=>animationState.isPlaying)).toBe(true);
 await observe({step:0,action:'playback',stage:'initial'});
 await page.locator('#frameSlider').press(key);await observe({step:1,action:'keyboard-scrub',stage:'settled'});
 expect(await page.evaluate(()=>animationState.isPlaying)).toBe(false);
 expect(await page.evaluate(()=>animationState.intervalId)).toBeNull();
 const state=await capture(page);expect(state.violations).toEqual([]);expect(state.selection.identities).toHaveLength(2);
 expect(await page.locator('#frameSlider').inputValue()).toBe(String(await page.evaluate(()=>currentStructure.currentFrameIndex)));
 await expect(page.locator('#playPause')).toHaveAttribute('aria-label','Play trajectory');
});
