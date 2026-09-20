import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { DoctorContext } from "../context/DoctorContext";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 py-3.5 px-6 md:px-9 cursor-pointer transition-colors duration-150 ${
    isActive
      ? "bg-[#F2F3FF] border-r-4 border-blue-800 font-semibold text-blue-800"
      : "hover:bg-gray-50"
  }`;

const adminLinks = [
  { to: "/admin-dashboard", icon: "home_icon", label: "Dashboard" },
  { to: "/appointment-page", icon: "appointment_icon", label: "Appointments" },
  { to: "/add-doctor", icon: "add_icon", label: "Add Doctor" },
  { to: "/doctors-list", icon: "people_icon", label: "Doctors List" },
  { to: "/users-list", icon: "people_icon", label: "Users" },
];

const doctorLinks = [
  { to: "/doctor-dashboard", icon: "home_icon", label: "Dashboard" },
  {
    to: "/doctor-appointments",
    icon: "appointment_icon",
    label: "Appointments",
  },
  { to: "/doctor-profile", icon: "people_icon", label: "Profile" },
];

// isOpen/onClose control the mobile slide-out drawer. On desktop (md+) the
// sidebar behaves exactly as before — a permanently visible left rail —
// regardless of isOpen.
const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  const links = aToken ? adminLinks : dToken ? doctorLinks : [];

  return (
    <>
      {/* Mobile backdrop — clicking it closes the drawer. Hidden on md+. */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed md:static top-0 left-0 h-full md:h-screen w-64 md:w-auto bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <ul className="text-[#515151] mt-5 md:min-w-72">
          {links.map((item) => (
            <NavLink
              key={item.to}
              className={navLinkClass}
              to={item.to}
              onClick={onClose} // closes the mobile drawer after navigating
            >
              <img
                src={assets[item.icon]}
                alt=""
                className="w-5 flex-shrink-0"
              />
              {/* Labels are always shown now — previously hidden below md,
                  which left mobile users with an unlabeled icon-only rail
                  and no way to tell Dashboard from Appointments at a glance. */}
              <p>{item.label}</p>
            </NavLink>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
