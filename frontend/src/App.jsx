import React, { Suspense, lazy } from "react";

import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

// Home stays eager since it's the landing page most users hit first.
import Home from "./pages/Home";

// Everything else is lazy-loaded: it only downloads when the user
// actually navigates there, keeping the initial bundle smaller.
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Doctor = lazy(() => import("./pages/Doctors.jsx"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Appointment = lazy(() => import("./pages/Appointment"));
const ChatBot = lazy(() => import("./pages/ChatBot.jsx"));

const App = () => {
  const location = useLocation();

  const currentPath = location.pathname;

  const hidelayout = currentPath === "/chatbot";
  return (
    <div className={hidelayout ? "h-0 p-0" : "mx-4 sm:mx-[10%]"}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      {/* Standardized once here so every toast.success/error/warn call
      across the whole app inherits the same position/duration — previously
      this could drift if individual pages passed their own options. */}
      {!hidelayout && <Navbar />}

      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/doctors/:speciality" element={<Doctor />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/chatbot" element={<ChatBot />} />
        </Routes>
      </Suspense>

      {!hidelayout && <Footer />}
    </div>
  );
};

export default App;
