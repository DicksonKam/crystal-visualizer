const { test, expect, upload } = require('./fixtures.cjs');

const trajectory = `boundary scrubbing\n1\n8 0 0\n0 8 0\n0 0 8\nH\n2\n${Array.from({ length: 3 }, (_, i) => `Direct configuration= ${i + 1}\n.2 .5 .5\n${.4 + i * .05} .5 .5`).join('\n')}\n`;

for (const [boundary, keys] of [
    ['Home', ['Home', 'ArrowLeft', 'ArrowDown', 'PageDown']],
    ['End', ['End', 'ArrowRight', 'ArrowUp', 'PageUp']]
]) {
    test(`keyboard scrubbing at ${boundary} pauses even when the native range value cannot change`, async ({ page }, info) => {
        await upload(page, trajectory, 'boundary.xdatcar');
        if (!await page.locator('#loopCheckbox').isChecked()) await page.locator('.loop-toggle').click();
        await page.locator('#fpsSelect').selectOption('1');
        const slider = page.locator('#frameSlider');
        await slider.press(boundary);
        const frame = await slider.inputValue();
        // Freeze playback time, not keyboard input, so every key is tested at
        // the actual boundary without a timer tick moving the native range.
        const time = new Date('2026-10-05T00:00:00Z');
        await page.clock.install({ time });
        await page.clock.pauseAt(time);
        await page.evaluate(() => {
            window.boundaryInputCount = 0;
            document.getElementById('frameSlider').addEventListener('input', () => window.boundaryInputCount++);
        });
        for (const key of keys) {
            await page.locator('#playPause').click();
            expect(await page.evaluate(() => animationState.isPlaying)).toBe(true);
            await slider.press('Shift');
            expect(await page.evaluate(() => animationState.isPlaying)).toBe(true);
            await slider.press(key);
            expect(await slider.inputValue()).toBe(frame);
            expect(await page.evaluate(() => window.boundaryInputCount)).toBe(0);
            expect(await page.evaluate(() => animationState.isPlaying)).toBe(false);
            expect(await page.evaluate(() => animationState.intervalId)).toBeNull();
            await expect(page.locator('#playPause')).toHaveAttribute('aria-label', 'Play trajectory');
            await page.clock.runFor(1200);
            expect(await slider.inputValue()).toBe(frame);
        }
        await page.screenshot({ path: info.outputPath('boundary-scrub-paused.png') });
    });
}
