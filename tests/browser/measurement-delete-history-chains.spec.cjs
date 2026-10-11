const { test, expect, upload } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');
const { compareGeometry, checkMeasurement } = require('./measurement-edit-helpers.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

for (const file of ['poscar/Al_slab_selective.poscar', 'xyz/H2O.xyz']) test(`measurement identities survive deleting earlier atoms and history branching in ${path.basename(file)}`, async ({ page }, info) => {
    test.setTimeout(120000);
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples', file), 'utf8'), path.basename(file));
    const total = (await capture(page)).atomCount;
    const numbers = [total - 2, total - 1, total];
    for (const n of numbers) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    for (let cycle = 0; cycle < 3; cycle++) {
        const before = await checkMeasurement(page);
        await page.locator('#clearSelectionBtn').click();
        await page.locator('#atomJumpInput').fill('1'); await page.locator('#atomJumpInput').press('Enter');
        await page.locator('#deleteSelectedBtn').click();
        expect((await capture(page)).atomCount).toBe(total - 1);
        expect(await page.evaluate(() => measurementGroup.children.filter(object => object.userData.isMeasurementVisual).length)).toBe(0);
        await page.screenshot({ path: info.outputPath(`${cycle}-deleted-first-atom.png`) });
        const deleted = await capture(page);
        // Restore deletion, the edit selection, then the preserved measurement.
        for (let i = 0; i < 3; i++) await page.locator('#undoBtn').click();
        const restored = await checkMeasurement(page);
        compareGeometry(restored.geometry, before.geometry);
        expect(restored.selection).toEqual(before.selection);
        await page.screenshot({ path: info.outputPath(`${cycle}-measurement-restored.png`) });
        for (let i = 0; i < 3; i++) await page.locator('#redoBtn').click();
        compareGeometry((await capture(page)).geometry, deleted.geometry);
        for (let i = 0; i < 3; i++) await page.locator('#undoBtn').click();
        expect((await checkMeasurement(page)).selection).toEqual(before.selection);
        // A real geometry edit creates a fresh branch after restoring context.
        await page.locator('#shiftA').fill(cycle % 2 ? '-.05' : '.05');
        await page.locator('#shiftB').fill('0'); await page.locator('#shiftC').fill('0');
        await page.locator('#applyShiftBtn').click();
        const shifted = await checkMeasurement(page);
        expect(shifted.geometry).not.toEqual(before.geometry);
        expect(shifted.selection).toEqual(before.selection);
        await expect(page.locator('#redoBtn')).toBeDisabled();
        await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, before.geometry);
        await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, shifted.geometry);
        await page.locator('#resetView').click();
        await page.screenshot({ path: info.outputPath(`${cycle}-branch-after-restoration.png`) });
    }
});
