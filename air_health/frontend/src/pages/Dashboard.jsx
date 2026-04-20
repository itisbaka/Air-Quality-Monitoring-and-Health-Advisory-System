import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import AQIForm from "../components/AQIForm";
import AQIList from "../components/AQIList";
import AQIGraph from "../components/AQIGraph";

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
      const res = await axios.get("http://127.0.0.1:8000/api/environment/aqi-readings/");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching AQI data");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Welcome back, {user?.first_name || user?.username}
          </h1>
          <p className="text-sm text-gray-600">
            Role: <span className="font-medium">{user?.role}</span>
          </p>
        </header>

        {/* KPI */}
        <div className="mb-6">
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 w-64">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.length}
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* FORM */}
          <section className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Add AQI Reading
            </h2>
            <AQIForm onSuccess={() => setRefreshKey(k => k + 1)} />
          </section>

          {/* TABLE */}
          <section className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Latest AQI Readings
            </h2>
            <AQIList key={refreshKey} />
            <AQIGraph />
          </section>

        </div>
      </div>
    </div>
  );
}