import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";
const SpecialityMenu = () => {
  return (
    <div
      className="flex flex-col items-center gap-4 py-10 sm:py-16 text-black px-3"
      id="speciality"
    >
      <h1 className="text-2xl sm:text-3xl font-medium text-center">
        Find by <span className="primary">Speciality</span>
      </h1>
      <p className="w-full sm:w-2/3 md:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors, schedule
        your appointment hassle-free.
      </p>
      <div className="flex justify-start sm:justify-center gap-4 pt-5 w-full overflow-x-auto pb-2 scrollbar-hide">
        {specialityData.map((item, idx) => (
          <Link
            key={idx}
            onClick={() => scroll(0, 0)}
            to={`/doctors/${item.speciality}`}
            className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500"
          >
            <img
              src={item.image}
              alt={`${item.speciality} speciality`}
              className="w-14 sm:w-24 mb-2"
            />
            <p>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
