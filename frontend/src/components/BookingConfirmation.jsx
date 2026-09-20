import React from "react";
import { assets } from "../assets/assets";

// Shown right after a successful booking, before navigating away.
// Gives the user a clear "you're booked" moment with the actual details,
// instead of an instant silent redirect to My Appointments.
const BookingConfirmation = ({ details, onViewAppointments, onClose }) => {
  if (!details) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center text-center gap-4">
        {/* Success icon */}
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Appointment Confirmed
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          You're all set. Here are your appointment details:
        </p>

        {/* Details card */}
        <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-3 text-left">
          <div className="flex items-center gap-3">
            {details.doctorImage && (
              <img
                src={details.doctorImage}
                alt={`Dr. ${details.doctorName}`}
                className="w-10 h-10 rounded-full object-cover bg-blue-50 flex-shrink-0"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {details.doctorName}
              </p>
              <p className="text-xs text-gray-500">{details.speciality}</p>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">{details.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-900">{details.time}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fee</span>
            <span className="font-medium text-gray-900">{details.fee}rs.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
          >
            Book Another
          </button>
          <button
            type="button"
            onClick={onViewAppointments}
            className="w-full sm:flex-1 bg-primary text-white font-medium px-6 py-2.5 text-sm rounded-full hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            View My Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
