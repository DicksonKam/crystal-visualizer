const { test, expect, upload } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');
const { compareGeometry, checkMeasurement, dragTarget, checkBondRefresh } = require('./measurement-edit-helpers.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

for (const width of [900, 1440]) test(`example measurements survive a compound edit chain at ${width}px`, async ({ page }, info) => {
    test.setTimeout(240000);
    page.setDefaultTimeout(10000);
    await page.setViewportSize({ width, height: 900 });
    const variant = info.repeatEachIndex;
    const files = ['poscar/Al_fcc_cartesian.poscar', 'poscar/Si_diamond.poscar', 'poscar/NaCl_rocksalt.poscar', 'poscar/graphene_sheet.poscar', 'poscar/Al_slab_selective.poscar', 'xyz/H2O.xyz'];
    const file = files[variant % files.length];
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples', file), 'utf8'), path.basename(file));
    const capability = await capture(page);
    await info.attach('example', { body: JSON.stringify({ variant, file, capability: { lattice: capability.lattice, supportsSD: capability.supportsSD } }), contentType: 'application/json' });
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    const snap = async name => page.screenshot({ path: info.outputPath(`${name}.png`) });
    await checkMeasurement(page); await snap('initial');
    for (let cycle = 0; cycle < 4; cycle++) {
        await page.locator('#sidebarDivider').focus(); await page.keyboard.press(cycle % 2 ? 'Home' : 'End');
        for (const kind of !capability.lattice ? ['atom'] : variant % 2 ? ['cell', 'atom'] : ['atom', 'cell']) {
            const before = await checkMeasurement(page);
            await dragTarget(page, kind, cycle);
            await checkMeasurement(page); await snap(`${cycle}-${kind}-preview`);
            await page.mouse.up();
            const after = await checkMeasurement(page); await snap(`${cycle}-${kind}-committed`);
            expect(after.undo.at(-1).type).toBe(kind === 'atom' ? 'move_atom' : 'vacuum_drag');
            await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, before.geometry, 'undo');
            await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, after.geometry, 'redo');
        }
        if (cycle % 2) { await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Enter'); }
        await page.locator('#shiftA').fill(variant % 2 ? '-.1' : '.1'); await page.locator('#shiftB').fill('0'); await page.locator('#shiftC').fill('0');
        await page.locator('#applyShiftBtn').click(); await checkMeasurement(page); await snap(`${cycle}-shift`);
        await page.locator('#addAtomElement').selectOption('C');
        for (const [axis, value] of [['X', .3 + cycle * .1], ['Y', .35 + (variant % 4) * .1], ['Z', .4 + cycle * .05]]) await page.locator(`#addAtom${axis}`).fill(String(value));
        await page.locator('#addAtomBtn').click(); await checkMeasurement(page); await snap(`${cycle}-add`);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
        await page.locator('#redoBtn').click(); await checkMeasurement(page);
        await page.locator('[data-mode="measure"]').click(); await checkMeasurement(page);
        await page.locator('[data-mode="edit"]').click(); await checkMeasurement(page);
        await checkBondRefresh(page); await snap(`${cycle}-bonds-refreshed`);
        // Rebuild the scene through ordinary display and periodic controls
        // while the same three-point measurement remains active.
        const displayIds = capability.supportsSD ? ['showBonds', 'useElementRadii', 'showFixedIndicators', 'showLabels'] : ['showBonds', 'useElementRadii', 'showLabels'];
        const displayId = displayIds[(variant + cycle) % displayIds.length];
        const display = page.locator(`#${displayId}`);
        const checked = await display.isChecked();
        await display.setChecked(!checked); await checkMeasurement(page); await snap(`${cycle}-${displayId}`);
        await display.setChecked(checked); await checkMeasurement(page);
        if (capability.periodic) {
        const axis = ['a', 'b', 'c'][(variant + cycle) % 3];
        await page.getByRole('button', { name: `Increase ${axis} periodic images`, exact: true }).click();
        await checkMeasurement(page); await snap(`${cycle}-periodic-${axis}`);
        await page.getByRole('button', { name: `Decrease ${axis} periodic images`, exact: true }).click();
        await checkMeasurement(page);
        }
        // Constraint overlays also rebuild meshes and participate in history.
        if (capability.supportsSD) {
        await page.locator('#fixZThreshold').fill('20');
        await page.locator('#fixByZBtn').click(); await checkMeasurement(page); await snap(`${cycle}-fixed`);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
        await page.locator('#redoBtn').click(); await checkMeasurement(page);
        await page.locator('#unfixAllBtn').click(); await checkMeasurement(page);
        }
    }
    // Switch from the measured trio to an edit selection, delete, and walk
    // back through both geometry history and the measurement context.
    const measured = await checkMeasurement(page);
    await page.locator('#clearSelectionBtn').click();
    await page.locator('#atomJumpInput').fill('4'); await page.locator('#atomJumpInput').press('Enter');
    await page.locator('#deleteSelectedBtn').click(); await snap('deleted-after-measurement');
    expect((await capture(page)).atomCount).toBe(measured.atomCount - 1);
    expect(await page.evaluate(() => measurementGroup.children.filter(object => object.userData.isMeasurementVisual).length)).toBe(0);
    await page.locator('#undoBtn').click();
    // Deletion undo restores geometry; selection is restored by its own
    // earlier history operations rather than reselecting the deleted atom.
    expect((await capture(page)).selection.identities).toHaveLength(0);
    compareGeometry((await capture(page)).geometry, measured.geometry);
    await page.locator('#undoBtn').click();
    expect((await capture(page)).selection.identities).toHaveLength(0);
    await page.locator('#undoBtn').click();
    compareGeometry((await checkMeasurement(page)).geometry, measured.geometry);
    await snap('measurement-restored-through-deletion');
    for (let i = 0; i < 3; i++) await page.locator('#redoBtn').click();
    expect((await capture(page)).atomCount).toBe(measured.atomCount - 1);
    await page.locator('#undoBtn').click();
    // Start a fresh measurement branch after restoring the deleted atom.
    await page.locator('[data-mode="measure"]').click();
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await checkMeasurement(page);
    await page.locator('[data-mode="edit"]').click(); await checkMeasurement(page);
    await snap('final');
});
