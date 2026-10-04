const { test, expect, upload } = require('./fixtures.cjs');
const source = 'axes overlay\n1\n10 0 0\n0 10 0\n0 0 10\nH\n1\nDirect\n.5 .5 .5\n';

// Read the actual animation loop's framebuffer immediately after each pass.
// No screenshot timing, drawing-buffer retention, or duplicate render loop.
async function capturePasses(page) {
    return page.evaluate(() => new Promise(resolve => {
        const original = renderer.render;
        const scale = renderer.getPixelRatio(), side = Math.floor(100 * scale);
        const read = () => {
            const gl = renderer.getContext(), pixels = new Uint8Array(side * side * 4);
            gl.readPixels(Math.floor(10 * scale), Math.floor(10 * scale), side, side, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            return pixels;
        };
        let before;
        renderer.render = function (subject, view) {
            const result = original.call(this, subject, view);
            if (subject === scene) before = read();
            if (subject === axesScene && before) {
                const after = read();
                renderer.render = original;
                let changed = 0, transparent = 0, content = 0;
                for (let i = 0; i < after.length; i += 4) {
                    if (after[i] !== before[i] || after[i + 1] !== before[i + 1] || after[i + 2] !== before[i + 2] || after[i + 3] !== before[i + 3]) changed++;
                    if (after[i + 3] !== 255) transparent++;
                    if (before[i] > 50) content++;
                }
                // Resolve after animate() restores its renderer state.
                queueMicrotask(() => resolve({ changed, transparent, content,
                    autoClear: renderer.autoClear, scissor: renderer.getScissorTest(),
                    viewport: renderer.getViewport(new THREE.Vector4()).toArray(),
                    expectedViewport: [0, 0, viewport.clientWidth, viewport.clientHeight] }));
            }
            return result;
        };
        requestRender();
    }));
}

for (const deviceScaleFactor of [1, 2]) {
    test.describe(`axes overlay at device scale ${deviceScaleFactor}`, () => {
        test.use({ deviceScaleFactor });
        test('preserves opaque background and underlying content at wide and narrow sizes', async ({ page }) => {
            await upload(page, source, 'axes.poscar');
            for (const width of [1440, 600]) {
                await page.setViewportSize({ width, height: 800 });
                await page.evaluate(() => {
                    cancelCameraAlignment();
                    structureGroup.visible = false;
                    axesGroup.visible = true;
                });
                const visible = await capturePasses(page);
                expect(visible.transparent).toBe(0);
                expect(visible.changed).toBeGreaterThan(0); // Axes actually draw.
                expect(visible.autoClear).toBe(true);
                expect(visible.scissor).toBe(false);
                expect(visible.viewport).toEqual(visible.expectedViewport);
                await page.evaluate(() => {
                    axesGroup.visible = false;
                    camera.updateMatrixWorld(true);
                    const w = viewport.clientWidth, h = viewport.clientHeight;
                    const low = new THREE.Vector3(2 * 10 / w - 1, 2 * 10 / h - 1, 0).unproject(camera);
                    const right = new THREE.Vector3(2 * 110 / w - 1, 2 * 10 / h - 1, 0).unproject(camera);
                    const high = new THREE.Vector3(2 * 10 / w - 1, 2 * 110 / h - 1, 0).unproject(camera);
                    const center = right.clone().add(high).multiplyScalar(.5);
                    // Put visible scene content directly under the overlay.
                    window.overlayTestPlane = new THREE.Mesh(new THREE.PlaneGeometry(low.distanceTo(right), low.distanceTo(high)),
                        new THREE.MeshBasicMaterial({ color: 0x884422, depthTest: false, depthWrite: false }));
                    window.overlayTestPlane.position.copy(center);
                    window.overlayTestPlane.quaternion.copy(camera.quaternion);
                    scene.add(window.overlayTestPlane);
                });
                const covered = await capturePasses(page);
                expect(covered.content).toBeGreaterThan(1000);
                expect(covered.changed).toBe(0); // Empty HUD cannot erase the scene.
                expect(covered.transparent).toBe(0);
                await page.evaluate(() => {
                    scene.remove(window.overlayTestPlane);
                    window.overlayTestPlane.geometry.dispose(); window.overlayTestPlane.material.dispose();
                    delete window.overlayTestPlane;
                    structureGroup.visible = true; axesGroup.visible = true;
                    requestRender();
                });
            }
            await page.locator('#toggleAxes').click();
            expect(await page.evaluate(() => renderer.autoClear)).toBe(true);
            await page.locator('#toggleAxes').click();
            expect((await capturePasses(page)).transparent).toBe(0);
        });
    });
}
