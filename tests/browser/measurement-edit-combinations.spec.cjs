const { test, expect, upload, setMode } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');
const { compareGeometry, checkMeasurement, dragTarget } = require('./measurement-edit-helpers.cjs');

for (const width of [900, 1440]) test(`measurement survives a sustained edit chain at ${width}px`, async ({ page }, info) => {
    test.setTimeout(240000);
    page.setDefaultTimeout(10000);
    await page.setViewportSize({ width, height: 900 });
    const variant = info.repeatEachIndex;
    const lattice = variant % 3 === 1 ? '8 1 0\n1 8 0\n0 0 8' : '8 0 0\n0 8 0\n0 0 8';
    const species = ['H O', 'Si O', 'Al H'][variant % 3];
    await upload(page, `measured editing\n1\n${lattice}\n${species}\n3 2\nDirect\n0 .2 .2\n.6 .2 .2\n.6 .7 .2\n.3 .4 .5\n.8 .8 .7\n`, 'measured-editing.poscar');
    await info.attach('variant', { body: JSON.stringify({ variant, lattice, species }), contentType: 'application/json' });
    const capability = await capture(page);
    if (capability.supportsSD) {
        // Fix z for every atom so that freeing them later rebuilds the
        // constraint overlays while the measurement below is kept.
        await setMode(page, 'edit');
        await page.locator('#selectAllBtn').click();
        if (await page.locator('#constraintAxisZ').getAttribute('data-state') !== 'fixed') await page.locator('#constraintAxisZ').click();
        await page.locator('#selectNoneBtn').click();
        await setMode(page, 'measure');
    }
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await setMode(page, 'edit');
    const snap = async name => page.screenshot({ path: info.outputPath(`${name}.png`) });
    await checkMeasurement(page); await snap('initial');
    for (let cycle = 0; cycle < 4; cycle++) {
        await page.locator('#sidebarDivider').focus(); await page.keyboard.press(cycle % 2 ? 'End' : 'Home');
        await page.keyboard.press('ArrowRight');
        for (const kind of variant % 2 ? ['cell', 'atom'] : ['atom', 'cell']) {
            const before = await checkMeasurement(page);
            await dragTarget(page, kind, cycle);
            await checkMeasurement(page); await snap(`${cycle}-${kind}-preview`);
            await page.mouse.up();
            const after = await checkMeasurement(page); await snap(`${cycle}-${kind}-committed`);
            expect(after.undo.at(-1).type).toBe(kind === 'atom' ? 'move_atom' : 'vacuum_drag');
            await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, before.geometry, 'undo');
            await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, after.geometry, 'redo');
        }
        // Move acts on the edit selection; the measurement follows the moved atoms.
        await page.locator('#selectAllBtn').click();
        await page.locator('#shiftA').fill(variant % 2 ? '-.1' : '.1'); await page.locator('#shiftB').fill('0'); await page.locator('#shiftC').fill('0');
        await page.locator('#applyShiftBtn').click(); await checkMeasurement(page); await snap(`${cycle}-shift`);
        await page.locator('#selectNoneBtn').click(); await checkMeasurement(page);
        await page.locator('#addAtomElement').selectOption('C');
        for (const [axis, value] of [['X', .3 + cycle * .1], ['Y', .35 + (variant % 4) * .1], ['Z', .4 + cycle * .05]]) await page.locator(`#addAtom${axis}`).fill(String(value));
        await page.locator('#addAtomBtn').click(); await checkMeasurement(page); await snap(`${cycle}-add`);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
        await page.locator('#redoBtn').click(); await checkMeasurement(page);
        await setMode(page, 'measure'); await checkMeasurement(page);
        await setMode(page, 'edit'); await checkMeasurement(page);
        // Rebuild the scene through ordinary display and periodic controls
        // while the same three-point measurement remains active.
        const displayId = ['showFixedIndicators', 'showLabels'][(variant + cycle) % 2];
        const display = page.locator(`#${displayId}`);
        const checked = await display.isChecked();
        await display.setChecked(!checked); await checkMeasurement(page); await snap(`${cycle}-${displayId}`);
        await display.setChecked(checked); await checkMeasurement(page);
        const axis = ['a', 'b', 'c'][(variant + cycle) % 3];
        await page.getByRole('button', { name: `Increase ${axis} periodic images`, exact: true }).click();
        await checkMeasurement(page); await snap(`${cycle}-periodic-${axis}`);
        await page.getByRole('button', { name: `Decrease ${axis} periodic images`, exact: true }).click();
        await checkMeasurement(page);
        // Constraint overlays also rebuild meshes and participate in history.
        await page.locator('#unfixAllBtn').click(); await checkMeasurement(page); await snap(`${cycle}-freed`);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
        await page.locator('#redoBtn').click(); await checkMeasurement(page);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
    }
    // Select and delete an unmeasured atom while the measured trio stays, then
    // walk back through geometry history with the measurement in place.
    const measured = await checkMeasurement(page);
    await page.locator('#atomJumpInput').fill('4'); await page.locator('#atomJumpInput').press('Enter');
    await page.locator('#deleteSelectedBtn').click(); await snap('deleted-after-measurement');
    expect((await capture(page)).atomCount).toBe(measured.atomCount - 1);
    await checkMeasurement(page);
    await page.locator('#undoBtn').click();
    // Deletion undo restores geometry; the deleted atom is not reselected.
    expect((await capture(page)).selection.identities).toHaveLength(0);
    compareGeometry((await checkMeasurement(page)).geometry, measured.geometry);
    await page.locator('#undoBtn').click();
    expect((await capture(page)).selection.identities).toHaveLength(0);
    compareGeometry((await checkMeasurement(page)).geometry, measured.geometry);
    await snap('measurement-kept-through-deletion');
    for (let i = 0; i < 2; i++) await page.locator('#redoBtn').click();
    expect((await capture(page)).atomCount).toBe(measured.atomCount - 1);
    await page.locator('#undoBtn').click();
    // Start a fresh measurement after restoring the deleted atom.
    await setMode(page, 'measure');
    await page.locator('#clearMeasurementBtn').click();
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await checkMeasurement(page);
    await setMode(page, 'edit'); await checkMeasurement(page);
    await snap('final');
});
