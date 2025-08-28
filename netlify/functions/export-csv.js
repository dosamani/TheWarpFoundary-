// netlify/functions/export-csv.js
// Exports Netlify Form "kit-log" submissions to CSV
// Requires env vars in Netlify UI: NETLIFY_AUTH_TOKEN and SITE_ID

export default async (req) => {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const siteId = process.env.SITE_ID;
  const FORM_NAME = 'kit-log';

  if (!token || !siteId) {
    return new Response(
      'Missing NETLIFY_AUTH_TOKEN or SITE_ID env vars in Netlify > Site settings > Build & deploy > Environment.',
      { status: 500 }
    );
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 1) find the form by name
  const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, { headers });
  if (!formsRes.ok) return new Response('Failed to fetch forms from Netlify API.', { status: 502 });
  const forms = await formsRes.json();
  const form = forms.find(f => (f.name || '').toLowerCase() === FORM_NAME);
  if (!form) return new Response(`Form "${FORM_NAME}" not found. Submit the hidden form at least once.`, { status: 404 });

  // 2) pull submissions
  const subsRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions`, { headers });
  if (!subsRes.ok) return new Response('Failed to fetch submissions from Netlify API.', { status: 502 });
  const subs = await subsRes.json();

  // 3) build CSV
  const cols = [
    'id', 'created_at', 'idea', 'buildType', 'llm', 'features', 'receivedAt',
    'email', 'ip', 'user_agent'
  ];
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const rows = [cols.join(',')];
  for (const s of subs) {
    const d = s.data || {};
    rows.push([
      s.id,
      s.created_at,
      d.idea,
      d.buildType,
      d.llm,
      d.features,
      d.receivedAt,
      d.email,
      s.ip || '',
      s.user_agent || ''
    ].map(esc).join(','));
  }

  const csv = rows.join('\n');
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="kit-log.csv"'
    }
  });
}