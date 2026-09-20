import React, { useContext, useState } from "react";

import { AdminContext } from "../context/AdminContext";

import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [isDisabled, setisDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setdToken } = useContext(DoctorContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    // FIX: setisDisabled(true) now runs BEFORE the request starts (not
    // after it resolves), so the button actually disables while the
    // network call is in flight — the whole point of a loading state.
    setisDisabled(true);

    try {
      if (state === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });

        // BUG FIX: this checked `data.sucess` (typo) instead of
        // `data.success`. Since that field never existed, this condition
        // was ALWAYS false — meaning admin login never actually succeeded
        // from the frontend's perspective, even when the backend correctly
        // returned a valid token. This was silently broken.
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
        } else {
          toast.error(data.message || "Login failed. Please try again.");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });

        // Same typo fix as above.
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setdToken(data.token);
        } else {
          toast.error(data.message || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.log(error.message);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      // FIX: previously isDisabled was only ever reset inside the
      // success/failure branches — if the request threw (network error),
      // the button stayed permanently disabled. `finally` guarantees it
      // always resets.
      setisDisabled(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center px-4 sm:px-0">
      <form
        onSubmit={submitHandler}
        className="flex flex-col gap-3 m-auto items-start p-6 sm:p-8 w-full max-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg"
      >
        <p className="text-xl sm:text-2xl font-semibold m-auto">
          <span className="text-blue-800">{state} </span>Login
        </p>

        <div className="w-full mb-2">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            required
            placeholder="abc@gmail.com"
            autoComplete="username"
            className="border border-gray-400 w-full p-2.5 sm:p-2 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-800/40 transition-all"
          />
        </div>

        <div className="w-full">
          <label htmlFor="login-password">Password</label>
          <div className="relative mt-2">
            <input
              id="login-password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="border border-gray-400 w-full p-2.5 sm:p-2 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-800/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full sm:w-[75%] mx-auto py-2.5 sm:py-2 rounded-md text-sm mt-6 mb-4 transition-all duration-200 ${
            isDisabled
              ? "bg-gray-400 text-black cursor-not-allowed"
              : "bg-blue-800 text-white hover:scale-105 cursor-pointer"
          }`}
        >
          {isDisabled ? "Signing In..." : "Sign In"}
        </button>

        {state === "Admin" ? (
          <p className="mx-auto text-center">
            Doctor Login{" "}
            <button
              type="button"
              className="text-blue-800 underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click Here
            </button>
          </p>
        ) : (
          <p className="mx-auto text-center">
            Admin Login{" "}
            <button
              type="button"
              className="text-blue-800 underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click Here
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
