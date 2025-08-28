// netlify/functions/generate-kit.js
// Accepts JSON or form-encoded; returns a simple markdown kit stub.

const parseForm = (str = "") =>
  Object.fromEntries(new URLSearchParams(str));

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

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  // --- Parse body (JSON or form) ---
  const ct = (event.headers["content-type"] || "").toLowerCase();
  let payload = {};
  try {
    if (ct.includes("application/json")) {
      payload = JSON.parse(event.body || "{}");
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      payload = parseForm(event.body || "");
    } else {
      // Try JSON, then form as a last resort
      try { payload = JSON.parse(event.body || "{}"); }
      catch { payload = parseForm(event.body || ""); }
    }
  } catch {
    payload = {};
  }

  const idea = (payload.idea || "").toString().trim();
  const buildType = (payload.buildType || "Web App").toString().trim();

  if (!idea) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: "Missing idea" }),
    };
  }

  // --- Generate a simple markdown (stub) ---
  const md = [
    `# Kit for: ${idea}`,
    ``,
    `**Build type:** ${buildType}`,
    ``,
    `## MVP Scope`,
    `- Core user story`,
    `- Acceptance criteria`,
    ``,
    `## Demo Plan`,
    `- 3 clickable screens`,
    ``,
    `## Pitch Outline`,
    `- Problem → Solution → Why now`,
  ].join("\n");

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      ok: true,
      markdown: md,
      filename: `kit-${Date.now()}.md`,
    }),
  };
};