const { test, expect } = require('./fixtures.cjs');
const path = require('node:path');

// Independent segment/rectangle clipping: a caption must clear the visible
// bond centerline by its projected radius, not just clear the atoms at its ends.
function crosses(rect, bond) {
    let low = 0, high = 1;
    for (const axis of ['x', 'y']) {
        const half = rect[axis === 'x' ? 'width' : 'height'] / 2 + bond.radius;
        const start = bond.a[axis], delta = bond.b[axis] - start;
        const min = rect[axis] - half, max = rect[axis] + half;
        if (Math.abs(delta) < 1e-9) { if (start < min || start > max) return false; }
        else {
            const t = [(min - start) / delta, (max - start) / delta].sort((a, b) => a - b);
            low = Math.max(low, t[0]); high = Math.min(high, t[1]);
            if (low > high) return false;
        }
    }
    return true;
}

test('water measurement captions clear bright bonds across close views and sidebar changes', async ({ page }, info) => {
    if (process.env.CRYSTAL_BOND_CANDIDATE) {
        for (const file of ['app.js', 'annotations.js']) await page.route(`**/${file}?*`, route => route.fulfill({
            path: path.join(process.env.CRYSTAL_BOND_CANDIDATE, file), contentType: 'text/javascript'
        }));
        await page.reload();
    }
    await page.getByRole('button', { name: 'Water H₂O molecule', exact: true }).click();
    for (const n of [1, 2, 3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    const failures = [];
    for (const [index, direction] of [[1,1,1], [0,0,1], [1,.2,1]].entries()) {
        await page.evaluate(direction => {
            cancelCameraAlignment(); controls.staticMoving = true;
            camera.position.copy(controls.target).addScaledVector(new THREE.Vector3(...direction).normalize(), 20);
            camera.up.set(0,1,0); camera.zoom = 1.2; camera.updateProjectionMatrix(); controls.update(); requestRender();
        }, direction);
        await page.locator('#sidebarDivider').focus(); await page.keyboard.press(index % 2 ? 'End' : 'Home');
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.screenshot({ path: info.outputPath(`view-${index}.png`) });
        const data = await page.evaluate(() => {
            camera.updateWorldMatrix(true, false); structureGroup.updateWorldMatrix(true, true);
            const { width, height } = renderer.domElement.getBoundingClientRect();
            const screen = p => { const q = p.clone().project(camera); return { x: (q.x+1)*width/2, y: (1-q.y)*height/2 }; };
            const bonds = structureGroup.children.filter(m => m.userData.isBond).map(m => ({
                a: screen(m.localToWorld(new THREE.Vector3(0,-.5,0))), b: screen(m.localToWorld(new THREE.Vector3(0,.5,0))),
                radius: m.getWorldScale(new THREE.Vector3()).x / getAnnotationWorldPerPixel(m.getWorldPosition(new THREE.Vector3()), height)
            }));
            const labels = measurementGroup.children.filter(m => m.userData.isMeasurementLabel).map(m => ({
                ...screen(m.getWorldPosition(new THREE.Vector3())), width: m.scale.x/m.userData.annotationWorldPerPixel,
                height: m.scale.y/m.userData.annotationWorldPerPixel
            }));
            return { labels, bonds };
        });
        await info.attach(`projection-${index}`, { body: JSON.stringify(data), contentType: 'application/json' });
        data.labels.forEach((label, li) => data.bonds.forEach((bond, bi) => { if (crosses(label, bond)) failures.push({ view: index, label: li, bond: bi }); }));
    }
    expect(failures).toEqual([]);
});
