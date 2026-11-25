/**
 * Animated SVG asset generator for the profile README.
 *
 *   node tools/readme-assets/build.mjs
 *
 * Writes self-contained SVGs to assets/readme/. Everything is inline
 * (gradients, CSS, SMIL) so the files render inside GitHub's <img>-style
 * SVG sandbox: no scripts, no external fonts, no network requests.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "assets/readme");

/* ------------------------------------------------------------------ */
/* palette + type                                                      */
/* ------------------------------------------------------------------ */

const C = {
  ink: "#05070f",
  ink2: "#0a1020",
  card: "#0b1020",
  line: "#1c2540",
  text: "#e8ecf8",
  muted: "#8b98b8",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  pink: "#f472b6",
  amber: "#fbbf24",
  lime: "#a3e635",
};

const FONT =
  "'Inter','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const MONO =
  "'JetBrains Mono','SFMono-Regular',ui-monospace,'Cascadia Code',Consolas,'DejaVu Sans Mono',monospace";

/** deterministic PRNG so rebuilds are byte-identical */
const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const r2 = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/* shared defs                                                         */
/* ------------------------------------------------------------------ */

const gradientDefs = (ids) => `
  <linearGradient id="gName" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset="0.35" stop-color="${C.cyan}"/>
    <stop offset="0.7" stop-color="${C.violet}"/>
    <stop offset="1" stop-color="${C.pink}"/>
    <animate attributeName="x1" values="-0.6;1" dur="9s" repeatCount="indefinite"/>
    <animate attributeName="x2" values="0.4;2" dur="9s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="gEdge" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.85"/>
    <stop offset="0.5" stop-color="${C.violet}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${C.pink}" stop-opacity="0.75"/>
  </linearGradient>
  <linearGradient id="gSweep" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${C.cyan}"/>
    <stop offset="1" stop-color="${C.pink}" stop-opacity="0"/>
    <animate attributeName="x1" values="-1;1" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="x2" values="0;2" dur="6s" repeatCount="indefinite"/>
  </linearGradient>
  <radialGradient id="gGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="46"/>
  </filter>
  <filter id="soft2" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="16"/>
  </filter>
  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="1.4" cy="1.4" r="1.1" fill="${C.text}" fill-opacity="0.16"/>
  </pattern>${ids || ""}`;

const svg = ({ w, h, title, desc, body, defs = "", style = "" }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>
  <defs>${gradientDefs(defs)}</defs>
  <style>${style}</style>
${body}
</svg>
`;

/* ------------------------------------------------------------------ */
/* 1. hero                                                             */
/* ------------------------------------------------------------------ */

function hero() {
  const W = 1200;
  const H = 420;
  const rand = rng(7);

  // star field
  let stars = "";
  for (let i = 0; i < 78; i++) {
    const x = r2(rand() * W);
    const y = r2(rand() * H);
    const r = r2(0.5 + rand() * 1.35);
    const dur = r2(2.4 + rand() * 4);
    const delay = r2(-rand() * 6);
    const hi = rand() > 0.82;
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${hi ? C.cyan : "#ffffff"}" opacity="${r2(
      0.25 + rand() * 0.5
    )}" style="animation:tw ${dur}s ease-in-out ${delay}s infinite"/>`;
  }

  const roles = [
    "Full-Stack Developer",
    "Travel-Tech Explorer",
    "NDC &amp; GDS Learner",
    "React · Next.js · Go",
  ];
  const ticker = roles
    .map(
      (r, i) =>
        `<text x="118" y="${216 + i * 44}" class="role">${r}</text>`
    )
    .join("");

  // globe geometry
  const GX = 962;
  const GY = 208;
  const GR = 116;
  let meridians = "";
  for (const k of [0.34, 0.68]) {
    meridians += `<ellipse cx="${GX}" cy="${GY}" rx="${r2(
      GR * k
    )}" ry="${GR}" fill="none" stroke="${C.cyan}" stroke-opacity="0.3" stroke-width="1.2"/>`;
  }
  let parallels = "";
  for (const lat of [-0.66, -0.33, 0, 0.33, 0.66]) {
    const rx = r2(GR * Math.cos(Math.asin(lat)));
    parallels += `<ellipse cx="${GX}" cy="${r2(
      GY + GR * lat
    )}" rx="${rx}" ry="${r2(rx * 0.16 + 2)}" fill="none" stroke="${
      C.violet
    }" stroke-opacity="0.32" stroke-width="1.1"/>`;
  }

  const body = `
  <g clip-path="url(#cardClip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.5"/>

    <!-- drifting aurora -->
    <g filter="url(#soft)" opacity="0.7">
      <ellipse cx="210" cy="70" rx="250" ry="160" fill="${C.violet}" fill-opacity="0.55" style="animation:drift1 17s ease-in-out infinite"/>
      <ellipse cx="1020" cy="380" rx="260" ry="150" fill="${C.cyan}" fill-opacity="0.42" style="animation:drift2 21s ease-in-out infinite"/>
      <ellipse cx="640" cy="430" rx="300" ry="120" fill="${C.pink}" fill-opacity="0.3" style="animation:drift3 25s ease-in-out infinite"/>
    </g>

    ${stars}

    <!-- orbiting flight ring -->
    <g transform="rotate(-16 ${GX} ${GY})">
      <ellipse cx="${GX}" cy="${GY}" rx="182" ry="66" fill="none" stroke="url(#gEdge)" stroke-opacity="0.55" stroke-width="1.4" stroke-dasharray="5 9">
        <animate attributeName="stroke-dashoffset" values="0;-140" dur="7s" repeatCount="indefinite"/>
      </ellipse>
      <g>
        <animateMotion dur="11s" repeatCount="indefinite" rotate="auto"
          path="M ${GX + 182} ${GY} a 182 66 0 1 0 -364 0 a 182 66 0 1 0 364 0"/>
        <path d="M -9 0 L 7 -3.6 L 3 0 L 7 3.6 Z" fill="${C.amber}"/>
        <circle cx="-10" cy="0" r="5" fill="${C.amber}" fill-opacity="0.25" style="animation:tw 1.6s ease-in-out infinite"/>
      </g>
    </g>

    <!-- globe -->
    <circle cx="${GX}" cy="${GY}" r="${GR}" fill="url(#gGlow)" opacity="0.55"/>
    <circle cx="${GX}" cy="${GY}" r="${GR}" fill="none" stroke="${C.cyan}" stroke-opacity="0.55" stroke-width="1.5"/>
    <circle cx="${GX}" cy="${GY}" r="${GR - 9}" fill="none" stroke="${C.cyan}" stroke-opacity="0.14" stroke-width="1"/>
    <circle cx="${GX}" cy="${GY}" r="${GR}" fill="none" stroke="${C.cyan}" stroke-width="1.6" opacity="0">
      <animate attributeName="r" values="${GR};${GR + 62}" dur="4.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0" dur="4.5s" repeatCount="indefinite"/>
    </circle>
    ${meridians}
    ${parallels}
    <!-- city nodes -->
    <circle cx="918" cy="152" r="3.4" fill="${C.pink}" style="animation:tw 2.2s ease-in-out infinite"/>
    <circle cx="1006" cy="186" r="3.4" fill="${C.lime}" style="animation:tw 2.8s ease-in-out .4s infinite"/>
    <circle cx="940" cy="266" r="3.4" fill="${C.amber}" style="animation:tw 2.4s ease-in-out .9s infinite"/>
    <path d="M918 152 Q 968 130 1006 186" fill="none" stroke="${C.lime}" stroke-opacity="0.35" stroke-width="1.2" stroke-dasharray="3 6">
      <animate attributeName="stroke-dashoffset" values="0;-72" dur="3.4s" repeatCount="indefinite"/>
    </path>

    <!-- eyebrow -->
    <g transform="translate(64 62)">
      <circle cx="6" cy="0" r="5.5" fill="${C.lime}" style="animation:pulse 2.4s ease-in-out infinite"/>
      <text x="22" y="4" font-family="${MONO}" font-size="12.5" letter-spacing="3.4" fill="${C.muted}">OPEN TO COLLABORATE</text>
    </g>

    <!-- wordmark -->
    <text x="60" y="150" font-family="${FONT}" font-size="66" font-weight="800" letter-spacing="-1.6" fill="url(#gName)">Sainudheen</text>

    <!-- role ticker -->
    <g transform="translate(0 0)">
      <g clip-path="url(#roleClip)">
        <g style="animation:roll 13s steps(1,end) infinite">
          ${ticker}
          <text x="118" y="${216 + 4 * 44}" class="role">${roles[0]}</text>
        </g>
      </g>
      <path d="M74 199 l -9 12 l 9 12 l 9 -12 Z" fill="none" stroke="${C.cyan}" stroke-width="1.6" stroke-opacity="0.9"/>
      <path d="M74 205 l -4 6 l 4 6 l 4 -6 Z" fill="${C.cyan}" fill-opacity="0.5"/>
    </g>

    <!-- chips -->
    <g transform="translate(64 300)" font-family="${MONO}" font-size="13.5" fill="${C.muted}">
      <g>
        <rect width="196" height="36" rx="18" fill="#ffffff" fill-opacity="0.045" stroke="${C.line}"/>
        <circle cx="22" cy="18" r="4" fill="${C.pink}" style="animation:pulse 2s ease-in-out infinite"/>
        <text x="38" y="23">Oman · UTC+4</text>
      </g>
      <g transform="translate(212 0)">
        <rect width="214" height="36" rx="18" fill="#ffffff" fill-opacity="0.045" stroke="${C.line}"/>
        <text x="20" y="23" fill="${C.cyan}">sainudheen.tech</text>
      </g>
      <g transform="translate(442 0)">
        <rect width="272" height="36" rx="18" fill="#ffffff" fill-opacity="0.045" stroke="${C.line}"/>
        <path d="M19 18 l 9 -4 l -2 4 l 2 4 Z" fill="${C.amber}"/>
        <text x="38" y="23">NDC · GDS · Travel Tech</text>
      </g>
    </g>

    <!-- bottom sweep -->
    <rect x="64" y="368" width="1072" height="2" rx="1" fill="url(#gSweep)"/>
    <text x="64" y="398" font-family="${MONO}" font-size="11.5" letter-spacing="2.2" fill="${C.muted}" fill-opacity="0.75">BUILDING THINGS THAT MOVE PEOPLE — PIXELS, APIS &amp; ITINERARIES</text>
  </g>
  <!-- animated border -->
  <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="30" fill="none" stroke="url(#gEdge)" stroke-opacity="0.75" stroke-width="1.6"/>`;

  const style = `
    .role{font-family:${FONT};font-size:31px;font-weight:600;fill:${C.text};fill-opacity:.92;letter-spacing:.2px}
    @keyframes tw{0%,100%{opacity:.12}50%{opacity:.95}}
    @keyframes pulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
    @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(70px,40px)}}
    @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-80px,-30px)}}
    @keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-50px)}}
    @keyframes roll{0%,22%{transform:translateY(0)}25%,47%{transform:translateY(-44px)}50%,72%{transform:translateY(-88px)}75%,97%{transform:translateY(-132px)}100%{transform:translateY(-176px)}}
    @media (prefers-reduced-motion: reduce){*{animation:none!important}}
  `;

  const defs = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#070b18"/>
    <stop offset="0.55" stop-color="#0a1024"/>
    <stop offset="1" stop-color="#0d0a1e"/>
  </linearGradient>
  <clipPath id="cardClip"><rect width="${W}" height="${H}" rx="30"/></clipPath>
  <clipPath id="roleClip"><rect x="70" y="192" width="820" height="40"/></clipPath>`;

  return svg({
    w: W,
    h: H,
    title: "Sainudheen — full-stack developer exploring NDC, GDS and travel tech",
    desc: "Animated banner: starfield, drifting aurora, a wireframe globe with an orbiting plane, the name Sainudheen, rotating roles and location chips.",
    body,
    defs,
    style,
  });
}

/* ------------------------------------------------------------------ */
/* 2. route / journey (NDC → GDS → Travel tech)                        */
/* ------------------------------------------------------------------ */

function journey() {
  const W = 1100;
  const H = 300;
  const Y = 168;
  const stops = [
    { x: 150, label: "NDC", sub: "New Distribution Capability", tag: "OFFER → ORDER" },
    { x: 550, label: "GDS", sub: "Global Distribution System", tag: "AMADEUS · SABRE · TRAVELPORT" },
    { x: 950, label: "TRAVEL TECH", sub: "Airline retailing &amp; APIs", tag: "PNR · ANCILLARIES · EDIFACT" },
  ];

  const path = `M ${stops[0].x} ${Y} L ${stops[2].x} ${Y}`;

  const nodes = stops
    .map(
      (s, i) => `
    <g>
      <circle cx="${s.x}" cy="${Y}" r="26" fill="${C.cyan}" fill-opacity="0.08"/>
      <circle cx="${s.x}" cy="${Y}" r="26" fill="none" stroke="${
        [C.cyan, C.violet, C.pink][i]
      }" stroke-opacity="0.45" stroke-width="1.2"/>
      <circle cx="${s.x}" cy="${Y}" r="26" fill="none" stroke="${
        [C.cyan, C.violet, C.pink][i]
      }" stroke-width="1.4" opacity="0">
        <animate attributeName="r" values="26;50" dur="3.4s" begin="${i * 0.7}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.75;0" dur="3.4s" begin="${i * 0.7}s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${s.x}" cy="${Y}" r="7" fill="${
        [C.cyan, C.violet, C.pink][i]
      }" style="animation:pulse 2.6s ease-in-out ${i * 0.4}s infinite" transform-origin="${
        s.x
      }px ${Y}px"/>
      <text x="${s.x}" y="${Y - 54}" text-anchor="middle" font-family="${FONT}" font-size="21" font-weight="800" letter-spacing="2.4" fill="${
        C.text
      }">${s.label}</text>
      <text x="${s.x}" y="${Y + 58}" text-anchor="middle" font-family="${FONT}" font-size="14" fill="${
        C.muted
      }">${s.sub}</text>
      <text x="${s.x}" y="${Y + 82}" text-anchor="middle" font-family="${MONO}" font-size="10.5" letter-spacing="1.6" fill="${
        C.muted
      }" fill-opacity="0.6">${s.tag}</text>
    </g>`
    )
    .join("");

  const body = `
  <rect width="${W}" height="${H}" rx="26" fill="url(#jbg)"/>
  <rect width="${W}" height="${H}" rx="26" fill="url(#dots)" opacity="0.35"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="none" stroke="${C.line}"/>

  <text x="46" y="52" font-family="${MONO}" font-size="11.5" letter-spacing="3.2" fill="${C.cyan}" fill-opacity="0.85">CURRENT ITINERARY</text>
  <text x="46" y="80" font-family="${FONT}" font-size="17" fill="${C.muted}">how a ticket actually gets from an airline to a screen</text>

  <!-- route line -->
  <path d="${path}" stroke="${C.line}" stroke-width="2.4" fill="none"/>
  <path d="${path}" stroke="url(#gSweep)" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="${path}" stroke="${C.text}" stroke-opacity="0.28" stroke-width="2" fill="none" stroke-dasharray="2 14" stroke-linecap="round">
    <animate attributeName="stroke-dashoffset" values="0;-160" dur="5s" repeatCount="indefinite"/>
  </path>

  <!-- plane flying the route -->
  <g>
    <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path="${path}" keyPoints="0;1;1;0" keyTimes="0;0.45;0.55;1" calcMode="linear"/>
    <path d="M -13 0 L 9 -5 L 3 0 L 9 5 Z" fill="${C.amber}"/>
    <circle cx="-14" cy="0" r="7" fill="${C.amber}" fill-opacity="0.22" style="animation:tw 1.5s ease-in-out infinite"/>
  </g>
  <!-- contrail -->
  <circle r="3" fill="${C.cyan}">
    <animateMotion dur="9s" repeatCount="indefinite" path="${path}" keyPoints="0;0.9" keyTimes="0;1" begin="-0.9s"/>
    <animate attributeName="opacity" values="0.9;0" dur="9s" repeatCount="indefinite"/>
  </circle>

  ${nodes}`;

  const style = `
    @keyframes pulse{0%,100%{opacity:.5;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}
    @keyframes ping{0%{opacity:.55;transform:scale(.85)}70%,100%{opacity:0;transform:scale(1.9)}}
    @keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
    @media (prefers-reduced-motion: reduce){*{animation:none!important}}
  `;

  const defs = `<linearGradient id="jbg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#080c18"/><stop offset="1" stop-color="#0c0a1c"/>
  </linearGradient>`;

  return svg({
    w: W,
    h: H,
    title: "Route map: NDC to GDS to travel tech",
    desc: "Animated dotted flight path linking NDC, GDS and travel tech, with a plane travelling between the three stops.",
    body,
    defs,
    style,
  });
}

/* ------------------------------------------------------------------ */
/* 3. marquee ticker                                                   */
/* ------------------------------------------------------------------ */

function ticker() {
  const W = 1100;
  const H = 54;
  const items = [
    "NDC",
    "OFFER / ORDER",
    "GDS",
    "AMADEUS",
    "SABRE",
    "TRAVELPORT",
    "PNR",
    "EDIFACT",
    "REST / JSON",
    "ANCILLARIES",
    "SCHEDULES",
    "TRAVEL TECH",
  ];
  const line = items.join("   \u2726   ") + "   \u2726   ";
  const U = 2060; // forced width of one pass; textLength keeps the loop seamless

  const pass = (x) =>
    `<text x="${x}" y="34" textLength="${U}" lengthAdjust="spacing" font-family="${MONO}" font-size="15" letter-spacing="2.6" fill="url(#gName)" fill-opacity="0.9">${line}</text>`;

  const body = `
  <rect width="${W}" height="${H}" rx="27" fill="#0a0f1e" stroke="${C.line}"/>
  <g clip-path="url(#tclip)">
    <g style="animation:slide 30s linear infinite">
      ${pass(0)}
      ${pass(U)}
      ${pass(U * 2)}
    </g>
  </g>
  <rect width="90" height="${H}" fill="url(#fadeL)"/>
  <rect x="${W - 90}" width="90" height="${H}" fill="url(#fadeR)"/>`;

  const style = `@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-${U}px)}}
    @media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

  const defs = `<clipPath id="tclip"><rect width="${W}" height="${H}" rx="27"/></clipPath>
  <linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0f1e"/><stop offset="1" stop-color="#0a0f1e" stop-opacity="0"/></linearGradient>
  <linearGradient id="fadeR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0f1e" stop-opacity="0"/><stop offset="1" stop-color="#0a0f1e"/></linearGradient>`;

  return svg({
    w: W,
    h: H,
    title: "Travel tech keywords",
    desc: "Scrolling marquee listing NDC, GDS, offer and order, PNR, EDIFACT and related travel tech terms.",
    body,
    defs,
    style,
  });
}

/* ------------------------------------------------------------------ */
/* 4. divider                                                          */
/* ------------------------------------------------------------------ */

function divider() {
  const W = 1100;
  const H = 26;
  const body = `
  <path d="M0 ${H / 2} H ${W}" stroke="${C.line}" stroke-width="1"/>
  <path d="M0 ${H / 2} H ${W}" stroke="url(#gSweep)" stroke-width="1.6"/>
  <g>
    <animateMotion dur="8s" repeatCount="indefinite" path="M0 ${H / 2} H ${W}"/>
    <path d="M0 -5 L 5 0 L 0 5 L -5 0 Z" fill="${C.cyan}"/>
  </g>
  <circle cx="${W / 2}" cy="${H / 2}" r="2.2" fill="${C.violet}"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="2.2" fill="${C.violet}" style="animation:ping 3s ease-out infinite" transform-origin="${
    W / 2
  }px ${H / 2}px"/>`;

  return svg({
    w: W,
    h: H,
    title: "",
    desc: "Decorative animated divider.",
    body,
    style:
      "@keyframes ping{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(5)}}@media (prefers-reduced-motion: reduce){*{animation:none!important}}",
  });
}

/* ------------------------------------------------------------------ */
/* 5. boarding pass (connect / footer)                                 */
/* ------------------------------------------------------------------ */

function pass() {
  const W = 1100;
  const H = 200;

  const field = (x, y, label, value, color = C.text, size = 18) => `
    <g transform="translate(${x} ${y})">
      <text font-family="${MONO}" font-size="10" letter-spacing="2.4" fill="${C.muted}" fill-opacity="0.8">${label}</text>
      <text y="26" font-family="${FONT}" font-size="${size}" font-weight="600" fill="${color}">${value}</text>
    </g>`;

  const body = `
  <rect width="${W}" height="${H}" rx="24" fill="url(#pbg)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="24" fill="none" stroke="${C.line}"/>
  <rect width="${W}" height="${H}" rx="24" fill="url(#dots)" opacity="0.22"/>

  <text x="48" y="52" font-family="${MONO}" font-size="11" letter-spacing="3.4" fill="${C.cyan}">BOARDING PASS</text>
  <text x="48" y="96" font-family="${FONT}" font-size="34" font-weight="800" letter-spacing="-0.6" fill="url(#gName)">Sainudheen</text>
  <text x="48" y="126" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${C.muted}">FULL-STACK DEV · TRAVEL-TECH EXPLORER</text>

  <g transform="translate(48 150)">
    <rect width="150" height="30" rx="15" fill="${C.lime}" fill-opacity="0.12" stroke="${C.lime}" stroke-opacity="0.35"/>
    <circle cx="18" cy="15" r="4" fill="${C.lime}" style="animation:pulse 2.2s ease-in-out infinite"/>
    <text x="32" y="20" font-family="${MONO}" font-size="11" letter-spacing="1.4" fill="${C.lime}">OPEN TO WORK</text>
  </g>

  <!-- perforation -->
  <path d="M760 0 V ${H}" stroke="${C.line}" stroke-width="1.6" stroke-dasharray="6 8">
    <animate attributeName="stroke-dashoffset" values="0;-56" dur="4s" repeatCount="indefinite"/>
  </path>
  <circle cx="760" cy="0" r="13" fill="#080b16"/>
  <circle cx="760" cy="${H}" r="13" fill="#080b16"/>

  ${field(800, 62, "GATE", "\u221e")}
  ${field(878, 62, "SEAT", "01")}
  ${field(952, 62, "CLASS", "CURIOUS", C.amber, 15)}
  ${field(800, 128, "DESTINATION", "github.com/sainudheenp", C.cyan, 17)}

  <!-- little plane trail -->
  <g opacity="0.9">
    <path d="M800 178 H 1044" stroke="${C.line}" stroke-dasharray="3 7" stroke-width="1.4"/>
    <g>
      <animateMotion dur="6s" repeatCount="indefinite" path="M800 178 H 1044"/>
      <path d="M-9 0 L 6 -3.4 L 2 0 L 6 3.4 Z" fill="${C.cyan}"/>
    </g>
  </g>`;

  const defs = `<linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#080c18"/><stop offset="0.6" stop-color="#0b1020"/><stop offset="1" stop-color="#0d0a1e"/>
  </linearGradient>`;

  return svg({
    w: W,
    h: H,
    title: "Boarding pass — Sainudheen, open to work",
    desc: "A boarding-pass style card with the name Sainudheen, an open-to-work stamp, destination github.com/sainudheenp and an animated plane.",
    body,
    defs,
    style:
      "@keyframes pulse{0%,100%{opacity:.45;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}@media (prefers-reduced-motion: reduce){*{animation:none!important}}",
  });
}

/* ------------------------------------------------------------------ */

mkdirSync(OUT, { recursive: true });
const files = {
  "hero.svg": hero(),
  "route.svg": journey(),
  "ticker.svg": ticker(),
  "divider.svg": divider(),
  "pass.svg": pass(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(resolve(OUT, name), content);
  console.log(`${name.padEnd(12)} ${(content.length / 1024).toFixed(1)} KB`);
}
