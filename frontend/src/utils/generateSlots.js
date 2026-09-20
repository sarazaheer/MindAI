export const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Shared slot-generation logic used by both Appointment.jsx and
// RescheduleModal.jsx.
//
// Returns an array of 7 day objects: { date, slots, unavailableReason }.
//
// IMPORTANT SHAPE CHANGE: previously this returned a flat array of slot
// arrays, and the UI derived each day's date/weekday label from the
// FIRST slot in that array (item[0].datetime). That silently broke on
// any day with zero slots — the label just rendered blank, with no way
// to tell a fully-booked day apart from a day the doctor doesn't work at
// all (both just looked like an empty gap). Now `date` is always present
// regardless of slot availability, and `unavailableReason` tells the UI
// exactly why a day has no bookable slots:
//   - "day-off"  → not one of the doctor's working days
//   - "blocked"  → doctor explicitly blocked this specific date off
//   - "full"     → a working day, but every slot is already booked
//   - null       → slots are available
export const generateAvailableSlots = (doctor) => {
  if (!doctor) return [];

  const workingDays =
    doctor.workingDays?.length > 0 ? doctor.workingDays : [0, 1, 2, 3, 4, 5, 6];
  const workingHours = doctor.workingHours || { start: "10:00", end: "21:00" };
  const blockedDates = doctor.blockedDates || [];

  const [startHour, startMinute] = workingHours.start.split(":").map(Number);
  const [endHour, endMinute] = workingHours.end.split(":").map(Number);

  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date();
    dayDate.setDate(today.getDate() + i);
    dayDate.setHours(0, 0, 0, 0);

    const day = dayDate.getDate();
    const month = dayDate.getMonth() + 1;
    const year = dayDate.getFullYear();
    const slotDateStr = `${day}_${month}_${year}`;
    const dayOfWeek = dayDate.getDay();

    const isBlocked = blockedDates.includes(slotDateStr);
    const isNonWorkingDay = !workingDays.includes(dayOfWeek);

    if (isNonWorkingDay || isBlocked) {
      days.push({
        date: dayDate,
        slots: [],
        unavailableReason: isBlocked ? "blocked" : "day-off",
      });
      continue;
    }

    let currentDate = new Date();
    currentDate.setDate(today.getDate() + i);
    const endTime = new Date();
    endTime.setDate(today.getDate() + i);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (today.toDateString() === currentDate.toDateString()) {
      const nowHour = currentDate.getHours();
      const startingHour = Math.max(
        startHour,
        nowHour > startHour ? nowHour + 1 : startHour,
      );
      currentDate.setHours(
        startingHour,
        currentDate.getMinutes() > 30 ? 30 : 0,
        0,
        0,
      );
    } else {
      currentDate.setHours(startHour, startMinute, 0, 0);
    }

    const timeSlots = [];
    while (currentDate < endTime) {
      const formattedTime = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const isBooked =
        doctor?.slots_booked?.[slotDateStr]?.includes(formattedTime);
      if (!isBooked) {
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });
      }
      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }

    days.push({
      date: dayDate,
      slots: timeSlots,
      unavailableReason: timeSlots.length === 0 ? "full" : null,
    });
  }

  return days;
};
