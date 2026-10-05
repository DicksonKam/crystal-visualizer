const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs');
const path = require('node:path');

async function placement(page) {
    return page.evaluate(() => {
        structureGroup.updateWorldMatrix(true, true);
        camera.updateWorldMatrix(true, false);
        return {
            atoms: atomMeshes.filter(m => !m.userData.isGhost).map(m => m.getWorldPosition(new THREE.Vector3()).toArray()),
            pivot: controls.target.toArray(), quaternion: camera.quaternion.toArray(), zoom: camera.zoom
        };
    });
}

test('editing and undo preserve the world positions of untouched atoms', async ({ page }, info) => {
    await upload(page, fs.readFileSync(path.join(__dirname, '../../examples/xyz/H2O.xyz'), 'utf8'), 'water.xyz');
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#atomJumpInput').fill('1');
    await page.locator('#atomJumpInput').press('Enter');
    const before = await placement(page);
    await page.locator('#editAtom0').fill('0.8');
    await page.locator('#saveAtomCoordinates').click();
    const edited = await placement(page);
    expect(edited.atoms[0]).not.toEqual(before.atoms[0]);
    for (const n of [1, 2]) expect(edited.atoms[n]).toEqual(before.atoms[n]);
    await page.locator('#undoBtn').click();
    const restored = await placement(page);
    restored.atoms.forEach((xyz, n) => xyz.forEach((v, axis) => expect(v).toBeCloseTo(before.atoms[n][axis], 9)));
    await page.locator('#redoBtn').click();
    const redone = await placement(page);
    redone.atoms.forEach((xyz, n) => xyz.forEach((v, axis) => expect(v).toBeCloseTo(edited.atoms[n][axis], 9)));
    await screenshot(page, info, 'edit-redone');
});

async function screenshot(page, info, name) {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: info.outputPath(name + '.png') });
}

for (const fixture of ['molecule', 'vacuum-cell']) {
    test(`${fixture}: display rebuilds retain atom centers and camera pose`, async ({ page }, info) => {
        await upload(page, fs.readFileSync(path.join(__dirname, '../../examples/', fixture === 'molecule'
            ? 'xyz/H2O.xyz' : 'poscar/Al_slab_selective.poscar'), 'utf8'), fixture + (fixture === 'molecule' ? '.xyz' : '.poscar'));
        await page.locator('#resetView').click();
        const before = await placement(page);
        await screenshot(page, info, 'before');
        const checks = [
            () => page.locator('#atomScale').press('Home'),
            () => page.locator('#atomScale').press('End'),
            () => page.locator('#showBonds').uncheck(),
            () => page.locator('#useElementRadii').uncheck(),
            () => page.locator('#showLabels').check(),
            ...(fixture === 'vacuum-cell' ? [() => page.locator('#toggleCell').click(),
                () => page.locator('#showFixedIndicators').uncheck()] : [])
        ];
        for (let i = 0; i < checks.length; i++) {
            await checks[i]();
            await screenshot(page, info, 'display-' + i);
            const after = await placement(page);
            after.atoms.forEach((xyz, n) => xyz.forEach((v, axis) => expect(v).toBeCloseTo(before.atoms[n][axis], 9)));
            expect(after.pivot).toEqual(before.pivot);
            after.quaternion.forEach((v, axis) => expect(v).toBeCloseTo(before.quaternion[axis], 12));
            expect(after.zoom).toBeCloseTo(before.zoom, 12);
        }
    });
}
