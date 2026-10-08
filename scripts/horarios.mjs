// Genera public/escuela/horario-<area>.png: el programa de cada área tal como se ve en PC.
// Uso: npm run build && npm run horarios && npm run build
// Requiere Google Chrome (ruta configurable con CHROME=...).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST = 'dist';
const OUT = 'public/escuela';
const WIDTH = 1280;
const PAD = 32;

const page = readFileSync(join(DIST, 'escuela-primavera/index.html'), 'utf8');
const areas = [...page.matchAll(/id="?tab-([a-z-]+)/g)].map((m) => m[1]);
if (areas.length === 0) throw new Error('No hay áreas en dist/escuela-primavera; corre npm run build primero.');

// Página auxiliar: carga /escuela-primavera en un iframe, elige el área, oculta lo que no va
// en la imagen, agrega un encabezado y (con top/h) recorta solo el horario.
const capture = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#051615}#clip{position:relative;overflow:hidden;width:${WIDTH}px;height:100vh}
iframe{position:absolute;left:0;border:0;width:${WIDTH}px;height:9000px}</style>
<div id="clip"><iframe id="f"></iframe></div><pre id="o"></pre>
<script>
window.onerror = (m) => { document.getElementById('o').textContent = 'ERR ' + m; };
const q = new URLSearchParams(location.search);
const area = q.get('area'), cropTop = Number(q.get('top') || 0);
localStorage.setItem('theme', 'dark');
const f = document.getElementById('f');
f.style.top = -cropTop + 'px';
f.onload = () => setTimeout(() => {
  const d = f.contentDocument;
  const tab = d.getElementById('tab-' + area);
  // Se muestra el panel directo: en headless con tiempo virtual, x-show de Alpine no siempre re-renderiza.
  for (const p of d.querySelectorAll('[role=tabpanel]')) p.style.display = p.id === 'panel-' + area ? '' : 'none';
  setTimeout(() => {
    const st = d.createElement('style');
    st.textContent = '[data-no-capture],[role=tablist]{display:none!important}';
    d.head.append(st);
    const panel = d.getElementById('panel-' + area);
    const hd = d.createElement('div');
    hd.style.cssText = 'padding-bottom:24px';
    hd.innerHTML = '<div style="color:#e9b27c;font-size:14px;letter-spacing:.08em;text-transform:uppercase">Escuela de Primavera UNAB 2026 · 13–16 de octubre</div>'
      + '<div style="font-size:36px;font-weight:500;margin-top:8px">Horario · ' + tab.textContent.trim() + '</div>';
    panel.prepend(hd);
    const r = panel.getBoundingClientRect();
    document.getElementById('o').textContent = JSON.stringify({ top: Math.floor(r.top - PAD), h: Math.ceil(r.height + 2 * PAD) });
  }, 100);
}, 500);
f.src = '/escuela-primavera/';
</script>`.replaceAll('PAD', String(PAD));

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__capture') return res.end(capture);
  let file = join(DIST, decodeURIComponent(url.pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const base = `http://localhost:${server.address().port}/__capture`;

// Async: el servidor de arriba corre en este mismo proceso y debe seguir respondiendo.
const chrome = async (args) =>
  (await promisify(execFile)(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=10000', ...args], {
    encoding: 'utf8', maxBuffer: 64 << 20, timeout: 60000,
  })).stdout;

mkdirSync(OUT, { recursive: true });
try {
  for (const area of areas) {
    const dom = await chrome([`--window-size=${WIDTH},900`, '--dump-dom', `${base}?area=${area}`]);
    const out = dom.match(/<pre id="o">(.*?)<\/pre>/)?.[1] ?? '';
    if (!out.startsWith('{')) throw new Error(`No se pudo medir ${area}: ${out || 'sin respuesta'}`);
    const { top, h } = JSON.parse(out);
    const shot = `${OUT}/.${area}.raw.png`;
    await chrome([`--window-size=${WIDTH},${h}`, '--force-device-scale-factor=2', `--screenshot=${shot}`, `${base}?area=${area}&top=${top}`]);
    await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(`${OUT}/horario-${area}.png`);
    rmSync(shot);
    console.log(`✓ ${OUT}/horario-${area}.png (${WIDTH}×${h} @2x)`);
  }
} finally {
  server.close();
}
