const {chromium}=require('/Users/dicksonkam/Projects/crystal-visualizer/node_modules/@playwright/test');
const fs=require('node:fs/promises');
const root='/Users/dicksonkam/Projects/crystal-visualizer';
(async()=>{const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{const page=await browser.newPage({viewport:{width:1280,height:800}});
await page.route('https://cdnjs.cloudflare.com/**/three.min.js',r=>r.fulfill({path:root+'/node_modules/three/build/three.min.js',contentType:'text/javascript'}));for(const c of ['OrbitControls','TrackballControls'])await page.route(`https://cdn.jsdelivr.net/**/${c}.js`,r=>r.fulfill({path:root+`/node_modules/three/examples/js/controls/${c}.js`,contentType:'text/javascript'}));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
await page.goto('http://127.0.0.1:4180/');
await page.locator('#fileInput').setInputFiles({name:'H2_vibration.xdatcar',mimeType:'text/plain',buffer:await fs.readFile(root+'/examples/xdatcar/H2_vibration.xdatcar')});
await page.locator('#statusText').filter({hasText:'Loaded'}).waitFor();
await page.locator('#showLabels').check();
const out='/private/tmp/crystal-ordinary-label-trajectory';await fs.mkdir(out,{recursive:true});
const box=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
await page.mouse.move(box.x+box.width*.55,box.y+box.height*.5);
for(let i=0;i<6;i++){await page.mouse.wheel(0,-180);await page.waitForTimeout(100);}
await page.waitForTimeout(300);
for(const key of ['Home','ArrowRight','End']){
 await page.locator('#frameSlider').press(key);await page.waitForTimeout(200);
 await page.screenshot({path:out+'/'+key+'.png'});
 console.log(JSON.stringify(await page.evaluate(()=>({frame:currentStructure.currentFrameIndex,atomPositions:atomMeshes.map(o=>o.getWorldPosition(new THREE.Vector3()).toArray()),labels:structureGroup.children.filter(o=>o.userData.isAtomLabel).map(o=>({atom:o.userData.atomIndex,position:o.getWorldPosition(new THREE.Vector3()).toArray()}))}))));
}
await page.locator('#frameSlider').press('Home');await page.locator('#playPause').click();await page.waitForTimeout(700);await page.locator('#playPause').click();await page.screenshot({path:out+'/playback-paused.png'});
await page.locator('#showLabels').uncheck();await page.locator('#showLabels').check();
await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();await page.screenshot({path:out+'/periodic-rebuild.png'});
await page.setViewportSize({width:900,height:760});await page.screenshot({path:out+'/resized.png'});
console.log('Finished trajectory label visual workflow');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
