import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Navbar = ({ onMenuClick }) => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setdToken } = useContext(DoctorContext);

  const logout = () => {
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && setdToken("");
    dToken && localStorage.removeItem("dToken");
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hamburger — mobile only, toggles the Sidebar drawer */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1 rounded hover:bg-gray-100 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <img
            className="h-8 sm:h-10 md:h-12 w-auto cursor-pointer"
            src={assets.admin_logo}
            alt="MindAI Admin"
          />
          <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
            {aToken ? "Admin" : "Doctor"}
          </p>
        </div>
      </div>

      <button
        onClick={logout}
        className="bg-blue-800 text-white text-xs sm:text-sm px-5 sm:px-10 py-2 rounded-full cursor-pointer hover:bg-blue-900 active:scale-95 transition-all duration-150"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
