# Cross-feature visual campaign — 2026-10-05 (Hong Kong)

Status: **active**. This campaign broadens the previous repeated FCC sequence;
completion and full-suite validation are pending. It cannot prove every possible
user sequence.

The seeded harness now mixes sidebar size/collapse, window sizes, real zoom/pan,
atom/bond-size sliders, trajectory playback and existing editing, measurement,
periodic, load/download and history actions. Every fifth campaign seed starts
with a 600-atom periodic XYZ to exercise instanced rendering. Ordinary fixtures
cover molecular, cubic, tilted and partially periodic cells. Pointer previews
are observed before release; passing sequences retain action records and state
hashes, while failures retain full states, HTML and screenshots.

The visual observer wraps the app's real animation-loop scene render, reads its
framebuffer, checks opacity and renderer state restoration, detects stale
periodic copies and canvas/layout disagreement, and captures rendered screenshots.
A fitted/reset view with atoms at least one pixel in radius must contain non-background scene pixels. This pixel check does not by
itself prove visible atoms, correct appearance, or every bond; actual screenshot
inspection is required. Tiny user-selected atom scales may legitimately make
atoms difficult to see in a narrow view.

## Findings and current evidence

- **Confirmed: content-driven viewport resizing left a stale canvas size.**
  Pilot seed 701 initially recorded canvas 195×652 versus viewport 195×670.
  A separate browser regression changes status text to wrap, without a window
  or divider gesture, and reproduced a persistent mismatch. The renderer now
  observes the actual viewport with ResizeObserver. 141 unit tests and all five
  sidebar browser tests passed after the fix. Before-fix evidence is retained
  in `tests/stress/evidence/2026-10-05/visual-campaign/`.
- **Oracle timing correction:** an immediate render can precede layout-observer
  delivery. The visual observer now permits up to two seconds for canvas/layout
  agreement before capturing, so persistent mismatches still fail. The corrected
  seed-701 pilot passed 40 steps and captured 10 images; initial, reset, and file
  replacement images were opened and inspected.
- **Confirmed and fixed: narrow-panel horizontal overflow.** narrow-panel images show horizontal scrolling after
  controls receive focus, clipping labels and controls at the left. Constraint
  summaries also wrap poorly at that width. A focused regression reproduced an 82-pixel horizontal scroll after editing
  and periodic controls. Container-based reflow now passes that regression,
  including preserved measurements, and the corrected screenshot was inspected.
  Full current-suite verification remains pending.

## Coverage ledger to finish

- Varied real-pointer edit/cell/measurement/history combinations and preview images.
- Sidebar/window changes combined with camera, editing and long content.
- Display toggles and size changes combined with selections and periodic copies.
- Cubic, tilted, partially periodic, molecular and dense instanced views.
- Trajectory playback/frame navigation, replacement and exports with selections.
- Inspection of representative initial/preview/settled/rebuilt screenshots.
- Root fixes, failed-then-passing regressions, current full unit/browser validation.
- Retained campaign totals/log hashes, limits and local Git checkpoints; no push.

All campaign browsers are isolated from the user's unsaved tab. No new controls
or changes to the pending clipped-periodic-bond display policy are part of this
campaign.

## Interrupted first run and replay

The first sustained run passed seeds 702–706 (600 steps, 185 images), then stopped
at seed 707, step 54. A bright-pixel quota rejected a deliberately tiny atom scale
with cell and axes hidden. The failure screenshot was inspected and showed tiny
atoms; this is classified as an oracle threshold error. The observer now samples
every pixel against the actual clear color and records projected atom radius,
with an explicit limitation for subpixel atoms. Seed 707 passed all 120 steps and
captured 41 images afterward. Failure/replay evidence and summaries are retained
in the campaign evidence directory. The timed campaign must still be resumed
and completed; these short portions do not establish sustained completion.

Seed 708 then passed 120 steps and 36 captures with the panel-overflow check
enabled. A new 30-minute campaign resumed at seed 709. The full current browser
suite (64 tests) is running separately with one worker to limit competing GPU
load. Neither run has yet been reported complete.

The 600-atom initial view, a real atom-drag preview and trajectory playback were
opened and inspected; representative images and their hashes are retained in
`inspection-ledger.json` beside the evidence. The earlier preview also documents
the panel clipping before its fix. Dense renderer transitions around 500 atoms
and dense edit/cell-preview combinations need additional focused coverage;
initial dense rendering alone does not prove those interactions.

The focused dense workflow passed: real atom drag/cancellation, delete/add and
undo/redo across 501↔500 atoms (instanced/non-instanced rendering), then a real
cell resize preview, release, undo and redo. Its 13 captures include inspected
atom-preview, 500-atom rebuild and cell-preview images, now retained with hashes.
Further inspected resumed-campaign images cover dense periodic drag, narrow
cell resizing and trajectory measurement. The 64-test suite excludes this new
focused test because discovery preceded its creation; results will be reported
separately. The sustained campaign remains active.
