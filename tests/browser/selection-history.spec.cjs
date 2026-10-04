const { test, expect, upload } = require('./fixtures.cjs');
const source = '5\nselection history\nH 0 0 0\nH 2 0 0\nH 0 2 0\nH 2 2 0\nH 1 1 2\n';
async function state(page) {
    return page.evaluate(() => ({ mode: currentMode, measurement: isMeasurementSelection,
        indices: selectedAtoms.map(atom => atom.index), rings: selectionRings.length,
        lines: measurementGroup.children.filter(child => child.userData.isMeasurementLine).length,
        positions: selectedAtoms.map(atom => atom.position.toArray()),
        actual: selectedAtoms.map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()).toArray()),
        revision: editHistory.currentEditRevision, dirty: editHistory.dirty,
        undo: editHistory.undoStack.length, redo: editHistory.redoStack.length }));
}
async function select(page, number) {
    await page.locator('#atomJumpInput').fill(String(number));
    await page.locator('#atomJumpInput').press('Enter');
}

test('undo and redo restore the context of an edit multi-selection without making an oversized measurement', async ({ page }) => {
    await upload(page, source, 'selection.xyz');
    await page.locator('[data-mode="edit"]').click();
    await page.evaluate(() => {
        for (let i = 0; i < 5; i++) selectAtomForEdit(atomMeshes[i], i);
        updateEditUI();
    });
    const before = await state(page);
    expect(before.indices).toEqual([0, 1, 2, 3, 4]);
    await page.locator('[data-mode="measure"]').click();
    expect((await state(page)).indices).toEqual([]);
    const cleared = await state(page);
    for (let repeat = 0; repeat < 3; repeat++) {
        await page.locator('#undoBtn').click();
        const restored = await state(page);
        expect(restored.mode).toBe('edit'); expect(restored.measurement).toBe(false);
        expect(restored.indices).toEqual(before.indices);
        expect(restored.rings).toBe(5); expect(restored.lines).toBe(0);
        expect(restored.positions).toEqual(restored.actual);
        expect(restored.undo).toBe(before.undo); expect(restored.redo).toBe(1);
        await expect(page.locator('[data-mode="edit"]')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('#measurementPanel')).not.toContainText('Measurement Preserved');
        await page.locator('#redoBtn').click();
        const redone = await state(page);
        expect(redone.mode).toBe('measure'); expect(redone.indices).toEqual([]);
        expect(redone.undo).toBe(cleared.undo); expect(redone.redo).toBe(0);
        expect(redone.revision).toBe(0); expect(redone.dirty).toBe(false);
    }
});

test('measurement undo replaces the selection, preserves order and resolves current positions', async ({ page }) => {
    await upload(page, source, 'selection.xyz');
    for (const n of [1, 2, 3]) await select(page, n);
    await page.evaluate(() => deselectAtom(1));
    expect((await state(page)).indices).toEqual([0, 2]);
    await page.locator('#undoBtn').click();
    expect((await state(page)).indices).toEqual([0, 1, 2]);
    await page.locator('#redoBtn').click();
    expect((await state(page)).indices).toEqual([0, 2]);
    await page.locator('#undoBtn').click();
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#clearSelectionBtn').click();
    // Simulate a newer view/geometry before restoration: history must resolve
    // identities, never replay saved world-space coordinates or append records.
    await page.evaluate(() => {
        atomMeshes[1].position.add(new THREE.Vector3(0.3, 0.4, 0.5));
        selectAtom(atomMeshes[0], 0, true);
    });
    await page.locator('#undoBtn').click();
    const restored = await state(page);
    expect(restored.mode).toBe('edit'); expect(restored.measurement).toBe(true);
    expect(restored.indices).toEqual([0, 1, 2]); expect(restored.rings).toBe(3);
    expect(restored.lines).toBe(2); expect(restored.positions).toEqual(restored.actual);
    const distance = Math.hypot(...restored.positions[1].map((value, i) => value - restored.positions[0][i]));
    await expect(page.locator('#measurementPanel')).toContainText(`${distance.toFixed(4)} Å`);
    // Defensive entry-point checks cannot create duplicate or fourth markers.
    await page.evaluate(() => {
        selectAtom(atomMeshes[1], 1);
        selectAtom(atomMeshes[3], 3);
        rebuildSelectionVisuals(); updateUI_forCurrentMode();
    });
    expect((await state(page)).indices).toEqual([0, 1, 2]);
});

test('selection history distinguishes periodic copies and safely omits copies no longer displayed', async ({ page }) => {
    await upload(page, 'copies\n1\n4 0 0\n0 4 0\n0 0 4\nH\n1\nCartesian\n1 1 1\n', 'copies.poscar');
    await page.evaluate(() => {
        settings.periodic.a = 3; renderStructure(currentStructure, true);
        for (const mesh of atomMeshes) selectAtom(mesh, mesh.userData.atomIndex);
        updateMeasurements(); updateMeasurementUI();
    });
    const original = await state(page);
    expect(original.indices).toHaveLength(3);
    expect(new Set(original.indices).size).toBe(3);
    await page.locator('#clearSelectionBtn').click();
    await page.evaluate(() => renderStructure(currentStructure, true));
    await page.locator('#undoBtn').click();
    const restored = await state(page);
    expect(restored.indices).toEqual(original.indices);
    expect(restored.positions).toEqual(restored.actual);
    await expect(page.locator('#measurementPanel')).toContainText('4.0000 Å');
    await page.locator('#redoBtn').click();
    await page.evaluate(() => { settings.periodic.a = 2; renderStructure(currentStructure, true); });
    await page.locator('#undoBtn').click();
    const smaller = await state(page);
    expect(smaller.indices).toEqual(original.indices.slice(0, 2));
    expect(smaller.positions).toEqual(smaller.actual);
    expect(smaller.rings).toBe(2); expect(smaller.lines).toBe(1);
    const sanitized = await page.evaluate(() => {
        const saved = captureSelectionState();
        saved.selected.push(saved.selected[0]);
        applySelectionState(saved);
        return selectedAtoms.map(atom => atom.index);
    });
    expect(sanitized).toEqual(smaller.indices);
});

test('document replacement and disappearing periodic selections reset measurement purpose', async ({ page }) => {
    await upload(page, source, 'first.xyz');
    await select(page,1); await select(page,2);
    await page.locator('[data-mode="edit"]').click();
    expect((await state(page)).measurement).toBe(true);
    await upload(page, source, 'replacement.xyz');
    const cleared=await state(page);
    expect(cleared.indices).toEqual([]); expect(cleared.measurement).toBe(false);
    await select(page,1);
    expect((await state(page)).measurement).toBe(false);
    await page.locator('#undoBtn').click();
    expect((await state(page)).indices).toEqual([]);
    expect((await state(page)).measurement).toBe(false);
    await page.locator('#redoBtn').click();
    expect((await state(page)).indices).toEqual([0]);
    expect((await state(page)).measurement).toBe(false);
    await upload(page, 'copies\n1\n4 0 0\n0 4 0\n0 0 4\nH\n1\nCartesian\n1 1 1\n', 'copies.poscar');
    await page.locator('[data-mode="measure"]').click();
    await page.getByRole('button',{name:'Increase a periodic images',exact:true}).click();
    await page.evaluate(()=>{
        const ghost=atomMeshes.find(mesh=>mesh.userData.isGhost);
        selectAtom(ghost,ghost.userData.atomIndex); updateMeasurements(); updateMeasurementUI();
    });
    await page.locator('[data-mode="edit"]').click();
    expect((await state(page)).measurement).toBe(true);
    await page.getByRole('button',{name:'Decrease a periodic images',exact:true}).click();
    const disappeared=await state(page);
    expect(disappeared.indices).toEqual([]); expect(disappeared.measurement).toBe(false);
    expect(disappeared.rings).toBe(0); expect(disappeared.lines).toBe(0);
});

test('selection undo and redo keep the currently displayed trajectory frame', async ({ page }) => {
    const content=await require('node:fs/promises').readFile(require('node:path').resolve(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8');
    await upload(page,content,'H2_vibration.xdatcar');
    await select(page,1); await select(page,2);
    await page.locator('#frameSlider').focus(); await page.locator('#frameSlider').press('End');
    const frame=await page.evaluate(()=>({index:currentStructure.currentFrameIndex,positions:currentStructure.atoms.map(a=>a.position.toArray())}));
    expect(frame.index).toBe(15);
    await page.locator('#undoBtn').click();
    expect((await state(page)).indices).toEqual([0]);
    expect(await page.evaluate(()=>({index:currentStructure.currentFrameIndex,positions:currentStructure.atoms.map(a=>a.position.toArray())}))).toEqual(frame);
    await page.locator('#redoBtn').click();
    const redone=await state(page);
    expect(redone.indices).toEqual([0,1]); expect(redone.positions).toEqual(redone.actual);
    expect(await page.evaluate(()=>({index:currentStructure.currentFrameIndex,positions:currentStructure.atoms.map(a=>a.position.toArray())}))).toEqual(frame);
    expect(redone.revision).toBe(0); expect(redone.dirty).toBe(false);
});
