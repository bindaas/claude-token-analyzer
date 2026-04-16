/**
 * Claude Token Analyzer — Local Server
 * No npm install required. Run: node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT         = 3000;
const CLAUDE_DIR   = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
const PUBLIC_DIR   = path.join(__dirname, 'public');

// ─── Pricing (per 1M tokens) — claude-sonnet-4.x ────────────────────────────
const PRICE = {
  input:       3.00,
  cache_write: 3.75,
  cache_read:  0.30,
  output:     15.00,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcCost(u) {
  return (
    (u.input       / 1e6) * PRICE.input       +
    (u.output      / 1e6) * PRICE.output      +
    (u.cache_write / 1e6) * PRICE.cache_write +
    (u.cache_read  / 1e6) * PRICE.cache_read
  );
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ─── JSONL Discovery ─────────────────────────────────────────────────────────
function findJsonlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.jsonl')) results.push(full);
    }
  }
  walk(dir);
  return results;
}

// ─── Parse a single JSONL file ───────────────────────────────────────────────
function parseJsonlFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  // Derive project name from directory structure
  const parts = filePath.split(path.sep);
  const projectIdx = parts.indexOf('projects');
  const projectFolder = projectIdx >= 0 ? (parts[projectIdx + 1] || 'unknown') : 'unknown';
  // Decode: -Users-bindaas-projects-story-of-lifetime → story-of-lifetime
  const projectName = projectFolder
    .replace(/^-Users-[^-]+-projects-?/, '')
    .replace(/--/g, '/')
    .replace(/-/g, '-')
    || projectFolder;

  const sessions   = {};
  const toolCalls  = [];
  const largeReads = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let obj;
    try { obj = JSON.parse(trimmed); } catch { continue; }

    const sid = obj.sessionId;
    if (!sid) continue;

    if (!sessions[sid]) {
      sessions[sid] = {
        id: sid, project: projectName, file: path.basename(filePath),
        prompts: 0, inputTokens: 0, outputTokens: 0,
        cacheWrite: 0, cacheRead: 0, toolCalls: 0,
        firstTs: null, lastTs: null, entrypoint: null,
      };
    }
    const sess = sessions[sid];

    if (obj.timestamp) {
      const ts = new Date(obj.timestamp);
      if (!sess.firstTs || ts < new Date(sess.firstTs)) sess.firstTs = obj.timestamp;
      if (!sess.lastTs  || ts > new Date(sess.lastTs))  sess.lastTs  = obj.timestamp;
    }
    if (!sess.entrypoint && obj.entrypoint) sess.entrypoint = obj.entrypoint;

    // Assistant messages with usage stats
    if (obj.type === 'assistant' && obj.message?.usage) {
      const u  = obj.message.usage;
      const ic = u.input_tokens                || 0;
      const oc = u.output_tokens               || 0;
      const cw = u.cache_creation_input_tokens || 0;
      const cr = u.cache_read_input_tokens     || 0;

      sess.inputTokens  += ic;
      sess.outputTokens += oc;
      sess.cacheWrite   += cw;
      sess.cacheRead    += cr;

      for (const block of (obj.message.content || [])) {
        if (block.type === 'tool_use') {
          sess.toolCalls++;
          toolCalls.push({
            name: block.name, sessionId: sid,
            project: projectName, timestamp: obj.timestamp,
          });
        }
      }
    }

    // Tool results — detect large file reads
    if (obj.type === 'user' && obj.toolUseResult) {
      const res = obj.toolUseResult;
      if (res?.type === 'text' && res?.file?.numLines > 50) {
        largeReads.push({
          file: res.file.filePath || '?', lines: res.file.numLines,
          totalLines: res.file.totalLines, sessionId: sid,
          project: projectName, timestamp: obj.timestamp,
        });
      }
      if (typeof res === 'string' && res.includes('exceeds maximum')) {
        largeReads.push({
          file: '?', lines: 10000, totalLines: null, error: true,
          sessionId: sid, project: projectName, timestamp: obj.timestamp,
        });
      }
    }

    // User prompts (count only real ones, not tool results or meta)
    if (obj.type === 'user' && obj.promptId && obj.message?.content) {
      const content = obj.message.content;
      let text = typeof content === 'string' ? content
        : Array.isArray(content) ? content.filter(b=>b.type==='text').map(b=>b.text).join(' ')
        : '';
      if (text.length > 10 && !text.startsWith('<bash') && !text.startsWith('<local')) {
        sess.prompts++;
      }
    }
  }

  return { sessions: Object.values(sessions), toolCalls, largeReads };
}

// ─── Aggregate all data ───────────────────────────────────────────────────────
function buildPayload() {
  const files = findJsonlFiles(PROJECTS_DIR);

  const allSessions   = [];
  const allToolCalls  = [];
  const allLargeReads = [];

  for (const f of files) {
    try {
      const { sessions, toolCalls, largeReads } = parseJsonlFile(f);
      allSessions.push(...sessions);
      allToolCalls.push(...toolCalls);
      allLargeReads.push(...largeReads);
    } catch(e) {
      console.error('Failed to parse', f, e.message);
    }
  }

  // Totals
  const totals = { input: 0, output: 0, cache_write: 0, cache_read: 0 };
  for (const s of allSessions) {
    totals.input       += s.inputTokens;
    totals.output      += s.outputTokens;
    totals.cache_write += s.cacheWrite;
    totals.cache_read  += s.cacheRead;
  }

  // Per-project
  const byProjectMap = {};
  for (const s of allSessions) {
    if (!byProjectMap[s.project]) {
      byProjectMap[s.project] = {
        project: s.project, sessions: 0, prompts: 0,
        input: 0, output: 0, cache_write: 0, cache_read: 0, cost: 0,
      };
    }
    const p = byProjectMap[s.project];
    p.sessions++; p.prompts += s.prompts;
    p.input       += s.inputTokens;  p.output      += s.outputTokens;
    p.cache_write += s.cacheWrite;   p.cache_read  += s.cacheRead;
  }
  for (const p of Object.values(byProjectMap)) {
    p.cost = calcCost({ input:p.input, output:p.output, cache_write:p.cache_write, cache_read:p.cache_read });
  }

  // Weekly trend
  const byWeekMap = {};
  for (const s of allSessions) {
    if (!s.firstTs) continue;
    const d  = new Date(s.firstTs);
    const wk = isoWeek(d);
    if (!byWeekMap[wk]) {
      byWeekMap[wk] = {
        week: wk, weekStart: d.toISOString().slice(0,10),
        input:0, output:0, cache_write:0, cache_read:0,
        sessions:0, prompts:0, toolCalls:0, cost:0,
      };
    }
    const w = byWeekMap[wk];
    w.sessions++; w.prompts += s.prompts;
    w.input       += s.inputTokens;  w.output      += s.outputTokens;
    w.cache_write += s.cacheWrite;   w.cache_read  += s.cacheRead;
  }
  for (const t of allToolCalls) {
    if (!t.timestamp) continue;
    const wk = isoWeek(new Date(t.timestamp));
    if (byWeekMap[wk]) byWeekMap[wk].toolCalls++;
  }
  for (const w of Object.values(byWeekMap)) {
    w.cost = calcCost(w);
    const denom = w.input + w.cache_write + w.cache_read;
    w.cacheHitPct  = denom > 0 ? +(w.cache_read / denom * 100).toFixed(1) : 0;
    w.outputRatio  = (w.input + w.output) > 0
      ? +(w.output / (w.input + w.output) * 100).toFixed(1) : 0;
  }

  const weeklyTrend = Object.values(byWeekMap).sort((a,b) => a.week.localeCompare(b.week));

  // Tool counts
  const toolCounts = {};
  for (const t of allToolCalls) toolCounts[t.name] = (toolCounts[t.name]||0) + 1;

  // Session list
  const sessionList = allSessions.map(s => ({
    id: s.id, project: s.project, prompts: s.prompts,
    inputTokens: s.inputTokens, outputTokens: s.outputTokens,
    cacheWrite: s.cacheWrite, cacheRead: s.cacheRead,
    toolCalls: s.toolCalls, firstTs: s.firstTs, lastTs: s.lastTs,
    entrypoint: s.entrypoint,
    cost: calcCost({ input:s.inputTokens, output:s.outputTokens, cache_write:s.cacheWrite, cache_read:s.cacheRead }),
  })).sort((a,b) => (b.firstTs||'').localeCompare(a.firstTs||''));

  return {
    generatedAt:  new Date().toISOString(),
    filesScanned: files.length,
    totals, totalCost: calcCost(totals),
    byProject:    Object.values(byProjectMap).sort((a,b) => b.cost - a.cost),
    weeklyTrend,
    toolCounts,
    largeReads:   allLargeReads.slice(0, 50),
    sessions:     sessionList,
    pricing:      PRICE,
  };
}

// ─── MIME ────────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (url === '/api/data') {
    try {
      const payload = buildPayload();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    } catch(e) {
      console.error('API error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  let filePath = path.join(PUBLIC_DIR, url === '/' ? 'index.html' : url);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + url); return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n  Claude Token Analyzer');
  console.log('  ─────────────────────────────────────');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Reading: ${PROJECTS_DIR}`);
  console.log('  Press Ctrl+C to stop\n');
});
