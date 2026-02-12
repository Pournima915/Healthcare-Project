import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Home */
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";

/* Auth */
import PatientLogin from "./pages/auth/PatientLogin";
import PatientRegister from "./pages/auth/PatientRegister";

import DoctorLogin from "./pages/auth/DoctorLogin";
import DoctorRegister from "./pages/auth/DoctorRegister";

import AdminLogin from "./pages/auth/AdminLogin";

/* Dashboards */
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

/* Patient */
import BookAppointment from "./pages/patient/BookAppointment";

/* Video Consultation */
import PatientVideoCall from "./pages/video/PatientVideoCall";
import DoctorVideoCall from "./pages/video/DoctorVideoCall";
import VideoCall from "./pages/video/VideoCall";


/* Route Protection */
 import ProtectedRoute from "./routes/ProtectedRoute";
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />
<Route path="*" element={<Navigate to="/" />} />

        <Route path="/dashboard" element={
  <ProtectedRoute>  <Dashboard />  </ProtectedRoute> } />
  
        {/* AUTH */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />

        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* PATIENT */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute role="patient">
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/video-call"
          element={
            <ProtectedRoute role="patient">
              <PatientVideoCall />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/video-call"
          element={
            <ProtectedRoute role="doctor">
              <DoctorVideoCall />
            </ProtectedRoute>
          }
        />
        <Route
  path="/video-call"
  element={<VideoCall />}
/>

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

       

<Route
  path="/doctor/dashboard"
  element={
    <ProtectedRoute role="doctor">
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
