const { test, expect, upload } = require('./fixtures.cjs');

const SILICON = 'Si\n1.0\n5.43 0 0\n0 5.43 0\n0 0 5.43\nSi\n2\nDirect\n0.25 0.25 0.25\n0.75 0.75 0.75\n';

// Zoom of the active camera as one number: orthographic zoom, or 1/distance.
const zoomLevel = page => page.evaluate(() =>
    camera.isOrthographicCamera ? camera.zoom : 1 / camera.position.distanceTo(controls.target));

// Wait until the controls' damping has settled: ten consecutive animation
// frames without a zoom change (below 1e-4, which the damping reaches after
// about forty frames). The damping runs only in animation frames, and a
// headless browser drawing through SwiftShader delivers few of them in the
// first seconds after a load (Chrome's new headless mode none at all), so a
// fixed wait would measure a zoom that has barely begun. See docs/camera.md.
const settle = page => page.evaluate(() => new Promise(resolve => {
    const zoom = () => camera.isOrthographicCamera ? camera.zoom : 1 / camera.position.distanceTo(controls.target);
    let frames = 0, stable = 0, last = zoom();
    const check = () => {
        const now = zoom();
        stable = Math.abs(now / last - 1) < 1e-4 ? stable + 1 : 0;
        last = now;
        if (++frames >= 10 && stable >= 10) resolve(); else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
}));

// Dispatch wheel events at the canvas centre the way a browser does for a pinch.
async function wheel(page, events) {
    await page.evaluate(async events => {
        const canvas = renderer.domElement, box = canvas.getBoundingClientRect();
        for (const init of events) {
            canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaMode: 0,
                clientX: box.left + box.width / 2, clientY: box.top + box.height / 2, ...init }));
            await new Promise(resolve => setTimeout(resolve, 16));
        }
    }, events);
    await settle(page);
}

test('a burst of small wheel events, as a trackpad scroll sends, keeps all of its input', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await settle(page);
    const start = await zoomLevel(page);
    await wheel(page, [{ deltaY: -300 }]);
    const oneEvent = await zoomLevel(page);
    await wheel(page, Array.from({ length: 30 }, () => ({ deltaY: -10 })));
    const burst = await zoomLevel(page);
    // The same 300 px delivered as 30 events zooms about as much as one event.
    expect(Math.log(burst / oneEvent) / Math.log(oneEvent / start)).toBeGreaterThan(0.8);
    expect(Math.log(burst / oneEvent) / Math.log(oneEvent / start)).toBeLessThan(1.25);
});

test('a trackpad pinch zooms about as much as a few wheel ticks, in both directions', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await settle(page);
    const start = await zoomLevel(page);
    // A pinch-in in Chrome: a dozen ctrl+wheel events with small negative deltas.
    await wheel(page, Array.from({ length: 12 }, () => ({ deltaY: -10, ctrlKey: true })));
    const pinchedIn = await zoomLevel(page);
    expect(pinchedIn / start).toBeGreaterThan(1.3);
    expect(pinchedIn / start).toBeLessThan(4);
    await wheel(page, Array.from({ length: 12 }, () => ({ deltaY: 10, ctrlKey: true })));
    const pinchedOut = await zoomLevel(page);
    expect(pinchedOut / pinchedIn).toBeLessThan(0.8);

    // A plain scroll is unchanged: one tick of 100 px zooms, but not as much as the pinch.
    const beforeTick = await zoomLevel(page);
    await wheel(page, [{ deltaY: -100 }]);
    const afterTick = await zoomLevel(page);
    expect(afterTick / beforeTick).toBeGreaterThan(1.05);
    expect(afterTick / beforeTick).toBeLessThan(pinchedIn / start);
});

test('a Safari pinch gesture zooms by its scale and the page itself does not zoom', async ({ page }) => {
    await upload(page, SILICON, 'POSCAR');
    await settle(page);
    const start = await zoomLevel(page);
    const defaultPrevented = await page.evaluate(async () => {
        const canvas = renderer.domElement, box = canvas.getBoundingClientRect();
        const at = { bubbles: true, cancelable: true, clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
        const gesture = (type, scale) => { const e = new Event(type, at); Object.assign(e, { scale, clientX: at.clientX, clientY: at.clientY }); canvas.dispatchEvent(e); return e.defaultPrevented; };
        const prevented = [gesture('gesturestart', 1)];
        for (let i = 1; i <= 10; i++) { prevented.push(gesture('gesturechange', 1 + i * 0.05)); await new Promise(r => setTimeout(r, 16)); }
        prevented.push(gesture('gestureend', 1.5));
        return prevented.every(Boolean);
    });
    expect(defaultPrevented).toBe(true);
    await settle(page);
    const zoomed = await zoomLevel(page);
    expect(zoomed / start).toBeGreaterThan(1.2);
    expect(zoomed / start).toBeLessThan(3);
});
