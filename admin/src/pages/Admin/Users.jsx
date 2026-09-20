import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const Users = () => {
  const { aToken, users, getAllUsers, deleteUser } = useContext(AdminContext);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllUsers();
    }
  }, [aToken]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteUser(pendingDelete._id);
    setPendingDelete(null);
  };

  return (
    <div className="m-3 sm:m-5">
      <h1 className="text-base sm:text-lg font-medium mb-4">All Users</h1>

      {users.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No registered users yet.
        </p>
      ) : (
        <div
          className="grid gap-4 gap-y-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {users.map((user) => (
            <div
              key={user._id}
              className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.img}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover bg-indigo-50 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-1">
                <span>Phone: {user.phone || "N/A"}</span>
                <span>
                  Verified:{" "}
                  <span
                    className={
                      user.isVerified ? "text-green-600" : "text-red-500"
                    }
                  >
                    {user.isVerified ? "Yes" : "No"}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPendingDelete(user)}
                className="mt-2 text-xs sm:text-sm border border-red-300 text-red-600 rounded-full py-1.5 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              >
                Remove User
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation dialog — deleting a user is destructive and cascades
          to cancelling all their appointments, so this needs a deliberate
          confirm step just like the patient-facing cancel flow does. */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col items-center text-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Remove this user?
            </h3>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {pendingDelete.name}
              </span>{" "}
              will be permanently removed, and all of their appointments will be
              cancelled. This can't be undone.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
