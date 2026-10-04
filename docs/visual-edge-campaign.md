# Visual edge-case campaign — 2026-10-05

Status: complete. This campaign expands the prior random campaign with 36
targeted cross-feature cases. One reproducible app defect was fixed.

## Confirmed defect and fix

Keyboard trajectory scrubbing changed the displayed frame without pausing its
playback timer. ArrowRight, Home and End reproduced it at both 900 and 390 pixels;
all six cases failed before the fix. Inspected captures showed Pause remaining
active after the native range input moved.

The timeline input handler now stops playback before applying any user scrub.
Pointer-down also pauses early for mouse, pen and touch. Programmatic timeline
updates do not emit input events, so normal playback continues. No new controls
were added. The six regressions now pass, including timer cleanup, retained
measurement selection, slider/frame agreement and the Play accessibility label.
The change is saved in local Git commit `0ca7f97`; nothing was pushed.

## New workflows

- Five delayed-load/edit races: accepting or declining replacement, 404, malformed
  input and a newer local load superseding a pending example. They use real
  pointer drags and inspect preview/settled geometry and selection. The superseded
  case waits for the older response to finish before checking the final document.
- Four delete-all/refill/history cycles with an empty periodic document, duplicate
  species, selective constraints and empty export feedback.
- Two mixed-element 499↔998 periodic/supercell cycles across the instancing
  threshold, with constraint edits, undo/redo and semantic POSCAR export checks.
- Twenty gesture cases: cubic/tilted cells × boundary atom/frame drag × Escape,
  window resize plus Escape, sidebar collapse plus Escape, explicit blur event and
  release outside the viewport. Each repeats three interruption cycles and tests
  the next gesture and undo. The next drag must commit a new history entry and
  change geometry; acquiring pointer ownership alone cannot pass. Sidebar cases
  reopen the panel before each held-drag collapse.
- Six native keyboard trajectory scrub cases described above.
- Two continuous playback workflows, molecule and 499-atom trajectory, each with
  24 changes involving periodic copies, window widths, sidebar collapse/expansion,
  bonds, atom size and labels. Measurements stay selected and rendered while
  playback advances; selection undo must not change the current frame geometry.
- Trajectory periodic preview checks the visibility gate on supercell editing.
  The supercell action is hidden in trajectory mode; no forced hidden click is
  counted as a user workflow.

The focused playback run passed all eight cases; all 142 unit tests passed.
The full browser suite passed all 98 tests without retries, skips or flaky cases
(16.8 minutes). After strengthening the gesture and trajectory-gate assertions,
all 17 affected tests passed again. Four additional sidebar interruption cases
passed separately, with real collapse transitions in every repetition. The
current suite contains 102 cases; it was validated by the 98-case full run plus
the affected/new follow-up runs, rather than another full 102-case run. No app
code changed after the full-suite run. Result JSON files and source hashes retain
that distinction. The playback run recorded 106 molecule and 245 dense frame
callbacks across its 48 user actions.

## Visual evidence and limits

Evidence is in `tests/stress/evidence/2026-10-05/edge-campaign`. The inspection
ledger identifies 20 actual opened PNGs with SHA-256 hashes. The full run retained
78 new-workflow visual observations; the stronger follow-up retained 38 and the
sidebar run retained 12. These logs include repeat observations of the same cases. Before/after keyboard,
load races, empty/refilled documents, dense supercells/playback and interrupted
boundary/frame previews were inspected. Rendering checks also sample the actual
WebGL output and verify canvas dimensions, opaque compositing, renderer state,
periodic-copy positions, selection/measurement geometry and panel overflow.

Test fixture camera poses are prepared directly so boundary hit targets are
visible, then the drags use real pointer input. This is separate from the camera
suite's real navigation tests. Resizing preserves zoom; a smaller viewport can
crop the prepared scene. Headless tab activation did not emit native window blur,
so blur-event coverage is simulated and does not prove desktop focus-loss behavior.
These tests do not prove every possible sequence or hardware rendering behavior.

Initial fixture failures were corrected rather than counted as app bugs: offscreen
hit targets, layout settling, valid clamped/no-op boundary moves, hidden checkbox
or narrow FPS controls, a hidden trajectory supercell control, and whitespace in
an otherwise valid export. Final validation uses the corrected fixtures.
No user tab was touched or reloaded.

To rerun, use `npm test` and `npx playwright test --workers 1` with the test
server port available. This campaign used the existing local server through a
temporary config overriding `reuseExistingServer: true`, absolute `testDir`,
output directories under `/private/tmp`, and list/JSON reporters; browser launch
settings came from `playwright.config.cjs`. Each case creates an isolated page.
