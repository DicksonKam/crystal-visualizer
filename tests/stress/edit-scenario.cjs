const assert = require('node:assert/strict');

function random(seed) {
    let value = seed >>> 0;
    return () => { value += 0x6D2B79F5; let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function sourceFor(seed) {
    const kind = seed % 4;
    if (kind === 0) return { name: 'molecule.xyz', content: '5\nmolecule\nH 0 0 0\nO 2 0 0\nH 0 2 0\nO 2 2 0\nH 1 1 2\n' };
    const lattice = kind === 2 ? [[8, 1, .5], [2, 9, 1], [1, 2, 10]] : [[8, 0, 0], [0, 9, 0], [0, 0, 10]];
    if (kind === 3) return { name: 'periodic.xyz', content: `5\nLattice="${lattice.flat().join(' ')}" Properties=species:S:1:pos:R:3 pbc="T T F"\nH 0 0 0\nO 2 0 0\nH 0 2 0\nO 2 2 0\nH 1 1 2\n` };
    return { name: 'cell.poscar', content: `stress\n1\n${lattice.map(row => row.join(' ')).join('\n')}\nH O\n3 2\nSelective dynamics\nDirect\n0 0 0 T T T\n0 .5 0 F F F\n.5 .5 .5 T T T\n1 1 1 T F T\n.25 .75 .5 T T T\n` };
}
async function capture(page) {
    return page.evaluate(() => {
        if (!window.stressOperationIds) { window.stressOperationIds = new WeakMap(); window.stressNextId = 0; }
        const id = op => { if (!window.stressOperationIds.has(op)) window.stressOperationIds.set(op, ++window.stressNextId); return window.stressOperationIds.get(op); };
        const geometry = {
            lattice: currentStructure.lattice,
            species: currentStructure.speciesGroups,
            elements: currentStructure.elements, counts: currentStructure.counts,
            sd: Boolean(currentStructure.hasSelectiveDynamics),
            atoms: currentStructure.atoms.map(atom => ({ id: atom.id, speciesId: atom.speciesId, element: atom.element,
                position: atom.position.toArray(), sd: atom.selectiveDynamics || [true, true, true] }))
        };
        const selection = { mode: currentMode, measurement: isMeasurementSelection,
            identities: selectedAtoms.map(atom => [atom.index, Boolean(atom.isGhost), atom.cellOffset]) };
        const violations = [];
        const fail = message => violations.push(message);
        if (new Set(currentStructure.atoms.map(a => a.id)).size !== currentStructure.atoms.length) fail('duplicate document atom IDs');
        if (new Set(selectedAtoms.map(a => a.mesh)).size !== selectedAtoms.length) fail('duplicate selected copies');
        if ((currentMode === 'measure' || isMeasurementSelection) && selectedAtoms.length > 3) fail('oversized measurement');
        if (selectionRings.length !== selectedAtoms.length) fail('marker count disagrees with selection');
        const groups = currentStructure.speciesGroups;
        if (currentStructure.counts.some((count, i) => count !== currentStructure.atoms.filter(a => a.speciesId === groups[i].id).length)) fail('species counts disagree');
        for (const [index, atom] of currentStructure.atoms.entries()) {
            if (!atom.position.toArray().every(Number.isFinite)) fail(`nonfinite atom ${index}`);
            if (hasLattice(currentStructure)) {
                const frac = cartesianToFractional(atom.position, currentStructure.lattice);
                if (!frac || !atom.fractional || frac.some((v, axis) => Math.abs(v - atom.fractional[axis]) > 1e-8)) fail(`stale fractional cache ${index}`);
            }
            const mesh = atomMeshes[index];
            if (!mesh || mesh.userData.isGhost || mesh.position.distanceTo(atom.position) > 1e-8) fail(`render/document mismatch ${index}`);
        }
        for (const atom of selectedAtoms) {
            if (atom.mesh.parent !== structureGroup) fail('detached selected mesh');
            const actual = atom.mesh.getWorldPosition(new THREE.Vector3());
            if (actual.distanceTo(atom.position) > 1e-8) fail(`stale selected world position ${atom.index}`);
        }
        const lines = measurementGroup.children.filter(c => c.userData.isMeasurementLine);
        const measured = currentMode === 'measure' || isMeasurementSelection;
        if (lines.length !== (measured ? Math.max(0, selectedAtoms.length - 1) : 0)) fail('distance line count disagrees');
        if (measured) for (let i = 0; i < lines.length; i++) {
            const values = lines[i].geometry.attributes.position.array;
            const expected = [...selectedAtoms[i].position.toArray(), ...selectedAtoms[i+1].position.toArray()];
            if (expected.some((v, j) => Math.abs(values[j]-v) > 1e-4)) fail('distance endpoint disagrees');
        }
        const undo = editHistory.undoStack.map(op => ({ id: id(op), type: op.type }));
        const redo = editHistory.redoStack.map(entry => ({ id: id(entry.operation), type: entry.operation.type }));
        return { geometry, selection, violations, undo, redo, dirty: editHistory.dirty, revision: editHistory.currentEditRevision,
            atomCount: currentStructure.atoms.length, lattice: hasLattice(currentStructure), periodic: isPeriodicStructure(currentStructure),
            supportsSD: supportsSelectiveDynamics(currentStructure), repeats: { ...settings.periodic } };
    });
}
function compareGeometry(actual, expected, label) {
    // Undo may recompute coordinates; tolerate rounding while preserving identity,
    // species membership, constraints, order, and cell dimensions.
    function compare(a, b, path) {
        if (typeof a === 'number' && typeof b === 'number') assert.ok(Math.abs(a-b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${label}: ${path}: ${a} != ${b}`);
        else if (a && b && typeof a === 'object' && typeof b === 'object') {
            assert.deepEqual(Object.keys(a), Object.keys(b), `${label}: ${path} keys`);
            for (const key of Object.keys(a)) compare(a[key], b[key], `${path}.${key}`);
        } else assert.deepEqual(a, b, `${label}: ${path}`);
    }
    compare(actual, expected, 'geometry');
}
async function visible(page, selector) { const item = page.locator(selector); return await item.count() > 0 && await item.isVisible() && await item.isEnabled(); }
async function runScenario(page, { seed, steps = 160, log = [] }) {
    page.setDefaultTimeout(5000);
    const rng = random(seed); const integer = n => Math.floor(rng() * n);
    const source = sourceFor(seed);
    await page.locator('#fileInput').setInputFiles({ name: source.name, mimeType: 'text/plain', buffer: Buffer.from(source.content) });
    await page.locator('#statusText').filter({ hasText: 'Loaded' }).waitFor();
    const known = new Map(); const counts = {}, operations = {};
    let previous = await capture(page);
    assert.deepEqual(previous.violations, []);
    for (let step = 0; step < steps; step++) {
        const choices = ['mode', 'jump', 'click', 'undo', 'redo', 'clear', 'reset', 'rotate', 'export'];
        if (previous.selection.mode === 'edit') choices.push('add', 'coordinates', 'shift', 'delete', 'fix', 'drag', 'cancel', 'invalid');
        if (previous.periodic) choices.push('periodic', 'supercell', 'resize');
        const action = choices[integer(choices.length)];
        const record = { step, action, before: previous }; log.push(record);
        let performed = true;
        const click = async selector => { if (!await visible(page, selector)) { performed = false; return false; } await page.locator(selector).click(); return true; };
        try {
            if (action === 'mode') await page.locator(`[data-mode="${previous.selection.mode === 'edit' ? 'measure' : 'edit'}"]`).click();
            else if (action === 'jump') {
                if (!previous.atomCount) performed = false;
                else { const number = integer(previous.atomCount)+1; record.number = number; await page.locator('#atomJumpInput').fill(String(number)); await page.locator('#atomJumpInput').press('Enter'); }
            } else if (action === 'undo' || action === 'redo') await click(`#${action}Btn`);
            else if (action === 'clear') await click('#clearSelectionBtn');
            else if (action === 'reset') await click('#resetView');
            else if (action === 'delete') await click('#deleteSelectedBtn');
            else if (action === 'fix') await click(integer(2) ? '#fixSelectedBtn' : '#unfixSelectedBtn');
            else if (action === 'coordinates' || action === 'invalid') {
                if (!await visible(page, '#saveAtomCoordinates')) performed = false;
                else {
                    await page.locator('#editAtomCoordMode').selectOption('cartesian');
                    const values = action === 'invalid' ? ['', '1', '2'] : [rng()*4, rng()*4, rng()*4].map(v => v.toFixed(6)); record.values = values;
                    for (let i=0;i<3;i++) await page.locator(`#editAtom${i}`).fill(values[i]);
                    await page.locator('#saveAtomCoordinates').click();
                }
            } else if (action === 'add') {
                if (previous.atomCount >= 48 || !await visible(page, '#addAtomBtn')) performed = false;
                else {
                    const options = await page.locator('#addAtomElement option').evaluateAll(items => items.map(i => i.value).filter(v => ['H', 'O', 'Na'].includes(v)));
                    const element = options[integer(options.length)]; record.element = element;
                    await page.locator('#addAtomElement').selectOption(element);
                    const mode = previous.lattice ? 'fractional' : 'cartesian'; await page.locator(`input[name="coordType"][value="${mode}"]`).check();
                    record.values = [rng(), rng(), rng()].map(v => v.toFixed(5));
                    for (let i=0;i<3;i++) await page.locator(['#addAtomX','#addAtomY','#addAtomZ'][i]).fill(record.values[i]);
                    await page.locator('#addAtomBtn').click();
                }
            } else if (action === 'shift') {
                if (!await visible(page, '#applyShiftBtn')) performed = false;
                else { await page.locator('input[name="shiftCoordType"][value="cartesian"]').check(); record.values = [rng()*.3-.15, rng()*.3-.15, rng()*.3-.15].map(v => v.toFixed(6));
                    for (let i=0;i<3;i++) await page.locator(['#shiftA','#shiftB','#shiftC'][i]).fill(record.values[i]); await page.locator('#applyShiftBtn').click(); }
            } else if (action === 'periodic') {
                const axis = ['a','b','c'][integer(3)], increase = previous.repeats[axis] < 2;
                record.axis = axis; record.increase = increase;
                const button = page.getByRole('button', { name: `${increase ? 'Increase' : 'Decrease'} ${axis} periodic images`, exact: true });
                if (await button.isEnabled()) await button.click(); else performed = false;
            } else if (action === 'supercell') {
                if (previous.atomCount * Object.values(previous.repeats).reduce((a,b)=>a*b,1) > 48) performed = false;
                else await click('#makeSupercellBtn');
            } else if (action === 'export') {
                if (!previous.atomCount) performed = false;
                else record.exported = await page.evaluate(() => {
                    const text = currentStructure.isXYZ ? generateXYZ() : generatePOSCAR();
                    const parsed = currentStructure.isXYZ ? parseXYZ(text) : parsePOSCAR(text);
                    const errors = [];
                    if (parsed.atoms.length !== currentStructure.atoms.length) errors.push('export atom count');
                    const expected = currentStructure.isXYZ ? currentStructure.atoms
                        : currentStructure.speciesGroups.flatMap(group => currentStructure.atoms.filter(atom => atom.speciesId === group.id));
                    parsed.atoms.forEach((a,i) => { if (a.element !== expected[i].element || a.position.distanceTo(expected[i].position)>1e-7) errors.push(`export atom ${i}`); });
                    if (!currentStructure.isXYZ && JSON.stringify(parsed.counts) !== JSON.stringify(currentStructure.counts)) errors.push('export species counts');
                    return errors;
                });
                if (performed) assert.deepEqual(record.exported, []);
            } else if (action === 'resize') {
                if (previous.selection.mode !== 'edit') performed = false;
                else {
                    const sign = integer(2) ? 1 : -1; record.sign = sign;
                    const point = await page.evaluate(sign => {
                        cancelCameraAlignment(); controls.staticMoving = true;
                        const direction = getLatticeVector(currentStructure.lattice, 2).normalize().multiplyScalar(sign);
                        camera.position.copy(controls.target).addScaledVector(direction, 40);
                        camera.up.copy(getLatticeVector(currentStructure.lattice, 0).normalize()); camera.zoom = .65;
                        camera.updateProjectionMatrix(); controls.update(); camera.updateWorldMatrix(true,false); updateVacuumHandles(); requestRender();
                        const handle = vacuumDragState.handles.find(h => h.userData.extendAxis === 'a' && h.userData.handleType === 'far');
                        if (!handle) return null;
                        const p = handle.getWorldPosition(new THREE.Vector3()).project(camera), rect = renderer.domElement.getBoundingClientRect();
                        const d = getScreenSpaceDirection(getLatticeVector(currentStructure.lattice,0));
                        return { x:rect.left+(p.x+1)*rect.width/2, y:rect.top+(1-p.y)*rect.height/2, dx:d.x*12, dy:-d.y*12 };
                    }, sign);
                    if (!point) performed = false;
                    else { record.pointer = point; await page.mouse.move(point.x,point.y); await page.mouse.down(); await page.mouse.move(point.x+point.dx,point.y+point.dy,{steps:3}); await page.mouse.up(); }
                }
            } else if (['click','drag','cancel'].includes(action)) {
                const index = integer(Math.max(1,previous.atomCount)); record.index = index;
                const point = await page.evaluate(index => {
                    const mesh = atomMeshes[index]; if(!mesh) return null;
                    const p=mesh.getWorldPosition(new THREE.Vector3()).project(camera), r=renderer.domElement.getBoundingClientRect();
                    const x=r.left+(p.x+1)*r.width/2,y=r.top+(1-p.y)*r.height/2;
                    if(p.z < -1 || p.z>1 || x<r.left+5 || x>r.right-5 || y<r.top+5 || y>r.bottom-5) return null;
                    return {x,y};
                },index);
                if (!point) performed=false;
                else {
                    record.pointer=point; await page.mouse.move(point.x,point.y);
                    if(action==='click') await page.mouse.click(point.x,point.y);
                    else { record.delta=[integer(41)-20,integer(41)-20]; await page.mouse.down(); await page.mouse.move(point.x+record.delta[0],point.y+record.delta[1],{steps:3});
                        if(action==='cancel') await page.keyboard.press('Escape'); await page.mouse.up(); }
                }
            } else if (action === 'rotate') {
                record.delta=[integer(31)-15,integer(31)-15];
                const background = await page.evaluate(() => {
                    camera.updateWorldMatrix(true,false); structureGroup.updateWorldMatrix(true,true);
                    const r=renderer.domElement.getBoundingClientRect();
                    for(const [u,v] of [[.8,.2],[.9,.1],[.9,.9],[.1,.9],[.5,.1],[.5,.9],[.1,.1],[.9,.5],[.1,.5]]) {
                        raycaster.setFromCamera(new THREE.Vector2(u*2-1,1-v*2),camera);
                        if (!raycaster.intersectObjects(atomMeshes,false).length && !raycaster.intersectObjects(vacuumDragState.handles,false).length) return {x:r.left+r.width*u,y:r.top+r.height*v};
                    }
                    return null;
                });
                if(!background) performed=false;
                else { record.pointer=background; const {x,y}=background;
                    await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x+record.delta[0],y+record.delta[1],{steps:3}); await page.mouse.up(); }
            }
            const after = await capture(page); record.performed=performed; record.after=after;
            counts[action] = (counts[action] || 0) + Number(performed);
            if (!['undo','redo'].includes(action)) for (const op of after.undo) {
                if (!previous.undo.some(old => old.id === op.id)) operations[op.type] = (operations[op.type] || 0) + 1;
            }
            assert.deepEqual(after.violations, [], `seed ${seed}, step ${step}, ${action}`);
            if (action === 'invalid' || action === 'cancel' || action === 'export' || action === 'periodic' || action === 'rotate' || action === 'reset' || action === 'mode') compareGeometry(after.geometry, previous.geometry, `${action} changes document`);
            if ((action === 'undo' || action === 'redo') && performed) {
                const op = action === 'undo' ? previous.undo.at(-1) : previous.redo.at(-1);
                // Redo restores the state captured when Undo was pressed, which
                // may include later mode/visibility changes without history entries.
                const entry = known.get(op.id);
                if (action === 'undo' && entry) entry.after = previous;
                const expected = entry?.[action === 'undo' ? 'before' : 'after'];
                if(expected) { compareGeometry(after.geometry,expected.geometry,`${action} ${op.type}`);
                    if(['select_atom','deselect_atom','clear_selection'].includes(op.type)) assert.deepEqual(after.selection,expected.selection,`${action} selection context`); }
            } else if(after.undo.at(-1)?.id !== previous.undo.at(-1)?.id && after.undo.length === Math.min(50,previous.undo.length+1)) {
                const op=after.undo.at(-1); known.set(op.id,{before:previous,after});
                assert.equal(after.redo.length,0,'new action must clear redo branch');
            }
            previous=after;
        } catch(error) { error.message=`Seed ${seed}, step ${step}, action ${action}: ${error.message}`; throw error; }
    }
    return { seed, steps, counts, operations, final: previous };
}
module.exports={runScenario,capture,sourceFor};
