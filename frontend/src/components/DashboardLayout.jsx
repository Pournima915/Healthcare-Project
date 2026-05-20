import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">TeleMedicine</h2>

        <p className="mb-4 text-sm opacity-80">
          Role: <span className="font-semibold capitalize">{user?.role}</span>
        </p>

        <ul className="space-y-3">
          <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
            Dashboard
          </li>
          <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
            Profile
          </li>
        </ul>
      </aside>

      {/* Logout */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

