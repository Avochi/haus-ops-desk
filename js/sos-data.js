/**
 * sos-data.js
 * Konten Sequence of Service (dari materi haus! academy) dan 15 poin penilaian.
 * Kunci poin (g1..f3) harus sama dengan CONFIG.SOS_KEYS di backend/Config.gs.
 */
(function (H) {
  H.SOS = [
    { n: 1, c: 'var(--magenta)', t: 'Greeting', tag: 'Sambut customer dengan ramah dan tawarkan bantuan.',
      items: [['g1', 'Sambut dengan ramah ("Selamat datang di Haus")'], ['g2', 'Tawarkan bantuan'], ['g3', 'Tanya dine-in atau take away']],
      dlg: [['crew', 'Selamat datang di Haus, Kak. Silahkan dibantu pesanannya. Kakaknya mau dine-in atau take away?'], ['cust', 'Halo, Mbak. Aku mau takeaway dong, boleh.']] },
    { n: 2, c: 'var(--purple)', t: 'Selling', tag: 'Gunakan 3 teknik selling untuk membantu customer memilih dan menambah nilai transaksi.',
      items: [['s1', 'Suggestive selling: gali preferensi, arahkan ke best seller'], ['s2', 'Upselling: tawarkan ukuran lebih besar dan topping'], ['s3', 'Cross-selling: tawarkan makanan/puding']],
      techs: [
        { h: 'A. Suggestive selling', d: [['crew', 'Gali preferensi, lalu arahkan ke produk best seller.'], ['crew', 'Kakaknya suka yang segar atau yang creamy?'], ['cust', 'Saya suka yang creamy, Kak.'], ['crew', 'Kalau yang creamy, rekomendasi saya Chocolate Cheese Crunchy atau Dingdengbeng Cream Caramel.']] },
        { h: 'B. Upselling', d: [['crew', 'Tawarkan ukuran lebih besar & topping.'], ['crew', 'Ukurannya sekalian yang Large aja, Kak. Bedanya cuma 2 ribu.'], ['crew', 'Mau tambah topping? Rekomendasinya boba atau egg pudding, Kak.'], ['cust', 'Tambah boba aja, Mbak.']] },
        { h: 'C. Cross-selling', d: [['crew', 'Tawarkan produk lain (makanan/puding).'], ['crew', 'Selain minuman, kita juga ada makanan loh, Kak. Rekomendasinya Ottoke Cheese, Ramyeon Tray, Cimol, Roti Kukus, atau Pudding.'], ['cust', 'Kalau gitu saya mau Ottoke Cheese aja, Mbak.']] }
      ] },
    { n: 3, c: 'var(--orange)', t: 'Repeating Order', tag: 'Ulangi semua pesanan, konfirmasi & tanyakan nama.',
      items: [['r1', 'Ulangi semua pesanan'], ['r2', 'Konfirmasi total harga ("Sudah sesuai ya?")'], ['r3', 'Tanyakan nama customer']],
      dlg: [['crew', 'Baik, saya ulang kembali pesanannya ya. 1 Chocolate Cheese Crunchy ukuran Large tambah topping boba, 1 Ottoke Cheese. Totalnya 78 ribu. Sudah sesuai ya?'], ['cust', 'Sudah, Mbak.'], ['crew', 'Atas nama siapa kak pesanannya?'], ['cust', 'Atas nama Indah.']] },
    { n: 4, c: 'var(--purple)', t: 'Payment', tag: 'Utamakan cashless, cash tetap bisa.', flag: 'CASHLESS FIRST!',
      items: [['p1', 'Tawarkan cashless pertama (QRIS)'], ['p2', 'Tawarkan alternatif cashless lain (debit / kartu kredit / m-banking)'], ['p3', 'Jika tetap memilih tunai, terima cash']],
      dlg: [['crew', 'Pembayaran menggunakan QRIS ya?'], ['crew', 'Atau kalau punya aplikasi BRImo atau Wondr dari BNI, kebutuhan lagi ada promo nih.'], ['crew', 'Kalau tidak punya m-banking, pembayaran juga bisa pakai debit atau kartu kredit kok.']],
      extra: 'Jika customer tetap memilih tunai: "Baik. Kalau begitu boleh saya terima uangnya ya. Totalnya 78 ribu."',
      foot: 'Cashless adalah pilihan utama. Lebih cepat (proses singkat), lebih praktis (tanpa repot kembalian), lebih aman (transaksi higienis).' },
    { n: 5, c: 'var(--magenta)', t: 'Farewell & Pick Up', tag: 'Tutup pelayanan dengan ramah dan pastikan pesanan diterima dengan baik.',
      items: [['f1', 'Setelah payment: info waktu tunggu (sekitar 10 menit) dan arahkan ke ruang pick up'], ['f2', 'Panggil nama dan sebutkan isi pesanan saat sudah siap'], ['f3', 'Ucapan terima kasih dan salam penutup']],
      dlg: [['crew', 'Pesanannya ditunggu sekitar 10 menit ya, Kak. Mohon ditunggu di ruang pick up.'], ['cust', 'Oke, baik. Terima kasih.'], ['crew', 'Kak Indah, pesanannya sudah siap ya. 1 Chocolate Cheese Crunchy (L) + boba, 1 Ottoke Cheese. Terima kasih, Kak Indah. Hati-hati di jalan, sampai jumpa kembali!'], ['cust', 'Terima kasih.']] }
  ];
  H.SOS_TOTAL = H.SOS.reduce(function (n, s) { return n + s.items.length; }, 0);
  H.ROLES = ['STORE MANAGER', 'ASSISTANT STORE MANAGER', 'PIC', 'CASHIER', 'CREW', 'CREW PARTTIME'];
  H.LEADS = ['STORE MANAGER', 'ASSISTANT STORE MANAGER', 'PIC'];
})(window.Haus);
