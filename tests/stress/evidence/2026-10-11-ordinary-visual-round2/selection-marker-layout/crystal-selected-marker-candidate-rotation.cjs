const {chromium}=require('/Users/dicksonkam/Projects/crystal-visualizer/node_modules/@playwright/test');
const fs=require('node:fs/promises');
const root='/Users/dicksonkam/Projects/crystal-visualizer';
(async()=>{const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{const page=await browser.newPage({viewport:{width:1280,height:800}});
await page.route('https://cdnjs.cloudflare.com/**/three.min.js',r=>r.fulfill({path:root+'/node_modules/three/build/three.min.js',contentType:'text/javascript'}));for(const c of ['OrbitControls','TrackballControls'])await page.route(`https://cdn.jsdelivr.net/**/${c}.js`,r=>r.fulfill({path:root+`/node_modules/three/examples/js/controls/${c}.js`,contentType:'text/javascript'}));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
await page.goto('http://127.0.0.1:4182/');
await page.locator('#fileInput').setInputFiles({name:'SrTiO3_perovskite.vasp',mimeType:'text/plain',buffer:await fs.readFile(root+'/examples/poscar/SrTiO3_perovskite.vasp')});await page.locator('#statusText').filter({hasText:'Loaded'}).waitFor();
for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
await page.locator('#resetView').click();await page.waitForTimeout(300);await page.screenshot({path:'/private/tmp/crystal-ordinary-selected-marker-candidate-initial.png'});
const box=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
let smallest=Infinity;
for(let view=0;view<12;view++){
 const x=box.x+box.width*.85,y=box.y+box.height*.15;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+15,y+35,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
 const metric=await page.evaluate(()=>{const r=renderer.domElement.getBoundingClientRect();const p=selectionRings.map(o=>{const q=o.getWorldPosition(new THREE.Vector3()).project(camera);return[(q.x+1)*r.width/2,(1-q.y)*r.height/2]});let nearest=Infinity;for(let i=0;i<p.length;i++)for(let j=0;j<i;j++)nearest=Math.min(nearest,Math.hypot(p[i][0]-p[j][0],p[i][1]-p[j][1]));return{nearest,points:p};});console.log(JSON.stringify({view,...metric}));
 if(metric.nearest<smallest){smallest=metric.nearest;await page.screenshot({path:'/private/tmp/crystal-ordinary-selected-marker-candidate-nearest.png'});}
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
