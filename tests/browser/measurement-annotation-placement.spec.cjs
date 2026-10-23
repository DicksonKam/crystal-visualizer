const { test, expect } = require('./fixtures.cjs');

for (const order of [[1, 2, 3], [2, 1, 3]]) test(`water measurement labels remain distinct in edit mode, order ${order.join('-')}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await page.getByRole('button', { name: 'Water H₂O molecule', exact: true }).click();
    for (const n of order) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('End');
    await page.locator('#resetView').click();
    await page.screenshot({ path: info.outputPath('water-annotations.png') });
    const view = await page.evaluate(() => {
        camera.updateWorldMatrix(true, false);
        const bounds = renderer.domElement.getBoundingClientRect();
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const rectangle = sprite => {
            const center = sprite.getWorldPosition(new THREE.Vector3());
            const scale = sprite.getWorldScale(new THREE.Vector3());
            const point = center.clone().project(camera);
            const left = center.clone().addScaledVector(right, -scale.x / 2).project(camera);
            const top = center.clone().addScaledVector(up, scale.y / 2).project(camera);
            return { x: (point.x + 1) * bounds.width / 2, y: (1 - point.y) * bounds.height / 2,
                width: Math.abs(point.x - left.x) * bounds.width, height: Math.abs(point.y - top.y) * bounds.height };
        };
        const labels = measurementGroup.children.filter(object => object.userData.isMeasurementLabel);
        const points = selectedAtoms.map(atom => atom.mesh.getWorldPosition(new THREE.Vector3()));
        const anchorScreen = label => { const a = measurementGroup.localToWorld((label.userData.annotationAnchor || label.position).clone()).project(camera); return { x: (a.x + 1) * bounds.width / 2, y: (1 - a.y) * bounds.height / 2 }; };
        return {
            labels: labels.map(rectangle), markers: selectionRings.map(rectangle), anchorScreens: labels.map(anchorScreen),
            anchors: labels.slice(0, 2).map(label => (label.userData.annotationAnchor || label.position).toArray()),
            midpoints: points.slice(1).map((point, i) => point.clone().add(points[i]).multiplyScalar(.5).toArray()),
            leaders: measurementGroup.children.filter(object => object.userData.isAnnotationLeader && object.visible).length
        };
    });
    await info.attach('annotation-rectangles', { body: JSON.stringify(view), contentType: 'application/json' });
    // Captions never cover each other, stay close to what they measure, and use no leader lines.
    for (const [index, label] of view.labels.entries()) {
        for (const other of view.labels.slice(0, index)) {
            const overlapX = (label.width + other.width) / 2 - Math.abs(label.x - other.x);
            const overlapY = (label.height + other.height) / 2 - Math.abs(label.y - other.y);
            expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(-3.9);
        }
        const anchor = view.anchorScreens[index];
        expect(Math.hypot(label.x - anchor.x, label.y - anchor.y)).toBeLessThanOrEqual(label.height * 6 + 1);
    }
    for (let i = 0; i < 2; i++) for (let axis = 0; axis < 3; axis++) expect(view.anchors[i][axis]).toBeCloseTo(view.midpoints[i][axis], 6);
    expect(view.leaders).toBe(0);
    for (const marker of view.markers) expect(marker.width).toBeGreaterThan(0);
    await expect(page.locator('#measurementPanel')).toContainText(order[0] === 1 ? '37.76°' : '104.48°');
});
