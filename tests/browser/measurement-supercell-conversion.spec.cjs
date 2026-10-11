const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

for (const axes of [['a'], ['b'], ['c'], ['a', 'b', 'c']]) test(`measured periodic copies survive ${axes.join('')} supercell conversion and editing`, async ({ page }, info) => {
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples/poscar/Al_fcc_cartesian.poscar'), 'utf8'), 'Al.poscar');
    for (const axis of axes) await page.getByRole('button', { name: `Increase ${axis} periodic images`, exact: true }).click();
    for (const n of [1, 2]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('#resetView').click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const point = await page.evaluate(() => {
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        const rect = renderer.domElement.getBoundingClientRect();
        for (const mesh of atomMeshes.filter(atom => atom.userData.isGhost)) {
            const p = mesh.getWorldPosition(new THREE.Vector3()).project(camera);
            const x = rect.left + (p.x + 1) * rect.width / 2;
            const y = rect.top + (1 - p.y) * rect.height / 2;
            if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom && getAtomIntersection({ clientX: x, clientY: y })?.object === mesh) return { x, y };
        }
        throw Error('No visible periodic atom for this fixture');
    });
    await page.mouse.click(point.x, point.y);
    const positions = () => page.evaluate(() => selectedAtoms.map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()).toArray()));
    const before = await positions(); expect(before).toHaveLength(3);
    await page.locator('[data-mode="edit"]').click();
    await page.screenshot({ path: info.outputPath('measured-periodic-copy.png') });
    await page.locator('#makeSupercellBtn').click();
    await page.screenshot({ path: info.outputPath('converted-measurement.png') });
    expect(await positions()).toEqual(before);
    await expect(page.locator('#measurementPanel')).toContainText('Angle');
    expect(await page.evaluate(() => selectedAtoms.some(atom => atom.isGhost))).toBe(false);
    // Edit the converted measured points, then return through both histories.
    await page.locator('#shiftA').fill('.1');
    await page.locator('#shiftB').fill('0');
    await page.locator('#shiftC').fill('0');
    await page.locator('#applyShiftBtn').click();
    const shifted = await positions();
    expect(shifted).toHaveLength(3);
    expect(shifted).not.toEqual(before);
    await expect(page.locator('#measurementPanel')).toContainText('Angle');
    await page.screenshot({ path: info.outputPath('edited-converted-measurement.png') });
    await page.locator('#undoBtn').click();
    expect(await positions()).toEqual(before);
    await page.locator('#redoBtn').click();
    expect(await positions()).toEqual(shifted);
    await page.locator('#undoBtn').click();
    expect(await positions()).toEqual(before);
    await page.locator('#undoBtn').click();
    expect(await positions()).toEqual(before);
    expect(await page.evaluate(() => selectedAtoms.some(atom => atom.isGhost))).toBe(true);
    await page.screenshot({ path: info.outputPath('undone-conversion.png') });
    await page.locator('#redoBtn').click();
    expect(await positions()).toEqual(before);
    expect(await page.evaluate(() => selectedAtoms.some(atom => atom.isGhost))).toBe(false);
    await page.screenshot({ path: info.outputPath('redone-conversion.png') });
});
