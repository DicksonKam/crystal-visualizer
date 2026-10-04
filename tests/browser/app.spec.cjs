const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const { createFormats } = require('../../formats.js');
const { cartesianToFractional } = require('../../geometry.js');
class Vector3 {
    constructor(x, y, z) { Object.assign(this, { x, y, z }); }
    clone() { return new Vector3(this.x, this.y, this.z); }
}
const formats = createFormats(Vector3, cartesianToFractional);
const groups = 'two groups\n1\n10 0 0\n0 10 0\n0 0 10\nH H\n1 1\nCartesian\n0 0 0\n1 0 0\n';
const xyz = '2\nLattice="10 0 0 0 10 0 0 0 10" Properties=species:S:1:pos:R:3 energy=-1.23 stress="1 0 0 0 1 0 0 0 1" config_type="sample"\nH 0 0 0\nH 1 0 0\n';

async function selectAtom(page, number) {
    await page.locator('#atomJumpInput').fill(String(number));
    await page.locator('#atomJumpInput').press('Enter');
    await expect(page.locator('#statusText')).toContainText(`Selected atom #${number}`);
}
async function editX(page, number, value) {
    await page.locator('[data-mode="edit"]').click();
    await selectAtom(page, number);
    await page.locator('#editAtomCoordMode').selectOption('cartesian');
    await page.locator('#editAtom0').fill(String(value));
    await page.locator('#saveAtomCoordinates').click();
    await expect(page.locator('#unsavedIndicator')).toBeVisible();
}
async function download(page) {
    const pending = page.waitForEvent('download');
    await page.locator('#exportPoscar').click();
    const result = await pending;
    return fs.readFile(await result.path(), 'utf8');
}

test('all example URLs are served and the VASP example loads through the picker', async ({ page }) => {
    const paths = await page.locator('[data-example-path]').evaluateAll(buttons => buttons.map(button => button.dataset.examplePath));
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
        const response = await page.request.get(path);
        expect(response.status(), path).toBe(200);
        expect(response.headers()['content-type'], path).toBe('text/plain');
        expect((await response.text()).trim(), path).not.toBe('');
    }
    await page.locator('[data-example-path="examples/poscar/SrTiO3_perovskite.vasp"]').click();
    await expect(page.locator('#statusText')).toContainText('Loaded: SrTiO3_perovskite.vasp');
    expect(await page.evaluate(() => ({ filename: currentFilename, atoms: currentStructure.atoms.length, counts: currentStructure.counts }))).toEqual({ filename: 'SrTiO3_perovskite.vasp', atoms: 5, counts: [1, 1, 3] });
});

test('duplicate species preserve membership through editing, deletion, undo/redo and downloads', async ({ page }) => {
    await upload(page, groups, 'groups.poscar');
    await editX(page, 2, 2);
    const loaded = formats.parsePOSCAR(await download(page));
    expect(loaded.counts).toEqual([1, 1]);
    expect(loaded.atoms.map(atom => atom.position.x)).toEqual([0, 2]);
    expect(loaded.hasAdditionalSections).toBe(false);
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[1].position.x)).toBe(1);
    await page.locator('#redoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[1].position.x)).toBe(2);
    await page.locator('#deleteSelectedBtn').click();
    expect(await page.evaluate(() => currentStructure.counts)).toEqual([1, 0]);
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.counts)).toEqual([1, 1]);
    const restored = formats.parsePOSCAR(await download(page));
    expect(restored.atoms.map(atom => atom.position.x)).toEqual([0, 2]);
});

test('adding to a repeated species requires a visible group choice', async ({ page }) => {
    await upload(page, groups, 'groups.poscar');
    await page.locator('[data-mode="edit"]').click();
    await expect(page.locator('#addAtomSpecies')).toBeVisible();
    await page.locator('#addAtomSpecies').selectOption('species-2');
    await page.locator('input[name="coordType"][value="cartesian"]').check();
    await page.locator('#addAtomX').fill('3');
    await page.locator('#addAtomBtn').click();
    await expect(page.locator('#addAtomSpecies')).toHaveValue('species-2');
    expect(formats.parsePOSCAR(await download(page)).counts).toEqual([1, 2]);
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.counts)).toEqual([1, 1]);
    await page.locator('#redoBtn').click();
    expect(await page.evaluate(() => currentStructure.counts)).toEqual([1, 2]);
});

test('undo adding a new element restores the original species header', async ({ page }) => {
    await upload(page, groups.replace('H H\n1 1', 'H\n2'), 'hydrogen.poscar');
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#addAtomX').fill('0.2');
    await page.locator('#addAtomElement').selectOption('O');
    await expect(page.locator('#addAtomX')).toHaveValue('0.2');
    await page.locator('#addAtomBtn').click();
    expect(formats.parsePOSCAR(await download(page)).elements).toEqual(['H', 'O']);
    await page.locator('#undoBtn').click();
    const restored = formats.parsePOSCAR(await download(page));
    expect(restored.elements).toEqual(['H']);
    expect(restored.counts).toEqual([2]);
    await page.locator('#redoBtn').click();
    expect(formats.parsePOSCAR(await download(page)).counts).toEqual([2, 1]);
});

test('XYZ edits warn about stale results, allow cancellation and preserve original results after undo', async ({ page }) => {
    await upload(page, xyz, 'results.xyz');
    expect(await download(page)).toBe(xyz);
    await editX(page, 2, 2);
    const rejectedDialog = page.waitForEvent('dialog');
    const click = page.locator('#exportPoscar').click();
    const rejected = await rejectedDialog;
    expect(rejected.message()).toContain('energy, stress');
    await rejected.dismiss();
    await click;
    await expect(page.locator('#statusText')).toContainText('Export canceled');
    await expect(page.locator('#unsavedIndicator')).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    const edited = await download(page);
    expect(edited).not.toMatch(/energy=|stress=/);
    expect(edited).toContain('config_type="sample"');
    expect(formats.parseXYZ(edited).atoms[1].position.x).toBe(2);
    await page.locator('#undoBtn').click();
    expect(await download(page)).toBe(xyz);
});

test('real cell resize preview cannot collapse and remains reversible', async ({ page }) => {
    await upload(page, groups.replace('H H\n1 1', 'H\n2').replace('0 0 0\n1 0 0', '-2 0 0\n-1 0 0'), 'outside.poscar');
    await page.locator('[data-mode="edit"]').click();
    await page.evaluate(() => {
        vacuumDragState.active = true;
        startVacuumDrag({ extendAxis: 'a', handleType: 'far' }, { clientX: 0, clientY: 0 });
        const direction = vacuumDragState.screenDir;
        const amount = -100 / VACUUM_CONFIG.dragSensitivity;
        updateVacuumDrag({ clientX: amount * direction.x, clientY: -amount * direction.y });
        endVacuumDrag();
    });
    const state = await page.evaluate(() => ({ lattice: currentStructure.lattice, fractional: currentStructure.atoms.map(atom => atom.fractional), meshes: atomMeshes.length }));
    expect(state.lattice[0][0]).toBe(0.001);
    expect(state.fractional.flat().every(Number.isFinite)).toBe(true);
    expect(state.meshes).toBe(2);
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.lattice[0][0])).toBe(10);
    await page.locator('#redoBtn').click();
    expect(await page.evaluate(() => currentStructure.lattice[0][0])).toBe(0.001);
    expect(formats.parsePOSCAR(await download(page)).atoms.length).toBe(2);
});

test('skew-cell load and measurements stay responsive with an explicit boundary-bond warning', async ({ page }) => {
    await upload(page, 'thin cell\n1\n1 0 0\n1 1e-8 0\n0 0 1\nH\n2\nCartesian\n0 0 0\n0.5 0.25 0\n', 'thin.poscar');
    await expect(page.locator('#geometryWarning')).toContainText('work limit');
    await selectAtom(page, 1);
    await selectAtom(page, 2);
    await expect(page.locator('#measurementPanel')).toContainText('0.5000 Å');
    await page.locator('#measurementModeToggle').click();
    await expect(page.locator('#measurementPanel')).toContainText('0.5590 Å');
    await page.locator('#showBonds').uncheck();
    await expect(page.locator('#geometryWarning')).toBeHidden();
});

test('unrepresentable nearest-image offsets display Unavailable without a fallback distance', async ({ page }) => {
    await upload(page, 'offset\n1\n10 0 0\n0 10 0\n0 0 10\nH\n2\nCartesian\n0 0 0\n1e20 0 0\n', 'offset.poscar');
    await selectAtom(page, 1);
    await selectAtom(page, 2);
    await expect(page.locator('#measurementPanel')).toContainText('Unavailable');
    await expect(page.locator('#geometryWarning')).toContainText('integer precision');
    await page.locator('#clearSelectionBtn').click();
    await expect(page.locator('#geometryWarning')).not.toContainText('Use Selected images');
    await selectAtom(page, 1);
    await selectAtom(page, 2);
    await page.locator('#measurementModeToggle').click();
    await expect(page.locator('#measurementPanel')).not.toContainText('Unavailable');
});

test('trajectory playback, frame navigation and export retain frame data', async ({ page }) => {
    const source = 'trajectory\n1\n10 0 0\n0 10 0\n0 0 10\nH\n1\nDirect configuration= 1\n0.1 0 0\nDirect configuration= 2\n0.2 0 0\n';
    await upload(page, source, 'motion.xdatcar');
    await expect(page.locator('[data-mode="edit"]')).toBeDisabled();
    await page.locator('#playPause').click();
    await expect(page.locator('#frameSlider')).toHaveValue('1');
    expect(await page.evaluate(() => currentStructure.atoms[0].position.x)).toBe(2);
    const exported = formats.parseXDATCAR(await download(page));
    expect(exported.frames.map(frame => frame.fractional[0][0])).toEqual([0.1, 0.2]);
});
