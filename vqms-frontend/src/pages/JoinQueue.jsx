import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"


export default function JoinQueue() {
  const navigate = useNavigate()

  const [fullname, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [service, setService] = useState("")
  const [message, setMessage] = useState("")
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!fullname || !phoneNumber || !service) {
      setMessage("Please fill in all fields.")
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/walkin/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullname, phone: phoneNumber, service: service
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully joined the queue! Your ticket number is ${data.ticketNumber}.`)
        setFullName("")
        setPhoneNumber("")
        setService("")
        navigate("/status", {
          state: {
            queueNumber: data.queue_number,
            expectedTime: data.expected_appointment_time
          }
        })
      } else {
        throw new Error(data.message || data.msg || "Failed to create appointment")
      }
    } catch (error) {
      console.error("Error joining queue:", error)
      setMessage("An error occurred. Please try again later.")

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (error instanceof TypeError) {
        toast.error("Service is currently unavailable. Please try again later.")
        return
      }

      toast.error(error.message || "Something went wrong. Please try again.")
    }
  }


  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Join Queue
      </h2>

      <label className="block text-sm text-gray-600 mb-1">
        Full Name
      </label>

      <input
        value={fullname}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="e.g. John Doe"
      />

      <label className="block text-sm text-gray-600 mb-1">
        Phone Number
      </label>

      <input
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="e.g. 07XXXXXXXX"
      />


      <label className="block text-sm text-gray-600 mb-1">
        Service
      </label>

      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="" disabled>
          Select a service
        </option>
        <option value="OPTICAL">Optical</option>
        <option value="DENTAL">Dental</option>
        <option value="GENERAL_CONSULTATION">General Consultation</option>
        <option value="LAB_TESTS">Lab Tests</option>
      </select>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
        Confirm & Join
      </button>

      {message && (
        <p className="mt-4 text-center text-gray-700">
          {message}
        </p>
      )}
    </div>
  )
}
