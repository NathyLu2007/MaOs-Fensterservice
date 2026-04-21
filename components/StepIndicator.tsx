'use client';

const STEPS = ['Fotos', 'Analyse', 'Maße', 'Preis', 'Kontakt'];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-xs mt-1 ${active ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-1 rounded mb-4 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
