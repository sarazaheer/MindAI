import React, { useState, useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { profileData, getProfileData, dToken, backendUrl } =
    useContext(DoctorContext);

  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState(""); // yyyy-mm-dd from a native date input

  // Local draft of editable fields. Previously (same issue we already
  // fixed once in MyProfile.jsx) every keystroke while editing wrote
  // straight into the shared profileData state — meaning a "Cancel"
  // action couldn't actually revert anything, since the edits had already
  // landed. Now nothing outside this component changes until Save
  // succeeds; Cancel just discards the draft.
  const [draft, setDraft] = useState(null);
  const [conflictInfo, setConflictInfo] = useState(null); // { message, conflicts: [...] } or null

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const startEdit = () => {
    setDraft({
      fee: profileData.fee,
      available: profileData.available,
      address: { ...profileData.address },
      workingDays: [...(profileData.workingDays || [0, 1, 2, 3, 4, 5, 6])],
      workingHours: {
        ...(profileData.workingHours || { start: "10:00", end: "21:00" }),
      },
      blockedDates: [...(profileData.blockedDates || [])],
    });
    setIsEdit(true);
  };

  const cancelEdit = () => {
    setDraft(null);
    setIsEdit(false);
    setNewBlockedDate("");
    setConflictInfo(null);
  };

  // Converts a native <input type="date"> value ("2026-07-08") into the
  // "day_month_year" string format used everywhere else in the app for
  // slot dates (e.g. "8_7_2026"), so blocked dates compare directly
  // against slotDate without any reformatting elsewhere.
  const toSlotDateFormat = (isoDate) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return `${day}_${month}_${year}`;
  };

  // Converts a "day_month_year" string back into a readable label for
  // display in the blocked-dates list.
  const formatBlockedDateLabel = (slotDateStr) => {
    const [day, month, year] = slotDateStr.split("_").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const toggleWorkingDay = (dayIndex) => {
    setDraft((prev) => {
      const current = prev.workingDays || [];
      const updated = current.includes(dayIndex)
        ? current.filter((d) => d !== dayIndex)
        : [...current, dayIndex].sort((a, b) => a - b);
      return { ...prev, workingDays: updated };
    });
  };

  // Quick-select shortcuts so a doctor doesn't have to click all 7 days
  // one at a time for the common cases.
  const setWorkingDaysPreset = (days) => {
    setDraft((prev) => ({ ...prev, workingDays: days }));
  };

  const workingHoursInvalid =
    isEdit &&
    draft?.workingHours?.start &&
    draft?.workingHours?.end &&
    draft.workingHours.start >= draft.workingHours.end;

  const addBlockedDate = () => {
    if (!newBlockedDate) return;
    const formatted = toSlotDateFormat(newBlockedDate);
    setDraft((prev) => {
      const current = prev.blockedDates || [];
      if (current.includes(formatted)) {
        toast.info("That date is already blocked.");
        return prev;
      }
      return { ...prev, blockedDates: [...current, formatted] };
    });
    setNewBlockedDate("");
  };

  const removeBlockedDate = (dateToRemove) => {
    setDraft((prev) => ({
      ...prev,
      blockedDates: (prev.blockedDates || []).filter((d) => d !== dateToRemove),
    }));
  };

  const updateProfile = async (confirmCancelConflicts = false) => {
    try {
      setIsDisabled(true);
      const updateData = {
        address: draft.address,
        fee: draft.fee,
        available: draft.available,
        workingDays: draft.workingDays,
        workingHours: draft.workingHours,
        blockedDates: draft.blockedDates,
        ...(confirmCancelConflicts && { confirmCancelConflicts: true }),
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dToken } },
      );
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        setDraft(null);
        setConflictInfo(null);
        getProfileData();
      } else if (data.conflictsFound) {
        // The backend refused to apply the change because it would orphan
        // existing upcoming appointments. Show exactly which ones, and
        // let the doctor explicitly decide rather than silently either
        // dropping the schedule change or silently cancelling patients
        // without them knowing why.
        setConflictInfo(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setIsDisabled(false);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const inputClass =
    "border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white transition-all";

  // Shared style for the "pressed/selected" state on toggle-style buttons.
  // Previously used bg-primary with white text — on this app's actual
  // primary color that combination is too low-contrast to read clearly.
  // blue-600 is a guaranteed-legible fallback, same fix already applied
  // to the Reschedule button elsewhere in this project.
  const activePillClass = "bg-blue-600 text-white border-blue-600";
  const inactivePillClass = "border-gray-300 text-gray-600 bg-white";

  // While editing, every field reads from the local draft; otherwise it
  // reads from the live profileData. Small helper so the JSX below
  // doesn't need an isEdit ternary on every single field.
  const view = isEdit ? draft : profileData;

  return (
    profileData && (
      <div className="px-3 sm:px-0 pb-8">
        <div className="flex flex-col gap-4 m-0 sm:m-5 max-w-3xl">
          {/* HEADER CARD — photo, name, degree/speciality, experience,
              availability toggle, and edit/save controls all live
              together at the top, consistent with how the patient-facing
              Appointment page presents a doctor. */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
              <img
                src={profileData.image}
                alt={`Dr. ${profileData.name}`}
                className="bg-primary w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                  {profileData.name}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-sm text-gray-500">
                  <span>
                    {profileData.degree} — {profileData.speciality}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">
                    {profileData.experience}
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      view.available ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      view.available ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {view.available
                      ? "Accepting appointments"
                      : "Not accepting appointments"}
                  </span>
                  {isEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          available: !prev.available,
                        }))
                      }
                      className={`ml-1 relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        draft.available ? "bg-green-500" : "bg-gray-300"
                      }`}
                      aria-label="Toggle accepting appointments"
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          draft.available ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                {isEdit ? (
                  <>
                    <button
                      disabled={isDisabled || workingHoursInvalid}
                      onClick={updateProfile}
                      className={`w-full sm:w-auto px-5 py-2 text-sm font-medium rounded-full transition-all ${
                        !isDisabled && !workingHoursInvalid
                          ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                          : "bg-gray-300 text-white cursor-not-allowed opacity-80"
                      }`}
                    >
                      {isDisabled ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={cancelEdit}
                      className="w-full sm:w-auto px-5 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEdit}
                    className="w-full sm:w-auto px-5 py-2 text-sm font-medium rounded-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ABOUT CARD (read-only — bio isn't editable from this form) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">About</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {profileData.about}
            </p>
          </div>

          {/* PRACTICE DETAILS CARD — fee + address */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <p className="text-sm font-semibold text-gray-800 mb-4">
              Practice Details
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Appointment Fee</p>
                {isEdit ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={draft.fee}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, fee: e.target.value }))
                      }
                      className={inputClass}
                    />
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      rs
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-800">
                    {profileData.fee} rs
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                {isEdit ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder="Address line 1"
                      value={draft.address.line1}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Address line 2"
                      value={draft.address.line2}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">
                    {profileData.address.line1}
                    {profileData.address.line2 && (
                      <>
                        <br />
                        {profileData.address.line2}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AVAILABILITY CARD — working days, hours, and one-off blocked
              dates. Previously every doctor was hardcoded to every day,
              10am-9pm, with no way to change it. */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <p className="text-sm font-semibold text-gray-800 mb-4">
              Availability
            </p>

            <div className="flex flex-col gap-5">
              {/* WORKING DAYS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Working Days
                  </p>
                  {isEdit && (
                    <div className="flex gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setWorkingDaysPreset([1, 2, 3, 4, 5])}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Weekdays
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWorkingDaysPreset([0, 1, 2, 3, 4, 5, 6])
                        }
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Every day
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {dayLabels.map((label, index) => {
                    const isActive = (
                      view.workingDays || [0, 1, 2, 3, 4, 5, 6]
                    ).includes(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={!isEdit}
                        onClick={() => toggleWorkingDay(index)}
                        className={`min-w-[44px] px-3 py-2 sm:py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                          isActive ? activePillClass : inactivePillClass
                        } ${
                          isEdit
                            ? "cursor-pointer active:scale-95"
                            : "cursor-default opacity-90"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {!isEdit && (
                  <p className="text-xs text-gray-400 mt-2">
                    {(profileData.workingDays || []).length === 7
                      ? "Working every day"
                      : (profileData.workingDays || []).length === 0
                        ? "No working days set"
                        : `${(profileData.workingDays || []).length} day${
                            (profileData.workingDays || []).length === 1
                              ? ""
                              : "s"
                          } per week`}
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* WORKING HOURS */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Working Hours
                </p>
                {isEdit ? (
                  <>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <input
                        type="time"
                        value={draft.workingHours?.start || "10:00"}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            workingHours: {
                              ...(prev.workingHours || {
                                start: "10:00",
                                end: "21:00",
                              }),
                              start: e.target.value,
                            },
                          }))
                        }
                        className={`${inputClass} w-auto`}
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={draft.workingHours?.end || "21:00"}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            workingHours: {
                              ...(prev.workingHours || {
                                start: "10:00",
                                end: "21:00",
                              }),
                              end: e.target.value,
                            },
                          }))
                        }
                        className={`${inputClass} w-auto`}
                      />
                    </div>
                    {workingHoursInvalid && (
                      <p className="text-xs text-red-500 mt-1.5">
                        End time must be after start time.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-700">
                    {profileData.workingHours?.start || "10:00"} –{" "}
                    {profileData.workingHours?.end || "21:00"}
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* BLOCKED DATES */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Blocked Dates (days off)
                </p>
                {isEdit && (
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                      type="date"
                      value={newBlockedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                      className={`${inputClass} sm:w-auto`}
                    />
                    <button
                      type="button"
                      disabled={!newBlockedDate}
                      onClick={addBlockedDate}
                      className="text-sm border border-blue-600 text-blue-600 rounded-full px-4 py-1.5 hover:bg-blue-600 hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600 flex-shrink-0"
                    >
                      Add Day Off
                    </button>
                  </div>
                )}

                {(view.blockedDates || []).length === 0 ? (
                  <p className="text-xs text-gray-400">No blocked dates set.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[...(view.blockedDates || [])]
                      .sort((a, b) => {
                        const [d1, m1, y1] = a.split("_").map(Number);
                        const [d2, m2, y2] = b.split("_").map(Number);
                        return (
                          new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2)
                        );
                      })
                      .map((d) => (
                        <span
                          key={d}
                          className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-full pl-3 pr-2 py-1"
                        >
                          {formatBlockedDateLabel(d)}
                          {isEdit && (
                            <button
                              type="button"
                              onClick={() => removeBlockedDate(d)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50"
                              aria-label={`Remove blocked date ${d}`}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE CONFLICT DIALOG — appears when saving availability
            changes would orphan one or more upcoming appointments. The
            doctor sees exactly who's affected before anything happens;
            confirming here cancels those specific appointments and
            emails each patient automatically. */}
        {conflictInfo && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-amber-600"
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
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    This affects existing appointments
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {conflictInfo.message} If you continue, these will be
                    cancelled and each patient will be notified by email.
                  </p>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 border border-gray-100 rounded-xl p-2 bg-gray-50">
                {conflictInfo.conflicts.map((c) => (
                  <div
                    key={c.appointmentId}
                    className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-700 font-medium truncate">
                      {c.patientName}
                    </span>
                    <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                      {c.slotDate}, {c.slotTime}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setConflictInfo(null)}
                  className="flex-1 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => updateProfile(true)}
                  className="flex-1 py-2.5 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {isDisabled ? "Cancelling..." : "Cancel & Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default DoctorProfile;
