'use strict';
(() => {
  const BATCH = 'R001', SCHEMA = 'relieve-call-list', VERSION = 1, STORAGE_KEY = 'relieve.calls.R001.v1';
  const prospects = JSON.parse(document.getElementById('prospect-data').textContent);
  const ids = new Set(prospects.map(p => p.prospect_id));
  const state = Object.fromEntries(prospects.map(p => [p.prospect_id, { contactName: '', called: false, notes: '' }]));
  const list = document.getElementById('list'), search = document.getElementById('search'), uncalled = document.getElementById('uncalled');
  const status = document.getElementById('storage-status'), importStatus = document.getElementById('import-status');
  let storageAvailable = true;
  function setStatus(message, warning = false) { status.textContent = message; status.classList.toggle('warning', warning); }
  function validBackup(data) {
    if (!data || typeof data !== 'object' || data.schema !== SCHEMA || data.version !== VERSION || data.batch !== BATCH || !Array.isArray(data.records) || data.records.length !== prospects.length) throw new Error('Choose a backup for this 100-business call list.');
    const seen = new Set();
    for (const r of data.records) {
      if (!r || !ids.has(r.id) || seen.has(r.id) || typeof r.contactName !== 'string' || r.contactName.length > 200 || typeof r.called !== 'boolean' || typeof r.notes !== 'string' || r.notes.length > 3000) throw new Error('This backup has missing, duplicate, or invalid records. Nothing was changed.');
      seen.add(r.id);
    }
    return data.records;
  }
  function apply(records) { for (const r of records) state[r.id] = { contactName: r.contactName, called: r.called, notes: r.notes }; }
  function payload() { return { schema: SCHEMA, version: VERSION, batch: BATCH, savedAt: new Date().toISOString(), records: prospects.map(p => ({ id: p.prospect_id, businessName: p.business_name, ...state[p.prospect_id] })) }; }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { apply(validBackup(JSON.parse(stored))); setStatus('Saved notes loaded from this browser.'); }
  } catch (e) { storageAvailable = false; setStatus('Browser storage could not be read. Keep a backup; changes stay in this tab.', true); }
  function save() {
    if (!storageAvailable) { setStatus('Changes are only in this open tab. Download a backup to keep them.', true); return; }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload())); setStatus('Saved in this browser.'); }
    catch (e) { storageAvailable = false; setStatus('Browser storage is unavailable. Download a backup before closing this tab.', true); }
  }
  const make = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
  function safeURL(raw) { try { const u = new URL(raw); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null; } catch { return null; } }
  function sourceLink(raw, label) { const url = safeURL(raw); if (!url) return null; const a = make('a', '', label); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
  function counts() {
    const total = prospects.filter(p => state[p.prospect_id].called).length;
    const count = document.getElementById('count'); count.replaceChildren(document.createTextNode(total + ' '), make('span', '', 'of 100 called'));
    document.getElementById('progress').value = total;
  }
  function field(label, type, id, value, placeholder, maxLength, onChange) {
    const wrapper = make('label', 'field', label), input = make(type === 'textarea' ? 'textarea' : 'input');
    input.id = id; input.value = value; input.placeholder = placeholder; input.maxLength = maxLength;
    if (type === 'textarea') input.rows = 2; else { input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false; }
    input.addEventListener('input', () => { onChange(input.value); save(); }); wrapper.append(input); return wrapper;
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const shown = prospects.filter(p => (!uncalled.checked || !state[p.prospect_id].called) && (!query || [p.business_name, p.city, p.state, state[p.prospect_id].contactName].join(' ').toLocaleLowerCase().includes(query)));
    list.replaceChildren();
    document.getElementById('visible-count').textContent = shown.length + (shown.length === 1 ? ' business' : ' businesses') + (shown.length < 100 ? ' shown' : '');
    if (!shown.length) { list.append(make('p', 'empty', query ? 'No businesses match this search.' : 'All 100 businesses are marked called. Uncheck “Uncalled only” to see your notes.')); return; }
    for (const p of shown) {
      const s = state[p.prospect_id], card = make('article', 'card' + (s.called ? ' called' : '')); card.dataset.id = p.prospect_id;
      const top = make('div', 'card-top'); top.append(make('span', 'number', String(p.call_order).padStart(3, '0')));
      const calledLabel = make('label', 'called-label'), check = make('input'); check.type = 'checkbox'; check.checked = s.called; check.setAttribute('aria-label', 'Mark ' + p.business_name + ' called');
      const calledText = make('span', '', s.called ? 'Called' : 'Mark called');
      check.addEventListener('change', () => { s.called = check.checked; save(); counts(); if (uncalled.checked) render(); else { card.classList.toggle('called', s.called); calledText.textContent = s.called ? 'Called' : 'Mark called'; } });
      calledLabel.append(check, calledText); top.append(calledLabel); card.append(top, make('h2', '', p.business_name), make('p', 'city', p.city + ', ' + p.state));
      const call = make('a', 'call-link', 'Call ' + p.phone); call.href = 'tel:+1' + p.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''); call.setAttribute('aria-label', 'Call ' + p.business_name + ' at ' + p.phone); card.append(call);
      if ((p.verification_note || '').includes('texting')) card.append(make('p', 'texting-note', 'Their website emphasizes texting.'));
      card.append(field('Contact name', 'input', p.prospect_id + '-name', s.contactName, 'Name you learn on the call', 200, v => { s.contactName = v; }));
      card.append(field('Quick notes', 'textarea', p.prospect_id + '-notes', s.notes, 'Anything to remember', 3000, v => { s.notes = v; }));
      const details = make('details', 'details'), summary = make('summary', '', 'Business details & sources'); details.append(summary, make('p', '', p.service_fit_note));
      const links = make('div', 'source-links');
      for (const [url, label] of [[p.website, 'Website'], [p.source_url, 'Phone source'], [p.supplemental_source_url, 'Additional source']]) { if (url) { const a = sourceLink(url, label); if (a) links.append(a); } }
      details.append(links, make('p', 'source-date', 'Checked ' + p.date_checked + ' UTC. Publicly listed; not dial-tested.')); card.append(details); list.append(card);
    }
  }
  search.addEventListener('input', render); uncalled.addEventListener('change', render);
  document.getElementById('export').addEventListener('click', () => {
    const data = JSON.stringify(payload(), null, 2), blob = new Blob([data], { type: 'application/json' }), url = URL.createObjectURL(blob), a = make('a');
    a.href = url; a.download = 'relieve-call-backup-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    importStatus.textContent = 'Backup download requested. Keep the downloaded JSON file for restoring your notes.'; importStatus.hidden = false; importStatus.classList.remove('error');
  });
  const fileInput = document.getElementById('import-file');
  document.getElementById('import-button').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0]; if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('That file is too large. Choose a JSON backup from this call list.');
      const records = validBackup(JSON.parse(await file.text()));
      if (!confirm('Replace the names, checkmarks, and notes in this browser with this backup? Download your current backup first if you need to keep it.')) return;
      apply(records); save(); counts(); render(); importStatus.textContent = storageAvailable ? 'Backup restored and saved in this browser.' : 'Backup restored in this tab. Browser storage is unavailable; keep your backup.'; importStatus.classList.remove('error');
    } catch (e) { importStatus.textContent = e instanceof SyntaxError ? 'This file is not valid JSON. Nothing was changed.' : (e.message || 'The backup could not be restored. Nothing was changed.'); importStatus.classList.add('error'); }
    finally { fileInput.value = ''; importStatus.hidden = false; }
  });
  counts(); render();
})();


// The service worker caches only the application shell and public prospect list.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => { /* Saving notes still works; offline shell is optional. */ }); });
}
