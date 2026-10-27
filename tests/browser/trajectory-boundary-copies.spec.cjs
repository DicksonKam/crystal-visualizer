const { test, expect, upload } = require('./fixtures.cjs');

// One atom crosses the a face between frames: inside the cell, on the face,
// inside again. The boundary copy on the far face must appear and vanish with
// the frame, not stay fixed at whatever the first frame had.
const trajectory = `boundary copies\n1\n8 0 0\n0 8 0\n0 0 8\nH\n1\n`
    + ['.5 .5 .5', '0 .5 .5', '.5 .5 .5', '1 .5 .5'].map((line, i) => `Direct configuration= ${i + 1}\n${line}`).join('\n') + '\n';

const copies = page => page.evaluate(() => atomMeshes
    .filter(mesh => mesh.userData.isGhost)
    .map(mesh => [mesh.userData.originalIndex, mesh.userData.cellOffset.a, mesh.userData.cellOffset.b, mesh.userData.cellOffset.c,
        ...mesh.position.toArray().map(value => Number(value.toFixed(6)) + 0)]));

test('boundary copies follow the atoms of each frame', async ({ page }) => {
    await upload(page, trajectory, 'copies.xdatcar');
    expect(await copies(page)).toEqual([]);
    const slider = page.locator('#frameSlider');
    await slider.press('ArrowRight');
    await expect(page.locator('#frameDisplay')).toContainText('2 /');
    expect(await copies(page)).toEqual([[0, 1, 0, 0, 8, 4, 4]]);
    await slider.press('ArrowRight');
    expect(await copies(page)).toEqual([]);
    await slider.press('ArrowRight');
    expect(await copies(page)).toEqual([[0, -1, 0, 0, 0, 4, 4]]);
    await slider.press('Home');
    expect(await copies(page)).toEqual([]);
    expect(await page.evaluate(() => atomMeshes.filter(mesh => !mesh.userData.isGhost).length)).toBe(1);
});

test('frames that keep the same copies reuse their meshes', async ({ page }) => {
    const steady = `steady\n1\n8 0 0\n0 8 0\n0 0 8\nH\n1\nDirect configuration= 1\n0 .5 .5\nDirect configuration= 2\n0 .5 .6\n`;
    await upload(page, steady, 'steady.xdatcar');
    const before = await page.evaluate(() => atomMeshes.map(mesh => mesh.uuid));
    await page.locator('#frameSlider').press('ArrowRight');
    expect(await page.evaluate(() => atomMeshes.map(mesh => mesh.uuid))).toEqual(before);
    expect(await copies(page)).toEqual([[0, 1, 0, 0, 8, 4, 4.8]]);
});

// Frames whose copies change rebuild the scene. A rotation in progress must
// carry on through those rebuilds exactly as it does through quiet frames.
test('a drag keeps rotating while frames rebuild the scene', async ({ page }) => {
    const lines = Array.from({ length: 41 }, (_, i) => `Direct configuration= ${i + 1}\n${i % 2 ? '0' : '.5'} .5 .5`);
    await upload(page, `alternating copies\n1\n8 0 0\n0 8 0\n0 0 8\nH\n1\n${lines.join('\n')}\n`, 'alternating.xdatcar');
    const drag = withFrames => page.evaluate(async withFrames => {
        const raf = () => new Promise(resolve => requestAnimationFrame(resolve));
        const canvas = renderer.domElement;
        const pointer = (type, x, y, target) => {
            const rect = canvas.getBoundingClientRect();
            target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: rect.left + x, clientY: rect.top + y,
                button: 0, buttons: type === 'pointerup' ? 0 : 1, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
        };
        switchToFrame(0); await raf(); await raf();
        const start = camera.quaternion.clone();
        pointer('pointerdown', 150, 250, canvas);
        for (let i = 1; i <= 40; i++) {
            pointer('pointermove', 150 + i * 5, 250 + i * 2, document);
            if (withFrames) switchToFrame(i);
            await raf();
        }
        pointer('pointerup', 350, 330, document);
        await raf(); await raf();
        return THREE.MathUtils.radToDeg(start.angleTo(camera.quaternion));
    }, withFrames);
    const still = await drag(false);
    const playing = await drag(true);
    expect(still).toBeGreaterThan(30);
    expect(Math.abs(playing - still)).toBeLessThan(5);
    expect(await page.evaluate(() => currentStructure.currentFrameIndex)).toBe(40);
});
