import React, { useState } from 'react';

interface ModusItem {
  c: string;
  r: 'k' | 't';
  t: string;
  d: string;
  how: string[];
  sign: string[];
  safe: string[];
  late: string[];
}

const MODUSES: ModusItem[] = [
  {
    c: 'Aplikasi berbahaya',
    r: 'k',
    t: 'APK pencuri SMS dan OTP',
    d: 'Berkas .apk disamarkan sebagai foto kurir, surat tilang ETLE, undangan nikah, atau tagihan.',
    how: [
      'Korban menerima berkas .apk lewat WhatsApp dan diminta membukanya.',
      'Setelah dipasang, aplikasi diam-diam membaca SMS, termasuk kode OTP.',
      'Penipu masuk ke m-banking dan menguras rekening.',
    ],
    sign: [
      'Berkas berakhiran .apk, bukan .jpg atau .pdf',
      'Pengirim nomor asing atau mengaku kurir tanpa nomor resi',
      'Ponsel minta izin membaca SMS atau aksesibilitas',
    ],
    safe: [
      'Jangan pasang aplikasi dari luar Play Store atau App Store',
      'Minta nomor resi dan cek di aplikasi resmi ekspedisi',
      'Matikan opsi “izinkan sumber tidak dikenal”',
    ],
    late: [
      'Aktifkan mode pesawat dan lepas SIM jika perlu',
      'Hapus aplikasi yang baru terpasang',
      'Telepon bank untuk memblokir m-banking lalu ganti semua kata sandi dari perangkat lain',
    ],
  },
  {
    c: 'Pura-pura jadi bank',
    r: 'k',
    t: 'Phishing perbankan dan “tarif transfer naik”',
    d: 'Meniru situs dan pesan bank untuk mencuri PIN, nomor kartu, CVV, dan OTP.',
    how: [
      'Nasabah dikirimi pesan bahwa tarif naik atau akun akan diblokir.',
      'Korban diarahkan ke situs tiruan yang mirip bank asli.',
      'Data yang diisi dipakai penipu untuk masuk ke rekening.',
    ],
    sign: [
      'Tautan singkat seperti bit.ly atau domain aneh',
      'Meminta PIN, CVV, atau OTP',
      'Bahasa menekan: “segera atau diblokir”',
    ],
    safe: [
      'Buka aplikasi resmi bank sendiri, bukan lewat tautan',
      'Hubungi nomor di belakang kartu untuk memastikan',
      'Jangan pernah membagikan OTP, PIN, atau CVV',
    ],
    late: [
      'Telepon bank dan minta blokir kartu atau akun',
      'Ganti PIN dan kata sandi m-banking',
      'Simpan tangkapan layar pesan untuk laporan',
    ],
  },
  {
    c: 'Tawaran kerja palsu',
    r: 't',
    t: 'Lowongan “like video” (tugas Ponzi)',
    d: 'Pekerjaan sampingan mudah dengan komisi awal yang kemudian berujung permintaan deposit bertingkat.',
    how: [
      'Korban diajak mengerjakan tugas mudah seperti like video atau follow akun.',
      'Komisi kecil dibayar di awal agar korban percaya.',
      'Korban diminta deposit untuk tugas “premium”, lalu uang tidak bisa ditarik.',
    ],
    sign: [
      'Bayaran besar untuk kerja sangat mudah',
      'Dikirim lewat WhatsApp atau Telegram dari nomor asing',
      'Diminta setor uang lebih dulu',
    ],
    safe: [
      'Pekerjaan sungguhan tidak meminta Anda membayar',
      'Tanyakan ke teman atau keluarga sebelum ikut',
      'Cek nama perusahaan di situs resmi',
    ],
    late: [
      'Berhenti menyetor, jangan tergoda “menebus” dana',
      'Simpan bukti transfer dan percakapan',
      'Lapor ke cekrekening.id dan OJK 157',
    ],
  },
  {
    c: 'Pembayaran digital',
    r: 't',
    t: 'QRIS palsu di kotak donasi (quishing)',
    d: 'Stiker QRIS palsu ditempel di atas QRIS resmi di toko atau tempat ibadah.',
    how: [
      'Penipu menempel stiker QRIS miliknya di atas QRIS asli.',
      'Pembayar memindai tanpa memeriksa nama penerima.',
      'Dana masuk ke rekening penipu.',
    ],
    sign: [
      'Stiker terlihat baru atau menimpa lapisan lain',
      'Nama penerima di layar berbeda dari tempatnya',
      'Kode ditempel di tempat tidak diawasi',
    ],
    safe: [
      'Selalu baca nama penerima sebelum menekan bayar',
      'Konfirmasi ke pengelola untuk pembayaran besar',
      'Laporkan stiker yang mencurigakan',
    ],
    late: [
      'Hubungi penyedia aplikasi pembayaran segera',
      'Laporkan ke pengelola tempat tersebut',
      'Simpan bukti transaksi untuk laporan polisi',
    ],
  },
  {
    c: 'Suara tiruan AI',
    r: 'k',
    t: 'Suara kerabat ditiru AI (vishing darurat)',
    d: 'Suara anak atau orang tua ditiru untuk memeras uang lewat telepon darurat palsu.',
    how: [
      'Penipu mengambil contoh suara dari video di media sosial.',
      'Korban ditelepon dengan suara mirip kerabat yang “ditangkap atau kecelakaan”.',
      'Korban dipaksa mentransfer uang saat itu juga.',
    ],
    sign: [
      'Nomor asing dan alasan sangat mendesak',
      'Dilarang menutup telepon atau menghubungi orang lain',
      'Meminta transfer ke rekening perorangan',
    ],
    safe: [
      'Sepakati kata sandi keluarga',
      'Tutup telepon dan hubungi kerabat lewat nomornya yang biasa',
      'Batasi video bersuara yang dibuka untuk umum',
    ],
    late: [
      'Hubungi bank untuk menahan transfer secepatnya',
      'Lapor ke polisi siber dan OJK 157',
      'Beri tahu keluarga agar waspada',
    ],
  },
];

const FIRST_AID_ITEMS: [string, string[]][] = [
  [
    'Terlanjur memasang aplikasi .apk',
    [
      'Aktifkan mode pesawat agar penipu putus akses.',
      'Hapus aplikasi yang baru dipasang.',
      'Telepon bank dari ponsel lain, minta blokir m-banking.',
      'Ganti kata sandi email, m-banking, dan media sosial dari perangkat lain.',
      'Jika perlu, setel ulang ponsel ke pengaturan pabrik.',
    ],
  ],
  [
    'Terlanjur memberikan OTP atau PIN',
    [
      'Telepon bank sekarang lewat nomor di belakang kartu.',
      'Minta kartu atau akun diblokir sementara.',
      'Ganti PIN dan kata sandi.',
      'Periksa mutasi rekening dan catat transaksi mencurigakan.',
    ],
  ],
  [
    'Terlanjur transfer ke penipu',
    [
      'Hubungi bank segera, makin cepat makin besar peluang menahan dana.',
      'Simpan bukti transfer dan percakapan.',
      'Laporkan nomor rekening di cekrekening.id.',
      'Buat laporan ke kepolisian atau patrolisiber.id.',
    ],
  ],
  [
    'Data KTP bocor atau diteror pinjol ilegal',
    [
      'Jangan transfer ke rekening pribadi.',
      'Simpan bukti ancaman dan nomor penagih.',
      'Laporkan ke OJK di 157.',
      'Beri tahu keluarga dan kontak dekat agar tidak termakan teror.',
    ],
  ],
];

const CONTACT_ITEMS: [string, string, string, string][] = [
  ['OJK', '157', 'Pengaduan penipuan keuangan dan pinjol ilegal.', ''],
  ['Bank Anda', 'Nomor di kartu', 'Telepon nomor yang tertera di belakang kartu ATM untuk memblokir akun.', ''],
  ['Cek rekening penipu', 'cekrekening.id', 'Periksa dan laporkan rekening yang dipakai penipu.', 'https://cekrekening.id'],
  ['Patroli Siber Polri', 'patrolisiber.id', 'Lapor tindak pidana siber ke kepolisian.', 'https://patrolisiber.id'],
  ['Laporkan nomor penipu', 'aduannomor.id', 'Adukan nomor telepon atau WhatsApp yang dipakai menipu.', 'https://aduannomor.id'],
];

const TABS = ['Modus penipuan', 'Pertolongan pertama', 'Kontak resmi'] as const;
type TabType = (typeof TABS)[number];

export const EducationTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Modus penipuan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModus, setSelectedModus] = useState<ModusItem | null>(null);

  const filteredModuses = MODUSES.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (item.t + item.d + item.c).toLowerCase().includes(q);
  });

  return (
    <>
      {/* Top Header */}
      <div className="edu-top">
        <h1>Kenali cara kerja penipu</h1>
        <p className="lead">
          Pelajari modus yang paling sering memakan korban di Indonesia, apa tandanya, dan apa yang harus dilakukan jika sudah terlanjur.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="seg" role="tablist" aria-label="Bagian">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'Modus penipuan' && (
          <div>
            <label className="search">
              <span style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                Cari modus
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Contoh: APK, kurir, QRIS"
              />
            </label>

            {filteredModuses.length > 0 ? (
              <div className="edu-grid">
                {filteredModuses.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="mc"
                    onClick={() => setSelectedModus(item)}
                  >
                    <div className="r">
                      <span>{item.c}</span>
                      <span className={`tag ${item.r}`}>
                        {item.r === 'k' ? 'Sangat berbahaya' : 'Berbahaya'}
                      </span>
                    </div>
                    <h3>{item.t}</h3>
                    <p>{item.d}</p>
                    <span className="go">Baca selengkapnya →</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="none">
                Tidak ada modus yang cocok. Coba kata lain seperti “APK” atau “bank”.
              </p>
            )}
          </div>
        )}

        {activeTab === 'Pertolongan pertama' && (
          <div className="acc">
            {FIRST_AID_ITEMS.map((item, idx) => (
              <details key={idx} open={idx === 0}>
                <summary>{item[0]}</summary>
                <ol>
                  {item[1].map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        )}

        {activeTab === 'Kontak resmi' && (
          <div>
            <div className="ct">
              {CONTACT_ITEMS.map((item, idx) => (
                <div key={idx} className="cc">
                  <b>{item[0]}</b>
                  <div className="big">
                    {item[3] ? (
                      <a
                        href={item[3]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '24px' }}
                      >
                        {item[1]}
                      </a>
                    ) : (
                      item[1]
                    )}
                  </div>
                  <p>{item[2]}</p>
                </div>
              ))}
            </div>
            <p className="nb">
              Ketik alamat situs sendiri di peramban, jangan lewat tautan di pesan yang Anda terima.
            </p>
          </div>
        )}
      </main>

      {/* Modal Detail Modus */}
      {selectedModus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3"
          style={{ background: 'rgba(0, 0, 0, 0.55)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedModus(null);
          }}
        >
          <div className="edu-dialog" role="dialog" aria-labelledby="dt">
            <div className="dh">
              <div>
                <span className={`tag ${selectedModus.r}`}>
                  {selectedModus.r === 'k' ? 'Sangat berbahaya' : 'Berbahaya'}
                </span>
                <h2 id="dt">{selectedModus.t}</h2>
              </div>
              <button
                type="button"
                className="x"
                aria-label="Tutup"
                onClick={() => setSelectedModus(null)}
              >
                ✕
              </button>
            </div>

            <div className="db">
              <p>{selectedModus.d}</p>

              <h4>Bagaimana cara kerjanya</h4>
              <ol>
                {selectedModus.how.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <h4>Tanda-tandanya</h4>
              <ul>
                {selectedModus.sign.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <h4>Cara melindungi diri</h4>
              <ul>
                {selectedModus.safe.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <div className="late">
                <h4>Jika sudah terlanjur</h4>
                <ul>
                  {selectedModus.late.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
