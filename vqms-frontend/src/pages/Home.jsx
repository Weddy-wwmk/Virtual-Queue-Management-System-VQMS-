import {Link, useLocation, Navigate } from "react-router-dom"
import { useEffect,useRef } from "react";
import { toast } from "react-toastify";

export default function Home() {
  const location = useLocation()
  const shownRef = useRef(false);
  
  useEffect(() => {
    if (location.state?.message && !shownRef.current) {
      toast.success(location.state.message);
      shownRef.current = true;
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Welcome
      </h1>

      <p className="text-gray-600 mb-6">
        Please join the queue to be assisted by our staff.
      </p>

      <Link
        to="/join"
        className="block w-full bg-teal-600 hover:bg-teal-700 text-white p-3 mb-4 rounded-lg font-medium"
      >
        Join Queue
      </Link>

      <Link
        to="/query/ticket"
        className="block w-full bg-teal-600 hover:bg-teal-700 text-white p-3 mb-4 rounded-lg font-medium"
      >
        Check Queue Status
      </Link>

    </div>
  )
}
