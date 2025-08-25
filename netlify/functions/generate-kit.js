// netlify/functions/generate-kit.js
// Returns a structured "founder kit" + ready-to-save Markdown export.
// CORS + OPTIONS handled. Safe to use in production as a stub.

exports.handler = async (event) => {
  // --- CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: cors(),
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...cors(), "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  try {
    const { idea = "", buildType = "Web App", extras = {} } = JSON.parse(event.body || "{}");
    const now = new Date().toISOString();

    // --- Basic templating ---
    const cleanIdea = idea.trim();
    const nameSeed = (cleanIdea.split(/\s+/)[0] || "Nova");
    const brandName = `${nameSeed} Forge`;

    const scope =
      buildType === "API"
        ? [
            "Auth with API keys",
            "Core resource endpoints (CRUD)",
            "Rate limiting + request logging",
            "Docs (OpenAPI + examples)",
          ]
        : buildType === "Mobile App"
        ? [
            "Onboarding + permissions",
            "Core flow (3–5 screens)",
            "Offline-friendly lists",
            "Share sheet / deep links",
          ]
        : [
            "Auth (email/magic link)",
            "Core CRUD flow for primary object",
            "Public landing page + explainers",
            "Basic analytics & admin (read-only)",
          ];

    const pitchOutline = [
      "Problem — who hurts today and how",
      "Solution — what your product does in one line",
      "Why now — timing or tech shift",
      "Wedge — insight others miss",
      "Go-To-Market — first 100 users",
      "Business model — how money flows",
      "Team — why you ship this",
    ];

    const brandStarter = {
      name: brandName,
      tagline: "From prompt to product — in warp speed",
      palette: ["#5b7cff", "#eaf2ff", "#0b0b12"],