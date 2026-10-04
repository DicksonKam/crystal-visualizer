# Crystal Visualizer

A browser-based viewer and editor for atomic structures. It loads VASP POSCAR structures, ordinary and lattice-bearing XYZ files, and XDATCAR trajectories. You can inspect atoms and bonds, measure distances and angles, edit coordinates and selective dynamics, preview periodic images, build supercells, and export the result in its source format.

## Run locally

Serve this directory over HTTP, then open the local URL in a browser. For example:

```sh
python3 -m http.server 8000
```

The built-in examples use `fetch`, so opening `index.html` as a raw file will not load them. The page also loads Three.js and fonts from public CDNs; those resources require an internet connection.

## File behavior

- POSCAR accepts Direct and Cartesian coordinates, optional selective-dynamics flags, one positive scale factor, three positive Cartesian scale factors, or one negative target-volume factor. Counts-only files remain counts-only on export. Species groups retain their original order even when their labels match. Deleting a group's last atom retains a zero count, and adding an atom to a repeated label offers an explicit species-group choice. Structure-only exports use Cartesian coordinates and a scale of `1.0`. When a POSCAR has additional data after the atom positions (such as velocities), an unchanged export preserves the original file exactly; an edited export warns and asks before omitting that data.
- Ordinary XYZ files are treated as molecules. Their original Cartesian coordinates are retained, and cell/periodic controls are disabled. They export as XYZ. Multi-frame XYZ files are rejected because only one frame can be displayed and exported.
- XYZ files with a `Lattice="..."` field retain their cell. Extended XYZ `pbc` flags control periodicity independently along a, b, and c; absent flags default to all three periodic when a lattice is present. Measurements, boundary bonds, periodic previews, supercells, and shifts respect these flags, and edited export preserves them. A cell with `pbc="F F F"` keeps cell and fractional-coordinate controls without periodic images or wrapping. Extended XYZ `Properties` may place species and positions in a different column order; other atom properties are not editable. An unchanged XYZ export preserves the original file. After edits, export uses the current lattice and species/position columns, with confirmation before omitting additional atom data such as charges or forces.
- XDATCAR files display a timeline and export as XDATCAR. Editing is disabled. The header lattice is used for every frame, and export retains twelve decimal places for lattice vectors and fractional coordinates. Playback updates existing atom meshes and labels when the lattice is unchanged.

XYZ configuration metadata is separate from the human description. After geometry changes, export asks before omitting potentially stale results such as energy, stress, virial, and unknown metadata fields. Only descriptive fields (`name`, `label`, `comment`, and `config_type`) are retained automatically. Undoing back to the original geometry permits preservation of its source metadata again. Quoted metadata values are read as complete values, so text such as `label="pbc=F"` does not change periodicity.

Malformed files with non-finite scaled coordinates, invalid cell volumes, or impossible atom counts are rejected before rendering.
XYZ property declarations validate column names, types, and counts before loading. XYZ coordinates and lattice values accept decimal scientific notation with `E` or `D` exponents; hexadecimal numbers are rejected. A rejected file leaves the open structure and its edit history intact.

The Bond Length slider sets an absolute maximum. “Use Atomic Radii” is on by default and also limits bonds using covalent radii; turn it off to use distance alone.
For periodic structures, bonds crossing a cell face are shown as faint segments ending at the face. Measurements always use the actual selected atom positions: distance lines connect those atoms, and the angle uses the second selected atom as its vertex. Selecting a ghost copy measures that specific copy. No shorter periodic image is substituted, and there is no distance-mode toggle.
Boundary-bond calculations estimate their workload before allocating translations; when the limit is exceeded, ordinary bonds remain visible and a persistent warning explains why boundary bonds are omitted. Disabling bonds clears that warning.
Changing the number of periodic images refits the preview while keeping its viewing direction.
Supercell conversion validates the expanded cell and every atom before changing the document or undo history. Cells or coordinates that cannot be represented are rejected, and conversion shares the preview's 3,000-atom limit.

Editing has Undo and Redo buttons, with ⌘Z/Ctrl+Z and ⌘⇧Z/Ctrl+Y shortcuts. The header marks unsaved structure edits. Exporting clears that marker, while opening a different file or leaving the page asks before discarding unsaved edits. Selection changes alone do not mark the structure as edited.
Deleting all atoms leaves an editable empty structure. Export waits until you add an atom or undo the deletion, so it cannot download a file the viewer cannot reopen.
Selective-dynamics controls and fixed-atom indicators are available for POSCAR files, which preserve the flags on export. XYZ editing supports coordinates, atoms, and cells without offering unsaved constraint flags.
Releasing an atom or cell-edge drag outside the canvas completes the edit. Press Escape to cancel a drag; interrupted drags restore the original geometry, and drags that leave geometry unchanged do not add undo entries.
Cell resize proposals validate the cell and every atom before changing the live preview. Cell-vector lengths stay positive even when atoms lie outside the cell. An invalid proposal keeps the last valid preview and adds no history entry.

Automatic snapping uses the existing drag controls and adds no buttons or panels. After a meaningful approaching rotation settles, it may apply at most 5° of total orientation correction. Zoom, pan, clicks, and movement away from an axis do not trigger snapping. New input or atom focus interrupts alignment. Reset View keeps its existing header control. See [the camera contract](docs/camera.md) for defaults and conventions.

Use **Find atom by number** in the Atoms panel to select and center an atom that is hard to click. Focusing an atom moves the camera and pivot together, preserving orientation and zoom while canceling alignment. In Edit mode, selecting one atom opens Cartesian or fractional coordinate inputs for precise placement; the change can be undone or redone.
Keyboard focus stays on coordinate and measurement controls when their panels refresh. Clearing a selection returns focus to Find atom by number.
Shift and add-atom inputs reject invalid or unrepresentable coordinates without changing the structure or undo history.
**Center in Cell** uses periodic coordinates, so a cluster that crosses a cell boundary stays together when moved to the middle.

## Code and tests

`index.html` contains the UI and `styles.css` contains the styling. `geometry.js` handles coordinate conversion and bounded periodic geometry. `document.js` owns document identity, species groups, capabilities, geometry validation, and snapshots. `formats.js` handles file parsing, metadata provenance, and export. `structure.js` prepares cell resizes and supercells without mutating the document. `history.js` owns bounded history and saved/edit revisions. These document modules run without the browser or Three.js renderer. `camera.js` contains deterministic camera math and action policy, receiving Three.js as an injected math dependency and requiring no DOM or renderer. `measurement.js` resolves selected measurement points, displacements, distances, and angles independently of the browser and renderer. `app.js` adapts them to Three.js, rendering, selection, and DOM events. See [the document and editing contract](docs/architecture.md) before adding an operation or format.

The renderer reuses sphere geometry and element materials across atoms, reuses bond geometry, and caches the smallest atom radius during redraws. Views above 500 displayed atoms use simpler spheres, batch atoms by element and ghost state while retaining their picking/editing meshes, batch solid and ghost bonds, skip shadows, and cap active rendering at 30 fps. Idle views render at a lower rate, while edits request an immediate redraw. Atom-number navigation and coordinate-system toggles are keyboard accessible; the status bar announces actions to assistive technology.

Run the focused tests with:

```sh
node --test tests/*.test.cjs
```

The browser suite exercises the actual DOM and WebGL renderer, file uploads/downloads, species groups, cell previews, export warnings, undo/redo, skew-cell measurements, trajectory playback, and real damped camera gestures, fitting, alignment, and cancellation. The camera tests include timestamped input at 30, 60, and 120 Hz. It serves the pinned Three.js dependency from local test packages, so CDN availability and fonts cannot affect the result.

```sh
npm ci
npx playwright install chromium
npm run test:all
```

The GitHub Actions workflow runs the same unit and Chromium checks on pushes and pull requests, and retains traces/screenshots when browser checks fail. Adding this workflow locally does not run GitHub Actions until the changes are pushed.

The browser suite includes four bounded seeded Edit-mode scenarios. For an opt-in soak run, keep the local server running at port 4173 in a separate terminal, then run:

```sh
node tests/browser/server.cjs
# In another terminal:
node tests/stress/edit-campaign.cjs --seconds 7200 --seed 1 --steps 160 --out /tmp/crystal-edit-stress
```

The campaign uses isolated browser contexts and public synthetic structures. It mixes real pointer/keyboard/form actions across molecules, cubic/tilted cells, and partially periodic XYZ structures. State checks cover atom/species identity, counts, fractional caches, selected positions and markers, measurement endpoints, document/mesh agreement, export ordering, and known undo/redo transitions. Camera alignment is prepared programmatically for resize actions; export round-trips are checked through the parsers. Inapplicable actions are skipped and action counts are reported. A failure stops the campaign and saves its seed, full action/state log, screenshot, and page HTML. Replaying the same seed is useful for diagnosis; pointer timing and available actions can still depend on the browser environment. Longer runs provide broader sampled coverage, not proof that every possible sequence is correct.
