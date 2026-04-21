import Configurator from '@/components/Configurator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-bold text-gray-800">Fenster<span className="text-blue-600">Dicht</span></span>
        </div>
      </header>

      <section className="bg-white border-b border-gray-100 px-4 py-8">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Fensterdichtungen erneuern –<br />
            <span className="text-blue-600">Angebot in 3 Minuten</span>
          </h1>
          <p className="text-gray-500 mb-4">
            Fotos hochladen, Maße eingeben, Rückruf anfordern. Kein Vor-Ort-Termin für die Ersteinschätzung nötig.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>✓ Kostenlos & unverbindlich</span>
            <span>✓ KI-gestützt</span>
            <span>✓ In 3 Min fertig</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <Configurator />
        </div>
      </section>

    </main>
  );
}
