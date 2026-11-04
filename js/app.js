/**
 * app.js
 * Menghubungkan UI, state, dan API: login, routing tab, aksi tambah/edit/hapus crew,
 * cek SOS, dan pickup rules. Setiap aksi tulis: tombol dinonaktifkan selama request
 * (cegah klik ganda), hasil dari server dipakai untuk memperbarui state.
 */
(function (H) {
  var S = H.state, U = H.ui, $ = U.$;
  var status = 'loading';          // 'loading' | 'ready' | 'error'
  var loadError = '';
  var editingId = null, delArm = null, delTimer = null;
  var cekSel = '', cekStoreSel = '', cekDraft = {};
  var TABS = ['crew', 'sos', 'cek', 'pickup'];

  /* ---------- tampilan utama ---------- */
  function show(which) {
    $('setupNotice').hidden = which !== 'setup';
    $('login').hidden = which !== 'login';
    $('app').hidden = which !== 'app';
  }
  function setSync(t) { $('sync').textContent = t; }

  function route() {
    var h = (location.hash || '').slice(1);
    if (TABS.indexOf(h) < 0) h = 'crew';
    TABS.forEach(function (t) {
      $('v-' + t).hidden = t !== h;
      var a = document.querySelector('[data-tab="' + t + '"]');
      if (t === h) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function filters() { return { q: $('q').value, store: $('fStore').value, role: $('fRole').value }; }

  function renderCrew() {
    var f = filters();
    U.fillSelect($('fStore'), 'Semua store', S.stores(), f.store);
    U.fillSelect($('fRole'), 'Semua jabatan', S.roles(), f.role);
    $('storeOpts').innerHTML = S.stores().map(function (s) { return '<option value="' + U.esc(s) + '">'; }).join('');
    $('roleOpts').innerHTML = S.roles().map(function (s) { return '<option value="' + U.esc(s) + '">'; }).join('');
    if (status === 'loading') { $('stats').innerHTML = ''; $('crewList').innerHTML = U.skeleton(6); return; }
    if (status === 'error') { $('stats').innerHTML = ''; $('crewList').innerHTML = U.stateBox('error', loadError, 'retryBtn'); return; }
    $('stats').innerHTML = U.statsHtml();
    $('crewList').innerHTML = U.crewListHtml(f, delArm);
  }

  function renderCek() {
    var stores = S.stores();
    if (!cekStoreSel && cekSel) { var c0 = S.findCrew(cekSel); if (c0) cekStoreSel = c0.store; }
    U.fillSelect($('cekStore'), 'Semua store', stores, cekStoreSel);
    var pool = S.crew.filter(function (c) { return !cekStoreSel || c.store === cekStoreSel; })
      .sort(function (a, b) { return a.nama.localeCompare(b.nama); });
    if (cekSel && !pool.some(function (c) { return c.id === cekSel; })) cekSel = '';
    $('cekCrew').innerHTML = '<option value="">Pilih crew yang dicek</option>' + pool.map(function (c) {
      return '<option value="' + U.esc(c.id) + '"' + (c.id === cekSel ? ' selected' : '') + '>' + U.esc(c.nama) + ' (' + U.esc(c.jabatan) + ')</option>';
    }).join('');
    var body = $('cekBody');
    if (status !== 'ready') { body.innerHTML = ''; return; }
    if (!cekSel) { body.innerHTML = '<div class="empty">Pilih store dan crew di atas, lalu centang langkah SOS yang dilakukan crew saat melayani customer.</div>'; return; }
    var crew = S.findCrew(cekSel), ex = S.checks[cekSel];
    if (!cekDraft[cekSel]) cekDraft[cekSel] = { checked: ex ? ex.checked.slice() : [], note: ex ? ex.note : '' };
    body.innerHTML = U.cekHtml(crew, cekDraft[cekSel], ex);
  }

  function renderRules() {
    $('ruleList').innerHTML = status === 'loading' ? U.skeleton(2) : U.rulesHtml();
  }

  function renderAll() { renderCrew(); renderCek(); renderRules(); }

  /* ---------- login / sesi ---------- */
  function showLogin(msg) {
    H.api.setPasscode('');
    show('login');
    $('loginErr').textContent = msg || '';
    $('passcode').value = '';
    $('loginBtn').disabled = false;
    setTimeout(function () { $('passcode').focus(); }, 0);
  }

  /** Error otorisasi mengembalikan user ke login; error lain ditampilkan lewat callback. */
  function isAuthError(e) { return e && (e.code === 'UNAUTHORIZED' || e.code === 'LOCKED'); }

  async function load() {
    status = 'loading'; setSync('Memuat…'); renderAll();
    try {
      S.setData(await H.api.call('bootstrap'));
      status = 'ready'; setSync('Terhubung · ' + S.crew.length + ' crew');
    } catch (e) {
      if (isAuthError(e)) { H.auth.clear(); showLogin(e.message); return false; }
      status = 'error'; loadError = e.message; setSync('Gagal memuat');
    }
    renderAll();
    return status === 'ready';
  }

  $('loginForm').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var pass = $('passcode').value;
    if (!pass) { $('loginErr').textContent = 'Passcode wajib diisi.'; return; }
    $('loginBtn').disabled = true; $('loginErr').textContent = '';
    H.api.setPasscode(pass);
    try {
      S.setData(await H.api.call('bootstrap'));
    } catch (e) {
      $('loginBtn').disabled = false;
      H.api.setPasscode('');
      $('loginErr').textContent = e.message;
      return;
    }
    H.auth.save(pass, $('remember').checked);
    status = 'ready'; setSync('Terhubung · ' + S.crew.length + ' crew');
    show('app'); route(); renderAll();
  });

  $('logoutBtn').addEventListener('click', function () { H.auth.clear(); S.loaded = false; showLogin(''); });
  $('reloadBtn').addEventListener('click', function () { load(); });
  $('crewList').addEventListener('click', function (e) { if (e.target.id === 'retryBtn') load(); });

  /** Jalankan aksi tulis dengan tombol dinonaktifkan; kembalikan hasil atau null bila gagal. */
  async function guarded(btn, fn, onError) {
    if (btn) btn.disabled = true;
    try {
      return await fn();
    } catch (e) {
      if (isAuthError(e)) { H.auth.clear(); showLogin('Sesi berakhir. Masukkan passcode lagi.'); return null; }
      onError(e.message);
      return null;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /* ---------- Crew ---------- */
  ['input', 'change'].forEach(function (ev) {
    $('q').addEventListener(ev, renderCrew);
    $('fStore').addEventListener(ev, renderCrew);
    $('fRole').addEventListener(ev, renderCrew);
  });

  function openSheet(id) {
    editingId = id || null;
    var c = id ? S.findCrew(id) : null;
    $('sheetTitle').textContent = c ? 'Edit crew' : 'Tambah crew';
    $('fId').value = c ? c.id : ''; $('fId').disabled = !!c;
    $('fNama').value = c ? c.nama : '';
    $('fStoreIn').value = c ? c.store : ($('fStore').value || '');
    $('fRoleIn').value = c ? c.jabatan : 'CREW';
    $('formErr').textContent = ''; $('sheet').hidden = false;
    setTimeout(function () { (c ? $('fNama') : $('fId')).focus(); }, 0);
  }
  function closeSheet() { $('sheet').hidden = true; }
  $('addBtn').addEventListener('click', function () { openSheet(null); });
  $('cancelBtn').addEventListener('click', closeSheet);
  $('sheet').addEventListener('click', function (e) { if (e.target === $('sheet')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('sheet').hidden) closeSheet(); });

  $('crewForm').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var f = { id: $('fId').value.trim(), nama: $('fNama').value.trim(), store: $('fStoreIn').value.trim(), jabatan: $('fRoleIn').value.trim() };
    var msg = H.validators.crew(f);
    if (msg) { $('formErr').textContent = msg; return; }
    $('formErr').textContent = '';
    var mode = editingId ? 'update' : 'create';
    var res = await guarded($('saveBtn'), function () { return H.api.call('crew.upsert', { mode: mode, crew: f }); },
      function (m) { $('formErr').textContent = m; });
    if (!res) return;
    S.putCrew(res.crew); closeSheet(); renderAll();
    setSync('Terhubung · ' + S.crew.length + ' crew');
    U.toast(mode === 'update' ? 'Perubahan disimpan' : 'Crew ditambahkan');
  });

  $('crewList').addEventListener('click', async function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.getAttribute('data-id'), act = b.getAttribute('data-act');
    if (act !== 'del' && delArm) { delArm = null; clearTimeout(delTimer); }
    if (act === 'edit') { openSheet(id); return; }
    if (act === 'cek') {
      var c = S.findCrew(id); cekSel = id; cekStoreSel = c ? c.store : '';
      location.hash = '#cek'; renderCek(); return;
    }
    if (delArm !== id) {          // klik pertama: minta konfirmasi (confirm() tidak dipakai)
      delArm = id; renderCrew();
      clearTimeout(delTimer); delTimer = setTimeout(function () { delArm = null; renderCrew(); }, 4000);
      return;
    }
    delArm = null; clearTimeout(delTimer);
    var res = await guarded(b, function () { return H.api.call('crew.delete', { id: id }); }, function (m) { U.toast(m); });
    if (!res) { renderCrew(); return; }
    S.removeCrew(id); delete cekDraft[id]; renderAll();
    setSync('Terhubung · ' + S.crew.length + ' crew'); U.toast('Crew dihapus');
  });

  /* ---------- SOS & Cek SOS ---------- */
  $('sosCards').innerHTML = U.sosHtml();
  $('pickupRef').innerHTML = U.pickupRefHtml();

  $('cekStore').addEventListener('change', function () { cekStoreSel = this.value; cekSel = ''; renderCek(); });
  $('cekCrew').addEventListener('change', function () { cekSel = this.value; renderCek(); });
  $('cekBody').addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (!k || !cekSel) return;
    var d = cekDraft[cekSel], i = d.checked.indexOf(k);
    if (e.target.checked && i < 0) d.checked.push(k); else if (!e.target.checked && i >= 0) d.checked.splice(i, 1);
    $('cekScore').textContent = d.checked.length + '/' + H.SOS_TOTAL;
  });
  $('cekBody').addEventListener('input', function (e) { if (e.target.id === 'cekNote' && cekSel) cekDraft[cekSel].note = e.target.value; });
  $('cekBody').addEventListener('click', async function (e) {
    if (e.target.id === 'cekReset') { delete cekDraft[cekSel]; renderCek(); return; }
    if (e.target.id !== 'cekSave') return;
    var id = cekSel, d = cekDraft[id];
    var res = await guarded(e.target, function () { return H.api.call('sos.save', { crewId: id, checked: d.checked, note: d.note }); },
      function (m) { U.toast(m); });
    if (!res) return;
    S.checks[id] = res.check; delete cekDraft[id]; renderAll(); U.toast('Penilaian disimpan');
  });

  /* ---------- Pickup rules ---------- */
  var pendingRuleId = null;       // dipakai ulang bila submit terulang, supaya server tidak membuat dobel
  $('ruleForm').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var f = { title: $('ruleTitle').value.trim(), text: $('ruleText').value.trim() };
    var msg = H.validators.rule(f);
    if (msg) { $('ruleErr').textContent = msg; return; }
    $('ruleErr').textContent = '';
    if (!pendingRuleId) pendingRuleId = H.util.uid();
    var res = await guarded($('ruleBtn'), function () { return H.api.call('rule.add', { id: pendingRuleId, title: f.title, text: f.text }); },
      function (m) { $('ruleErr').textContent = m; });
    if (!res) return;
    pendingRuleId = null;
    S.rules = S.rules.filter(function (r) { return r.id !== res.rule.id; }).concat([res.rule]);
    $('ruleTitle').value = ''; $('ruleText').value = ''; renderRules(); U.toast('Aturan disimpan');
  });
  $('ruleList').addEventListener('click', async function (e) {
    var id = e.target.getAttribute && e.target.getAttribute('data-rid'); if (!id) return;
    var res = await guarded(e.target, function () { return H.api.call('rule.delete', { id: id }); }, function (m) { U.toast(m); });
    if (!res) return;
    S.rules = S.rules.filter(function (r) { return r.id !== id; }); renderRules(); U.toast('Aturan dihapus');
  });

  /* ---------- start ---------- */
  window.addEventListener('hashchange', route);
  async function boot() {
    route();
    if (!H.api.isConfigured()) { show('setup'); return; }
    var saved = H.auth.load();
    if (!saved) { showLogin(''); return; }
    H.api.setPasscode(saved);
    show('app');
    if (await load()) route();
  }
  boot();
})(window.Haus);
