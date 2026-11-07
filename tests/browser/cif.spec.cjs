const { test, expect, upload } = require('./fixtures.cjs');

test('a CIF example opens as its expanded cell with the space group shown', async ({ page }) => {
    await page.evaluate(() => loadExampleFile('examples/cif/ZnS_wurtzite.cif'));
    await expect(page.locator('#statusText')).toHaveText('Loaded CIF: ZnS_wurtzite.cif (4 atoms from 2 sites, P 63 m c)');
    await expect(page.locator('#statusText')).toHaveClass('success');
    await expect(page.locator('#structureInfo .file-type-badge')).toHaveText('CIF');
    await expect(page.locator('#structureInfo')).toContainText('P 63 m c (No. 186)');
    await expect(page.locator('#structureInfo')).toContainText('2 × 12 ops');
    await expect(page.locator('#structureInfo')).toContainText('POSCAR (P1 cell)');
    await expect(page.locator('#structureInfo')).toContainText('120.00°');
    expect(await page.evaluate(() => [currentStructure.elements, currentStructure.counts])).toEqual([['Zn', 'S'], [2, 2]]);
    // The cell is hexagonal, so the three real atoms per species plus their
    // boundary copies draw, and the cell outline is on.
    expect(await page.evaluate(() => atomMeshes.filter(mesh => !mesh.userData.isGhost).length)).toBe(4);
    await expect(page.locator('#exportFormatLabel')).toHaveText('POSCAR');
    await expect(page.locator('#editToggle')).toBeEnabled();
});

test('a dropped .cif file with no symmetry is read as given and its notice shown', async ({ page }) => {
    const content = [
        'data_cube', '_cell_length_a 3', '_cell_length_b 3', '_cell_length_c 3',
        '_cell_angle_alpha 90', '_cell_angle_beta 90', '_cell_angle_gamma 90',
        'loop_', '_atom_site_label', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z', 'Fe1 0 0 0', 'Fe2 0.5 0.5 0.5', ''
    ].join('\n');
    await upload(page, content, 'cube.cif');
    await expect(page.locator('#statusText')).toContainText('Loaded CIF: cube.cif (2 atoms from 2 sites). No space group or symmetry operations are listed');
    await expect(page.locator('#statusText')).toHaveClass('warning');
    await expect(page.locator('#structureInfo .info-warning')).toContainText('No space group or symmetry operations');
    await expect(page.locator('#structureInfo')).toContainText('2 × 1 op');

    // A CIF that names a space group without operations is refused and the
    // open structure stays.
    await page.locator('#fileInput').setInputFiles({ name: 'bad.cif', mimeType: 'text/plain',
        buffer: Buffer.from(content.replace('loop_', "_symmetry_space_group_name_H-M 'I m -3 m'\nloop_")) });
    await expect(page.locator('#statusText')).toContainText('space group I m -3 m is named but no symmetry operations are listed');
    await expect(page.locator('#statusText')).toHaveClass('error');
    expect(await page.evaluate(() => currentStructure.atoms.length)).toBe(2);
});
