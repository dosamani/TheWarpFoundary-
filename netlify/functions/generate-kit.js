// netlify/functions/generate-kit.js
// Minimal but real JSON response so the frontend has something to render.

exports.handler = async (event) => {
  // CORS preflight
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

    // Stubbed “founder kit” payload — replace with real generation later
    const kit = {
      idea: body.idea || "Untitled Startup",
      type: body.buildType || "Web App",
      timestamp: new Date().toISOString(),
      scope: [
        "Auth & accounts",
        "Core user flow",
        "Payments (checkout + subscriptions)",
      ],
      pitch: [
        "Problem → founders drown in tools",
        "Solution → investor-ready founder kit",
        "Proof → clickable demo + scope + pitch in hours, not months",
      ],
      brand: {
        name: body.brandName || "WarpFoundary",
        tone: "concise, confident, founder-first",
        colors: ["#5b7cff", "#eaf2ff"],
      },
      nextActions: [
        "Refine one-sentence pitch",
        "Pick 3 hero screens for the demo",
        "Share deck + demo with 3 advisors",
      ],
      msg: "✅ Backend stub is alive and returning structured JSON",
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ok: true, kit }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: String(err) }),
    };
  }
};