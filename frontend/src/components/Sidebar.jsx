import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { HomeIcon, UserIcon, ClipboardIcon } from "@heroicons/react/24/solid";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const menu = {
    patient: [
      { name: "Home", to: "/dashboard/patient", icon: <HomeIcon className="w-5 h-5"/> },
      { name: "Appointments", to: "/dashboard/patient/appointments", icon: <ClipboardIcon className="w-5 h-5"/> },
      { name: "Profile", to: "/dashboard/patient/profile", icon: <UserIcon className="w-5 h-5"/> },
    ],
    doctor: [
      { name: "Home", to: "/dashboard/doctor", icon: <HomeIcon className="w-5 h-5"/> },
      { name: "Appointments", to: "/dashboard/doctor/appointments", icon: <ClipboardIcon className="w-5 h-5"/> },
      { name: "Profile", to: "/dashboard/doctor/profile", icon: <UserIcon className="w-5 h-5"/> },
    ],
    admin: [
      { name: "Home", to: "/dashboard/admin", icon: <HomeIcon className="w-5 h-5"/> },
      { name: "Manage Users", to: "/dashboard/admin/users", icon: <UserIcon className="w-5 h-5"/> },
      { name: "Reports", to: "/dashboard/admin/reports", icon: <ClipboardIcon className="w-5 h-5"/> },
    ]
  }

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-6 text-xl font-bold">TeleMed</div>
      <div className="flex-1">
        {menu[user.role].map((item) => (
          <Link key={item.name} to={item.to} className="flex items-center p-3 hover:bg-gray-700">
            {item.icon}
            <span className="ml-2">{item.name}</span>
          </Link>
        ))}
      </div>
      <button onClick={logout} className="p-3 bg-red-600 hover:bg-red-700 text-white m-3 rounded">Logout</button>
    </div>
  );
};

export default Sidebar;
