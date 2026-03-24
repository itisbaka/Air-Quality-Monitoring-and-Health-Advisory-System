import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import AQIForm from "../components/AQIForm";
import AQIList from "../components/AQIList";

export default function DashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    document.title = "Dashboard | Air Health";
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/aqi/");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching AQI data");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome back, {user?.first_name || user?.username}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Role: <span className="font-medium">{user?.role}</span>
          </p>
        </header>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-xl font-bold">{data.length}</p>
          </div>
        </div>

        {/* Main */}
        <div className="grid gap-8 lg:grid-cols-2">

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Add AQI Reading
            </h2>
            <AQIForm onSuccess={() => setRefreshKey(k => k + 1)} />
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Latest AQI Readings
            </h2>
            <AQIList key={refreshKey} />
          </section>

        </div>
      </div>
    </div>
  );
}