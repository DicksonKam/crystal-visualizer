const { test, expect, upload } = require('./fixtures.cjs');
const structure = 'boundary atom\n1\n4 0 0\n0 4 0\n0 0 4\nH\n1\nCartesian\n0 2 2\n';

test('boundary guide and movement cover all six cell faces and constrain tangent sections', async ({ page }) => {
    await upload(page, structure, 'boundary.poscar');
    const result = await page.evaluate(() => {
        const checks = [];
        const mesh = atomMeshes[0];
        for (let axis = 0; axis < 3; axis++) for (const side of [0, 4]) {
            const position = new THREE.Vector3(2, 2, 2); position.setComponent(axis, side);
            mesh.position.copy(position);
            const anchor = position.clone().add(structureGroup.position);
            const normal = new THREE.Vector3(1e-15, -1e-15, 1e-15); normal.setComponent(axis, 1);
            normal.normalize();
            draggedAtom = { mesh, startWorldPosition: anchor };
            dragPlane.setFromNormalAndCoplanarPoint(normal, anchor);
            createDragGuidePlane();
            const other = [0, 1, 2].filter(i => i !== axis);
            const vertices = dragGuidePlane.geometry.attributes.position;
            const corners = [];
            for (const a of [0, 4]) for (const b of [0, 4]) {
                const target = position.clone(); target.setComponent(other[0], a); target.setComponent(other[1], b);
                const world = target.add(structureGroup.position);
                corners.push(constrainToPolygon(world).distanceTo(world));
            }
            const outside = position.clone(); outside.setComponent(other[0], -2); outside.setComponent(other[1], 6);
            const clamped = constrainToPolygon(outside.add(structureGroup.position)).sub(structureGroup.position);
            checks.push({ count: dragPolygon2D.length, triangles: vertices.count, corners,
                clamped: [clamped.getComponent(other[0]), clamped.getComponent(other[1]), clamped.getComponent(axis)] });
        }
        // A plane touching only an edge/corner must constrain, never divide by
        // zero or silently allow movement outside the cell.
        mesh.position.set(0, 0, 0);
        const anchor = structureGroup.position.clone();
        const tangents = [];
        for (const normal of [new THREE.Vector3(1, 1, 0).normalize(), new THREE.Vector3(1, 1, 1).normalize()]) {
            draggedAtom = { mesh, startWorldPosition: anchor };
            dragPlane.setFromNormalAndCoplanarPoint(normal, anchor);
            createDragGuidePlane();
            tangents.push(constrainToPolygon(anchor.clone().add(new THREE.Vector3(-2, 2, 8))).sub(anchor).toArray());
        }
        removeDragGuidePlane(); draggedAtom = null;
        return { checks, tangents };
    });
    for (const [index, face] of result.checks.entries()) {
        expect(face.count).toBe(4);
        expect(face.triangles).toBe(6);
        for (const error of face.corners) expect(error).toBeLessThan(1e-10);
        expect(face.clamped[0]).toBeCloseTo(0, 9);
        expect(face.clamped[1]).toBeCloseTo(4, 9);
        expect(face.clamped[2]).toBeCloseTo(index % 2 ? 4 : 0, 9);
    }
    expect(result.tangents[0]).toEqual([0, 0, 4]);
    expect(result.tangents[1]).toEqual([0, 0, 0]);
});

test('pointer dragging reaches both halves of a boundary face and supports undo/redo', async ({ page }) => {
    await upload(page, structure, 'boundary.poscar');
    await page.locator('[data-mode="edit"]').click();
    const points = await page.evaluate(() => {
        cameraController.cancel('test-setup');
        const center = new THREE.Vector3(0, 2, 2).add(structureGroup.position);
        controls.target.copy(center);
        camera.position.copy(center).add(new THREE.Vector3(-16, 0, 0));
        camera.up.set(0, 1, 0);
        camera.lookAt(center); camera.updateMatrixWorld(true);
        controls.update(); scene.updateMatrixWorld(true);
        requestRender();
        const rect = renderer.domElement.getBoundingClientRect();
        const screen = coordinates => {
            const p = new THREE.Vector3(...coordinates).add(structureGroup.position).project(camera);
            return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
        };
        return { start: screen([0, 2, 2]), first: screen([0, 0.5, 0.5]), second: screen([0, 3.5, 3.5]), outside: screen([0, -1, 5]) };
    });
    await page.mouse.move(points.start.x, points.start.y);
    await page.mouse.down();
    await page.mouse.move(points.first.x, points.first.y, { steps: 4 });
    expect(await page.evaluate(() => dragPolygon2D.length)).toBe(4);
    expect(await page.evaluate(() => dragGuidePlane.geometry.attributes.position.count)).toBe(6);
    for (const [name, coordinates] of [['first', [0, 0.5, 0.5]], ['second', [0, 3.5, 3.5]], ['outside', [0, 0, 4]]]) {
        await page.mouse.move(points[name].x, points[name].y, { steps: 4 });
        const actual = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
        actual.forEach((value, axis) => expect(value).toBeCloseTo(coordinates[axis], 5));
    }
    await page.mouse.up();
    await expect(page.locator('#statusText')).toContainText('Moved atom #1');
    expect(await page.evaluate(() => dragGuidePlane)).toBeNull();
    await page.locator('#undoBtn').click();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual([0, 2, 2]);
    await page.locator('#redoBtn').click();
    const restored = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    restored.forEach((value, axis) => expect(value).toBeCloseTo([0, 0, 4][axis], 5));
});

test('boundary atom drag preview rebuilds bonds before pointer release', async ({ page }) => {
    await upload(page, 'preview\n1\n4 0 0\n0 4 0\n0 0 4\nH\n2\nCartesian\n0 2 2\n0 3 2\n', 'preview.poscar');
    await page.locator('[data-mode="edit"]').click();
    const points = await page.evaluate(() => {
        settings.useElementRadii = false; settings.bondThreshold = 1.5;
        rebuildBonds(); cancelCameraAlignment(); controls.staticMoving = true;
        const center = new THREE.Vector3(0, 2, 2).add(structureGroup.position);
        controls.target.copy(center); camera.position.copy(center).add(new THREE.Vector3(-16, 0, 0));
        camera.up.set(0, 1, 0); camera.lookAt(center); controls.update();
        camera.updateMatrixWorld(true); scene.updateMatrixWorld(true);
        const rect = renderer.domElement.getBoundingClientRect();
        const screen = xyz => { const p = new THREE.Vector3(...xyz).add(structureGroup.position).project(camera);
            return { x: rect.left+(p.x+1)*rect.width/2, y: rect.top+(1-p.y)*rect.height/2 }; };
        return { start: screen([0,2,2]), end: screen([0,.5,.5]) };
    });
    const bonds = () => page.evaluate(() => structureGroup.children.filter(c => c.userData.isBond).length);
    expect(await bonds()).toBe(1);
    await page.mouse.move(points.start.x, points.start.y); await page.mouse.down();
    await page.mouse.move(points.end.x, points.end.y, { steps: 4 });
    expect(await bonds()).toBe(0);
    await page.keyboard.press('Escape'); await page.mouse.up();
    expect(await bonds()).toBe(1);
});
