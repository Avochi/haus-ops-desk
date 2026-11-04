/**
 * api.js
 * Satu-satunya modul yang bicara ke backend. Request dikirim sebagai POST dengan
 * Content-Type text/plain supaya browser tidak mengirim preflight OPTIONS
 * (Apps Script tidak menangani OPTIONS). Body tetap JSON.
 *
 * Error yang dilempar selalu punya .code dan .message yang aman ditampilkan:
 *   NETWORK, TIMEOUT, HTTP, BAD_RESPONSE   -> dibuat di sini
 *   UNAUTHORIZED, VALIDATION_ERROR, ...    -> kode dari server (lihat README)
 */
(function (H) {
  var passcode = '';

  function apiError(code, message) {
    var e = new Error(message);
    e.code = code;
    return e;
  }

  function isConfigured() {
    var u = H.config.API_URL;
    return typeof u === 'string' && /^https?:\/\//.test(u) && u.indexOf('PASTE_') < 0;
  }

  function setPasscode(p) { passcode = p || ''; }

  async function call(action, payload) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, H.config.REQUEST_TIMEOUT_MS);
    var res;
    try {
      res = await fetch(H.config.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: action, passcode: passcode, payload: payload }),
        redirect: 'follow',
        credentials: 'omit',
        signal: ctrl.signal
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw apiError('TIMEOUT', 'Server terlalu lama merespons. Coba lagi.');
      throw apiError('NETWORK', 'Tidak bisa terhubung ke server. Cek koneksi internet dan URL API di config.js.');
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) throw apiError('HTTP', 'Server membalas dengan status ' + res.status + '.');

    var text = await res.text();
    var body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      throw apiError('BAD_RESPONSE', 'Respons server bukan JSON. Pastikan deployment Apps Script: Execute as "Me" dan akses "Anyone".');
    }
    if (!body || typeof body.success !== 'boolean') throw apiError('BAD_RESPONSE', 'Format respons server tidak dikenali.');
    if (!body.success) {
      var er = body.error || {};
      throw apiError(typeof er.code === 'string' ? er.code : 'ERROR', typeof er.message === 'string' ? er.message : 'Terjadi kesalahan.');
    }
    return body.data;
  }

  H.api = { isConfigured: isConfigured, setPasscode: setPasscode, call: call };
})(window.Haus);
