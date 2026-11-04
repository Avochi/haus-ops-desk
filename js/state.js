/**
 * state.js
 * Data di memori + penyimpanan passcode di browser.
 * Passcode disimpan di sessionStorage (hilang saat tab ditutup), atau localStorage bila
 * user mencentang "Ingat di perangkat ini". Semua akses storage dibungkus try/catch.
 */
(function (H) {
  var KEY = 'haus_ops_passcode';

  H.auth = {
    load: function () {
      try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || ''; } catch (e) { return ''; }
    },
    save: function (pass, remember) {
      try {
        sessionStorage.setItem(KEY, pass);
        if (remember) localStorage.setItem(KEY, pass); else localStorage.removeItem(KEY);
      } catch (e) { /* storage diblokir: login hanya berlaku sampai halaman ditutup */ }
    },
    clear: function () {
      try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
    }
  };

  var S = H.state = {
    crew: [], checks: {}, rules: [], loaded: false,
    setData: function (d) {
      S.crew = (d.crew || []).slice();
      S.checks = {};
      (d.checks || []).forEach(function (c) { S.checks[c.crewId] = c; });
      S.rules = (d.rules || []).slice();
      S.loaded = true;
    },
    findCrew: function (id) {
      for (var i = 0; i < S.crew.length; i++) if (S.crew[i].id === String(id)) return S.crew[i];
      return null;
    },
    putCrew: function (c) {
      for (var i = 0; i < S.crew.length; i++) if (S.crew[i].id === c.id) { S.crew[i] = c; return; }
      S.crew.push(c);
    },
    removeCrew: function (id) {
      S.crew = S.crew.filter(function (c) { return c.id !== id; });
      delete S.checks[id];
    },
    stores: function () {
      var seen = {}; S.crew.forEach(function (c) { seen[c.store] = 1; });
      return Object.keys(seen).sort();
    },
    roles: function () {
      var seen = {}; H.ROLES.forEach(function (r) { seen[r] = 1; }); S.crew.forEach(function (c) { seen[c.jabatan] = 1; });
      return Object.keys(seen);
    }
  };
})(window.Haus);
