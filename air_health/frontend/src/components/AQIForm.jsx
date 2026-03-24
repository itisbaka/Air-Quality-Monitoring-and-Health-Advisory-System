import { useEffect, useMemo, useState } from 'react';
import { createAQIReading, createLocation, listLocations } from '../services/environment';

export default function AQIForm({ onSuccess }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [useNewLocation, setUseNewLocation] = useState(false);

  const [locationId, setLocationId] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [aqi, setAqi] = useState('');
  const [pm25, setPm25] = useState('');
  const [pm10, setPm10] = useState('');
  const [recordedAt, setRecordedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [sourceType, setSourceType] = useState('manual');

  const hasLocations = locations.length > 0;

  const loadLocations = async () => {
    try {
      const data = await listLocations();
      setLocations(data);
      if (data.length > 0) {
        setLocationId(data[0].id);
      }
    } catch (err) {
      setError(err?.message ?? 'Failed to load locations');
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const resetForm = () => {
    setAqi('');
    setPm25('');
    setPm10('');
    setRecordedAt(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let selectedLocationId = locationId;

      if (useNewLocation) {
        if (!newLocation.trim()) {
          throw new Error('Please enter a location name');
        }

        const created = await createLocation({ name: newLocation.trim() });
        selectedLocationId = created.id;
        await loadLocations();
        setUseNewLocation(false);
      }

      await createAQIReading({
        location_id: selectedLocationId,
        timestamp: new Date(recordedAt).toISOString(),
        aqi_value: Number(aqi),
        source_type: sourceType,
        pm25: pm25 ? Number(pm25) : null,
        pm10: pm10 ? Number(pm10) : null,
      });

      resetForm();
      setSuccess('AQI reading saved successfully.');
      setTimeout(() => setSuccess(null), 4500);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.payload?.detail ?? err?.message ?? 'Failed to create reading');
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = useMemo(
    () =>
      locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      )),
    [locations],
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded px-3 py-1 text-sm ${useNewLocation ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-700 border border-slate-300'}`}
            onClick={() => setUseNewLocation(false)}
          >
            Choose existing
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1 text-sm ${useNewLocation ? 'bg-white text-slate-700 border border-slate-300' : 'bg-slate-200 text-slate-800'}`}
            onClick={() => setUseNewLocation(true)}
          >
            Add new location
          </button>
        </div>

        {useNewLocation ? (
          <input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="New location name"
            className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        ) : (
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
           {locationOptions}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="recordedAt">
            Timestamp
          </label>
          <input
            id="recordedAt"
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="aqi">
            AQI value
          </label>
          <input
            id="aqi"
            type="number"
            min={0}
            max={500}
            value={aqi}
            onChange={(e) => setAqi(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="sourceType">
            Source type
          </label>
          <select
            id="sourceType"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="manual">Manual entry</option>
            <option value="sensor">Sensor</option>
            <option value="import">Import</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="pm25">
            PM2.5 (µg/m³)
          </label>
          <input
            id="pm25"
            type="number"
            step="0.1"
            min={0}
            value={pm25}
            onChange={(e) => setPm25(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {success ? <p className="text-sm text-green-600">{success}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-slate-800 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save reading'}
      </button>

      {!hasLocations && !useNewLocation ? (
        <p className="text-sm text-slate-500">
          No locations found yet. Click “Add new location” to create one.
        </p>
      ) : null}
    </form>
  );
}
