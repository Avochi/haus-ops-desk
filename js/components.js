/**
 * components.js
 * Fungsi tampilan: mengubah data menjadi HTML. Semua teks dari server/user melewati esc().
 * Tidak ada panggilan API di sini.
 */
(function (H) {
  var S = H.state;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); } catch (e) { return ''; }
  }
  function scoreClass(n) { var p = n / H.SOS_TOTAL; return p >= 0.9 ? 'good' : p >= 0.6 ? 'warn' : 'bad'; }
  function roleRank(r) { var i = H.ROLES.indexOf(r); return i < 0 ? 99 : i; }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }

  function fillSelect(el, first, vals, cur) {
    el.innerHTML = '<option value="">' + esc(first) + '</option>' + vals.map(function (v) {
      return '<option' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>';
    }).join('');
  }

  function skeleton(n) {
    var h = ''; for (var i = 0; i < n; i++) h += '<div class="skeleton" aria-hidden="true"></div>';
    return h;
  }

  function stateBox(kind, message, retryId) {
    return '<div class="state-box ' + kind + '" role="' + (kind === 'error' ? 'alert' : 'status') + '"><div>' + esc(message) + '</div>' +
      (retryId ? '<button class="btn sm" type="button" id="' + retryId + '">Coba lagi</button>' : '') + '</div>';
  }

  function statsHtml() {
    var leads = S.crew.filter(function (c) { return H.LEADS.indexOf(c.jabatan) >= 0; }).length;
    var unchecked = S.crew.filter(function (c) { return !S.checks[c.id]; }).length;
    return '<div class="stat"><b>' + S.crew.length + '</b><span>Total crew</span></div>' +
      '<div class="stat"><b>' + S.stores().length + '</b><span>Store</span></div>' +
      '<div class="stat"><b>' + leads + '</b><span>Lead (SM, ASM, PIC)</span></div>' +
      '<div class="stat"><b>' + unchecked + '</b><span>Belum dicek SOS</span></div>';
  }

  function filterCrew(f) {
    var q = (f.q || '').trim().toLowerCase();
    return S.crew.filter(function (c) {
      return (!f.store || c.store === f.store) && (!f.role || c.jabatan === f.role) &&
        (!q || c.nama.toLowerCase().indexOf(q) >= 0 || c.id.indexOf(q) >= 0);
    }).sort(function (a, b) {
      return a.store.localeCompare(b.store) || roleRank(a.jabatan) - roleRank(b.jabatan) || a.nama.localeCompare(b.nama);
    });
  }

  function crewListHtml(f, armedId) {
    var rows = filterCrew(f);
    if (!rows.length) {
      return '<div class="empty">' + (S.crew.length
        ? 'Tidak ada crew yang cocok dengan pencarian.'
        : 'Belum ada data crew. Klik "+ Tambah crew" untuk mulai.') + '</div>';
    }
    var out = '', last = null;
    rows.forEach(function (c) {
      if (c.store !== last) { last = c.store; out += '<div class="store-h">' + esc(c.store) + '</div>'; }
      var ck = S.checks[c.id];
      var badge = ck
        ? '<span class="pill ' + scoreClass(ck.score) + '" title="Terakhir dicek ' + esc(fmtDate(ck.at)) + '">SOS ' + ck.score + '/' + H.SOS_TOTAL + ' · ' + esc(fmtDate(ck.at)) + '</span>'
        : '<span class="pill none">SOS belum dicek</span>';
      out += '<div class="row"><div class="who"><b>' + esc(c.nama) + '</b><small>ID ' + esc(c.id) + '</small></div>' +
        '<span class="pill' + (H.LEADS.indexOf(c.jabatan) >= 0 ? ' lead' : '') + '">' + esc(c.jabatan) + '</span>' + badge +
        '<div class="acts">' +
        '<button class="btn sm" type="button" data-act="cek" data-id="' + esc(c.id) + '">Cek SOS</button>' +
        '<button class="btn sm" type="button" data-act="edit" data-id="' + esc(c.id) + '">Edit</button>' +
        '<button class="btn sm danger" type="button" data-act="del" data-id="' + esc(c.id) + '">' + (armedId === c.id ? 'Yakin hapus?' : 'Hapus') + '</button>' +
        '</div></div>';
    });
    return out;
  }

  function dlgHtml(d) {
    return '<div class="dlg">' + d.map(function (m) {
      return '<div class="msg"><span class="who-tag ' + (m[0] === 'crew' ? 'crew' : 'cust') + '">' + (m[0] === 'crew' ? 'CREW' : 'CUSTOMER') + '</span><span>' + esc(m[1]) + '</span></div>';
    }).join('') + '</div>';
  }

  function sosHtml() {
    return H.SOS.map(function (s, i) {
      var h = '<details class="step" style="--c:' + s.c + '"' + (i === 0 ? ' open' : '') + '><summary><span class="num">' + s.n + '</span><div><h3>' + esc(s.t) + '</h3><p>' + esc(s.tag) + '</p></div></summary><div class="body">';
      if (s.flag) h += '<div><span class="cashless">' + esc(s.flag) + '</span></div>';
      h += '<h4>Yang harus dilakukan</h4><ul style="margin:0;padding-left:20px">' + s.items.map(function (x) { return '<li>' + esc(x[1]) + '</li>'; }).join('') + '</ul>';
      if (s.techs) s.techs.forEach(function (t) { h += '<div class="tech"><h5>' + esc(t.h) + '</h5>' + dlgHtml(t.d) + '</div>'; });
      if (s.dlg) h += '<h4>Contoh percakapan</h4>' + dlgHtml(s.dlg);
      if (s.extra) h += '<div class="note">' + esc(s.extra) + '</div>';
      if (s.foot) h += '<div class="note">' + esc(s.foot) + '</div>';
      return h + '</div></details>';
    }).join('');
  }

  function cekHtml(crew, draft, existing) {
    var h = '<div class="note"><b>' + esc(crew.nama) + '</b> · ' + esc(crew.store) + ' · ' + esc(crew.jabatan) +
      (existing ? '<br>Penilaian terakhir: ' + existing.score + '/' + H.SOS_TOTAL + ' pada ' + esc(fmtDate(existing.at)) : '<br>Belum pernah dinilai.') + '</div>';
    H.SOS.forEach(function (s) {
      h += '<div class="chk-group" style="--c:' + s.c + '"><h3>' + s.n + '. ' + esc(s.t) + '</h3>' + s.items.map(function (x) {
        return '<label class="chk"><input type="checkbox" data-k="' + x[0] + '"' + (draft.checked.indexOf(x[0]) >= 0 ? ' checked' : '') + '><span>' + esc(x[1]) + '</span></label>';
      }).join('') + '</div>';
    });
    h += '<label for="cekNote">Catatan coaching<textarea id="cekNote" maxlength="800" placeholder="Hal yang perlu diperbaiki atau dipuji">' + esc(draft.note) + '</textarea></label>';
    h += '<div class="scorebar"><div>Skor <b id="cekScore">' + draft.checked.length + '/' + H.SOS_TOTAL + '</b></div><div class="acts">' +
      '<button class="btn" id="cekReset" type="button">Reset</button><button class="btn primary" id="cekSave" type="button">Simpan penilaian</button></div></div>';
    return h;
  }

  function pickupRefHtml() {
    var P = H.PICKUP;
    var h = '<ol class="pk-steps">' + P.steps.map(function (s, i) {
      return '<li class="pk-step"><span class="num">' + (i + 1) + '</span><div><div>' + esc(s.t) + '</div>' +
        (s.say ? '<div class="pk-say">"' + esc(s.say) + '"</div>' : '') + '</div></li>';
    }).join('') + '</ol>';
    h += '<div class="card pk-mandatory"><h3>Mandatory: penggunaan plastik</h3><dl>' + P.mandatory.map(function (m) {
      return '<dt>' + esc(m[0]) + '</dt><dd>' + esc(m[1]) + '</dd>';
    }).join('') + '</dl><div class="note">' + esc(P.mandatoryNote) + '</div></div>';
    return h;
  }

  function rulesHtml() {
    if (!S.rules.length) return '<div class="empty">Belum ada pickup rules.</div>';
    return S.rules.map(function (x) {
      return '<div class="row" style="align-items:flex-start"><div class="who"><b>' + esc(x.title) + '</b><div style="white-space:pre-wrap;margin-top:4px;overflow-wrap:anywhere">' + esc(x.text) + '</div></div>' +
        '<button class="btn sm danger" type="button" data-rid="' + esc(x.id) + '">Hapus</button></div>';
    }).join('');
  }

  H.ui = {
    esc: esc, $: $, toast: toast, fillSelect: fillSelect, skeleton: skeleton, stateBox: stateBox,
    statsHtml: statsHtml, crewListHtml: crewListHtml, sosHtml: sosHtml, cekHtml: cekHtml, pickupRefHtml: pickupRefHtml, rulesHtml: rulesHtml
  };
})(window.Haus);
