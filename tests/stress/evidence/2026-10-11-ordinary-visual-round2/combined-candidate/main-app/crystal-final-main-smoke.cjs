const {chromium}=require('/Users/dicksonkam/Projects/crystal-visualizer/node_modules/playwright');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],assets=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{const u=new URL(r.url());if(['/app.js','/styles.css'].includes(u.pathname))assets.push({path:u.pathname,query:u.search,status:r.status()});});
  await page.goto('http://127.0.0.1:4173/?version=183',{waitUntil:'domcontentloaded'});
  await page.locator('#fileInput').setInputFiles('/Users/dicksonkam/Projects/crystal-visualizer/examples/poscar/SrTiO3_perovskite.vasp');
  await page.waitForFunction(()=>typeof atomMeshes!=='undefined'&&atomMeshes.length===5);
  for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
  await page.locator('#resetView').click();await page.locator('#showLabels').check();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:'/private/tmp/crystal-final-main-smoke.png'});
  const result={assets,errors,selection:await page.evaluate(()=>selectedAtoms.map(a=>a.index))};
  if(errors.length||!assets.some(a=>a.path==='/app.js'&&a.query==='?v=183'&&a.status===200)||!assets.some(a=>a.path==='/styles.css'&&a.query==='?v=54'&&a.status===200)||result.selection.length!==3)throw Error(JSON.stringify(result));
  await fs.writeFile('/private/tmp/crystal-final-main-smoke.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
