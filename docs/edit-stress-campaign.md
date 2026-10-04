# Edit-mode stress campaign

Status: **in progress**. The two-hour run has not yet completed. This document
records confirmed findings and will be finalized from the campaign logs.

Latest full verification: **141 unit tests passed** at 2026-10-04 16:09 UTC and
**52 browser tests passed** at 16:23 UTC. The app code was unchanged between
those runs. Both stress campaigns were still running. This result covers
the current app fixes and expanded scenario/history regressions; it is not a
claim that the sustained campaign has finished.

An additional focused browser test passed eight complete deletion/refill cycles,
including blocked empty export, species creation, Undo/Redo and history branching.
It uses real multi-selection clicks and existing forms
(`tests/browser/empty-edit-history.spec.cjs`). Its first attempt requested an
unavailable sodium option; replay with the offered carbon option passed. This
setup error is not counted as an app bug. The full browser suite above includes
this additional test.

The campaign uses isolated Chromium contexts with software WebGL, synthetic
molecular/cubic/tilted/partially periodic structures, and a supplied hydrogen
trajectory. It does not modify the user's open document. No app controls were
added and no commits were pushed.

## Confirmed app bugs

1. **Canceled drags left preserved measurement lines at the preview position.**
   Core seed 1, step 149 reproduced this after a sequence of selections, mode
   changes and edits. Display rebuilding now refreshes measurements after
   restoring selected positions. Commit `b7c62eb`; regression in
   `tests/browser/measurement.spec.cjs` verifies atoms, markers, lines, angle,
   panel, dirty state and history after Escape.
2. **Discarded selections retained their measurement purpose.** Extended seed
   22 exposed this through file replacement followed by selection history.
   Scene rebuilding now clears the purpose when selections are discarded and
   restores it only when preserved selections actually survive. Commit
   `cc5f442`; regression in `tests/browser/selection-history.spec.cjs` covers
   replacement, undo/redo, and periodic copies disappearing.

Compact action sequences and final failure states are retained in
`tests/stress/evidence/2026-10-04/confirmed-bugs.json`, with hashes and paths for
the original full logs. Both failing 160-step seeds passed after their fixes.

## Test-oracle and infrastructure corrections

These failures were investigated and were not counted as app bugs:

- POSCAR export correctly regrouped atoms by species; the comparison initially
  assumed internal atom order.
- Redo restores context captured at Undo; the comparison initially assumed the
  mode present when the original action was performed.
- Partial periodicity disables one image control; the scenario initially tried
  to click it.
- A supposed background rotation point overlapped a legitimate cell handle;
  background points are now checked with a ray cast before pointer actions.
- Selection Undo/Redo correctly preserves the current trajectory frame; the
  comparison initially expected historical coordinates. A browser regression
  now covers this explicitly.
- At the 50-entry history limit, clear-then-select adds two operations even when
  stack length grows by one. The oracle now models actual new operation IDs
  and the intermediate empty selection. Seed 39 exercises this case.
- A navigation timeout occurred before any action under concurrent browser
  load. Startup permits 30 seconds; individual interactions retain a five
  second allowance.

## Coverage and limits

The core scenarios mix selection, mode changes, measurements, exact coordinates,
add/delete, dragging, Escape, constraints, shifts, cell resizing, supercells,
periodic copies, undo/redo and export parsing. Extended scenarios add actual
downloads, valid/invalid replacement, declined discard prompts, trajectory
frames, display settings, bulk constraints and centering.

After each action, assertions check document identity/counts, fractional caches,
mesh/document agreement, selected copies/positions, markers, distance endpoints,
and known history transitions. Actual recorded operation counts are separate
from action attempts. Failure seeds retain complete action/state logs,
screenshots and HTML; passing seeds retain manifest hashes and coverage counts.

Runs sample sequences rather than exhaustively exploring every combination.
Document size is capped at 48 atoms; periodic copies can increase displayed
size. Resize camera alignment is prepared programmatically before real pointer
actions. Pointer timing can affect replay. Software WebGL and Chromium do not
cover every GPU, browser, touch device, or large structure. Duration and final
coverage totals remain pending; overlapping runs will not be added together to
claim elapsed wall-clock hours.
