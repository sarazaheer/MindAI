import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import RescheduleModal from "../components/RescheduleModal"; // adjust path to match your project structure

// Turns "8_7_2026" + "02:30 PM" into a real Date object so we can tell
// upcoming appointments apart from past ones.
const getAppointmentDateTime = (item) => {
  const [day, month, year] = item.slotDate.split("_");
  return new Date(`${month}/${day}/${year} ${item.slotTime}`);
};

const formatSlotDate = (item) => {
  const dt = getAppointmentDateTime(item);
  if (isNaN(dt.getTime())) return item.slotDate; // fallback if parsing ever fails
  return dt.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Holds the appointment pending cancellation confirmation (or null).
  const [pendingCancel, setPendingCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Holds the appointment currently being rescheduled (or null).
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);

  const getUserAppointments = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/appointments",
        {},
        {
          headers: { token },
        },
      );

      if (data.success) {
        //BECAUSE WE WILL GET APPOINTMENTS IN REVERSE ORDER SO USED REVERSE METHOD
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancelAppointment = async () => {
    if (!pendingCancel) return;
    setIsCancelling(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId: pendingCancel._id },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsCancelling(false);
      setPendingCancel(null);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  // Split appointments into three groups: cancelled, past (completed or
  // simply already happened), and upcoming.
  const now = new Date();
  const cancelledAppointments = appointments.filter((a) => a.cancelled);
  const pastAppointments = appointments.filter(
    (a) => !a.cancelled && (a.isCompleted || getAppointmentDateTime(a) < now),
  );
  const upcomingAppointments = appointments.filter(
    (a) => !a.cancelled && !a.isCompleted && getAppointmentDateTime(a) >= now,
  );

  const tabs = [
    { key: "upcoming", label: "Upcoming", data: upcomingAppointments },
    { key: "past", label: "Past", data: pastAppointments },
    { key: "cancelled", label: "Cancelled", data: cancelledAppointments },
  ];

  const activeData = tabs.find((t) => t.key === activeTab)?.data || [];

  return (
    <div className="px-3 sm:px-0">
      <p className="mt-8 font-semibold text-lg">My Appointments</p>
      <hr className="text-gray-400 mb-4" />

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b animate-pulse"
            >
              <div className="w-32 h-32 bg-gray-200 rounded"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-200 rounded mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        // EMPTY STATE — no appointments booked at all yet
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3 text-gray-500">
          <p className="text-lg font-medium text-gray-700">
            You haven't booked anything yet
          </p>
          <p className="text-sm max-w-xs">
            Browse our trusted doctors and book your first appointment in a
            couple of taps.
          </p>
          <button
            type="button"
            onClick={() => navigate("/doctors")}
            className="mt-3 bg-primary text-white font-medium px-8 py-2.5 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <>
          {/* TABS */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm border transition-all duration-200 cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label} ({tab.data.length})
              </button>
            ))}
          </div>

          {/* ACTIVE TAB CONTENT */}
          {activeData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {activeTab === "upcoming" &&
                "No upcoming appointments. Time to book one?"}
              {activeTab === "past" && "No past appointments yet."}
              {activeTab === "cancelled" && "No cancelled appointments."}
            </div>
          ) : (
            <div>
              {activeData.map((item) => (
                <div
                  className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b"
                  key={item._id}
                >
                  <div>
                    <img
                      className="w-32 bg-indigo-50 rounded"
                      src={item.docData.image}
                      alt={`Dr. ${item.docData.name}`}
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    <p className="text-neutral-600 font-semibold">
                      {item.docData.name}
                    </p>
                    <p>{item.docData.speciality}</p>
                    <p className="text-neutral-600 font-semibold mt-4">
                      Address:{" "}
                    </p>
                    <p className="text-xs">{item.docData.address.line1}</p>
                    <p className="text-xs">{item.docData.address.line2}</p>
                    <p className="text-xs mt-4">
                      <span className="text-xs font-medium text-gray-700">
                        Date & Time:{" "}
                      </span>
                      {formatSlotDate(item)} | {item.slotTime}
                    </p>
                  </div>

                  <div className="flex flex-col justify-end gap-1">
                    {!item.cancelled && !item.isCompleted ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setReschedulingAppointment(item)}
                          className="border-blue-600 text-blue-600 py-2 px-6 cursor-pointer bg-white font-medium border rounded hover:bg-blue-600 hover:text-white transition-all duration-300"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingCancel(item)}
                          className="border-gray-400 py-2 px-6 cursor-pointer bg-white text-medium text-gray-600 border hover:bg-red-600 hover:text-white transition-all duration-300"
                        >
                          Cancel Appointment
                        </button>
                      </>
                    ) : item.isCompleted ? (
                      <p className="text-green-600 font-medium text-sm mt-2">
                        Appointment Completed
                      </p>
                    ) : (
                      <p className="text-red-500 font-medium text-sm mt-2">
                        Appointment Cancelled
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CANCEL CONFIRMATION DIALOG — prevents a misclick from instantly
          cancelling an appointment with no way back. */}
      {pendingCancel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 004.18 21h15.64a2 2 0 001.87-3l-8.18-14.14a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel this appointment?
            </h3>
            <p className="text-sm text-gray-500">
              Your appointment with{" "}
              <span className="font-medium text-gray-700">
                {pendingCancel.docData.name}
              </span>{" "}
              on {formatSlotDate(pendingCancel)} at {pendingCancel.slotTime}{" "}
              will be cancelled. This can't be undone.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setPendingCancel(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={confirmCancelAppointment}
                className="flex-1 py-2.5 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RESCHEDULE MODAL */}
      {reschedulingAppointment && (
        <RescheduleModal
          appointment={reschedulingAppointment}
          onClose={() => setReschedulingAppointment(null)}
          onRescheduled={() => {
            setReschedulingAppointment(null);
            getUserAppointments();
          }}
        />
      )}
    </div>
  );
};

export default MyAppointments;
