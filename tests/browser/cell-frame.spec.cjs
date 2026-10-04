const { test, expect, upload } = require('./fixtures.cjs');

const cells = {
    cubic: [[10, 0, 0], [0, 10, 0], [0, 0, 10]],
    skewed: [[9, 2, 1], [1, 11, 2], [2, 1, 8]]
};
const poscar = lattice => `frame\n1\n${lattice.map(row => row.join(' ')).join('\n')}\nH\n1\nDirect\n0.5 0.5 0.5\n`;

async function align(page, axis = 2, sign = 1, degrees = 0) {
    await page.evaluate(({ axis, sign, degrees }) => {
        cancelCameraAlignment();
        controls.staticMoving = true;
        const direction = getLatticeVector(currentStructure.lattice, axis).normalize().multiplyScalar(sign);
        const up = getLatticeVector(currentStructure.lattice, (axis + 1) % 3).normalize();
        const right = new THREE.Vector3().crossVectors(direction, up).normalize();
        direction.applyAxisAngle(right, degrees * Math.PI / 180);
        camera.position.copy(controls.target).addScaledVector(direction, 40);
        camera.up.copy(up);
        camera.zoom = 0.6;
        camera.updateProjectionMatrix();
        controls.update();
        camera.updateWorldMatrix(true, false);
        updateVacuumHandles();
        requestRender();
    }, { axis, sign, degrees });
}

async function handlePoint(page, extendAxis = 'a', handleType = 'far') {
    return page.evaluate(({ extendAxis, handleType }) => {
        camera.updateWorldMatrix(true, false);
        const handle = vacuumDragState.handles.find(mesh => mesh.userData.extendAxis === extendAxis && mesh.userData.handleType === handleType);
        const projected = handle.position.clone().add(structureGroup.position).project(camera);
        const rect = renderer.domElement.getBoundingClientRect();
        const direction = getScreenSpaceDirection(getLatticeVector(currentStructure.lattice, axisToIndex(extendAxis)));
        return {
            x: rect.left + (projected.x + 1) * rect.width / 2,
            y: rect.top + (1 - projected.y) * rect.height / 2,
            dx: direction.x * 40,
            dy: -direction.y * 40
        };
    }, { extendAxis, handleType });
}

for (const [name, lattice] of Object.entries(cells)) {
    test(`${name} cell image is unaffected by resize hitboxes at aligned directions and zoom levels`, async ({ page }) => {
        await upload(page, poscar(lattice), `${name}.poscar`);
        await page.locator('[data-mode="edit"]').click();
        const result = await page.evaluate(() => {
            // The synchronous sweep cannot race the app's animation loop.
            cancelCameraAlignment();
            controls.staticMoving = true;
            const target = new THREE.WebGLRenderTarget(400, 320);
            const previousTarget = renderer.getRenderTarget();
            const withHandles = new Uint8Array(400 * 320 * 4);
            const withoutHandles = new Uint8Array(withHandles.length);
            const failures = [];
            let cases = 0, alignedCases = 0;
            const draw = pixels => {
                renderer.setRenderTarget(target);
                renderer.render(scene, camera);
                renderer.readRenderTargetPixels(target, 0, 0, 400, 320, pixels);
            };
            try {
                for (const axis of [0, 1, 2]) for (const sign of [-1, 1]) {
                    const direction = getLatticeVector(currentStructure.lattice, axis).normalize().multiplyScalar(sign);
                    const baseUp = getLatticeVector(currentStructure.lattice, (axis + 1) % 3).normalize();
                    const right = new THREE.Vector3().crossVectors(direction, baseUp).normalize();
                    for (const degrees of [0, 1, 4, 6]) for (const zoom of [0.3, 0.6, 1.2]) {
                        const from = direction.clone().applyAxisAngle(right, degrees * Math.PI / 180);
                        camera.position.copy(controls.target).addScaledVector(from, 40);
                        camera.up.copy(baseUp);
                        camera.zoom = zoom;
                        camera.updateProjectionMatrix();
                        controls.update();
                        updateVacuumHandles();
                        if (vacuumDragState.handles.length) alignedCases++;
                        draw(withHandles);
                        vacuumDragState.handles.forEach(handle => { handle.visible = false; });
                        draw(withoutHandles);
                        vacuumDragState.handles.forEach(handle => { handle.visible = true; });
                        let changed = 0, framePixels = 0;
                        for (let i = 0; i < withHandles.length; i += 4) {
                            if (withHandles[i] !== withoutHandles[i] || withHandles[i + 1] !== withoutHandles[i + 1] || withHandles[i + 2] !== withoutHandles[i + 2]) changed++;
                            if (withoutHandles[i + 1] > 45 && withoutHandles[i + 1] > withoutHandles[i] * 2 && withoutHandles[i + 2] > withoutHandles[i] * 2) framePixels++;
                        }
                        if (changed || !framePixels) failures.push({ axis, sign, degrees, zoom, changed, framePixels });
                        cases++;
                    }
                }
                return { cases, alignedCases, failures, edges: unitCellEdgeLines.length };
            } finally {
                renderer.setRenderTarget(previousTarget);
                target.dispose();
                requestRender();
            }
        });
        expect(result.cases).toBe(72);
        expect(result.alignedCases).toBe(54);
        expect(result.edges).toBe(12);
        expect(result.failures).toEqual([]);
    });
}

test('picking-only handles remain immediately pickable and do not affect camera bounds', async ({ page }) => {
    await upload(page, poscar(cells.skewed), 'skewed.poscar');
    await page.locator('[data-mode="edit"]').click();
    const failures = [];
    for (const axis of [0, 1, 2]) for (const sign of [-1, 1]) {
        await align(page, axis, sign);
        const state = await page.evaluate(() => {
            // Recreate fresh meshes and deliberately do not render them before picking.
            updateVacuumHandles();
            const withHelpers = getStructureBounds();
            const handles = [...vacuumDragState.handles];
            handles.forEach(handle => structureGroup.remove(handle));
            const withoutHelpers = getStructureBounds();
            handles.forEach(handle => structureGroup.add(handle));
            const rect = renderer.domElement.getBoundingClientRect();
            const misses = [];
            handles.forEach(handle => {
                const point = handle.position.clone().add(structureGroup.position).project(camera);
                const hit = checkVacuumHandleIntersection({ clientX: rect.left + (point.x + 1) * rect.width / 2, clientY: rect.top + (1 - point.y) * rect.height / 2 });
                if (!hit || hit.extendAxis !== handle.userData.extendAxis || hit.handleType !== handle.userData.handleType) misses.push({ expected: handle.userData.extendAxis + ':' + handle.userData.handleType, hit });
            });
            return {
                count: handles.length,
                boundsMatch: withHelpers.equals(withoutHelpers),
                excluded: handles.every(handle => !orthographicCamera.layers.test(handle.layers) && !perspectiveCamera.layers.test(handle.layers)),
                misses
            };
        });
        if (state.count !== 8 || !state.boundsMatch || !state.excluded || state.misses.length) failures.push({ axis, sign, ...state });
    }
    expect(failures).toEqual([]);
});

test('handle references refresh after rebuilds and disappear when the cell or edit mode is hidden', async ({ page }) => {
    await upload(page, poscar(cells.cubic), 'frame.poscar');
    await page.locator('[data-mode="edit"]').click();
    await align(page);
    const rebuilt = await page.evaluate(() => {
        const old = [...vacuumDragState.handles];
        const disposed = new Set();
        old.forEach(handle => handle.geometry.addEventListener('dispose', () => disposed.add(handle)));
        renderStructure(currentStructure, true);
        return {
            oldRemoved: old.every(handle => handle.parent === null && disposed.has(handle)),
            newHandles: vacuumDragState.handles.length,
            attached: vacuumDragState.handles.every(handle => handle.parent === structureGroup && !old.includes(handle))
        };
    });
    expect(rebuilt).toEqual({ oldRemoved: true, newHandles: 8, attached: true });
    await page.locator('#toggleCell').click();
    expect(await page.evaluate(() => ({ active: vacuumDragState.active, handles: vacuumDragState.handles.length, edges: unitCellEdgeLines.length }))).toEqual({ active: false, handles: 0, edges: 0 });
    await page.locator('#toggleCell').click();
    expect(await page.evaluate(() => vacuumDragState.handles.length)).toBe(8);
    await page.locator('[data-mode="measure"]').click();
    expect(await page.evaluate(() => vacuumDragState.handles.length)).toBe(0);
    await page.locator('[data-mode="edit"]').click();
    expect(await page.evaluate(() => vacuumDragState.handles.length)).toBe(8);
    await page.locator('#resetView').click();
    expect(await page.evaluate(() => vacuumDragState.handles.length)).toBe(0);
    await align(page);
    await upload(page, '1\nmolecule\nH 0 0 0\n', 'molecule.xyz');
    expect(await page.evaluate(() => ({ active: vacuumDragState.active, hovered: vacuumDragState.hoveredEdge, handles: vacuumDragState.handles.length, edges: unitCellEdgeLines.length }))).toEqual({ active: false, hovered: null, handles: 0, edges: 0 });
});

for (const [name, lattice] of Object.entries(cells)) {
    test(`${name} pointer resizing keeps hover, Escape, undo and redo working with picking-only handles`, async ({ page }) => {
        await upload(page, poscar(lattice), 'frame.poscar');
        await page.locator('[data-mode="edit"]').click();
        await align(page);
        const originalLength = Math.hypot(...lattice[0]);
        const length = () => page.evaluate(() => getLatticeVector(currentStructure.lattice, 0).length());
        const point = await handlePoint(page);
        await page.mouse.move(point.x, point.y);
        await expect.poll(() => page.evaluate(() => vacuumDragState.hoveredEdge?.userData.extendAxis)).toBe('a');
        await page.mouse.down();
        await page.mouse.move(point.x + point.dx, point.y + point.dy, { steps: 4 });
        await page.mouse.up();
        expect(await length()).toBeCloseTo(originalLength + 1.2, 6);
        expect(await page.evaluate(() => vacuumDragState.handles.length)).toBe(8);
        await page.locator('#undoBtn').click();
        expect(await length()).toBeCloseTo(originalLength, 6);
        await page.locator('#redoBtn').click();
        expect(await length()).toBeCloseTo(originalLength + 1.2, 6);
        const second = await handlePoint(page);
        await page.mouse.move(second.x, second.y);
        await expect.poll(() => page.evaluate(() => Boolean(vacuumDragState.hoveredEdge))).toBe(true);
        await page.mouse.down();
        await page.mouse.move(second.x + second.dx, second.y + second.dy, { steps: 4 });
        await page.keyboard.press('Escape');
        await page.mouse.up();
        expect(await length()).toBeCloseTo(originalLength + 1.2, 6);
        expect(await page.evaluate(() => ({ dragging: vacuumDragState.isDragging, enabled: controls.enabled, undo: editHistory.undoStack.length, handles: vacuumDragState.handles.length }))).toEqual({ dragging: false, enabled: true, undo: 1, handles: 8 });
        // The opposite face still resizes the cell and translates its local atoms.
        const originalPosition = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
        const near = await handlePoint(page, 'a', 'near');
        await page.mouse.move(near.x, near.y);
        await expect.poll(() => page.evaluate(() => vacuumDragState.hoveredEdge?.userData.handleType)).toBe('near');
        await page.mouse.down();
        await page.mouse.move(near.x + near.dx, near.y + near.dy, { steps: 4 });
        await page.mouse.up();
        expect(await length()).toBeCloseTo(originalLength, 6);
        const movedPosition = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
        movedPosition.forEach((value, i) => expect(value).toBeCloseTo(originalPosition[i] - 1.2 * lattice[0][i] / originalLength, 6));
        await page.locator('#undoBtn').click();
        expect(await length()).toBeCloseTo(originalLength + 1.2, 6);
        expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(originalPosition);
    });
}

test('axis alignment and wheel input restore handles without obsolete transitions', async ({ page }) => {
    await upload(page, poscar(cells.cubic), 'frame.poscar');
    await page.locator('[data-mode="edit"]').click();
    await page.locator('[data-camera-axis="-a"]').click();
    await expect(page.locator('#statusText')).toContainText('Aligned to -a axis');
    await expect.poll(() => page.evaluate(() => vacuumDragState.handles.length)).toBe(8);
    const box = await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2);
    await page.mouse.wheel(0, 100);
    await expect.poll(() => page.evaluate(() => cameraController.phase === 'idle' && vacuumDragState.handles.length === 8)).toBe(true);
    // Mode changes cancel a real transition before its completion can restore handles.
    await page.evaluate(() => cameraController.align(cameraMath.canonical(cameraMath.axes(currentStructure.lattice)[4]), performance.now(), 'explicit', '+c'));
    await page.locator('[data-mode="measure"]').click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => ({ phase: cameraController.phase, handles: vacuumDragState.handles.length }))).toEqual({ phase: 'idle', handles: 0 });
    await page.locator('[data-mode="edit"]').click();
    await page.evaluate(() => {
        cameraController.align(cameraMath.canonical(cameraMath.axes(currentStructure.lattice)[0]), performance.now(), 'explicit', '+a');
        loadStructureFromText('1\nmolecule\nH 0 0 0\n', 'replacement.xyz');
    });
    const position = await page.evaluate(() => camera.position.toArray());
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => camera.position.toArray())).toEqual(position);
    expect(await page.evaluate(() => ({ phase: cameraController.phase, handles: vacuumDragState.handles.length }))).toEqual({ phase: 'idle', handles: 0 });
});
