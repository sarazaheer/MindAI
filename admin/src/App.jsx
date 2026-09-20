import React, { useContext, useState } from "react";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import { AdminContext } from "./context/AdminContext.jsx";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import AllAppointments from "./pages/Admin/AllAppointments.jsx";
import AddDoctor from "./pages/Admin/AddDoctor.jsx";
import DoctorsList from "./pages/Admin/DoctorsList.jsx";
import Users from "./pages/Admin/Users.jsx";
import { DoctorContext } from "./context/DoctorContext.jsx";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard.jsx";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments.jsx";
import DoctorProfile from "./pages/Doctor/DoctorProfile.jsx";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  // Controls the mobile Sidebar drawer. Desktop ignores this entirely
  // (Sidebar is always visible from md: up regardless of this state).
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return aToken || dToken ? (
    <div className="bg-[#F8F9FD] min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="light"
      />
      <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
      <div className="flex items-start">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="w-full">
          <Routes>
            {/* ADMIN ROUTES */}
            <Route path="/" element={<></>} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/appointment-page" element={<AllAppointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctors-list" element={<DoctorsList />} />
            <Route path="/users-list" element={<Users />} />
            {/* DOCTOR ROUTES */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route
              path="/doctor-appointments"
              element={<DoctorAppointments />}
            />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="light"
      />
    </>
  );
};

export default App;
