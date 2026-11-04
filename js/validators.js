/**
 * validators.js
 * Validasi untuk kenyamanan user (pesan cepat sebelum kirim). Bukan batas keamanan:
 * backend memvalidasi ulang semuanya.
 */
(function (H) {
  H.validators = {
    crew: function (f) {
      if (!/^[0-9A-Za-z_-]{1,40}$/.test(f.id)) return 'ID Karyawan hanya boleh huruf, angka, dan strip.';
      if (!f.nama) return 'Nama wajib diisi.';
      if (!f.store) return 'Store wajib diisi.';
      if (!f.jabatan) return 'Jabatan wajib diisi.';
      return '';
    },
    rule: function (f) {
      if (!f.title) return 'Judul aturan wajib diisi.';
      if (!f.text) return 'Isi aturan wajib diisi.';
      return '';
    }
  };

  H.util = {
    uid: function () {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }
  };
})(window.Haus);
