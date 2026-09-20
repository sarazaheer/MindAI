
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const navLinkClass = ({ isActive }) =>
  isActive ? "text-blue-500 border-b-2 border-blue-500 pb-1" : "";

// Same links shown in both the desktop nav bar and the mobile drawer, so
// they can never silently drift out of sync with each other.
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/doctors", label: "All Doctors" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const navigate = useNavigate();

  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // FIX: previously both the desktop nav links (`hidden md:flex`) and the
  // Sign In button (`hidden md:block`) had NO mobile equivalent at all —
  // a mobile visitor who wasn't signed in saw only the logo, with no way
  // to navigate to Home/Doctors/About/Contact or even reach the sign-in
  // page. This drawer is that missing mobile navigation.
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    navigate("/login");
    toast.error("Signed Out");
    setShowMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <div className="flex items-center justify-between bg-white py-4 px-3 sm:px-0 border-b border-b-gray-500 sticky top-0 z-50">
      {/* Logo */}
      <img
        src={assets.logo}
        alt="Logo"
        className="h-10 sm:h-14 cursor-pointer"
        onClick={() => {
          navigate("/");
          scrollTo(0, 0);
        }}
      />

      {/* Desktop Navigation */}
      <ul className="gap-5 text-gray-700 font-medium hidden md:flex items-start">
        {navLinks.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        {/* User avatar dropdown — shown on all screen sizes once logged in */}
        {token && userData ? (
          <div
            ref={menuRef}
            className="relative flex items-center gap-2"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <img
                src={userData.img}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <img
                src={assets.dropdown_icon}
                alt="Dropdown"
                className={`w-2.5 transition-transform hidden sm:block ${
                  showMenu ? "rotate-180" : ""
                }`}
              />
            </div>

            {showMenu && (
              <div className="absolute top-full right-0 pt-2 z-20">
                <div className="min-w-48 flex flex-col bg-white shadow-lg border rounded-lg p-5 text-gray-600 gap-4">
                  <p
                    onClick={() => {
                      navigate("/my-profile");
                      setShowMenu(false);
                    }}
                    className="hover:text-blue-500 cursor-pointer transition"
                  >
                    My Profile
                  </p>

                  <p
                    onClick={() => {
                      navigate("/my-appointments");
                      setShowMenu(false);
                    }}
                    className="hover:text-blue-500 cursor-pointer transition"
                  >
                    My Appointments
                  </p>

                  <p
                    onClick={logout}
                    className="hover:text-red-500 cursor-pointer transition"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
              scrollTo(0, 0);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer hidden md:block"
          >
            Sign in
          </button>
        )}

        {/* Hamburger — mobile only, opens the drawer below */}
        <button
          type="button"
          onClick={() => setShowMobileMenu(true)}
          className="md:hidden p-1.5 -mr-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MOBILE MENU BACKDROP */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] md:hidden"
          onClick={() => setShowMobileMenu(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE MENU DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          showMobileMenu ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!showMobileMenu}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <img src={assets.logo} alt="Logo" className="h-9" />
          <button
            type="button"
            onClick={() => setShowMobileMenu(false)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4 gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-gray-100">
          {token && userData ? (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  navigate("/my-profile");
                  setShowMobileMenu(false);
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  navigate("/my-appointments");
                  setShowMobileMenu(false);
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                My Appointments
              </button>
              <button
                onClick={logout}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setShowMobileMenu(false);
                scrollTo(0, 0);
              }}
              className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer text-sm font-medium"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
