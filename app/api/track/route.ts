import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Analytics deaktiviert auf Vercel (kein persistentes Filesystem)
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ summary: [], funnel: [], recent: [] });
}
