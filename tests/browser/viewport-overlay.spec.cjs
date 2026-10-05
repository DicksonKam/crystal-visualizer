const { test, expect, upload } = require('./fixtures.cjs');

for (const size of [{ width: 320, height: 480 }, { width: 1280, height: 420 }]) {
    for (const loaded of [false, true]) {
        test(`example picker content remains reachable at ${size.width}x${size.height}, loaded=${loaded}`, async ({ page }, info) => {
            await page.setViewportSize(size);
            if (loaded) {
                await upload(page, '2\nwater fragment\nH 0 0 0\nO 1 0 0\n', 'fragment.xyz');
                await page.locator('#examplesBtn').click();
            }
            await page.locator('.drop-zone-scroll').evaluate(e => { e.scrollTop = 0; });
            await page.screenshot({ path: info.outputPath('picker-top.png') });
            const box = await page.locator('#dropZone').boundingBox();
            const prompt = await page.locator('.drop-zone-content').boundingBox();
            // A top scroll position must expose the start of the picker; flex
            // centering overflow used to put it at an unreachable negative y.
            expect(prompt.y).toBeGreaterThanOrEqual(box.y);
            await page.getByRole('button', { name: 'Si diamond Direct · cubic', exact: true }).scrollIntoViewIfNeeded();
            await expect(page.getByRole('button', { name: 'Si diamond Direct · cubic', exact: true })).toBeInViewport();
            await page.getByRole('button', { name: 'H₂O wobble 24-frame animation', exact: true }).scrollIntoViewIfNeeded();
            await expect(page.getByRole('button', { name: 'H₂O wobble 24-frame animation', exact: true })).toBeInViewport();
            await page.screenshot({ path: info.outputPath('picker-bottom.png') });
            if (loaded) {
                await expect(page.locator('#closeDropZone')).toBeInViewport();
                await page.locator('#closeDropZone').click();
                await expect(page.locator('#dropZone')).toBeHidden();
                await expect(page.locator('#statusText')).toContainText('Loaded');
            }
        });
    }
}

test('camera help follows the viewer width when the desktop sidebar expands', async ({ page }, info) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await upload(page, '2\nwater fragment\nH 0 0 0\nO 1 0 0\n', 'fragment.xyz');
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
    await page.screenshot({ path: info.outputPath('narrow-viewer.png') });
    const hint = page.locator('.controls-hint');
    if (await hint.isVisible()) {
        const view = await page.locator('.viewport-container').boundingBox();
        const box = await hint.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(view.x);
        expect(box.x + box.width).toBeLessThanOrEqual(view.x + view.width);
    }
    // Restore the wide viewer: the same controls must become available again.
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Home');
    await expect(hint).toBeVisible();
    await page.screenshot({ path: info.outputPath('wide-viewer.png') });
});
