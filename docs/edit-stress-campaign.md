# Edit-mode stress campaign

Status: **in progress**. The two-hour run has not yet completed. This document
records confirmed findings and will be finalized from the campaign logs.

The extended campaign completed successfully after **1805.095 seconds
(30 minutes 5 seconds)**: 55 seeds (27–81), each with 160 steps, totaling
**8,800 action steps**. Its log and verified totals are retained in
`tests/stress/evidence/2026-10-04/extended-completed.jsonl` and
`extended-completed-summary.json` beside it. All scenarios used the app version
with the first two fixes (`29c04b47…`). This extended duration overlaps the
original core run and does not add to its elapsed time.

The extended run exercised 413 downloads, 377 valid replacements, 391 invalid
loads, 120 declined replacement actions, and 83 trajectory frame actions.
These are performed action counts and can include valid no-ops; the retained
summary separately records actual history operations. All ten operation types
were recorded, including 72 cell resizes, 25 supercells, 157 atom moves and
87 constraint changes. No failure occurred in this completed run.

A supplementary **1,000-step single-document session** (seed 1001) passed in
**526.054 seconds (8 minutes 46 seconds)**. It kept one browser context and
document through repeated editing and history changes, without file replacement.
Its complete log and operation totals are retained as
`single-document-1000-completed.jsonl` and `single-document-1000-summary.json`
in the same evidence directory. The command's one-second minimum caused the
runner to stop after that entire scenario; it does not describe the measured
testing duration. This run also overlaps the core campaign.

The optional ghost-click campaign passed **926.636 seconds (15 minutes
27 seconds)**: seeds 5–21, **2,720 steps**, and 37 performed pointer actions
aimed at periodic copies. Its log and totals are retained as
`ghost-click-completed.jsonl` and `ghost-click-completed-summary.json`. These
counts describe pointer targets; occlusion and toggles can affect the selected
copy. The bounded seed-5 regression separately asserts an actual target-copy
selection. This entire campaign used the third fixed app version and completed
without failure; its duration overlaps the other runs.

Before the third fix, **141 unit tests passed** at 2026-10-04 16:09 UTC and
**52 browser tests passed** at 16:23 UTC. The app code was unchanged between
those runs. Both stress campaigns were still running. This result covers
the first two fixes and expanded scenario/history regressions; it is not a
claim that the sustained campaign had finished.

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

The third fix below was added during the sustained runs. Later scenarios record
the updated app hash; final totals will distinguish the tested versions.
After that fix, 141 unit tests and both focused periodic-copy shift regressions
passed. The expanded full browser suite passed all **55 tests** at
2026-10-04 17:28 UTC, including the seeded ghost-click outcome check.

The original core run stopped on a five-second Add Atom click timeout at seed
145, step 137, after 4949.522 seconds. Seeds 39–144 (16,960 action steps) passed.
The saved HTML reports “Added O atom” and no JavaScript error was captured;
the timed-out action appears to have completed. Seed 145 passed all 160 steps
in 73.780 seconds after the full browser suite closed, with two other campaigns
still live. The 39-minute continuation remains active. This is recorded as an
intermittent interaction timeout with no reproduced state defect, rather than
a confirmed app bug. Reduced concurrency is a plausible explanation; pointer
timing and state-dependent actions can vary between seeded replays. Retained
evidence includes the original core log/summary, compact failure states, and
`core-add-timeout-replay.json` in the evidence directory.

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
3. **A preserved periodic-copy measurement gave a misleading shift error.**
   A real click on a displayed copy, switching to Edit, and entering a valid
   Cartesian shift produced “Shift cannot be represented in this cell.” The
   adapter now checks editability before passing display-copy IDs to document
   geometry commands. The existing hint and handler share the explanation to
   clear the measurement or make a supercell. No controls were added. Browser
   regressions cover copy-only and mixed real/copy selections, unchanged
   geometry/history, and successful real-atom shifting after clearing. Commit
   `3062f5d` saves the fix and optional ghost-click profile.
   Before-fix evidence is retained as `periodic-copy-shift-failure.json` and
   `periodic-copy-shift-before.png` in the evidence directory. This is a feedback
   and target-hint defect; it did not establish document corruption.

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
- The new Cartesian POSCAR regression exposed an oracle assumption that source
  fractional coordinates are always present. Cartesian source legitimately
  stores null; the oracle now checks representability and any retained cache.
  Real meshes also legitimately omit the ghost flag; the assertion normalizes
  its boolean meaning.

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
