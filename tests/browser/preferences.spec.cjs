const { test, expect, upload } = require('./fixtures.cjs');

const KEY = 'crystal-visualizer-preferences';
// Both atoms sit inside the cell, so no boundary copies join them.
const SILICON = 'Si\n1.0\n5.43 0 0\n0 5.43 0\n0 0 5.43\nSi\n2\nDirect\n0.25 0.25 0.25\n0.75 0.75 0.75\n';

async function stored(page) {
    return page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
}

test('display options survive a reload', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await page.locator('#atomScale').fill('1.4');
    await page.locator('#showLabels').check();
    await page.locator('#toggleCell').click();
    expect(await stored(page)).toEqual({ version: 1, values: { atomScale: 1.4, showLabels: true, showCell: false } });

    await page.reload();
    await expect(page.locator('#atomScale')).toHaveValue('1.4');
    await expect(page.locator('#showLabels')).toBeChecked();
    await expect(page.locator('#toggleCell')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#toggleCell')).not.toHaveClass(/active/);
    await upload(page, SILICON, 'POSCAR');
    expect(await page.evaluate(() => ({ scale: settings.atomScale, labels: settings.showLabels, cell: settings.showCell }))).toEqual({ scale: 1.4, labels: true, cell: false });
    expect(await page.evaluate(() => structureGroup.children.filter(child => child.isSprite).length)).toBe(2);
});

test('Reset all restores the defaults and forgets them', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await page.locator('#atomScale').fill('1.4');
    await page.locator('#bondThreshold').fill('0');
    await page.locator('#showLabels').check();
    await page.locator('#toggleAxes').click();
    await page.locator('#periodicControls .stepper-btn[data-axis="a"][data-dir="plus"]').click();
    await expect(page.locator('#periodicADisplay')).toHaveText('2');

    await page.locator('#resetPreferences').click();
    await expect(page.locator('#statusText')).toHaveText('Defaults restored');
    await expect(page.locator('#atomScale')).toHaveValue('0.8');
    await expect(page.locator('#bondThreshold')).toHaveValue('2.5');
    await expect(page.locator('#bondThresholdValue')).toHaveText('2.5');
    await expect(page.locator('#showLabels')).not.toBeChecked();
    await expect(page.locator('#toggleAxes')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#periodicADisplay')).toHaveText('1');
    expect(await stored(page)).toBeNull();
    expect(await page.evaluate(() => ({
        atoms: atomMeshes.filter(mesh => !mesh.userData.isGhost).length,
        ghosts: atomMeshes.filter(mesh => mesh.userData.isGhost).length,
        labels: structureGroup.children.filter(child => child.isSprite).length
    }))).toEqual({ atoms: 2, ghosts: 0, labels: 0 });

    await page.reload();
    await expect(page.locator('#atomScale')).toHaveValue('0.8');
    await expect(page.locator('#showLabels')).not.toBeChecked();
});

test('the background swatches recolour the view and switch the overlay ink', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await expect(page.getByRole('radio', { name: 'Midnight' })).toHaveAttribute('aria-checked', 'true');
    expect(await page.evaluate(() => scene.background.getHexString())).toBe('0a0a0f');

    await page.getByRole('radio', { name: 'White' }).click();
    expect(await page.evaluate(() => ({
        background: scene.background.getHexString(),
        light: document.body.classList.contains('light-scene'),
        ink: overlayInk().text
    }))).toMatchObject({ background: 'ffffff', light: true, ink: '#16161d' });
    await expect(page.getByRole('radio', { name: 'White' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('radio', { name: 'Midnight' })).toHaveAttribute('aria-checked', 'false');
    expect(await stored(page)).toEqual({ version: 1, values: { background: '#ffffff' } });

    // A custom colour selects the picker swatch and is kept too.
    await page.locator('#backgroundColor').fill('#204060');
    expect(await page.evaluate(() => scene.background.getHexString())).toBe('204060');
    await expect(page.locator('.swatch-custom')).toHaveClass(/selected/);
    expect(await page.evaluate(() => document.body.classList.contains('light-scene'))).toBe(false);

    await page.reload();
    expect(await page.evaluate(() => scene.background.getHexString())).toBe('204060');
    await expect(page.locator('#backgroundColor')).toHaveValue('#204060');

    await page.locator('#resetPreferences').click();
    expect(await page.evaluate(() => scene.background.getHexString())).toBe('0a0a0f');
    await expect(page.getByRole('radio', { name: 'Midnight' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.swatch-custom')).not.toHaveClass(/selected/);
});

test('a damaged or foreign stored entry is ignored', async ({ page }) => {
    for (const raw of ['{broken', JSON.stringify({ version: 1, values: { atomScale: 'huge', showLabels: 'yes', bondThreshold: 1.5, unknown: true } })]) {
        await page.evaluate(([key, value]) => localStorage.setItem(key, value), [KEY, raw]);
        await page.reload();
        await expect(page.locator('#atomScale')).toHaveValue('0.8');
        await expect(page.locator('#showLabels')).not.toBeChecked();
    }
    await expect(page.locator('#bondThreshold')).toHaveValue('1.5');
    await upload(page, SILICON, 'POSCAR');
    await expect(page.locator('#statusText')).toContainText('Loaded');
});

test('an element recoloured in the Atoms panel keeps its colour until put back', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    const input = page.locator('.atom-color-input[data-element="Si"]');
    await expect(input).toHaveValue('#1b3bfa');
    await input.fill('#ff0000');
    expect(await page.evaluate(() => ({
        solid: getAtomMaterial('Si').color.getHexString(),
        ghost: getAtomMaterial('Si', true).color.getHexString(),
        meshes: [...new Set(atomMeshes.map(mesh => mesh.material.color.getHexString()))]
    }))).toEqual({ solid: 'ff0000', ghost: 'ff0000', meshes: ['ff0000'] });
    await expect(page.locator('.atom-entry[data-element="Si"]')).toHaveClass(/recoloured/);
    await expect(page.locator('.atom-color-reset[data-element="Si"]')).toBeVisible();
    expect(await stored(page)).toEqual({ version: 1, values: { colors: { Si: '#ff0000' } } });

    await page.reload();
    await upload(page, SILICON, 'POSCAR');
    expect(await page.evaluate(() => getAtomMaterial('Si').color.getHexString())).toBe('ff0000');
    await expect(page.locator('.atom-color-input[data-element="Si"]')).toHaveValue('#ff0000');

    await page.locator('.atom-color-reset[data-element="Si"]').click();
    expect(await page.evaluate(() => getAtomMaterial('Si').color.getHexString())).toBe('1b3bfa');
    await expect(page.locator('.atom-entry[data-element="Si"]')).not.toHaveClass(/recoloured/);
    await expect(page.locator('.atom-color-reset[data-element="Si"]')).toBeHidden();
    expect(await stored(page)).toBeNull();

    // Reset all clears a recolour too.
    await page.locator('.atom-color-input[data-element="Si"]').fill('#00ff00');
    await page.locator('#resetPreferences').click();
    expect(await page.evaluate(() => getAtomMaterial('Si').color.getHexString())).toBe('1b3bfa');
    await expect(page.locator('.atom-color-input[data-element="Si"]')).toHaveValue('#1b3bfa');
});
