import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const db = getDb();
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as {
    id: number; created_at: string; name: string; email: string; phone: string;
    window_type: string; condition: string; width_cm: number; height_cm: number;
    count: number; total_price: number; travel_fee: number; ai_notes: string; status: string;
  }[];

  const statusColor: Record<string, string> = {
    neu: 'bg-blue-100 text-blue-700',
    kontaktiert: 'bg-yellow-100 text-yellow-700',
    angenommen: 'bg-green-100 text-green-700',
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Anfragen Dashboard</h1>
          <span className="text-sm text-gray-500">{leads.length} Anfragen gesamt</span>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
            Noch keine Anfragen eingegangen.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-gray-800">{lead.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{lead.email} • {lead.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(lead.created_at).toLocaleString('de-DE')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-blue-600">{lead.total_price.toFixed(0)} €</p>
                    {lead.travel_fee > 0 && (
                      <p className="text-xs text-orange-500">inkl. {lead.travel_fee} € Anfahrt</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>🪟 {lead.window_type}</span>
                  <span>📐 {lead.width_cm} × {lead.height_cm} cm × {lead.count} Stück</span>
                  <span>⚡ Zustand: {lead.condition}</span>
                </div>
                {lead.ai_notes && (
                  <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                    KI: {lead.ai_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
