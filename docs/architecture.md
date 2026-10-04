# Document and editing contract

The app remains a static site. Its scripts load in dependency order: geometry, document, formats, structure, history, camera, measurement, then the browser adapter. Each domain module also exports CommonJS functions for direct unit testing. The domain modules must not import `app.js`, inspect the DOM, or store renderer objects.

## Authoritative document state

- Cartesian `atom.position` is authoritative. `fractional` is a derived cache refreshed when positions or the cell change; it is null for ordinary XYZ molecules.
- Every parsed atom has an `id` and `speciesId`. IDs belong to the document, while array indices and mesh handles belong to the current view. Adding atoms and supercell copies allocates distinct atom IDs. Undo restores the identity of deleted atoms.
- `speciesGroups` is an ordered list of `{ id, element }`. Labels need not be unique. POSCAR group order may correspond to different POTCAR entries, so deleting a group's last atom must preserve the group with count zero. New groups append to that order.
- `elements` and `counts` are compatibility summaries derived from group membership. Use `CrystalDocument.recalculateCounts`; do not group atoms by label text. Export derives counts from actual membership and rejects ambiguous or unknown groups.
- Lattice vectors, Cartesian positions, and derived fractional coordinates must be finite. Cells must have representable nonzero volume. An empty edited document is allowed for recovery, but cannot be exported.
- Format flags remain parser metadata. Feature code queries `CrystalDocument.capabilities` for cell, periodic axes, editable geometry, and constraint support instead of inventing its own format rules.

XYZ metadata fields are stored separately from the human description. `xyzSourceGeometry` identifies the geometry to which source results belong. An edited export compares current geometry with that baseline, preserves known descriptive fields, and asks before omitting other fields. Unknown fields are treated conservatively because their scientific meaning is not known. Undo restores eligibility when source geometry matches again; original source text is preserved for unchanged exports.

## Editing contract

Prepare proposed coordinates or cell data without mutating the live document. Validate every proposed coordinate and the complete cell through `CrystalDocument.preparePositions` before committing. Only then record an operation and refresh rendering/UI. Invalid and unchanged proposals must leave history, edit revision, selection, and document geometry intact.

`commitGeometryEdit` is the browser adapter for exact-coordinate and shift commands. Atom drag previews use the document validator, and cell previews use the pure `CrystalStructure.prepareCellResize`. Preview changes are not history entries: release records one operation, while Escape restores the original geometry. Supercell preparation validates every copy before replacing the document.

Deletion, addition, and constraint edits must preserve atom/species identity and refresh their derived summaries. History handlers are browser adapters; `CrystalHistory` owns stack limits, revision allocation, dirty/saved state, reset, and undo/redo bookkeeping. Selection operations remain reversible but do not advance the document revision. A new operation starts a new history branch and clears redo. Redo snapshots contain document data and selection descriptors, never scene objects; documents currently retain at most 50 operations.

## Bounded geometry

The exact nearest-image solver uses lattice reduction with integer transforms, then QR search. It returns image offsets in the source basis. Reduction and search have explicit iteration limits; offsets outside safe integer precision fail visibly instead of producing a misleading distance. Atom measurements use selected positions directly and do not invoke this solver.

Boundary-bond preparation estimates all translation ranges before allocating or drawing. If total work exceeds its limit, boundary bonds are omitted as a whole with a persistent warning; ordinary bonds remain available. Current synchronous work is explicitly bounded. A future worker implementation must retain these limits and add cancellation rather than making an unbounded calculation run indefinitely off the UI thread.

## Extending and verifying

For a new format, define its capabilities and provenance rules, initialize document identities, and keep parsing/export independent of rendering. For a new edit, define prepare/validate/commit and undo behavior before wiring controls.

Regression tests should prove observable invariants: atom counts and group ordering survive round trips; committed geometry is valid; rejected operations leave state untouched; undo restores geometry and source-metadata eligibility; and expensive accepted inputs finish or report a bounded failure. The browser suite also verifies actual upload/download behavior, DOM updates, WebGL rendering, and trajectories. GitHub Actions runs the unit and browser suites with pinned dependencies.

Rendering and UI still share the browser controller. Extract additional adapters incrementally when a feature introduces a clear boundary; domain validation and document identity must remain in the standalone modules.

## Interaction geometry and alignment

Cell resize detectors belong to `CELL_PICKING_LAYER`, which is enabled on the raycaster and excluded from both structure cameras. They remain children of the structure to inherit its transform, but must not contribute to document bounds. Their materials disable color and depth writes as a safeguard; zero opacity alone does not make geometry harmless to rendering. Actual cell lines and hover/drag outlines remain visible scene objects with their normal depth testing.

Rebuilding a structure clears detector and highlighted-edge references before disposing old meshes, then recreates detectors from the current lattice only when a visible cell is aligned in Edit mode. Detectors are suspended during camera interaction, snapping, and cell dragging. Picking updates world matrices explicitly so it works before the next render. Use the common cleanup and rebuild functions rather than maintaining independent detector lifecycles.

Atom dragging captures its camera-perpendicular plane at pointer-down. `CrystalGeometry.cellPlaneSection` computes its cell-local intersection, including coplanar endpoints/edges, with a tolerance of 1e-10 times the longest lattice vector. It projects numerical near-hits onto the plane, merges duplicates, and orders the convex section. The visible guide and movement constraint use the same section and coordinates relative to the drag anchor. A face-aligned boundary atom can traverse the entire face; genuine oblique sections retain their actual shape. Tangent edge/corner sections constrain to a segment/point rather than allowing unrestricted movement. Geometry tests cover cubic and tilted faces, roundoff, scale, and oblique/tangent cases; browser regressions cover all six faces and real pointer movement through both halves, clipping, undo and redo.

Camera policy and transitions live in `camera.js`, driven by the existing render loop. There are no settling timers or separate snap animation loops. All camera actions use its cancellation revision; the browser adapter explicitly discards TrackballControls inertia before programmed movement. See [the camera contract](camera.md) for action semantics, signed lattice directions, thresholds, timing, and regression evidence.

The cell-frame browser regressions compare actual WebGL pixels with and without detectors at the same camera position, across signed axes, alignment thresholds, zoom levels, and cubic/skewed cells. Additional cases verify picking, bounds, scene rebuilds, mode/cell visibility, real pointer resizing, Escape, undo/redo, and interrupted alignment. These tests check that interaction geometry cannot affect the image; they do not require twelve separately visible edges in views where projection overlaps them.

The corner axes are a second scene drawn over the main framebuffer. That pass disables automatic clearing temporarily and clears depth only within its scissor rectangle, preserving both the opaque main background and any structure behind the axes. Restore automatic clearing, scissor state, and the full viewport in a `finally` block. Matching colors alone is insufficient because clearing would still erase scene content. `tests/browser/axes-overlay.spec.cjs` reads actual framebuffers before and after this pass at device pixel ratios 1/2 and wide/narrow sizes, checking opacity, axes visibility, content preservation, and renderer-state restoration.

## Measurement geometry

`CrystalMeasurements.createMeasurements()` resolves one geometry from the actual selected world positions, with no lattice dependency or nearest-image substitution. Selecting an explicit ghost measures that copy. Adding a third atom does not change the first arm. The second selected atom is the shared angle vertex.

Each result includes points, consecutive pairs with signed displacements and distances, and an angle referencing those same points. The renderer and both measurement panels consume this geometry. Collinear arms have valid 0°/180° values and a deterministic arc plane; coincident arms have no defined angle. Nonfinite coordinates or unrepresentable distances remain Unavailable and omit the affected line and angle.

All derived lines, arcs, and labels share the `isMeasurementVisual` lifecycle flag so redraws dispose their materials and textures together while preserving selection badges. Clearing, undoing, and redoing a selection reconstructs measurements from current selection descriptors. There are no synthetic image markers or distance-mode controls. Measurements do not modify structure fitting bounds, document data, or exports.

`tests/measurement.test.cjs` covers shared point identity, signed deltas, selection stability, ghost copies, invalid and large finite coordinates, coincident/collinear arms, and the silicon example's actual selected distances and angle. `tests/browser/measurement.spec.cjs` checks rendered line/arc endpoints, panel values, unchanged bounds/document/revision, camera rotation, mode changes, disposal, clear/undo/redo, document replacement, and explicit ghost selection.
