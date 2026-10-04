# Document and editing contract

The app remains a static site. Its scripts load in dependency order: geometry, document, formats, structure, history, then the browser controller. Each domain module also exports CommonJS functions for direct unit testing. The domain modules must not import `app.js`, inspect the DOM, or store renderer objects.

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

The exact nearest-image solver uses lattice reduction with integer transforms, then QR search. It returns image offsets in the source basis. Reduction and search have explicit iteration limits; offsets outside safe integer precision fail visibly instead of producing a misleading distance. No approximate fallback is labelled as a nearest-image measurement.

Boundary-bond preparation estimates all translation ranges before allocating or drawing. If total work exceeds its limit, boundary bonds are omitted as a whole with a persistent warning; ordinary bonds remain available. Current synchronous work is explicitly bounded. A future worker implementation must retain these limits and add cancellation rather than making an unbounded calculation run indefinitely off the UI thread.

## Extending and verifying

For a new format, define its capabilities and provenance rules, initialize document identities, and keep parsing/export independent of rendering. For a new edit, define prepare/validate/commit and undo behavior before wiring controls.

Regression tests should prove observable invariants: atom counts and group ordering survive round trips; committed geometry is valid; rejected operations leave state untouched; undo restores geometry and source-metadata eligibility; and expensive accepted inputs finish or report a bounded failure. The browser suite also verifies actual upload/download behavior, DOM updates, WebGL rendering, and trajectories. GitHub Actions runs the unit and browser suites with pinned dependencies.

Rendering and UI still share the browser controller. Extract additional adapters incrementally when a feature introduces a clear boundary; domain validation and document identity must remain in the standalone modules.

## Interaction geometry and alignment

Cell resize detectors belong to `CELL_PICKING_LAYER`, which is enabled on the raycaster and excluded from both structure cameras. They remain children of the structure to inherit its transform, but must not contribute to document bounds. Their materials disable color and depth writes as a safeguard; zero opacity alone does not make geometry harmless to rendering. Actual cell lines and hover/drag outlines remain visible scene objects with their normal depth testing.

Rebuilding a structure clears detector and highlighted-edge references before disposing old meshes, then recreates detectors from the current lattice only when a visible cell is aligned in Edit mode. Detectors are suspended during camera interaction, snapping, and cell dragging. Picking updates world matrices explicitly so it works before the next render. Use the common cleanup and rebuild functions rather than maintaining independent detector lifecycles.

Camera settling timers and snap animations share a revision. A new camera interaction, view reset, structure rebuild, mode change, or cell drag invalidates pending alignment work. Obsolete callbacks must never reposition a newer view or recreate handles for an old document.

The cell-frame browser regressions compare actual WebGL pixels with and without detectors at the same camera position, across signed axes, alignment thresholds, zoom levels, and cubic/skewed cells. Additional cases verify picking, bounds, scene rebuilds, mode/cell visibility, real pointer resizing, Escape, undo/redo, and interrupted alignment. These tests check that interaction geometry cannot affect the image; they do not require twelve separately visible edges in views where projection overlaps them.
