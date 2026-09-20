// Shared server-side check for "is this specific slotDate/slotTime
// actually within this doctor's declared availability?" Used by both
// bookAppointment and rescheduleAppointment.
//
// This matters because the frontend slot picker only ever SHOWS valid
// slots — it doesn't stop a request from being crafted directly against
// the API for a day/time outside the doctor's working hours, a day
// they've blocked off, or a day of the week they don't work at all.
// Without this check, that request would previously have been accepted
// as long as the specific time slot wasn't already double-booked.
export const isSlotWithinAvailability = (doctor, slotDate, slotTime) => {
  const [day, month, year] = slotDate.split("_").map(Number);
  if (!day || !month || !year) return false;

  const requestedDate = new Date(year, month - 1, day);
  const dayOfWeek = requestedDate.getDay();

  const workingDays =
    doctor.workingDays?.length > 0 ? doctor.workingDays : [0, 1, 2, 3, 4, 5, 6];
  if (!workingDays.includes(dayOfWeek)) return false;

  const blockedDates = doctor.blockedDates || [];
  if (blockedDates.includes(slotDate)) return false;

  const workingHours = doctor.workingHours || { start: "10:00", end: "21:00" };
  const slotDateTime = new Date(`${month}/${day}/${year} ${slotTime}`);
  if (isNaN(slotDateTime.getTime())) return false;

  const [startHour, startMinute] = workingHours.start.split(":").map(Number);
  const [endHour, endMinute] = workingHours.end.split(":").map(Number);

  const startBoundary = new Date(slotDateTime);
  startBoundary.setHours(startHour, startMinute, 0, 0);
  const endBoundary = new Date(slotDateTime);
  endBoundary.setHours(endHour, endMinute, 0, 0);

  return slotDateTime >= startBoundary && slotDateTime < endBoundary;
};
