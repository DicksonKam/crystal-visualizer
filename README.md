# Crystal Visualizer

A browser-based viewer and editor for atomic structures. It loads VASP POSCAR structures, ordinary and lattice-bearing XYZ files, and XDATCAR trajectories. You can inspect atoms and bonds, measure distances and angles, edit coordinates and selective dynamics, preview periodic images, build supercells, and export the result.

## Run locally

Serve this directory over HTTP, then open the local URL in a browser. For example:

```sh
python3 -m http.server 8000
```

The built-in examples use `fetch`, so opening `index.html` as a raw file will not load them. The page also loads Three.js and fonts from public CDNs; those resources require an internet connection.

## File behavior

- POSCAR accepts Direct and Cartesian coordinates, optional selective-dynamics flags, positive scale factors, and negative volume scale factors. Exports use Cartesian coordinates and a scale of `1.0`.
- Ordinary XYZ files are treated as molecules. Their original Cartesian coordinates are retained, and cell/periodic controls are disabled. They export as XYZ.
- XYZ files with a `Lattice="..."` field are treated as periodic. Extended XYZ `Properties` may place species and positions in a different column order; other properties are ignored. They export as POSCAR after editing.
- XDATCAR files display a timeline and export as XDATCAR. Editing is disabled. The header lattice is used for every frame, and export retains twelve decimal places for lattice vectors and fractional coordinates.

The Bond Length slider sets an absolute maximum. “Use Atomic Radii” is on by default and also limits bonds using covalent radii; turn it off to use distance alone.
For periodic structures, bonds crossing a cell face are shown as faint segments ending at the face. Measurements default to the nearest periodic image, including tilted cells. Use the measurement mode button to measure the displayed copies instead; selecting a ghost copy always measures that explicit image.

Editing has Undo and Redo buttons, with ⌘Z/Ctrl+Z and ⌘⇧Z/Ctrl+Y shortcuts. The header marks unsaved structure edits. Exporting clears that marker, while opening a different file or leaving the page asks before discarding unsaved edits. Selection changes alone do not mark the structure as edited.

Use **Find atom by number** in the Atoms panel to select and center an atom that is hard to click. In Edit mode, selecting one atom opens Cartesian or fractional coordinate inputs for precise placement; the change can be undone or redone.

## Code and tests

`index.html` contains the UI, `styles.css` contains the styling, `geometry.js` contains periodic geometry, and `formats.js` contains file parsers and exporters that can run without the browser or Three.js renderer. `app.js` contains structure operations, rendering, and event handling. These areas still share application state, so new features should keep loading, rendering, editing, undo, and export behavior consistent.

The renderer reuses sphere and bond geometry across atoms and caches the smallest atom radius during redraws. Atom-number navigation and coordinate-system toggles are keyboard accessible; the status bar announces actions to assistive technology.

Run the focused tests with:

```sh
node --test tests/*.test.cjs
```
