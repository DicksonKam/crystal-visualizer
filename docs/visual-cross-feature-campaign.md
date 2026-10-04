# Cross-feature visual campaign — 2026-10-05 (Hong Kong)

Status: **complete**. The principal campaign covered **4,800 passing
steps across 40 seeds (709–748), with **1,610 rendered
captures**. Timed segments total 30.34 minutes; including the successful
failure replay, execution totals 30.71 minutes. This was segmented,
interrupted by a test-oracle error; it was not an uninterrupted 30-minute pass.
Earlier pilots and an interrupted initial run are reported separately below.
There is no claim that every possible user sequence is tested.

## Confirmed app defects fixed

1. **Viewport size could change without resizing the canvas.** Wrapped status
   text changed the viewport height without a window resize or divider gesture.
   The renderer now observes the actual viewport with ResizeObserver. A separate
   regression reproduced the persistent mismatch before the fix and passed after.
2. **Narrow controls could scroll the panel horizontally and clip their labels.**
   Focus and periodic steppers produced an 82-pixel horizontal scroll. Container
   rules now reflow coordinates, measurement content and periodic controls to
   fit. The regression covers editing and preserved measurements; before/after
   images were inspected.
3. **The constraint threshold unit could wrap alone at intermediate panel widths.**
   A container-scoped grid keeps the input and Å together below their label.
   The 220/240/260-pixel regression failed against the prior stylesheet (32.29
   pixels of vertical separation) and passes now. Both images were inspected.

No new buttons or editing behaviors were added. The pending clipped-periodic-bond
presentation policy was left unchanged. All browsers were isolated; the user's
unsaved tab was neither reloaded nor edited. Local Git checkpoints were saved;
nothing was pushed.

## Visual coverage and validation

The seeded campaign mixes editing, periodic-copy selection, measurements/modes,
history, file replacement/downloads, supercells, constraints, display options,
sidebar collapse/resize, window changes, real rotation/pan/zoom and playback.
Molecular, cubic, tilted and partially periodic fixtures are used; every fifth
seed starts with a 600-atom periodic view. Viewports include 1440×900, 900×760
and 390×844, with device pixel ratios 1 and 2.

Actual performed actions include 39 cell-resize
gestures, 20 periodic-copy selections,
197 panel gestures, 181
window changes, 25 playback actions and
189 downloads. Recorded document operations
include 58 atom moves,
32 committed cell resizes,
47 additions,
14 deletions and
13 supercells. Passing steps also include
unavailable actions; attempted steps are not equivalent to successful mutations.
The complete action and operation counts are in `completed-summary.json`.

The observer reads the actual animation-loop scene framebuffer, checks opacity,
renderer state restoration, periodic-copy positions, canvas dimensions and panel
overflow, and captures pointer previews before release. State checks additionally
cover document/mesh agreement, measurement endpoints, constraints and history.
**18 representative images were opened and inspected**
and retained with hashes. Capturing 1,610 images does not mean each was manually
inspected; framebuffer presence alone cannot prove every atom or bond is correct.

A separate dense regression passed real atom drag/cancellation, delete/add and
undo/redo across 501↔500 atoms, then a real first cell-resize gesture and history.
It captured 13 images, including inspected previews and the non-instanced rebuild.
The full browser suite also passed 32 repeated boundary-edit/immediate-frame-drag
cycles across two window sizes. Camera tests cover actual approaching/departing
rotation, close zoom, overshoot, interruption and frame-rate consistency.

Validation:

- **142 unit tests passed** on the final files.
- **64 full browser tests passed** before the last CSS-only constraint-unit fix.
- **One additional dense browser test passed**; it was added after full-suite discovery.
- **13 affected stress/selection browser tests passed** after the history-oracle correction.
- **All seven sidebar browser tests passed** after the final CSS-only fix.
- The completed random segment recorded the latest stylesheet on seeds
  738–748; source versions
  are retained per seed. The final CSS change was not followed by a second full
  browser-suite run; its affected scope was rerun.

## Interruptions and oracle corrections

An initial sustained run passed seeds 702–706 (600 steps, 185 captures), then
failed seed 707 at step 54. Its bright-pixel quota rejected a chosen tiny atom
scale with cell and axes hidden. The inspected image showed subpixel atoms.
The observer now checks every pixel against the actual clear color and records
projected atom radius; seed 707 replay passed 120 steps/41 captures. A corrected
seed-701 pilot passed 40 steps/10 captures, and seed 708 passed 120/36.

The principal run passed seeds 709–726 (2,160 steps, 705 captures), then stopped
at seed 727 step 39. Undo correctly omitted a periodic copy hidden by reducing
image counts; the oracle wrongly required it. The existing browser contract
requires safe omission. The corrected oracle filters historical identities by
current repeats, preserves order and clears empty measurement purpose. Seed 727
replay passed 120 steps/39 captures. Fresh seeds 728–748 completed another
2,520 steps/866 captures in 914.54 seconds with terminal exit code 0.

Immediate rendering can precede ResizeObserver delivery; the observer permits
up to two seconds for layout agreement. This timing allowance is distinct from
the independently reproduced persistent canvas-size bug.

## Evidence and limits

Evidence is in `tests/stress/evidence/2026-10-05/visual-campaign/`: raw run logs,
compact failures, source hashes, `completed-summary.json`, `validation.json`,
`inspection-ledger.json`, inspected PNGs, and compressed passing action sequences
in `passing-sequences.json.gz`. Larger original captures/failure states remain
under the recorded `/private/tmp` paths. Seeds and retained source revisions
provide repeatability; original screenshots will vary by platform and rendering.

These tests use software-rendered Chromium, finite fixtures and gesture samples.
Other browsers, real GPU drivers, touch hardware, and arbitrary large or exotic
structures remain untested. Some resize workflows prepare an axis view; that
setup does not independently prove automatic snapping. Subpixel atom visibility
is explicitly exempted from the fitted-view presence check. An inspected
periodic-image capture had a largest atom radius of 0.349 pixels after minimum
size/length slider choices, explaining its nearly empty appearance. No automatic
scale change was introduced. The campaign found and fixed three layout defects;
it cannot establish that no other bugs remain.
