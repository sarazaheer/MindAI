import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllAppointments = () => {
  const {
    aToken,
    appointments,
    getAllAppointments,
    cancelAppointment,
    completeAppointmentAdmin,
  } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  if (!appointments) {
    return (
      <div className="m-3 sm:m-5">
        <p className="text-sm sm:text-base text-gray-500">Loading ...</p>
      </div>
    );
  }
  if (appointments.length == 0) {
    return (
      <div className="m-3 sm:m-5">
        <p className="text-lg sm:text-2xl text-gray-700">
          {appointments.length} Booked Appointments
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-3 sm:m-5">
      <p className="mb-3 text-base sm:text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-xs sm:text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {/* Desktop header — hidden on mobile, where each card labels its own fields instead */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Date & Time</p>
          <p>Doctor's name</p>
          <p>Fee</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={index}
            className="sm:grid sm:grid-cols-[0.5fr_3fr_3fr_3fr_1fr_1fr] sm:items-center text-gray-500 py-3 px-4 sm:px-6 border-b hover:bg-gray-100"
          >
            {/* Index — desktop only */}
            <p className="hidden sm:block">{index + 1}</p>

            {/* MOBILE: labeled card layout */}
            <div className="sm:hidden flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    src={item.userData.img}
                    alt=""
                  />
                  <p className="font-medium text-gray-800 truncate">
                    {item.userData.name}
                  </p>
                </div>
                {item.cancelled ? (
                  <span className="text-red-400 text-xs font-medium flex-shrink-0">
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                  <span className="text-green-400 text-xs font-medium flex-shrink-0">
                    Completed
                  </span>
                ) : (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => completeAppointmentAdmin(item._id)}
                      className="p-1 cursor-pointer"
                      aria-label={`Mark appointment for ${item.userData.name} as completed`}
                      title="Mark Completed"
                    >
                      <img className="w-7" src={assets.tick_icon} alt="" />
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelAppointment(item._id)}
                      className="p-1 cursor-pointer flex-shrink-0"
                      aria-label={`Cancel appointment for ${item.userData.name}`}
                    >
                      <img className="w-7" src={assets.cancel_icon} alt="" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs bg-gray-50 rounded-lg p-2.5">
                <div>
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    Doctor
                  </p>
                  <p className="text-gray-700 truncate">{item.docData.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    Fee
                  </p>
                  <p className="text-gray-700">{item.docData.fee} rs</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                    Date & Time
                  </p>
                  <p className="text-gray-700">
                    {item.slotDate}, {item.slotTime}
                  </p>
                </div>
              </div>
            </div>

            {/* DESKTOP: original grid columns */}
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <img
                className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                src={item.userData.img}
                alt=""
              />
              <p className="truncate">{item.userData.name}</p>
            </div>

            <p className="hidden sm:block text-xs sm:text-sm">
              {item.slotDate}, {item.slotTime}
            </p>

            <div className="hidden sm:flex items-center min-w-0">
              <p className="truncate">{item.docData.name}</p>
            </div>
            <p className="hidden sm:block">
              {item.docData.fee}{" "}
              <span className="text-gray-500 text-xs sm:text-sm">rs</span>
            </p>
            <div className="hidden sm:block">
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-400 text-xs font-medium">Completed</p>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => completeAppointmentAdmin(item._id)}
                    className="p-1 cursor-pointer flex-shrink-0"
                    aria-label={`Mark appointment for ${item.userData.name} as completed`}
                    title="Mark Completed"
                  >
                    <img className="w-7 sm:w-8" src={assets.tick_icon} alt="" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelAppointment(item._id)}
                    className="p-1 cursor-pointer flex-shrink-0"
                    aria-label={`Cancel appointment for ${item.userData.name}`}
                  >
                    <img
                      className="w-7 sm:w-9"
                      src={assets.cancel_icon}
                      alt=""
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
