import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className="flex bg-primary rounded-lg px-6 sm:px-10 lg:px-14 my-10 md:mx-10">
      <div className="flex-1 py-10 sm:py-12 md:py-18 lg:py-22 lg:pl-5">
        <div className="text-xl md:text-3xl lg:text-5xl font-semibold text-white">
          <p>Book Appointment</p>
          <p className="mt-4"> with 1000+ Psychiatrists</p>
        </div>
        <button
          onClick={() => {
            navigate("/login");
            scrollTo(0, 0);
          }}
          className="bg-white rounded-full py-2 px-6 mt-8 hover:scale-110  transition-all duration-300 cursor-pointer"
        >
          Sign in
        </button>
      </div>
      <div className="hidden md:block md:w-1/2 lg:w-[370px] relative ">
        <img
          className="w-full absolute bottom-0 right-0 max-w-md mt-10"
          src={assets.appointment_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Banner;
