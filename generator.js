// generator.js — pretty output + sample idea + remember last idea + loading bar + Netlify Form submit
(function () {
  const FN_URL = '/.netlify/functions/generate-kit';
  const LS_KEY = 'wf:lastIdea';

  // ---- Inject minimal CSS (loading bar + tidy output) ----
  (function injectCSS() {
    const css = `
      #wfTopLoader{position:fixed;left:0;top:0;width:100%;height:3px;background:transparent;z-index:9999;overflow:hidden;display:none}
      #wfTopLoader::before{content:"";position:absolute;left:-30%;top:0;height:100%;width:30%;background:linear-gradient(90deg,#6ea8ff,#a78bfa);animation:wfSlide 1s infinite}
      @keyframes wfSlide{0%{left:-30%}50%{left:60%}100%{left:100%}}
      #generated-output h1,#generated-output h2,#generated-output h3{margin:.6rem 0 .35rem}
      #generated-output ul{margin:.25rem 0 .5rem .95rem}
      #generated-output p{margin:.35rem 0}
      .wf-actions{display:flex;gap:10px;margin:.6rem 0 0}
      .wf-btn{padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:transparent;color:inherit;cursor:pointer}
      .wf-small{opacity:.7;font-size:.9em}
      .wf-sample{display:inline-block;margin:.35rem 0 .15rem;opacity:.8;cursor:pointer;text-decoration:underline}
    `;
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
    const bar = document.createElement('div');
    bar.id = 'wfTopLoader';
    document.body.appendChild(bar);
  })();

  // ---- tiny helpers ----
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const loaderEl = () => $('#wfTopLoader');
  const showLoader = on => { const l = loaderEl(); if (l) l.style.display = on ? 'block' : 'none'; };

  // ---- Output mount ----
  let out = $('#generated-output') || (function createOut(){
    const el = document.createElement('section');
    el.id = 'generated-output';
    el.style.marginTop = '1.25rem';
    const h = document.createElement('h2');
    h.textContent = 'Generated Output';
    el.appendChild(h);
    const body = document.createElement('div');
    body.className = 'kit-body';
    el.appendChild(body);
    (document.querySelector('main') || document.body).appendChild(el);
    return el;
  })();
  const outBody = $('.kit-body', out) || out;

  // Actions row
  const actions = document.createElement('div');
  actions.className = 'wf-actions';
  const copyBtn = button('Copy', onCopy);
  const dlBtn = button('Download .txt', onDownload);
  actions.append(copyBtn, dlBtn);
  out.appendChild(actions);

  function button(label, handler){
    const b = document.createElement('button');
    b.type='button';
    b.className='wf-btn';
    b.textContent = label;
    b.addEventListener('click', handler);
    return b;
  }

  // ---- lightweight Markdown -> HTML ----
  function mdToHtml(md) {
    md = md.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    md = md
      .replace(/^######\s*(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#####\s*(.+)$/gm, '<h5>$1</h5>')
      .replace(/^####\s*(.+)$/gm, '<h4>$1</h4>')
      .replace(/^###\s*(.+)$/gm, '<h3>$1</h3>')
      .replace(/^##\s*(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#\s*(.+)$/gm, '<h1>$1</h1>');
    md = md.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>').replace(/(<li>[\s\S]+?<\/li>)(?!(\s*<li>))/g, '<ul>$1</ul>');
    md = md.split(/\n{2,}/).map(b => (/^<(h\d|ul|li)/.test(b) ? b : `<p>${b.replace(/\n/g,'<br>')}</p>`)).join('\n');
    return md;
  }
  function setOutput(md, meta){
    outBody.innerHTML = mdToHtml(md) + (meta? `<p class="wf-small">${meta}</p>`:'');
    lastMarkdown = md;
  }

  // ---- Form wiring ----
  const ideaEl = $('[name="idea"]') || $('#idea') || $('textarea') || $('input[type="text"]');
  const buildEl = $('[name="buildType"]') || $('#buildType');
  const llmEl   = $('[name="llm"]') || $('#llm');
  const featureEls = $$('input[name="features[]"], input[data-feature]');

  // Sample idea helper
  if (ideaEl && !$('#wfSampleIdea')) {
    const sample = document.createElement('a');
    sample.id = 'wfSampleIdea';
    sample.className = 'wf-sample';
    sample.textContent = 'Use sample idea';
    sample.addEventListener('click', (e)=>{
      e.preventDefault();
      ideaEl.value = 'A personal finance copilot that auto-reads your bank/card statements and creates a weekly “do this next” plan.';
      ideaEl.dispatchEvent(new Event('input'));
      localStorage.setItem(LS_KEY, ideaEl.value);
    });
    ideaEl.insertAdjacentElement('afterend', sample);
  }

  // Restore last idea
  try { const saved = localStorage.getItem(LS_KEY); if (saved && ideaEl && !ideaEl.value.trim()) ideaEl.value = saved; } catch{}

  // Find the Generate button by id OR by text
  const genBtn = $('#generateBtn') || $$('button').find(b => /generate\s+startup/i.test(b.textContent||''));

  if (genBtn && ideaEl) {
    genBtn.addEventListener('click', async (e)=>{
      e.preventDefault();
      const idea = (ideaEl.value || '').trim();
      if (!idea) return toast('Please enter your idea.');

      // persist idea
      try { localStorage.setItem(LS_KEY, idea); } catch {}

      const payload = {
        idea,
        buildType: (buildEl && buildEl.value) || 'Web App',
        llm: (llmEl && llmEl.value) || 'smart',
        features: featureEls.filter(f=>f.checked).map(f=> f.value || f.getAttribute('data-feature')),
      };

      lock(genBtn,true); showLoader(true);
      try {
        const res = await fetch(FN_URL, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=> ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || `Server error (${res.status})`);

        const md = data.kitMarkdown || fallbackMd(payload);
        const meta = `Generated at ${data.receivedAt || new Date().toISOString()} · name: ${data.name || '—'} · palette: ${data.palette?.name || '—'}`;
        setOutput(md, meta);

        // --- NEW: submit to Netlify Forms (stored + can email you) ---
        await submitToNetlify({
          idea: payload.idea,
          buildType: payload.buildType,
          llm: payload.llm,
          features: payload.features.join(', '),
          kitMarkdown: md,
          receivedAt: data.receivedAt || new Date().toISOString()
        });

        toast('Kit generated 🚀');
      } catch(err){
        console.error(err);
        setOutput(
          `# WarpFoundary — Founder Kit (offline)\n\n*Idea:* ${payload.idea}\n\n> Sorry, we couldn’t reach the backend.\n> ${err.message || 'Unknown error.'}`,
          ''
        );
        // still log locally so you don't lose ideas
        await submitToNetlify({
          idea: payload.idea,
          buildType: payload.buildType,
          llm: payload.llm,
          features: payload.features.join(', '),
          kitMarkdown: '(offline fallback)',
          receivedAt: new Date().toISOString()
        }).catch(()=>{});
        toast('Failed to reach backend', true);
      } finally {
        lock(genBtn,false); showLoader(false);
      }
    });
  } else {
    console.warn('[generator] Missing button or idea input');
  }

  // ---- Fallback MD ----
  function fallbackMd(p){
    return [
      `# WarpFoundary — Founder Kit`,
      ``,
      `*Idea:* ${p.idea}`,
      `*Build Type:* ${p.buildType}`,
      ``,
      `## MVP Scope`,
      `- Auth (email / magic link)`,
      `- Core CRUD for the main object`,
      `- Public landing page`,
      `- Admin view (read-only)`,
      ``,
      `## Next Actions`,
      `- Refine one-sentence pitch`,
      `- Pick 3 hero screens and ship clickable mock`,
      `- Share deck + demo to 3 advisors or an accelerator`,
    ].join('\n');
  }

  // ---- Netlify Forms submit ----
  async function submitToNetlify(fields){
    const formName = 'kit-log';
    // Netlify picks up the form because it exists in HTML; here we post programmatically
    const body = new URLSearchParams({ 'form-name': formName, ...fields }).toString();
    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
  }

  // ---- UX bits ----
  let lastMarkdown = '';
  function onCopy(){
    if (!lastMarkdown) return toast('Nothing to copy yet');
    navigator.clipboard.writeText(lastMarkdown).then(()=> toast('Copied'));
  }
  function onDownload(){
    if (!lastMarkdown) return toast('Nothing to download yet');
    const blob = new Blob([lastMarkdown], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href:url, download:'founder-kit.txt' });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function lock(btn,on){
    if (!btn) return;
    btn.disabled = on; btn.style.opacity = on?'.6':'1'; btn.style.pointerEvents = on?'none':'auto';
    if (on){ btn.dataset._label = btn.textContent; btn.textContent = 'Generating…'; }
    else if (btn.dataset._label){ btn.textContent = btn.dataset._label; delete btn.dataset._label; }
  }
  function toast(msg,isErr){
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style,{
      position:'fixed',left:'50%',bottom:'22px',transform:'translateX(-50%)',
      background: isErr?'rgba(255,60,60,.15)':'rgba(60,160,255,.15)',
      border:'1px solid rgba(255,255,255,.15)',padding:'8px 12px',borderRadius:'10px',
      backdropFilter:'blur(4px)',zIndex:9999
    });
    document.body.appendChild(t); setTimeout(()=> t.remove(),2000);
  }
})();