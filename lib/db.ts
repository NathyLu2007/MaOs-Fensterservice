import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'leads.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT (datetime('now')),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        window_type TEXT,
        condition TEXT,
        width_cm INTEGER,
        height_cm INTEGER,
        count INTEGER,
        total_price REAL,
        travel_fee REAL,
        ai_notes TEXT,
        seal_profile TEXT,
        status TEXT DEFAULT 'neu',
        photos TEXT
      )
    `);
    try { db.exec(`ALTER TABLE leads ADD COLUMN seal_profile TEXT`); } catch {}

  }
  return db;
}

export interface Lead {
  id?: number;
  created_at?: string;
  name: string;
  email: string;
  phone: string;
  window_type: string;
  condition: string;
  width_cm: number;
  height_cm: number;
  count: number;
  total_price: number;
  travel_fee: number;
  ai_notes: string;
  seal_profile?: string;
  status?: string;
  photos?: string;
}
