const { test, expect, setMode } = require('./fixtures.cjs');

// Screen positions of the real atoms, in page coordinates.
const screenPoints = page => page.evaluate(() => {
    const rect = renderer.domElement.getBoundingClientRect();
    const point = new THREE.Vector3();
    return currentStructure.atoms.map((atom, index) => {
        atomMeshes[index].getWorldPosition(point);
        point.project(camera);
        return { x: rect.left + (point.x + 1) / 2 * rect.width, y: rect.top + (1 - point.y) / 2 * rect.height };
    });
});
const canvasBox = page => page.locator('canvas[aria-label^="3D structure"]').boundingBox();
const selectedNumbers = page => page.evaluate(() => selectedAtoms.map(atom => atom.index + 1).sort((a, b) => a - b));
const undoDepth = page => page.evaluate(() => editHistory.undoStack.length);

async function drag(page, from, to) {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2);
    await page.mouse.move(to.x, to.y);
}

async function openDiamond(page) {
    await page.evaluate(() => loadExampleFile('examples/poscar/Si_diamond.poscar'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    await setMode(page, 'edit');
}

test('a dragged box selects the real atoms inside it at any depth, as one history step', async ({ page }, info) => {
    await openDiamond(page);
    const box = page.locator('#boxSelectToggle');
    await expect(box).toHaveAttribute('aria-pressed', 'false');
    await box.click();
    await expect(box).toHaveAttribute('aria-pressed', 'true');
    await expect(box).toHaveAttribute('title', /Alt\+drag deselects/);
    expect(await page.evaluate(() => renderer.domElement.style.cursor)).toBe('crosshair');

    // Box in the left half of the atoms' extent: whichever atoms project there.
    const points = await screenPoints(page);
    const xs = points.map(p => p.x).sort((a, b) => a - b);
    const cut = (xs[Math.floor(xs.length / 2) - 1] + xs[Math.floor(xs.length / 2)]) / 2;
    const expected = points.map((p, i) => p.x < cut ? i + 1 : 0).filter(Boolean);
    const top = Math.min(...points.map(p => p.y)) - 15, bottom = Math.max(...points.map(p => p.y)) + 15;
    await drag(page, { x: xs[0] - 15, y: top }, { x: cut, y: bottom });
    const overlay = page.locator('#boxSelectRect');
    await expect(overlay).toBeVisible();
    const drawn = await overlay.boundingBox();
    expect(Math.abs(drawn.width - (cut - xs[0] + 15))).toBeLessThan(2);
    expect(Math.abs(drawn.height - (bottom - top))).toBeLessThan(2);
    await expect(page.locator('#statusText')).toHaveText(`Box select: ${expected.length} atoms inside`);
    await page.screenshot({ path: info.outputPath('box-in-progress.png') });
    await page.mouse.up();
    await expect(overlay).toBeHidden();
    expect(await selectedNumbers(page)).toEqual(expected);
    expect(await undoDepth(page)).toBe(1);
    await expect(page.locator('#statusText')).toHaveText(`Box: selected ${expected.length} atoms (${expected.length} of 8 selected)`);
    // The camera did not rotate during the box drag.
    expect(await page.evaluate(() => controls.enabled)).toBe(true);

    // A click without a drag still selects the atom under the pointer.
    const unselected = points.findIndex((p, i) => !expected.includes(i + 1));
    await page.mouse.click(points[unselected].x, points[unselected].y);
    expect(await selectedNumbers(page)).toEqual([...expected, unselected + 1].sort((a, b) => a - b));

    // Escape cancels a box in progress and changes nothing.
    const depth = await undoDepth(page);
    await drag(page, { x: xs[0] - 15, y: top }, { x: xs[xs.length - 1] + 15, y: bottom });
    await expect(overlay).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();
    await expect(page.locator('#statusText')).toHaveText('Box select canceled (Escape pressed)');
    await page.mouse.up();
    expect(await selectedNumbers(page)).toEqual([...expected, unselected + 1].sort((a, b) => a - b));
    expect(await undoDepth(page)).toBe(depth);

    // An empty box records nothing.
    const canvas = await canvasBox(page);
    await drag(page, { x: canvas.x + 4, y: canvas.y + 4 }, { x: canvas.x + 30, y: canvas.y + 30 });
    await page.mouse.up();
    await expect(page.locator('#statusText')).toHaveText('Box select: no atoms inside');
    expect(await undoDepth(page)).toBe(depth);

    // Leaving edit mode switches the box off.
    await setMode(page, 'measure');
    await setMode(page, 'edit');
    await expect(page.locator('#boxSelectToggle')).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => renderer.domElement.style.cursor)).toBe('');
});

test('Shift+drag boxes without the button, skips periodic copies and never rotates the view', async ({ page }, info) => {
    await openDiamond(page);
    await page.getByRole('button', { name: 'Increase a periodic images', exact: true }).click();
    expect(await page.evaluate(() => atomMeshes.filter(mesh => mesh.userData.isGhost).length)).toBeGreaterThan(0);
    const before = await page.evaluate(() => camera.position.toArray());
    const canvas = await canvasBox(page);
    await page.keyboard.down('Shift');
    await drag(page, { x: canvas.x + 2, y: canvas.y + 2 }, { x: canvas.x + canvas.width - 2, y: canvas.y + canvas.height - 2 });
    await expect(page.locator('#boxSelectRect')).toBeVisible();
    await page.mouse.up();
    await page.keyboard.up('Shift');
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(await undoDepth(page)).toBe(1);
    expect(await page.evaluate(() => selectedAtoms.some(atom => atom.isGhost))).toBe(false);
    expect(await page.evaluate(() => camera.position.toArray())).toEqual(before);
    await expect(page.locator('#boxSelectToggle')).toHaveAttribute('aria-pressed', 'false');

    // The same box again adds nothing and records nothing.
    await page.keyboard.down('Shift');
    await drag(page, { x: canvas.x + 2, y: canvas.y + 2 }, { x: canvas.x + canvas.width - 2, y: canvas.y + canvas.height - 2 });
    await page.mouse.up();
    await page.keyboard.up('Shift');
    await expect(page.locator('#statusText')).toHaveText('Box: already selected (8 of 8 selected)');
    expect(await undoDepth(page)).toBe(1);

    // Alt+Shift+drag removes: a red box over the left half deselects those atoms.
    const points = await screenPoints(page);
    const xs = points.map(p => p.x).sort((a, b) => a - b);
    const cut = (xs[3] + xs[4]) / 2;
    const leftHalf = points.map((p, i) => p.x < cut ? i + 1 : 0).filter(Boolean);
    await page.keyboard.down('Alt'); await page.keyboard.down('Shift');
    await drag(page, { x: canvas.x + 2, y: canvas.y + 2 }, { x: cut, y: canvas.y + canvas.height - 2 });
    await expect(page.locator('#boxSelectRect')).toHaveClass(/remove/);
    await expect(page.locator('#statusText')).toHaveText(`Box deselect: ${leftHalf.length} selected atoms inside`);
    await page.screenshot({ path: info.outputPath('box-remove.png') });
    await page.mouse.up();
    await page.keyboard.up('Shift'); await page.keyboard.up('Alt');
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8].filter(n => !leftHalf.includes(n)));
    expect(await undoDepth(page)).toBe(2);
    await expect(page.locator('#statusText')).toHaveText(`Box: deselected ${leftHalf.length} atoms (${8 - leftHalf.length} of 8 selected)`);
    // The same removing box again finds nothing selected and records nothing.
    await page.keyboard.down('Alt'); await page.keyboard.down('Shift');
    await drag(page, { x: canvas.x + 2, y: canvas.y + 2 }, { x: cut, y: canvas.y + canvas.height - 2 });
    await page.mouse.up();
    await page.keyboard.up('Shift'); await page.keyboard.up('Alt');
    await expect(page.locator('#statusText')).toHaveText(`Box: none of those atoms are selected (${8 - leftHalf.length} of 8 selected)`);
    expect(await undoDepth(page)).toBe(2);
    await page.locator('#undoBtn').click();
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    // Without Shift and without the button, the same drag rotates the view instead.
    await drag(page, { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 }, { x: canvas.x + canvas.width / 2 + 80, y: canvas.y + canvas.height / 2 + 40 });
    await page.mouse.up();
    await expect(page.locator('#boxSelectRect')).toBeHidden();
    await expect.poll(() => page.evaluate(() => camera.position.toArray())).not.toEqual(before);
    expect(await undoDepth(page)).toBe(1);
});

test('Alt removes through the button, the chips and the range, and the bar shows the gestures only in Edit', async ({ page }) => {
    await page.evaluate(() => loadExampleFile('examples/poscar/Si_diamond.poscar'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    const hints = page.locator('.controls-hint .edit-hint');
    await expect(hints).toHaveCount(2);
    await expect(hints.first()).toBeHidden();
    await setMode(page, 'edit');
    await expect(hints.first()).toBeVisible();
    await expect(hints).toHaveText(['⇧ Drag: Box select', '⌥⇧ Drag: Box deselect']);

    await page.locator('#selectAllBtn').click();
    // With the button on, Alt+drag (no Shift) removes.
    await page.locator('#boxSelectToggle').click();
    const points = await screenPoints(page);
    const ys = points.map(p => p.y).sort((a, b) => a - b);
    const cut = (ys[3] + ys[4]) / 2;
    const upper = points.map((p, i) => p.y < cut ? i + 1 : 0).filter(Boolean);
    const canvas = await canvasBox(page);
    await page.keyboard.down('Alt');
    await drag(page, { x: canvas.x + 2, y: canvas.y + 2 }, { x: canvas.x + canvas.width - 2, y: cut });
    await page.mouse.up();
    await page.keyboard.up('Alt');
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8].filter(n => !upper.includes(n)));
    await page.locator('#boxSelectToggle').click();

    // Alt+click on the chip removes the rest; Alt+click on Select removes a range.
    await page.locator('.element-chip').click({ modifiers: ['Alt'] });
    expect(await selectedNumbers(page)).toEqual([]);
    await expect(page.locator('#statusText')).toHaveText(`Si: deselected ${8 - upper.length} atoms (0 of 8 selected)`);
    await page.locator('#selectAllBtn').click();
    await page.locator('#selectRangeMax').fill('1');
    await page.locator('#selectRangeBtn').click({ modifiers: ['Alt'] });
    const low = await page.evaluate(() => currentStructure.atoms.map((atom, i) => atom.position.z <= 1 ? i + 1 : 0).filter(Boolean));
    expect(low.length).toBeGreaterThan(0);
    expect(await selectedNumbers(page)).toEqual([1, 2, 3, 4, 5, 6, 7, 8].filter(n => !low.includes(n)));
    await expect(page.locator('#statusText')).toHaveText(`z ≤ 1 Å: deselected ${low.length} atoms (${8 - low.length} of 8 selected)`);
});
