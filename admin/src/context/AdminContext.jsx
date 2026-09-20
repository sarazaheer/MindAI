import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : "",
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [users, setUsers] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // GET ALL DOCTORS
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } },
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //CHANGE AVAILABILITY
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors(); // refresh the list so the checkbox reflects the new state
      } else {
        // BUG FIX: was toast.error(data.error) — the backend returns
        // `message`, not `error`, so failures were always showing
        // "undefined" instead of the real reason.
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // EDIT ANY DOCTOR'S DETAILS (new admin capability)
  const editDoctor = async (docId, updates) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/edit-doctor",
        { docId, ...updates },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  //FOR ALL APPOINTMENTS
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } },
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ADMIN OVERRIDE: mark any appointment as completed (new capability)
  const completeAppointmentAdmin = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/complete-appointment",
        { appointmentId },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //DASHBOARD DATA GETTING
  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteDoctor = async (doctorId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-doctor",
        { docId: doctorId },
        { headers: { aToken } },
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        // BUG FIX: was a hardcoded "Something Went Wrong" regardless of
        // the actual backend message — now shows the real reason.
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // VIEW ALL USERS/PATIENTS (new admin capability)
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-users", {
        headers: { aToken },
      });
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // REMOVE A USER ACCOUNT (new admin capability)
  const deleteUser = async (userId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-user",
        { userId },
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(data.message);
        getAllUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    editDoctor,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    completeAppointmentAdmin,
    dashData,
    getDashData,
    deleteDoctor,
    users,
    getAllUsers,
    deleteUser,
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
