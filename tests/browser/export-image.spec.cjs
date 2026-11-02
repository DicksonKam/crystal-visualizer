const fs = require('node:fs/promises');
const { test, expect, upload } = require('./fixtures.cjs');

const SILICON = 'Si\n1.0\n5.43 0 0\n0 5.43 0\n0 0 5.43\nSi\n2\nDirect\n0.25 0.25 0.25\n0.75 0.75 0.75\n';

function pngSize(buffer) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function savePng(page) {
    const pending = page.waitForEvent('download');
    await page.locator('#exportImage').click();
    const download = await pending;
    return { name: download.suggestedFilename(), buffer: await fs.readFile(await download.path()) };
}

// RGBA of the pixel two in from the top-left corner, which is background.
async function cornerPixel(page, buffer) {
    return page.evaluate(async base64 => {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return [...context.getImageData(2, 2, 1, 1).data];
    }, buffer.toString('base64'));
}

test('the Export menu saves a PNG of the view at the chosen size', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    const menu = page.locator('#exportMenu');
    await expect(menu).toBeHidden();
    await page.locator('#exportMenuButton').click();
    await expect(menu).toBeVisible();
    await expect(page.locator('#exportFormatLabel')).toHaveText('POSCAR');
    const view = await page.evaluate(() => ({ w: viewport.clientWidth, h: viewport.clientHeight }));
    await expect(page.locator('#exportPixels')).toHaveText(`${view.w} × ${view.h} px`);

    const one = await savePng(page);
    expect(one.name).toBe('POSCAR.png');
    expect(pngSize(one.buffer)).toEqual({ width: view.w, height: view.h });
    expect(await cornerPixel(page, one.buffer)).toEqual([10, 10, 15, 255]);
    await expect(menu).toBeHidden();
    await expect(page.locator('#statusText')).toHaveText(`Started PNG download (${view.w} × ${view.h} px)`);

    await page.locator('#exportMenuButton').click();
    await page.locator('.export-size[data-scale="2"]').click();
    await expect(page.locator('.export-size[data-scale="2"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#exportPixels')).toHaveText(`${view.w * 2} × ${view.h * 2} px`);
    await page.locator('#exportTransparent').check();
    const two = await savePng(page);
    expect(pngSize(two.buffer)).toEqual({ width: view.w * 2, height: view.h * 2 });
    expect((await cornerPixel(page, two.buffer))[3]).toBe(0);
    await expect(page.locator('#statusText')).toHaveText(`Started PNG download (${view.w * 2} × ${view.h * 2} px, transparent)`);

    // The screen is as it was: its pixel ratio, background and canvas size.
    expect(await page.evaluate(() => ({
        ratio: renderer.getPixelRatio(),
        background: scene.background.getHexString(),
        width: renderer.domElement.width / renderer.getPixelRatio()
    }))).toEqual({ ratio: 1, background: '0a0a0f', width: view.w });
});

test('the image follows the screen: background colour and a trajectory frame in the name', async ({ page }) => {
    const lines = Array.from({ length: 3 }, (_, i) => `Direct configuration= ${i + 1}\n.5 .5 .5`);
    await upload(page, `tiny\n1\n8 0 0\n0 8 0\n0 0 8\nH\n1\n${lines.join('\n')}\n`, 'tiny.xdatcar');
    await page.getByRole('radio', { name: 'White' }).click();
    await page.evaluate(() => switchToFrame(2));
    await page.locator('#exportMenuButton').click();
    await expect(page.locator('#exportFormatLabel')).toHaveText('XDATCAR');
    const saved = await savePng(page);
    expect(saved.name).toBe('tiny_frame3.png');
    expect(await cornerPixel(page, saved.buffer)).toEqual([255, 255, 255, 255]);
});

test('the Export menu closes on Escape, on a click outside, and after Structure file', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    const menu = page.locator('#exportMenu'), button = page.locator('#exportMenuButton');
    await button.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await page.locator('#statusText').click();
    await expect(menu).toBeHidden();

    await button.click();
    const pending = page.waitForEvent('download');
    await page.locator('#exportPoscar').click();
    expect((await pending).suggestedFilename()).toMatch(/\.poscar$/);
    await expect(menu).toBeHidden();
});

test('a trajectory can be saved as a movie; other files see no Movie section', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await page.locator('#exportMenuButton').click();
    await expect(page.locator('#exportMovie')).toBeHidden();
    await page.keyboard.press('Escape');

    const lines = Array.from({ length: 4 }, (_, i) => `Direct configuration= ${i + 1}\n${0.3 + i * 0.1} .5 .5`);
    await upload(page, `tiny\n1\n8 0 0\n0 8 0\n0 0 8\nH\n1\n${lines.join('\n')}\n`, 'tiny.xdatcar');
    await page.locator('#fpsSelect').selectOption('30');
    await page.evaluate(() => switchToFrame(1));
    await page.locator('#exportMenuButton').click();
    await expect(page.locator('#exportMovie')).toBeVisible();
    await expect(page.locator('#exportMovieInfo')).toHaveText('4 at 30 fps · 0.1 s');

    const pending = page.waitForEvent('download');
    await page.locator('#exportMovie').click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe('tiny.webm');
    const movie = await fs.readFile(await download.path());
    expect(movie.length).toBeGreaterThan(500);
    expect(movie.readUInt32BE(0)).toBe(0x1a45dfa3); // EBML header: a WebM/Matroska file
    await expect(page.locator('#statusText')).toHaveText(/Started WEBM download \(4 frames at 30 fps, \d+ × \d+ px\)/);
    // Back where the user was, at the screen's own pixel ratio.
    expect(await page.evaluate(() => ({ frame: currentStructure.currentFrameIndex, ratio: renderer.getPixelRatio(), playing: animationState.isPlaying }))).toEqual({ frame: 1, ratio: 1, playing: false });
});
