const { test, expect, upload } = require('./fixtures.cjs');
const cell = (lattice = [[10, 0, 0], [0, 10, 0], [0, 0, 10]]) => `camera\n1\n${lattice.map(row => row.join(' ')).join('\n')}\nH\n2\nDirect\n.2 .3 .4\n.7 .6 .5\n`;
const canvas = page => page.locator('canvas[aria-label^="3D structure"]');
async function pose(page) {
    return page.evaluate(() => ({ q: camera.quaternion.toArray(), pivot: controls.target.toArray(), position: camera.position.toArray(),
        distance: camera.position.distanceTo(controls.target), zoom: camera.zoom, phase: cameraController.phase,
        direction: cameraMath.back(camera.quaternion).toArray() }));
}
function nearArray(actual, expected, digits = 7) { actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], digits)); }
async function seed(page, angle = 8, roll = 0) {
    await page.evaluate(({ angle, roll }) => {
        cancelCameraAlignment();
        const q = cameraMath.orientation([Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180), 0], [0, 0, 1]);
        q.premultiply(new THREE.Quaternion().setFromAxisAngle(cameraMath.back(q), roll * Math.PI / 180));
        applyCameraPose({ ...getCameraPose(), quaternion: q });
        clearManualCameraMotion();
        window.cameraAlignments = [];
        if (!window.originalCameraAlign) window.originalCameraAlign = cameraController.align;
        cameraController.align = function (q, time, kind, name) {
            const start = getCameraPose();
            window.cameraAlignments.push({ kind, name, correction: cameraMath.degrees(cameraMath.angularDistance(start.quaternion, q)),
                pivot: start.pivot.toArray(), distance: start.distance, zoom: start.zoom });
            return window.originalCameraAlign.call(this, q, time, kind, name);
        };
    }, { angle, roll });
}
async function drag(page, dx, dy = 0, button = 'left') {
    const box = await canvas(page).boundingBox();
    const x = box.x + box.width * .8, y = box.y + box.height * .2;
    await page.mouse.move(x, y);
    await page.mouse.down({ button });
    await page.mouse.move(x + dx, y + dy);
    await page.waitForTimeout(45);
    await page.mouse.up({ button });
}

test('real approaching rotation settles with normal damping and snaps within the total correction budget', async ({ page }) => {
    await upload(page, cell(), 'camera.poscar');
    await seed(page);
    expect(await page.evaluate(() => ({ staticMoving: controls.staticMoving, damping: controls.dynamicDampingFactor }))).toEqual({ staticMoving: false, damping: .15 });
    const start = await pose(page);
    await drag(page, 2);
    await expect.poll(() => page.evaluate(() => window.cameraAlignments.filter(value => value.kind === 'automatic').length), { timeout: 6000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => cameraController.phase)).toBe('idle');
    const result = await pose(page);
    nearArray(result.direction, [1, 0, 0]);
    nearArray(result.pivot, start.pivot);
    expect(result.distance).toBeCloseTo(start.distance, 7);
    expect(result.zoom).toBe(start.zoom);
    expect(await page.evaluate(() => window.cameraAlignments[0].correction)).toBeLessThanOrEqual(5 + 1e-8);
    await page.waitForTimeout(600);
    nearArray((await pose(page)).q, result.q);
    expect(await page.evaluate(() => window.cameraAlignments.length)).toBe(1);
});

test('departing rotation, an elongated cell outside the cone, zoom, pan and clicks do not snap', async ({ page }) => {
    await upload(page, cell([[5, 0, 0], [0, 5, 0], [0, 0, 100]]), 'elongated.poscar');
    await seed(page, 3);
    await drag(page, -1);
    await page.waitForTimeout(1600);
    expect(await page.evaluate(() => window.cameraAlignments.length)).toBe(0);
    expect(await page.evaluate(() => cameraMath.degrees(cameraMath.back(camera.quaternion).angleTo(new THREE.Vector3(1, 0, 0))))).toBeGreaterThan(3);
    await seed(page, 30);
    await drag(page, .5);
    await page.waitForTimeout(1600);
    expect(await page.evaluate(() => window.cameraAlignments.length)).toBe(0);
    await seed(page, 3);
    const before = await pose(page);
    const box = await canvas(page).boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(600);
    const zoomed = await pose(page);
    nearArray(zoomed.q, before.q);
    expect(zoomed.zoom).not.toBe(before.zoom);
    await drag(page, 25, 10, 'right');
    await page.waitForTimeout(600);
    const panned = await pose(page);
    nearArray(panned.q, before.q);
    expect(panned.pivot).not.toEqual(before.pivot);
    await drag(page, 0);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.cameraAlignments.length)).toBe(0);
});

test('six explicit signed lattice views preserve pose contracts and camera actions leave the document unchanged', async ({ page }) => {
    await upload(page, cell([[9, 2, 1], [1, 11, 2], [2, 1, 8]]), 'skew.poscar');
    const documentState = () => page.evaluate(() => ({ text: generatePOSCAR(), undo: editHistory.undoStack.length, redo: editHistory.redoStack.length, dirty: editHistory.dirty, revision: editHistory.currentEditRevision }));
    const original = await documentState();
    for (const name of ['+a', '-a', '+b', '-b', '+c', '-c']) {
        const before = await pose(page);
        await page.getByRole('button', { name: `View from ${name}`, exact: true }).click();
        await expect.poll(() => page.evaluate(() => cameraController.phase)).toBe('idle');
        const expected = await page.evaluate(name => cameraMath.axes(currentStructure.lattice).find(axis => axis.name === name).direction.toArray(), name);
        const after = await pose(page);
        nearArray(after.direction, expected);
        nearArray(after.pivot, before.pivot);
        expect(after.zoom).toBe(before.zoom);
        expect(after.distance).toBeCloseTo(before.distance, 7);
    }
    await page.locator('#fitView').click();
    await page.locator('#resetView').click();
    expect(await documentState()).toEqual(original);
});

test('pointer interruption, focus, Auto Snap off and scene changes invalidate active movement', async ({ page }) => {
    await upload(page, cell(), 'camera.poscar');
    await seed(page, 3);
    // Start with real damped input, then explicitly align before its inertia finishes.
    await drag(page, -2);
    await page.evaluate(() => cameraController.align(cameraMath.canonical(cameraMath.axes(currentStructure.lattice)[4]), performance.now(), 'explicit', '+c'));
    const box = await canvas(page).boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2);
    await page.mouse.down();
    expect(await page.evaluate(() => cameraController.interacting)).toBe(true);
    const before = await pose(page);
    await page.mouse.move(box.x + box.width * .8 + 8, box.y + box.height * .2);
    await page.waitForTimeout(45);
    await page.mouse.up();
    expect((await pose(page)).q).not.toEqual(before.q);
    await page.locator('#autoSnap').uncheck();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => cameraController.phase)).toBe('idle');
    // Atom focus during an actual automatic snap preserves the interrupted orientation.
    await page.locator('#autoSnap').check();
    await seed(page);
    await drag(page, 2);
    await expect.poll(() => page.evaluate(() => cameraController.transitioning), { timeout: 6000, intervals: [10] }).toBe(true);
    const focused = await page.evaluate(() => {
        const q = camera.quaternion.toArray(), zoom = camera.zoom, revision = editHistory.currentEditRevision;
        jumpToAtom(1);
        return { q, zoom, revision, target: atomMeshes[0].getWorldPosition(new THREE.Vector3()).toArray(), actual: camera.quaternion.toArray() };
    });
    nearArray(focused.actual, focused.q);
    await page.waitForTimeout(600);
    const after = await pose(page);
    nearArray(after.q, focused.q);
    nearArray(after.pivot, focused.target);
    expect(after.zoom).toBe(focused.zoom);
    expect(await page.evaluate(() => editHistory.currentEditRevision)).toBe(focused.revision);
    await expect(page.locator('#statusText')).toContainText('Selected atom #1');
    // Turning Auto Snap off cancels an active transition as well as pending capture.
    await seed(page);
    await drag(page, 2);
    await expect.poll(() => page.evaluate(() => cameraController.transitioning), { timeout: 6000, intervals: [10] }).toBe(true);
    await page.locator('#autoSnap').uncheck();
    const stopped = await pose(page);
    await page.waitForTimeout(400);
    nearArray((await pose(page)).q, stopped.q);
    await page.evaluate(() => {
        cameraController.align(cameraMath.canonical(cameraMath.axes(currentStructure.lattice)[4]), performance.now(), 'explicit', '+c');
        renderStructure(currentStructure, true);
    });
    const rebuilt = await pose(page);
    await page.waitForTimeout(400);
    nearArray((await pose(page)).q, rebuilt.q);
});

test('Fit View fits narrow large scenes and Reset restores deterministic roll', async ({ page }) => {
    await page.setViewportSize({ width: 650, height: 800 });
    await upload(page, cell([[500, 0, 0], [0, 500, 0], [0, 0, 500]]), 'large.poscar');
    await seed(page, 32, 68);
    const before = await pose(page);
    await page.locator('#fitView').click();
    nearArray((await pose(page)).q, before.q);
    const projected = await page.evaluate(() => {
        camera.updateMatrixWorld(true);
        const b = getStructureBounds(), result = [];
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) result.push(new THREE.Vector3(x, y, z).project(camera).toArray());
        return { points: result, near: camera.near, far: camera.far };
    });
    projected.points.forEach(point => point.forEach(value => expect(Math.abs(value)).toBeLessThan(1)));
    expect(projected.near).toBeGreaterThan(0);
    expect(projected.far).toBeGreaterThan(500);
    await page.locator('#resetView').click();
    const first = await pose(page);
    await seed(page, -45, 170);
    await page.locator('#resetView').click();
    const second = await pose(page);
    nearArray(second.q, first.q); nearArray(second.pivot, first.pivot);
    expect(second.zoom).toBeCloseTo(first.zoom, 9);
    await page.setViewportSize({ width: 430, height: 850 });
    await page.locator('#fitView').click();
    for (const selector of ['#autoSnap', '#fitView', '[data-camera-axis="+a"]']) {
        const rect = await page.locator(selector).boundingBox();
        expect(rect.width).toBeGreaterThan(0); expect(rect.x).toBeGreaterThanOrEqual(0); expect(rect.x + rect.width).toBeLessThanOrEqual(430);
    }
});

test('reduced motion, keyboard axis controls and molecule navigation remain accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await upload(page, cell(), 'camera.poscar');
    const button = page.getByRole('button', { name: 'View from -b', exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    expect((await pose(page)).phase).toBe('idle');
    nearArray((await pose(page)).direction, [0, -1, 0]);
    await seed(page);
    await drag(page, 2);
    await expect.poll(() => page.evaluate(() => window.cameraAlignments.filter(value => value.kind === 'automatic').length), { timeout: 6000 }).toBe(1);
    expect((await pose(page)).phase).toBe('idle');
    nearArray((await pose(page)).direction, [1, 0, 0]);
    await upload(page, '2\nmolecule\nH 0 0 0\nH 1 0 0\n', 'molecule.xyz');
    await expect(page.locator('#autoSnap')).toBeDisabled();
    for (const button of await page.locator('[data-camera-axis]').all()) await expect(button).toBeDisabled();
    await expect(page.locator('#fitView')).toBeEnabled();
    const before = await pose(page);
    await drag(page, 10);
    expect((await pose(page)).q).not.toEqual(before.q);
    await page.locator('#atomJumpInput').fill('1');
    await expect(page.locator('#atomJumpInput')).toHaveValue('1');
});

test('the real controls and controller produce equivalent timestamped gestures at 30, 60 and 120 Hz', async ({ page }) => {
    await upload(page, cell(), 'camera.poscar');
    const results = await page.evaluate(() => {
        const nativeNow = performance.now.bind(performance);
        const results = [];
        // Run synchronously between animation frames, with identical input times
        // and the real controls' normal private damping state at each display rate.
        let clock = 1000;
        Object.defineProperty(performance, 'now', { configurable: true, value: () => clock });
        try {
            for (const fps of [30, 60, 120]) {
                cancelCameraAlignment();
                applyCameraPose({ ...getCameraPose(), quaternion: cameraMath.orientation([Math.cos(8 * Math.PI / 180), Math.sin(8 * Math.PI / 180), 0], [0, 0, 1]) });
                clearManualCameraMotion();
                const captured = [], original = cameraController.align;
                cameraController.align = function (q, time, kind, name) {
                    captured.push({ kind, correction: cameraMath.degrees(cameraMath.angularDistance(camera.quaternion, q)), time });
                    return original.call(this, q, time, kind, name);
                };
                const rect = renderer.domElement.getBoundingClientRect();
                const x = rect.left + rect.width * .8, y = rect.top + rect.height * .2;
                const input = (type, dx = 0) => renderer.domElement.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'mouse', pointerId: 99,
                    button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x + dx, clientY: y }));
                const start = clock;
                input('pointerdown');
                clock = start + 10; input('pointermove', 2);
                // Advancing to the same release time consumes exactly the same
                // simulation steps even when rendering samples arrive differently.
                for (let elapsed = 1000 / fps; elapsed < 100; elapsed += 1000 / fps) {
                    clock = start + elapsed; updateCamera(clock);
                }
                clock = start + 100; updateCamera(clock); input('pointerup', 2);
                for (let elapsed = 100 + 1000 / fps; elapsed <= 2600; elapsed += 1000 / fps) {
                    clock = start + elapsed; updateCamera(clock);
                }
                results.push({ fps, q: camera.quaternion.toArray(), phase: cameraController.phase, captured,
                    staticMoving: controls.staticMoving });
                cameraController.align = original;
                clock = start + 3000;
            }
        } finally {
            delete performance.now;
            cancelCameraAlignment();
            manualCameraTickAt = nativeNow();
        }
        return results;
    });
    results.forEach(result => {
        expect(result.staticMoving).toBe(false);
        expect(result.phase).toBe('idle');
        expect(result.captured).toHaveLength(1);
        expect(result.captured[0].kind).toBe('automatic');
        expect(result.captured[0].correction).toBeLessThanOrEqual(5 + 1e-8);
        nearArray(result.q, results[0].q);
        expect(result.captured[0].correction).toBeCloseTo(results[0].captured[0].correction, 6);
    });
});
