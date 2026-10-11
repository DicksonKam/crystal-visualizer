const { test, expect, upload } = require('./fixtures.cjs');
const { capture } = require('../stress/edit-scenario.cjs');
const { compareGeometry, checkMeasurement, checkBondRefresh } = require('./measurement-edit-helpers.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

test('water measurements survive mouse navigation, resizing, editing and selection history', async ({ page }, info) => {
    test.setTimeout(240000);
    await upload(page, await fs.readFile(path.join(__dirname, '../../examples/xyz/H2O.xyz'), 'utf8'), 'H2O.xyz');
    for (const n of [2, 1, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    for (let cycle = 0; cycle < 6; cycle++) {
        await page.setViewportSize({ width: cycle % 2 ? 900 : 1280, height: cycle % 3 ? 800 : 650 });
        await page.locator('#resetView').click();
        const before = await checkMeasurement(page);
        const empty = await page.evaluate(() => {
            const r = renderer.domElement.getBoundingClientRect();
            for (const [x, y] of [[.8, .15], [.2, .15], [.8, .8], [.15, .8]]) {
                const point = { x: r.left + r.width * x, y: r.top + r.height * y };
                if (!getAtomIntersection({ clientX: point.x, clientY: point.y })) return point;
            }
            throw Error('No empty navigation start');
        });
        // These are ordinary mouse gestures, not a scripted camera pose.
        await page.mouse.move(empty.x, empty.y); await page.mouse.down();
        await page.mouse.move(empty.x + 28, empty.y + 18, { steps: 6 }); await page.mouse.up();
        await page.mouse.move(empty.x, empty.y); await page.mouse.down({ button: 'right' });
        await page.mouse.move(empty.x - 16, empty.y + 12, { steps: 4 }); await page.mouse.up({ button: 'right' });
        await page.mouse.wheel(0, cycle % 2 ? -70 : 70);
        compareGeometry((await checkMeasurement(page)).geometry, before.geometry);
        await page.screenshot({ path: info.outputPath(`${cycle}-navigated.png`) });
        // Choose a visible measured atom after the gestures. Picking must
        // agree with what the marker represents, even after camera changes.
        const atom = await page.evaluate(() => {
            const r = renderer.domElement.getBoundingClientRect();
            for (const selected of selectedAtoms) {
                const p = selected.mesh.getWorldPosition(new THREE.Vector3()).project(camera);
                const point = { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
                if (getAtomIntersection({ clientX: point.x, clientY: point.y })?.object === selected.mesh) return { ...point, index: selected.index };
            }
            throw Error('No visible measured atom after navigation');
        });
        await page.mouse.move(atom.x, atom.y); await page.mouse.down();
        expect(await page.evaluate(() => draggedAtom?.index)).toBe(atom.index);
        await page.mouse.move(atom.x + (cycle % 2 ? -26 : 26), atom.y - 20, { steps: 6 });
        await checkMeasurement(page); await page.mouse.up();
        const after = await checkMeasurement(page);
        expect(after.geometry).not.toEqual(before.geometry);
        await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, before.geometry);
        await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry, after.geometry);
        await checkBondRefresh(page);
        await page.locator('#clearSelectionBtn').click();
        expect((await capture(page)).selection.identities).toHaveLength(0);
        await page.locator('#undoBtn').click(); await checkMeasurement(page);
        await page.locator('[data-mode="measure"]').click();
        await page.locator('[data-mode="edit"]').click(); await checkMeasurement(page);
        await page.locator('#resetView').click();
        await page.screenshot({ path: info.outputPath(`${cycle}-edited-and-restored.png`) });
    }
});
