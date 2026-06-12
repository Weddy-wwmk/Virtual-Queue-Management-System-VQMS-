import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import JoinQueue from "./pages/JoinQueue";
import QueueStatus from "./pages/QueueStatus";
import TellerLogin from "./pages/TellerLogin";
import TellerDashboard from "./pages/TellerDashboard";
import CheckQueue from "./pages/CheckQueue";
import Appointment from "./pages/Appointment";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorServe from "./pages/DoctorServe";
import QueueTicket from "./pages/QueueTicket";
import Analytics from "./pages/Analytic";
import PatientSearch from "./pages/PatientSearch";

import { LoadingProvider } from "./context/LoadingContext";
import GlobalSpinner from "./components/GlobalSpinner";

export default function App() {
  return (
    // Wrap the entire app with LoadingProvider
    <LoadingProvider>
      {/* Top-level spinner */}
      <GlobalSpinner />

      {/* Your routes */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<JoinQueue />} />
          <Route path="/status" element={<QueueStatus />} />
          <Route path="/teller/login" element={<TellerLogin />} />
          <Route path="/teller/dashboard" element={<TellerDashboard />} />
          <Route path="/queue/check" element={<CheckQueue />} />
          <Route path="/doctor/appointment" element={<Appointment />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/serve" element={<DoctorServe />} />
          <Route path="/query/ticket" element={<QueueTicket />} />
          <Route path="/analytics" element={<Analytics />} /> 
          <Route path="/patient/search" element={<PatientSearch />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> 
    </LoadingProvider>
  );
}
