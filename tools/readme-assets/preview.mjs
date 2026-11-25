/**
 * Renders README.md into a self-contained HTML preview.
 *
 *   node tools/readme-assets/preview.mjs           # write preview.html
 *   node tools/readme-assets/preview.mjs --serve   # write it, then serve on :8080
 *
 * Local SVGs are inlined as data URIs so the file works from any location
 * (file://, a dev server, or a live preview proxy) with animations intact.
 * Remote badges/stats images are left as-is — they need network access, just
 * like on github.com.
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const OUT = join(HERE, "preview.html");
const PORT = Number(process.env.PORT || 8080);

const readme = readFileSync(join(REPO, "README.md"), "utf8");

let html = marked.parse(readme, { gfm: true, breaks: false });

// Inline repo-local SVGs (and any other local image) as data URIs.
let inlined = 0;
html = html.replace(/src="(?!https?:|data:)([^"]+)"/g, (match, rel) => {
  const file = resolve(REPO, rel.replace(/^\.\//, ""));
  if (!existsSync(file)) {
    console.warn(`  ! missing asset: ${rel}`);
    return match;
  }
  const mime = extname(file) === ".svg" ? "image/svg+xml" : "image/png";
  if (mime === "image/svg+xml") {
    inlined += 1;
    return `src="data:${mime};base64,${readFileSync(file).toString("base64")}"`;
  }
  return match;
});

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>README preview — sainudheenp</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;background:#0d1117;color:#e6edf3;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
  .wrap{max-width:1012px;margin:0 auto;padding:40px 32px 80px}
  .bar{display:flex;align-items:center;gap:12px;justify-content:space-between;border-bottom:1px solid #30363d;padding-bottom:14px;margin-bottom:24px;font-size:13px;color:#8b949e}
  .pill{border:1px solid #30363d;border-radius:999px;padding:4px 12px;font-size:12px}
  .note{background:#12243a;border:1px solid #1f6feb55;border-radius:8px;padding:10px 14px;font-size:13px;color:#9fb3cd;margin-bottom:24px}
  img{max-width:100%}
  h1,h2,h3{line-height:1.25;margin:32px 0 14px;font-weight:600}
  h2{font-size:1.5em;border-bottom:1px solid #21262d;padding-bottom:.3em}
  h3{font-size:1.1em;margin:0 0 10px}
  a{color:#4493f8;text-decoration:none} a:hover{text-decoration:underline}
  code{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:.12em .35em;font-size:85%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  pre{background:#0b1020;border:1px solid #21262d;border-radius:10px;padding:16px;overflow:auto}
  pre code{background:none;border:0;padding:0;font-size:13px;line-height:1.55}
  table{display:block;width:100%;overflow:auto;border-collapse:collapse;margin:16px 0}
  table th,table td{padding:8px 14px;border:1px solid #30363d}
  table tr:nth-child(2n){background:#0f141b}
  table td[align]{vertical-align:top;padding:16px}
  div[align=center] img{margin:4px 2px}
  blockquote{border-left:3px solid #30363d;margin:0;padding:0 1em;color:#8b949e}
  hr{border:0;border-top:1px solid #30363d;margin:28px 0}
</style></head><body><div class="wrap">
<div class="bar"><strong>README.md</strong><span>local render · ${inlined} animated SVGs inlined</span><span class="pill">preview</span></div>
<div class="note">Local render for review — the real page lives at github.com/sainudheenp. Animations in the SVGs run live.</div>
${html}
</div></body></html>`;

writeFileSync(OUT, page);
console.log(`preview.html written (${(page.length / 1024).toFixed(1)} KB, ${inlined} SVGs inlined)`);

if (process.argv.includes("--serve")) {
  const types = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = join(HERE, path === "/" ? "preview.html" : path.replace(/^\/+/, ""));
    if (!file.startsWith(HERE) || !existsSync(file)) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  });
  // bind 0.0.0.0 so the live preview proxy can reach it
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`serving http://0.0.0.0:${PORT}/ (preview.html at /)`);
  });
}
