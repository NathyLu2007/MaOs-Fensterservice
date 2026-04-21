export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-4xl mb-4">📋</p>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Anfragen</h1>
        <p className="text-gray-500">Alle Anfragen werden per E-Mail an<br /><strong>social.media@maos-fensterservice.de</strong> gesendet.</p>
        <a href="/admin/analytics" className="mt-4 inline-block text-blue-600 hover:underline text-sm">Analytics →</a>
      </div>
    </main>
  );
}
