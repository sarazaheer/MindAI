import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../assets/assets.js";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [img, setImg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local draft of the editable fields. Previously, typing into any edit
  // field mutated the GLOBAL userData directly via setUserData — meaning
  // half-finished, unsaved edits were visible everywhere in the app
  // (e.g. Navbar) and there was no way to back out of an edit. Now edits
  // only touch this local draft; nothing global changes until Save
  // succeeds.
  const [draft, setDraft] = useState(null);

  const startEdit = () => {
    setDraft({
      name: userData.name || "",
      phone: userData.phone || "",
      address: {
        line1: userData?.address?.line1 || "",
        line2: userData?.address?.line2 || "",
      },
      gender: userData.gender || "Male",
      dob: userData.dob ? userData.dob.split("T")[0] : "",
    });
    setIsEdit(true);
  };

  const cancelEdit = () => {
    setDraft(null);
    setImg(false);
    setIsEdit(false);
  };

  const updateUserProfileData = async () => {
    if (isLoading) return;
    // FIX: previously this loading flag was reset to false in `finally`
    // but never set to true before the request — so the double-submit
    // guard above never actually did anything, and the Save button showed
    // no "in progress" feedback.
    setIsLoading(true);
    try {
      const formData = new FormData();
      // NOTE: userId is intentionally no longer sent — the backend now
      // identifies the logged-in user from the auth token itself, not
      // from a client-supplied field (this closes a security gap where a
      // user could previously edit someone else's profile).
      formData.append("name", draft.name);
      formData.append("phone", draft.phone);
      formData.append("address", JSON.stringify(draft.address));
      formData.append("gender", draft.gender);
      formData.append("dob", draft.dob);

      img && formData.append("img", img);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } },
      );
      if (data.success) {
        toast.success("Profile Updated Successfully");
        await loadUserProfileData();
        setIsEdit(false);
        setDraft(null);
        setImg(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm mt-10 px-3 sm:px-0">
      {isEdit ? (
        <label htmlFor="img">
          <div className="inline-block relative cursor-pointer">
            <img
              src={img ? URL.createObjectURL(img) : userData.img}
              alt="Your profile"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded object-cover opacity-75"
            />
            {!img && (
              <img
                src={assets.upload_icon}
                alt=""
                aria-hidden="true"
                className="w-10 sm:w-12 absolute bottom-2 right-2"
              />
            )}
          </div>
          <input
            onChange={(e) => setImg(e.target.files[0])}
            type="file"
            accept="image/*"
            id="img"
            hidden
          />
        </label>
      ) : (
        <img
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-md object-cover"
          src={userData?.img}
          alt="Your profile"
        />
      )}

      {isEdit ? (
        <div className="flex flex-col gap-1 mt-4">
          <label htmlFor="profile-name" className="sr-only">
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            className="border bg-gray-50 border-gray-600 rounded px-2 py-1 text-xl sm:text-3xl font-medium w-full sm:max-w-60"
            placeholder="Enter Your Name"
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, name: e.target.value }))
            }
            value={draft?.name || ""}
          />
        </div>
      ) : (
        <p className="font-medium text-2xl sm:text-3xl mt-4 text-neutral-800">
          {userData?.name || ""}
        </p>
      )}

      <hr className="bg-zinc-300 h-[1px] border-none" />
      <div>
        <p className="text-neutral-500 underline mt-3 text-xs sm:text-sm">
          CONTACT INFORMATION
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-x-4 gap-y-1 sm:gap-y-2.5 mt-3 text-zinc-700">
        <p className="font-medium">EMAIL ID:</p>
        <p className="text-blue-500 break-all mb-2 sm:mb-0">
          {userData?.email || "N/A"}
        </p>

        <p className="font-medium">Phone No.</p>
        {isEdit ? (
          <input
            type="tel"
            className="bg-gray-100 rounded px-2 py-1 w-full sm:max-w-52 mb-2 sm:mb-0"
            placeholder="Enter Your Phone"
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, phone: e.target.value }))
            }
            value={draft?.phone || ""}
          />
        ) : (
          <p className="text-blue-500 mb-2 sm:mb-0">
            {userData?.phone || "N/A"}
          </p>
        )}

        <p className="font-medium">Address:</p>
        {isEdit ? (
          <div className="flex flex-col gap-1.5">
            <input
              className="bg-gray-100 rounded px-2 py-1 w-full sm:max-w-52"
              type="text"
              placeholder="Address line 1"
              value={draft?.address?.line1 || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  address: { ...prev.address, line1: e.target.value },
                }))
              }
            />
            <input
              className="bg-gray-100 rounded px-2 py-1 w-full sm:max-w-52"
              type="text"
              placeholder="Address line 2"
              value={draft?.address?.line2 || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  address: { ...prev.address, line2: e.target.value },
                }))
              }
            />
          </div>
        ) : (
          <p>
            {userData?.address?.line1} <br /> {userData?.address?.line2}
          </p>
        )}
      </div>

      <div>
        <p className="text-neutral-500 underline mt-3 text-xs sm:text-sm">
          BASIC INFORMATION
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-x-4 gap-y-1 sm:gap-y-2.5 mt-3 text-neutral-500">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="w-full sm:max-w-28 bg-gray-100 rounded px-2 py-1 mb-2 sm:mb-0"
              value={draft?.gender || "Male"}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p className="text-gray-400 mb-2 sm:mb-0">
              {userData?.gender || "N/A"}
            </p>
          )}

          <p className="font-medium">Date of Birth:</p>
          {isEdit ? (
            <input
              className="w-full sm:max-w-36 bg-gray-100 rounded px-2 py-1"
              // FIX: was type="Date" (capital D) — HTML input types are
              // case-sensitive, so this was silently falling back to a
              // plain text field instead of a real date picker.
              type="date"
              value={draft?.dob || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{userData?.dob || "N/A"}</p>
          )}
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        {isEdit ? (
          <>
            <button
              disabled={isLoading}
              className="flex-1 sm:flex-none border border-gray-400 rounded-2xl px-6 py-2 cursor-pointer hover:scale-105 hover:bg-blue-600 hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={updateUserProfileData}
            >
              {isLoading ? "Saving..." : "Save Info"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={cancelEdit}
              className="flex-1 sm:flex-none border border-gray-300 text-gray-500 rounded-2xl px-6 py-2 cursor-pointer hover:bg-gray-100 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="w-full sm:w-auto border border-gray-400 rounded-2xl px-6 py-2 cursor-pointer hover:scale-105 hover:bg-blue-600 hover:text-white transition-all duration-300"
            onClick={startEdit}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
