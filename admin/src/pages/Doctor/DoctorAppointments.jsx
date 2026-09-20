import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";

const StatusBadge = ({ status }) => {
  const styles = {
    Cancelled: "bg-red-50 text-red-600",
    Completed: "bg-green-50 text-green-600",
  };
  return (
    <span
      className={`text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const RowSkeleton = () => (
  <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-3.5 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
    <div className="h-6 w-16 bg-gray-200 rounded-full hidden sm:block" />
  </div>
);

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  // Local loading flag — the context's `appointments` array starts empty
  // regardless of whether a fetch is in flight, so without this the "No
  // Data" empty state would flash briefly on every load even when there
  // ARE appointments, just before they arrive.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await getAppointments();
      setIsLoading(false);
    };
    if (dToken) load();
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-3 sm:m-5">
      <p className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">
        All Appointments
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-xs sm:text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto">
        {/* Header — desktop only, mobile rows are self-labeled instead */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1fr_1fr] gap-1 px-5 py-3 bg-gray-50 font-medium text-gray-600 sticky top-0 rounded-t-2xl">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Date & Time</p>
          <p>Fee</p>
          <p>Action</p>
        </div>

        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 gap-1">
            <p className="text-gray-600 font-medium text-sm">
              No appointments yet
            </p>
            <p className="text-gray-400 text-xs">
              New bookings will show up here.
            </p>
          </div>
        ) : (
          appointments.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap justify-between items-center gap-y-2 gap-x-3 max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1fr_1fr] px-4 sm:px-5 py-3.5 border-b border-gray-100 sm:border-b-0 hover:bg-gray-50/70 transition-all"
            >
              {/* Index */}
              <p className="text-gray-400 max-sm:hidden">{index + 1}</p>

              {/* Patient Info — now with avatar for quicker scanning,
                  matching the pattern used on the admin side */}
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={item.userData?.image}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100 bg-blue-50"
                />
                <p className="font-medium text-gray-800 truncate">
                  {item.userData?.name || "Unknown"}
                </p>
              </div>

              {/* Payment badge */}
              <div>
                <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                  Cash
                </span>
              </div>

              {/* Date & Time */}
              <p className="text-gray-500 text-xs sm:text-sm">
                {item.slotDate},{" "}
                <span className="font-medium text-gray-800">
                  {item.slotTime}
                </span>
              </p>

              {/* Fee */}
              <p className="font-semibold text-gray-700">
                {item.docData?.fee} Rs
              </p>

              {/* Action buttons */}
              {item.cancelled ? (
                <StatusBadge status="Cancelled" />
              ) : item.isCompleted ? (
                <StatusBadge status="Completed" />
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => cancelAppointment(item._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    aria-label={`Cancel appointment with ${item.userData?.name || "patient"}`}
                  >
                    <img
                      src={assets.cancel_icon}
                      alt=""
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => completeAppointment(item._id)}
                    className="p-1.5 rounded-lg hover:bg-green-50 transition-all cursor-pointer"
                    aria-label={`Approve appointment with ${item.userData?.name || "patient"}`}
                  >
                    <img
                      src={assets.tick_icon}
                      alt=""
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
