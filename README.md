# Crystal Visualizer

A browser-based viewer and editor for atomic structures. It loads VASP POSCAR structures, ordinary and lattice-bearing XYZ files, and XDATCAR trajectories. You can inspect atoms and bonds, measure distances and angles, edit coordinates and selective dynamics, preview periodic images, build supercells, and export the result in its source format.

## Run locally

Serve this directory over HTTP, then open the local URL in a browser. For example:

```sh
python3 -m http.server 8000
```

The built-in examples use `fetch`, so opening `index.html` as a raw file will not load them. The page also loads Three.js and fonts from public CDNs; those resources require an internet connection.

## File behavior

- POSCAR accepts Direct and Cartesian coordinates, optional selective-dynamics flags, one positive scale factor, three positive Cartesian scale factors, or one negative target-volume factor. Counts-only files remain counts-only on export. Structure-only exports use Cartesian coordinates and a scale of `1.0`. When a POSCAR has additional data after the atom positions (such as velocities), an unchanged export preserves the original file exactly; an edited export warns and asks before omitting that data.
- Ordinary XYZ files are treated as molecules. Their original Cartesian coordinates are retained, and cell/periodic controls are disabled. They export as XYZ. Multi-frame XYZ files are rejected because only one frame can be displayed and exported.
- XYZ files with a `Lattice="..."` field retain their cell. Extended XYZ `pbc` flags control periodicity independently along a, b, and c; absent flags default to all three periodic when a lattice is present. Measurements, boundary bonds, periodic previews, supercells, and shifts respect these flags, and edited export preserves them. A cell with `pbc="F F F"` keeps cell and fractional-coordinate controls without periodic images or wrapping. Extended XYZ `Properties` may place species and positions in a different column order; other atom properties are not editable. An unchanged XYZ export preserves the original file. After edits, export uses the current lattice and species/position columns, with confirmation before omitting additional atom data such as charges or forces.
- XDATCAR files display a timeline and export as XDATCAR. Editing is disabled. The header lattice is used for every frame, and export retains twelve decimal places for lattice vectors and fractional coordinates. Playback updates existing atom meshes and labels when the lattice is unchanged.

Malformed files with non-finite scaled coordinates, invalid cell volumes, or impossible atom counts are rejected before rendering.
XYZ property declarations validate column names, types, and counts before loading. XYZ coordinates and lattice values accept decimal scientific notation with `E` or `D` exponents; hexadecimal numbers are rejected. A rejected file leaves the open structure and its edit history intact.

The Bond Length slider sets an absolute maximum. “Use Atomic Radii” is on by default and also limits bonds using covalent radii; turn it off to use distance alone.
For periodic structures, bonds crossing a cell face are shown as faint segments ending at the face. Measurements default to the nearest periodic image, including tilted cells. Use the measurement mode button to measure the displayed copies instead; selecting a ghost copy always measures that explicit image.
Changing the number of periodic images refits the preview while keeping its viewing direction.

Editing has Undo and Redo buttons, with ⌘Z/Ctrl+Z and ⌘⇧Z/Ctrl+Y shortcuts. The header marks unsaved structure edits. Exporting clears that marker, while opening a different file or leaving the page asks before discarding unsaved edits. Selection changes alone do not mark the structure as edited.
Selective-dynamics controls and fixed-atom indicators are available for POSCAR files, which preserve the flags on export. XYZ editing supports coordinates, atoms, and cells without offering unsaved constraint flags.
Releasing an atom or cell-edge drag outside the canvas completes the edit. Press Escape to cancel a drag; interrupted drags restore the original geometry, and drags that leave geometry unchanged do not add undo entries.

Use **Find atom by number** in the Atoms panel to select and center an atom that is hard to click. In Edit mode, selecting one atom opens Cartesian or fractional coordinate inputs for precise placement; the change can be undone or redone.
Keyboard focus stays on coordinate and measurement controls when their panels refresh. Clearing a selection returns focus to Find atom by number.
Shift and add-atom inputs reject invalid or unrepresentable coordinates without changing the structure or undo history.
**Center in Cell** uses periodic coordinates, so a cluster that crosses a cell boundary stays together when moved to the middle.

## Code and tests

`index.html` contains the UI, `styles.css` contains the styling, `geometry.js` contains coordinate conversion and periodic geometry, `formats.js` contains file parsers and exporters, and `structure.js` contains structure summaries. These three modules run without the browser or Three.js renderer. `app.js` contains structure operations, rendering, and event handling. These areas still share application state, so new features should keep loading, rendering, editing, undo, and export behavior consistent.

The renderer reuses sphere geometry and element materials across atoms, reuses bond geometry, and caches the smallest atom radius during redraws. Views above 500 displayed atoms use simpler spheres, batch atoms by element and ghost state while retaining their picking/editing meshes, batch solid and ghost bonds, skip shadows, and cap active rendering at 30 fps. Idle views render at a lower rate, while edits request an immediate redraw. Atom-number navigation and coordinate-system toggles are keyboard accessible; the status bar announces actions to assistive technology.

Run the focused tests with:

```sh
node --test tests/*.test.cjs
```
