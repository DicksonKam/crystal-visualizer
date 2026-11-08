const { test, expect, setMode } = require('./fixtures.cjs');

const fractional = (page, n) => page.evaluate(n => cartesianToFractional(currentStructure.atoms[n - 1].position, currentStructure.lattice), n);
const undoDepth = page => page.evaluate(() => editHistory.undoStack.length);
const selectedCount = page => page.evaluate(() => selectedAtoms.length);

async function selectAtom(page, n) {
    await page.locator('#atomJumpInput').fill(String(n));
    await page.locator('#atomJumpInput').press('Enter');
}

test('arrow steps move the atom at once, Enter keeps the session as one undo, Escape reverts', async ({ page }, info) => {
    await page.evaluate(() => loadExampleFile('examples/poscar/Si_diamond.poscar'));
    await expect(page.locator('#statusText')).toContainText('Loaded');
    await setMode(page, 'edit');
    await selectAtom(page, 2);
    await expect(page.locator('#saveAtomCoordinates')).toHaveCount(0);
    await expect(page.locator('#clearSelectionBtn')).toHaveCount(0);
    await expect(page.locator('#deleteSelectedBtn')).toHaveText('🗑️ Delete 1 atom');
    const start = await fractional(page, 2);
    const base = await undoDepth(page); // the selection itself is one history entry

    // The step chooser sets the fields' arrow step.
    await expect(page.locator('#editAtom2')).toHaveAttribute('step', '0.01');
    await page.locator('.coord-step[data-step="0.05"]').click();
    await expect(page.locator('#editAtom2')).toHaveAttribute('step', '0.05');
    await expect(page.locator('.coord-step[data-step="0.05"]')).toHaveAttribute('aria-pressed', 'true');

    // Arrow up previews at once: the atom and its readout move, history does not.
    await page.locator('#editAtom2').focus();
    await page.keyboard.press('ArrowUp');
    await expect.poll(async () => (await fractional(page, 2))[2]).toBeCloseTo(start[2] + 0.05, 6);
    expect(await undoDepth(page)).toBe(base + 0);
    await expect(page.locator('#selectedAtomCoords0')).toHaveText(`[${start[0].toFixed(3)}, ${start[1].toFixed(3)}, ${(start[2] + 0.05).toFixed(3)}]`);
    await page.keyboard.press('ArrowUp');
    await expect.poll(async () => (await fractional(page, 2))[2]).toBeCloseTo(start[2] + 0.1, 6);
    expect(await undoDepth(page)).toBe(base + 0);

    // Enter records the two steps as one move.
    await page.keyboard.press('Enter');
    expect(await undoDepth(page)).toBe(base + 1);
    await expect(page.locator('#statusText')).toHaveText('Set coordinates for atom #2');
    await expect(page.locator('#unsavedIndicator')).toBeVisible();
    await page.locator('#measurementPanel').screenshot({ path: info.outputPath('card.png') });
    await page.locator('#undoBtn').click();
    expect((await fractional(page, 2))[2]).toBeCloseTo(start[2], 6);
    await page.locator('#redoBtn').click();
    expect((await fractional(page, 2))[2]).toBeCloseTo(start[2] + 0.1, 6);

    // Typing previews too; Escape puts the atom back and records nothing.
    await page.locator('#editAtom0').fill('0.4');
    await expect.poll(async () => (await fractional(page, 2))[0]).toBeCloseTo(0.4, 6);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await fractional(page, 2))[0]).toBeCloseTo(start[0], 6);
    expect(await undoDepth(page)).toBe(base + 1);
    await expect(page.locator('#statusText')).toContainText('Coordinate edit canceled; atom #2 restored');
    expect(await selectedCount(page)).toBe(1);

    // Switching the system mid-session keeps the preview and converts the fields;
    // focus leaving the section is what commits.
    await page.locator('#editAtom1').fill('0.3');
    await expect.poll(async () => (await fractional(page, 2))[1]).toBeCloseTo(0.3, 6);
    await page.locator('input[name="editAtomCoordMode"][value="cartesian"]').check();
    expect((await fractional(page, 2))[1]).toBeCloseTo(0.3, 6);
    expect(await undoDepth(page)).toBe(base + 1);
    await expect(page.locator('#editAtom1')).toHaveValue(/^1\.629/);
    await expect(page.locator('#editAtom1')).toHaveAttribute('step', '0.1');
    await page.locator('#bondThreshold').focus();
    await expect.poll(() => undoDepth(page)).toBe(base + 2);
    await expect(page.locator('#statusText')).toHaveText('Set coordinates for atom #2');

    // Invalid input shows the error on Enter and moves nothing.
    await page.locator('#editAtom0').fill('');
    await page.locator('#editAtom0').press('Enter');
    await expect(page.locator('#editAtomError')).toHaveText('Enter three finite coordinates');
    expect(await undoDepth(page)).toBe(base + 2);

    // Escape outside a field clears the selection; Delete names the count.
    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Escape');
    expect(await selectedCount(page)).toBe(0);
    await expect(page.locator('#statusText')).toHaveText('Selection cleared');
    await page.locator('#selectAllBtn').click();
    await expect(page.locator('#deleteSelectedBtn')).toHaveText('🗑️ Delete 8 atoms');
    await page.keyboard.press('Escape');
    expect(await selectedCount(page)).toBe(0);
});
