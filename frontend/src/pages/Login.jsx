import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  // State options: "Sign in", "Sign up"
  const [state, setState] = useState("Sign in");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // CHECK PASSWORDS FOR SIGN UP
    if (state === "Sign up" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // SIGN UP OR SIGN IN REQUESTS
    try {
      setIsDisabled(true);

      if (state === "Sign up") {
        // --- REGISTRATION ---
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
        setIsDisabled(false);
      } else {
        // --- LOGIN ---
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Signed In");
        } else {
          toast.error(data.message);
        }
        setIsDisabled(false);
      }
    } catch (error) {
      toast.error(error.message);
      setIsDisabled(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const passwordsDoNotMatch =
    state === "Sign up" &&
    password !== confirmPassword &&
    confirmPassword.length > 0;

  return (
    <div>
      <div>
        <form
          className="min-h-[80vh] flex items-center mt-12 "
          onSubmit={onSubmitHandler}
        >
          <div className="flex flex-col items-start gap-3 m-auto p-8 min-w-[360px] sm:min-w-[96px] border border-gray-200 rounded-xl text-gray-600 text-sm shadow-lg">
            <p className="text-2xl font-semibold w-full">
              {state === "Sign up" ? "Create Account" : "Sign in"}
            </p>
            <p className="text-sm font-gray-500 w-full">
              {`Please ${
                state === "Sign up" ? "Create Account" : "Sign in"
              } to book appointment`}
            </p>
            <br />

            <>
              {state === "Sign up" && (
                <div className="w-full">
                  <label>Full Name</label>
                  <input
                    className="border-1 border-gray-600 rounded-lg w-full p-2"
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required
                  />
                </div>
              )}

              <div className="w-full">
                <label>Email</label>
                <input
                  className="border-1 border-gray-600 rounded-lg w-full p-2"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>

              <div className="w-full">
                <label>Password</label>
                <input
                  className="border-1 border-gray-600 rounded-lg w-full p-2"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </div>

              {state === "Sign up" && (
                <div className="w-full">
                  <label>Confirm Password</label>
                  <input
                    className="border-1 border-gray-600 rounded-lg w-full p-2"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    required
                  />
                  {passwordsDoNotMatch && (
                    <p className="text-red-500 text-sm">
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </>

            {/* SUBMIT BUTTON */}
            <button
              disabled={isDisabled || passwordsDoNotMatch}
              type="submit"
              className={`bg-primary text-white px-8 py-2 cursor-pointer w-full rounded-md my-6 ${
                isDisabled || passwordsDoNotMatch
                  ? "bg-gray-400 cursor-not-allowed"
                  : ""
              }`}
            >
              {state === "Sign up" ? "Create Account" : "Sign in"}
            </button>

            {/* BOTTOM TOGGLES */}
            {state === "Sign up" ? (
              <p>
                Already Have an Account?{" "}
                <span
                  className="text-blue-500 underline cursor-pointer"
                  onClick={() => {
                    setState("Sign in");
                    setConfirmPassword("");
                  }}
                >
                  Sign in Here
                </span>
              </p>
            ) : (
              <p>
                Create New Account?{" "}
                <span
                  className="text-blue-500 underline cursor-pointer"
                  onClick={() => setState("Sign up")}
                >
                  Click Here
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
