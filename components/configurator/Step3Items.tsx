'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { LineItem, ITEM_TYPES } from '@/lib/pricing';

interface Props {
  defaultCondition: string;
  onNext: (items: LineItem[]) => void;
}

let idCounter = 0;
function newId() { return String(++idCounter); }

function createItem(type: string, condition: string): LineItem {
  const def = ITEM_TYPES.find((t) => t.value === type) ?? ITEM_TYPES[0];
  return { id: newId(), type, label: def.label, widthCm: def.defaultW, heightCm: def.defaultH, condition };
}

export default function Step3Items({ defaultCondition, onNext }: Props) {
  const [items, setItems] = useState<LineItem[]>([createItem('fenster', defaultCondition)]);
  const [error, setError] = useState('');

  function addItem(type: string) {
    setItems((prev) => [...prev, createItem(type, defaultCondition)]);
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function update(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
    setError('');
  }

  function validate(): boolean {
    for (const item of items) {
      if (item.widthCm < 20 || item.widthCm > 500) { setError(`Breite bei "${item.label}" ungültig (20–500 cm).`); return false; }
      if (item.heightCm < 20 || item.heightCm > 500) { setError(`Höhe bei "${item.label}" ungültig (20–500 cm).`); return false; }
    }
    return true;
  }

  const CONDITIONS = [
    { value: 'gut', label: 'Gut' },
    { value: 'porös', label: 'Porös' },
    { value: 'beschädigt', label: 'Beschädigt' },
    { value: 'stark_beschädigt', label: 'Stark beschädigt' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Positionen erfassen</h2>
      <p className="text-gray-500 mb-5">Fügen Sie alle Fenster und Türen hinzu, die abgedichtet werden sollen.</p>

      <div className="space-y-4 mb-5">
        {items.map((item, idx) => (
          <div key={item.id} className="border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700 text-sm">
                {ITEM_TYPES.find(t => t.value === item.type)?.icon} {item.label} {idx + 1}
              </span>
              {items.length > 1 && (
                <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Breite (cm)</label>
                <input
                  type="number"
                  value={item.widthCm}
                  onChange={(e) => update(item.id, 'widthCm', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Höhe (cm)</label>
                <input
                  type="number"
                  value={item.heightCm}
                  onChange={(e) => update(item.id, 'heightCm', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Zustand</label>
              <select
                value={item.condition}
                onChange={(e) => update(item.id, 'condition', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Position hinzufügen</p>
        <div className="grid grid-cols-2 gap-2">
          {ITEM_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => addItem(t.value)}
              className="flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Plus size={14} />
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {items.length <= 2 && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-700 mb-4">
          ⚠ Bei 1–2 Positionen fällt eine Anfahrtspauschale von 50 € an.
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={() => { if (validate()) onNext(items); }}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
      >
        Preis berechnen ({items.length} {items.length === 1 ? 'Position' : 'Positionen'}) →
      </button>
    </div>
  );
}
