import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function TellerDashboard() {
  const [phoneNo, setPhoneNo] = useState("")
  const [service, setService] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const handleServePatient = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (!phoneNo || !service || !appointmentDate) {
        setMessage("Please fill in all fields.")
        setLoading(false)
        return
      }

      const token = localStorage.getItem("access_token")

      const response = await fetch(`${BASE_URL}/appointment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNo: phoneNo,
          serviceName: service,
          appointmentDate: appointmentDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Failed to create appointment")
      }

      setMessage(data.msg || "Appointment scheduled successfully")

      setPhoneNo("")
      setService("")
      setAppointmentDate("")

      navigate("/doctor/dashboard", {
        state: { message: "Appointment scheduled successfully!" },
      })

    } catch (err) {
      setError(err.message)

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (err instanceof TypeError) {
        toast.error("Service is currently unavailable. Please try again later.")
        return
      }

      toast.error(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Appointments
        </h1>

        <label className="block text-sm text-gray-600 mb-1">
          Patient Phone Number
        </label>

        <input
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          placeholder="e.g. 254700000000"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          value={service}
          placeholder="Select a service"
          onChange={(e) => setService(e.target.value)}
          className="w-full bg-white appearance-none border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="" disabled>
            Select a service
          </option>
          <option value="OPTICAL">Optical</option>
          <option value="DENTAL">Dental</option>
          <option value="GENERAL_CONSULTATION">General Consultation</option>
          <option value="LAB_TESTS">Lab Tests</option>
        </select>

        <DatePicker
          selected={appointmentDate}
          onChange={(date) => setAppointmentDate(date)}
          showTimeSelect
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          wrapperClassName="w-full"
          placeholderText="Select appointment date and time"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          minDate={new Date()}
          minTime={new Date(0, 0, 0, 8, 0)}
          maxTime={new Date(0, 0, 0, 17, 0)}
        />

        <button
          onClick={handleServePatient}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium"
        >
          {loading ? "Scheduling..." : "Schedule Appointment"}
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