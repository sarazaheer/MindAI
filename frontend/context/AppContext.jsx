import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import axios from "axios";
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  // Tracks whether the initial doctors fetch is in flight, and whether it
  // failed, so pages can show a proper loading/error state instead of just
  // silently rendering an empty list.
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : "",
  );

  const [userData, setUserData] = useState(false);
  const getDoctorsData = async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        setDoctorsError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      setDoctorsError(
        error.message || "Something went wrong while loading doctors.",
      );
      toast.error(error.message);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    doctorsLoading,
    doctorsError,
    getDoctorsData,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  // Global safety net: whenever ANY backend response signals
  // `sessionExpired: true` (e.g. a token whose account no longer exists —
  // see authUser.js), immediately clear the token and bounce to /login.
  // This is what makes account deletion actually take effect everywhere,
  // not just the specific request that happened to trigger it — the very
  // next authenticated call this user makes, anywhere in the app, will be
  // caught here.
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use((response) => {
      if (response?.data?.sessionExpired) {
        localStorage.removeItem("token");
        setToken("");
        setUserData(false);
        toast.error(
          response.data.message ||
            "Your session has expired. Please sign in again.",
        );
        window.location.href = "/login";
      }
      return response;
    });

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
