const { test, expect, upload } = require('./fixtures.cjs');

async function startDrag(page, loseCapture = true) {
    await upload(page, '2\ncapture recovery\nH -1 0 0\nO 1 0 0\n', 'recovery.xyz');
    await page.locator('[data-mode="edit"]').click();
    await page.getByRole('button', { name: 'Reset View', exact: true }).click();
    await page.waitForFunction(() => cameraController.phase === 'idle');
    const point = await page.evaluate(() => {
        const r = renderer.domElement.getBoundingClientRect();
        camera.updateWorldMatrix(true, false);
        structureGroup.updateWorldMatrix(true, true);
        const p = atomMeshes[0].getWorldPosition(new THREE.Vector3()).project(camera);
        return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
    });
    const before = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 45, point.y + 30, { steps: 5 });
    if (!loseCapture) return { before, point };
    await page.evaluate(() => {
        window.captureLosses = [];
        renderer.domElement.addEventListener('lostpointercapture', e => {
            window.captureLosses.push({ trusted: e.isTrusted, buttons: e.buttons });
        });
        // Ask the browser to release real capture while the real mouse is held.
        // The resulting lostpointercapture is native, not a dispatched event.
        renderer.domElement.releasePointerCapture(activeEditPointerId);
    });
    await page.mouse.move(point.x + 50, point.y + 35);
    expect(await page.evaluate(() => window.captureLosses)).toEqual([{ trusted: true, buttons: 1 }]);
    return { before, point };
}

async function idle(page) {
    expect(await page.evaluate(() => ({ atom: !!draggedAtom, pointer: activeEditPointerId,
        guide: !!dragGuidePlane, enabled: controls.enabled })))
        .toEqual({ atom: false, pointer: null, guide: false, enabled: true });
}

for (const outside of [false, true]) {
    test(`native capture loss preserves mouse placement${outside ? ' outside the canvas' : ''}`, async ({ page }, info) => {
        const { before, point } = await startDrag(page);
        await page.mouse.move(outside ? 450 : point.x + 65, outside ? 20 : point.y + 40, { steps: 3 });
        const preview = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
        expect(preview).not.toEqual(before);
        await page.mouse.up();
        await idle(page);
        expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(preview);
        expect(await page.evaluate(() => editHistory.undoStack.map(e => e.type))).toEqual(['move_atom']);
        await expect(page.locator('#statusText')).toContainText('Moved atom');
        await page.screenshot({ path: info.outputPath('capture-recovered.png') });
        await page.locator('#undoBtn').click();
        expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(before);
        await page.locator('#redoBtn').click();
        expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(preview);
    });
}

for (const reason of ['escape', 'blur', 'pointercancel']) {
    test(`capture loss still permits explicit ${reason} rollback`, async ({ page }) => {
        const { before } = await startDrag(page);
        if (reason === 'escape') await page.keyboard.press('Escape');
        else await page.evaluate(reason => {
            if (reason === 'blur') window.dispatchEvent(new Event('blur'));
            else document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: activeEditPointerId }));
        }, reason);
        await page.mouse.up();
        await idle(page);
        expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(before);
        expect(await page.evaluate(() => editHistory.undoStack.length)).toBe(0);
        await expect(page.locator('#statusText')).toContainText('Drag canceled');
    });
}

test('a missed mouse release commits the held preview once, ignoring unrelated pointers', async ({ page }) => {
    await startDrag(page);
    const preview = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    await page.evaluate(() => {
        document.dispatchEvent(new PointerEvent('pointerup', { pointerId: activeEditPointerId + 1, button: 0 }));
    });
    expect(await page.evaluate(() => !!draggedAtom)).toBe(true);
    await page.evaluate(() => {
        // Model a missed up followed by a hover at a different point.
        document.dispatchEvent(new PointerEvent('pointermove', { pointerId: activeEditPointerId,
            pointerType: 'mouse', buttons: 0, clientX: 0, clientY: 0 }));
    });
    await idle(page);
    await page.mouse.up();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(preview);
    expect(await page.evaluate(() => editHistory.undoStack.length)).toBe(1);
});

test('released-button capture loss immediately commits without a delivered pointerup', async ({ page }) => {
    await startDrag(page, false);
    const preview = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    await page.evaluate(() => {
        // Reproduce the user incident: last move had buttons=1; lost capture
        // reports buttons=0 while focused, without a preceding delivered up.
        renderer.domElement.dispatchEvent(new PointerEvent('lostpointercapture', {
            bubbles: true, pointerId: activeEditPointerId, pointerType: 'mouse', buttons: 0
        }));
    });
    await idle(page);
    await expect(page.locator('#statusText')).toContainText('Moved atom');
    await page.mouse.up();
    expect(await page.evaluate(() => currentStructure.atoms[0].position.toArray())).toEqual(preview);
    expect(await page.evaluate(() => editHistory.undoStack.length)).toBe(1);
});

test('releasing the primary mouse button during a chord places the atom once', async ({ page }) => {
    await startDrag(page);
    const preview = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    await page.mouse.down({ button: 'right' });
    await page.mouse.up({ button: 'left' });
    await idle(page);
    await page.mouse.up({ button: 'right' });
    // Pointer release may intersect the same plane again. Compare at physical
    // precision rather than requiring identical floating-point rounding.
    const placed = await page.evaluate(() => currentStructure.atoms[0].position.toArray());
    placed.forEach((value, axis) => expect(value).toBeCloseTo(preview[axis], 12));
    expect(await page.evaluate(() => editHistory.undoStack.length)).toBe(1);
});
