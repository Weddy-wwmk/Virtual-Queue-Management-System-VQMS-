import { useState } from "react";
import { toast } from "react-toastify"


export default function TellerDashboard() {
  const [phoneNo, setPhoneNo] = useState(""); // input field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleServePatient = async () => {
    if (!phoneNo) return setError("Please enter a phone number");

    setLoading(true);
    setError("");
    setPatientInfo(null);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${BASE_URL}/queue/status/${phoneNo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.msg || "Failed to query patient");
      }

      setPatientInfo(data);
    } catch (err) {
      setError(err.message);

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (error instanceof TypeError) {
        toast.error("Service is currently unavailable. Please try again later.")
        return
      }

      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Teller Dashboard
        </h1>


        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
        <input
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          placeholder="e.g. 254700000000"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          onClick={handleServePatient}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Querying..." : "Query Ticket Status"}
        </button>


        {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}


        {patientInfo && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p>
              <strong>Patient name:</strong> {patientInfo.patient_name}
            </p>
            <p>
              <strong>Status:</strong> {patientInfo.status}
            </p>
            <p>
              <strong>Position:</strong> {patientInfo.position}
            </p>
            <p>
              <strong>Estimated Wait:</strong> {patientInfo.estimated_wait} minutes
            </p>
            <p>
              <strong>Expected Appointment Time:</strong>{" "}
              {new Date(patientInfo.expected_appointment_time).toLocaleString()}
            </p>
            <p>
              <strong>Message:</strong> {patientInfo.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
