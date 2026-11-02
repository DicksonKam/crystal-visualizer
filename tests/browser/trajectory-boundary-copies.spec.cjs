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
// The bug this guards: a frame whose boundary copies changed rebuilds the
// scene, and a rebuild used to recreate the camera controls, which ended the
// drag at the first such frame. The check is the mechanism itself (the
// controls instance survives and the gesture stays active) plus a rotation
// far above what a drag cut short at frame 1 could reach.
test('a drag keeps rotating while frames rebuild the scene', async ({ page }) => {
    const lines = Array.from({ length: 41 }, (_, i) => `Direct configuration= ${i + 1}\n${i % 2 ? '0' : '.5'} .5 .5`);
    await upload(page, `alternating copies\n1\n8 0 0\n0 8 0\n0 0 8\nH\n1\n${lines.join('\n')}\n`, 'alternating.xdatcar');
    const result = await page.evaluate(async () => {
        const raf = () => new Promise(resolve => requestAnimationFrame(resolve));
        const canvas = renderer.domElement;
        const pointer = (type, x, y, target) => {
            const rect = canvas.getBoundingClientRect();
            target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: rect.left + x, clientY: rect.top + y,
                button: 0, buttons: type === 'pointerup' ? 0 : 1, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
        };
        switchToFrame(0); await raf(); await raf();
        const start = camera.quaternion.clone();
        let swaps = 0, interactingThroughout = true, rebuilds = 0;
        pointer('pointerdown', 150, 250, canvas);
        // New input may recreate the controls once; from here on they must survive.
        const adapter = controls;
        for (let i = 1; i <= 40; i++) {
            pointer('pointermove', 150 + i * 5, 250 + i * 2, document);
            const meshBefore = atomMeshes[0];
            switchToFrame(i);
            if (atomMeshes[0] !== meshBefore) rebuilds++;
            await raf();
            if (controls !== adapter) swaps++;
            if (!cameraController.interacting) interactingThroughout = false;
        }
        pointer('pointerup', 350, 330, document);
        await raf(); await raf();
        return { degrees: THREE.MathUtils.radToDeg(start.angleTo(camera.quaternion)), swaps, interactingThroughout, rebuilds, frame: currentStructure.currentFrameIndex };
    });
    expect(result.rebuilds).toBe(40);
    expect(result.swaps).toBe(0);
    expect(result.interactingThroughout).toBe(true);
    // A drag cut short at frame 1 reaches about 3 degrees; a busy machine that drops frames still gets well past 10.
    expect(result.degrees).toBeGreaterThan(10);
    expect(result.frame).toBe(40);
});
