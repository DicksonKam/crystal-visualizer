const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

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
        if (!selectedAtoms.length && isMeasurementSelection) fail('empty selection retains measurement purpose');
        if (new Set(selectedAtoms.map(a => a.mesh)).size !== selectedAtoms.length) fail('duplicate selected copies');
        if ((currentMode === 'measure' || isMeasurementSelection) && selectedAtoms.length > 3) fail('oversized measurement');
        if (selectionRings.length !== selectedAtoms.length) fail('marker count disagrees with selection');
        const groups = currentStructure.speciesGroups;
        if (currentStructure.counts.some((count, i) => count !== currentStructure.atoms.filter(a => a.speciesId === groups[i].id).length)) fail('species counts disagree');
        for (const [index, atom] of currentStructure.atoms.entries()) {
            if (!atom.position.toArray().every(Number.isFinite)) fail(`nonfinite atom ${index}`);
            if (hasLattice(currentStructure)) {
                const frac = cartesianToFractional(atom.position, currentStructure.lattice);
                // Cartesian POSCAR input intentionally has no source fractional
                // coordinates. Validate representability and any retained cache.
                if (!frac || frac.some(v => !Number.isFinite(v)) || (atom.fractional != null &&
                    (!Array.isArray(atom.fractional) || atom.fractional.length !== 3 ||
                    atom.fractional.some(v => !Number.isFinite(v)) ||
                    frac.some((v, axis) => Math.abs(v - atom.fractional[axis]) > 1e-8)))) fail(`stale fractional cache ${index}`);
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
            supportsSD: supportsSelectiveDynamics(currentStructure), trajectory: Boolean(currentStructure.isXDATCAR), frameCount: currentStructure.totalFrames || 0, repeats: { ...settings.periodic } };
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
// Selection history resolves identities against the current display, while
// periodic-image counts are presentation state outside selection history.
function displayedSelection(selection, state) {
    const identities = selection.identities.filter(([index, ghost, offset]) => ghost
        ? state.periodic && offset && ['a', 'b', 'c'].every(axis => offset[axis] >= 0 && offset[axis] < state.repeats[axis])
        : Number.isInteger(index) && index >= 0 && index < state.atomCount);
    return { ...selection, identities, measurement: Boolean(identities.length && selection.measurement) };
}
async function visible(page, selector) { const item = page.locator(selector); return await item.count() > 0 && await item.isVisible() && await item.isEnabled(); }
async function runScenario(page, { seed, steps = 160, log = [], extended = false, includeGhosts = false, visual = false, observe = null, sourceOverride = null }) {
    page.setDefaultTimeout(5000);
    const rng = random(seed); const integer = n => Math.floor(rng() * n);
    const source = sourceOverride || sourceFor(seed);
    let acceptDialogs = true;
    const handleDialog = async dialog => { log.push({ dialog: dialog.message(), response: acceptDialogs ? 'accept' : 'dismiss' }); if(acceptDialogs) await dialog.accept(); else await dialog.dismiss(); };
    if (extended) {
        page.on('dialog', handleDialog);
        // Observe completion of the real FileReader/load adapter. Waiting for
        // an existing "Loaded" label can otherwise match the previous document.
        await page.evaluate(() => {
            window.stressLoadSerial=0;
            window.stressOriginalLoad=loadStructureFromText;
            loadStructureFromText=function(...args) {
                try { return window.stressOriginalLoad(...args); }
                finally { window.stressLoadSerial++; }
            };
        });
    }
    await page.locator('#fileInput').setInputFiles({ name: source.name, mimeType: 'text/plain', buffer: Buffer.from(source.content) });
    if (extended) await page.waitForFunction(() => window.stressLoadSerial > 0);
    await page.locator('#statusText').filter({ hasText: 'Loaded' }).waitFor();
    const known = new Map(); const counts = {}, operations = {};
    let previous = await capture(page);
    assert.deepEqual(previous.violations, []);
    if (observe) await observe({ stage: 'initial', step: -1, action: 'load', state: previous });
    for (let step = 0; step < steps; step++) {
        const choices = ['mode', 'jump', 'click', 'undo', 'redo', 'clear', 'reset', 'rotate', 'export'];
        if (previous.selection.mode === 'edit') choices.push('add', 'coordinates', 'shift', 'delete', 'fix', 'drag', 'cancel', 'invalid');
        if (previous.periodic) choices.push('periodic', 'supercell', 'resize');
        if (includeGhosts && previous.periodic && previous.selection.mode === 'measure') choices.push('ghost');
        if (extended) choices.push('replace', 'invalid_load', 'decline_load', 'download', 'display', 'batch_fix', 'center');
        if (extended && previous.trajectory) choices.push('frame');
        if (visual) choices.push('panel','zoom','pan','viewport','scale','bond_length');
        if (visual && previous.trajectory) choices.push('playback');
        const action = choices[integer(choices.length)];
        const record = { step, action, before: previous }; log.push(record);
        let performed = true;
        const click = async selector => { if (!await visible(page, selector)) { performed = false; return false; } await page.locator(selector).click(); return true; };
        try {
            if (visual && !['panel','zoom','pan','rotate','viewport','mode','undo','redo','reset','replace','invalid_load','decline_load','frame','playback','export','download','click','ghost','drag','cancel','resize'].includes(action)
                && await page.locator('.sidebar').getAttribute('aria-hidden') === 'true') {
                await page.locator('#sidebarDivider').focus(); await page.keyboard.press('ArrowRight'); record.panelReopened = true;
            }
            if (action === 'panel') {
                const box=await page.locator('#sidebarDivider').boundingBox();
                record.width=[0,240,420][integer(3)];
                await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down();
                await page.mouse.move(record.width,box.y+box.height/2,{steps:5});
                if(observe) record.preview=await observe({stage:'panel-preview',step,action,state:previous});
                await page.mouse.up();
            } else if (action === 'viewport') {
                record.viewport=[{width:390,height:844},{width:900,height:760},{width:1440,height:900}][integer(3)];
                await page.setViewportSize(record.viewport);
            } else if (action === 'scale' || action === 'bond_length') {
                const slider=page.locator(action==='scale'?'#atomScale':'#bondThreshold');
                record.key=integer(2)?'Home':'End'; await slider.focus(); await slider.press(record.key);
            } else if (action === 'playback') {
                await page.locator('#playPause').click(); await page.waitForTimeout(180);
                await page.locator('#playPause').click();
            } else if (action === 'zoom') {
                const r=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
                await page.mouse.move(r.x+r.width/2,r.y+r.height/2); record.delta=integer(2)?120:-120;
                await page.mouse.wheel(0,record.delta);
            } else if (action === 'mode') await click(`[data-mode="${previous.selection.mode === 'edit' ? 'measure' : 'edit'}"]`);
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
            } else if (action === 'replace' || action === 'invalid_load' || action === 'decline_load') {
                let replacement;
                if (action === 'invalid_load') replacement = { name:'invalid.xyz', content:'2\ninvalid\nH not-a-number 0 0\nH 0 0 0\n' };
                else if (integer(5) === 0) replacement = {name:'trajectory.xdatcar',content:await fs.readFile(require('node:path').resolve(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8')};
                else { const variant=integer(4); record.variant=variant; replacement=sourceFor(variant);
                    if (variant === 3) replacement.content = replacement.content.replace('Properties=', 'energy=-1.23 Properties='); }
                record.file = replacement.name;
                if(action === 'decline_load' && !previous.dirty) performed=false;
                else {
                    acceptDialogs = action !== 'decline_load';
                    const loadSerial=await page.evaluate(()=>window.stressLoadSerial);
                    await page.locator('#fileInput').setInputFiles({name:replacement.name,mimeType:'text/plain',buffer:Buffer.from(replacement.content)});
                    await page.waitForFunction(serial=>window.stressLoadSerial>serial,loadSerial);
                    await page.locator('#statusText').filter({hasText:action === 'invalid_load' ? /Could not|Error|Invalid/ : action === 'decline_load' ? 'Kept the current' : 'Loaded'}).waitFor();
                    acceptDialogs = true;
                    if(action === 'replace') known.clear();
                }
            } else if (action === 'display') {
                const selector=['#showLabels','#showBonds','#showFixedIndicators','#useElementRadii','#toggleCell','#toggleAxes'][integer(6)]; record.selector=selector;
                await click(selector);
            } else if (action === 'batch_fix') {
                const selector=integer(2) ? '#fixByZBtn' : '#unfixAllBtn'; record.selector=selector;
                if(await visible(page,selector)) {
                    if(selector==='#fixByZBtn') { record.threshold=(rng()*5).toFixed(5); await page.locator('#fixZThreshold').fill(record.threshold); }
                    await page.locator(selector).click();
                } else performed=false;
            } else if (action === 'center') {
                await click('#shiftCenterBtn');
            } else if (action === 'frame') {
                const key=integer(2) ? 'Home' : 'End'; record.key=key;
                await page.locator('#frameSlider').focus(); await page.locator('#frameSlider').press(key);
            } else if (action === 'download') {
                if(!previous.atomCount) performed=false;
                else {
                    const waiting=page.waitForEvent('download'); await page.locator('#exportPoscar').click(); const file=await waiting;
                    const text=await fs.readFile(await file.path(),'utf8'); record.filename=file.suggestedFilename();
                    const errors=await page.evaluate(text=>{
                        const parsed=currentStructure.isXDATCAR ? parseXDATCAR(text) : currentStructure.isXYZ ? parseXYZ(text) : parsePOSCAR(text);
                        const expected=currentStructure.isXYZ || currentStructure.isXDATCAR ? currentStructure.atoms : currentStructure.speciesGroups.flatMap(group=>currentStructure.atoms.filter(a=>a.speciesId===group.id));
                        const atoms=currentStructure.isXDATCAR ? parsed.atoms.map((a,i)=>({...a,position:parsed.frames[currentStructure.currentFrameIndex].positions[i]})) : parsed.atoms;
                        const errors=[];
                        if(atoms.length!==expected.length) errors.push('download atom count');
                        atoms.forEach((a,i)=>{if(a.element!==expected[i].element || a.position.distanceTo(expected[i].position)>1e-7) errors.push(`download atom ${i}`);
                            if(!currentStructure.isXYZ && !currentStructure.isXDATCAR && JSON.stringify(a.selectiveDynamics || [true,true,true]) !== JSON.stringify(expected[i].selectiveDynamics || [true,true,true])) errors.push(`download constraints ${i}`);
                        });
                        return errors;
                    },text);
                    assert.deepEqual(errors,[],'download round-trip');
                }
            } else if (action === 'export') {
                if (!previous.atomCount) performed = false;
                else record.exported = await page.evaluate(() => {
                    const text = currentStructure.isXDATCAR ? generateXDATCAR() : currentStructure.isXYZ ? generateXYZ() : generatePOSCAR();
                    const parsed = currentStructure.isXDATCAR ? parseXDATCAR(text) : currentStructure.isXYZ ? parseXYZ(text) : parsePOSCAR(text);
                    const errors = [];
                    if (parsed.atoms.length !== currentStructure.atoms.length) errors.push('export atom count');
                    const expected = currentStructure.isXYZ || currentStructure.isXDATCAR ? currentStructure.atoms
                        : currentStructure.speciesGroups.flatMap(group => currentStructure.atoms.filter(atom => atom.speciesId === group.id));
                    const exportedAtoms = currentStructure.isXDATCAR ? parsed.atoms.map((a,i)=>({...a,position:parsed.frames[currentStructure.currentFrameIndex].positions[i]})) : parsed.atoms;
                    exportedAtoms.forEach((a,i) => { if (a.element !== expected[i].element || a.position.distanceTo(expected[i].position)>1e-7) errors.push(`export atom ${i}`); });
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
                        camera.updateProjectionMatrix(); controls.update(); camera.updateWorldMatrix(true,false); updateCameraClipping(); updateVacuumHandles(); requestRender();
                        const handle = vacuumDragState.handles.find(h => h.userData.extendAxis === 'a' && h.userData.handleType === 'far');
                        if (!handle) return null;
                        const p = handle.getWorldPosition(new THREE.Vector3()).project(camera), rect = renderer.domElement.getBoundingClientRect();
                        const d = getScreenSpaceDirection(getLatticeVector(currentStructure.lattice,0));
                        return { x:rect.left+(p.x+1)*rect.width/2, y:rect.top+(1-p.y)*rect.height/2, dx:d.x*12, dy:-d.y*12 };
                    }, sign);
                    if (!point) performed = false;
                    else { record.pointer = point; await page.mouse.move(point.x,point.y); await page.mouse.down(); await page.mouse.move(point.x+point.dx,point.y+point.dy,{steps:3}); if(observe) record.preview=await observe({stage:'cell-preview',step,action,state:previous}); await page.mouse.up(); }
                }
            } else if (['click','drag','cancel','ghost'].includes(action)) {
                const index = integer(Math.max(1,previous.atomCount)); record.index = index;
                const ghostFraction = action === 'ghost' ? rng() : null;
                const point = await page.evaluate(({index,ghostFraction}) => {
                    const copies = ghostFraction === null ? [] : atomMeshes.filter(mesh => mesh.userData.isGhost);
                    const mesh = ghostFraction === null ? atomMeshes[index] : copies[Math.floor(ghostFraction*copies.length)];
                    if(!mesh) return null;
                    const p=mesh.getWorldPosition(new THREE.Vector3()).project(camera), r=renderer.domElement.getBoundingClientRect();
                    const x=r.left+(p.x+1)*r.width/2,y=r.top+(1-p.y)*r.height/2;
                    if(p.z < -1 || p.z>1 || x<r.left+5 || x>r.right-5 || y<r.top+5 || y>r.bottom-5) return null;
                    return {x,y,displayedIndex:mesh.userData.atomIndex};
                },{index,ghostFraction});
                if (!point) performed=false;
                else {
                    record.pointer=point; await page.mouse.move(point.x,point.y);
                    if(action==='click' || action==='ghost') await page.mouse.click(point.x,point.y);
                    else { record.delta=[integer(41)-20,integer(41)-20]; await page.mouse.down(); await page.mouse.move(point.x+record.delta[0],point.y+record.delta[1],{steps:3});
                        if(observe) record.preview=await observe({stage:'atom-preview',step,action,state:previous});
                        if(action==='cancel') await page.keyboard.press('Escape'); await page.mouse.up(); }
                }
            } else if (action === 'rotate' || action === 'pan') {
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
                    await page.mouse.move(x,y); const button=action==='pan'?'right':'left'; await page.mouse.down({button}); await page.mouse.move(x+record.delta[0],y+record.delta[1],{steps:3}); await page.mouse.up({button}); }
            }
            const after = await capture(page); record.performed=performed; record.after=after;
            counts[action] = (counts[action] || 0) + Number(performed);
            if (!['undo','redo'].includes(action)) for (const op of after.undo) {
                if (!previous.undo.some(old => old.id === op.id)) operations[op.type] = (operations[op.type] || 0) + 1;
            }
            assert.deepEqual(after.violations, [], `seed ${seed}, step ${step}, ${action}`);
            if (['invalid','invalid_load','decline_load','cancel','export','download','display','periodic','rotate','reset','mode','click','ghost','panel','viewport','zoom','pan','scale','bond_length'].includes(action)) compareGeometry(after.geometry, previous.geometry, `${action} changes document`);
            if (action === 'invalid_load' || action === 'decline_load') { assert.deepEqual(after.undo,previous.undo); assert.deepEqual(after.redo,previous.redo); assert.deepEqual(after.selection,previous.selection); assert.equal(after.dirty,previous.dirty); }
            if (action === 'replace') { assert.equal(after.undo.length,0); assert.equal(after.redo.length,0); assert.equal(after.dirty,false); }
            if ((action === 'undo' || action === 'redo') && performed) {
                const op = action === 'undo' ? previous.undo.at(-1) : previous.redo.at(-1);
                // Redo restores the state captured when Undo was pressed, which
                // may include later mode/visibility changes without history entries.
                const entry = known.get(op.id);
                if (action === 'undo' && entry) entry.after = previous;
                const expected = entry?.[action === 'undo' ? 'before' : 'after'];
                if(['select_atom','deselect_atom','clear_selection'].includes(op.type)) {
                    // Timeline navigation updates displayed positions outside
                    // edit history. Selection undo must keep the current frame.
                    compareGeometry(after.geometry,previous.geometry,`${action} selection changes document`);
                    assert.equal(after.revision,previous.revision,'selection history changes edit revision');
                    assert.equal(after.dirty,previous.dirty,'selection history changes saved status');
                    if(expected) assert.deepEqual(after.selection,displayedSelection(expected.selection,after),`${action} selection context`);
                } else if(expected) compareGeometry(after.geometry,expected.geometry,`${action} ${op.type}`);
            } else {
                const added=after.undo.filter(op=>!previous.undo.some(old=>old.id===op.id));
                if(added.length) {
                    assert.equal(after.redo.length,0,'new action must clear redo branch');
                    if(added.length===1) known.set(added[0].id,{before:previous,after});
                    else {
                        // Jumping from an edit selection, or measuring a fourth
                        // atom, records Clear then Select. At the 50-entry limit
                        // stack length cannot reveal that two operations occurred.
                        assert.deepEqual(added.map(op=>op.type),['clear_selection','select_atom'],'unknown compound UI action');
                        const cleared={...previous,selection:{mode:previous.selection.mode,measurement:false,identities:[]}};
                        known.set(added[0].id,{before:previous,after:cleared});
                        known.set(added[1].id,{before:cleared,after});
                    }
                }
            }
            if(observe) record.visual=await observe({stage:'after',step,action,state:after,performed});
            previous=after;
        } catch(error) { error.message=`Seed ${seed}, step ${step}, action ${action}: ${error.message}`; throw error; }
    }
    if(extended) { page.off('dialog',handleDialog); await page.evaluate(()=>{loadStructureFromText=window.stressOriginalLoad;}); }
    return { seed, steps, counts, operations, final: previous };
}
module.exports={runScenario,capture,sourceFor,displayedSelection};
