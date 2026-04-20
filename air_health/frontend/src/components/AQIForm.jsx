import { useEffect, useMemo, useState } from 'react';
import { createAQIReading, createLocation, listLocations } from '../services/environment';

export default function AQIForm({ onSuccess }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [useNewLocation, setUseNewLocation] = useState(false);
  const [file, setFile] = useState(null);
  const [locationId, setLocationId] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [aqi, setAqi] = useState('');
  const [pm25, setPm25] = useState('');
  const [pm10, setPm10] = useState('');
  const [recordedAt, setRecordedAt] = useState(() =>
    new Date().toISOString().slice(0, 16)
    
);

  const [mode, setMode] = useState("manual");

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await listLocations();
      setLocations(data);
      if (data.length > 0) setLocationId(data[0].id);
    } catch (err) {
      setError(err?.message ?? 'Failed to load locations');
    }
  };

  const resetForm = () => {
    setAqi('');
    setPm25('');
    setPm10('');
    setRecordedAt(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode !== "manual") return;

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
        source_type: "manual",
        pm25: pm25 ? Number(pm25) : null,
        pm10: pm10 ? Number(pm10) : null,
      });

      resetForm();
      setSuccess('AQI reading saved successfully.');
      setTimeout(() => setSuccess(null), 4000);
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
    [locations]
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">

      {/* MODE */}
      <div>
        <label className="text-sm font-medium">Data Input Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        >
          <option value="manual">Manual Entry</option>
          <option value="csv">Upload Dataset</option>
          <option value="api">Fetch from API</option>
        </select>
      </div>

      {/* MANUAL */}
      {mode === "manual" && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>

            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded px-3 py-1 text-sm ${useNewLocation ? 'bg-slate-200' : 'bg-white border'}`}
                onClick={() => setUseNewLocation(false)}
              >
                Choose existing
              </button>

              <button
                type="button"
                className={`rounded px-3 py-1 text-sm ${useNewLocation ? 'bg-white border' : 'bg-slate-200'}`}
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
                className="w-full rounded border px-3 py-2"
              />
            ) : (
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                {locationOptions}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <input
                type="datetime-local"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">AQI value</label>
              <input
                type="number"
                min={0}
                max={500}
                value={aqi}
                onChange={(e) => setAqi(e.target.value)}
                required
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">PM2.5 (µg/m³)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={pm25}
                onChange={(e) => setPm25(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>

          </div>

          <div>
            <label className="text-sm font-medium">PM10 (µg/m³)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={pm10}
              onChange={(e) => setPm10(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          {success && <p className="text-green-600">{success}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-2.5 text-white font-semibold transition shadow-md"
          >
            {loading ? 'Saving…' : 'Save reading'}
          </button>
        </>
      )}

      {/* CSV */}
    {mode === "csv" && (
  <div className="border p-4 rounded bg-gray-50">
    <p className="text-sm mb-2">Upload AQI dataset (CSV)</p>

    <input
      type="file"
      accept=".csv"
      className="mb-3"
      onChange={(e) => setFile(e.target.files[0])}
    />

    {error && <p className="text-red-600 text-sm">{error}</p>}
    {success && <p className="text-green-600 text-sm">{success}</p>}

    <button
      type="button"
      className="bg-blue-600 text-white px-4 py-2 rounded"
      onClick={async () => {
        if (!file) {
          setError("Please select a CSV file");
          return;
        }

        try {
          setLoading(true);
          setError(null);
          setSuccess(null);

          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch(
            "http://127.0.0.1:8000/api/environment/upload-csv/",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.error || "Upload failed");
          }

          setSuccess(data.message || "Upload successful");
          if (onSuccess) onSuccess();

        } catch (err) {
          setError(err.message || "Upload failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Uploading..." : "Upload Dataset"}
    </button>
  </div>
)}

      {/* API */}
      {mode === "api" && (
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm mb-2">Fetch AQI from OpenAQ</p>

          <button
            type="button"
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                setSuccess(null);

                const res = await fetch("http://127.0.0.1:8000/api/environment/fetch-openaq/", {
                  method: "POST",
                });

                const data = await res.json();

                if (!res.ok) {
                  throw new Error(data?.error || "Failed to fetch data");
                }

                setSuccess(`Fetched AQI: ${data.aqi} (${data.location})`);
                if (onSuccess) onSuccess();

              } catch (err) {
                setError(err.message || "Failed to fetch OpenAQ data");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Fetching..." : "Fetch AQI"}
          </button>
        </div>
      )}

    </form>
  );
}