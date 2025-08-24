// netlify/functions/generate-kit.js
// Minimal stub so frontend gets a real JSON response

exports.handler = async (event) => {
  // --- CORS preflight ---
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: true,
        kit: {
          idea: body.idea || "Untitled Startup",
          type: body.buildType || "Web App",
          extras: body.extras || {},
          timestamp: new Date().toISOString(),
          msg: "✅ Backend stub is alive and returning JSON",
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: String(err) }),
    };
  }
};