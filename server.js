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

// ─── Per-model pricing (per 1M tokens) ───────────────────────────────────────
const MODEL_PRICING = {
  'opus-4.7': { input: 5,    output: 25,   cache_write: 6.25,  cache_read: 0.50 },
  'opus-4.6': { input: 5,    output: 25,   cache_write: 6.25,  cache_read: 0.50 },
  'opus-4.5': { input: 5,    output: 25,   cache_write: 6.25,  cache_read: 0.50 },
  'opus-4':   { input: 15,   output: 75,   cache_write: 18.75, cache_read: 1.50 },
  'sonnet':   { input: 3,    output: 15,   cache_write: 3.75,  cache_read: 0.30 },
  'haiku-4.5':{ input: 1,    output: 5,    cache_write: 1.25,  cache_read: 0.10 },
  'haiku':    { input: 0.80, output: 4,    cache_write: 1.00,  cache_read: 0.08 },
};
const DEFAULT_PRICE = MODEL_PRICING['sonnet'];

function getPricing(model) {
  if (!model) return DEFAULT_PRICE;
  const m = model.toLowerCase();
  if (m.includes('opus')) {
    if (m.includes('4-7') || m.includes('4.7')) return MODEL_PRICING['opus-4.7'];
    if (m.includes('4-6') || m.includes('4.6')) return MODEL_PRICING['opus-4.6'];
    if (m.includes('4-5') || m.includes('4.5')) return MODEL_PRICING['opus-4.5'];
    return MODEL_PRICING['opus-4'];
  }
  if (m.includes('sonnet')) return MODEL_PRICING['sonnet'];
  if (m.includes('haiku')) {
    if (m.includes('4-5') || m.includes('4.5')) return MODEL_PRICING['haiku-4.5'];
    return MODEL_PRICING['haiku'];
  }
  return DEFAULT_PRICE;
}

function calcCost(u, price) {
  const p = price || DEFAULT_PRICE;
  return (
    (u.input       / 1e6) * p.input       +
    (u.output      / 1e6) * p.output      +
    (u.cache_write / 1e6) * p.cache_write +
    (u.cache_read  / 1e6) * p.cache_read
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

function fmtNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return Math.round(n).toString();
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

  const parts = filePath.split(path.sep);
  const projectIdx = parts.indexOf('projects');
  const projectFolder = projectIdx >= 0 ? (parts[projectIdx + 1] || 'unknown') : 'unknown';
  const projectName = projectFolder
    .replace(/^-Users-[^-]+-projects-?/, '')
    .replace(/--/g, '/')
    .replace(/-/g, '-')
    || projectFolder;

  const sessions     = {};
  const toolCalls    = [];
  const largeReads   = [];
  const pendingPrompt = {}; // sid -> {text, timestamp}

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
        cacheWrite: 0, cacheRead: 0, toolCalls: 0, cost: 0,
        firstTs: null, lastTs: null, entrypoint: null,
        firstPrompt: null, model: null,
        queries: [],
        modelCounts: {},
      };
    }
    const sess = sessions[sid];

    if (obj.timestamp) {
      const ts = new Date(obj.timestamp);
      if (!sess.firstTs || ts < new Date(sess.firstTs)) sess.firstTs = obj.timestamp;
      if (!sess.lastTs  || ts > new Date(sess.lastTs))  sess.lastTs  = obj.timestamp;
    }
    if (!sess.entrypoint && obj.entrypoint) sess.entrypoint = obj.entrypoint;

    // Capture user prompts
    if (obj.type === 'user' && obj.message?.role === 'user' && !obj.isMeta) {
      const content = obj.message.content;
      let text = typeof content === 'string' ? content
        : Array.isArray(content) ? content.filter(b => b.type === 'text').map(b => b.text).join(' ')
        : '';
      if (text && !text.startsWith('<local') && !text.startsWith('<command') && !text.startsWith('<bash')) {
        if (text.length > 10) {
          sess.prompts++;
          if (!sess.firstPrompt) sess.firstPrompt = text.slice(0, 200);
        }
        pendingPrompt[sid] = { text: text.slice(0, 300) };
      }
    }

    // Assistant messages with usage stats
    if (obj.type === 'assistant' && obj.message?.usage) {
      const model = obj.message.model || 'unknown';
      if (model === '<synthetic>') continue;

      const u  = obj.message.usage;
      const ic = u.input_tokens                || 0;
      const oc = u.output_tokens               || 0;
      const cw = u.cache_creation_input_tokens || 0;
      const cr = u.cache_read_input_tokens     || 0;

      const price = getPricing(model);
      const qcost = calcCost({ input: ic, output: oc, cache_write: cw, cache_read: cr }, price);

      sess.inputTokens  += ic;
      sess.outputTokens += oc;
      sess.cacheWrite   += cw;
      sess.cacheRead    += cr;
      sess.cost         += qcost;
      sess.modelCounts[model] = (sess.modelCounts[model] || 0) + 1;

      const tools = [];
      for (const block of (obj.message.content || [])) {
        if (block.type === 'tool_use') {
          sess.toolCalls++;
          tools.push(block.name);
          toolCalls.push({ name: block.name, sessionId: sid, project: projectName, timestamp: obj.timestamp });
        }
      }

      const pp = pendingPrompt[sid];
      sess.queries.push({
        model,
        inputTokens: ic, outputTokens: oc, cacheWrite: cw, cacheRead: cr,
        cost: qcost,
        tools,
        userPrompt: pp ? pp.text : null,
        promptLen:  pp ? pp.text.length : 0,
        timestamp:  obj.timestamp,
      });
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
  }

  // Determine primary model per session
  for (const sess of Object.values(sessions)) {
    const entries = Object.entries(sess.modelCounts);
    if (entries.length) {
      sess.model = entries.sort((a, b) => b[1] - a[1])[0][0];
    }
    delete sess.modelCounts;
  }

  return { sessions: Object.values(sessions), toolCalls, largeReads };
}

// ─── Insights Engine (12 types) ───────────────────────────────────────────────
function generateInsights(sessions, allPrompts, totals) {
  const insights = [];

  // 1. Vague prompts — short messages burning large context
  const shortExpensive = allPrompts.filter(
    p => p.promptLen > 0 && p.promptLen < 30 && (p.inputTokens + p.outputTokens) > 100000
  );
  if (shortExpensive.length > 0) {
    const totalWasted = shortExpensive.reduce((s, p) => s + p.inputTokens + p.outputTokens, 0);
    insights.push({
      id: 'vague-prompts', type: 'warning',
      title: 'Short, vague messages are costing you the most',
      description: `${shortExpensive.length} messages under 30 chars each burned 100K+ tokens. Total: ${fmtNum(totalWasted)} tokens spent re-reading context to figure out what you wanted.`,
      action: 'Be specific. Instead of "Yes", say "Yes, update the login page and run the tests."',
    });
  }

  // 2. Context growth — cost compounding in long sessions
  const longSessions = sessions.filter(s => s.queries.length > 50);
  if (longSessions.length > 0) {
    const growthData = longSessions.map(s => {
      const first5 = s.queries.slice(0, 5).reduce((sum, q) => sum + q.inputTokens + q.outputTokens, 0) / Math.min(5, s.queries.length);
      const last5  = s.queries.slice(-5).reduce((sum, q) => sum + q.inputTokens + q.outputTokens, 0) / Math.min(5, s.queries.length);
      return { session: s, ratio: last5 / Math.max(first5, 1) };
    }).filter(g => g.ratio > 2);
    if (growthData.length > 0) {
      const avgGrowth = (growthData.reduce((s, g) => s + g.ratio, 0) / growthData.length).toFixed(1);
      insights.push({
        id: 'context-growth', type: 'warning',
        title: 'The longer you chat, the more each message costs',
        description: `In ${growthData.length} long conversations, messages near the end cost ${avgGrowth}× more than the start. Every turn re-reads the entire history.`,
        action: 'Start a fresh conversation per task. Paste a short summary if you need prior context.',
      });
    }
  }

  // 3. Marathon sessions — very long conversations
  const marathonCount = sessions.filter(s => s.queries.length > 200).length;
  if (marathonCount >= 3) {
    const marathonTokens = sessions
      .filter(s => s.queries.length > 200)
      .reduce((s, ses) => s + ses.inputTokens + ses.outputTokens, 0);
    const pct = ((marathonTokens / Math.max(totals.totalTokens, 1)) * 100).toFixed(0);
    insights.push({
      id: 'marathon-sessions', type: 'info',
      title: `Just ${marathonCount} long conversations used ${pct}% of all tokens`,
      description: `${marathonCount} conversations with 200+ turns consumed ${fmtNum(marathonTokens)} tokens — ${pct}% of everything. Context compounds with every turn.`,
      action: 'Keep one conversation per task. Start a new one when topics shift.',
    });
  }

  // 4. Input-heavy — most tokens are re-reading, not writing
  if (totals.totalTokens > 0) {
    const outputPct = (totals.totalOutputTokens / totals.totalTokens) * 100;
    if (outputPct < 2) {
      insights.push({
        id: 'input-heavy', type: 'info',
        title: `Only ${outputPct.toFixed(1)}% of tokens are Claude actually writing`,
        description: `${(100 - outputPct).toFixed(1)}% of all tokens is re-reading conversation history and files. The biggest cost driver is conversation length, not response length.`,
        action: 'Shorter conversations have more impact than asking for shorter answers.',
      });
    }
  }

  // 5. Day-of-week pattern
  if (sessions.length >= 10) {
    const dayMap = {};
    for (const s of sessions) {
      if (!s.firstTs) continue;
      const day = new Date(s.firstTs).getDay();
      if (!dayMap[day]) dayMap[day] = { tokens: 0, sessions: 0 };
      dayMap[day].tokens   += s.inputTokens + s.outputTokens;
      dayMap[day].sessions += 1;
    }
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const days = Object.entries(dayMap).map(([d, v]) => ({ day: dayNames[d], avg: v.tokens / v.sessions }));
    if (days.length >= 3) {
      days.sort((a, b) => b.avg - a.avg);
      insights.push({
        id: 'day-pattern', type: 'neutral',
        title: `You use Claude most intensively on ${days[0].day}s`,
        description: `${days[0].day} conversations average ${fmtNum(Math.round(days[0].avg))} tokens each vs ${fmtNum(Math.round(days[days.length-1].avg))} on ${days[days.length-1].day}s.`,
        action: null,
      });
    }
  }

  // 6. Model mismatch — Opus used for simple tasks
  const opusSessions = sessions.filter(s => s.model && s.model.toLowerCase().includes('opus'));
  if (opusSessions.length > 0) {
    const simpleOpus = opusSessions.filter(
      s => s.queries.length < 10 && (s.inputTokens + s.outputTokens) < 200000
    );
    if (simpleOpus.length >= 3) {
      const wastedCost = simpleOpus.reduce((s, ses) => s + ses.cost, 0);
      insights.push({
        id: 'model-mismatch', type: 'warning',
        title: `${simpleOpus.length} simple conversations used Opus unnecessarily`,
        description: `These short sessions cost $${wastedCost.toFixed(2)} on Opus. Opus is 5× more expensive than Sonnet for similar results on routine tasks.`,
        action: 'Use /model to switch to Sonnet for quick questions. Save Opus for complex multi-file refactors.',
      });
    }
  }

  // 7. Tool-heavy conversations
  if (sessions.length >= 5) {
    const toolHeavy = sessions.filter(s => {
      const userMsgs  = s.queries.filter(q => q.userPrompt).length;
      const toolCalls = s.queries.reduce((sum, q) => sum + q.tools.length, 0);
      return userMsgs > 0 && toolCalls > userMsgs * 3;
    });
    if (toolHeavy.length >= 3) {
      const toolHeavyTokens = toolHeavy.reduce((s, ses) => s + ses.inputTokens + ses.outputTokens, 0);
      const avgRatio = toolHeavy.reduce((s, ses) => {
        const u = ses.queries.filter(q => q.userPrompt).length;
        return s + ses.queries.reduce((sum, q) => sum + q.tools.length, 0) / Math.max(u, 1);
      }, 0) / toolHeavy.length;
      insights.push({
        id: 'tool-heavy', type: 'info',
        title: `${toolHeavy.length} conversations had ~${Math.round(avgRatio)}× more tool calls than messages`,
        description: `These conversations used ${fmtNum(toolHeavyTokens)} tokens total. Each tool call re-reads the entire conversation context.`,
        action: 'Point Claude to specific files and line numbers to reduce exploratory tool use.',
      });
    }
  }

  // 8. Project dominance
  if (sessions.length >= 5) {
    const projTokens = {};
    for (const s of sessions) {
      projTokens[s.project] = (projTokens[s.project] || 0) + s.inputTokens + s.outputTokens;
    }
    const sorted = Object.entries(projTokens).sort((a, b) => b[1] - a[1]);
    if (sorted.length >= 2) {
      const [topProj, topTokens] = sorted[0];
      const pct = ((topTokens / Math.max(totals.totalTokens, 1)) * 100).toFixed(0);
      if (pct >= 60) {
        insights.push({
          id: 'project-dominance', type: 'info',
          title: `${pct}% of tokens went to one project: ${topProj}`,
          description: `"${topProj}" used ${fmtNum(topTokens)} of ${fmtNum(totals.totalTokens)} total tokens. The next closest: ${fmtNum(sorted[1][1])}.`,
          action: 'If this project has long conversations, breaking into focused sub-sessions reduces footprint.',
        });
      }
    }
  }

  // 9. Conversation efficiency — per-turn cost in short vs long sessions
  if (sessions.length >= 10) {
    const shortSess = sessions.filter(s => s.queries.length >= 3 && s.queries.length <= 15);
    const longSess2 = sessions.filter(s => s.queries.length > 80);
    if (shortSess.length >= 3 && longSess2.length >= 2) {
      const shortAvg = Math.round(shortSess.reduce((s, ses) => s + (ses.inputTokens + ses.outputTokens) / ses.queries.length, 0) / shortSess.length);
      const longAvg  = Math.round(longSess2.reduce((s, ses) => s + (ses.inputTokens + ses.outputTokens) / ses.queries.length, 0) / longSess2.length);
      const ratio = (longAvg / Math.max(shortAvg, 1)).toFixed(1);
      if (ratio >= 2) {
        insights.push({
          id: 'conversation-efficiency', type: 'warning',
          title: `Each turn costs ${ratio}× more in long conversations`,
          description: `Short sessions (<15 turns): ~${fmtNum(shortAvg)} tokens/turn. Long ones (80+ turns): ~${fmtNum(longAvg)} tokens/turn. Context accumulation is the cause.`,
          action: 'Start fresh conversations more often. This is the single biggest lever for reducing spend.',
        });
      }
    }
  }

  // 10. Heavy initial context
  if (sessions.length >= 5) {
    const heavyStarts = sessions.filter(s => s.queries[0]?.inputTokens > 50000);
    if (heavyStarts.length >= 5) {
      const avgStart     = Math.round(heavyStarts.reduce((s, ses) => s + ses.queries[0].inputTokens, 0) / heavyStarts.length);
      const totalOverhead = heavyStarts.reduce((s, ses) => s + ses.queries[0].inputTokens, 0);
      insights.push({
        id: 'heavy-context', type: 'info',
        title: `${heavyStarts.length} conversations started with ${fmtNum(avgStart)}+ tokens of context`,
        description: `Before your first message, Claude reads CLAUDE.md and system context. In ${heavyStarts.length} sessions this averaged ${fmtNum(avgStart)} tokens — ${fmtNum(totalOverhead)} total, re-read every turn.`,
        action: 'Keep CLAUDE.md concise. Remove sections you rarely need.',
      });
    }
  }

  // 11. Cache efficiency savings
  if (totals.totalCacheReadTokens > 0) {
    const saved   = totals.totalSaved;
    const hitRate = (totals.cacheHitRate * 100).toFixed(1);
    insights.push({
      id: 'cache-savings', type: 'info',
      title: `Caching saved you an estimated $${saved.toFixed(2)}`,
      description: `Cache hit rate: ${hitRate}%. That fraction of input served from cache at 10× lower cost. Without caching your bill would be ~$${(totals.totalCost + saved).toFixed(2)}.`,
      action: 'Focused, medium-length sessions on a single task maximize cache reuse.',
    });
  }

  // 12. Smart /clear suggestion based on cost inflection points
  const qualSessions = sessions.filter(s => s.queries.length >= 10);
  if (qualSessions.length >= 3) {
    const inflections = [];
    for (const s of qualSessions) {
      const qs = s.queries;
      const baseCost = qs.slice(0, 5).reduce((sum, q) => sum + q.cost, 0) / Math.min(5, qs.length);
      if (baseCost <= 0) continue;
      for (let i = 2; i < qs.length; i++) {
        const windowCost = (qs[i].cost + qs[i-1].cost + qs[i-2].cost) / 3;
        if (windowCost > baseCost * 2) { inflections.push(i - 1); break; }
      }
    }
    if (inflections.length >= 2) {
      inflections.sort((a, b) => a - b);
      const medianTurn = inflections[Math.floor(inflections.length / 2)];
      insights.push({
        id: 'smart-clear', type: 'warning',
        title: `Use /clear after ~${medianTurn} turns to save tokens`,
        description: `Across ${inflections.length} conversations, messages started costing 2× more after turn ${medianTurn}. Context accumulation compounds every turn.`,
        action: `Try /clear after ~${medianTurn} turns. Paste a brief summary before clearing so the next message has context.`,
      });
    }
  }

  return insights;
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
  const totalCost = allSessions.reduce((sum, s) => sum + s.cost, 0);

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
    p.cost        += s.cost;
  }

  // Weekly trend
  const byWeekMap = {};
  for (const s of allSessions) {
    if (!s.firstTs) continue;
    const d  = new Date(s.firstTs);
    const wk = isoWeek(d);
    if (!byWeekMap[wk]) {
      byWeekMap[wk] = {
        week: wk, weekStart: d.toISOString().slice(0, 10),
        input: 0, output: 0, cache_write: 0, cache_read: 0,
        sessions: 0, prompts: 0, toolCalls: 0, cost: 0,
      };
    }
    const w = byWeekMap[wk];
    w.sessions++; w.prompts += s.prompts;
    w.input       += s.inputTokens;  w.output      += s.outputTokens;
    w.cache_write += s.cacheWrite;   w.cache_read  += s.cacheRead;
    w.cost        += s.cost;
  }
  for (const t of allToolCalls) {
    if (!t.timestamp) continue;
    const wk = isoWeek(new Date(t.timestamp));
    if (byWeekMap[wk]) byWeekMap[wk].toolCalls++;
  }
  for (const w of Object.values(byWeekMap)) {
    const denom = w.input + w.cache_write + w.cache_read;
    w.cacheHitPct = denom > 0 ? +(w.cache_read / denom * 100).toFixed(1) : 0;
    w.outputRatio = (w.input + w.output) > 0
      ? +(w.output / (w.input + w.output) * 100).toFixed(1) : 0;
  }
  const weeklyTrend = Object.values(byWeekMap).sort((a, b) => a.week.localeCompare(b.week));

  // Daily usage
  const dailyMap = {};
  for (const s of allSessions) {
    if (!s.firstTs) continue;
    const date = s.firstTs.split('T')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { date, input: 0, output: 0, cache_write: 0, cache_read: 0, cost: 0, sessions: 0 };
    }
    const d = dailyMap[date];
    d.sessions++;
    d.input       += s.inputTokens;
    d.output      += s.outputTokens;
    d.cache_write += s.cacheWrite;
    d.cache_read  += s.cacheRead;
    d.cost        += s.cost;
  }
  const dailyUsage = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Model breakdown
  const modelMap = {};
  for (const s of allSessions) {
    for (const q of s.queries) {
      const m = q.model || 'unknown';
      if (m === '<synthetic>' || m === 'unknown') continue;
      if (!modelMap[m]) modelMap[m] = { model: m, cost: 0, inputTokens: 0, outputTokens: 0, queryCount: 0 };
      modelMap[m].cost         += q.cost;
      modelMap[m].inputTokens  += q.inputTokens;
      modelMap[m].outputTokens += q.outputTokens;
      modelMap[m].queryCount   += 1;
    }
  }
  const modelBreakdown = Object.values(modelMap).sort((a, b) => b.cost - a.cost);

  // Tool counts
  const toolCounts = {};
  for (const t of allToolCalls) toolCounts[t.name] = (toolCounts[t.name] || 0) + 1;

  // Top prompts — grouped by user prompt, ranked by cost
  const allPrompts = [];
  for (const s of allSessions) {
    let curPrompt = null, curInput = 0, curOutput = 0, curCacheWrite = 0, curCacheRead = 0, curCost = 0;
    const flush = () => {
      if (curPrompt && (curInput + curOutput) > 0) {
        allPrompts.push({
          prompt: curPrompt,
          promptLen: curPrompt.length,
          inputTokens: curInput, outputTokens: curOutput,
          cacheWrite: curCacheWrite, cacheRead: curCacheRead, cost: curCost,
          date: s.firstTs ? s.firstTs.split('T')[0] : null,
          sessionId: s.id, project: s.project, model: s.model,
        });
      }
    };
    for (const q of s.queries) {
      if (q.userPrompt && q.userPrompt !== curPrompt) {
        flush();
        curPrompt = q.userPrompt;
        curInput = curOutput = curCacheWrite = curCacheRead = curCost = 0;
      }
      curInput      += q.inputTokens;
      curOutput     += q.outputTokens;
      curCacheWrite += q.cacheWrite;
      curCacheRead  += q.cacheRead;
      curCost       += q.cost;
    }
    flush();
  }
  allPrompts.sort((a, b) => b.cost - a.cost);
  const topPrompts = allPrompts.slice(0, 20);

  // Insights
  const totalTokens    = totals.input + totals.output + totals.cache_write + totals.cache_read;
  const totalAllInput  = totals.input + totals.cache_write + totals.cache_read;
  const cacheHitRate   = totalAllInput > 0 ? totals.cache_read / totalAllInput : 0;
  const totalSaved     = (totals.cache_read / 1e6) * (DEFAULT_PRICE.input - DEFAULT_PRICE.cache_read);
  const insightTotals  = {
    totalTokens,
    totalInputTokens:      totals.input,
    totalOutputTokens:     totals.output,
    totalCacheReadTokens:  totals.cache_read,
    totalCost:             totalCost,
    totalSaved,
    cacheHitRate,
  };
  const insights = generateInsights(allSessions, allPrompts, insightTotals);

  // Session list — include stripped queries for drill-down
  const sessionList = allSessions.map(s => ({
    id: s.id, project: s.project, prompts: s.prompts,
    inputTokens: s.inputTokens, outputTokens: s.outputTokens,
    cacheWrite: s.cacheWrite, cacheRead: s.cacheRead,
    toolCalls: s.toolCalls, firstTs: s.firstTs, lastTs: s.lastTs,
    entrypoint: s.entrypoint, cost: s.cost, model: s.model,
    firstPrompt: s.firstPrompt,
    queries: s.queries.map(q => ({
      model: q.model,
      inputTokens: q.inputTokens, outputTokens: q.outputTokens,
      cacheWrite: q.cacheWrite, cacheRead: q.cacheRead,
      cost: q.cost, toolCount: q.tools.length,
      hasPrompt: !!q.userPrompt, timestamp: q.timestamp,
    })),
  })).sort((a, b) => (b.firstTs || '').localeCompare(a.firstTs || ''));

  return {
    generatedAt:  new Date().toISOString(),
    filesScanned: files.length,
    totals, totalCost,
    byProject:     Object.values(byProjectMap).sort((a, b) => b.cost - a.cost),
    weeklyTrend,
    dailyUsage,
    modelBreakdown,
    toolCounts,
    topPrompts,
    insights,
    largeReads:    allLargeReads.slice(0, 50),
    sessions:      sessionList,
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
