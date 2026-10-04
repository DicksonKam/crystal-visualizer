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

test('periodic distances and angle form a connected diagram with identified, non-pickable copies', async ({ page }) => {
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
    expect(triple.markers).toHaveLength(1);
    expect(triple.markers[0].index).toBe(0);
    expect(triple.markers[0].offset).toEqual([1, 0, 0]);
    expect(triple.markers[0].hits).toBe(0);
    near(triple.markers[0].position, triple.points[0]);
    // Arc endpoints must follow the same two rays as the rendered distances.
    const direction = (a, b) => { const v = a.map((value, i) => value - b[i]); const n = Math.hypot(...v); return v.map(value => value / n); };
    near(direction(triple.arc.slice(0, 3), triple.points[1]), direction(triple.points[0], triple.points[1]));
    near(direction(triple.arc.slice(-3), triple.points[1]), direction(triple.points[2], triple.points[1]));
    await expect(page.locator('#measurementPanel')).toContainText('Distance (1′—2)');
    await expect(page.locator('#measurementPanel')).toContainText('Atom 1 image +a');
    await expect(page.locator('#measurementPanel')).toContainText('0.2000 Å');
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

test('mode changes, clear, undo and document replacement dispose and restore periodic annotations correctly', async ({ page }) => {
    await upload(page, source, 'boundary.poscar');
    for (const number of [1, 2, 3]) await select(page, number);
    await page.evaluate(() => {
        window.markerDisposals = [];
        measurementGroup.children.filter(child => child.userData.isMeasurementImage).forEach(marker => {
            marker.material.addEventListener('dispose', () => window.markerDisposals.push('material'));
            marker.material.map.addEventListener('dispose', () => window.markerDisposals.push('texture'));
        });
    });
    await page.locator('#measurementModeToggle').click();
    await expect(page.locator('#measurementPanel')).toContainText('9.8000 Å');
    const selected = await state(page);
    expect(selected.markers).toHaveLength(0);
    expect(await page.evaluate(() => window.markerDisposals.sort())).toEqual(['material', 'texture']);
    const displayed = await page.evaluate(() => selectedAtoms.map(atom => atom.position.toArray()));
    selected.points.forEach((point, index) => near(point, displayed[index]));
    await page.locator('#measurementModeToggle').click();
    expect((await state(page)).markers).toHaveLength(1);
    await page.locator('[data-mode="edit"]').click();
    await expect(page.locator('#measurementPanel')).toContainText('Atom 1 image +a');
    expect((await state(page)).markers).toHaveLength(1);
    await page.locator('[data-mode="measure"]').click();
    await page.locator('#clearSelectionBtn').click();
    expect((await state(page)).markers).toHaveLength(0);
    await page.locator('#undoBtn').click();
    expect((await state(page)).markers).toHaveLength(1);
    await page.locator('#redoBtn').click();
    expect((await state(page)).markers).toHaveLength(0);
    await upload(page, '2\nmolecule\nH 0 0 0\nH 1 0 0\n', 'molecule.xyz');
    expect(await page.evaluate(() => measurementGroup.children.length)).toBe(0);
    expect(await page.locator('.camera-panel, #fitView, #autoSnap, [data-camera-axis]').count()).toBe(0);
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

test('unreliable arms do not draw a fictitious line, image marker or angle', async ({ page }) => {
    await upload(page, 'unreliable\n1\n10 0 0\n0 10 0\n0 0 10\nH\n3\nCartesian\n1e20 0 0\n0 0 0\n1 0 0\n', 'unreliable.poscar');
    for (const number of [1, 2, 3]) await select(page, number);
    await expect(page.locator('#measurementPanel')).toContainText('Unavailable');
    await expect(page.locator('#geometryWarning')).toContainText('integer precision');
    const measured = await state(page);
    expect(measured.lines).toHaveLength(1); expect(measured.markers).toHaveLength(0); expect(measured.angle).toBe(null);
    await page.locator('#measurementModeToggle').click();
    expect((await state(page)).lines).toHaveLength(2);
    expect(await page.evaluate(() => geometryWarnings.has('measurement'))).toBe(false);
    await expect(page.locator('#geometryWarning')).not.toContainText('Use Selected images');
});
