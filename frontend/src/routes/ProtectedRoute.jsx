import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {

  // Doctor protection
  if (role === "doctor") {
    const doctor = JSON.parse(localStorage.getItem("doctorAuth"));

if (!doctor) {
  return <Navigate to="/doctor/login" />;
}

 /*   if (!doctor) {
      return <Navigate to="/doctor/login" replace />;
    }
*/
    // Optional approval check
    if (doctor.status && doctor.status !== "approved") {
      return <Navigate to="/doctor/login" replace />;
    }
  }

  // Admin protection
  if (role === "admin") {
    if (!localStorage.getItem("adminAuth")) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  // Patient protection
  if (role === "patient") {
    if (!localStorage.getItem("patientAuth")) {
      return <Navigate to="/patient/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;