import DashboardLayout from "../../components/DashboardLayout";

export default function DoctorDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Today Appointments" value="8" />
        <Card title="Total Patients" value="124" />
        <Card title="Pending Reports" value="6" />
      </div>

      <Section title="Today's Schedule">
        <p>👤 10:00 AM – Patient: Rahul</p>
        <p>👤 11:30 AM – Patient: Anita</p>
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
