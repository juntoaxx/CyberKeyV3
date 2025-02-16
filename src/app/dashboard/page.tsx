import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="grid gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <p className="text-gray-600">
                Your API keys will appear here once you create them.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
              <p className="text-gray-600">
                Track your API usage and manage your keys effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
