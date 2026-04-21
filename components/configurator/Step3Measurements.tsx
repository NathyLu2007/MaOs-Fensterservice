'use client';

import { useState } from 'react';

interface Props {
  onNext: (width: number, height: number, count: number) => void;
}

export default function Step3Measurements({ onNext }: Props) {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [count, setCount] = useState('1');
  const [error, setError] = useState('');

  function validate() {
    const w = parseInt(width);
    const h = parseInt(height);
    const c = parseInt(count);
    if (!w || !h || !c) return 'Bitte alle Felder ausfüllen.';
    if (w < 20 || w > 400) return 'Breite muss zwischen 20 und 400 cm liegen.';
    if (h < 20 || h > 400) return 'Höhe muss zwischen 20 und 400 cm liegen.';
    if (c < 1 || c > 50) return 'Anzahl zwischen 1 und 50.';
    return '';
  }

  function handleNext() {
    const err = validate();
    if (err) { setError(err); return; }
    onNext(parseInt(width), parseInt(height), parseInt(count));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Maße eingeben</h2>
      <p className="text-gray-500 mb-6">Messen Sie Breite und Höhe eines Fensters in Zentimetern.</p>

      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <img
          src="/window-measure.svg"
          alt="Fenster messen"
          className="w-40 mx-auto mb-3"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <p className="text-sm text-blue-700 text-center">
          Messen Sie <strong>von Rahmen zu Rahmen</strong> (innen).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Breite (cm)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => { setWidth(e.target.value); setError(''); }}
            placeholder="z.B. 80"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Höhe (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => { setHeight(e.target.value); setError(''); }}
            placeholder="z.B. 120"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Anzahl gleicher Fenster</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount((prev) => String(Math.max(1, parseInt(prev) - 1)))}
              className="w-12 h-12 rounded-xl bg-gray-100 text-xl font-bold hover:bg-gray-200"
            >−</button>
            <span className="text-2xl font-bold w-12 text-center">{count}</span>
            <button
              onClick={() => setCount((prev) => String(Math.min(50, parseInt(prev) + 1)))}
              className="w-12 h-12 rounded-xl bg-gray-100 text-xl font-bold hover:bg-gray-200"
            >+</button>
          </div>
          {parseInt(count) <= 2 && (
            <p className="text-sm text-orange-600 mt-2">
              ⚠ Bei 1–2 Fenstern fällt eine Anfahrtspauschale von 50 € an.
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <button
        onClick={handleNext}
        className="mt-8 w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
      >
        Preis berechnen →
      </button>
    </div>
  );
}
