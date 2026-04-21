'use client';

import { calculatePrice, LineItem, MWST_SATZ, NEUFENSTER_FAKTOR, HAUSTUER_FAKTOR } from '@/lib/pricing';

interface Props {
  items: LineItem[];
  onAccept: () => void;
  onDecline: () => void;
}

function eur(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function Step4Price({ items, onAccept, onDecline }: Props) {
  const p = calculatePrice(items);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ihre Preisübersicht</h2>
      <p className="text-gray-500 mb-4 text-sm">Unverbindliche Schätzung — das genaue Angebot nach telefonischer Rücksprache.</p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-5">
        ℹ️ <strong>Hinweis:</strong> Diese Berechnung ist kein verbindliches Angebot.
      </div>

      {/* Positionen */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
        <p className="font-semibold text-gray-700 mb-2">Positionen:</p>
        {p.itemPrices.map(({ item, perimeterM, sealMeters, materialCost }, i) => (
          <div key={item.id} className="text-gray-600 py-1.5 border-b border-gray-100 last:border-0">
            <div className="flex justify-between">
              <span className="font-medium">{i + 1}. {item.label}</span>
              <span className="font-semibold">{eur(materialCost)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {item.widthCm}×{item.heightCm} cm · {perimeterM.toFixed(1)} m Umfang ·{' '}
              {item.sealCount}× Dichtung = {sealMeters.toFixed(1)} m ·{' '}
              {item.condition}
            </div>
          </div>
        ))}
      </div>

      {/* Kostenaufstellung */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-sm space-y-2">
        <p className="font-semibold text-gray-700 mb-2">
          Kostenaufstellung <span className="font-normal text-gray-400">({p.totalSealMeters.toFixed(1)} m Dichtung gesamt)</span>
        </p>

        <div className="flex justify-between text-gray-600">
          <span>Material & Montage</span>
          <span>{eur(p.sumMaterialCost)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Regiestunde Mehraufwand ({items.length}× {eur(13)})</span>
          <span>{eur(p.sumRegiestunde)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Anfahrt</span>
          <span>{eur(p.anfahrt)}</span>
        </div>

        {p.mindermengenZuschlag > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Mindermengenzuschlag (&lt; 100 m)</span>
            <span>+ {eur(p.mindermengenZuschlag)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 border-t pt-2 mt-1">
          <span>Netto</span>
          <span>{eur(p.nettoGesamt)}</span>
        </div>

        <div className="flex justify-between text-gray-500">
          <span>MwSt. {Math.round(MWST_SATZ * 100)} %</span>
          <span>{eur(p.mwst)}</span>
        </div>

        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Gesamtpreis (brutto)</span>
          <span className="text-blue-700">{eur(p.bruttoGesamt)}</span>
        </div>
      </div>

      {/* Vergleich neue Fenster */}
      <div className="rounded-2xl overflow-hidden mb-5 border-2 border-green-200">
        <div className="bg-green-600 px-4 py-2.5 text-white text-sm font-bold flex items-center gap-2">
          💡 Vergleich: Was würden neue Fenster kosten?
        </div>
        <div className="bg-green-50 p-4 space-y-2 text-sm">
          <p className="text-gray-500 text-xs mb-3">
            Neue Fenster kosten ca. {NEUFENSTER_FAKTOR}× unseren Preis, eine Haustür ca. {HAUSTUER_FAKTOR}×.
          </p>

          {p.itemPrices.map(({ item, newWindowBrutto }, i) => (
            <div key={item.id} className="flex justify-between text-gray-600">
              <span>{i + 1}. Neues {item.label}</span>
              <span>{eur(newWindowBrutto)}</span>
            </div>
          ))}

          <div className="flex justify-between font-semibold text-gray-700 border-t pt-2">
            <span>Neue Fenster gesamt</span>
            <span>{eur(p.neufensterGesamt)}</span>
          </div>

          <div className="flex justify-between font-semibold text-gray-500">
            <span>Ihr Preis (Abdichtung)</span>
            <span>− {eur(p.bruttoGesamt)}</span>
          </div>

          <div className="bg-green-600 rounded-xl px-4 py-3 flex justify-between items-center mt-2">
            <span className="text-white font-bold text-base">💰 Sie sparen</span>
            <span className="text-white font-extrabold text-xl">{eur(p.ersparnis)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-6 text-center">
        * Endpreis wird nach kostenlosem Aufmaß-Termin vor Ort festgelegt.
      </p>

      <div className="space-y-3">
        <button
          onClick={onAccept}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          Rückruf anfordern →
        </button>
        <button
          onClick={onDecline}
          className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
        >
          Nein danke
        </button>
      </div>
    </div>
  );
}
