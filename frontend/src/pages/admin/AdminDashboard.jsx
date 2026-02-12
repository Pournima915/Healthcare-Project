import DashboardLayout from "../../components/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Patients" value="540" />
        <Card title="Doctors" value="48" />
        <Card title="Appointments" value="1,230" />
        <Card title="Pending Approvals" value="4" />
      </div>

      <Section title="System Alerts">
        <p>⚠️ Doctor verification pending</p>
        <p>✅ Server running normally</p>
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
