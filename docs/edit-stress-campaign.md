# Edit-mode stress campaign

Status: **complete**. Six retained runs contain **65,160 passing action steps
across 402 scenarios**, including a 1,000-step single-document session. Three
confirmed app bugs were fixed and covered by regressions; the campaign's final app passed
**141 unit tests and 55 browser tests**. No buttons or panels were added, and
nothing was pushed.

The duration proof uses two nonoverlapping core portions: **4872.100 seconds**
through the original run's last passing seed, plus **2363.153 seconds** for the
completed continuation, totaling **7235.254 seconds (2 hours 35 seconds)**.
The original run ended on an interaction timeout, so this is not a claim of an
uninterrupted successful two-hour core run. The failed scenario is excluded
from passing steps and the duration proof; overlapping supplementary runs are
also excluded from that duration. `campaign-summary.json` in the evidence
directory records the aggregate counts and verified log hashes.

Of the passing steps, **26,880 used the final three-fix app** (`1026b32a…`),
and 38,280 used the version with the first two fixes (`29c04b47…`). The final
core continuation passed seeds 145–195 (8,160 steps); its log and summary are
retained as `core-followup-completed.jsonl` and
`core-followup-completed-summary.json`.

The extended follow-up completed successfully after **5425.848 seconds
(90 minutes 26 seconds)**: 172 seeds (82–253), **27,520 action steps**.
`extended-followup-completed.jsonl` and its summary retain the terminal
completion event, log hash, action counts and actual operation counts.
Its scenarios performed 1,317 downloads, 1,286 valid replacements, 1,292 invalid
loads, 415 declined replacement actions and 213 trajectory-frame actions.
All ten history operation types occurred. Per-seed hashes show 13,600 steps
on the two-fix app version and 13,920 on the three-fix version. This run overlaps
the core campaigns; it does not add to wall-clock duration.

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
still live. The continuation subsequently completed without failure. This is recorded as an
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
cover every GPU, browser, touch device, or large structure. Passing logs retain
seeds and counts, not a screenshot and complete state history for every step.
The suite samples combinations; a completed campaign does not prove that the
app has no remaining bugs.

## Completion audit

- **Duration:** the original core log's last passing event and the continuation's
  terminal completion event prove 7235.254 nonoverlapping seconds. Both source
  logs and summaries are retained; the aggregate verifier checked hashes,
  terminal events, seed ranges and passing-step totals.
- **Requested combinations:** `edit-scenario.cjs` mixes real pointer and form
  actions for selection, mode/measurement preservation, dragging, coordinates,
  add/delete, constraints, cell resizing, periodic display and supercells,
  Escape, Undo/Redo and branching. Four initial fixture types cover molecular,
  ordinary periodic, tilted and partially periodic cells. Extended runs add
  loading, invalid/declined replacements, downloads and trajectory frames.
  All ten actual history operation types occurred in the retained campaigns.
- **State checks:** after each action, document/species identity and counts,
  finite coordinates, fractional cache validity, render agreement, selection
  attachment and positions, marker counts, measurement endpoints and known
  history transitions are checked. Immutable actions also compare geometry;
  new operations check that the redo branch is cleared.
- **Failures and fixes:** three root causes, failing evidence, local fix commits
  and targeted regressions are recorded above. Both original failing seeds
  for the first two bugs passed after correction. The periodic-copy shift
  regressions cover copy-only and mixed selections and unchanged state.
  The separate Add Atom interaction timeout remains documented with its
  successful full-seed replay and qualified explanation.
- **Validation and preservation:** the full 141-unit/55-browser verification
  covers the campaign's final app hash retained in `campaign-summary.json`; the browser
  runner's last-run status is passed with no failed tests. All campaign browsers
  were isolated from the user's tab. Source changes and evidence are saved in
  local Git commits; no push or new app controls were part of this work.

## User-reported follow-up (2026-10-05, Hong Kong)

The user immediately reported boundary-atom movement followed by a rejected
first frame drag, plus stray bonds. The campaign missed these conditions;
its passing totals are historical evidence, not proof of this later behavior.

- Frame pointer-down required a cached hover highlight, despite independently
  raycasting the current pointer. Atom drags clear highlights, so a valid frame
  hit without that presentation state was rejected. The handler now determines
  ownership from the current hit, retaining visible-atom priority. A regression
  moves a boundary atom, clears the hover presentation state, and uses the first
  real frame gesture to resize, then verifies Undo/Redo for both edits. It covers
  cubic/tilted cells and both viewing directions. Without the fix it failed at
  the assertion that a cell drag started; all four cases pass after the fix.
- Drag previews updated the atom but left bonds and periodic-copy meshes at the
  previous coordinates until release. Previews now use the existing shared
  display-refresh path. A real-pointer regression moves a boundary atom beyond
  the bond cutoff before releasing, verifies that the old bond disappears, and
  verifies Escape restores it. It failed before correction and passes afterward.
- Separately, the renderer deliberately generates clipped connections to
  undisplayed periodic neighbors. Such segments can terminate at the cell frame
  without a visible endpoint atom. This behavior has not been removed; the user
  was asked whether bonds should connect only displayed atoms. The screenshot's
  strands are not proven to be stale solely by the preview regression.

Follow-up validation: **141 unit tests and 19 browser tests passed**, covering
atom picking, boundary drag planes, frame rendering/lifecycle/gestures and
preserved measurements. This is not a repeat of the full sustained campaign.
The shared refresh performs additional work during drag previews; large-view
performance has not been benchmarked by these small-structure regressions.
No new app controls were added and the user's unsaved browser document was
left intact.
