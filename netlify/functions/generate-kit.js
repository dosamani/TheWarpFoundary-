// netlify/functions/generate-kit.js
exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' },
      body: 'Method Not Allowed'
    };
  }

  try {
    const raw = event.body || '';
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Bad JSON body', raw })
      };
    }

    const response = {
      idea: data.idea || '(missing idea)',
      buildType: data.buildType || '(missing buildType)',
      llm: data.llm || 'smart',
      features: Array.isArray(data.features) ? data.features : [],
      receivedAt: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(response, null, 2)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server crashed', details: String(err && err.message || err) })
    };
  }
};