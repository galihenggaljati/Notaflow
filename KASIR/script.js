
// VARIABEL GLOBAL
let riwayat     = [];    // array menyimpan semua transaksi hari ini
let dataPreview = null;  // data sementara sebelum dikonfirmasi di modal

// JAM & TANGGAL REAL-TIME
function updateClock() {
  const now = new Date();

  // padStart(2, '0') memastikan selalu 2 digit, misal "07" bukan "7"
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  // Tampilkan jam di elemen #clock
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;

  // Tampilkan tanggal di pill header
  const opsi = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  document.getElementById('date-pill').textContent = now.toLocaleDateString('id-ID', opsi);
}

updateClock();                    // langsung jalankan saat halaman dimuat
setInterval(updateClock, 1000);   // ulangi setiap 1 detik

// FORMAT RUPIAH
// Mengubah angka menjadi format "Rp 1.500.000"
// Math.round() untuk menghindari sisa floating point
function rupiah(angka) {
  return 'Rp ' + Math.round(angka).toLocaleString('id-ID');
}


// ──────────────────────────────────────────────────────
// HITUNG OTOMATIS
// Dipanggil setiap kali nilai input angka berubah.
function hitungOtomatis() {
  // Ambil nilai dari input; || 0 sebagai fallback jika kosong
  const harga  = parseFloat(document.getElementById('harga-satuan').value) || 0;
  const jumlah = parseInt(document.getElementById('jumlah-beli').value)    || 0;
  const uang   = parseFloat(document.getElementById('uang-konsumen').value)|| 0;

  // 1. Jumlah belanja
  const jumlahBelanja = harga * jumlah;

  // 2. Cek syarat diskon: total belanja minimal Rp 3.500.000
  const adaDiskon = jumlahBelanja >= 3500000;

  // 3. Hitung diskon 5% dari harga satuan dikali jumlah
  const diskon = adaDiskon ? harga * 0.05 * jumlah : 0;

  // 4. Total bayar setelah dipotong diskon
  const totalBayar = jumlahBelanja - diskon;

  // 5. Kembalian
  const kembalian = uang - totalBayar;

  // ── Tampilkan hasil ke elemen HTML ──
  document.getElementById('r-jumlah').textContent = rupiah(jumlahBelanja);
  document.getElementById('r-diskon').textContent = '- ' + rupiah(diskon);
  document.getElementById('r-uang').textContent   = rupiah(uang);
  document.getElementById('r-total').textContent  = rupiah(totalBayar);

  // Kembalian: merah + peringatan jika uang tidak cukup
  const elKmb = document.getElementById('r-kembalian');
  if (kembalian < 0) {
    elKmb.textContent = '⚠ Kurang ' + rupiah(-kembalian);
    elKmb.style.color = 'var(--red)';
  } else {
    elKmb.textContent = rupiah(kembalian);
    elKmb.style.color = 'var(--mint)';
  }

  // Tampilkan atau sembunyikan badge "5%" di samping label Diskon
  document.getElementById('badge-diskon').style.display = adaDiskon ? 'inline-block' : 'none';
}

// Daftarkan listener: setiap perubahan input langsung hitung ulang
['harga-satuan', 'jumlah-beli', 'uang-konsumen'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', hitungOtomatis);
});


// ──────────────────────────────────────────────────────
// PROSES TRANSAKSI
// Dipanggil saat tombol "Proses Transaksi" ditekan.
function proses() {
  // Ambil nilai dari form
  const idPembeli   = document.getElementById('id-pembeli').value.trim();
  const namaPembeli = document.getElementById('nama-pembeli').value.trim();
  const idBarang    = document.getElementById('id-barang').value.trim();
  const namaBarang  = document.getElementById('nama-barang').value.trim();
  const harga       = parseFloat(document.getElementById('harga-satuan').value) || 0;
  const jumlah      = parseInt(document.getElementById('jumlah-beli').value)    || 0;
  const uang        = parseFloat(document.getElementById('uang-konsumen').value)|| 0;

  // Validasi: tidak boleh ada field kosong atau bernilai nol
  if (!idPembeli || !namaPembeli || !idBarang || !namaBarang || harga <= 0 || jumlah <= 0) {
    alert('Harap lengkapi semua data terlebih dahulu!');
    return; // hentikan jika validasi gagal
  }

  // Hitung ulang
  const jumlahBelanja = harga * jumlah;
  const adaDiskon     = jumlahBelanja >= 3500000;
  const diskon        = adaDiskon ? harga * 0.05 * jumlah : 0;
  const totalBayar    = jumlahBelanja - diskon;
  const kembalian     = uang - totalBayar;

  // Validasi: uang konsumen harus cukup
  if (uang < totalBayar) {
    alert('Uang konsumen kurang ' + rupiah(totalBayar - uang) + '.');
    return;
  }

  // Simpan semua data ke variabel sementara
  dataPreview = {
    idPembeli,
    namaPembeli,
    idBarang,
    namaBarang,
    harga,
    jumlah,
    jumlahBelanja,
    diskon,
    totalBayar,
    uang,
    kembalian,
    adaDiskon,

    // Waktu transaksi diambil saat ini
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    // Nomor urut: panjang riwayat saat ini + 1
    nomor: riwayat.length + 1
  };

  // Buat HTML isi struk untuk ditampilkan di modal
  const d = dataPreview; // alias pendek

  document.getElementById('modal-struk').innerHTML =
    '<b>TOKO HP &amp; AKSESORIS Djatiee</b><br/>' +
    'Jl. Bahagia Selalu 13<br/>' +
    '<hr class="struk-divider"/>' +
    '<b>Pembeli</b><br/>' +
    d.namaPembeli + ' · ' + d.idPembeli + '<br/>' +
    '<hr class="struk-divider"/>' +
    d.namaBarang + ' (' + d.idBarang + ')<br/>' +
    rupiah(d.harga) + ' × ' + d.jumlah + ' pcs<br/>' +
    'Jumlah Belanja &nbsp;&nbsp; ' + rupiah(d.jumlahBelanja) + '<br/>' +
    (d.adaDiskon
      ? '<span style="color:var(--red)">Diskon 5% &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - ' + rupiah(d.diskon) + '</span><br/>'
      : '') +
    '<hr class="struk-divider"/>' +
    '<span class="sp-total">Total Bayar &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + rupiah(d.totalBayar) + '</span><br/>' +
    'Uang &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + rupiah(d.uang) + '<br/>' +
    '<span class="sp-kembalian">Kembalian &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + rupiah(d.kembalian) + '</span>';

  // Tampilkan modal konfirmasi
  document.getElementById('modal-overlay').classList.add('show');
}

// TUTUP MODAL KONFIRMASI
// Dipanggil saat tombol "Batal" ditekan, atau klik di luar modal
function tutupModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

// Klik di area gelap di luar modal box juga menutupnya
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) tutupModal(); // hanya tutup jika klik tepat di overlay
});

// SIMPAN TRANSAKSI
// Dipanggil saat tombol "Simpan ✓" di modal ditekan.
// Alur: simpan → render riwayat → reset form → tutup modal → tanya lagi
function simpanTransaksi() {
  if (!dataPreview) return; // pengaman jika fungsi dipanggil tanpa data

  // Masukkan ke array riwayat; unshift() agar terbaru ada di atas
  riwayat.unshift(dataPreview);

  // Perbarui tampilan daftar riwayat
  renderRiwayat();

  // Kosongkan semua form
  resetForm();

  // Tutup modal konfirmasi struk
  tutupModal();

  // Tampilkan pertanyaan "Input data pembeli lagi?"
  document.getElementById('modal-lagi-overlay').classList.add('show');
}


// ──────────────────────────────────────────────────────
// JAWAB "YA" — lanjut input pembeli baru
// Tutup modal lalu fokus ke field ID Pembeli
// ──────────────────────────────────────────────────────
function jawabYa() {
  document.getElementById('modal-lagi-overlay').classList.remove('show');
  document.getElementById('id-pembeli').focus(); // kursor langsung ke field pertama
}


// ──────────────────────────────────────────────────────
// JAWAB "TIDAK" — selesai, tutup modal saja
// ──────────────────────────────────────────────────────
function jawabTidak() {
  document.getElementById('modal-lagi-overlay').classList.remove('show');
}



// RENDER RIWAYAT
// Mengosongkan dan mengisi ulang #riwayat-list
// berdasarkan array riwayat[] yang ada
function renderRiwayat() {
  const el    = document.getElementById('riwayat-list');
  const badge = document.getElementById('jml-transaksi');

  // Update badge hitungan struk
  badge.textContent = riwayat.length + ' struk';

  // Tampilkan empty state jika belum ada transaksi
  if (riwayat.length === 0) {
    el.innerHTML =
      '<div class="empty">' +
        '<div class="empty-icon">🧾</div>' +
        'Belum ada transaksi.<br/>Yuk mulai yang pertama!' +
      '</div>';
    return;
  }

  // Buat HTML untuk setiap transaksi
  el.innerHTML = riwayat.map(function(t) {
    return (
      '<div class="struk-item">' +
        '<div class="struk-head">' +
          '<span class="struk-nama">' + t.namaPembeli + '</span>' +
          '<span class="struk-total">' + rupiah(t.totalBayar) + '</span>' +
        '</div>' +
        '<div class="struk-meta">' +
          '<span class="struk-nomor">#' + t.nomor + '</span>' +
          '<span>' + t.namaBarang + ' × ' + t.jumlah + '</span>' +
          (t.adaDiskon ? '<span class="struk-diskon">DISKON 5%</span>' : '') +
          '<span>' + t.waktu + '</span>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}


// ──────────────────────────────────────────────────────
// RESET FORM
// Mengosongkan semua input dan memperbarui tampilan ringkasan
// ──────────────────────────────────────────────────────
function resetForm() {
  // Kosongkan semua field teks & angka
  ['id-pembeli', 'nama-pembeli', 'id-barang', 'nama-barang', 'harga-satuan', 'uang-konsumen']
    .forEach(function(id) {
      document.getElementById(id).value = '';
    });

  // Kembalikan jumlah beli ke 1 (default)
  document.getElementById('jumlah-beli').value = 1;

  // Hapus data preview sementara
  dataPreview = null;

  // Perbarui tampilan ringkasan ke nilai nol
  hitungOtomatis();
}

// INISIALISASI
// Jalankan sekali saat halaman pertama kali dibuka
hitungOtomatis(); // tampilkan "Rp 0" di semua baris ringkasan dari awal
