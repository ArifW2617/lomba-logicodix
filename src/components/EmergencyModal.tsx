import React, { useState } from 'react';
import { Copy, Check, PhoneCall } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/scamData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  'Telepon bank Anda lewat nomor di belakang kartu, minta blokir rekening atau kartu.',
  'Lepas jaringan data dan hapus aplikasi .APK yang baru terpasang.',
  'Ganti kata sandi email, m-banking, dan media sosial dari perangkat lain.',
  'Lapor ke OJK di 157 dan cek rekening penipu di cekrekening.id.',
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="help-dialog max-h-[90vh] overflow-y-auto">
        <h2 id="hh">Sudah terlanjur? Lakukan ini sekarang</h2>
        <ol className="em-steps">
          {STEPS.map((step, idx) => (
            <li key={idx}>
              <span className="em-num">{idx + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {/* Quick contacts grid */}
        <details className="mt-4 pt-3 border-t border-[var(--line)]">
          <summary className="cursor-pointer text-[14px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
            Lihat daftar nomor darurat bank & polisi
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {EMERGENCY_CONTACTS.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-between gap-2 text-xs"
              >
                <div className="truncate">
                  <div className="font-bold text-[var(--ink)] truncate">{item.name}</div>
                  <div className="text-[var(--brand)] font-mono font-bold mt-0.5">{item.phone}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(item.phone)}
                    className="p-1.5 rounded bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]"
                    title="Salin"
                  >
                    {copiedNumber === item.phone ? (
                      <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                    className="p-1.5 rounded bg-[var(--brand)] text-[var(--brand-ink)]"
                    title="Panggil"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </details>

        <button
          className="cta mt-5"
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};
