// Opt-in seeded visual campaign; each seed owns an isolated browser document.
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { runScenario } = require('./edit-scenario.cjs');
const { createVisualObserver } = require('./visual-observer.cjs');
const arg=(key,fallback)=>{const i=process.argv.indexOf(key);return i<0?fallback:process.argv[i+1];};
const seconds=Number(arg('--seconds',1800)),initialSeed=Number(arg('--seed',701)),steps=Number(arg('--steps',120));
const directory=path.resolve(arg('--out','/private/tmp/crystal-visual-campaign'));
if(!Number.isFinite(seconds)||seconds<=0||!Number.isInteger(initialSeed)||!Number.isInteger(steps)||steps<=0)throw Error('Invalid campaign arguments');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
async function sourceHashes(){const result={};for(const name of ['app.js','layout.js','styles.css','index.html','tests/stress/edit-scenario.cjs','tests/stress/visual-observer.cjs'])result[name]=hash(await fs.readFile(path.resolve(__dirname,'../..',name)));return result;}
function denseSource(){const atoms=[];for(let x=0;x<10;x++)for(let y=0;y<10;y++)for(let z=0;z<6;z++)atoms.push(`H ${x*2} ${y*2} ${z*2}`);return {name:'dense-periodic.xyz',content:`600\nLattice="20 0 0 0 20 0 0 0 12" Properties=species:S:1:pos:R:3 pbc="T T T"\n${atoms.join('\n')}\n`};}
(async()=>{
 await fs.mkdir(directory,{recursive:true});const runId=new Date().toISOString().replace(/[:.]/g,'-');
 const file=path.join(directory,runId+'.jsonl');const emit=async r=>{await fs.appendFile(file,JSON.stringify(r)+'\n');process.stdout.write(JSON.stringify(r)+'\n');};
 await emit({event:'start',timestamp:new Date().toISOString(),seconds,initialSeed,steps,sourceHashes:await sourceHashes()});
 const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const started=performance.now();let seed=initialSeed,actions=0,images=0;
 try{do{
  const seedDir=path.join(directory,'seed-'+seed);await fs.mkdir(seedDir,{recursive:true});
  const viewport=[{width:1440,height:900},{width:900,height:760},{width:390,height:844}][seed%3];
  const context=await browser.newContext({viewport,deviceScaleFactor:seed%2?1:2});const page=await context.newPage();
  page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(30000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/**/three.min.js',route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'text/javascript'}));
  for(const control of ['OrbitControls','TrackballControls'])await page.route(`https://cdn.jsdelivr.net/**/${control}.js`,route=>route.fulfill({path:require.resolve(`three/examples/js/controls/${control}.js`),contentType:'text/javascript'}));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  const log=[],observer=createVisualObserver(page,seedDir,seed);const hashes=await sourceHashes();
  try{
   await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.locator('canvas[aria-label^="3D structure"]').waitFor();
   const dense=seed%5===0;const result=await runScenario(page,{seed,steps,extended:true,includeGhosts:true,visual:true,observe:observer.observe,log,sourceOverride:dense?denseSource():null});
   if(errors.length)throw Error(errors.join('; '));
   const sequence=log.map(({before,after,...rest})=>({...rest,beforeHash:before?hash(JSON.stringify(before)):null,afterHash:after?hash(JSON.stringify(after)):null}));
   await fs.writeFile(path.join(seedDir,'sequence.json'),JSON.stringify({seed,viewport,dense,sourceHashes:hashes,sequence},null,2));
   actions+=result.steps;images+=observer.observations.length;
   await emit({event:'pass',seed,dense,viewport,steps:result.steps,actions,images,counts:result.counts,operations:result.operations,sourceHashes:hashes,elapsedSeconds:(performance.now()-started)/1000});
  }catch(error){await fs.writeFile(path.join(seedDir,'failure.json'),JSON.stringify({seed,error:error.stack,errors,sourceHashes:hashes,log},null,2));await page.screenshot({path:path.join(seedDir,'failure.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(seedDir,'failure.html'),await page.content()).catch(()=>{});await emit({event:'failure',seed,error:error.message,actions,images,evidence:seedDir,elapsedSeconds:(performance.now()-started)/1000});throw error;}
  finally{await context.close();}seed++;
 }while((performance.now()-started)/1000<seconds);
 await emit({event:'complete',nextSeed:seed,actions,images,elapsedSeconds:(performance.now()-started)/1000});
 }finally{await browser.close();}
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
