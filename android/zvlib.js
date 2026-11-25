window.zv = (function () {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const vis = sel => [...document.querySelectorAll(sel)].filter(e => e.offsetParent);
  const lab = t => vis('label').find(l => l.innerText.trim().split('\n')[0].trim() === t);
  const labRe = re => vis('label').find(l => re.test(l.innerText.trim()));
  const btn = t => vis('button').find(b => b.innerText.trim() === t);
  const msg = () => ((document.querySelector('main') || document.body).innerText.match(/(Modification enregistrée[^\n]*|[^\n]*erreur[^\n]*)/i) || ['?'])[0].slice(0, 80);
  async function waitFor(fn, n = 40) { for (let i = 0; i < n; i++) { const v = fn(); if (v) return v; await sleep(1000); } return null; }
  async function open(re) {
    const b = await waitFor(() => [...document.querySelectorAll('button')].find(x => re.test(x.getAttribute('aria-label') || '')));
    if (!b) return false; b.click();
    await waitFor(() => vis('label').length || vis('input[type=url],input[type=text]').length, 30); await sleep(1500); return true;
  }
  async function save() { const b = btn('Enregistrer'); if (!b || b.disabled) return 'nosave'; b.click(); await sleep(5000); return msg(); }
  async function back() { history.back(); await waitFor(() => [...document.querySelectorAll('button')].find(x => /Commencer la déclaration|Gérer|Afficher/.test(x.getAttribute('aria-label') || x.innerText)), 30); await sleep(1500); }
  return {
    sleep, lab, btn, save, back, open,
    pending() { return [...document.querySelectorAll('button')].map(x => x.getAttribute('aria-label') || '').filter(t => /^Commencer la déclaration/.test(t)).map(t => t.replace('Commencer la déclaration ', '')); },
    async privacy(url) {
      if (!await open(/confidentialité/)) return 'noopen';
      const i = vis('input').find(x => x.type === 'url' || x.type === 'text'); i.focus(); i.select && i.select(); document.execCommand('insertText', false, url); i.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(800); return 'privacy ' + await save();
    },
    async radio(re, text) { if (!await open(re)) return 'noopen'; const l = text instanceof RegExp ? labRe(text) : lab(text); if (!l) return 'nolabel'; l.click(); await sleep(800); return text + ' ' + await save(); },
    async checkNext(re, textRe) {
      if (!await open(re)) return 'noopen'; const l = labRe(textRe); if (!l) return 'nolabel'; l.click(); await sleep(800);
      const n = btn('Suivant'); if (n) { n.click(); await sleep(4000); } return 'check ' + await save();
    },
    async adid() {
      if (!await open(/Identifiant publicitaire/)) return 'noopen'; lab('Oui').click(); await sleep(1500);
      for (const t of ['Analyse', 'Publicité ou marketing', 'Prévention des fraudes, sécurité et conformité']) { lab(t).click(); await sleep(300); }
      const r = await save(); const pm = btn('Pas maintenant'); if (pm) pm.click(); return 'adid ' + r;
    },
    async rating(email, hasIAP) {
      if (!await open(/Classification du contenu/)) return 'noopen';
      const q = await waitFor(() => vis('button, a').find(x => /Répondre au questionnaire|Démarrer le questionnaire/.test(x.innerText)), 15); if (q) { q.click(); await sleep(6000); }
      const em = vis('input').find(x => x.type === 'email'); if (em && !em.value) { em.focus(); document.execCommand('insertText', false, email); em.dispatchEvent(new Event('input', { bubbles: true })); }
      await sleep(400); const j = vis('label').find(l => l.innerText.trim().startsWith('Jeu')); if (j) j.click(); await sleep(400);
      const acc = labRe(/J'accepte les Conditions/); if (acc) { const c = acc.querySelector('input'); if (!c || !c.checked) acc.click(); }
      await sleep(400); btn('Suivant').click(); await sleep(6000);
      const log = [];
      for (let k = 0; k < 45; k++) {
        const groups = {}; document.querySelectorAll('input[type=radio]').forEach(r => { (groups[r.name] = groups[r.name] || []).push(r); });
        const g = Object.values(groups).find(g => !g.some(r => r.checked)); if (!g) break;
        let el = g[0], qq = ''; for (let i = 0; i < 12 && el; i++) { el = el.parentElement; const t = (el.innerText || '').trim(); if (t.length > 40) { qq = t.split('\n').filter(s => s.length > 15)[0] || t; break; } }
        const labs = g.map(r => r.closest('label') || document.querySelector('label[for="' + r.id + '"]'));
        const purchase = /achat ou la vente de biens numériques/.test(qq) && hasIAP;
        const want = purchase ? /^Oui/ : /^Non/;
        const l = labs.find(l => l && want.test(l.innerText.trim())); (l || g[purchase ? 0 : 1]).click(); await sleep(1200);
        if (purchase) { const d = labRe(/^Achats de biens numériques/); if (d) { d.click(); await sleep(800); } }
        log.push((purchase ? 'Oui ' : 'Non ') + qq.slice(0, 40));
      }
      btn('Enregistrer').click(); await sleep(6000); const s = btn('Suivant'); if (s && !s.disabled) { s.click(); await sleep(8000); }
      const r = await save(); return 'rating ' + log.length + ' q, ' + r;
    },
    async target() {
      if (!await open(/Cible et contenu/)) return 'noopen';
      for (const re of [/^13-15/, /^16-17/, /^18/]) { const l = labRe(re); const c = l && (l.querySelector('input') || document.getElementById(l.getAttribute('for'))); if (l && !(c && c.checked)) { l.click(); await sleep(400); } }
      btn('Suivant').click(); await sleep(6000);
      for (let i = 0; i < 4; i++) { const s = btn('Suivant'); if (!s || s.disabled) break; s.click(); await sleep(5000); }
      return 'target ' + await save();
    },
  };
})();
'zv loaded';
