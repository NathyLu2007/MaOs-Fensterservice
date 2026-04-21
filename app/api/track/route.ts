import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  const dbDir = process.env.DATA_DIR ?? process.cwd();
  const db = new Database(path.join(dbDir, 'analytics.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      session_id TEXT,
      event TEXT,
      step INTEGER,
      meta TEXT
    )
  `);
  return db;
}

export async function POST(req: NextRequest) {
  try {
    const { session_id, event, step, meta } = await req.json();
    const db = getDb();
    db.prepare('INSERT INTO events (session_id, event, step, meta) VALUES (?, ?, ?, ?)')
      .run(session_id ?? null, event, step ?? null, meta ? JSON.stringify(meta) : null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const summary = db.prepare(`
      SELECT
        event,
        COUNT(*) as count,
        MAX(ts) as last_seen
      FROM events
      GROUP BY event
      ORDER BY count DESC
    `).all();

    const funnel = db.prepare(`
      SELECT step, COUNT(DISTINCT session_id) as sessions
      FROM events
      WHERE step IS NOT NULL
      GROUP BY step
      ORDER BY step
    `).all();

    const recent = db.prepare(`
      SELECT * FROM events ORDER BY ts DESC LIMIT 50
    `).all();

    return NextResponse.json({ summary, funnel, recent });
  } catch {
    return NextResponse.json({ error: 'Fehler' }, { status: 500 });
  }
}
