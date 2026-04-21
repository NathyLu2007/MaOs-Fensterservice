let sessionId: string;

function getSession(): string {
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return sessionId;
}

export async function track(event: string, step?: number, meta?: Record<string, unknown>) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: getSession(), event, step, meta }),
    });
  } catch {}
}
