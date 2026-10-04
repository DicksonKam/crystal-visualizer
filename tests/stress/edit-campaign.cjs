// Opt-in soak campaign: node tests/stress/edit-campaign.cjs --seconds 7200 --out /tmp/crystal-stress
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { runScenario } = require('./edit-scenario.cjs');
const argument = (key,fallback) => { const index=process.argv.indexOf(key); return index<0 ? fallback : process.argv[index+1]; };
const seconds=Number(argument('--seconds','7200')), initialSeed=Number(argument('--seed','1')), steps=Number(argument('--steps','160'));
const extended=argument('--extended','false') === 'true';
const includeGhosts=argument('--ghosts','false') === 'true';
const directory=path.resolve(argument('--out','/private/tmp/crystal-edit-stress'));
if(!Number.isFinite(seconds) || seconds<=0 || !Number.isInteger(initialSeed) || !Number.isInteger(steps) || steps<=0) throw new Error('Invalid campaign arguments');
(async () => {
    await fs.mkdir(directory,{recursive:true});
    const runId=new Date().toISOString().replace(/[:.]/g,'-');
    const file=path.join(directory,`${runId}.jsonl`);
    const emit=async record => { const line=JSON.stringify(record); await fs.appendFile(file,line+'\n'); process.stdout.write(line+'\n'); };
    const harnessHash=crypto.createHash('sha256').update(await fs.readFile(require.resolve('./edit-scenario.cjs'))).digest('hex');
    await emit({event:'start',timestamp:new Date().toISOString(),seconds,initialSeed,steps,extended,includeGhosts,harnessHash,appHash:crypto.createHash('sha256').update(await fs.readFile(path.resolve(__dirname,'../../app.js'))).digest('hex')});
    const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const started=performance.now(); let seed=initialSeed, actions=0; const counts={};
    try {
        do {
            const scenarioStart=performance.now(), log=[];
            const context=await browser.newContext({viewport: seed%5===0 ? {width:1100,height:800} : {width:1440,height:1000}});
            const page=await context.newPage(); page.setDefaultTimeout(5000); page.setDefaultNavigationTimeout(30000);
            await page.route('https://cdnjs.cloudflare.com/**/three.min.js', route=>route.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'text/javascript'}));
            for(const control of ['OrbitControls','TrackballControls']) await page.route(`https://cdn.jsdelivr.net/**/${control}.js`,route=>route.fulfill({path:require.resolve(`three/examples/js/controls/${control}.js`),contentType:'text/javascript'}));
            await page.route('https://fonts.googleapis.com/**',route=>route.abort());
            await page.route('https://fonts.gstatic.com/**',route=>route.abort());
            const errors=[]; page.on('pageerror',error=>errors.push(error.message));
            try {
                const appHash=crypto.createHash('sha256').update(await fs.readFile(path.resolve(__dirname,'../../app.js'))).digest('hex');
                await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
                await page.locator('canvas[aria-label^="3D structure"]').waitFor({timeout:30000});
                const result=await runScenario(page,{seed,steps,log,extended,includeGhosts});
                if(errors.length) throw new Error(`Uncaught browser errors: ${errors.join('; ')}`);
                actions+=result.steps; for(const [key,count] of Object.entries(result.counts)) counts[key]=(counts[key]||0)+count;
                await emit({event:'pass',seed,steps,appHash,scenarioSeconds:(performance.now()-scenarioStart)/1000,elapsedSeconds:(performance.now()-started)/1000,actions,counts:result.counts,operations:result.operations});
            } catch(error) {
                const failure=path.join(directory,`${runId}-seed-${seed}`);
                await fs.writeFile(failure+'.json',JSON.stringify({seed,steps,error:error.stack,errors,log},null,2));
                await page.screenshot({path:failure+'.png',fullPage:true}).catch(()=>{});
                await fs.writeFile(failure+'.html',await page.content()).catch(()=>{});
                await emit({event:'failure',seed,error:error.message,elapsedSeconds:(performance.now()-started)/1000,scenarioSeconds:(performance.now()-scenarioStart)/1000,actions,counts,evidence:failure+'.json'});
                throw error;
            } finally { await context.close(); }
            seed++;
        } while((performance.now()-started)/1000 < seconds);
        await emit({event:'complete',elapsedSeconds:(performance.now()-started)/1000,actions,counts,nextSeed:seed});
    } finally { await browser.close(); }
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
