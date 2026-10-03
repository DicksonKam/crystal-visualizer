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
- XYZ files with a `Lattice="..."` field are treated as periodic. They export as POSCAR after editing.
- XDATCAR files display a timeline and export as XDATCAR. Editing is disabled. The header lattice is used for every frame.

The Bond Length slider sets an absolute maximum. “Use Atomic Radii” is on by default and also limits bonds using covalent radii; turn it off to use distance alone.
For periodic structures, bonds crossing a cell face are shown as faint segments ending at the face. Measurements default to the nearest periodic image, including tilted cells. Use the measurement mode button to measure the displayed copies instead; selecting a ghost copy always measures that explicit image.

## Code and tests

`index.html` contains the UI, `styles.css` contains the styling, `geometry.js` contains testable periodic geometry, and `app.js` contains parsing, structure operations, Three.js rendering, and event handling. The code currently uses shared state in one JavaScript file, so new features should keep format and coordinate behavior consistent across loading, rendering, editing, undo, and export.

Run the focused tests with:

```sh
node --test tests/*.test.cjs
```
