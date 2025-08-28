// netlify/functions/generate-kit.js
// Minimal production-safe stub so your front-end can call a REAL endpoint now.

exports.handler = async (event) => {
  // --- CORS preflight ---
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: false, message: 'Method Not Allowed' }),
    };
  }

  try {
    const { idea, buildType, llm, features } = JSON.parse(event.body || '{}');

    if (!idea || !buildType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ok: false,
          message: 'Missing required fields: idea and/or buildType',
        }),
      };
    }

    // Stubbed response — echoes payload so you can verify round-trip
    const kit = {
      idea,
      buildType,
      llm: llm || 'smart',
      features: Array.isArray(features) ? features : [],
      receivedAt: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ok: true,
        message: 'Backend reachable',
        kit,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ok: false,
        message: 'Server error',
        error: String(err && err.message ? err.message : err),
      }),
    };
  }
};