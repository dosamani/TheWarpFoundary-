// netlify/functions/generate-kit.js
// Production-safe stub: accepts POST { idea, buildType } and returns a kit + markdown.

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const idea = (body.idea || '').toString().trim();
    const buildType = (body.buildType || 'Web App').toString().trim();

    if (!idea) return json(400, { ok: false, error: 'Missing idea' });

    // --- Stubbed kit (replace later with real LLM pipeline) ---
    const kit = buildStubKit({ idea, buildType });
    const markdown = toMarkdown(kit);
    const filename = slugify(idea || 'founder-kit') + '.md';

    return json(200, { ok: true, kit, markdown, filename });
  } catch (err) {
    return json(500, { ok: false, error: 'Server error' });
  }
};

// Helpers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function json(status, data) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(data),
  };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,80);
}

function buildStubKit({ idea, buildType }) {
  const now = new Date().toISOString().split('T')[0];
  return {
    meta: { idea, buildType, generated: now, version: 'stub-0.1' },
    oneLiner: `${idea} — ${buildType} MVP`,
    problem: `People struggle with ${idea.toLowerCase()} because current options are slow or fragmented.`,
    solution: `An ${buildType} that delivers ${idea.toLowerCase()} with clarity and speed.`,
    mvp: {
      scope: [
        'Auth & profiles',
        'Core job-to-be-done flow',
        'Payments or leads (as applicable)',
        'Basic analytics (events + funnels)'
      ],
      nonGoals: ['Advanced automation', 'Enterprise admin', 'Marketplace ops'],
      heroScreens: ['Landing', 'Core Flow', 'Confirmation/Success']
    },
    demoStory: [
      'Open landing, value prop is crystal clear',
      'Trigger core flow in 1-2 clicks',
      'Show result and next steps (pay, share, or repeat)'
    ],
    pitch: {
      marketWhyNow: 'AI-native founders + cheap infra + investors hungry for velocity.',
      tractionProof: ['Waitlist signups', 'Demo shares', 'Pilot interest']
    },
    brand: { vibe: 'confident, founder-first', primary: '#5b7cff', accent: '#eaf2ff' },
    nextActions: ['Refine one-liner', 'Record 60s demo', 'Send to 3 advisors for feedback']
  };
}

function toMarkdown(kit) {
  return `# Founder Kit

**Idea:** ${kit.meta.idea}  
**Build:** ${kit.meta.buildType}  
**Generated:** ${kit.meta.generated}

## One-liner
${kit.oneLiner}

## Problem
${kit.problem}

## Solution
${kit.solution}

## MVP Scope
- ${kit.mvp.scope.join('\n- ')}

### Non-goals
- ${kit.mvp.nonGoals.join('\n- ')}

## Demo Story
- ${kit.demoStory.join('\n- ')}

## Pitch Notes
- Why now: ${kit.pitch.marketWhyNow}
- Proof: ${kit.pitch.tractionProof.join(', ')}

## Brand
- Vibe: ${kit.brand.vibe}
- Colors: ${kit.brand.primary} / ${kit.brand.accent}

## Next Actions
- ${kit.nextActions.join('\n- ')}
`;
}