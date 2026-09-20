import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";

const specialities = ["Forensic", "Clinical", "Child", "Addiction", "OCD"];

const DoctorsList = () => {
  const {
    doctors,
    aToken,
    getAllDoctors,
    changeAvailability,
    deleteDoctor,
    editDoctor,
  } = useContext(AdminContext);

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const openEdit = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name,
      speciality: doctor.speciality,
      degree: doctor.degree,
      experience: doctor.experience,
      fee: doctor.fee,
      about: doctor.about,
      address1: doctor.address?.line1 || "",
      address2: doctor.address?.line2 || "",
    });
  };

  const closeEdit = () => {
    setEditingDoctor(null);
    setForm(null);
  };

  const saveEdit = async () => {
    setIsSaving(true);
    const ok = await editDoctor(editingDoctor._id, {
      name: form.name,
      speciality: form.speciality,
      degree: form.degree,
      experience: form.experience,
      fee: form.fee,
      about: form.about,
      address: JSON.stringify({ line1: form.address1, line2: form.address2 }),
    });
    setIsSaving(false);
    if (ok) closeEdit();
  };

  const inputClass =
    "border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-800/30";

  return (
    <div className="m-3 sm:m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-base sm:text-lg font-medium">All Doctors</h1>
      <div
        className="grid gap-4 pt-5 gap-y-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {doctors.map((item, index) => (
          <div
            className="border border-gray-400 rounded-xl overflow-hidden group"
            key={index}
          >
            <img
              className="w-full h-auto object-cover bg-indigo-50 group-hover:bg-blue-500 transition-all duration-500"
              src={item.image}
              alt={`Dr. ${item.name}`}
            />
            <div className="p-3 sm:p-4">
              <p className="text-neutral-800 text-base sm:text-lg font-medium truncate">
                {item.name}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {item.speciality}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    onChange={() => changeAvailability(item._id)}
                    type="checkbox"
                    checked={item.available}
                    className="cursor-pointer"
                  />
                  <span>Available</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="text-xs text-blue-700 underline cursor-pointer flex-shrink-0"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDoctor(item._id)}
                    className="p-1 cursor-pointer flex-shrink-0"
                    aria-label={`Remove Dr. ${item.name}`}
                    title="Remove Doctor"
                  >
                    <img
                      src={assets.cancel_icon}
                      className="w-7 sm:w-8"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT DOCTOR MODAL — the UI for the admin's new "edit any doctor"
          capability. Note this only edits text/number fields, not the
          doctor's photo or password — those stay untouched here. */}
      {editingDoctor && form && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Dr. {editingDoctor.name}
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Speciality</p>
                <select
                  className={inputClass}
                  value={form.speciality}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, speciality: e.target.value }))
                  }
                >
                  {specialities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Degree</p>
                  <input
                    className={inputClass}
                    value={form.degree}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, degree: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <input
                    className={inputClass}
                    value={form.experience}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, experience: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Fee (rs)</p>
                <input
                  type="number"
                  className={inputClass}
                  value={form.fee}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fee: e.target.value }))
                  }
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <div className="flex flex-col gap-2">
                  <input
                    className={inputClass}
                    placeholder="Address line 1"
                    value={form.address1}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address1: e.target.value }))
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Address line 2"
                    value={form.address2}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address2: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">About</p>
                <textarea
                  className={inputClass}
                  rows={4}
                  value={form.about}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, about: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={isSaving}
                onClick={closeEdit}
                className="flex-1 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={saveEdit}
                className="flex-1 py-2.5 text-sm rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
