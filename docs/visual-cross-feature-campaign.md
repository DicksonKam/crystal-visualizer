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
A fitted/reset view must contain scene pixels. This pixel check does not by
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
- **Open visual finding:** narrow-panel images show horizontal scrolling after
  controls receive focus, clipping labels and controls at the left. Constraint
  summaries also wrap poorly at that width. Reproduction and responsive layout
  correction remain pending.

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
