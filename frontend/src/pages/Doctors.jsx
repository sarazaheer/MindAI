import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import DoctorCard from "../components/DoctorCard";
import DoctorCardSkeleton from "../components/DoctorCardSkeleton";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors, doctorsLoading, doctorsError, getDoctorsData } =
    useContext(AppContext);
  const [filterDoc, setfilterDoc] = useState([]);
  const navigate = useNavigate();
  const applyFilter = () => {
    if (speciality) {
      setfilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setfilterDoc(doctors);
    }
  };
  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  const specialities = ["Forensic", "Addiction", "Clinical", "Child", "OCD"];

  return (
    <div className="px-3 sm:px-0">
      <p className="text-gray-600 mt-6 text-sm sm:text-base">
        Browse through the doctors specialist.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-6 sm:mt-16">
        {/* SPECIALITY FILTERS */}
        <div
          role="group"
          aria-label="Filter doctors by speciality"
          className="flex flex-row sm:flex-col text-sm text-gray-600 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible w-full sm:w-auto pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {specialities.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={speciality === item}
              onClick={() => {
                speciality === item
                  ? navigate("/doctors")
                  : navigate(`/doctors/${item}`);
              }}
              className={`flex-shrink-0 whitespace-nowrap text-center sm:text-left w-auto px-5 sm:px-12 pl-5 sm:pl-3 py-1.5 border border-gray-400 rounded transition-all duration-300 cursor-pointer ${
                speciality === item ? "bg-primary text-white scale-105" : ""
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* DOCTOR CARDS */}
        {doctorsLoading ? (
          <div
            className="w-full grid gap-4 gap-y-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : doctorsError ? (
          <div className="w-full flex flex-col items-center justify-center text-center py-16 text-gray-500">
            <p className="text-base sm:text-lg font-medium text-gray-700">
              Couldn't load doctors
            </p>
            <p className="text-sm mt-1">{doctorsError}</p>
            <button
              type="button"
              onClick={getDoctorsData}
              className="mt-4 text-sm text-primary underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : filterDoc.length > 0 ? (
          <div
            className="w-full grid gap-4 gap-y-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {filterDoc.map((item) => (
              <DoctorCard key={item._id} doctor={item} />
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center py-16 text-gray-500">
            <p className="text-base sm:text-lg font-medium">No doctors found</p>
            <p className="text-sm mt-1">
              {speciality
                ? `We couldn't find any doctors under "${speciality}" right now.`
                : "There are no doctors available right now."}
            </p>
            {speciality && (
              <button
                type="button"
                onClick={() => navigate("/doctors")}
                className="mt-4 text-sm text-primary underline cursor-pointer"
              >
                View all doctors
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
