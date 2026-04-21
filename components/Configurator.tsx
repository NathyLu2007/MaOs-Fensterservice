'use client';

import { useState } from 'react';
import StepIndicator from './StepIndicator';
import Step1Photos, { PhotoBundle } from './configurator/Step1Photos';
import Step2Analysis, { AiResult } from './configurator/Step2Analysis';
import Step3Items from './configurator/Step3Items';
import Step5Contact from './configurator/Step5Contact';
import { LineItem } from '@/lib/pricing';
import { CheckCircle } from 'lucide-react';
import { track } from '@/lib/track';

export default function Configurator() {
  const [step, setStep] = useState(1);
  const [bundle, setBundle] = useState<PhotoBundle>({ windowPhotos: [], sealPhoto: null });
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Vielen Dank!</h2>
        <p className="text-gray-600 mb-2">Ihre Anfrage ist bei uns eingegangen.</p>
        <p className="text-gray-500 text-sm">Wir melden uns innerhalb von <strong>24 Stunden</strong> mit Ihrem verbindlichen Angebot.</p>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} />
      {step === 1 && (
        <Step1Photos onNext={(b) => { setBundle(b); track('photos_done', 1); setStep(2); }} />
      )}
      {step === 2 && (
        <Step2Analysis bundle={bundle} onNext={(r) => { setAiResult(r); track('analysis_confirmed', 2, { windowType: r.windowType, sealProfile: r.sealProfile }); setStep(3); }} />
      )}
      {step === 3 && aiResult && (
        <Step3Items
          defaultCondition={aiResult.condition}
          onNext={(i) => { setItems(i); track('items_done', 3, { count: i.length }); setStep(4); }}
        />
      )}
      {step === 4 && aiResult && (
        <Step5Contact
          aiResult={aiResult}
          items={items}
          bundle={bundle}
          onDone={() => { track('inquiry_sent', 4); setDone(true); }}
        />
      )}
    </div>
  );
}
