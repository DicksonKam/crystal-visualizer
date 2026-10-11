const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

test('adding an unselected smaller atom does not shrink an existing measurement', async ({ page }, info) => {
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples/poscar/Al_fcc_cartesian.poscar'), 'utf8'), 'Al.poscar');
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    const sizes = () => page.evaluate(() => measurementGroup.children.filter(object => object.userData.isMeasurementLabel || object.userData.isSelectionLabel).map(object => ({ position: object.position.toArray(), scale: object.scale.toArray(), label: !!object.userData.isMeasurementLabel })));
    const before = await sizes();
    await page.screenshot({ path: info.outputPath('before-add.png') });
    await page.locator('#addAtomElement').selectOption('H');
    for (const axis of ['X', 'Y', 'Z']) await page.locator(`#addAtom${axis}`).fill('.25');
    await page.locator('#addAtomBtn').click();
    await page.screenshot({ path: info.outputPath('after-add.png') });
    const after = await sizes();
    await info.attach('measurement-sizes', { body: JSON.stringify({ before, after }), contentType: 'application/json' });
    expect(after.map(object => object.scale)).toEqual(before.map(object => object.scale));
    await expect(page.locator('#measurementPanel')).toContainText('2.8638 Å');
    await page.locator('#undoBtn').click();
    expect((await sizes()).map(object => object.scale)).toEqual(before.map(object => object.scale));
    await page.locator('#redoBtn').click();
    expect((await sizes()).map(object => object.scale)).toEqual(before.map(object => object.scale));
    await page.screenshot({ path: info.outputPath('after-redo-add.png') });
});
