import { useEffect, useState } from 'react';
import { listAQIReadings } from '../services/environment';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString();
}

//  AQI COLOR FUNCTION
function getAQIColor(aqi) {
  if (aqi <= 50) return "text-green-600 font-semibold";
  if (aqi <= 100) return "text-yellow-600 font-semibold";
  if (aqi <= 200) return "text-orange-600 font-semibold";
  return "text-red-600 font-semibold";
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
      <table className="min-w-full border border-gray-100 rounded-lg overflow-hidden">

        {/* HEADER */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Location</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">AQI</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Source</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">PM2.5</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">PM10</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Entered By</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="bg-white">
          {readings.map((reading) => (
            <tr key={reading.id} className="border-b hover:bg-gray-50 transition">

              <td className="px-4 py-3 text-sm text-gray-700">
                {formatDate(reading.timestamp)}
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                {reading.location?.name ?? '—'}
              </td>

              {/* COLORED AQI */}
              <td className={`px-4 py-3 text-sm ${getAQIColor(reading.aqi_value)}`}>
                {reading.aqi_value}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {reading.source_type}
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                {reading.pm25 ?? '—'}
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                {reading.pm10 ?? '—'}
              </td>

              <td className="px-4 py-3 text-sm text-gray-700">
                {reading.created_by ?? '—'}
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}