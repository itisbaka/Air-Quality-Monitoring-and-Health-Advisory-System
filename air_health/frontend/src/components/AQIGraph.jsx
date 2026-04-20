import { useEffect, useState } from "react";
import { listAQIReadings } from "../services/environment";

export default function AQIGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await listAQIReadings();
      setData(res);
    } catch (err) {
      console.error("Error fetching AQI data");
    }
  };

  return (
    <div className="mt-6 bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        AQI Trend (Simple View)
      </h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No data available</p>
      ) : (
        <ul className="space-y-2">
          {data.slice(-5).map((item) => (
            <li
              key={item.id}
              className="flex justify-between border-b pb-1 text-sm"
            >
              <span>
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
              <span className="font-semibold">
                AQI: {item.aqi_value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}