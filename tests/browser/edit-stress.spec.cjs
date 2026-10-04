const { test, expect } = require('./fixtures.cjs');
const { runScenario } = require('../stress/edit-scenario.cjs');
// A bounded regression sample runs in CI; the campaign runner is opt-in.
for(const seed of [1, 2, 3, 4]) test(`seeded Edit-mode combinations, seed ${seed}`,async({page},testInfo)=>{
    test.setTimeout(120000);
    const log=[];
    try { await runScenario(page,{seed,steps:40,log}); }
    catch(error) { await testInfo.attach('seed-and-actions',{body:JSON.stringify({seed,log},null,2),contentType:'application/json'}); throw error; }
});

for(const seed of [21,22]) test(`seeded document replacement and download combinations, seed ${seed}`,async({page},testInfo)=>{
    test.setTimeout(120000);
    const log=[];
    try { await runScenario(page,{seed,steps:80,log,extended:true}); }
    catch(error) { await testInfo.attach('seed-and-actions',{body:JSON.stringify({seed,log},null,2),contentType:'application/json'}); throw error; }
});

test('seeded compound selection actions at the history capacity, seed 39',async({page},testInfo)=>{
    test.setTimeout(180000);
    const log=[];
    try { await runScenario(page,{seed:39,steps:160,log}); }
    catch(error) { await testInfo.attach('seed-and-actions',{body:JSON.stringify({seed:39,log},null,2),contentType:'application/json'}); throw error; }
});

test('seeded periodic-copy selection and editing combinations, seed 5',async({page},testInfo)=>{
    test.setTimeout(180000);
    const log=[];
    try {
        const result = await runScenario(page,{seed:5,steps:160,log,includeGhosts:true});
        expect(result.counts.ghost || 0).toBeGreaterThan(0);
        expect(log.some(entry => entry.action === 'ghost' && entry.pointer &&
            entry.after?.selection.identities.some(identity => identity[1] && identity[0] === entry.pointer.displayedIndex))).toBe(true);
    }
    catch(error) { await testInfo.attach('seed-and-actions',{body:JSON.stringify({seed:5,log},null,2),contentType:'application/json'}); throw error; }
});
