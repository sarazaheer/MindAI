import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-5 sm:px-6 md:px-10 lg:px-15 mt-4">
      {/* LEFT SIDE */}
      <div className="md:w-1/2 flex flex-col items-center text-center md:items-start md:text-left justify-center gap-4 py-8 sm:py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-xl sm:text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
          MindAI: Smart Conversations, <br className="hidden sm:block" />{" "}
          Seamless Appointments
        </p>
        <div className="flex flex-col text-white text-sm items-center gap-3 sm:gap-4 md:flex-row font-light">
          <img className="w-24 sm:w-28" src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of trusted Psychiatrists,
            <br className="hidden sm:block" /> schedule your appointment
            hassle-free
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
          <a
            href="#speciality"
            className="text-black flex justify-center items-center bg-white rounded-full shadow-md shadow-gray-500 px-6 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base gap-2 sm:gap-4 hover:bg-blue-200 hover:scale-105 transition-all duration-400 w-full sm:w-auto whitespace-nowrap"
          >
            Book Appointment
            <img src={assets.arrow_icon} alt="" className="w-3 flex-shrink-0" />
          </a>
          <button
            onClick={() => window.open("/chatbot")}
            className="text-black flex justify-center items-center bg-white rounded-full shadow-md shadow-gray-500 px-6 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base gap-2 sm:gap-4 hover:bg-blue-200 hover:scale-105 transition-all duration-400 cursor-pointer w-full sm:w-auto whitespace-nowrap"
          >
            Chat With MindAI
            <img src={assets.arrow_icon} alt="" className="w-3 flex-shrink-0" />
          </button>
        </div>
      </div>
      {/* RIGHT SIDE */}
      <div className="md:w-1/2 relative mt-6 md:mt-0">
        <img
          className="w-full md:absolute rounded-lg bottom-0 h-auto"
          src={assets.header_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Header;
