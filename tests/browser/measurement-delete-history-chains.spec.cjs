const { test, expect, upload, setMode } = require('./fixtures.cjs');
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
    await setMode(page, 'edit');
    const measuredIndices = () => page.evaluate(() => measuredAtoms().map(atom => atom.index));
    for (let cycle = 0; cycle < 3; cycle++) {
        const before = await checkMeasurement(page);
        expect(await measuredIndices()).toEqual(numbers.map(n => n - 1));
        // Deleting an earlier atom renumbers the measured atoms; the
        // measurement names atoms, not positions in the list, so it follows.
        await page.locator('#atomJumpInput').fill('1'); await page.locator('#atomJumpInput').press('Enter');
        await page.locator('#deleteSelectedBtn').click();
        expect((await capture(page)).atomCount).toBe(total - 1);
        // In a three-atom molecule the first atom is itself measured: that
        // point drops out and comes back with the atom on undo.
        const survivors = numbers.filter(n => n !== 1);
        expect(await measuredIndices()).toEqual(survivors.map(n => n - 2));
        if (survivors.length === 3) await checkMeasurement(page);
        else expect((await capture(page)).violations).toEqual([]);
        await page.screenshot({ path: info.outputPath(`${cycle}-deleted-first-atom.png`) });
        const deleted = await capture(page);
        // Restore the deletion and the edit selection; the measurement is unchanged.
        for (let i = 0; i < 2; i++) await page.locator('#undoBtn').click();
        const restored = await checkMeasurement(page);
        compareGeometry(restored.geometry, before.geometry);
        expect(restored.selection).toEqual(before.selection);
        await page.screenshot({ path: info.outputPath(`${cycle}-measurement-restored.png`) });
        for (let i = 0; i < 2; i++) await page.locator('#redoBtn').click();
        compareGeometry((await capture(page)).geometry, deleted.geometry);
        for (let i = 0; i < 2; i++) await page.locator('#undoBtn').click();
        expect((await checkMeasurement(page)).selection).toEqual(before.selection);
        // A real geometry edit creates a fresh branch after restoring context.
        await page.locator('#selectAllBtn').click();
        await page.locator('#shiftA').fill(cycle % 2 ? '-.05' : '.05');
        await page.locator('#shiftB').fill('0'); await page.locator('#shiftC').fill('0');
        await page.locator('#applyShiftBtn').click();
        const shifted = await checkMeasurement(page);
        expect(shifted.geometry).not.toEqual(before.geometry);
        expect(shifted.selection.measurements).toEqual(before.selection.measurements);
        await expect(page.locator('#redoBtn')).toBeDisabled();
        await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, before.geometry);
        await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, shifted.geometry);
        await page.locator('#selectNoneBtn').click();
        await page.locator('#resetView').click();
        await page.screenshot({ path: info.outputPath(`${cycle}-branch-after-restoration.png`) });
    }
});
