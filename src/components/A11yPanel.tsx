import React, { useState, useEffect } from 'react';

// ─── TTS Helper ─────────────────────────────────────────────────────────────
export function speakText(text: string, onDone?: () => void) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'id-ID';
  u.rate = 0.92;
  try {
    const v = speechSynthesis.getVoices().find((x) => /^id/i.test(x.lang));
    if (v) u.voice = v;
  } catch {}
  if (onDone) {
    u.onend = onDone;
    u.onerror = onDone;
  }
  speechSynthesis.speak(u);
}

// ─── Accessibility State & Storage ──────────────────────────────────────────
const A11Y_KEY = 'cekdulu_a11y_v3';

export interface A11yState {
  z: number;
  hc: boolean;
}

export function loadA11y(): A11yState {
  try {
    const saved = localStorage.getItem(A11Y_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return {
        z: typeof parsed.z === 'number' ? parsed.z : 1,
        hc: typeof parsed.hc === 'boolean' ? parsed.hc : true,
      };
    }
  } catch {}
  return { z: 1, hc: true }; // Default: Kontras tinggi ON
}

export function saveA11y(st: A11yState) {
  try {
    localStorage.setItem(A11Y_KEY, JSON.stringify(st));
  } catch {}
}

export function applyA11y(st: A11yState) {
  const h = document.documentElement;
  h.style.zoom = st.z === 1 ? '' : String(st.z);
  h.classList.toggle('cd-hc', !!st.hc);
  if (st.hc) {
    h.setAttribute('data-theme', 'light');
  } else {
    h.removeAttribute('data-theme');
  }
  saveA11y(st);
}

// ─── A11y Floating Component ────────────────────────────────────────────────
export const A11yPanel: React.FC = () => {
  const [st, setSt] = useState<A11yState>(loadA11y);
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    applyA11y(st);
  }, [st]);

  const setZoom = (z: number) => setSt((s) => ({ ...s, z }));
  const toggleHc = () => setSt((s) => ({ ...s, hc: !s.hc }));

  const readScreen = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const el =
      (document.querySelector('.res') as HTMLElement | null) ??
      (document.querySelector('.quiz-card, .sim-chat, .url-res, .edu-content, .card') as HTMLElement | null) ??
      ((Array.from(document.querySelectorAll('.fb')) as HTMLElement[]).at(-1)) ??
      (document.querySelector('main') as HTMLElement | null);

    if (!el) return;
    setSpeaking(true);
    speakText(el.innerText.replace(/[✓✕]/g, ''), () => setSpeaking(false));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {open && (
        <div
          id="cd-a11y"
          role="dialog"
          aria-label="Pengaturan tampilan dan suara"
        >
          <h2>Tampilan dan suara</h2>
          <p className="cd-l">Ukuran teks</p>
          <div className="cd-row">
            {([1, 1.15, 1.3] as const).map((z, i) => (
              <button
                key={z}
                type="button"
                aria-pressed={st.z === z}
                onClick={() => setZoom(z)}
              >
                {['Normal', 'Besar', 'Sangat besar'][i]}
              </button>
            ))}
          </div>
          <button
            type="button"
            id="cd-hc"
            role="switch"
            aria-checked={st.hc}
            className="cd-sw"
            onClick={toggleHc}
          >
            <span>Kontras tinggi</span>
            <i aria-hidden="true" />
          </button>
          <button type="button" className="cd-wide" onClick={readScreen}>
            {speaking ? '⏹ Berhenti membaca' : '🔊 Bacakan hasil di layar'}
          </button>
        </div>
      )}
      <button
        id="cd-a11y-btn"
        type="button"
        aria-expanded={open}
        aria-controls="cd-a11y"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" style={{ fontWeight: 800 }}>Aa</span> Tampilan
      </button>
    </>
  );
};

