# Atom placement cancellation — 2026-10-05

The user reports an intermittent mouse drag that previews correctly but returns
to its starting position at release, with the cancellation message.

## Confirmed release-time defect

`onMouseUp` previously recorded the move and rebuilt its visuals/panel before
clearing `draggedAtom` and `isDragging`. A blur or pointer-capture-loss event
emitted synchronously during that refresh therefore saw an active edit, restored
its starting position and showed the cancellation message. The already-recorded
move remained in history, making displayed geometry disagree with the saved move.

Both event variants reproduced the bounce before the change. The regressions
use real mouse input but deliberately inject the interruption from the release
panel refresh. They prove the lifecycle defect; they do not establish the exact
native event that occurred in the user's session.

The handler now snapshots the completed drag and closes its ownership before
capture release, rendering or UI/focus work. Later interruption events cannot
cancel that completed move. Real interruptions before pointer-up still restore
geometry. Cancellation logs now include the event type in the local browser
console, so a remaining native incident can be distinguished from this race.
No new controls or changes to snapping were added. App cache version is 164.

## Investigation and validation

- Ten ordinary Chromium mouse drags and selected-page/outside-release/button-chord
  cases passed before the fix. Thirteen native in-app browser drags passed too;
  the spontaneous mouse incident was not reproduced in those checks.
- The user's tab was read only: graphene, unsaved edits, app version 163. It was
  not reloaded or edited. Native follow-up testing used a separate disposable tab.
- Two release-time interruption regressions failed before the fix and passed
  afterward, verifying final geometry, move history and undo/redo.
- All 142 unit tests and 41 affected browser tests passed (9.5 minutes, no
  retries, skipped or flaky cases). This was targeted validation, not a fresh
  run of the entire browser suite. The 41-case result is retained in validation.json.
- Native mouse placement on graphene also succeeded after the change.

The investigation additionally found touch gestures can be taken over by native
browser gestures with the canvas's default touch policy. That is a separate
confirmed touch issue; it does not explain the user's mouse report and was not
changed in this mouse-release fix.

Inspected before/after PNGs are retained in
`tests/stress/evidence/2026-10-05/drag-release`. The release event injection is
explicit in `tests/browser/drag-release.spec.cjs`; avoid claiming it as native
focus-loss reproduction or proof that every intermittent mouse failure is solved.
