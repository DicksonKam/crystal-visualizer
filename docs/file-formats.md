# File formats

Crystal Visualizer opens CIF files, VASP POSCAR structures, ordinary and lattice-bearing XYZ files, and XDATCAR trajectories. POSCAR, XYZ and XDATCAR export back in their own format; a CIF exports as POSCAR. This page records exactly how each format is read, validated and written.

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

## CIF

- Reads the structural part of a CIF 1.1 file: `_cell_length_*` and `_cell_angle_*`, the symmetry operations loop (`_symmetry_equiv_pos_as_xyz` or `_space_group_symop_operation_xyz`), and the `_atom_site_*` loop with fractional (or, failing that, Cartesian) coordinates. CIF2 and mmCIF dotted tags such as `_atom_site.fract_x` are accepted. Comments, quoted strings, `;` text fields and save frames are handled; uncertainties such as `0.3748(2)` are read as the value.
- The cell becomes a lattice with **a** along x and **b** in the xy plane. Every operation is applied to every site, positions are wrapped into the cell, and positions of the same site closer than 0.001 (fractional) are kept once, so the viewer shows the full P1 cell exactly as VESTA does. The source site label is kept on each atom.
- Elements come from `_atom_site_type_symbol` (charges such as `O2-` or `Si+4` are dropped), otherwise from the leading letters of the label; `D` and `T` count as hydrogen. Species groups follow the order in which elements first appear.
- A file with no operations loop is accepted when its space group is `P 1` (or No. 1) or unstated. Naming another space group without listing operations is an error, because expanding it would need a space-group table; VESTA, the Materials Project, COD and ICSD all write the loop.
- Only the first data block with atoms is shown. Sites with missing coordinates are left out, and partially occupied or disordered sites are shown in full; both are reported in the status line and Structure Info. Occupancies, displacement parameters, bonds and everything else in the file are ignored. Files that would expand to more than 10,000 atoms are rejected.
- Structure Info shows the space group as named in the file, the number of sites and operations, and that export writes POSCAR.
- A CIF structure behaves like a POSCAR afterwards: it can be edited, takes selective-dynamics flags, and exports as POSCAR with the expanded cell and Cartesian coordinates. There is no CIF writer.

## XDATCAR

- XDATCAR files display a timeline and export as XDATCAR. Editing is disabled.
- The header lattice is used for every frame, and export retains twelve decimal places for lattice vectors and fractional coordinates.
- Playback updates existing atom meshes and labels when the lattice is unchanged; a frame that carries an atom onto or off a cell face, changing which boundary copies exist, rebuilds the scene instead.

## Validation

Malformed files with non-finite scaled coordinates, invalid cell volumes, or impossible atom counts are rejected before rendering. XYZ property declarations validate column names, types, and counts before loading. XYZ coordinates and lattice values accept decimal scientific notation with `E` or `D` exponents; hexadecimal numbers are rejected. A rejected file leaves the open structure and its edit history intact.

## Export

**Export** opens a small menu.

- *Structure file* writes back the kind of file that is open (POSCAR, XYZ or XDATCAR) with your edits; a CIF is written as POSCAR. Exporting clears the unsaved-edits marker. Deleting all atoms leaves an editable empty structure; export waits until you add an atom or undo the deletion, so it cannot download a file the viewer cannot reopen.
- *Image* saves a PNG of the view exactly as shown, including the background, atom colours, bonds, labels, cell and axes you have switched on, at 1×, 2× or 4× the size of the view. Tick *Transparent background* to leave the background out, for placing the picture on a slide or a figure. For a trajectory the file name carries the frame number.
- *Movie* (trajectories only) plays every frame at the timeline's FPS, at the chosen image size, and the browser records it as an MP4 file (H.264), which plays in PowerPoint, Keynote, QuickTime and VLC. The status line counts the frames and Escape cancels. Chrome, Edge and Safari record MP4; Firefox cannot, so there the button saves a WebM file and the menu says so.

The **Reset view** button in the corner of the 3D view is page chrome, not part of the picture, so it never appears in an exported image or movie.
