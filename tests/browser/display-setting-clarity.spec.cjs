const {test, expect, upload} = require('./fixtures.cjs');
const water = '3\nwater\nO 0 0 .1173\nH .7572 0 -.4692\nH -.7572 0 -.4692\n';
test('the bond radii setting describes connectivity and preserves atom sizes and measurements', async ({page}, info) => {
    await page.setViewportSize({width:900,height:900});
    await upload(page, water, 'water.xyz');
    const bonds = () => page.evaluate(() => structureGroup.children.filter(o=>o.userData.isBond).reduce((n,o)=>n+(o.isInstancedMesh?o.count:1),0));
    const geometry = () => page.evaluate(() => ({positions:currentStructure.atoms.map(a=>a.position.toArray()), sizes:atomMeshes.map(m=>m.scale.toArray()), history:editHistory.undoStack.length}));
    await expect(page.getByRole('checkbox',{name:'Use covalent radii for bonds',exact:true})).toBeChecked();
    expect(await bonds()).toBe(2);
    await page.locator('#useElementRadii').scrollIntoViewIfNeeded();
    await page.screenshot({path:info.outputPath('covalent-bonds.png')});
    for(const n of [1,2,3]) {await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
    const measurement = await page.locator('#measurementPanel').innerText();
    const original = await geometry();
    await page.locator('#useElementRadii').uncheck();
    expect(await bonds()).toBe(3);
    await page.screenshot({path:info.outputPath('distance-cutoff-bonds.png')});
    expect(await geometry()).toEqual(original);
    expect(await page.locator('#measurementPanel').innerText()).toBe(measurement);
    await page.locator('#useElementRadii').check();
    expect(await bonds()).toBe(2);
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
    await page.locator('#useElementRadii').scrollIntoViewIfNeeded();
    await page.screenshot({path:info.outputPath('narrow-bond-setting.png')});
    expect(await page.locator('.sidebar').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
});
