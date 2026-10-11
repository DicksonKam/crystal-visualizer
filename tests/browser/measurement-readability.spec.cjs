const { test, expect, upload } = require('./fixtures.cjs');

for (const width of [220, 280, 320]) {
    test(`measurement values stay inside their cards at ${width}px panel width`, async ({ page }, info) => {
        await page.setViewportSize({ width: 900, height: 900 });
        await upload(page, '3\nlarge measured coordinates\nH 0 0 0\nO 123456.789 234567.89 345678.9\nC -123456.789 0 0\n', 'measurements.xyz');
        for (const n of [1, 2, 3]) {
            await page.locator('#atomJumpInput').fill(String(n));
            await page.locator('#atomJumpInput').press('Enter');
        }
        const divider = await page.locator('#sidebarDivider').boundingBox();
        await page.mouse.move(divider.x + divider.width / 2, divider.y + divider.height / 2);
        await page.mouse.down();
        await page.mouse.move(width, divider.y + divider.height / 2, { steps: 5 });
        await page.mouse.up();
        for (const mode of ['measure', 'edit']) {
            await page.locator(`[data-mode="${mode}"]`).click();
            await page.locator('#measurementPanel').scrollIntoViewIfNeeded();
            await page.screenshot({ path: info.outputPath(`${mode}.png`) });
            // Scroll width misses text hidden by a card's overflow clipping.
            // Inspect the painted text fragments against their actual container.
            const clipped = await page.evaluate(() => {
                const result = [];
                for (const element of document.querySelectorAll('.meas-value, .delta-item')) {
                    const container = element.closest('.meas-content, .meas-delta');
                    const bounds = container.getBoundingClientRect();
                    const range = document.createRange();
                    range.selectNodeContents(element);
                    for (const rect of range.getClientRects()) {
                        if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) {
                            result.push({ text: element.textContent, left: rect.left, right: rect.right, bounds: [bounds.left, bounds.right] });
                        }
                    }
                }
                return result;
            });
            expect(clipped).toEqual([]);
            await expect(page.locator('#measurementPanel')).toContainText('435611.7258');
            await expect(page.locator('#measurementPanel')).toContainText('345678.90');
        }
    });
}
