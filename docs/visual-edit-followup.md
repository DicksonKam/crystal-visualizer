# Visual edit and panel follow-up — 2026-10-05 (Hong Kong)

The left panel now has a draggable divider. Pulling it fully left collapses the
panel; the divider remains available to reopen it. Double-click and keyboard
controls offer the same resizing/collapse behavior. Width is saved locally when
storage is available, and constrained to retain space for the structure view.
Pointer cancellation and Escape restore the prior width. Resizing does not
change the document or edit history, and the canvas/projection follows the layout.

The Title row previously discarded everything beyond 20 characters. It now
renders the full title, and filenames/titles wrap. Screenshot inspection also
exposed clipped header controls at a narrower desktop size; the toolbar now
wraps below 1100 pixels.

Validation: **141 unit tests and all 62 browser tests passed**. The complete
browser run took approximately 5.4 minutes. Four layout tests cover widths of
1440, 800 and 390 pixels, collapse/reopen, canceled gestures, keyboard controls,
persistence, full long text, canvas sizing and the Export control's visibility.

The visual edit tests run **32 cycles** across 1440×900 and 900×760 viewports.
Each cycle changes the panel width (including collapse), drags a boundary atom,
uses the first frame gesture to resize, and performs two Undo, two Redo and two
Undo actions. A final real pointer rotation captures a different view. Each
viewport captures seven rendered images, including atom and frame previews.
Representative expanded/collapsed, narrow-screen, preview and rotated images
were actually opened and inspected. Six inspected images, hashes, source hashes
and the validation manifest are retained in
`tests/stress/evidence/2026-10-05/visual-panel/`.

The first visual run was intentionally interrupted: moving the camera in its
setup without refreshing clipping planes produced blank structure images.
Visual inspection caught this even though document/picking checks passed. The
corrected setup refreshes clipping and captures after rendered frames; it passed
both independently and in the complete suite. This was a harness defect and is
not counted as a production app bug.

These runs use a synthetic FCC sequence and Chromium software WebGL, rather
than proving every arbitrary user sequence or GPU configuration. Initial camera
alignment is prepared in the test; subsequent drags and rotation use real pointer
events. Large-structure performance has not been newly benchmarked. Clipped
connections to undisplayed periodic neighbors remain a separate display-policy
choice; they were not silently removed. The user's unsaved app tab was not
reloaded or edited. Changes and evidence are saved locally, with no push.
