/**
 * Animated SVG assets for the profile README.
 *
 *   node tools/readme-assets/build.mjs
 *
 * Design rules kept deliberately narrow:
 *   - one accent colour, used sparingly; no gradients on type
 *   - hairline geometry, mono labels, generous whitespace
 *   - motion is slow and secondary: a sheen along a rule, packets on a line
 *   - SMIL for everything that must move wherever GitHub renders the file
 *     (README SVGs are served as images: no scripts, no external fonts,
 *     no network requests)
 */

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "assets/readme");

/* ---------------------------------------------------------------- */
/* tokens                                                           */
/* ---------------------------------------------------------------- */

const C = {
  bg: "#0a0c10",
  surface: "#0e1117",
  line: "#1e2430",
  lineSoft: "#171c25",
  text: "#e9ecf2",
  muted: "#7d8698",
  faint: "#4d5567",
  accent: "#d9a961", // muted brass — the only accent in the whole set
};

const SANS =
  "'Inter','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const MONO =
  "'JetBrains Mono','SFMono-Regular',ui-monospace,'Cascadia Code',Consolas,'DejaVu Sans Mono',monospace";

const r2 = (n) => Math.round(n * 100) / 100;

const doc = ({ w, h, title, desc, defs = "", style = "", body }) => {
  const t = title ? `<title>${title}</title>` : "";
  const d = desc ? `<desc>${desc}</desc>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${t}${d}
  <defs>${defs}</defs>
  ${style ? `<style>${style}</style>` : ""}
${body}
</svg>
`;
};

/* shared: a barely-there grid, drawn as hairlines rather than dots */
const grid = (w, h, step = 32, opacity = 0.5) => {
  let vertical = "";
  let horizontal = "";
  for (let x = step; x < w; x += step) vertical += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) horizontal += `M0 ${y}H${w}`;
  return `<path d="${vertical}${horizontal}" stroke="${C.lineSoft}" stroke-width="0.75" opacity="${opacity}"/>`;
};

/* ---------------------------------------------------------------- */
/* 1. masthead                                                      */
/* ---------------------------------------------------------------- */

function masthead() {
  const W = 1200;
  const H = 330;
  const PAD = 64;

  const meta = ["NDC", "GDS", "TRAVEL SYSTEMS"];
  let metaRow = "";
  meta.forEach((label, i) => {
    const x = W - PAD - 560 + i * 190;
    metaRow += `
    <rect x="${x}" y="252" width="5" height="5" fill="${C.accent}" opacity="0.9"/>
    <text x="${x + 15}" y="259" class="mono" font-size="11.5" letter-spacing="2.6" fill="${C.muted}">${label}</text>`;
  });

  const body = `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    ${grid(W, H)}

    <text x="${PAD}" y="126" class="name">Sainudheen</text>

    <text x="${PAD}" y="170" class="lede">Full-stack developer. I build web products end to end and am</text>
    <text x="${PAD}" y="196" class="lede">currently working through how airline content is distributed.</text>

    <text x="${PAD}" y="228" class="lede-dim">Oman · UTC+4 · open to collaboration</text>

    ${metaRow}

    <!-- rule + slow sheen -->
    <path d="M${PAD} ${H - 58}H${W - PAD}" stroke="${C.line}" stroke-width="1"/>
    <rect x="${PAD}" y="${H - 59}" width="150" height="2" fill="url(#sheen)">
      <animate attributeName="x" values="${PAD};${W - PAD - 150};${PAD}" dur="18s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.25;0.85;0.25" dur="18s" repeatCount="indefinite"/>
    </rect>
    <text x="${W - PAD}" y="${H - 34}" text-anchor="end" class="mono" font-size="10.5" letter-spacing="2.2" fill="${C.faint}">sainudheen.tech</text>
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>`;

  return doc({
    w: W,
    h: H,
    title: "Sainudheen — full-stack developer",
    desc: "Masthead: name, one-line summary, location, and the areas of airline distribution currently being studied.",
    defs: `<clipPath id="clip"><rect width="${W}" height="${H}" rx="14"/></clipPath>
      <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
        <stop offset="0.5" stop-color="${C.accent}"/>
        <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
      </linearGradient>`,
    style: `
      .name{font-family:${SANS};font-size:60px;font-weight:600;letter-spacing:-1.4px;fill:${C.text}}
      .lede{font-family:${SANS};font-size:17px;fill:${C.muted}}
      .lede-dim{font-family:${MONO};font-size:11.5px;letter-spacing:1.4px;fill:${C.faint}}
      .mono{font-family:${MONO}}
      @media (prefers-reduced-motion: reduce){animate{display:none}}
    `,
    body,
  });
}

/* ---------------------------------------------------------------- */
/* 2. distribution diagram                                          */
/* ---------------------------------------------------------------- */

function diagram() {
  const W = 1200;
  const H = 280;
  const PAD = 64;
  const MID = 152;
  const UP = 118;
  const DOWN = 186;

  const xAir = PAD;
  const xSplit = 452;
  const xJoin = 872;
  const xEnd = W - PAD;

  // airline -> split -> two parallel paths -> join -> screen
  const upper = `M${xAir} ${MID}H${xSplit - 34}C${xSplit} ${MID} ${xSplit} ${UP} ${xSplit + 42} ${UP}H${xJoin - 42}C${xJoin} ${UP} ${xJoin} ${MID} ${xJoin + 34} ${MID}H${xEnd}`;
  const lower = `M${xAir} ${MID}H${xSplit - 34}C${xSplit} ${MID} ${xSplit} ${DOWN} ${xSplit + 42} ${DOWN}H${xJoin - 42}C${xJoin} ${DOWN} ${xJoin} ${MID} ${xJoin + 34} ${MID}H${xEnd}`;

  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${C.bg}"/>
    <circle cx="${x}" cy="${y}" r="3.4" fill="none" stroke="${C.text}" stroke-width="1" opacity="0.75"/>`;

  const body = `
  <rect width="${W}" height="${H}" fill="${C.surface}"/>
  ${grid(W, H, 40, 0.3)}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>

  <text x="${PAD}" y="52" class="mono" font-size="11" letter-spacing="3" fill="${C.faint}">HOW A FARE REACHES A SCREEN</text>
  <text x="${W - PAD}" y="52" text-anchor="end" class="sans" font-size="12" fill="${C.faint}">two content paths, one booking</text>

  <path d="${upper}" stroke="${C.line}" stroke-width="1" fill="none"/>
  <path d="${lower}" stroke="${C.line}" stroke-width="1" fill="none"/>

  <!-- a packet on each path, offset in time -->
  <circle r="2.4" fill="${C.accent}">
    <animateMotion dur="11s" repeatCount="indefinite" path="${upper}"/>
    <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.06;0.94;1" dur="11s" repeatCount="indefinite"/>
  </circle>
  <circle r="2.4" fill="${C.accent}">
    <animateMotion dur="11s" begin="5.5s" repeatCount="indefinite" path="${lower}"/>
    <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.06;0.94;1" dur="11s" begin="5.5s" repeatCount="indefinite"/>
  </circle>

  <!-- nodes -->
  ${dot(xAir, MID)}${dot(xEnd, MID)}${dot(xJoin, MID)}
  ${dot(xSplit + 42, UP)}${dot(xSplit + 42, DOWN)}

  <!-- end labels live outside the lines so nothing collides -->
  <text x="${xAir - 2}" y="${MID - 18}" class="mono" font-size="11.5" letter-spacing="2.4" fill="${C.text}" opacity="0.92">AIRLINE</text>
  <text x="${xAir - 2}" y="${MID + 30}" class="sans" font-size="12" fill="${C.faint}">offers, inventory</text>

  <text x="${xEnd + 2}" y="${MID - 18}" text-anchor="end" class="mono" font-size="11.5" letter-spacing="2.4" fill="${C.text}" opacity="0.92">SCREEN</text>
  <text x="${xEnd + 2}" y="${MID + 30}" text-anchor="end" class="sans" font-size="12" fill="${C.faint}">search, booking</text>

  <!-- the two paths -->
  <text x="${xSplit + 60}" y="${UP - 14}" class="mono" font-size="11.5" letter-spacing="2.4" fill="${C.text}" opacity="0.92">NDC</text>
  <text x="${xSplit + 60}" y="${UP - 14}" dx="46" class="sans" font-size="12" fill="${C.faint}">offer / order, REST</text>

  <text x="${xSplit + 60}" y="${DOWN + 26}" class="mono" font-size="11.5" letter-spacing="2.4" fill="${C.text}" opacity="0.92">GDS</text>
  <text x="${xSplit + 60}" y="${DOWN + 26}" dx="42" class="sans" font-size="12" fill="${C.faint}">PNR, EDIFACT</text>

  <text x="${xJoin + 18}" y="${MID - 18}" class="sans" font-size="12" fill="${C.faint}">reconciled</text>

  <text x="${PAD}" y="${H - 24}" class="sans" font-size="12" fill="${C.faint}">The awkward part is not either path. It is making them agree on price, availability and one booking.</text>`;

  return doc({
    w: W,
    h: H,
    title: "Airline distribution: NDC and GDS as parallel paths to a booking screen",
    desc: "Diagram: an airline's offers reach a booking screen either through NDC (offer/order, REST) or through a GDS (PNR, EDIFACT), then have to be reconciled.",
    style: `
      .mono{font-family:${MONO}}
      .sans{font-family:${SANS}}
      @media (prefers-reduced-motion: reduce){animate{display:none}}
    `,
    body,
  });
}

/* ---------------------------------------------------------------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const [name, svg] of Object.entries({
  "masthead.svg": masthead(),
  "diagram.svg": diagram(),
})) {
  writeFileSync(resolve(OUT, name), svg);
  console.log(`${name.padEnd(14)} ${(svg.length / 1024).toFixed(1)} KB`);
}
