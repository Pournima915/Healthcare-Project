import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./i18n";

import Home from "./pages/Home";

import PatientLogin from "./pages/auth/PatientLogin";
import PatientRegister from "./pages/auth/PatientRegister";
import DoctorLogin from "./pages/auth/DoctorLogin";
import DoctorRegister from "./pages/auth/DoctorRegister";
import AdminLogin from "./pages/auth/AdminLogin";

import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";


import BookAppointment from "./pages/patient/BookAppointment";


import PatientVideoCall from "./pages/video/PatientVideoCall";
import DoctorVideoCall from "./pages/video/DoctorVideoCall";

import ProtectedRoute from "./routes/ProtectedRoute";

import ReschedulePage from "./pages/ReschedulePage";

import VoiceCall from "./pages/call/VoiceCall";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />

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
          path="/patient/reschedule/:id"
          element={
            <ProtectedRoute role="patient">
              <ReschedulePage />
            </ProtectedRoute>
          }
        />

        

       <Route path="/patient/video-call/:id" element={
  <ProtectedRoute role="patient">
    <PatientVideoCall />
  </ProtectedRoute>
} />

<Route path="/doctor/video-call/:id" element={
  <ProtectedRoute role="doctor">
    <DoctorVideoCall />
  </ProtectedRoute>
} />


<Route path="/voice-call/:roomId" element={<VoiceCall />} />


        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;