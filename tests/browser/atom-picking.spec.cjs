const { test, expect, upload } = require('./fixtures.cjs');
const cells = { cubic: [[10, 0, 0], [0, 10, 0], [0, 0, 10]], skewed: [[9, 2, 1], [1, 11, 2], [2, 1, 8]] };

async function alignAndPoints(page, sign) {
    return page.evaluate(sign => {
        cancelCameraAlignment(); controls.staticMoving = true;
        const axis = getLatticeVector(currentStructure.lattice, 2).normalize().multiplyScalar(sign);
        camera.position.copy(controls.target).addScaledVector(axis, 40);
        camera.up.copy(getLatticeVector(currentStructure.lattice, 0).normalize());
        camera.zoom = .9; camera.updateProjectionMatrix(); controls.update();
        camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
        updateVacuumHandles();
        vacuumDragState.handles.forEach(handle => handle.updateWorldMatrix(true, false));
        requestRender();
        const anchor = atomMeshes[0].getWorldPosition(new THREE.Vector3());
        const shift = getLatticeVector(currentStructure.lattice, 1).multiplyScalar(-.2);
        shift.addScaledVector(axis, -shift.dot(axis));
        const rect = renderer.domElement.getBoundingClientRect();
        const screen = world => {
            const p = world.clone().project(camera);
            return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
        };
        const atom = screen(anchor);
        raycaster.setFromCamera(new THREE.Vector2((atom.x-rect.left)/rect.width*2-1, 1-(atom.y-rect.top)/rect.height*2), camera);
        const overlaps = raycaster.intersectObjects(vacuumDragState.handles).length;
        const handle = vacuumDragState.handles.find(h => h.userData.extendAxis === 'a' && h.userData.handleType === 'far');
        return { atom, target: screen(anchor.clone().add(shift)), emptyEdge: screen(handle.getWorldPosition(new THREE.Vector3())), overlaps,
            original: currentStructure.atoms[0].position.toArray(), expected: anchor.clone().add(shift).sub(structureGroup.position).toArray() };
    }, sign);
}

for (const [name, lattice] of Object.entries(cells)) for (const sign of [-1, 1]) {
    test(`${name}, view ${sign}: boundary atoms win hover, click and drag over overlapping frame handles`, async ({ page }) => {
        await upload(page, `boundary\n1\n${lattice.map(v => v.join(' ')).join('\n')}\nH\n1\nDirect\n0 .5 0\n`, 'boundary.poscar');
        await page.locator('[data-mode="edit"]').click();
        const points = await alignAndPoints(page, sign);
        expect(points.overlaps).toBeGreaterThan(0);
        await page.mouse.move(points.atom.x, points.atom.y);
        expect(await page.evaluate(() => vacuumDragState.hoveredEdge)).toBeNull();
        await page.mouse.click(points.atom.x, points.atom.y);
        expect(await page.evaluate(() => selectedAtoms.map(atom => atom.index))).toEqual([0]);
        expect(await page.evaluate(() => vacuumDragState.isDragging)).toBe(false);
        await page.mouse.move(points.emptyEdge.x, points.emptyEdge.y);
        expect(await page.evaluate(() => Boolean(vacuumDragState.hoveredEdge))).toBe(true);
        // Leave a stale handle highlight before pointer-down at the atom. This
        // mimics a view/target change without an intervening pointermove.
        await page.evaluate(({ atom }) => {
            renderer.domElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, button: 0, buttons: 1, clientX: atom.x, clientY: atom.y }));
        }, points);
        expect(await page.evaluate(() => ({ atom: draggedAtom?.index, cell: vacuumDragState.isDragging, hover: Boolean(vacuumDragState.hoveredEdge) })))
            .toEqual({ atom: 0, cell: false, hover: false });
        await page.evaluate(() => cancelEditDrag());
        await page.mouse.move(points.atom.x, points.atom.y);
        await page.mouse.down();
        expect(await page.evaluate(() => draggedAtom?.index)).toBe(0);
        await page.mouse.move(points.target.x, points.target.y, { steps: 4 });
        expect(await page.evaluate(() => vacuumDragState.isDragging)).toBe(false);
        await page.mouse.up();
        const moved = await page.evaluate(() => ({ lattice: currentStructure.lattice, position: currentStructure.atoms[0].position.toArray() }));
        expect(moved.lattice).toEqual(lattice);
        moved.position.forEach((v, i) => expect(v).toBeCloseTo(points.expected[i], 5));
        // First frame gesture after moving a boundary atom must start immediately.
        await page.mouse.move(points.emptyEdge.x, points.emptyEdge.y);
        await page.evaluate(() => clearVacuumHighlight());
        await page.mouse.down();
        expect(await page.evaluate(() => vacuumDragState.isDragging)).toBe(true);
        await page.mouse.move(points.emptyEdge.x + 25, points.emptyEdge.y + 25, { steps: 3 });
        await page.mouse.up();
        expect(await page.evaluate(() => editHistory.undoStack.at(-1).type)).toBe('vacuum_drag');
        await page.locator('#undoBtn').click();
        await page.locator('#undoBtn').click();
        expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(points.original);
        await page.locator('#redoBtn').click();
        const redone = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
        redone.forEach((v, i) => expect(v).toBeCloseTo(moved.position[i], 5));
    });
}
