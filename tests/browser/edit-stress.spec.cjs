const { test } = require('./fixtures.cjs');
const { runScenario } = require('../stress/edit-scenario.cjs');
// A bounded regression sample runs in CI; the campaign runner is opt-in.
for(const seed of [1, 2, 3, 4]) test(`seeded Edit-mode combinations, seed ${seed}`,async({page},testInfo)=>{
    test.setTimeout(120000);
    const log=[];
    try { await runScenario(page,{seed,steps:40,log}); }
    catch(error) { await testInfo.attach('seed-and-actions',{body:JSON.stringify({seed,log},null,2),contentType:'application/json'}); throw error; }
});
