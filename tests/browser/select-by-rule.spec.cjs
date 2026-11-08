const { test, expect, setMode } = require('./fixtures.cjs');

const flags = page => page.evaluate(() => currentStructure.atoms.map(atom => atom.selectiveDynamics.map(v => v ? 'T' : 'F').join('')));
const selectedNumbers = page => page.evaluate(() => selectedAtoms.map(atom => atom.index + 1));
const undoDepth = page => page.evaluate(() => editHistory.undoStack.length);
const fixedMarkers = page => page.evaluate(() => structureGroup.children.filter(child => child.userData.isFixedIndicator).length);

async function openSlab(page) {
    await page.evaluate(() => loadExampleFile('examples/poscar/Al_slab_selective.poscar'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    await setMode(page, 'edit');
}

test('element chips, ranges and axis toggles fix a slab layer by layer and export per-axis flags', async ({ page }) => {
    await openSlab(page);
    // The example ships with the bottom layer fixed and one middle atom fixed in z.
    expect(await flags(page)).toEqual(['FFF', 'FFF', 'TTF', 'TTT', 'TTT', 'TTT']);
    expect(await fixedMarkers(page)).toBe(3);
    await expect(page.locator('#structureInfo')).toContainText('2 fixed');
    await expect(page.locator('.element-chip')).toHaveText('Al6');
    await expect(page.locator('#selectNoneBtn')).toBeDisabled();

    // One chip selects every Al atom as a single history step.
    await page.locator('.element-chip').click();
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(await undoDepth(page)).toBe(1);
    await expect(page.locator('#statusText')).toHaveText('All Al: selected 6 atoms (6 of 6 selected)');
    await expect(page.locator('.element-chip')).toHaveAttribute('data-state', 'all');
    await expect(page.locator('.selected-atom.edit')).toHaveCount(6);
    await expect(page.locator('.sel-status.partial')).toHaveCount(1);
    await expect(page.locator('#constraintAxisX')).toHaveAttribute('data-state', 'mixed');
    await expect(page.locator('#constraintAxisZ')).toHaveAttribute('data-state', 'mixed');

    // z is mixed, so the toggle fixes it everywhere; three atoms gain rings.
    await page.locator('#constraintAxisZ').click();
    expect(await flags(page)).toEqual(['FFF', 'FFF', 'TTF', 'TTF', 'TTF', 'TTF']);
    await expect(page.locator('#statusText')).toHaveText('Fixed z for 3 atoms');
    await expect(page.locator('#constraintAxisZ')).toHaveAttribute('data-state', 'fixed');
    expect(await fixedMarkers(page)).toBe(6);
    await expect(page.locator('#sdStats')).toHaveText('2 fixed • 4 partial • 0 free');
    // Now every selected atom has z fixed, so the same toggle frees it.
    await page.locator('#constraintAxisZ').click();
    expect(await flags(page)).toEqual(['FFT', 'FFT', 'TTT', 'TTT', 'TTT', 'TTT']);
    await expect(page.locator('#statusText')).toHaveText('Freed z for 6 atoms');
    await page.locator('#undoBtn').click();
    expect(await flags(page)).toEqual(['FFF', 'FFF', 'TTF', 'TTF', 'TTF', 'TTF']);

    // A Cartesian range along z replaces nothing: it adds to the selection,
    // so clear first. The slab's two lower layers sit at z = 2 and 4 Å.
    await page.locator('#selectNoneBtn').click();
    expect(await selectedNumbers(page)).toEqual([]);
    await page.locator('#selectRangeMax').fill('4.1');
    await page.locator('#selectRangeBtn').click();
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4]);
    await expect(page.locator('#statusText')).toHaveText('z ≤ 4.1 Å: selected 4 atoms (4 of 6 selected)');
    await expect(page.locator('.element-chip')).toHaveAttribute('data-state', 'some');
    await expect(page.locator('.element-chip .chip-count')).toHaveText('4/6');
    await page.locator('#selectRangeBtn').click();
    await expect(page.locator('#statusText')).toHaveText('z ≤ 4.1 Å: already selected (4 of 6 selected)');
    const depth = await undoDepth(page);

    // Invert picks the top layer; Fix sets all three axes; export writes them.
    await page.locator('#selectInvertBtn').click();
    expect(await selectedNumbers(page)).toEqual([5, 6]);
    expect(await undoDepth(page)).toBe(depth + 1);
    await page.locator('#fixSelectedBtn').click();
    expect(await flags(page)).toEqual(['FFF', 'FFF', 'TTF', 'TTF', 'FFF', 'FFF']);
    const exported = await page.evaluate(() => generatePOSCAR());
    expect(exported.match(/\b[TF] [TF] [TF]$/gm)).toEqual(['F F F', 'F F F', 'T T F', 'T T F', 'F F F', 'F F F']);
    // Free one axis of the top layer only.
    await page.locator('#constraintAxisY').click();
    expect(await flags(page)).toEqual(['FFF', 'FFF', 'TTF', 'TTF', 'FTF', 'FTF']);
    await expect(page.locator('.sel-status.partial')).toHaveText(['F T F', 'F T F']);
    // The range remembered its bounds across the panel rebuilds.
    await expect(page.locator('#selectRangeMax')).toHaveValue('4.1');
});

test('fractional ranges follow the lattice and bad bounds change nothing', async ({ page }) => {
    await openSlab(page);
    // The placeholders show the structure's extent along the chosen axis.
    await expect(page.locator('#selectRangeMin')).toHaveAttribute('placeholder', '2');
    await expect(page.locator('#selectRangeMax')).toHaveAttribute('placeholder', '6');
    await page.locator('#selectRangeAxis').selectOption('cartesian:0');
    await expect(page.locator('#selectRangeMax')).toHaveAttribute('placeholder', '2.02');
    await page.locator('#selectRangeAxis').selectOption('fractional:2');
    await expect(page.locator('#selectRangeAxis option:checked')).toHaveText('c');
    await expect(page.locator('#selectRangeMin')).toHaveAttribute('placeholder', '0.1');
    await expect(page.locator('#selectRangeMax')).toHaveAttribute('placeholder', '0.3');
    await page.locator('#selectRangeMin').fill('0.25');
    await page.locator('#selectRangeMax').fill('0.35');
    await page.locator('#selectRangeBtn').click();
    expect(await selectedNumbers(page)).toEqual([5, 6]);
    await expect(page.locator('#statusText')).toHaveText('0.25 ≤ c ≤ 0.35: selected 2 atoms (2 of 6 selected)');
    const depth = await undoDepth(page);

    await page.locator('#selectRangeMin').fill('5');
    await page.locator('#selectRangeMax').fill('1');
    await page.locator('#selectRangeBtn').click();
    await expect(page.locator('#selectRangeError')).toHaveText('Lower bound is above the upper bound');
    await expect(page.locator('#statusText')).toHaveClass('error');
    expect(await selectedNumbers(page)).toEqual([5, 6]);
    expect(await undoDepth(page)).toBe(depth);

    await page.locator('#selectRangeMin').fill('');
    await page.locator('#selectRangeMax').fill('');
    await page.locator('#selectRangeBtn').click();
    await expect(page.locator('#selectRangeError')).toHaveText('Enter at least one end of the range');
    expect(await undoDepth(page)).toBe(depth);

    // Along a, every atom has a < 0.6; the error clears on success.
    await page.locator('#selectRangeAxis').selectOption('fractional:0');
    await page.locator('#selectRangeMax').fill('0.6');
    await page.locator('#selectRangeBtn').click();
    await expect(page.locator('#selectRangeError')).toHaveText('');
    expect(await selectedNumbers(page)).toEqual([5, 6, 1, 2, 3, 4]);
    await expect(page.locator('#statusText')).toHaveText('a ≤ 0.6: selected 4 atoms (6 of 6 selected)');
    // The Cartesian group names the same axis x.
    await page.locator('#selectRangeAxis').selectOption('cartesian:0');
    await expect(page.locator('#selectRangeAxis option:checked')).toHaveText('x');
    await expect(page.locator('#selectRangeMin')).toHaveAttribute('step', '0.5');
});

test('a molecule offers selection by rule without constraints and a chip selects beside a kept measurement', async ({ page }) => {
    await page.evaluate(() => loadExampleFile('examples/xyz/benzene.xyz'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    for (const n of [1, 2]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await setMode(page, 'edit');
    await expect(page.locator('.measurement-readout')).toBeVisible();
    await expect(page.locator('.element-chip')).toHaveText(['C6', 'H6']);
    await expect(page.locator('#selectRangeAxis option')).toHaveCount(3);
    await expect(page.locator('#selectRangeAxis optgroup')).toHaveAttribute('label', 'Cartesian (Å)');

    await page.locator('.element-chip', { hasText: 'H' }).click();
    // The measurement is an annotation: selecting atoms leaves it in place.
    await expect(page.locator('.measurement-readout')).toHaveCount(1);
    expect(await page.evaluate(() => measuredAtoms().map(atom => atom.index + 1))).toEqual([1, 2]);
    expect(await selectedNumbers(page)).toEqual([7, 8, 9, 10, 11, 12]);
    await expect(page.locator('#constraintAxisZ')).toHaveCount(0);
    await expect(page.locator('#fixSelectedBtn')).toHaveCount(0);
    await expect(page.locator('.sel-status')).toHaveCount(0);

    await page.locator('#deleteSelectedBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms.map(atom => atom.element))).toEqual(['C', 'C', 'C', 'C', 'C', 'C']);
    await expect(page.locator('.element-chip')).toHaveText(['C6']);
    await page.locator('#undoBtn').click();
    await expect(page.locator('.element-chip')).toHaveText(['C6', 'H6']);
});

test('panel controls stay put under the pointer while the selection card grows and shrinks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 700 });
    await page.evaluate(() => loadExampleFile('examples/poscar/NaCl_rocksalt.poscar'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    await setMode(page, 'edit');
    const allBtn = page.locator('#selectAllBtn');
    await allBtn.scrollIntoViewIfNeeded();
    const before = await allBtn.boundingBox();
    await allBtn.click();
    await expect(page.locator('.selected-atom.edit')).toHaveCount(8);
    const after = await allBtn.boundingBox();
    expect(Math.abs(after.y - before.y)).toBeLessThan(2);
    // The chip and None rebuild the panel too; neither moves the row.
    await page.locator('.element-chip', { hasText: 'Na' }).click();
    expect(Math.abs((await allBtn.boundingBox()).y - before.y)).toBeLessThan(2);
    await page.locator('#selectNoneBtn').click();
    expect(Math.abs((await allBtn.boundingBox()).y - before.y)).toBeLessThan(2);
    await expect(page.locator('.selected-atom.edit')).toHaveCount(0);

    // Clicking atoms on the canvas rebuilds the panel too; with the section
    // scrolled into view, it stays where it is while the card grows above.
    const points = await page.evaluate(() => {
        const rect = renderer.domElement.getBoundingClientRect();
        const point = new THREE.Vector3();
        return currentStructure.atoms.map((atom, index) => {
            atomMeshes[index].getWorldPosition(point);
            point.project(camera);
            return { x: rect.left + (point.x + 1) / 2 * rect.width, y: rect.top + (1 - point.y) / 2 * rect.height };
        });
    });
    for (const n of [0, 1, 2]) {
        await page.mouse.click(points[n].x, points[n].y);
        await expect(page.locator('.selected-atom.edit')).toHaveCount(n + 1);
        expect(Math.abs((await allBtn.boundingBox()).y - before.y)).toBeLessThan(2);
    }
    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Escape');
    await expect(page.locator('.selected-atom.edit')).toHaveCount(0);
    expect(Math.abs((await allBtn.boundingBox()).y - before.y)).toBeLessThan(2);
});

test('a large selection lists its first rows and says how many more there are', async ({ page }) => {
    await page.evaluate(() => loadExampleFile('examples/poscar/Si_diamond.poscar'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    await page.getByRole('button', { name: 'Increase a periodic images', exact: true }).click();
    await page.getByRole('button', { name: 'Increase b periodic images', exact: true }).click();
    await setMode(page, 'edit');
    await page.locator('#makeSupercellBtn').click();
    await page.locator('#selectAllBtn').click();
    await expect(page.locator('.selected-atom.edit')).toHaveCount(12);
    await expect(page.locator('.selected-atoms-more')).toHaveText('… and 20 more');
    await expect(page.locator('#deleteSelectedBtn')).toHaveText('🗑️ Delete 32 atoms');
});
