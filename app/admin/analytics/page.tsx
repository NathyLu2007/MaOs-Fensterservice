export const dynamic = 'force-dynamic';

interface SummaryRow { event: string; count: number; last_seen: string; }
interface FunnelRow { step: number; sessions: number; }
interface EventRow { id: number; ts: string; session_id: string; event: string; step: number | null; meta: string | null; }

const STEP_LABELS: Record<number, string> = {
  1: 'Fotos hochgeladen',
  2: 'KI-Analyse bestätigt',
  3: 'Positionen erfasst',
  4: 'Preis akzeptiert',
  5: 'Anfrage abgesendet',
};

const EVENT_LABELS: Record<string, string> = {
  photos_done: 'Fotos fertig',
  analysis_confirmed: 'Analyse bestätigt',
  items_done: 'Positionen fertig',
  price_accepted: 'Preis akzeptiert',
  price_declined: 'Preis abgelehnt',
  inquiry_sent: 'Anfrage abgesendet',
};

async function getData() {
  try {
    const Database = (await import('better-sqlite3')).default;
    const path = await import('path');
    const dbDir = process.env.DATA_DIR ?? process.cwd();
    const db = new Database(path.join(dbDir, 'analytics.db'));
    db.exec(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT DEFAULT (datetime('now')), session_id TEXT, event TEXT, step INTEGER, meta TEXT)`);
    const summary = db.prepare(`SELECT event, COUNT(*) as count, MAX(ts) as last_seen FROM events GROUP BY event ORDER BY count DESC`).all() as SummaryRow[];
    const funnel = db.prepare(`SELECT step, COUNT(DISTINCT session_id) as sessions FROM events WHERE step IS NOT NULL GROUP BY step ORDER BY step`).all() as FunnelRow[];
    const recent = db.prepare(`SELECT * FROM events ORDER BY ts DESC LIMIT 30`).all() as EventRow[];
    return { summary, funnel, recent };
  } catch {
    return { summary: [], funnel: [], recent: [] };
  }
}

export default async function AnalyticsPage() {
  const { summary, funnel, recent } = await getData();
  const maxSessions = funnel[0]?.sessions ?? 1;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Nutzungsanalyse</h1>
          <a href="/admin" className="text-sm text-blue-600 hover:underline">← Zurück</a>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Funnel – Wie weit kommen Nutzer?</h2>
          {funnel.length === 0 ? (
            <p className="text-gray-400 text-sm">Noch keine Daten.</p>
          ) : (
            <div className="space-y-3">
              {funnel.map((row) => (
                <div key={row.step}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Schritt {row.step}: {STEP_LABELS[row.step] ?? `Schritt ${row.step}`}</span>
                    <span className="font-semibold">{row.sessions} Nutzer ({Math.round(row.sessions / maxSessions * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.round(row.sessions / maxSessions * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Events gesamt</h2>
          {summary.length === 0 ? (
            <p className="text-gray-400 text-sm">Noch keine Daten.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Event</th>
                  <th className="pb-2 text-right">Anzahl</th>
                  <th className="pb-2 text-right">Zuletzt</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.event} className="border-b border-gray-50">
                    <td className="py-2 text-gray-700">{EVENT_LABELS[row.event] ?? row.event}</td>
                    <td className="py-2 text-right font-semibold">{row.count}</td>
                    <td className="py-2 text-right text-gray-400">{new Date(row.last_seen).toLocaleString('de-DE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent events */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Letzte 30 Events</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm">Noch keine Daten.</p>
          ) : (
            <div className="space-y-1 text-xs font-mono text-gray-500">
              {recent.map((row) => (
                <div key={row.id} className="flex gap-3 py-1 border-b border-gray-50">
                  <span className="text-gray-400 shrink-0">{new Date(row.ts).toLocaleString('de-DE')}</span>
                  <span className="text-blue-600 shrink-0">{EVENT_LABELS[row.event] ?? row.event}</span>
                  <span className="text-gray-400 truncate">{row.session_id?.slice(0, 8)} {row.meta ?? ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
