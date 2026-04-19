import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Topbar = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div>Welcome, {user.name}</div>
    </div>
  );
};

export default Topbar;
