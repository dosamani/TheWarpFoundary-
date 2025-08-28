// netlify/functions/generate-kit.js
// Production-safe stub that returns a realistic “Founder Kit”
// No external deps. Handles CORS + validation.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

exports.handler = async (event) => {
  // --- CORS preflight ---
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed. Use POST.' }),
    };
  }

  // --- Parse payload (JSON or form) ---
  let payload = {};
  try {
    if (event.headers['content-type']?.includes('application/json')) {
      payload = JSON.parse(event.body || '{}');
    } else {
      const params = new URLSearchParams(event.body || '');
      payload = Object.fromEntries(params.entries());
      if (payload.features && typeof payload.features === 'string') {
        try { payload.features = JSON.parse(payload.features); } catch {}
      }
    }
  } catch (e) {
    return badRequest('Invalid JSON payload');
  }

  const idea = (payload.idea || '').toString().trim();
  const buildType = (payload.buildType || '').toString().trim() || 'Web App';
  const llm = (payload.llm || 'smart').toString().trim();
  const features = Array.isArray(payload.features) ? payload.features : [];

  if (!idea) return badRequest('Missing required field: "idea"');

  // --- Enrichment helpers (no deps) ---
  const nowIso = new Date().toISOString();

  const palettes = [
    { name: 'Indigo Frost', primary: '#5b7cff', surface: '#0b0b12', tint: '#eaf2ff' },
    { name: 'Electric Violet', primary: '#7c4dff', surface: '#0b0b12', tint: '#efeaff' },
    { name: 'Mint Night', primary: '#3ddc97', surface: '#0b0b12', tint: '#e7fff3' },
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];

  const normalizedWords = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const interesting = normalizedWords.filter(w => w.length > 3).slice(0, 3);
  const prefixes = ['Nova', 'Prime', 'Spark', 'Warp', 'Meta', 'Hyper', 'Pilot', 'Velo'];
  const suffixes = ['Forge', 'Kit', 'Foundry', 'Lab', 'Stack', 'Hub', 'Mint', 'Flow'];

  function titleCase(s) { return s.replace(/\b\w/g, c => c.toUpperCase()); }

  const nameCandidates = [
    `${prefixes[rand(prefixes.length)]}${suffixes[rand(suffixes.length)]}`,
    `${titleCase(interesting[0] || 'Warp')}${suffixes[rand(suffixes.length)]}`,
    `${prefixes[rand(prefixes.length)]}${titleCase(interesting[1] || 'Kit')}`,
  ].filter(Boolean);

  const name = nameCandidates[0];

  function rand(n) { return Math.floor(Math.random() * n); }

  // MVP scope by build type
  const scopes = {
    'Web App': [
      'Auth (email / magic link)',
      'Core CRUD for the main object',
      'Public landing page',
      'Admin view (read-only)',
    ],
    'Mobile App': [
      'Onboarding + auth',
      'Offline-friendly data store',
      'Push notifications',
      'Simple settings screen',
    ],
    'API Service': [
      'Key-based auth',
      'Rate limiting & logging',
      'OpenAPI spec',
      'Example client (JS)',
    ],
    'Internal Tool': [
      'Single-sign-on (SSO)',
      'Data grid + filters',
      'Audit trail',
      'Admin overrides',
    ],
  };
  const mvpScope = scopes[buildType] || scopes['Web App'];

  const pitchOutline = [
    'Problem — who hurts today and how',
    'Solution — what your product does in one line',
    'Why now — timing or tech shift',
    'Secret — wedge/insight others miss',
    'Go-to-market — first 100 users',
    'Business model — how money flows',
    'Team — why you ship this',
  ];

  const revenueSketch = {
    pricing: 'Free + Pro ($19–$49/mo) to start',
    channels: 'Founder communities, accelerators',
    unit: '1 generated kit ≈ 1 trial → 10–20% convert',
  };

  const tmDomain = [
    'Run quick search for name + obvious variants',
    'Check .com/.ai/.app availability',
  ];

  const stealthRadar = [
    'Scan Product Hunt, GitHub, YC/accelerator blogs',
    'Flag overlap + positioning notes',
  ];

  const nextActions = [
    'Refine one-sentence pitch',
    'Pick 3 hero screens and ship clickable mock',
    'Share deck + demo to 3 advisors or an accelerator',
  ];

  const tagline = 'From prompt to product — in warp speed';

  // Build Markdown
  const md = [
    `# ${name} — Founder Kit (server-enriched)`,
    ``,
    `*Idea:* ${idea}`,
    `*Build Type:* ${buildType}`,
    ``,
    `## MVP Scope`,
    ...mvpScope.map(i => `- ${i}`),
    ``,
    `## Pitch Outline (Lean)`,
    ...pitchOutline.map(i => `- ${i}`),
    ``,
    `## Brand Kit (Light)`,
    `- Name: (working) ${name}`,
    `- Palette: ${palette.name} (${palette.primary} / ${palette.tint})`,
    `- Tone: concise, confident, founder-first`,
    `- Tagline: ${tagline}`,
    ``,
    `## Revenue Sketch`,
    `- Pricing: ${revenueSketch.pricing}`,
    `- Channels: ${revenueSketch.channels}`,
    `- Unit: ${revenueSketch.unit}`,
    ``,
    `## TM / Domain Checks (stub)`,
    ...tmDomain.map(i => `- ${i}`),
    ``,
    `## Stealth Radar (stub)`,
    ...stealthRadar.map(i => `- ${i}`),
    ``,
    `## Next Actions`,
    ...nextActions.map(i => `- ${i}`),
    ``,
    `> Generated at ${nowIso} · llm: ${llm}`,
  ].join('\n');

  const body = {
    ok: true,
    idea,
    buildType,
    llm,
    features,
    name,
    nameCandidates,
    palette,
    receivedAt: nowIso,
    kitMarkdown: md,
  };

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
};

// --- helpers ---
function badRequest(msg) {
  return {
    statusCode: 400,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ ok: false, error: msg }),
  };
}