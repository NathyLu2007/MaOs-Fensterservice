'use client';

import { useState } from 'react';
import { calculatePrice, LineItem } from '@/lib/pricing';
import { AiResult } from './Step2Analysis';
import { PhotoBundle } from './Step1Photos';

interface Props {
  aiResult: AiResult;
  items: LineItem[];
  bundle: PhotoBundle;
  onDone: () => void;
}

export default function Step5Contact({ aiResult, items, bundle, onDone }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim()) { setError('Bitte Ihren Namen eingeben.'); return; }
    if (!phone.trim()) { setError('Bitte Ihre Telefonnummer eingeben.'); return; }
    setLoading(true);
    try {
      const price = calculatePrice(items);
      const fd = new FormData();

      fd.append('name', name.trim());
      fd.append('phone', phone.trim());
      fd.append('email', email.trim() || '-');
      fd.append('window_type', aiResult.windowType);
      fd.append('condition', aiResult.condition);
      fd.append('seal_profile', aiResult.sealProfile ?? '');
      fd.append('seal_color', aiResult.sealColor ?? '');
      fd.append('seal_color_hex', aiResult.sealColorHex ?? '');
      fd.append('ai_notes', aiResult.notes ?? '');
      fd.append('total_price', price.bruttoGesamt.toFixed(2));
      fd.append('travel_fee', price.anfahrt.toFixed(2));
      fd.append('items', JSON.stringify(items.map((i) => ({
        label: i.label, widthCm: i.widthCm, heightCm: i.heightCm,
        condition: i.condition, perimeter: ((i.widthCm * 2 + i.heightCm * 2) / 100).toFixed(1),
      }))));

      bundle.windowPhotos.forEach((f, i) => fd.append(`window_${i}`, f, f.name));
      if (bundle.sealPhoto) fd.append('seal', bundle.sealPhoto, bundle.sealPhoto.name);

      const res = await fetch('/api/leads', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError('Fehler beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Rückruf anfordern</h2>
      <p className="text-gray-500 mb-6">
        Wir rufen Sie persönlich an und besprechen Ihr individuelles Angebot.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Max Mustermann"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Telefonnummer <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(''); }}
            placeholder="0151 12345678"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            E-Mail <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
        📋 Mit dem Absenden erhalten wir Ihre Anfrage und melden uns innerhalb von <strong>24 Stunden</strong> telefonisch bei Ihnen. Kein Kaufzwang.
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
      >
        {loading ? 'Wird gesendet…' : 'Anfrage absenden ✓'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Ihre Daten werden vertraulich behandelt und nur für die Angebotserstellung verwendet.
      </p>
    </div>
  );
}
