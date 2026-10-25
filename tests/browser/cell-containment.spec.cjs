const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs');
const path = require('node:path');

async function edge(page, axis, side) {
    return page.evaluate(({ axis, side }) => {
        cancelCameraAlignment(); controls.staticMoving = true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 40));
        camera.up.set(0, 1, 0); camera.zoom = .8;
        camera.updateProjectionMatrix(); controls.update();
        // Two atoms in a vacuum box are framed on their own; this fixture needs the whole cell and its edges on screen.
        const frustumHeight = orthographicCamera.top - orthographicCamera.bottom;
        cameraController.setPose(cameraMath.fit(getStructureBounds(), camera.quaternion.clone(), (orthographicCamera.right - orthographicCamera.left) / frustumHeight, frustumHeight, null), 'fit');
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        updateVacuumHandles(); requestRender();
        const r = renderer.domElement.getBoundingClientRect();
        for (const h of vacuumDragState.handles.filter(h => h.userData.extendAxis === axis && h.userData.handleType === side)) {
            h.updateWorldMatrix(true, false);
            const p = h.getWorldPosition(new THREE.Vector3()).project(camera);
            const point = { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
            if (getAtomIntersection({ clientX: point.x, clientY: point.y })) continue;
            const direction = getScreenSpaceDirection(getLatticeVector(currentStructure.lattice, axisToIndex(axis)));
            const amount = -6 / VACUUM_CONFIG.dragSensitivity * (side === 'far' ? 1 : -1);
            return { ...point, dx: amount * direction.x, dy: -amount * direction.y };
        }
        throw Error('No unobscured edge');
    }, { axis, side });
}

async function geometry(page) {
    return page.evaluate(() => ({ lattice: currentStructure.lattice,
        positions: currentStructure.atoms.map(a => a.position.toArray()),
        fractional: currentStructure.atoms.map(a => a.fractional) }));
}

for (const skew of [-5, 5]) for (const side of ['near', 'far']) {
    test(`tilted cell ${skew}: ${side} shrink cannot cross atom centers`, async ({ page }, info) => {
        await upload(page, `containment\n1\n10 0 0\n${skew} 10 0\n0 0 10\nH\n2\nDirect\n.1 .9 .5\n.9 .9 .5\n`, 'containment.poscar');
        await page.locator('[data-mode="edit"]').click();
        const point = await edge(page, 'a', side);
        const before = await geometry(page);
        await page.mouse.move(point.x, point.y); await page.mouse.down();
        expect(await page.evaluate(() => vacuumDragState.isDragging)).toBe(true);
        await page.mouse.move(point.x + point.dx, point.y + point.dy, { steps: 8 });
        const preview = await geometry(page);
        expect(preview.lattice[0][0]).toBeCloseTo(9.001, 7);
        for (const f of preview.fractional) for (const value of f) expect(value).toBeGreaterThanOrEqual(-1e-10);
        for (const f of preview.fractional) for (const value of f) expect(value).toBeLessThanOrEqual(1 + 1e-10);
        await page.mouse.up(); expect(await geometry(page)).toEqual(preview);
        await page.screenshot({ path: info.outputPath('contained.png') });
        await page.locator('#undoBtn').click(); expect(await geometry(page)).toEqual(before);
        await page.locator('#redoBtn').click(); expect(await geometry(page)).toEqual(preview);
    });
}

for (const axis of ['a', 'b']) {
    test(`graphene ${axis} face remains outside every atom during shrink`, async ({ page }, info) => {
        await upload(page, fs.readFileSync(path.join(__dirname, '../../examples/poscar/graphene_sheet.poscar'), 'utf8'), 'graphene.poscar');
        await page.locator('[data-mode="edit"]').click();
        await edge(page, axis, 'far');
        const atomDrag = await page.evaluate(axis => {
            const r = renderer.domElement.getBoundingClientRect();
            const world = atomMeshes[17].getWorldPosition(new THREE.Vector3());
            const screen = world => {
                const p = world.clone().project(camera);
                return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
            };
            return { start: screen(world), end: screen(world.clone().addScaledVector(getLatticeVector(currentStructure.lattice, axisToIndex(axis)), .08)) };
        }, axis);
        const original = await geometry(page);
        await page.mouse.move(atomDrag.start.x, atomDrag.start.y); await page.mouse.down();
        expect(await page.evaluate(() => draggedAtom?.index)).toBe(17);
        await page.mouse.move(atomDrag.end.x, atomDrag.end.y, { steps: 4 }); await page.mouse.up();
        const edited = await geometry(page);
        expect(edited.positions[17]).not.toEqual(original.positions[17]);
        const idx = axis === 'a' ? 0 : 1;
        const minimumLength = Math.max(...edited.fractional.map(f => f[idx])) * Math.hypot(...edited.lattice[idx]) + .001;
        const point = await edge(page, axis, 'far');
        await page.mouse.move(point.x, point.y); await page.mouse.down();
        expect(await page.evaluate(() => vacuumDragState.isDragging)).toBe(true);
        await page.mouse.move(point.x + point.dx, point.y + point.dy, { steps: 8 });
        expect(Math.hypot(...(await geometry(page)).lattice[idx])).toBeCloseTo(minimumLength, 7);
        for (const f of (await geometry(page)).fractional) for (const value of f) {
            expect(value).toBeGreaterThanOrEqual(-1e-10); expect(value).toBeLessThanOrEqual(1 + 1e-10);
        }
        await page.mouse.up();
        await page.screenshot({ path: info.outputPath('graphene-contained.png') });
    });
}
