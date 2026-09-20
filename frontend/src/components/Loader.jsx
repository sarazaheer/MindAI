import React from "react";
import { assets } from "../assets/assets";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-6">
      {/* Logo */}
      <img
        src={assets.logo}
        alt="MindAI"
        className="w-32 sm:w-36 animate-pulse"
      />

      {/* Spinner */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>

      {/* Loading text */}
      <p className="text-gray-500 text-sm sm:text-base tracking-wide">
        Preparing your experience<span className="animate-pulse">...</span>
      </p>
    </div>
  );
};

export default Loader;
