import React, { useState } from "react";
import { assets } from "../assets/assets";

// Note: Home.jsx already only mounts this component on a device's first
// visit (via the "mindai_visited" localStorage flag), so this component
// just needs to handle being closed for the current session.
const WelcomeModal = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center text-center gap-4 animate-[fadeIn_0.3s_ease-out]">
        <img src={assets.logo} alt="MindAI" className="w-24 sm:w-28" />

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome to <span className="primary">MindAI</span>
        </h2>

        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          Your trusted platform for connecting with psychiatrists, scheduling
          appointments, and getting support through our smart AI chatbot —
          all in one place.
        </p>

        <button
          onClick={() => setVisible(false)}
          className="w-full sm:w-auto bg-primary text-white font-medium px-8 py-3 rounded-full hover:scale-105 hover:bg-blue-600 transition-all duration-300 cursor-pointer mt-2"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;