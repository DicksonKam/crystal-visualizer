const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

async function framing(page) {
    return page.evaluate(() => {
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        const bounds = getStructureBounds();
        const canvas = renderer.domElement.getBoundingClientRect();
        const hint = document.querySelector('.controls-hint').getBoundingClientRect();
        const points = [];
        for (const x of [bounds.min.x, bounds.max.x])
            for (const y of [bounds.min.y, bounds.max.y])
                for (const z of [bounds.min.z, bounds.max.z]) {
                    const p = new THREE.Vector3(x, y, z).project(camera);
                    points.push({ x: canvas.left + (p.x + 1) * canvas.width / 2,
                        y: canvas.top + (1 - p.y) * canvas.height / 2 });
                }
        return { canvas: canvas.toJSON(), hint: hint.toJSON(),
            covered: points.filter(p => hint.width && hint.height && p.x >= hint.left && p.x <= hint.right
                && p.y >= hint.top && p.y <= hint.bottom) };
    });
}

for (const [name, filename] of [['trajectory', 'xdatcar/H2_vibration.xdatcar'], ['cell', 'poscar/NaCl_rocksalt.poscar']]) {
    test(`reset fits ${name} without hiding its corners behind navigation help`, async ({ page }, info) => {
        await page.setViewportSize({ width: 900, height: 760 });
        await page.locator('#sidebarDivider').press('Home');
        await upload(page, await fs.readFile(path.join(__dirname, '../../examples', filename), 'utf8'), path.basename(filename));
        await page.locator('#resetView').click();
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const state = await framing(page);
        expect(state.hint.height).toBeGreaterThan(0);
        await page.screenshot({ path: info.outputPath(`${name}-fitted.png`) });
        expect(state.covered, JSON.stringify(state)).toEqual([]);
    });
}

test('hidden navigation help returns its space to the canvas across responsive changes', async ({ page }, info) => {
    await page.setViewportSize({ width: 900, height: 760 });
    await page.locator('#sidebarDivider').press('Home');
    await upload(page, '2\nsmall molecule\nH 0 0 0\nH .74 0 0\n', 'h2.xyz');
    for (const width of [390, 900, 390]) {
        await page.setViewportSize({ width, height: 760 });
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const state = await framing(page);
        if (width === 390) {
            expect(state.hint.height).toBe(0);
            const parent = await page.locator('.viewport-container').boundingBox();
            expect(Math.abs(state.canvas.bottom - parent.y - parent.height)).toBeLessThan(1);
        } else expect(state.hint.height).toBeGreaterThan(0);
        await page.screenshot({ path: info.outputPath(`responsive-${width}.png`) });
    }
});
