# Using the viewer

The toolbar has **Open**, which loads a file from your computer, **Examples**, which shows the built-in structures, one **Edit** toggle, Undo and Redo, and **Export**. The left panel shows structure information, the species list, measurements or edit controls, and display options; the 3D view fills the rest.

## Navigation

Drag to rotate, right-drag to pan (the structure follows the pointer one-to-one), and zoom with the scroll wheel, a two-finger scroll, or a trackpad pinch; a pinch has its own gain so one pinch zooms about as much as a few wheel ticks.

Automatic snapping uses the existing drag controls and adds no buttons or panels. After a meaningful approaching rotation settles, it may apply at most 5° of total orientation correction. Zoom, pan, clicks, and movement away from an axis do not trigger snapping. New input or atom focus interrupts alignment. The **Reset view** button sits in the corner of the 3D view. See [the camera contract](camera.md) for defaults and conventions.

Fitting frames the atoms and bonds; a cell that leaves more than 6 Å of vacuum along an axis, such as a molecule box or a slab, may extend beyond the view. Changing the number of periodic images refits the preview while keeping its viewing direction.

Use **Find atom by number** in the Atoms panel to select and center an atom that is hard to click. Focusing an atom moves the camera and pivot together, preserving orientation and zoom while canceling alignment. Keyboard focus stays on coordinate and measurement controls when their panels refresh, and clearing a selection returns focus to Find atom by number.

## Structure information

Structure Info lists the file, title, atom count, the cell lengths a, b, c, the angles α, β, γ and the cell volume, for CIF files the space group, site and operation counts, and for POSCAR files a summary of selective-dynamics constraints.

## Atoms, bonds and colours

Atoms use VESTA's default element colours (lilac Mo, olive Te, red O, blue Si, and so on), so a structure looks as it does in VESTA; an element outside the table draws in VESTA's neutral grey. Ball size comes from covalent radii scaled by the Atom Size slider. To recolour an element, click its sphere in the Atoms panel and pick a colour; every atom and copy of that element changes at once, in this and every later structure, and a **default** link beside the element puts its colour back.

The Bond Length slider is the one bond cutoff: a bond is drawn between any two atoms closer than it, and at 0 no bonds are drawn.

The **Mark Fixed Atoms** checkbox draws a cage around fully fixed atoms and a ring around partly fixed ones; the atoms themselves are always drawn.

## Periodic copies

For periodic structures, the atoms that lie on the far faces, edges, and corners of the displayed cells (for example the copy at fractional 1 of an atom at 0) are drawn as translucent periodic copies, so a cubic cell shows its corner and face atoms. Bonds crossing a cell face toward a copy that is not drawn are shown as faint segments ending at the face. With labels on, each copy carries the number of the atom it repeats. Clicking where an atom and its own copy overlap on screen selects the atom itself.

The Periodic Images steppers show up to 20 cells along each axis, within a 3,000-atom limit. Boundary-bond calculations estimate their workload before allocating translations; when the limit is exceeded, ordinary bonds remain visible and a persistent warning explains why boundary bonds are omitted. Disabling bonds clears that warning.

Supercell conversion (Edit mode) turns the previewed copies into real atoms. It validates the expanded cell and every atom before changing the document or undo history; cells or coordinates that cannot be represented are rejected.

## Measurements

With Edit off, clicking up to three atoms measures distances and the angle at the second atom. Measurements always use the actual selected atom positions: distance lines connect those atoms, and the angle uses the second selected atom as its vertex. Selecting a periodic copy measures that specific copy; no shorter periodic image is substituted, and there is no distance-mode toggle.

Distance captions sit at the midpoint of their line and the angle caption on its bisector at the vertex; a caption moves only when it would cover another caption, and nothing is tied to leader lines. Point markers always sit on their atoms.

A measurement is an annotation, not a selection. It stays on the canvas when Edit is switched on and follows every change to the structure: dragging an atom, the coordinate fields, Move, a cell resize, undo and redo. With Edit on, a compact readout at the top of the Edit panel shows its distances and angle beside the Measurements panel's colour stripe, with a × that clears it; the Measurements panel (Edit off) keeps the atom list, coordinates and displacements. Clicking a measured atom again removes that point, a fourth atom starts a new measurement, and **Clear Measurement** or Escape (with Edit off) clears it. Measuring and clearing are undoable and do not count as edits to the structure. Selecting atoms in Edit mode never changes a measurement: a measured atom can be selected, moved and deleted like any other, and deleting it drops that point from the measurement until the deletion is undone.

## Editing

Switch **Edit** on to move, add and delete atoms; the toggle is unavailable for a trajectory. Click to select and drag to move; Escape clears the selection and leaves a kept measurement in place. Selecting one atom opens Cartesian or fractional coordinate fields that move the atom as they change: the arrow keys and the spinner step it by the chosen step (0.01, 0.05 or 0.1 fractional; 0.1, 0.5 or 1 Å), typing moves it after a short pause, and bonds, periodic copies and a kept measurement follow. The whole editing session is one undo entry, recorded when Enter is pressed or focus leaves the fields; Escape in a field puts the atom back where the session started. Switching the coordinate system mid-session converts the fields and keeps the preview. **Delete** names how many atoms it will remove and is undoable, so it asks no confirmation.

**Select Atoms** picks many atoms at once: one chip per element selects (or, when they are all selected, deselects) every atom of that element, and a range along x, y or z in Å, or along a, b or c in fractional coordinates, selects the atoms whose coordinate lies between the two bounds; the fields show the structure's extent along that axis as placeholders, and a bound left empty is open. **Box select** turns a left-drag on the canvas into a rectangle that selects every real atom whose centre falls inside it, at whatever depth, so a layer seen edge-on is one stroke; Shift+drag does the same without the button, Escape cancels a box in progress, and periodic copies are never selected. Holding Alt turns any of these into removal: Alt+drag (or Alt+Shift+drag) deselects the atoms inside the box, which is drawn in red, Alt+click on a chip removes that element and Alt+click on **Select in range** removes the atoms in range. Rules and boxes otherwise add to the current selection, so a layer of one element is two steps; **All**, **Invert** and **None** complete the set. Each rule or box is a single undo step. The selection feeds Delete, Shift and the constraints below.

For formats that carry selective dynamics (POSCAR and CIF), a selection shows **Constraints**: one toggle per axis that reads free, fixed or mixed for the selected atoms. Clicking a toggle fixes that axis for all of them, or frees it when it is already fixed for every one, so a slab can be fixed in z only or an adatom left free along z alone. **Fix** and **Free** set all three axes at once, the list shows each atom's flags (F F T for an atom fixed in x and y), the markers on the canvas follow, and the exported POSCAR writes the per-axis flags. **Free all atoms** in the Structure section clears every constraint. With several atoms selected, the selection card offers **Move**: a shift vector in Å or fractional coordinates applied to the selected atoms as one undo step, so shifting everything is All, then Move. Move and Add Atom reject invalid or unrepresentable coordinates without changing the structure or undo history. The **Structure** section at the foot of the panel holds the whole-structure actions: **Center in cell** uses periodic coordinates, so a cluster that crosses a cell boundary stays together when moved to the middle, and **Free all atoms** clears every constraint. Make Supercell stays beside the periodic-image steppers in the Display panel, since it turns those previewed copies into atoms.

Dragging a cell edge resizes the cell. Resize proposals validate the cell and every atom before changing the live preview; cell-vector lengths stay positive even when atoms lie outside the cell, and an invalid proposal keeps the last valid preview and adds no history entry.

Releasing an atom or cell-edge drag outside the canvas completes the edit. Press Escape to cancel a drag; interrupted drags restore the original geometry, and drags that leave geometry unchanged do not add undo entries.

Undo and Redo have ⌘Z/Ctrl+Z and ⌘⇧Z/Ctrl+Y shortcuts. The header marks unsaved structure edits; exporting clears that marker, while opening a different file or leaving the page asks before discarding unsaved edits. Selection changes alone do not mark the structure as edited.

## Display options and background

The Display panel also sets the background of the structure view: five swatches (midnight, black, slate, paper, white) or any colour from the custom picker. On a light background the measurement captions, lines, angle arc and cell edges switch to dark ink so they stay readable; atoms, bonds and the sidebar keep their colours.

Display options (atom size, bond length, labels, unit cell, axes, fixed-atom markers) and the background are remembered by your browser between visits. They are stored locally and never sent anywhere; another browser or device starts from the defaults. **Reset all** at the foot of the Display panel asks "Reset everything?" in the panel, then restores everything above it (atom size, bond length, labels, fixed-atom markers, periodic images, background) and the atom colours, and clears what was remembered; it is dimmed while everything is already at its default. Periodic images are chosen per structure and are not remembered.

## The side panel

Drag the divider between the left panel and the structure view to resize the panel; pull it fully left to collapse it and drag it right to reopen. Double-click the divider to collapse or restore it. When focused, Left/Right resize it, Home collapses it, End widens it, and Enter toggles collapse. Escape cancels an unfinished divider drag. The width is remembered locally when storage is available and bounded to keep the structure view usable on smaller screens. Filenames and titles are shown in full with wrapping; the toolbar wraps on narrow screens.
