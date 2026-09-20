import React, { useState, useEffect, useContext } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added state for confirm password
  const [passwordError, setPasswordError] = useState(""); // Added state for password error
  const [experience, setExperience] = useState("1 Year");
  const [fee, setFee] = useState("");
  const [about, setAbout] = useState("");
  const [Speciality, setSpeciality] = useState("Forensic");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [isDisabled, setIsDisabled] = useState(false); // Fixed typo setIsDistabled -> setIsDisabled

  const { backendUrl, aToken } = useContext(AdminContext);

  // useEffect to validate passwords
  useEffect(() => {
    // Only validate if user has started typing in either field
    if (password || confirmPassword) {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
      } else if (password !== confirmPassword) {
        setPasswordError("Passwords do not match.");
      } else {
        setPasswordError(""); // Clear error if valid
      }
    } else {
      setPasswordError(""); // Clear error if fields are empty
    }
  }, [password, confirmPassword]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Final validation check before submitting
    if (passwordError) {
      return toast.error("Please ensure passwords match and are valid.");
    }

    try {
      if (!docImg) {
        return toast.error("IMAGE NOT UPLOADED");
      }
      const formData = new FormData();

      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password); // Only send the main password
      formData.append("experience", experience);
      formData.append("fee", Number(fee));
      formData.append("about", about);
      formData.append("speciality", Speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 }),
      );

      setIsDisabled(true); // Fixed typo

      //API CALL TO THE BACKEND TO SAVE THE DATA

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } },
      );
      if (data.success) {
        toast.success(data.message);
        setIsDisabled(false); // Fixed typo
        setDocImg(false);
        setName("");
        setPassword("");
        setConfirmPassword(""); // Reset confirm password
        setAbout("");
        setEmail("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setFee("");
      } else {
        toast.error(data.message);
        setIsDisabled(false); // Fixed typo
      }
    } catch (error) {
      toast.error(error.message);
      setIsDisabled(false); // Ensure button is re-enabled on error
      console.log(error);
    }
  };

  return (
    <form action="" className="m-3 sm:m-5 w-full" onSubmit={onSubmitHandler}>
      <p className="mb-3 text-base sm:text-lg font-medium">Add Doctor</p>

      <div className="bg-white border border-gray-300 px-4 sm:px-8 py-6 sm:py-8 shadow-lg rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex flex-wrap items-center gap-4 mb-6 sm:mb-8 text-gray-400">
          <label htmlFor="doc-img">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
              className="cursor-pointer w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full object-cover"
            />
          </label>
          <input
            accept="image/*"
            type="file"
            id="doc-img"
            hidden
            onChange={(e) => setDocImg(e.target.files[0])}
          />
          <p className="text-sm sm:text-base">
            Upload Doctor <br /> Image
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Doctor Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="text"
                placeholder="Name"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Doctor Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="email"
                placeholder="Email"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Doctor Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="password"
                placeholder="Min. 8 characters"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Confirm Password</p>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="password"
                placeholder="Re-enter password"
                required
              />
            </div>

            {/* Password Error Message */}
            {passwordError && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {passwordError}
              </p>
            )}

            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                name=""
                id=""
              >
                <option value="1 Years">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="4 Years">4 Years</option>
                <option value="5 Years">5 Years</option>
                <option value="6 Years">6 Years</option>
                <option value="7 Years">7 Years</option>
                <option value="8 Years">8 Years</option>
                <option value="9 Yeasr">9 Years</option>
                <option value="10 Years">10 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Doctor Fee</p>
              <input
                onChange={(e) => setFee(e.target.value)}
                value={fee}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="number"
                placeholder="Fee"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={Speciality}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                name=""
                id=""
              >
                <option value="Forensic">Forensic </option>
                <option value="Clinical">Clinical</option>
                <option value="Child">Child</option>
                <option value="Addiction">Addiction</option>
                <option value="OCD">OCD</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="text"
                placeholder="Education"
                name=""
                id=""
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm sm:text-base">Address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="text"
                placeholder="Address 1"
                name=""
                id=""
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="border rounded px-3 py-2 text-sm sm:text-base"
                type="text"
                name=""
                id=""
                placeholder="Address 2"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2 text-sm sm:text-base">About Doctor</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 py-2 border rounded text-sm sm:text-base"
            placeholder="Write About Doctor"
            rows={5}
            required
          />
        </div>

        <button
          disabled={isDisabled || !!passwordError} // Disable if loading or if there's a password error
          className={`${
            isDisabled || !!passwordError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-700 hover:scale-110 cursor-pointer"
          } ${
            isDisabled ? "cursor-progress" : "" // Add progress cursor only when loading
          } w-full sm:w-auto text-white px-10 py-3 rounded-full text-sm mt-6 transition-all duration-300`}
        >
          {isDisabled ? "Loading..." : "Add Doctor"}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
