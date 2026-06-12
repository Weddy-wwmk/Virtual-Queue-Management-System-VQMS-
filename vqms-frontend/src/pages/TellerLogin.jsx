import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLoading } from "../context/LoadingContext";
import { toast } from "react-toastify"


export default function TellerLogin() {

  const navigate = useNavigate();

  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { loading, setLoading } = useLoading();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!Username || !Password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: Username, password: Password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);

        if (data.role === "TELLER") {
          navigate("/teller/dashboard");
        } else if (data.role === "DOCTOR") {
          navigate("/doctor/dashboard");
        }

      } else {
        setMessage("Invalid credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("An error occurred. Please try again later.");

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
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Staff Login
      </h2>

      <input
        value={Username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Username"
      />

      <input
        value={Password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Password"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium">
        Login
      </button>

      {message && (
        <p className="mt-4 text-center text-gray-700">
          {message}
        </p>
      )}
    </div>
  )
}
