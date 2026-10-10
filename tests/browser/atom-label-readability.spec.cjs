const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');

test('dense-structure labels retain every digit of larger atom numbers', async ({ page }, info) => {
    test.setTimeout(90000);
    const atoms = Array.from({ length: 1024 }, (_, i) => `H ${i % 32} ${Math.floor(i / 32)} 0`);
    await upload(page, `1024\nlabel readability\n${atoms.join('\n')}\n`, 'labels.xyz');
    await page.locator('#showBonds').uncheck();
    await page.locator('#showLabels').check();
    await page.screenshot({ path: info.outputPath('labeled-structure.png') });
    const result = await page.evaluate(() => {
        const indices = [1, 99, 100, 999, 1000, 1024];
        const labels = [];
        structureGroup.traverse(object => {
            if (object.userData.isAtomLabel && indices.includes(object.userData.atomIndex + 1)) labels.push(object);
        });
        const atlas = document.createElement('canvas');
        atlas.width = 384; atlas.height = 256;
        const atlasContext = atlas.getContext('2d');
        labels.sort((a, b) => a.userData.atomIndex - b.userData.atomIndex);
        const metrics = labels.map((label, i) => {
            const canvas = label.material.map.image;
            const context = canvas.getContext('2d');
            const index = label.userData.atomIndex + 1;
            atlasContext.drawImage(canvas, (i % 3) * 128, Math.floor(i / 3) * 128);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let edgeInk = false;
            for (let y = 0; y < canvas.height; y++) {
                edgeInk ||= pixels[(y * canvas.width) * 4 + 3] > 0 || pixels[(y * canvas.width + canvas.width - 1) * 4 + 3] > 0;
            }
            return { index, width: context.measureText(String(index)).width, canvasWidth: canvas.width, edgeInk };
        });
        return { metrics, image: atlas.toDataURL('image/png') };
    });
    await fs.writeFile(info.outputPath('actual-label-textures.png'), Buffer.from(result.image.split(',')[1], 'base64'));
    expect(result.metrics).toHaveLength(6);
    for (const label of result.metrics) {
        expect(label.edgeInk, `atom ${label.index} is clipped at the texture edge`).toBe(false);
        expect(label.width, `atom ${label.index} text needs padding inside its texture`).toBeLessThanOrEqual(label.canvasWidth - 16);
    }
});
