/**
 * pickup-data.js
 * Pick Up Rules standar (dari poster "PICK UP RULES" haus!). Bagian ini baru sebagian
 * dari aturan pickup; aturan tambahan diisi lewat form di tab Pickup Rules.
 */
(function (H) {
  H.PICKUP = {
    steps: [
      { t: 'Panggil nama customer yang tercantum di CO Bar.', say: 'Orderan atas nama Kak Dewi' },
      { t: 'Minta struk orderan kepada customer.', say: 'Atas nama Kak Dewi yah? Boleh saya pinjam struknya kak?' },
      { t: 'Lakukan pencocokan antara struk dan produk dengan menyebutkan kembali orderan customer dan berikan tanda ceklist pada struk.', say: 'Orderannya ada 1 Choco Lava Milo Boba ya Kak (centang struk), sama Roti Bakar Coklat 1 ya (centang struk)' },
      { t: 'Jika orderan sudah sesuai dengan struk, berikan tanda paraf setelahnya.' },
      { t: 'Masukkan semua orderan pada plastik sesuai dengan rules penggunaan plastik, ikat dengan kabel ties.' },
      { t: 'Tempelkan struk pada sisi luar kantong plastik menggunakan strapless.' },
      { t: 'Berikan orderan kepada customer, pastikan semuanya sudah sesuai.', say: 'Silahkan Kak Dewi, orderannya sudah sesuai ya...' },
      { t: 'Ucapkan terima kasih.', say: 'Terimakasih Kak Dewi, hati-hati di jalan... jika Haus datang kembali' }
    ],
    mandatory: [
      ['Minuman 1 pcs', 'Gunakan plastik kecil'],
      ['Minuman 2 dst', 'Gunakan plastik besar'],
      ['Ganjel Roti', 'Gunakan plastik besar dan terpisah dari produk minuman'],
      ['PedesCyin', 'Gunakan plastik besar']
    ],
    mandatoryNote: 'Pastikan cable ties dipasang setelah orderan dicek dan diparaf.'
  };
})(window.Haus);
