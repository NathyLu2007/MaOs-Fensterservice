'use client';

import { calculatePrice, LineItem, PRICE_PER_WINDOW, PRICE_PER_METER } from '@/lib/pricing';

interface Props {
  items: LineItem[];
  onAccept: () => void;
  onDecline: () => void;
}

export default function Step4Price({ items, onAccept, onDecline }: Props) {
  const price = calculatePrice(items);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ihre Beispielrechnung</h2>
      <p className="text-gray-500 mb-4">Das ist eine unverbindliche Schätzung. Das genaue Angebot erhalten Sie nach telefonischer Rücksprache.</p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-5">
        ℹ️ <strong>Hinweis:</strong> Diese Berechnung ist kein verbindliches Angebot. Wir melden uns telefonisch bei Ihnen.
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-5">
        <p className="text-blue-200 text-sm mb-1">Beispielpreis (unverbindlich)</p>
        <p className="text-4xl font-bold mb-1">
          {price.totalMin} – {price.totalMax} €
        </p>
        <p className="text-blue-200 text-sm">inkl. Materialkosten & Montage</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-2">
        <p className="font-semibold text-gray-700 mb-2">Positionen:</p>
        {price.items.map(({ item, price: p, perimeter }, i) => (
          <div key={item.id} className="text-gray-600 py-1 border-b border-gray-100 last:border-0">
            <div className="flex justify-between">
              <span className="font-medium">{i + 1}. {item.label}</span>
              <span className="font-semibold">{p.toFixed(0)} €</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {item.widthCm}×{item.heightCm} cm · {perimeter} m Umfang · {item.condition}
              {' · '}{PRICE_PER_WINDOW} € + {perimeter} m × {PRICE_PER_METER} €/m
            </div>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between text-gray-600">
          <span>Zwischensumme</span>
          <span>{price.subtotal.toFixed(0)} €</span>
        </div>
        {price.travelFee > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Anfahrtspauschale</span>
            <span>+ {price.travelFee} €</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Gesamt (ca.)</span>
          <span>{price.total.toFixed(0)} €</span>
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
