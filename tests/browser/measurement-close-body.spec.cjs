const { test, expect } = require('./fixtures.cjs');
test('close water angle caption clears the oxygen body after editing', async ({ page }, info) => {
    await page.setViewportSize({ width:1440, height:900 });
    await page.getByRole('button', { name:'Water H₂O molecule', exact:true }).click();
    for (const n of [2,1,3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.locator('[data-mode="edit"]').click();
    await page.locator('#sidebarDivider').focus(); await page.keyboard.press('Home');
    await page.locator('#resetView').click();
    const original = await page.evaluate(() => ({ atoms: currentStructure.atoms.map(atom => atom.position.toArray()), anchor: measurementGroup.children.filter(o => o.userData.isMeasurementLabel).at(-1).userData.annotationAnchor.toArray() }));
    await page.evaluate(() => { cancelCameraAlignment(); controls.staticMoving=true; camera.position.copy(controls.target).add(new THREE.Vector3(0,0,30));camera.up.set(0,1,0);controls.update();fitStructureToView(true);requestRender(); });
    const canvas=page.locator('canvas[aria-label^="3D structure"]'); const b=await canvas.boundingBox();
    await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5); await page.mouse.wheel(0,-180); await page.waitForTimeout(700);
    await page.screenshot({path:info.outputPath('close-water-angle.png')});
    const view=await page.evaluate(()=>{
        const r=renderer.domElement.getBoundingClientRect();
        const unit=(camera.top-camera.bottom)/(camera.zoom*r.height);
        const screen=p=>{const v=p.clone().project(camera);return {x:(v.x+1)*r.width/2,y:(1-v.y)*r.height/2};};
        const label=measurementGroup.children.filter(o=>o.userData.isMeasurementLabel).at(-1);
        const p=screen(label.getWorldPosition(new THREE.Vector3()));
        const atom=atomMeshes.find(m=>m.userData.atomIndex===0);const c=screen(atom.getWorldPosition(new THREE.Vector3()));
        const radius=atom.geometry.parameters.radius*atom.getWorldScale(new THREE.Vector3()).x/unit;
        const dx=Math.max(0,Math.abs(p.x-c.x)-label.scale.x/unit/2),dy=Math.max(0,Math.abs(p.y-c.y)-label.scale.y/unit/2);
        return {clearance:Math.hypot(dx,dy)-radius,p,c,radius, anchor:label.userData.annotationAnchor.toArray()};
    });
    await info.attach('body-clearance',{body:JSON.stringify(view),contentType:'application/json'});
    expect(view.clearance).toBeGreaterThanOrEqual(3.9);
    expect(view.anchor).toEqual(original.anchor);
    expect(await page.evaluate(() => currentStructure.atoms.map(atom => atom.position.toArray()))).toEqual(original.atoms);
    await expect(page.locator('#measurementPanel')).toContainText('104.48°');
});
