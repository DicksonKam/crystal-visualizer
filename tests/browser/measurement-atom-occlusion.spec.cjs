const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

test('a distance caption stays clear of an unselected atom projected onto its midpoint', async ({ page }, info) => {
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples/poscar/NaCl_rocksalt.poscar'), 'utf8'), 'NaCl.poscar');
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#atomJumpInput').fill('3'); await page.locator('#atomJumpInput').press('Enter');
    await page.locator('#editAtomCoordMode').selectOption('fractional');
    for (const [axis, value] of [[0, '.25'], [1, '0'], [2, '.5']]) await page.locator(`#editAtom${axis}`).fill(value);
    await page.locator('#saveAtomCoordinates').click();
    await page.locator('#clearSelectionBtn').click();
    await page.locator('[data-mode="measure"]').click();
    for (const n of [1, 5, 2]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    const before = await page.evaluate(() => currentStructure.atoms.map(atom => atom.position.toArray()));
    await page.evaluate(() => {
        cancelCameraAlignment(); controls.staticMoving = true;
        camera.position.copy(controls.target).add(new THREE.Vector3(0, 0, 30));
        camera.up.set(0, 1, 0); camera.zoom = .8; camera.updateProjectionMatrix();
        controls.update(); fitStructureToView(true); requestRender();
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: info.outputPath('caption-and-unselected-atom.png') });
    const projected = await page.evaluate(() => {
        const r = renderer.domElement.getBoundingClientRect();
        const unit = (camera.top - camera.bottom) / (camera.zoom * r.height);
        const screen = world => { const p = world.clone().project(camera); return { x: (p.x + 1) * r.width / 2, y: (1 - p.y) * r.height / 2 }; };
        const atom = atomMeshes.find(mesh => !mesh.userData.isGhost && mesh.userData.atomIndex === 2);
        const center = screen(atom.getWorldPosition(new THREE.Vector3()));
        const radius = atom.geometry.parameters.radius * atom.getWorldScale(new THREE.Vector3()).x / unit;
        const label = measurementGroup.children.find(object => object.userData.isMeasurementLabel);
        const point = screen(label.getWorldPosition(new THREE.Vector3()));
        const dx = Math.max(0, Math.abs(point.x - center.x) - label.scale.x / unit / 2);
        const dy = Math.max(0, Math.abs(point.y - center.y) - label.scale.y / unit / 2);
        return { clearance: Math.hypot(dx, dy) - radius, radius, center, point,
            anchor: (label.userData.annotationAnchor || label.position).toArray(),
            midpoint: selectedAtoms[0].mesh.getWorldPosition(new THREE.Vector3()).add(selectedAtoms[1].mesh.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5).toArray() };
    });
    await info.attach('projected-clearance', { body: JSON.stringify(projected), contentType: 'application/json' });
    expect(projected.clearance).toBeGreaterThanOrEqual(3.9);
    expect(projected.anchor).toEqual(projected.midpoint);
    expect(await page.evaluate(() => currentStructure.atoms.map(atom => atom.position.toArray()))).toEqual(before);
    await expect(page.locator('#measurementPanel')).toContainText('2.8200 Å');
    await expect(page.locator('#measurementPanel')).toContainText('90.00°');
});
