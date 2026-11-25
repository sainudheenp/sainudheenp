# Animated README assets

The SVGs in `assets/readme/` are generated — don't hand-edit them.

```bash
node tools/readme-assets/build.mjs            # regenerate the SVGs

cd tools/readme-assets && npm install         # once, for the preview renderer
npm run preview                               # rebuild preview.html
npm run serve                                 # rebuild + serve on http://localhost:8080
```

| File | Used for |
| :--- | :--- |
| `hero.svg` | Header banner: starfield, aurora, globe, orbiting plane, rotating roles |
| `ticker.svg` | Seamless marquee of NDC / GDS / travel-tech vocabulary |
| `route.svg` | NDC → GDS → travel tech route with a plane flying the path |
| `divider.svg` | Thin animated section divider |
| `pass.svg` | "Boarding pass" contact card |

`preview.html` is a self-contained render of `README.md` (local SVGs inlined as
data URIs) so the page can be reviewed in a browser without pushing.
`preview.mjs --serve` serves it on port 8080, bound to `0.0.0.0` so a remote
preview proxy can reach it.

Rules the generator follows (GitHub sandboxes README SVGs as images — no
scripts, no external requests, no web fonts):

- SMIL (`<animate>`, `<animateMotion>`) for anything that must move everywhere
  GitHub renders; CSS keyframes only where the effect degrades gracefully.
- Every animation respects `prefers-reduced-motion` where CSS is used.
- Palette, fonts and layout constants live at the top of `build.mjs`.
- The star field and node positions use a seeded PRNG, so rebuilds are
  byte-identical.

## Contribution snake

The README loads `https://raw.githubusercontent.com/sainudheenp/sainudheenp/output/snake.svg`,
which is committed on the `output` branch. The workflow that refreshes it is
parked in `snake.workflow.yml` — to turn it back on, copy it to
`.github/workflows/snake.yml` and push from a machine with `workflow` scope
(the app token used here can't modify workflow files).
