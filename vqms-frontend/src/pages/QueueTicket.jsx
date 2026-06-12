import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLoading } from "../context/LoadingContext";
import { toast } from "react-toastify"


export default function CheckStatus() {

  const navigate = useNavigate();

  const [queueNumber, setQueueNumber] = useState("");
  const [message, setMessage] = useState("");
  const { loading, setLoading } = useLoading();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!queueNumber) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(`${BASE_URL}/queue/get_queue_info/${queueNumber}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        navigate("/status", {
          state: {
            queueNumber: data.queue_number,
            expectedTime: data.expected_appointment_time
          }
        })
      }
    } catch (error) {
      console.error("Failed to reschedule queue", error)

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (error instanceof TypeError) {
        toast.error("Service is currently unavailable. Please try again later.")
        return
      }

      toast.error("Something went wrong. Please try again.")
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">

      <input
        value={queueNumber}
        onChange={(e) => setQueueNumber(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="OPT-1234-5678"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium">
        Check Status
      </button>

      {message && (
        <p className="mt-4 text-center text-gray-700">
          {message}
        </p>
      )}
    </div>
  )
}
