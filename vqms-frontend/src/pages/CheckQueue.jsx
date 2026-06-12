import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"

export default function QueueStatus() {
  const [position, setPosition] = useState(0)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const phoneNo = searchParams.get("phone")
  const decodedPhone = decodeURIComponent(phoneNo);

  useEffect(() => {
    if (!decodedPhone) {
      setMessage("Invalid queue link.")
      setLoading(false)
      return
    }

    const fetchQueueStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/online/check-queue/${decodedPhone}`,
          { method: "GET" }
        )

        const data = await response.json()

        if (response.ok) {
          setPosition(data.position)
          setEstimatedWaitTime(data.estimated_wait)
          setMessage("Above is your expected position and wait time in the queue.")
        } else {
          setMessage(data.message || "Failed to fetch queue status.")
        }
      } catch (error) {
        console.error("Failed to fetch queue status", error)
        setMessage("Network error. Please try again.")

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

    fetchQueueStatus()
  }, [decodedPhone])

  const handleJoinQueue = async () => {
    if (!decodedPhone) return

    try {
      const response = await fetch(`${BASE_URL}/online/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo: decodedPhone }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Successfully joined the queue!")
        navigate("/status", {
          state: {
            queueNumber: data.queue_number,
            expectedTime: data.expected_appointment_time,
          },
        })
      } else {
        setMessage(data.message || "Failed to join the queue.")
      }
    } catch (error) {
      console.error("Failed to join queue", error)

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
  }

  if (loading) {
    return <p className="text-center">Loading queue status...</p>
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
      <p className="text-gray-600 mb-2">Expected Queue Position</p>

      <div className="text-5xl font-bold text-blue-600 mb-4">
        {position}
      </div>

      <div className="border-t pt-4">
        <p className="text-gray-700">Estimated Wait Time</p>
        <p className="text-xl font-semibold text-teal-600">
          {estimatedWaitTime} Minutes
        </p>
      </div>

      {message && (
        <p className="mt-4 text-gray-700">{message}</p>
      )}

      {position > 0 && (
        <button
          onClick={handleJoinQueue}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium mt-4"
        >
          Join Queue
        </button>
      )}
    </div>
  )
}
