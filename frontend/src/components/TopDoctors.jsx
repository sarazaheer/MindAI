import React, { useContext } from "react";

import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import DoctorCard from "./DoctorCard"; // adjust path to match your project structure
import DoctorCardSkeleton from "./DoctorCardSkeleton"; // adjust path to match your project structure

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors, doctorsLoading, doctorsError, getDoctorsData } =
    useContext(AppContext);
  return (
    <div className="flex flex-col items-center gap-4 my-8 text-gray-900 px-3 md:mx-10 md:px-0">
      <h1 className="font-bold text-2xl sm:text-3xl text-center">
        Top <span className="primary">Doctors</span> to Book
      </h1>
      <p className="w-full sm:w-2/3 md:w-1/3 text-sm text-center">
        Simply browse through our extensive list of trusted doctors.
      </p>
      {doctorsLoading ? (
        <div
          className="w-full grid gap-4 pt-4 gap-y-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : doctorsError ? (
        <div className="w-full flex flex-col items-center justify-center text-center py-10 text-gray-500">
          <p className="text-sm">{doctorsError}</p>
          <button
            type="button"
            onClick={getDoctorsData}
            className="mt-3 text-sm text-primary underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : doctors.length > 0 ? (
        <div
          className="w-full grid gap-4 pt-4 gap-y-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          }}
        >
          {doctors.slice(0, 10).map((item) => (
            <DoctorCard key={item._id} doctor={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm py-10">
          No doctors available right now. Please check back soon.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="w-full sm:w-auto px-8 py-2.5 sm:py-2 cursor-pointer text-sm mt-6 sm:mt-10 rounded-full bg-gray-200 border-2 border-blue-400 hover:text-white hover:bg-blue-400 transition-all duration-200"
      >
        See More
      </button>
    </div>
  );
};

export default TopDoctors;
