import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AQIForm from '../components/AQIForm';
import AQIList from '../components/AQIList';

export default function DashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.title = 'Dashboard | Air Health';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {user?.first_name || user?.username}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Role: <span className="font-medium">{user?.role}</span>. Environmental Officers can add AQI readings.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Add AQI Reading</h2>
            <p className="text-sm text-slate-600 mt-1">Create a new AQI entry for a location.</p>
            <AQIForm onSuccess={() => setRefreshKey((k) => k + 1)} />
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Latest AQI Readings</h2>
            <p className="text-sm text-slate-600 mt-1">View the most recent readings in the system.</p>
            <AQIList key={refreshKey} />
          </section>
        </div>
      </div>
    </div>
  );
}
