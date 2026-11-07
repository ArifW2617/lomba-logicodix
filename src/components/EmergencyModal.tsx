import React, { useState } from 'react';
import {
  PhoneCall,
  X,
  ExternalLink,
  Copy,
  Check,
  AlertOctagon,
  ShieldAlert,
  Smartphone,
  Landmark,
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/scamData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Pusat Bantuan & Hotline Darurat Penipuan
            </h2>
            <p className="text-xs text-rose-300 font-medium mt-0.5">
              Jika Anda baru saja mengirim uang atau mengklik file APK, segera hubungi kontak berikut!
            </p>
          </div>
        </div>

        {/* Top 3 Rapid Emergency Actions */}
        <div className="my-5 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            3 Tindakan Kilat yang Wajib Dilakukan:
          </div>
          <ol className="list-decimal list-inside text-xs text-slate-200 space-y-1 leading-relaxed">
            <li>
              <strong>Nyalakan Mode Pesawat (Airplane Mode)</strong> jika sempat mengunduh file APK kurir / undangan nikah.
            </li>
            <li>
              <strong>Hubungi Call Center Bank di bawah</strong> untuk memblokir akun m-banking & transfer keluar seketika.
            </li>
            <li>
              <strong>Laporkan rekening penipu</strong> ke portal resmi <em>CekRekening.id</em> dan <em>PatroliSiber.id</em>.
            </li>
          </ol>
        </div>

        {/* Hotline List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Daftar Nomor Telepon Resmi (24 Jam Bebas Pulsa/Panggilan Langsung):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                  <div className="text-xs font-mono font-extrabold text-cyan-400 mt-0.5">
                    📞 {item.phone}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item.phone)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition text-xs"
                    title="Salin Nomor"
                  >
                    {copiedNumber === item.phone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs"
                    title="Panggil Sekarang"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct official reporting portals */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <a
            href="https://cekrekening.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <span>Lapor ke CekRekening.id (Kominfo)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://patrolisiber.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <span>Lapor ke PatroliSiber.id (Polri)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
