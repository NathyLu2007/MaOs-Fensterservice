'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { PhotoBundle } from './Step1Photos';
import SealColorPicker from '@/components/SealColorPicker';
import { SealColor, findClosestColor } from '@/lib/sealColors';

export interface AiResult {
  windowType: string;
  condition: string;
  sealProfile: string;
  sealColor: string;
  sealColorHex: string;
  confidence: number;
  profileConfidence: number;
  notes: string;
}

const WINDOW_TYPES = ['Kunststoff', 'Holz', 'Aluminium', 'Altbau-Holz', 'Unbekannt'];
const CONDITIONS = [
  { value: 'gut', label: 'Gut – kaum Verschleiß' },
  { value: 'porös', label: 'Porös – leicht beschädigt' },
  { value: 'beschädigt', label: 'Beschädigt – deutliche Schäden' },
  { value: 'stark_beschädigt', label: 'Stark beschädigt' },
];
const SEAL_PROFILES = [
  'E-Profil', 'P-Profil', 'D-Profil', 'K-Profil',
  'Q-Profil', 'Pilzdichtung', 'Lippendichtung', 'Mitteldichtung', 'Unbekannt',
];

interface Props {
  bundle: PhotoBundle;
  onNext: (result: AiResult) => void;
}

export default function Step2Analysis({ bundle, onNext }: Props) {
  const [loading, setLoading] = useState(true);
  const [aiRaw, setAiRaw] = useState<AiResult | null>(null);
  const [windowType, setWindowType] = useState('');
  const [condition, setCondition] = useState('');
  const [sealProfile, setSealProfile] = useState('');
  const [sealColor, setSealColor] = useState<SealColor | null>(null);
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  useEffect(() => {
    async function analyze() {
      const fd = new FormData();
      bundle.windowPhotos.forEach((f) => fd.append('windowImages', f));
      if (bundle.sealPhoto) fd.append('sealImage', bundle.sealPhoto);
      try {
        const res = await fetch('/api/analyze', { method: 'POST', body: fd });
        const data: AiResult = await res.json();
        setAiRaw(data);
        setWindowType(data.windowType);
        setCondition(data.condition);
        setSealProfile(data.sealProfile);
        // Pre-select closest color from AI detection
        const matched = findClosestColor(data.sealColor);
        if (matched) setSealColor(matched);
      } catch {
        const fallback: AiResult = {
          windowType: 'Unbekannt', condition: 'porös',
          sealProfile: 'Unbekannt', sealColor: 'Unbekannt', sealColorHex: '',
          confidence: 0, profileConfidence: 0, notes: 'Analyse fehlgeschlagen.',
        };
        setAiRaw(fallback);
        setWindowType(fallback.windowType);
        setCondition(fallback.condition);
        setSealProfile(fallback.sealProfile);
      } finally {
        setLoading(false);
      }
    }
    analyze();
  }, [bundle]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">KI analysiert Ihre Fotos…</p>
        <p className="text-gray-400 text-sm">Fenstertyp, Profil & Farbe werden erkannt</p>
      </div>
    );
  }

  const canProceed = windowType && condition && sealColor;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">KI-Analyse</h2>
        <p className="text-gray-500 text-sm">Bitte prüfen und bestätigen Sie das Ergebnis.</p>
      </div>

      {aiRaw && aiRaw.confidence > 0 && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-green-800 text-sm">Analyse abgeschlossen</p>
            <p className="text-green-700 text-sm mt-0.5">{aiRaw.notes}</p>
          </div>
        </div>
      )}
      {aiRaw && aiRaw.confidence === 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <AlertCircle className="text-yellow-500 mt-0.5 shrink-0" size={20} />
          <p className="text-yellow-800 text-sm">Automatische Analyse nicht möglich. Bitte manuell auswählen.</p>
        </div>
      )}

      {/* Window type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Fenstertyp
          {aiRaw?.confidence ? <span className="ml-2 text-xs font-normal text-gray-400">KI: {aiRaw.confidence}% sicher</span> : null}
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {WINDOW_TYPES.map((t) => (
            <button key={t} onClick={() => setWindowType(t)}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors
                ${windowType === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Zustand der Dichtung</label>
        <div className="space-y-2">
          {CONDITIONS.map((c) => (
            <button key={c.value} onClick={() => setCondition(c.value)}
              className={`w-full py-3 px-4 rounded-xl border-2 text-left text-sm font-medium transition-colors
                ${condition === c.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seal profile with confirmation */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Dichtungsprofil
          <span className="ml-2 text-xs font-normal text-gray-400">(optional)</span>
          {aiRaw?.profileConfidence ? <span className="ml-2 text-xs font-normal text-gray-400">KI: {aiRaw.profileConfidence}% sicher</span> : null}
        </label>
        <p className="text-xs text-gray-400 mb-3">Falls bekannt – wir klären das auch gerne vor Ort.</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {SEAL_PROFILES.map((p) => (
            <button key={p} onClick={() => { setSealProfile(p); setProfileConfirmed(false); }}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors text-left
                ${sealProfile === p ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {p}
            </button>
          ))}
        </div>

        {sealProfile && !profileConfirmed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-3">
              ⚠ Profil bestätigen: <strong>{sealProfile}</strong>
            </p>
            <div className="flex gap-2">
              <button onClick={() => setProfileConfirmed(true)}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700">
                ✓ Ja, stimmt
              </button>
              <button onClick={() => { setSealProfile(''); setProfileConfirmed(false); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Korrigieren
              </button>
            </div>
          </div>
        )}
        {profileConfirmed && (
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 rounded-xl px-4 py-2.5">
            <CheckCircle size={16} /> Profil bestätigt: {sealProfile}
          </div>
        )}
      </div>

      {/* Seal color picker */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Farbe der Dichtung
          {aiRaw?.sealColor && aiRaw.sealColor !== 'Unbekannt' && (
            <span className="ml-2 text-xs font-normal text-gray-400">KI erkannt: {aiRaw.sealColor}</span>
          )}
        </label>
        <p className="text-xs text-gray-400 mb-3">Wählen Sie die Farbe Ihrer aktuellen Dichtung.</p>

        <SealColorPicker
          selected={sealColor?.name ?? ''}
          onChange={(c) => setSealColor(c)}
        />

        {sealColor && (
          <div className="mt-3 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
            <div className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
              style={{ backgroundColor: sealColor.hex }} />
            <span className="text-sm font-medium text-gray-700">{sealColor.name}</span>
            <span className="text-xs text-gray-400 font-mono ml-auto">{sealColor.hex}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onNext({
          ...aiRaw!,
          windowType, condition, sealProfile,
          sealColor: sealColor?.name ?? '',
          sealColorHex: sealColor?.hex ?? '',
        })}
        disabled={!canProceed}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Weiter zu Maßen →
      </button>
      {!canProceed && (
        <p className="text-center text-xs text-gray-400">
          {!sealColor ? 'Farbe auswählen' : 'Bitte Fenstertyp und Zustand auswählen'}
        </p>
      )}
    </div>
  );
}
