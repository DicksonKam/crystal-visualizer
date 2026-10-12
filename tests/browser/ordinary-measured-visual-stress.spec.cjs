const { test, expect, upload } = require('./fixtures.cjs');
const { checkMeasurement, compareGeometry, checkBondRefresh } = require('./measurement-edit-helpers.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

// Keep measurements active throughout: random exploration can otherwise spend
// most of a chain without captions, or at a scale too small to inspect them.
for (const dpr of [1, 2]) for (const source of ['xyz/H2O.xyz', 'poscar/NaCl_rocksalt.poscar', 'xyz/CH4.xyz', 'poscar/graphene_sheet.poscar']) {
    test.describe(`${source} DPR ${dpr}`, () => {
        test.use({ deviceScaleFactor: dpr });
        test('measured editing remains coherent through rotation and panel gestures', async ({ page }, info) => {
            test.setTimeout(240000);
            await upload(page, await fs.readFile(path.join(__dirname, '../../examples', source), 'utf8'), path.basename(source));
            await page.locator('#showLabels').check();
            for (const n of [2, 1, 3]) {
                await page.locator('#atomJumpInput').fill(String(n));
                await page.locator('#atomJumpInput').press('Enter');
            }
            await page.locator('[data-mode="edit"]').click();
            await page.locator('#resetView').click();
            for (let cycle = 0; cycle < 6; cycle++) {
                const before = await checkMeasurement(page);
                const point = await page.evaluate(() => {
                    const r = renderer.domElement.getBoundingClientRect();
                    for (const selected of selectedAtoms) {
                        const p = selected.mesh.getWorldPosition(new THREE.Vector3()).project(camera);
                        const q = { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
                        if (q.x > r.left + 25 && q.x < r.right - 25 && q.y > r.top + 25 && q.y < r.bottom - 25 && getAtomIntersection({ clientX: q.x, clientY: q.y })?.object === selected.mesh) return { ...q, index: selected.index };
                    }
                    throw Error('No visible measured atom to edit');
                });
                await page.mouse.move(point.x, point.y); await page.mouse.down();
                expect(await page.evaluate(() => draggedAtom?.index)).toBe(point.index);
                await page.mouse.move(point.x + (cycle % 2 ? -14 : 14), point.y - 9, { steps: 6 });
                await checkMeasurement(page);
                await page.screenshot({ path: info.outputPath(`${cycle}-atom-held.png`) });
                await page.mouse.up();
                const placed = await checkMeasurement(page);
                expect(placed.geometry).not.toEqual(before.geometry);
                await page.screenshot({ path: info.outputPath(`${cycle}-placed.png`) });
                const empty = await page.evaluate(() => {
                    const r = renderer.domElement.getBoundingClientRect();
                    for (const [x, y] of [[.85,.15],[.15,.15],[.85,.85],[.15,.85]]) {
                        const q = { x:r.left+r.width*x,y:r.top+r.height*y };
                        if (!getAtomIntersection({clientX:q.x,clientY:q.y}) && !checkVacuumHandleIntersection({clientX:q.x,clientY:q.y})) return q;
                    }
                    throw Error('No empty rotation start');
                });
                await page.mouse.move(empty.x,empty.y); await page.mouse.down();
                await page.mouse.move(empty.x+(cycle%2?-38:38),empty.y+22,{steps:8}); await page.mouse.up();
                compareGeometry((await checkMeasurement(page)).geometry,placed.geometry);
                await page.screenshot({path:info.outputPath(`${cycle}-rotated.png`)});
                const divider=await page.locator('#sidebarDivider').boundingBox();
                await page.mouse.move(divider.x+divider.width/2,divider.y+divider.height/2); await page.mouse.down();
                await page.mouse.move([420,220,0,320,440,220][cycle],divider.y+divider.height/2,{steps:8});
                await page.screenshot({path:info.outputPath(`${cycle}-panel-held.png`)}); await page.mouse.up();
                await checkMeasurement(page);
                if (cycle===2) {
                    const collapsed=await page.locator('#sidebarDivider').boundingBox();
                    await page.mouse.move(collapsed.x+collapsed.width/2,collapsed.y+collapsed.height/2); await page.mouse.down();
                    await page.mouse.move(320,collapsed.y+collapsed.height/2,{steps:8}); await page.mouse.up();
                }
                await page.locator('#undoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry,before.geometry);
                await page.locator('#redoBtn').click(); compareGeometry((await checkMeasurement(page)).geometry,placed.geometry);
                await checkBondRefresh(page);
                await page.locator('[data-mode="measure"]').click(); await page.locator('[data-mode="edit"]').click();
                await checkMeasurement(page);
                await page.screenshot({path:info.outputPath(`${cycle}-history-and-mode.png`)});
            }
        });
    });
}
