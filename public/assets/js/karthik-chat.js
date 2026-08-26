(function(){
  // Client-side chatbot "karthik" that builds knowledge by scraping site pages at runtime
  const data = {
    name: 'Karthikeya Rangala',
    greeting: "Hey — I'm karthik. What do you want to know about me?",
    bio: 'Final-year B.Tech student at Amrita Vishwa Vidyapetam (AI branch). I build deep learning and machine learning models and enjoy developing practical AI solutions.',
    email: 'karthikeya.rangala@gmail.com',
    linkedin: 'https://www.linkedin.com/in/r-karthikeya-7a4520354',
    github: 'https://github.com/purpulecloud',
    projects: [],
    certifications: [],
    education: []
  };

  function createEl(tag, attrs, text){
    const e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k=>e.setAttribute(k, attrs[k]));
    if (text) e.innerText = text;
    return e;
  }

  // Inject styles (bot: dark brown, user: light brown)
  const style = createEl('style');
  style.innerHTML = `
  #karthik-chat-btn{position:fixed;right:18px;bottom:18px;background:#3b2f2b;color:#fff;border-radius:22px;padding:8px 12px;cursor:pointer;z-index:9999;border:none;font-weight:700}
  #karthik-chat-panel{position:fixed;right:18px;bottom:70px;width:340px;max-height:70vh;background:transparent;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.35);overflow:hidden;display:none;flex-direction:column;z-index:9999}
  #karthik-chat-topbox{background:#2f2b28;color:#f7f1ea;padding:10px 12px;border-top-left-radius:8px;border-top-right-radius:8px;font-weight:700}
  #karthik-chat-header{background:#4b2e2b;color:#f7f1ea;padding:8px 12px;font-weight:600}
  #karthik-chat-content{padding:12px;overflow:auto;height:300px;font-size:14px;background:#fff}
  #karthik-chat-input{display:flex;border-top:1px solid #eee;background:#f7f3ee}
  #karthik-chat-input input{flex:1;padding:10px;border:0;background:transparent}
  #karthik-chat-input button{background:#3b2f2b;color:#f7f1ea;border:0;padding:8px 12px;margin:8px;border-radius:4px}
  .k-msg{margin:10px 0;max-width:85%}
  .k-msg.bot{background:#4b2e2b;color:#f7f1ea;padding:10px;border-radius:10px 10px 10px 2px}
  .k-msg.user{margin-left:auto;background:#e8d6c1;color:#2b1f1a;padding:10px;border-radius:10px 10px 2px 10px}
  .k-msg strong{font-weight:700}
  .k-link{color:#0b66c3}
  .k-small{font-size:12px;color:#666;margin-top:4px}
  `;
  document.head.appendChild(style);

  // Create UI
  const btn = createEl('button',{id:'karthik-chat-btn'},'karthik');
  const panel = createEl('div',{id:'karthik-chat-panel'});
  const topbox = createEl('div',{id:'karthik-chat-topbox'},'Ask me anything');
  const header = createEl('div',{id:'karthik-chat-header'},"Hey, I'm karthik — ask me about this portfolio");
  const content = createEl('div',{id:'karthik-chat-content'});
  const inputWrap = createEl('div',{id:'karthik-chat-input'});
  const input = createEl('input',{type:'text',placeholder:'Ask about projects, links, education, or certifications...'});
  const send = createEl('button',null,'Send');

  inputWrap.appendChild(input); inputWrap.appendChild(send);
  panel.appendChild(topbox); panel.appendChild(header); panel.appendChild(content); panel.appendChild(inputWrap);
  document.body.appendChild(panel); document.body.appendChild(btn);

  function appendMessage(text, who='bot'){
    const m = createEl('div',{class: 'k-msg ' + (who==='bot'? 'bot' : 'user')});
    if(who==='bot'){
      m.innerHTML = text;
    } else {
      m.innerText = text;
    }
    content.appendChild(m);
    content.scrollTop = content.scrollHeight;
  }

  function formatLink(url, label){
    return `<a class="k-link" href="${url}" target="_blank">${label || url}</a>`;
  }

  // Parse a fetched HTML string and extract simple structured data
  function parsePage(htmlText, href){
    try{
      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const titleEl = doc.querySelector('h1#content') || doc.querySelector('h1') || doc.querySelector('title');
      const title = titleEl ? titleEl.innerText.trim() : href;
      const paragraphs = Array.from(doc.querySelectorAll('.content p')).map(p=>p.innerText.trim()).filter(Boolean);

      const parsed = { href, title, paragraphs };

      // specific extraction: certifications
      const certs = [];
      const certItems = doc.querySelectorAll('.cert-list li, .cert-item');
      if(certItems && certItems.length){
        certItems.forEach(li=>{
          const h = li.querySelector('h3');
          const a = li.querySelector('a[href]');
          const txt = h? h.innerText.trim() : (li.innerText||'').split('\n')[0];
          if(txt) certs.push({ title: txt, verify: a? a.href : null, raw: li.innerText.trim() });
        });
        parsed.certifications = certs;
      }

      // specific extraction: education
      const edus = [];
      const eduItems = doc.querySelectorAll('.edu-list li, .edu-item');
      if(eduItems && eduItems.length){
        eduItems.forEach(li=>{
          const h = li.querySelector('h3');
          const small = li.querySelector('small');
          const p = li.querySelector('p');
          edus.push({ school: h? h.innerText.trim() : (li.innerText||'').split('\n')[0], level: small? small.innerText.trim() : '', note: p? p.innerText.trim() : '' });
        });
        parsed.education = edus;
      }

      // specific extraction: projects
      const projs = [];
      const projItems = doc.querySelectorAll('.project-list li, .project, li.project');
      if(projItems && projItems.length){
        projItems.forEach(li=>{
          const h = li.querySelector('h3');
          const desc = li.querySelector('p');
          const link = li.querySelector('a[href]');
          projs.push({ title: h? h.innerText.trim() : (li.innerText||'').split('\n')[0], desc: desc? desc.innerText.trim() : '', url: link? link.href : null });
        });
        parsed.projects = projs;
      }

      return parsed;
    }catch(e){ return { href, title: href, error: e.message }; }
  }

  async function buildIndexFromSite(){
    // Use an explicit list of pages to fetch (ensure trailing slashes for index.html)
    const pages = ['/', '/about/', '/work/', '/certifications/', '/education/'];
    const results = [];
    for(const href of pages){
      try{
        const res = await fetch(href, {cache:'no-store'});
        if(!res || !res.ok) { continue; }
        const txt = await res.text();
        const parsed = parsePage(txt, href);
        results.push(parsed);
      }catch(e){ /* ignore fetch errors */ }
    }

    // merge parsed data into data object (accumulate, dedupe by title)
    const certMap = new Map();
    const projMap = new Map();
    const eduMap = new Map();

    results.forEach(p=>{
      if(p.certifications && p.certifications.length){
        p.certifications.forEach(c=>{
          const key = (c.title||'').trim().toLowerCase();
          if(!certMap.has(key)) certMap.set(key, { title: c.title, verify: c.verify, raw: c.raw });
        });
      }
      if(p.projects && p.projects.length){
        p.projects.forEach(pr=>{
          const key = (pr.title||'').trim().toLowerCase();
          if(!projMap.has(key)) projMap.set(key, { title: pr.title, desc: pr.desc, url: pr.url });
        });
      }
      if(p.education && p.education.length){
        p.education.forEach(ed=>{
          const key = (ed.school||ed.level||'').trim().toLowerCase();
          if(!eduMap.has(key)) eduMap.set(key, { level: ed.level, school: ed.school, note: ed.note, year: ed.year });
        });
      }
    });

    data.certifications = Array.from(certMap.values());
    data.projects = Array.from(projMap.values());
    data.education = Array.from(eduMap.values());

    // final fallback
    if(!data.projects.length) data.projects = [{title:'No projects found', desc:'No project info parsed yet', url:window.location.href}];

    // debug/notify
    const pagesIndexed = results.map(r=>r.href).join(', ');
    appendMessage(`<em>Indexed pages: ${pagesIndexed}</em>`,'bot');
  }

  function findEdu(re){
    return data.education.find(e => {
      const lvl = (e.level||'').toLowerCase();
      const school = (e.school||'').toLowerCase();
      return re.test(lvl) || re.test(school);
    });
  }

  function answer(qRaw){
    const q = (qRaw||'').toLowerCase();
    if(!q) return "Say something like: 'Tell me about your projects' or 'Where did you study class 10'";

    if(/\b(name|who are you|who)\b/.test(q)) return `I'm ${data.name}. ${data.greeting}`;
    if(/\b(bio|about|describe)\b/.test(q)) return data.bio;
    if(/\b(email|contact)\b/.test(q)) return `Email: ${formatLink('mailto:'+data.email, data.email)}`;
    if(q.indexOf('linkedin')!==-1) return formatLink(data.linkedin,'LinkedIn');
    if(q.indexOf('github')!==-1) return formatLink(data.github,'GitHub');

    if(/\b(projects|work|project)\b/.test(q)){
      return '<ul>' + data.projects.map(p=>`<li><strong>${p.title}</strong> — ${p.desc} ${p.url? formatLink(p.url,'repo') : ''}</li>`).join('') + '</ul>';
    }

    if(/\b(cert|certificate|certification)\b/.test(q)){
      if(!data.certifications.length) return 'No certifications found on the site.';
      return '<ul>' + data.certifications.map(c=>`<li><strong>${c.title}</strong> — ${c.verify? formatLink(c.verify,'verify') : c.raw || ''}</li>`).join('') + '</ul>';
    }

    // education queries
    if(/\b(10th|class\s*10|tenth|class\s*x|xth)\b/i.test(qRaw)){
      const item = findEdu(/\bclass\s*x\b/i) || findEdu(/\bclass\s*10\b/i) || data.education[data.education.length-1];
      return item? `${item.school} — ${item.level} (${item.year || ''}). ${item.note || ''}` : 'Education info not available.';
    }

    if(/\b(12th|class\s*12|twelfth|class\s*xii|xiith)\b/i.test(qRaw)){
      const item = findEdu(/\bclass\s*xii\b/i) || findEdu(/\bclass\s*12\b/i) || data.education[1];
      return item? `${item.school} — ${item.level} (${item.year || ''}). ${item.note || ''}` : 'Education info not available.';
    }

    if(/\b(btech|b\.tech|degree|college)\b/i.test(qRaw)){
      const item = findEdu(/\bb\.?tech\b/i) || data.education[0];
      return item? `${item.school} — ${item.course || item.level} (${item.year || ''}). ${item.note || ''}` : 'Education info not available.';
    }

    // direct link requests
    const linkMatch = qRaw.match(/link to (.+)|show link for (.+)|link for (.+)/i);
    if(linkMatch){
      const term = (linkMatch[1]||linkMatch[2]||linkMatch[3]||'').trim().toLowerCase();
      if(term){
        for(const p of data.projects) if(p.title.toLowerCase().includes(term)) return formatLink(p.url,'project link');
        for(const c of data.certifications) if(c.title.toLowerCase().includes(term)) return formatLink(c.verify || '#','certificate link');
        if(term.includes('linkedin')) return formatLink(data.linkedin,'LinkedIn');
        if(term.includes('github')) return formatLink(data.github,'GitHub');
      }
    }

    // fuzzy search across titles and schools
    for(const p of data.projects) if(q.includes(p.title.toLowerCase().split(' ')[0])) return `<strong>${p.title}</strong>: ${p.desc} ${p.url? formatLink(p.url,'repo') : ''}`;
    for(const c of data.certifications) if(q.includes(c.title.toLowerCase().split(' ')[0])) return `<strong>${c.title}</strong> — ${c.verify? formatLink(c.verify,'verify'): c.raw || ''}`;
    for(const e of data.education) if(q.includes((e.school||'').toLowerCase().split(' ')[0])) return `${e.school} — ${e.level} (${e.year || ''})`;

    return "Sorry — I don't know that yet. Try: 'projects', 'certifications', 'email', 'github', 'linkedin', or ask about education (10th/12th/B.Tech).";
  }

  // initial greeting and dynamic indexing
  btn.addEventListener('click', async ()=>{
    panel.style.display = panel.style.display==='flex' ? 'none' : 'flex';
    if(panel.style.display==='flex'){
      content.innerHTML = '';
      appendMessage(`<strong>${data.greeting}</strong>`,'bot');
      // build knowledge from site pages (non-blocking)
      try{ await buildIndexFromSite(); } catch(e){ appendMessage('<em>Failed to index site pages: '+e.message+'</em>','bot'); }
    }
  });

  function sendMsg(){
    const text = input.value.trim();
    if(!text) return;
    appendMessage(text,'user');
    const res = answer(text);
    setTimeout(()=> appendMessage(res,'bot'), 250);
    input.value = '';
    input.focus();
  }

  send.addEventListener('click', sendMsg);
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendMsg(); });

  // start indexing in background once widget loads (optional)
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(()=>{ buildIndexFromSite().catch(()=>{}); }, 800);
  } else {
    window.addEventListener('DOMContentLoaded', ()=> setTimeout(()=>{ buildIndexFromSite().catch(()=>{}); }, 800));
  }

})();
