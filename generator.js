const $ = (id)=>document.getElementById(id);
const out = document.getElementById('out');
document.getElementById('go').addEventListener('click', async ()=>{
  const payload = {
    idea: $('idea').value.trim(),
    buildType: $('buildType').value,
    llm: $('llm').value,
    features: { revenue: $('rev').checked, tm: $('tm').checked, radar: $('radar').checked }
  };
  out.textContent = 'Generating…';
  try {
    const res = await fetch('/.netlify/functions/generate', {
      method:'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    try { out.textContent = JSON.stringify(JSON.parse(txt), null, 2); }
    catch { out.textContent = txt; }
  } catch (err) {
    out.textContent = 'Error: ' + err.message;
  }
});
