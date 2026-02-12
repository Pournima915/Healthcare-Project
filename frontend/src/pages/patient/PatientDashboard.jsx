import DashboardLayout from "../../components/DashboardLayout";
import PatientAppointments from "../patient/PatientAppointments";

export default function PatientDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Upcoming Appointments" value="2" />
        <Card title="Doctors Consulted" value="5" />
        <Card title="Medical Reports" value="3" />
      </div>
         
    <li onClick={() => setActiveTab("appointments")}>📅 My Appointments</li>
    {activeTab === "appointments" && <PatientAppointments />}

      <Section title="Recent Activity">
        <p>🩺 Appointment booked with Dr. Sharma</p>
        <p>📄 Blood report uploaded</p>
      </Section>
    </DashboardLayout>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-8 bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
