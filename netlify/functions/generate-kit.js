// /netlify/functions/generate-kit.js
// Minimal production-safe endpoint your front-end can call now.
// - CORS handled (OPTIONS + response headers)
// - Validates incoming payload
// - Reads env vars (MY_SITE_ID, NETLIFY_AUTH_TOKEN) for future use
// - Returns a JSON shape your UI can render immediately

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
  'Content-Type': 'application/json; charset=utf-8',
};

const ok = (body, extraHeaders = {}) => ({
  statusCode: 200,
  headers: { ...CORS_HEADERS, ...extraHeaders },
  body: JSON.stringify(body, null, 2),
});

const bad = (statusCode, message, detail) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify({ error: message, detail }, null, 2),
});

exports.handler = async (event) => {
  // --- CORS preflight ---
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return bad(405, 'Method Not Allowed', `Use POST for /.netlify/functions/generate-kit`);
  }

  // --- Parse + validate payload ---
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return bad(400, 'Invalid JSON', 'Request body must be valid JSON');
  }

  const idea = (payload.idea || '').toString().trim();
  const buildType = (payload.buildType || 'Web App').toString().trim();
  const llm = (payload.llm || 'smart').toString().trim();
  const features = Array.isArray(payload.features) ? payload.features : [];

  if (!idea) {
    return bad(400, 'Missing required field: idea', 'Provide a non-empty idea string.');
  }

  // --- Env vars (available in Netlify UI > Site settings > Environment variables) ---
  const siteId = process.env.MY_SITE_ID || null;              // you set this
  const netlifyToken = process.env.NETLIFY_AUTH_TOKEN || null; // optional; for future API calls

  // --- Generate lightweight kit (mock) the UI can render today ---
  const receivedAt = new Date().toISOString();

  const markdown = [
    `# WarpFoundary — Founder Kit`,
    ``,
    `*Idea:* ${idea}`,
    `*Build Type:* ${buildType}`,
    ``,
    `## MVP Scope`,
    `- Auth (email / magic link)`,
    `- Core CRUD flow for the main object`,
    `- Public landing page + explainers`,
    `- Admin view (read-only)`,
    ``,
    `## Pitch Outline (Lean)`,
    `- Problem — who hurts today and how`,
    `- Solution — what your product does in one line`,
    `- Why now — timing or tech shift`,
    `- Secret — wedge/insight others miss`,
    `- Go-to-market — first 100 users`,
    `- Business model — how money flows`,
    `- Team — why you ship this`,
    ``,
    `## Brand Kit (Light)`,
    `- Name: (working) A`,
    `- Color: #5b7cff / #eaf2ff (starter palette)`,
    `- Tone: concise, confident, founder-first`,
    `- Tagline: From prompt to product — in warp speed`,
    ``,
    `## Revenue Sketch`,
    `- Pricing idea: Free + Pro ($19–$49/mo) to start`,
    `- Early channels: founder communities, accelerators`,
    `- Unit: 1 generated kit ≈ 1 trial -> 10–20% convert`,
    ``,
    `## TM / Domain Checks (stub)`,
    `- Run quick search for name + obvious variants`,
    `- Check .com/.ai/.app availability`,
    ``,
    `## Stealth Radar (stub)`,
    `- Scan news/funding for adjacent projects`,
    `- Flag overlap and positioning notes`,
    ``,
    `## Next Actions`,
    `- Refine one-sentence pitch`,
    `- Pick 3 hero screens and ship clickable mock`,
    `- Share deck + demo to 3 advisors or an accelerator`,
  ].join('\n');

  const serverKit = {
    idea,
    buildType,
    llm,
    features,
    siteId,         // echoes your env for sanity
    receivedAt,
  };

  // NOTE: This is where you can later:
  // - call OpenAI/Anthropic to generate richer content
  // - hit Netlify or external APIs using netlifyToken
  // - store to KV/DB, email the user, etc.

  return ok({
    ok: true,
    markdown,     // your UI prints this into the "Generated Output" area
    serverKit,    // your UI can show this JSON under "[Server Kit]"
  });
};