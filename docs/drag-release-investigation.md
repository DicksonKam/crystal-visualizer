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

## Recurrence after version 164

The user reports unexpected cancellation still occurs in version 164. The earlier
release-time race was real and remains covered, but it did not explain every
native incident. The remaining native trigger is unconfirmed. The browser
connector did not expose the user's visible tab during this follow-up, so its
existing event log could not be retrieved. No existing document was reloaded.

Version 165 keeps the cancellation policy and adds a reason to the existing
status message: focus loss, capture loss, browser pointer cancellation, Escape,
Undo/Redo, mode changes or document replacement. The status element's
`data-drag-cancellation` attribute and local console retain the event type, button
state, last owned pointer event, focus and whether movement had begun. No
coordinates, file contents or network telemetry are recorded; no new controls.

Five controlled reason checks and both release regressions passed. The next
required evidence is a real unexpected cancellation in version 165, rather than
another simulated event being presented as the user's cause. Diagnostic proof
is retained under `tests/stress/evidence/2026-10-05/cancellation-diagnostics`.

## Confirmed capture-loss incident and version 166

The user's version-165 screenshot reports `mouse tracking interrupted`. Read-only
inspection of the same tab's diagnostic attribute confirmed `lostpointercapture`,
`eventButtons: 0`, last owned event `pointermove` with `buttons: 1` and
`pointerType: mouse`, `hadMoved: true`, and `documentFocused: true`. The app had
not completed its pointerup handler before this released-button notification.
The precise reason the host omitted or reordered that release is still unknown;
the app's rollback policy was nevertheless incorrect for this event.

Capture now helps route events without defining the edit's lifetime. Document
capture-phase listeners process only the owned pointer's moves, release and
cancellation. Losing capture while held keeps the drag active; losing capture
with the primary mouse button released immediately finishes the last preview.
A subsequent mouse move with the primary button up also finishes a missed
release without moving the atom to a hover position. Ownership closes before
rendering or panel updates, so later release events cannot add duplicate history.
Escape, blur, pointercancel, Undo/Redo, mode and document replacement retain their
rollback behavior. There are no new controls or snapping changes.

This follows the distinction between pointer capture routing and pointer
cancellation in the [Pointer Events specification](https://www.w3.org/TR/pointerevents3/).
In particular, lostpointercapture may precede subsequent normally targeted input;
it does not itself assert that the gesture was canceled.

Regression tests request actual browser capture release while a real mouse is
held, then release inside and outside the canvas. The old app rolls back in both
cases. The exact released-button incident is covered separately by explicit
event injection; this models the observed event state, not native host ordering.
Further tests check explicit cancellation after capture loss, unrelated pointers,
missed release, button chords, duplicate release, undo/redo, and atom/frame
gestures in cubic and tilted cells. An isolated native in-app browser drag on
graphene placed atom #12 successfully. The user's unsaved document was not
reloaded or edited.

Validation: 142 unit tests, 10 release/capture browser regressions, and 41 related
browser checks passed. The four cubic/tilted atom/frame capture-loss combinations
were then rerun against the final code with stronger changed-preview assertions;
all passed (three cycles each). The stronger tilted-atom check initially exposed
a fixture path returning to its original constrained corner, not a rollback; the
path now returns to a known changed preview after capture loss before release.
This is targeted validation, not a new complete browser-suite run. Six retained
PNGs were visually inspected. Results and native incident details are retained
in `tests/stress/evidence/2026-10-05/capture-recovery`.
