import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { generateAvailableSlots, daysOfWeek } from "../utils/generateSlots"; // adjust path to match your project structure

// Reuses the shared generateAvailableSlots utility (same one used by
// Appointment.jsx), which respects the doctor's own
// workingDays/workingHours/blockedDates and checks availability against
// the doctor's CURRENT slots_booked pulled live from context, so it
// reflects real-time availability rather than anything stale.
const RescheduleModal = ({ appointment, onClose, onRescheduled }) => {
  const { backendUrl, token, doctors, getDoctorsData } = useContext(AppContext);
  const [docSlot, setDocSlot] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const doctor = doctors.find((d) => d._id === appointment.docId);

  useEffect(() => {
    setDocSlot(generateAvailableSlots(doctor));
  }, [doctor]);

  const confirmReschedule = async () => {
    if (!docSlot[slotIndex] || docSlot[slotIndex].slots.length === 0) {
      toast.warn("Please select an available day first.");
      return;
    }
    if (!slotTime) {
      toast.warn("Please select a time slot.");
      return;
    }

    const date = docSlot[slotIndex].date;
    const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

    setIsSaving(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/reschedule-appointment",
        { appointmentId: appointment._id, slotDate, slotTime },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData(); // refresh slot availability app-wide
        onRescheduled();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Reschedule Appointment
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          With Dr. {doctor.name} — currently {appointment.slotDate},{" "}
          {appointment.slotTime}
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {docSlot.map((item, index) => {
            const isUnavailable = item.slots.length === 0;
            // Same accurate labeling as Appointment.jsx — "Off" for a day
            // the doctor doesn't work or has blocked, "Full" only when
            // every slot on an actual working day is already taken.
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
                  setSlotIndex(index);
                  setSlotTime("");
                }}
                className={`text-center py-3 min-w-14 flex-shrink-0 rounded-2xl border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  slotIndex === index
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300"
                }`}
              >
                <p className="text-xs">{daysOfWeek[item.date.getDay()]}</p>
                <p className="text-sm">{item.date.getDate()}</p>
                {reasonLabel && (
                  <p className="text-[10px] text-gray-500">{reasonLabel}</p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mt-3 scrollbar-hide">
          {docSlot[slotIndex]?.slots.length > 0 ? (
            docSlot[slotIndex].slots.map((item, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`text-xs flex-shrink-0 px-4 py-2 rounded-full cursor-pointer whitespace-nowrap ${
                  item.time === slotTime
                    ? "bg-primary text-white"
                    : "border border-gray-300"
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

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmReschedule}
            disabled={isSaving}
            className="flex-1 py-2.5 text-sm rounded-full bg-primary text-white hover:scale-105 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? "Rescheduling..." : "Confirm New Slot"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
