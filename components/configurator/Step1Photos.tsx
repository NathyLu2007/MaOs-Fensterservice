'use client';

import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

export interface PhotoBundle {
  windowPhotos: File[];
  sealPhoto: File | null;
}

interface Props {
  onNext: (bundle: PhotoBundle) => void;
}

function PhotoSlot({
  label, hint, preview, onAdd, onRemove, required,
}: {
  label: string; hint: string; preview: string | null;
  onAdd: () => void; onRemove: () => void; required?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Camera size={28} />
          <span className="text-sm mt-1">Foto aufnehmen / hochladen</span>
        </button>
      )}
    </div>
  );
}

function MultiPhotoSlots({
  files, previews, onAdd, onRemove, max,
}: {
  files: File[]; previews: string[];
  onAdd: () => void; onRemove: (i: number) => void; max: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {previews.map((src, i) => (
        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onRemove(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
            <X size={12} />
          </button>
        </div>
      ))}
      {files.length < max && (
        <button
          onClick={onAdd}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Camera size={22} />
          <span className="text-xs mt-1">Hinzufügen</span>
        </button>
      )}
    </div>
  );
}

export default function Step1Photos({ onNext }: Props) {
  const [windowFiles, setWindowFiles] = useState<File[]>([]);
  const [windowPreviews, setWindowPreviews] = useState<string[]>([]);
  const [sealFile, setSealFile] = useState<File | null>(null);
  const [sealPreview, setSealPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const windowInputRef = useRef<HTMLInputElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);

  function addWindowFiles(list: FileList | null) {
    if (!list) return;
    const newFiles = Array.from(list).slice(0, 3 - windowFiles.length);
    setWindowFiles((p) => [...p, ...newFiles]);
    setWindowPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))]);
    setError('');
  }

  function removeWindow(i: number) {
    setWindowFiles((p) => p.filter((_, idx) => idx !== i));
    setWindowPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  function addSeal(list: FileList | null) {
    if (!list || !list[0]) return;
    setSealFile(list[0]);
    setSealPreview(URL.createObjectURL(list[0]));
    setError('');
  }

  function handleNext() {
    if (windowFiles.length === 0) { setError('Bitte mindestens 1 Fenster-Foto hochladen.'); return; }
    if (!sealFile) { setError('Bitte ein Nahaufnahme-Foto der Dichtung hochladen.'); return; }
    onNext({ windowPhotos: windowFiles, sealPhoto: sealFile });
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Fotos hochladen</h2>
        <p className="text-gray-500 text-sm">Wir brauchen 2 Arten von Fotos für eine genaue Einschätzung.</p>
      </div>

      {/* Window photos */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="font-semibold text-gray-700 mb-1">
          1. Fenster-Gesamtansicht <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-400 mb-3">Ganzes Fenster sichtbar, gute Beleuchtung. Bis zu 3 Fotos.</p>
        <MultiPhotoSlots
          files={windowFiles} previews={windowPreviews}
          onAdd={() => windowInputRef.current?.click()}
          onRemove={removeWindow}
          max={3}
        />
        <input ref={windowInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => addWindowFiles(e.target.files)} />
      </div>

      {/* Seal close-up */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <PhotoSlot
          label="2. Nahaufnahme der alten Dichtung"
          hint="So nah wie möglich am Dichtungsgummi – KI erkennt daraus das Profil."
          preview={sealPreview}
          onAdd={() => sealInputRef.current?.click()}
          onRemove={() => { setSealFile(null); setSealPreview(null); }}
          required
        />
        <input ref={sealInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => addSeal(e.target.files)} />

        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
          📸 <strong>Tipp:</strong> Fenster leicht öffnen, Dichtung seitlich fotografieren. Je näher, desto besser.
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleNext}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
      >
        Weiter zur KI-Analyse →
      </button>
    </div>
  );
}
