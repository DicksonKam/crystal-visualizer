# New visual edge-case campaign — 2026-10-05

Status: active. This campaign targets gaps beyond the prior random run.

Five delayed-load/edit races passed; three representative images were inspected.
Empty periodic documents with duplicate species and constraints passed four
delete/refill/history cycles. Mixed-element 499↔998 periodic/supercell rebuilds
passed two cycles, constraint edits and semantic export checks; representative
empty/refill/dense images were inspected. Trajectory supercell editing is hidden
and therefore gated from normal user interaction.

The gesture matrix covers cubic/tilted atom/frame drags, Escape, resize+Escape,
explicit blur events and release outside the viewport, three cycles per case.
Test setup was corrected to fit targets, wait for layout observation, and allow
a clamped boundary move to return to its original position without history.
Headless tab activation did not emit native focus loss; blur-event coverage is
simulated, not proof of actual desktop focus-loss behavior. Latest complete
matrix validation is pending.

Confirmed bug: keyboard trajectory scrubbing does not pause playback. All six
key/width cases fail: ArrowRight/Home/End at 900 and 390 pixels. Inspected images
show the Pause button still active after the native range input changes. The
handler pauses only on mouse-down. Before evidence and source hash are retained
in tests/stress/evidence/2026-10-05/edge-campaign. Fix/full validation are pending.

Initial hidden-checkbox and narrow-FPS test timeouts were setup errors: visible
loop label and desktop FPS control are used before resizing. Those failures are
not counted as app defects. No user tab was touched or reloaded; no push.
