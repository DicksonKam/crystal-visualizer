# Camera contract

`camera.js` exports `CrystalCamera` in browser scripts and CommonJS in direct tests. `createMath(THREE)` contains orientation, fitting, and clipping math; `createController(adapter)` contains gesture eligibility, cancellation, and one transition. Neither uses DOM events or a renderer. `app.js` supplies camera poses, current lattice axes, controls cleanup, and UI callbacks. The app's existing animation loop is the only animation owner.

## Actions and cancellation

- Left-pointer or one-finger rotation may capture an axis after release. A rotation must change orientation by at least 0.25° to qualify.
- Wheel/middle-pointer zoom, right-pointer pan, multifinger navigation, and clicks never initiate automatic capture. They retain viewing direction.
- Explicit signed axis alignment preserves pivot, camera distance, and orthographic zoom. It may turn farther than the automatic correction limit.
- Fit preserves the complete orientation, recenters on rendered bounds, and fits their projected width and height with 15% padding. Perspective fitting also accounts for corner depth; orthographic fitting changes zoom. Picking-only resize detectors are excluded. Distance has no former 100 Å maximum, and clipping planes derive from current bounds and pose so large cells remain visible.
- Reset uses camera-from direction `(1, 0.8, 1)` and projected world-Y up, then recenters and fits. Prior roll does not affect the result.
- Focus changes the pivot to the selected atom and translates the camera by the same displacement, preserving orientation, distance, and zoom.

Fit, reset, focus, and camera restoration after a scene rebuild use `controller.setPose`; alignments use `controller.align`. These actions do not mutate document geometry or history. Atom selection retains its existing selection-history behavior without changing the edit revision.

New pointer, wheel, touch, or keyboard input cancels pending capture and active alignment before input is consumed. Blur, pointer cancellation, document replacement, scene rebuilds, mode changes, cell resizing, and Auto Snap changes also cancel movement. A cancellation revision invalidates the transition and clears gesture/history samples. Canceled transitions have no later completion callback and cannot restore obsolete handles or replace a newer status message. Alignment status is written only on successful alignment completion; focus and load keep their own messages.

The adapter disposes and recreates the pinned TrackballControls instance to discard its private damping state, preserving target, pose, enabled state, and public navigation options. Disabling controls alone does not clear that state. Input capture runs before the controls' listeners, so the new adapter consumes the same interrupting input. Controls are not updated during a programmed transition. The recreated adapter has no residual motion when it next updates, including after completion or interruption.

## Capture policy

All defaults are centralized in `CrystalCamera.POLICY`:

- Maximum **total quaternion correction: 5°**, including any roll adjustment.
- Angular speed strictly below **1°/s** for **120 ms continuously**.
- The same axis candidate must remain stable for **120 ms**.
- Angular tie margin: **0.25°**. Retain a previous eligible candidate within that margin of the nearest. An initial tie between distinct directions is ambiguous and causes no correction. Nearly equivalent directions have a deterministic representative.
- Meaningful rotation and approach noise tolerance: **0.25°** each. Ignore quaternion history changes below 0.02°; retain up to 120 changed samples. Compare the settled direction with the beginning of the terminal **150 ms** of changed rotation history (or the previous changed sample when only one recent sample remains). The chosen axis must become more than 0.25° closer. Departure or a recent reversal therefore does not snap back; small jitter gives no evidence of intent.
- Transition duration: **300 ms**, with elapsed-time cubic ease-out and shortest-path quaternion interpolation. Reduced motion applies the exact final pose immediately.
- Manual control simulation: **60 Hz**, independent of render frequency. Damping and angular-speed samples run at those same simulation timestamps, preventing alternating zero/sudden velocity estimates on 120 Hz displays. Catch-up is bounded to 250 ms; after a longer pause it resumes one simulation step rather than replaying a burst of stale inertia.

Eligibility uses only angles to the six normalized lattice vectors. Vector lengths and average cell dimensions never enlarge the capture cone. Quiet views outside the cone or with ambiguous candidates leave settling without a transition. Direction, candidate stability, speed, recent approach, Auto Snap state, and total quaternion correction are checked again immediately before automatic alignment starts.

## Orientation convention

A camera quaternion maps local +Z to the direction from pivot to camera and local +Y to camera up. “View from +a” uses normalized positive a as that +Z direction, looking toward the pivot; “View from −a” uses negative a. These are lattice directions, not reciprocal vectors or cell-face normals.

Canonical a/b views use c as reference up; c views use b. Project reference up onto the plane perpendicular to the viewing direction. If its length is below 1e−6 after projection, use the least-aligned world basis vector (X, Y, Z with deterministic ties). Complete a perpendicular right/up basis before constructing the quaternion. Signed views share the positive reference up. Canonical roll zero is this projected frame; successive 45° frames rotate around the normalized target direction and remain evenly spaced in skewed cells.

Automatic alignment first applies the smallest swing from the current camera-from direction to the chosen axis. It preserves the existing roll through that swing. A canonical 45° roll frame is used only when the complete rotation from the starting quaternion remains within 5°; otherwise the minimal swing is retained. The position is always `pivot + distance × quaternion(+Z)` and up is `quaternion(+Y)`. Alignment never interpolates an independent position or up vector.

## UI and handles

The View panel has a native checked Auto Snap checkbox, six signed view buttons with explicit accessible labels, and Fit View. Header Reset View remains available; the header wraps at narrow widths so it cannot clip that action offscreen. Native keyboard operation and visible focus outlines require no camera shortcuts; TrackballControls key bindings are empty so coordinate/text entry remains usable. The three-column button grid fits the existing responsive sidebar. Lattice controls disable for molecules while rotation, zoom, pan, fit, reset, and focus remain available.

Edit-mode resize detectors follow the actual current lattice-axis orientation. Suspend them during rotation, settling, programmed movement, or a cell drag, then rebuild from the current pose and scene. Detectors remain on the raycaster-only layer with color and depth writes disabled. They affect neither rendered pixels nor fitting bounds.

## Verification

`tests/camera.test.cjs` covers angle boundaries, elongated cells, stable/ambiguous candidates, approach/departure/jitter/reversal, continuous velocity settling, robust skewed and nearly parallel up vectors, equal canonical roll spacing, total correction limits, preserved alignment poses, cancellation, instant actions, reduced motion, frame-rate equivalence, projected fitting, and clipping.

`tests/browser/camera.spec.cjs` uses the pinned renderer and controls with **normal damping**. It covers actual pointer rotation, wheel zoom, right-button pan, clicks, signed buttons, interrupted manual continuation, atom focus during automatic snapping, Auto Snap off, scene rebuilds, reduced motion, keyboard operation, molecule navigation, narrow large-cell fitting, deterministic reset, document/history invariants, and identical timestamped pointer input at 30/60/120 Hz. Tests do not navigate the user's existing document.

`tests/browser/cell-frame.spec.cjs` retains the 144 WebGL pixel comparisons plus picking, bounds, scene/visibility lifecycle, real resizing, Escape, undo/redo, and canceled alignment coverage. The remaining app browser tests retain example loading, measurements, editing, export, and trajectory regressions. Run all checks with `npm run test:all`.

## Completion audit — 2026-10-04

The ten implementation requirements were checked against the final sources and executable tests:

1. The static script architecture and pinned Three.js remain intact; the existing app and cell-frame suites pass alongside the new camera module.
2. Gesture classification and `setPose` distinguish camera actions. Real input, focus, mode changes, document replacement, and rebuild tests prove cancellation; focus retains its newer status.
3. Centralized angular policy and controller tests prove the 5° boundary, continuous speed settling, stable candidates, angular ties, approach/noise/reversal behavior, and dimension-independent eligibility.
4. Basis, canonical-roll, and total-quaternion tests cover skewed and nearly parallel references. Signed browser views match normalized lattice directions.
5. The existing render loop drives the sole transition. Real normal-damping tests prove inertia removal, unchanged pivot/distance/zoom, no restarted motion, interruption, reduced motion, and 30/60/120 Hz equivalence.
6. Fitting and clipping tests cover narrow viewports and 500 Å cells. Browser tests prove preserved Fit orientation, consistent Reset roll, Focus cancellation, and unchanged geometry/edit revision for camera actions.
7. Keyboard and molecule tests verify the controls' accessibility and disabled state. Separate desktop and 430 px browser inspection confirms the new panel layout and reachable Reset. Pixel comparisons and pointer-resize tests retain picking-only handles.
8. `camera.js` remains DOM/renderer independent and directly testable. Superseded camera timers and snap loops are removed; this document and README describe the final contracts.
9. The complete verification gate passes: **125 unit tests and 23 Chromium browser tests**, including all existing rendering, picking, resizing, Escape, undo/redo, examples, measurements, export, and trajectory regressions.
10. Implementation stages are saved in local Git commits. Separate-browser visual inspection produced no page errors and did not navigate the user's open document. No dependencies were upgraded, and nothing was pushed or deployed.

Browser verification uses Chromium with software WebGL. Native touch hardware and other browser engines were not exercised; the implemented touch classification uses the pinned controls' one-finger versus multifinger events.
