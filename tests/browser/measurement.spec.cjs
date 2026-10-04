const { test, expect, upload } = require('./fixtures.cjs');
const source = 'boundary\n1\n10 0 0\n0 10 0\n0 0 10\nH\n3\nCartesian\n.1 0 0\n9.9 0 0\n9.9 2 0\n';
async function select(page, number) {
    await page.locator('#atomJumpInput').fill(String(number));
    await page.locator('#atomJumpInput').press('Enter');
}
async function state(page) {
    return page.evaluate(() => {
        const geometry = getMeasurementGeometry();
        return {
            points: geometry.points.map(point => point.position.toArray()),
            lines: measurementGroup.children.filter(child => child.userData.isMeasurementLine)
                .map(line => [...line.geometry.attributes.position.array]),
            markers: measurementGroup.children.filter(child => child.userData.isMeasurementImage)
                .map(marker => ({ position: marker.position.toArray(), index: marker.userData.selectionIndex, offset: marker.userData.offset,
                    hits: new THREE.Raycaster().intersectObject(marker).length })),
            arc: measurementGroup.children.find(child => child.userData.isMeasurementArc)
                ? [...measurementGroup.children.find(child => child.userData.isMeasurementArc).geometry.attributes.position.array] : null,
            angle: geometry.angle?.angleDeg ?? null,
            labels: measurementGroup.children.filter(child => child.userData.isMeasurementLabel).length,
            revision: editHistory.currentEditRevision, dirty: editHistory.dirty,
            source: currentStructure.isXYZ ? generateXYZ() : generatePOSCAR()
        };
    });
}
const near = (actual, expected) => actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index], 5));

test('distances and angle connect the actual selected atoms across the cell', async ({ page }) => {
    await upload(page, source, 'boundary.poscar');
    const original = await page.evaluate(() => ({ bounds: [getStructureBounds().min.toArray(), getStructureBounds().max.toArray()], text: generatePOSCAR() }));
    await select(page, 1); await select(page, 2);
    const pair = await state(page);
    await select(page, 3);
    const triple = await state(page);
    near(triple.lines[0], pair.lines[0]);
    near(triple.lines[0].slice(3), triple.lines[1].slice(0, 3));
    near(triple.lines[0].slice(0, 3), triple.points[0]);
    near(triple.lines[0].slice(3), triple.points[1]);
    near(triple.lines[1].slice(3), triple.points[2]);
    expect(triple.angle).toBeCloseTo(90, 6);
    expect(triple.markers).toHaveLength(0);
    // Arc endpoints must follow the same two rays as the rendered distances.
    const direction = (a, b) => { const v = a.map((value, i) => value - b[i]); const n = Math.hypot(...v); return v.map(value => value / n); };
    near(direction(triple.arc.slice(0, 3), triple.points[1]), direction(triple.points[0], triple.points[1]));
    near(direction(triple.arc.slice(-3), triple.points[1]), direction(triple.points[2], triple.points[1]));
    await expect(page.locator('#measurementPanel')).toContainText('Distance (1—2)');
    await expect(page.locator('#measurementModeToggle')).toHaveCount(0);
    await expect(page.locator('#measurementPanel')).toContainText('9.8000 Å');
    expect(triple.source).toBe(original.text);
    expect(triple.revision).toBe(0); expect(triple.dirty).toBe(false);
    expect(await page.evaluate(() => [getStructureBounds().min.toArray(), getStructureBounds().max.toArray()])).toEqual(original.bounds);
    const box = await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width * .8 + 35, box.y + box.height * .2 + 20, { steps: 3 }); await page.mouse.up();
    const rotated = await state(page);
    expect(rotated.points).toEqual(triple.points);
    expect(rotated.angle).toBe(triple.angle);
});

test('mode changes, clear, undo and document replacement dispose and restore actual measurements', async ({ page }) => {
    await upload(page, source, 'boundary.poscar');
    for (const number of [1, 2, 3]) await select(page, number);
    const original = await state(page);
    await page.evaluate(() => {
        window.measurementDisposals = [];
        measurementGroup.children.filter(child => child.userData.isMeasurementVisual).forEach(child => {
            if (child.isLine) child.geometry.addEventListener('dispose', () => window.measurementDisposals.push('geometry'));
            child.material.addEventListener('dispose', () => window.measurementDisposals.push('material'));
            child.material.map?.addEventListener('dispose', () => window.measurementDisposals.push('texture'));
        });
    });
    await page.locator('[data-mode="edit"]').click();
    await expect(page.locator('#measurementPanel')).toContainText('9.8000 Å');
    expect((await state(page)).points).toEqual(original.points);
    await expect(page.locator('#measurementModeToggle')).toHaveCount(0);
    await page.locator('[data-mode="measure"]').click();
    await page.locator('#clearSelectionBtn').click();
    expect((await state(page)).lines).toHaveLength(0);
    const disposals = await page.evaluate(() => window.measurementDisposals);
    expect(disposals.filter(value => value === 'geometry')).toHaveLength(3);
    expect(disposals.filter(value => value === 'texture')).toHaveLength(3);
    expect(disposals.filter(value => value === 'material')).toHaveLength(6);
    await page.locator('#undoBtn').click();
    expect((await state(page)).points).toEqual(original.points);
    await expect(page.locator('#measurementPanel')).toContainText('9.8000 Å');
    await page.locator('#redoBtn').click();
    expect((await state(page)).lines).toHaveLength(0);
    await upload(page, '2\nmolecule\nH 0 0 0\nH 1 0 0\n', 'molecule.xyz');
    expect(await page.evaluate(() => measurementGroup.children.length)).toBe(0);
    expect(await page.locator('.camera-panel, #fitView, #autoSnap, [data-camera-axis], #measurementModeToggle').count()).toBe(0);
});

test('zero and straight angles have finite arcs and labels; coincident arms omit an undefined angle', async ({ page }) => {
    for (const [third, angle, labels] of [['2 0 0', 180, 3], ['-1 0 0', 0, 3]]) {
        await upload(page, `3\ncollinear\nH 0 0 0\nH 1 0 0\nH ${third}\n`, 'collinear.xyz');
        for (const number of [1, 2, 3]) await select(page, number);
        const measured = await state(page);
        expect(measured.angle).toBe(angle);
        expect(measured.labels).toBe(labels);
        expect(measured.arc.every(Number.isFinite)).toBe(true);
        await expect(page.locator('#measurementPanel')).toContainText(`${angle.toFixed(2)}°`);
    }
    await upload(page, '3\ncoincident\nH 0 0 0\nH 0 0 0\nH 2 0 0\n', 'coincident.xyz');
    for (const number of [1, 2, 3]) await select(page, number);
    const measured = await state(page);
    expect(measured.angle).toBe(null); expect(measured.arc).toBe(null); expect(measured.labels).toBe(2);
});

test('explicit ghost selections measure their world positions without substituting another image', async ({ page }) => {
    await upload(page, source, 'boundary.poscar');
    await page.getByRole('button', { name: 'Increase a periodic images', exact: true }).click();
    await select(page, 1);
    const displayed = await page.evaluate(() => {
        const ghost = atomMeshes.find(mesh => mesh.userData.isGhost && mesh.userData.originalIndex === 1);
        selectAtom(ghost, ghost.userData.atomIndex);
        updateMeasurements(); updateMeasurementUI();
        return selectedAtoms.map(atom => atom.position.toArray());
    });
    const measured = await state(page);
    expect(measured.points).toEqual(displayed);
    near(measured.lines[0].slice(0, 3), displayed[0]);
    near(measured.lines[0].slice(3), displayed[1]);
    expect(measured.markers).toHaveLength(0);
    const distance = Math.hypot(...displayed[1].map((value, i) => value - displayed[0][i]));
    await expect(page.locator('#measurementPanel')).toContainText(`${distance.toFixed(4)} Å`);
    await expect(page.locator('#measurementPanel')).toContainText('Distance (1—2′)');
});

test('canceling a preserved-measurement atom drag restores lines, angle and panel along with atom geometry', async ({ page }) => {
    await upload(page, '3\nrollback\nH 0 0 0\nH 2 0 0\nH 2 2 0\n', 'rollback.xyz');
    for (const n of [1, 2, 3]) await select(page, n);
    await page.locator('[data-mode="edit"]').click();
    const before = await state(page);
    const historyBefore = await page.evaluate(() => editHistory.undoStack.length);
    const point = await page.evaluate(() => {
        cancelCameraAlignment(); controls.staticMoving = true;
        const anchor = selectedAtoms[1].mesh.getWorldPosition(new THREE.Vector3());
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 20)); camera.up.set(0, 1, 0);
        camera.zoom = .8; camera.updateProjectionMatrix(); camera.lookAt(controls.target);
        controls.update(); camera.updateWorldMatrix(true, false); requestRender();
        const p = anchor.project(camera), r = renderer.domElement.getBoundingClientRect();
        return { x: r.left + (p.x+1)*r.width/2, y: r.top + (1-p.y)*r.height/2 };
    });
    await page.mouse.move(point.x, point.y); await page.mouse.down();
    await page.mouse.move(point.x-40, point.y+30, {steps:4});
    expect(await page.evaluate(() => isDragging)).toBe(true);
    expect((await state(page)).points).not.toEqual(before.points);
    await page.keyboard.press('Escape'); await page.mouse.up();
    const after = await state(page);
    expect(after.points).toEqual(before.points); expect(after.lines).toEqual(before.lines);
    expect(after.arc).toEqual(before.arc); expect(after.angle).toBe(before.angle);
    expect(after.source).toBe(before.source); expect(after.dirty).toBe(false);
    expect(await page.evaluate(() => editHistory.undoStack.length)).toBe(historyBefore);
    await expect(page.locator('#measurementPanel')).toContainText('2.0000 Å');
});
