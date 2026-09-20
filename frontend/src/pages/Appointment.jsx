import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import BookingConfirmation from "../components/BookingConfirmation"; // adjust path to match your project structure
import { generateAvailableSlots, daysOfWeek } from "../utils/generateSlots"; // adjust path to match your project structure

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, backendUrl, token, getDoctorsData } = useContext(AppContext);

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlot, setdocSlot] = useState([]);
  const [slotIndex, setslotIndex] = useState(0);
  const [slotTime, setslotTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const fetchDocInfo = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };
  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);

  const getAvailableSlots = () => {
    // Now respects the doctor's own workingDays/workingHours/blockedDates
    // instead of the previous hardcoded "every day, 10am-9pm" assumption.
    setdocSlot(generateAvailableSlots(docInfo));
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Sign in To Book Appointment");
      navigate("/login");
      scrollTo(0, 0);
      return;
    }

    if (!docSlot[slotIndex] || docSlot[slotIndex].slots.length === 0) {
      toast.warn("Please select an available day first.");
      return;
    }
    if (!slotTime) {
      toast.warn("Please select a time slot before booking.");
      return;
    }

    setIsBooking(true);
    try {
      const date = docSlot[slotIndex].date;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } },
      );
      if (data.success) {
        getDoctorsData();
        // Show a confirmation screen instead of redirecting immediately —
        // gives the user a clear "you're booked" moment with the details.
        setConfirmedBooking({
          doctorName: docInfo.name,
          doctorImage: docInfo.image,
          speciality: docInfo.speciality,
          date: date.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          time: slotTime,
          fee: docInfo.fee,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    getAvailableSlots();
    setslotIndex(0);
    setslotTime("");
  }, [docInfo]);

  // Nicely formatted "Tue, Jul 8" for the sticky summary bar
  const selectedDateLabel =
    docSlot[slotIndex]?.date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) || "";

  return (
    docInfo && (
      <div className="px-3 sm:px-0">
        <button
          type="button"
          onClick={() => navigate("/doctors")}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors duration-200 cursor-pointer mt-4 mb-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Doctors
        </button>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex justify-center sm:block">
            <img
              className="bg-primary w-full max-w-[280px] sm:max-w-72 rounded-lg mt-4"
              src={docInfo.image}
              alt={`Dr. ${docInfo.name}`}
            />
          </div>
          {/* DOC INFO, NAME, EXPERIENCE */}
          <div className="flex-1 border border-gray-500 rounded-lg p-5 sm:p-8 py-6 sm:py-7 bg-white mx-0 mt-4 sm:mx-0">
            <p className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
              {docInfo.name}
              <img
                className="w-5"
                src={assets.verified_icon}
                alt="Verified doctor"
              />
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
              <p className="text-sm sm:text-md">
                {docInfo.degree}- {docInfo.speciality}
              </p>
              <span className="border-1 border-gray-300 text-black rounded-full px-4 py-1 text-xs sm:text-sm">
                {docInfo.experience}
              </span>
            </div>
            {/* DOC ABOUT */}
            <div>
              <p className="flex gap-2 items-center text-gray-700 mt-2 text-sm sm:text-md">
                About{" "}
                <img
                  className="w-4"
                  src={assets.info_icon}
                  alt=""
                  aria-hidden="true"
                />
              </p>
              <p className="text-sm text-gray-600 mt-2 text-justify leading-relaxed">
                {docInfo.about}
              </p>
            </div>
            <div>
              <p className="flex flex-wrap items-center text-sm mt-2 font-semibold">
                Appointment Fee:<span className="ml-2"> {docInfo.fee}rs.</span>
              </p>
            </div>
          </div>
        </div>
        {/* BOOKING SLOTS */}
        <div className="sm:ml-72 sm:pl-4 mt-6 sm:mt-4 font-medium text-gray-700 pb-24 sm:pb-4">
          <p className="text-sm sm:text-base">Booking Slots</p>
          <div
            role="group"
            aria-label="Select a day"
            className="flex gap-2 sm:gap-3 overflow-x-auto mt-4 items-center w-full pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide"
          >
            {docSlot.length > 0 &&
              docSlot.map((item, index) => {
                const isUnavailable = item.slots.length === 0;
                // Distinct, accurate labels instead of a generic "Full" for
                // every empty day — a patient seeing "Off" instead of
                // "Full" correctly understands the doctor simply doesn't
                // work that day, rather than assuming it's just busy.
                const reasonLabel =
                  item.unavailableReason === "full"
                    ? "Full"
                    : item.unavailableReason
                      ? "Off"
                      : null;
                return (
                  <button
                    type="button"
                    key={index}
                    disabled={isUnavailable}
                    aria-pressed={slotIndex === index}
                    title={
                      item.unavailableReason === "blocked"
                        ? "Doctor has blocked this date"
                        : item.unavailableReason === "day-off"
                          ? "Doctor doesn't work this day"
                          : item.unavailableReason === "full"
                            ? "Fully booked"
                            : undefined
                    }
                    onClick={() => {
                      setslotIndex(index);
                      setslotTime("");
                    }}
                    className={`text-center py-3 sm:py-5 min-w-14 sm:min-w-16 flex-shrink-0 cursor-pointer rounded-2xl border-1 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      slotIndex == index ? "bg-primary text-white" : ""
                    }`}
                  >
                    <p className="text-xs sm:text-sm">
                      {daysOfWeek[item.date.getDay()]}
                    </p>
                    <p className="text-sm sm:text-base">
                      {item.date.getDate()}
                    </p>
                    {reasonLabel && (
                      <p className="text-[10px] sm:text-xs mt-0.5 text-gray-500">
                        {reasonLabel}
                      </p>
                    )}
                  </button>
                );
              })}
          </div>
          {/* TIME */}
          <div
            role="group"
            aria-label="Select a time"
            className="flex items-center gap-3 sm:gap-4 w-full overflow-x-auto mt-4 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide"
          >
            {docSlot.length > 0 && docSlot[slotIndex]?.slots.length > 0 ? (
              docSlot[slotIndex].slots.map((item, index) => (
                <button
                  type="button"
                  key={index}
                  aria-pressed={item.time === slotTime}
                  onClick={() => {
                    setslotTime(item.time);
                  }}
                  className={`text-xs sm:text-sm font-light flex-shrink-0 px-4 sm:px-5 py-2 rounded-full cursor-pointer whitespace-nowrap ${
                    item.time == slotTime
                      ? "bg-primary text-white"
                      : "border-1 border-gray-300"
                  }`}
                >
                  {item.time.toLowerCase()}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {docSlot[slotIndex]?.unavailableReason === "day-off"
                  ? "The doctor doesn't work on this day."
                  : docSlot[slotIndex]?.unavailableReason === "blocked"
                    ? "The doctor has marked this date as unavailable."
                    : "No time slots available for this day."}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={isBooking}
            onClick={bookAppointment}
            className="hidden sm:inline-flex w-full sm:w-auto bg-primary text-white py-3 px-10 border-gray-300 rounded-full mt-10 sm:mt-16 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 justify-center items-center"
          >
            {isBooking ? "Booking..." : "Book an Appointment"}
          </button>
        </div>

        {/* STICKY SELECTED-SLOT SUMMARY BAR (mobile-first, also works on desktop) */}
        {slotTime && !confirmedBooking && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between gap-3 sm:hidden">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Selected</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {selectedDateLabel} · {slotTime.toLowerCase()}
              </p>
            </div>
            <button
              type="button"
              disabled={isBooking}
              onClick={bookAppointment}
              className="flex-shrink-0 bg-primary text-white text-sm font-medium px-6 py-2.5 rounded-full disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isBooking ? "Booking..." : "Book Now"}
            </button>
          </div>
        )}

        {/* Desktop persistent summary, shown inline near the button instead of a fixed bar */}
        {slotTime && !confirmedBooking && (
          <div className="hidden sm:flex sm:ml-72 sm:pl-4 items-center gap-2 text-sm text-gray-600 -mt-8 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Selected:{" "}
            <span className="font-medium text-gray-900">
              {selectedDateLabel} · {slotTime.toLowerCase()}
            </span>
          </div>
        )}

        <BookingConfirmation
          details={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onViewAppointments={() => navigate("/my-appointments")}
        />
      </div>
    )
  );
};

export default Appointment;
