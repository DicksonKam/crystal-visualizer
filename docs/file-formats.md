# File formats

Crystal Visualizer opens VASP POSCAR structures, ordinary and lattice-bearing XYZ files, and XDATCAR trajectories, and exports each back in its own format. This page records exactly how each format is read, validated and written.

## POSCAR

- Accepts Direct and Cartesian coordinates, optional selective-dynamics flags, one positive scale factor, three positive Cartesian scale factors, or one negative target-volume factor.
- Counts-only files remain counts-only on export. Species groups retain their original order even when their labels match. Deleting a group's last atom retains a zero count, and adding an atom to a repeated label offers an explicit species-group choice.
- Structure-only exports use Cartesian coordinates and a scale of `1.0`.
- When a POSCAR has additional data after the atom positions (such as velocities), an unchanged export preserves the original file exactly; an edited export warns and asks before omitting that data.
- Selective-dynamics controls and fixed-atom markers are available for POSCAR files, which preserve the flags on export.

## XYZ

- Ordinary XYZ files are treated as molecules. Their original Cartesian coordinates are retained, and cell/periodic controls are disabled. They export as XYZ. Multi-frame XYZ files are rejected because only one frame can be displayed and exported.
- XYZ files with a `Lattice="..."` field retain their cell. Extended XYZ `pbc` flags control periodicity independently along a, b, and c; absent flags default to all three periodic when a lattice is present. Measurements, boundary bonds, periodic previews, supercells, and shifts respect these flags, and edited export preserves them. A cell with `pbc="F F F"` keeps cell and fractional-coordinate controls without periodic images or wrapping.
- Extended XYZ `Properties` may place species and positions in a different column order; other atom properties are not editable. An unchanged XYZ export preserves the original file. After edits, export uses the current lattice and species/position columns, with confirmation before omitting additional atom data such as charges or forces.
- XYZ editing supports coordinates, atoms, and cells without offering unsaved constraint flags.

XYZ configuration metadata is separate from the human description. After geometry changes, export asks before omitting potentially stale results such as energy, stress, virial, and unknown metadata fields. Only descriptive fields (`name`, `label`, `comment`, and `config_type`) are retained automatically. Undoing back to the original geometry permits preservation of its source metadata again. Quoted metadata values are read as complete values, so text such as `label="pbc=F"` does not change periodicity.

## XDATCAR

- XDATCAR files display a timeline and export as XDATCAR. Editing is disabled.
- The header lattice is used for every frame, and export retains twelve decimal places for lattice vectors and fractional coordinates.
- Playback updates existing atom meshes and labels when the lattice is unchanged; a frame that carries an atom onto or off a cell face, changing which boundary copies exist, rebuilds the scene instead.

## Validation

Malformed files with non-finite scaled coordinates, invalid cell volumes, or impossible atom counts are rejected before rendering. XYZ property declarations validate column names, types, and counts before loading. XYZ coordinates and lattice values accept decimal scientific notation with `E` or `D` exponents; hexadecimal numbers are rejected. A rejected file leaves the open structure and its edit history intact.

## Export

**Export** opens a small menu.

- *Structure file* writes back the kind of file that is open (POSCAR, XYZ or XDATCAR) with your edits. Exporting clears the unsaved-edits marker. Deleting all atoms leaves an editable empty structure; export waits until you add an atom or undo the deletion, so it cannot download a file the viewer cannot reopen.
- *Image* saves a PNG of the view exactly as shown, including the background, atom colours, bonds, labels, cell and axes you have switched on, at 1×, 2× or 4× the size of the view. Tick *Transparent background* to leave the background out, for placing the picture on a slide or a figure. For a trajectory the file name carries the frame number.
- *Movie* (trajectories only) plays every frame at the timeline's FPS, at the chosen image size, and the browser records it as an MP4 file (H.264), which plays in PowerPoint, Keynote, QuickTime and VLC. The status line counts the frames and Escape cancels. Chrome, Edge and Safari record MP4; Firefox cannot, so there the button saves a WebM file and the menu says so.

The **Reset view** button in the corner of the 3D view is page chrome, not part of the picture, so it never appears in an exported image or movie.
