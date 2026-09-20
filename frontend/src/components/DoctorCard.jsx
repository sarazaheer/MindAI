import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/appointment/${doctor._id}`)}
      className="text-left border-2 cursor-pointer border-blue-200 rounded-2xl hover:translate-y-[-10px] transition-all duration-500 overflow-hidden bg-white"
    >
      <img
        src={doctor.image}
        alt={`Dr. ${doctor.name}`}
        loading="lazy"
        className="bg-blue-50 w-full h-auto object-cover"
      />
      <div className="p-3 sm:p-4">
        <div
          className={`flex flex-row ${
            doctor.available ? "text-green-400 " : "text-gray-500"
          } gap-2 text-xs sm:text-sm items-center`}
        >
          <p
            aria-hidden="true"
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              doctor.available ? "bg-green-500" : "bg-gray-500"
            }`}
          ></p>
          <p>{doctor.available ? "Available" : "Not Available"}</p>
        </div>
        <p className="text-base sm:text-lg font-medium truncate">
          {doctor.name}
        </p>
        <p className="text-xs sm:text-sm">{doctor.speciality}</p>
      </div>
    </button>
  );
};

export default DoctorCard;
