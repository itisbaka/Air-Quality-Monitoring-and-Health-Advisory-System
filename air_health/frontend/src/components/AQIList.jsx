import { useEffect, useState } from 'react';
import { listAQIReadings } from '../services/environment';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString();
}

export default function AQIList() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    listAQIReadings()
      .then((data) => setReadings(data))
      .catch((err) => setError(err?.message ?? 'Unable to load readings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="mt-4 text-sm text-slate-600">Loading...</p>;
  }

  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error}</p>;
  }

  if (readings.length === 0) {
    return <p className="mt-4 text-sm text-slate-600">No readings recorded yet.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Location</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">AQI</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Source</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">PM2.5</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Entered by</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {readings.map((reading) => (
            <tr key={reading.id} className="hover:bg-slate-50">
              <td className="px-3 py-2 text-sm text-slate-700">{formatDate(reading.timestamp)}</td>
              <td className="px-3 py-2 text-sm text-slate-700">{reading.location?.name ?? '—'}</td>
              <td className="px-3 py-2 text-sm text-slate-700">{reading.aqi_value}</td>
              <td className="px-3 py-2 text-sm text-slate-700">{reading.source_type}</td>
              <td className="px-3 py-2 text-sm text-slate-700">{reading.pm25 ?? '—'}</td>
              <td className="px-3 py-2 text-sm text-slate-700">{reading.created_by ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
