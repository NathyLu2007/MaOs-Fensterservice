'use client';

import { SEAL_COLORS, SealColor } from '@/lib/sealColors';
import { CheckCircle } from 'lucide-react';

interface Props {
  selected: string;
  onChange: (color: SealColor) => void;
}

export default function SealColorPicker({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {SEAL_COLORS.map((color) => {
        const isSelected = selected === color.name;
        return (
          <button
            key={color.name}
            onClick={() => onChange(color)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
              isSelected ? 'border-blue-600 scale-105 shadow-md' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            {/* Color swatch */}
            <div
              style={{ backgroundColor: color.hex }}
              className="h-10 w-full flex items-center justify-center"
            >
              {isSelected && (
                <CheckCircle
                  size={18}
                  style={{ color: color.textColor }}
                  className="drop-shadow"
                />
              )}
            </div>
            {/* Label */}
            <div className="px-1 py-1.5 bg-white text-center">
              <p className="text-xs font-medium text-gray-700 leading-tight">{color.name}</p>
              <p className="text-xs text-gray-400 font-mono">{color.hex}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
