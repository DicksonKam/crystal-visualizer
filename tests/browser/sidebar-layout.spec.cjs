const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../examples/poscar/Al_fcc_cartesian.poscar'), 'utf8');
const longTitle = 'Aluminum FCC Cartesian coordinates with a deliberately long complete title that must remain readable';
const filename = 'Al_fcc_cartesian_with_a_long_descriptive_filename_for_boundary_editing.poscar';
async function dragDivider(page, target) {
    const box = await page.locator('#sidebarDivider').boundingBox();
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await page.mouse.down(); await page.mouse.move(target, box.y + box.height/2, { steps: 6 }); await page.mouse.up();
}
async function canvasMatches(page) {
    await expect.poll(() => page.evaluate(() => {
        const r = renderer.domElement.getBoundingClientRect();
        return Math.abs(r.width - viewport.clientWidth) < 1 && Math.abs(r.height - viewport.clientHeight) < 1;
    })).toBe(true);
}
for (const size of [{width:1440,height:900}, {width:800,height:700}, {width:390,height:844}]) {
    test(`sidebar resizing, collapse and restore preserve the document at ${size.width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize(size);
        await upload(page, source.replace(source.split('\n')[0], longTitle), filename);
        const original = await page.evaluate(() => ({ atoms:currentStructure.atoms.map(a=>a.position.toArray()), undo:editHistory.undoStack.length, dirty:editHistory.dirty }));
        await dragDivider(page, size.width*.48);
        await canvasMatches(page);
        const exportBox = await page.locator('#exportPoscar').boundingBox();
        expect(exportBox.x + exportBox.width).toBeLessThanOrEqual(size.width);
        const texts = page.locator('#structureInfo .info-value');
        await expect(texts.nth(1)).toHaveText(filename); await expect(texts.nth(2)).toHaveText(longTitle);
        expect(await texts.nth(2).evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
        await page.screenshot({path:testInfo.outputPath('expanded.png')});
        await dragDivider(page, 0);
        await expect(page.locator('.sidebar')).toHaveAttribute('aria-hidden','true');
        await expect(page.locator('#sidebarDivider')).toBeVisible(); await canvasMatches(page);
        await page.screenshot({path:testInfo.outputPath('collapsed.png')});
        await dragDivider(page, size.width*.4);
        await expect(page.locator('.sidebar')).toHaveAttribute('aria-hidden','false'); await canvasMatches(page);
        expect(await page.evaluate(() => ({ atoms:currentStructure.atoms.map(a=>a.position.toArray()), undo:editHistory.undoStack.length, dirty:editHistory.dirty }))).toEqual(original);
        const width = await page.locator('.sidebar').evaluate(e=>e.getBoundingClientRect().width);
        await page.reload(); await expect(page.locator('canvas')).toBeVisible();
        await expect.poll(()=>page.locator('.sidebar').evaluate(e=>e.getBoundingClientRect().width)).toBeCloseTo(width,0);
        await canvasMatches(page);
    });
}
test('divider keyboard controls and canceled drag restore presentation state', async ({page}) => {
    const divider=page.locator('#sidebarDivider'); await divider.focus();
    await page.keyboard.press('Home'); await expect(divider).toHaveAttribute('aria-valuenow','0');
    await page.keyboard.press('ArrowRight'); await expect(page.locator('.sidebar')).toHaveAttribute('aria-hidden','false');
    const width=await divider.getAttribute('aria-valuenow'); const box=await divider.boundingBox();
    await page.mouse.move(box.x+5,box.y+50); await page.mouse.down(); await page.mouse.move(box.x+140,box.y+50);
    await page.keyboard.press('Escape'); await page.mouse.up(); await expect(divider).toHaveAttribute('aria-valuenow',width);
    await page.keyboard.press('Enter'); await expect(divider).toHaveAttribute('aria-valuenow','0');
    await page.keyboard.press('Enter'); await expect(divider).toHaveAttribute('aria-valuenow',width);
    await page.setViewportSize({width:600,height:700}); await canvasMatches(page);
});


test('file-load status wrapping resizes the canvas without a window or divider gesture', async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await upload(page, source, 'cell.poscar');
    await canvasMatches(page);
    // A longer status changes the footer height and therefore the viewport.
    await page.evaluate(()=>{statusText.textContent='Loaded: a very long structure filename and status that wraps over several lines on a narrow screen';});
    await canvasMatches(page);
});

test('narrow-panel editing and periodic controls stay inside the panel without horizontal scrolling', async ({page},testInfo) => {
    await page.setViewportSize({width:390,height:844});
    const {sourceFor}=require('../stress/edit-scenario.cjs');
    await upload(page,sourceFor(2).content,'tilted.poscar');
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#addAtomX').fill('.5');
    await page.getByRole('button',{name:'Increase c periodic images',exact:true}).click();
    await page.screenshot({path:testInfo.outputPath('narrow-controls.png')});
    const overflow=await page.locator('.sidebar').evaluate(e=>({left:e.scrollLeft,width:e.clientWidth,content:e.scrollWidth}));
    expect(overflow.left).toBe(0);
    expect(overflow.content).toBeLessThanOrEqual(overflow.width+1);
    await page.locator('.sidebar').evaluate(e=>{e.scrollTop=0;});
    await page.screenshot({path:testInfo.outputPath('narrow-info.png')});
    await page.locator('[data-mode="measure"]').click();
    for(const number of [1,2]) { await page.locator('#atomJumpInput').fill(String(number)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#addAtomX').fill('.25');
    const preserved=await page.locator('.sidebar').evaluate(e=>({left:e.scrollLeft,width:e.clientWidth,content:e.scrollWidth}));
    expect(preserved.left).toBe(0); expect(preserved.content).toBeLessThanOrEqual(preserved.width+1);
    await page.screenshot({path:testInfo.outputPath('narrow-preserved-measurement.png')});
});
