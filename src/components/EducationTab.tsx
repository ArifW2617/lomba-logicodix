import React, { useState } from 'react';
import {
  BookOpen,
  AlertOctagon,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Search,
} from 'lucide-react';
import { SCAM_MODUSES, EMERGENCY_CONTACTS } from '../data/scamData';
import { ScamModus } from '../types';

export const EducationTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModus, setSelectedModus] = useState<ScamModus | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'encyclopedia' | 'first-aid' | 'hotlines'>('encyclopedia');

  const filteredModuses = SCAM_MODUSES.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'var(--brand-soft)',
              color: 'var(--brand)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Pusat Pengetahuan Keamanan Digital
          </div>
          <h1 className="hero-h1" style={{ fontSize: '28px', margin: '0 0 6px' }}>
            Ensiklopedia Modus Penipuan & Pertolongan Pertama
          </h1>
          <p className="lead" style={{ margin: 0 }}>
            Pelajari anatomi kejahatan siber, cara kerja malware APK, taktik psikologis pelaku, dan protokol mitigasi cepat jika Anda menjadi sasaran.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="seg">
          <button
            role="tab"
            aria-selected={activeSubTab === 'encyclopedia'}
            onClick={() => setActiveSubTab('encyclopedia')}
          >
            Modus Kejahatan
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'first-aid'}
            onClick={() => setActiveSubTab('first-aid')}
          >
            Pertolongan Pertama
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'hotlines'}
            onClick={() => setActiveSubTab('hotlines')}
          >
            Kontak Resmi
          </button>
        </div>
      </div>

      {/* VIEW 1: ENCYCLOPEDIA */}
      {activeSubTab === 'encyclopedia' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '420px' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', fontSize: '15px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modus (contoh: APK, Kurir, Phishing, QRIS)..."
            />
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {filteredModuses.map((modus) => (
              <div
                key={modus.id}
                onClick={() => setSelectedModus(modus)}
                className="card"
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.15s ease' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                      {modus.tag}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: modus.dangerLevel === 'Kritis' ? 'var(--danger-soft)' : 'var(--warn-soft)',
                        color: modus.dangerLevel === 'Kritis' ? 'var(--danger)' : 'var(--warn)',
                      }}
                    >
                      {modus.dangerLevel}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px' }}>
                    {modus.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                    {modus.shortDesc}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--brand)' }}>
                  <span>Pelajari Cara Kerja & Mitigasi</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Detail Modal */}
          {selectedModus && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedModus(null);
              }}
            >
              <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <button
                  onClick={() => setSelectedModus(null)}
                  style={{ position: 'absolute', top: '18px', right: '18px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '999px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    {selectedModus.tag}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                    Tingkat Bahaya: {selectedModus.dangerLevel}
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
                  {selectedModus.title}
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
                  {selectedModus.shortDesc}
                </p>

                {/* How it works */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)', margin: '0 0 8px' }}>
                    Alur Cara Kerja Pelaku:
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {selectedModus.howItWorks.map((step, idx) => (
                      <div
                        key={idx}
                        style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)', fontSize: '14px', color: 'var(--ink)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                      >
                        <span style={{ width: '22px', height: '22px', borderRadius: '999px', background: 'var(--brand)', color: 'var(--brand-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>
                          {idx + 1}
                        </span>
                        <span style={{ lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Psychological Tricks */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--warn)', margin: '0 0 8px' }}>
                    Trik Psikologis yang Dieksploitasi:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px', fontSize: '14px', color: 'var(--ink)' }}>
                    {selectedModus.psychologicalTricks.map((trick, idx) => (
                      <li key={idx} style={{ color: 'var(--ink)' }}>
                        <span>{trick}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention Steps */}
                <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--ok-soft)', border: '1px solid var(--ok)', color: 'var(--ok)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck className="w-4 h-4" /> Langkah Pencegahan Mutlak:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px', fontSize: '14px' }}>
                    {selectedModus.preventionSteps.map((step, idx) => (
                      <li key={idx}>
                        <span style={{ color: 'var(--ink)' }}>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FIRST AID */}
      {activeSubTab === 'first-aid' && (
        <div style={{ maxWidth: '840px', margin: '0 auto', display: 'grid', gap: '16px', width: '100%' }}>
          <div style={{ padding: '20px', borderRadius: 'var(--r)', background: 'var(--danger-soft)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--surface)', color: 'var(--danger)', flexShrink: 0 }}>
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--danger)', margin: '0 0 4px' }}>
                Protokol Tanggap Darurat: Jika Terlanjur Mengklik Link atau Menginstal File APK
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
                Waktu sangat berharga! Kejahatan siber terjadi dalam hitungan menit. Ikuti urutan langkah darurat di bawah ini sekarang juga untuk meminimalisir kerugian.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              {
                step: '1',
                title: 'Putus Koneksi Internet Seketika (Nyalakan Mode Pesawat)',
                desc: 'Jika Anda baru saja menginstal file APK mencurigakan, segera aktifkan "Mode Pesawat" (Airplane Mode) atau matikan WiFi dan Data Seluler. Ini memutus komunikasi malware ke server penipu agar kode OTP SMS Anda tidak sempat terkirim keluar.',
                urgency: 'Detik Pertama',
              },
              {
                step: '2',
                title: 'Telepon Call Center Resmi Bank untuk Blokir Rekening',
                desc: 'Gunakan ponsel orang lain atau telepon rumah untuk menghubungi Call Center resmi bank Anda (Halo BCA 1500888, Mandiri 14000, BRI 1500017, BNI 1500046). Minta petugas segera memblokir akun m-banking, kartu ATM, dan transfer keluar dari rekening Anda.',
                urgency: 'Menit Ke-1 s/d 5',
              },
              {
                step: '3',
                title: 'Ganti Kata Sandi Email Utama & Akun Finansial dari Perangkat Lain',
                desc: 'Buka laptop atau HP lain yang aman, lalu segera ganti password akun Google/Apple ID, m-banking, e-wallet, dan e-commerce. Tekan opsi "Keluar dari semua perangkat lain" (Log out other sessions).',
                urgency: 'Menit Ke-10',
              },
              {
                step: '4',
                title: 'Simpan Bukti Kejahatan (Screenshot Lengkap)',
                desc: 'Ambil screenshot bukti chat WhatsApp/SMS, nomor telepon pelaku, tautan website palsu, bukti transfer, dan nomor rekening penipu. Jangan hapus chat sebelum bukti didokumentasikan.',
                urgency: 'Menit Ke-20',
              },
              {
                step: '5',
                title: 'Laporkan Rekening Penipu ke CekRekening.id & Polisi Siber',
                desc: 'Laporkan nomor rekening pelaku ke situs resmi pemerintah CekRekening.id (Kementerian Kominfo) agar rekening penipu segera dibekukan, dan buat laporan di PatroliSiber.id atau kantor polisi terdekat.',
                urgency: 'Hari yang Sama',
              },
              {
                step: '6',
                title: 'Lakukan Factory Reset (Kembalikan ke Setelan Pabrik) pada HP',
                desc: 'Untuk memastikan tidak ada malware atau virus tersembunyi yang tertinggal di sistem Android Anda, lakukan backup foto/kontak secara manual lalu jalankan "Reset ke Setelan Pabrik" (Factory Reset).',
                urgency: 'Tindakan Pembersihan Akhir',
              },
            ].map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '18px 20px', display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '30px', height: '30px', borderRadius: '999px', background: 'var(--brand)', color: 'var(--brand-ink)', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.step}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', background: 'var(--danger-soft)', color: 'var(--danger)', whiteSpace: 'nowrap' }}>
                    {item.urgency}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, paddingLeft: '42px', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: OFFICIAL HOTLINES */}
      {activeSubTab === 'hotlines' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <div key={idx} className="card" style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: 'var(--bg)', color: 'var(--muted)' }}>
                    {contact.category}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', margin: '6px 0 0' }}>
                    {contact.name}
                  </h3>
                </div>
                <div style={{ padding: '8px', borderRadius: '999px', background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  <PhoneCall className="w-4 h-4" />
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                {contact.description}
              </p>

              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <div style={{ fontFamily: 'monospace', color: 'var(--brand)', fontWeight: 700 }}>
                  📞 {contact.phone}
                </div>
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <span>Website Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
