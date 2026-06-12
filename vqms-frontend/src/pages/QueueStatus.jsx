import { useEffect, useState } from "react"
import { useLocation, Navigate, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function QueueStatus() {
  const location = useLocation()
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const queueNumberFromState = location.state?.queueNumber
  const expectedTimeFromState = location.state?.expectedTime

  const [queueNumber, setQueueNumber] = useState(queueNumberFromState)
  const [expectedTime, setExpectedTime] = useState(expectedTimeFromState)
  const [remainingMinutes, setRemainingMinutes] = useState()
  const [timerKey, setTimerKey] = useState(0)

  console.log(queueNumber, expectedTime)

  if (!queueNumber || !expectedTime) {
    return <Navigate to="/" />
  }


  useEffect(() => {
    if (location.state?.queueNumber) {
      setQueueNumber(location.state.queueNumber)
    }

    if (location.state?.expectedTime) {
      setExpectedTime(location.state.expectedTime)
    }
  }, [location.state])

  useEffect(() => {
    const targetTime = new Date(expectedTime)

    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = targetTime - now
      const minutes = Math.floor(diffMs / 60000)
      setRemainingMinutes(minutes)
      console.log(remainingMinutes)
    }, 1000)

    return () => clearInterval(timer)
  }, [expectedTime, timerKey])


  const handleCancel = async () => {
    try {
      const response = await fetch(`${BASE_URL}/queue/update_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueNumber,
          status: "CANCELLED",
        }),
      })

      if (response.ok) {
        navigate("/", {
          state: { message: "Your queue has been cancelled." },
        })
      }
    } catch (error) {
      console.error("Failed to cancel queue", error)

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (error instanceof TypeError) {
        toast.error("Service is currently unavailable.")
        return
      }

      toast.error("Something went wrong.")
    }
  }

  const handleAlreadyHere = async () => {
    try {
      const response = await fetch(`${BASE_URL}/queue/update_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueNumber,
          status: "ROOM_ASSIGNED",
        }),
      })

      if (response.ok) {
        navigate("/", {
          state: { message: "Your queue has been assigned to a room." },
        })
      }
    } catch (error) {
      console.error("Failed to assign room", error)

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (error instanceof TypeError) {
        toast.error("Service is currently unavailable.")
        return
      }

      toast.error("Something went wrong.")
    }
  }

  const handleReschedule = async () => {
    try {
      const response = await fetch(`${BASE_URL}/queue/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueNumber }),
      })

      if (response.ok) {
        const data = await response.json()
        setTimerKey(k => k + 1)
        navigate("/status", {
          replace: true,
          state: {
            queueNumber: data.queue_number,
            expectedTime: data.expected_appointment_time,
          },
        })
      }
    } catch (error) {
      console.error("Failed to reschedule queue", error)

      if (!navigator.onLine) {
        toast.error("You are offline. Please check your internet connection.")
        return
      }

      if (error instanceof TypeError) {
        toast.error("Service is currently unavailable.")
        return
      }

      toast.error("Something went wrong.")
    }
  }


  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">

      <div className="text-5xl font-bold text-blue-600 mb-4">
        {queueNumber}
      </div>

      <div className="border-t pt-4">
        <p className="text-gray-700">Estimated Wait Time</p>

        {remainingMinutes > 0 && (
          <p className="text-xl font-semibold text-teal-600">
            {remainingMinutes} Minutes
          </p>
        )}

        {remainingMinutes === 0 && (
          <p className="text-xl font-semibold text-orange-500">
            Please proceed to the waiting area
          </p>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-6">
        You will receive an SMS when it’s almost your turn.
      </p>

      {remainingMinutes < 1 && (
        <div className="flex gap-3 justify-center mt-6">

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            onClick={handleReschedule}
          >
            Reschedule
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleAlreadyHere}
          >
            Already Here
          </button>

        </div>
      )}
    </div>
  )
}
