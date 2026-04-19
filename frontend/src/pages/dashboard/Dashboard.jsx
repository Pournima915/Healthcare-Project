import React, { useState, useEffect } from "react";
import { FaUser, FaNotesMedical, FaUserMd, FaClipboardList } from "react-icons/fa";

// Dummy user data for role simulation
const dummyUser = {
  name: "John Doe",
  role: "patient", // Change to "doctor" or "admin" to test
};

export default function Dashboard() {
  const [user, setUser] = useState(dummyUser);

  // Sidebar items per role
  const sidebarItems = {
    patient: [
      { name: "My Profile", icon: <FaUser /> },
      { name: "Medical Records", icon: <FaNotesMedical /> },
      { name: "Appointments", icon: <FaClipboardList /> },
    ],
    doctor: [
      { name: "My Profile", icon: <FaUser /> },
      { name: "Patients List", icon: <FaUserMd /> },
      { name: "Appointments", icon: <FaClipboardList /> },
    ],
    admin: [
      { name: "Dashboard", icon: <FaClipboardList /> },
      { name: "Manage Users", icon: <FaUser /> },
      { name: "Manage Doctors", icon: <FaUserMd /> },
    ],
  };

  // Dummy main content per role
  const mainContent = {
    patient: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Upcoming Appointments</h3>
          <p>No upcoming appointments</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Medical History</h3>
          <p>You have 3 previous consultations</p>
        </div>
      </div>
    ),
    doctor: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Today's Appointments</h3>
          <p>3 patients scheduled today</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Patient List</h3>
          <p>12 active patients</p>
        </div>
      </div>
    ),
    admin: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Total Users</h3>
          <p>Patients: 150 | Doctors: 20</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">System Logs</h3>
          <p>All systems running smoothly</p>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-6 flex flex-col">
        <div className="text-2xl font-bold mb-10">Telemedicine</div>
        <nav className="flex-1">
          {sidebarItems[user.role].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 cursor-pointer mb-2 transition"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="text-sm opacity-80">Logged in as: {user.name}</div>
          <div className="text-sm opacity-80">Role: {user.role}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          Welcome, {user.name}!
        </h1>
        {mainContent[user.role]}
      </main>
    </div>
  );
}
