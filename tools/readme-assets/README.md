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
| `masthead.svg` | Header: name, one-line summary, location, areas of study, slow sheen along the rule |
| `diagram.svg` | Distribution diagram — airline offers splitting into NDC and GDS paths, reconciled at the screen |

`preview.html` is a self-contained render of `README.md` (local SVGs inlined as
data URIs) so the page can be reviewed in a browser without pushing.
`preview.mjs --serve` serves it on port 8080, bound to `0.0.0.0` so a remote
preview proxy can reach it.

Rules the generator follows (GitHub sandboxes README SVGs as images — no
scripts, no external requests, no web fonts):

- SMIL (`<animate>`, `<animateMotion>`) for anything that must move everywhere
  GitHub renders; CSS keyframes only where the effect degrades gracefully.
- Every animation respects `prefers-reduced-motion` where CSS is used.
- One accent colour (`#d9a961`), hairlines, mono labels; no gradients on type,
  no emoji, no decoration that doesn't carry information.
- Palette, fonts and layout constants live at the top of `build.mjs`.

## Contribution snake (optional)

The snake was removed from the README during the redesign — it read as
decoration rather than information. `snake.workflow.yml` is kept in this folder
if you want it back: copy it to `.github/workflows/snake.yml`, push from a
machine with `workflow` scope (the app token used in this workspace can't modify
workflow files), then add the image back to the README as
`https://raw.githubusercontent.com/sainudheenp/sainudheenp/output/snake.svg`.
