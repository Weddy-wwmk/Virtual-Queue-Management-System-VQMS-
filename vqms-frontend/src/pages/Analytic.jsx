import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function Analytics() {
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [peopleInQueue, setPeopleInQueue] = useState(0);
  const [yesterdayVsToday, setYesterdayVsToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/analytics/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

     const data = await response.json();

    if(response.ok) {
       setTotalAppointments(data.totalAppointments);
      setPendingAppointments(data.pendingAppointments);
      setPeopleInQueue(data.peopleInQueue);
      setYesterdayVsToday(data.yesterdayVsToday);
    } else {
       setTotalAppointments(0);
      setPendingAppointments(0);
      setPeopleInQueue(0);
      setYesterdayVsToday([]);
    }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Analytics</h2>


        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500 font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalAppointments}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500 font-medium">Pending Appointments</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{pendingAppointments}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500 font-medium">Queue Length</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{peopleInQueue}</p>
            </div>
          </div>

          {/* Yesterday vs Today Graph */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Queue Per Service: Yesterday vs Today
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yesterdayVsToday} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="yesterday" fill="#8884d8" name="Yesterday" />
                <Bar dataKey="today" fill="#82ca9d" name="Today" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
    </div>
  );
}