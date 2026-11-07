# Tests

Run the focused unit tests with:

```sh
node --test tests/*.test.cjs
```

They cover the document modules, formats, geometry, camera math, measurements, history and annotation placement without a browser.

The browser suite exercises the actual DOM and WebGL renderer, file uploads/downloads, species groups, cell previews, export warnings, undo/redo, skew-cell measurements, trajectory playback, and real damped camera gestures, fitting, alignment, and cancellation. The camera tests include timestamped input at 30, 60, and 120 Hz. Three.js is served from the app's own `vendor/three` copy and the web fonts are blocked, so network availability cannot affect the result.

```sh
npm ci
npx playwright install chromium
npm run test:all
```

The GitHub Actions workflow runs the same unit and Chromium checks on pushes and pull requests, split into shards, and retains traces/screenshots when browser checks fail.

## Stress campaigns

The browser suite includes bounded seeded Edit-mode scenarios and a longer seed that exercises compound selections at the history limit. For an opt-in soak run, keep the local server running at port 4173 in a separate terminal, then run:

```sh
node tests/browser/server.cjs
# In another terminal:
node tests/stress/edit-campaign.cjs --seconds 7200 --seed 1 --steps 160 --out /tmp/crystal-edit-stress
```

The campaign uses isolated browser contexts and public synthetic structures. It mixes real pointer/keyboard/form actions across molecules, cubic/tilted cells, and partially periodic XYZ structures. State checks cover atom/species identity, counts, fractional caches, selected positions and markers, measurement endpoints, document/mesh agreement, export ordering, and known undo/redo transitions. Camera alignment is prepared programmatically for resize actions; export round-trips are checked through the parsers. Inapplicable actions are skipped and action counts are reported. A failure stops the campaign and saves its seed, full action/state log, screenshot, and page HTML. Replaying the same seed is useful for diagnosis; pointer timing and available actions can still depend on the browser environment. Longer runs provide broader sampled coverage, not proof that every possible sequence is correct.

Add `--extended true` to the campaign command to mix actual export downloads, valid and invalid file replacement, accepted/rejected discard prompts, trajectory frame navigation, display toggles, bulk constraints, and cell centering into the editing sequences. Extended contexts accept export warning prompts and accept or decline replacement prompts according to the logged action. These prompts apply only to the synthetic test documents.

Add `--ghosts true` to include deliberate periodic-copy clicks in Measure mode before later editing and history actions. This option changes the generated sequences; the default preserves the existing seed regressions. Fractional coordinates may be absent for Cartesian POSCAR input; retained fractional caches are checked against current Cartesian positions.

Earlier campaign reports are kept alongside this page: [edit stress](edit-stress-campaign.md), [visual cross-feature](visual-cross-feature-campaign.md), [visual edge cases](visual-edge-campaign.md), [visual edit follow-up](visual-edit-followup.md) and [the drag-release investigation](drag-release-investigation.md).
