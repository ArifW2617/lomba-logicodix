import React, { useState } from 'react';
import {
  BookOpen,
  ShieldAlert,
  AlertOctagon,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileWarning,
  Flame,
  Search,
  Lock,
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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2 border border-indigo-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            Pusat Pengetahuan Keamanan Digital
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ensiklopedia Modus Penipuan & Pertolongan Pertama
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pelajari anatomi kejahatan siber, cara kerja malware APK, taktik psikologis pelaku, dan protokol mitigasi cepat jika Anda menjadi sasaran.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('encyclopedia')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'encyclopedia'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Modus Kejahatan
          </button>
          <button
            onClick={() => setActiveSubTab('first-aid')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'first-aid'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pertolongan Pertama
          </button>
          <button
            onClick={() => setActiveSubTab('hotlines')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'hotlines'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kontak Resmi
          </button>
        </div>
      </div>

      {/* VIEW 1: ENCYCLOPEDIA */}
      {activeSubTab === 'encyclopedia' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modus (contoh: APK, Kurir, Phishing, QRIS)..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModuses.map((modus) => (
              <div
                key={modus.id}
                onClick={() => setSelectedModus(modus)}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-lg cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {modus.tag}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        modus.dangerLevel === 'Kritis'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {modus.dangerLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                    {modus.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {modus.shortDesc}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-cyan-300">
                  <span>Pelajari Cara Kerja & Mitigasi</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Detail Modal */}
          {selectedModus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
                <button
                  onClick={() => setSelectedModus(null)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  ✕
                </button>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {selectedModus.tag}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Tingkat Bahaya: {selectedModus.dangerLevel}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {selectedModus.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    {selectedModus.shortDesc}
                  </p>
                </div>

                {/* How it works */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Alur Cara Kerja Pelaku:
                  </h4>
                  <div className="space-y-2">
                    {selectedModus.howItWorks.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Psychological Tricks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Trik Psikologis yang Dieksploitasi:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedModus.psychologicalTricks.map((trick, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{trick}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention Steps */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Langkah Pencegahan Mutlak:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {selectedModus.preventionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FIRST AID / PERTOLONGAN PERTAMA */}
      {activeSubTab === 'first-aid' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border border-rose-500/30 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 flex-shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Protokol Tanggap Darurat: Jika Terlanjur Mengklik Link atau Menginstal File APK
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Waktu sangat berharga! Kejahatan siber terjadi dalam hitungan menit. Ikuti urutan langkah darurat di bawah ini sekarang juga untuk meminimalisir kerugian.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Putus Koneksi Internet Seketika (Nyalakan Mode Pesawat)',
                desc: 'Jika Anda baru saja menginstal file APK mencurigakan, segera geser ke bawah layar HP Anda dan aktifkan "Mode Pesawat" (Airplane Mode) atau matikan WiFi dan Data Seluler. Ini memutus komunikasi malware ke server penipu agar kode OTP SMS Anda tidak sempat terkirim keluar.',
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
                desc: 'Buka laptop atau HP lain yang aman, lalu segera ganti password akun Google/Apple ID, m-banking, e-wallet (DANA, GoPay, OVO), dan aplikasi e-commerce. Tekan opsi "Keluar dari semua perangkat lain" (Log out other sessions).',
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
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-rose-500/20 whitespace-nowrap">
                    {item.urgency}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: OFFICIAL HOTLINES */}
      {activeSubTab === 'hotlines' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EMERGENCY_CONTACTS.map((contact, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {contact.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{contact.name}</h3>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-cyan-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{contact.description}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="font-mono text-cyan-300 font-bold text-sm">
                    📞 {contact.phone}
                  </div>
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white flex items-center gap-1 font-medium transition"
                  >
                    <span>Website Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
