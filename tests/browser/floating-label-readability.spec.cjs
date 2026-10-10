const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');

test('floating measurements retain their full number and unit at longer distances and straight angles', async ({ page }, info) => {
    await upload(page, '3\nlong distances and straight angle\nH 0 0 0\nH 10000 0 0\nH 20000 0 0\n', 'long-measurements.xyz');
    for (const n of [1, 2, 3]) {
        await page.locator('#atomJumpInput').fill(String(n));
        await page.locator('#atomJumpInput').press('Enter');
    }
    await page.screenshot({ path: info.outputPath('measured-structure.png') });
    const result = await page.evaluate(() => {
        const labels = measurementGroup.children.filter(object => object.userData.isMeasurementLabel);
        const texts = ['10000.000 Å', '10000.000 Å', '180.0°'];
        const atlas = document.createElement('canvas');
        atlas.width = 384; atlas.height = 32;
        const context = atlas.getContext('2d');
        const metrics = labels.map((label, i) => {
            const canvas = label.material.map.image;
            context.drawImage(canvas, i * 128, 0);
            return { text: texts[i], width: canvas.getContext('2d').measureText(texts[i]).width, canvasWidth: canvas.width };
        });
        return { metrics, image: atlas.toDataURL('image/png') };
    });
    await fs.writeFile(info.outputPath('actual-floating-label-textures.png'), Buffer.from(result.image.split(',')[1], 'base64'));
    expect(result.metrics).toHaveLength(3);
    for (const label of result.metrics) expect(label.width, label.text).toBeLessThanOrEqual(label.canvasWidth - 16);
    await expect(page.locator('#measurementPanel')).toContainText('10000.0000 Å');
    await expect(page.locator('#measurementPanel')).toContainText('180.00°');
});
