import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login",);
  };

  return (
    <nav className="bg-white text-gray-800 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/main")}
      >
        Capital View
      </h1>

      {/* Nav links */}
      <div className="flex items-center space-x-6 text-sm font-medium">
        <button
          onClick={() => navigate("/home")}
          className="hover:text-blue-600 focus:outline-none"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/browse")}
          className="hover:text-blue-600 focus:outline-none"
        >
          Browse
        </button>
        <button
          onClick={handleLogout}
          className="hover:text-red-600 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
