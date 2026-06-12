import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function TellerDashboard() {
  const [queueNumber, setQueueNumber] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const handleServePatient = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const token = localStorage.getItem("access_token")

      const response = await fetch(`${BASE_URL}/queue/update_status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          queueNumber: queueNumber,
          status: "COMPLETED",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.msg || "Failed to serve patient")
      }

      setMessage(data.msg || "Patient served successfully")
      setQueueNumber("")
      navigate("/doctor/dashboard", { state: { message: "Patient served successfully!" } })
    } catch (err) {
      setError(err.message)

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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Complete Patient Service
        </h1>

        <label className="block text-sm text-gray-600 mb-1">
          Queue Number
        </label>
        <input
          value={queueNumber}
          onChange={(e) => setQueueNumber(e.target.value)}
          placeholder="e.g. OPT-2026-01-13-003"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          onClick={handleServePatient}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Completing..." : "Complete Appointment"}
        </button>

        {message && (
          <p className="text-green-600 text-sm text-center mt-4">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-600 text-sm text-center mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
