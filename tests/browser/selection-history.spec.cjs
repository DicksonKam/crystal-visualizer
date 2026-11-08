const { test, expect, upload, setMode } = require('./fixtures.cjs');
const source = '5\nselection history\nH 0 0 0\nH 2 0 0\nH 0 2 0\nH 2 2 0\nH 1 1 2\n';
// The edit selection and the measurements are separate: both are restored by
// selection history, from identities, never from cached positions.
async function state(page) {
    return page.evaluate(() => ({ mode: currentMode,
        indices: selectedAtoms.map(atom => atom.index), rings: selectionRings.length,
        measured: measuredAtoms().map(atom => atom.index), markers: measurementMarkers.length,
        lines: measurementGroup.children.filter(child => child.userData.isMeasurementLine).length,
        positions: selectedAtoms.map(atom => atom.position.toArray()),
        actual: selectedAtoms.map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()).toArray()),
        measuredPositions: measuredAtoms().map(atom => atom.position.toArray()),
        measuredActual: measuredAtoms().map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()).toArray()),
        revision: editHistory.currentEditRevision, dirty: editHistory.dirty,
        undo: editHistory.undoStack.length, redo: editHistory.redoStack.length }));
}
async function select(page, number) {
    await page.locator('#atomJumpInput').fill(String(number));
    await page.locator('#atomJumpInput').press('Enter');
}

test('undo and redo restore the context of an edit multi-selection without making it a measurement', async ({ page }) => {
    await upload(page, source, 'selection.xyz');
    await setMode(page, 'edit');
    await page.evaluate(() => {
        for (let i = 0; i < 5; i++) selectAtomForEdit(atomMeshes[i], i);
        updateEditUI();
    });
    const before = await state(page);
    expect(before.indices).toEqual([0, 1, 2, 3, 4]);
    await setMode(page, 'measure');
    expect((await state(page)).indices).toEqual([]);
    const cleared = await state(page);
    for (let repeat = 0; repeat < 3; repeat++) {
        await page.locator('#undoBtn').click();
        const restored = await state(page);
        expect(restored.mode).toBe('edit'); expect(restored.measured).toEqual([]);
        expect(restored.indices).toEqual(before.indices);
        expect(restored.rings).toBe(5); expect(restored.lines).toBe(0); expect(restored.markers).toBe(0);
        expect(restored.positions).toEqual(restored.actual);
        expect(restored.undo).toBe(before.undo); expect(restored.redo).toBe(1);
        await expect(page.locator('[data-mode="edit"]')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.measurement-readout')).toHaveCount(0);
        await page.locator('#redoBtn').click();
        const redone = await state(page);
        expect(redone.mode).toBe('measure'); expect(redone.indices).toEqual([]);
        expect(redone.undo).toBe(cleared.undo); expect(redone.redo).toBe(0);
        expect(redone.revision).toBe(0); expect(redone.dirty).toBe(false);
    }
});

test('measurement undo restores the measurement, preserves order and resolves current positions', async ({ page }) => {
    await upload(page, source, 'selection.xyz');
    for (const n of [1, 2, 3]) await select(page, n);
    await page.evaluate(() => unmeasureAtom(1));
    expect((await state(page)).measured).toEqual([0, 2]);
    await page.locator('#undoBtn').click();
    expect((await state(page)).measured).toEqual([0, 1, 2]);
    await page.locator('#redoBtn').click();
    expect((await state(page)).measured).toEqual([0, 2]);
    await page.locator('#undoBtn').click();
    await setMode(page, 'edit');
    await page.locator('#clearMeasurementBtn').click();
    expect((await state(page)).measured).toEqual([]);
    // Simulate a newer view/geometry before restoration: history must resolve
    // identities, never replay saved world-space coordinates or append records.
    await page.evaluate(() => {
        atomMeshes[1].position.add(new THREE.Vector3(0.3, 0.4, 0.5));
        selectAtom(atomMeshes[0], 0, true);
    });
    await page.locator('#undoBtn').click();
    const restored = await state(page);
    expect(restored.mode).toBe('edit');
    expect(restored.measured).toEqual([0, 1, 2]); expect(restored.markers).toBe(3);
    expect(restored.indices).toEqual([]); expect(restored.rings).toBe(0);
    expect(restored.lines).toBe(2); expect(restored.measuredPositions).toEqual(restored.measuredActual);
    const distance = Math.hypot(...restored.measuredPositions[1].map((value, i) => value - restored.measuredPositions[0][i]));
    await expect(page.locator('.measurement-readout')).toContainText(`${distance.toFixed(4)} Å`);
    // Duplicate or surplus descriptors cannot create duplicate or fourth markers.
    await page.evaluate(() => {
        measurements[0].atoms.push({ ...measurements[0].atoms[0] });
        measurements[0].atoms.push({ index: 3, originalIndex: 3, isGhost: false, cellOffset: null, element: 'H' });
        pruneMeasurements(); rebuildSelectionVisuals(); updateUI_forCurrentMode();
    });
    const guarded = await state(page);
    expect(guarded.measured).toEqual([0, 1, 2]); expect(guarded.markers).toBe(3);
});

test('measurement history distinguishes periodic copies and safely omits copies no longer displayed', async ({ page }) => {
    await upload(page, 'copies\n1\n4 0 0\n0 4 0\n0 0 4\nH\n1\nCartesian\n1 1 1\n', 'copies.poscar');
    await page.evaluate(() => {
        settings.periodic.a = 3; renderStructure(currentStructure, true);
        for (const mesh of atomMeshes.slice(0, 3)) measureAtom(mesh);
    });
    const original = await state(page);
    expect(original.measured).toHaveLength(3);
    expect(new Set(original.measured).size).toBe(3);
    await page.locator('#clearMeasurementBtn').click();
    await page.evaluate(() => renderStructure(currentStructure, true));
    await page.locator('#undoBtn').click();
    const restored = await state(page);
    expect(restored.measured).toEqual(original.measured);
    expect(restored.measuredPositions).toEqual(restored.measuredActual);
    await expect(page.locator('#measurementPanel')).toContainText('4.0000 Å');
    await page.locator('#redoBtn').click();
    await page.evaluate(() => { settings.periodic.a = 2; renderStructure(currentStructure, true); });
    await page.locator('#undoBtn').click();
    const smaller = await state(page);
    expect(smaller.measured).toEqual(original.measured.slice(0, 2));
    expect(smaller.measuredPositions).toEqual(smaller.measuredActual);
    expect(smaller.markers).toBe(2); expect(smaller.lines).toBe(1);
    const sanitized = await page.evaluate(() => {
        const saved = captureSelectionState();
        saved.measurements[0].atoms.push(saved.measurements[0].atoms[0]);
        applySelectionState(saved);
        return measuredAtoms().map(atom => atom.index);
    });
    expect(sanitized).toEqual(smaller.measured);
});

test('document replacement clears measurements, and a disappearing periodic copy leaves its measurement', async ({ page }) => {
    await upload(page, source, 'first.xyz');
    await select(page,1); await select(page,2);
    await setMode(page, 'edit');
    expect((await state(page)).measured).toEqual([0, 1]);
    await upload(page, source, 'replacement.xyz');
    const cleared=await state(page);
    expect(cleared.indices).toEqual([]); expect(cleared.measured).toEqual([]);
    await select(page,1);
    expect((await state(page)).indices).toEqual([0]);
    expect((await state(page)).measured).toEqual([]);
    await page.locator('#undoBtn').click();
    expect((await state(page)).indices).toEqual([]);
    await page.locator('#redoBtn').click();
    expect((await state(page)).indices).toEqual([0]);
    expect((await state(page)).measured).toEqual([]);
    await upload(page, 'copies\n1\n4 0 0\n0 4 0\n0 0 4\nH\n1\nCartesian\n1 1 1\n', 'copies.poscar');
    await setMode(page, 'measure');
    await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();
    await page.evaluate(()=>{
        const ghost=atomMeshes.find(mesh=>mesh.userData.isGhost);
        measureAtom(ghost);
    });
    await setMode(page, 'edit');
    expect((await state(page)).measured).toHaveLength(1);
    await expect(page.locator('.measurement-readout')).toHaveCount(1);
    await page.getByRole('button',{name:'Decrease a periodic images',exact:true}).click();
    const disappeared=await state(page);
    expect(disappeared.measured).toEqual([]); expect(disappeared.indices).toEqual([]);
    expect(disappeared.markers).toBe(0); expect(disappeared.lines).toBe(0);
    await expect(page.locator('.measurement-readout')).toHaveCount(0);
});

test('measurement undo and redo keep the currently displayed trajectory frame', async ({ page }) => {
    const content=await require('node:fs/promises').readFile(require('node:path').resolve(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8');
    await upload(page,content,'H2_vibration.xdatcar');
    await select(page,1); await select(page,2);
    await page.locator('#frameSlider').focus(); await page.locator('#frameSlider').press('End');
    const frame=await page.evaluate(()=>({index:currentStructure.currentFrameIndex,positions:currentStructure.atoms.map(a=>a.position.toArray())}));
    expect(frame.index).toBe(15);
    await page.locator('#undoBtn').click();
    expect((await state(page)).measured).toEqual([0]);
    expect(await page.evaluate(()=>({index:currentStructure.currentFrameIndex,positions:currentStructure.atoms.map(a=>a.position.toArray())}))).toEqual(frame);
    await page.locator('#redoBtn').click();
    const redone=await state(page);
    expect(redone.measured).toEqual([0,1]); expect(redone.measuredPositions).toEqual(redone.measuredActual);
    expect(await page.evaluate(()=>({index:currentStructure.currentFrameIndex,positions:currentStructure.atoms.map(a=>a.position.toArray())}))).toEqual(frame);
    expect(redone.revision).toBe(0); expect(redone.dirty).toBe(false);
});
