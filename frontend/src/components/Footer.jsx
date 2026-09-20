import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="px-4 md:mx-10 md:px-0 text-gray-700">
      {/* FIX: mt-20 sm:mt-40 was pushing the footer down with a huge
          empty gap before it even started, and everything stacking
          full-width in one long column made it feel like its own
          separate page rather than a footer. Reduced top margin, and
          Company + Contact now sit side-by-side on mobile instead of
          stacking. */}
      <div className="grid grid-cols-2 sm:grid-cols-[3fr_1fr_1fr] gap-x-6 gap-y-8 sm:gap-10 my-8 sm:my-10 mt-12 sm:mt-32 text-sm">
        {/* Logo & About */}
        <div className="col-span-2 sm:col-span-1">
          <img src={assets.logo} alt="MindAI" className="mb-4 sm:mb-5 w-28 sm:w-32" />
          <p className="text-gray-500 leading-relaxed max-w-sm">
            MindAI connects you with licensed psychiatrists and therapists
            across Pakistan, with simple online appointment booking and a
            supportive AI companion — because mental health care should be
            easy to reach, whenever you need it.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <p className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Company
          </p>
          <ul className="text-gray-500 space-y-2">
            <li
              className="hover:text-[#5f6fff] cursor-pointer"
              onClick={() => {
                navigate("/");
                scrollTo(0, 0);
              }}
            >
              Home
            </li>
            <li
              className="hover:text-[#5f6fff] cursor-pointer"
              onClick={() => {
                navigate("/about");
                scrollTo(0, 0);
              }}
            >
              About Us
            </li>
            <li
              className="hover:text-[#5f6fff] cursor-pointer"
              onClick={() => {
                scrollTo(0, 0);
                navigate("/contact");
              }}
            >
              Contact Us
            </li>
            <li className="hover:text-[#5f6fff] cursor-pointer">Privacy</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <p className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Get in Touch
          </p>
          <p className="text-gray-500 break-words">+92 000 00000000</p>
          <p className="text-gray-500 hover:text-blue-600 cursor-pointer break-words mt-1">
            <a href="mailto:umerbangash5528@gmail.com">mindai@gmail.com</a>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <hr className="border-gray-300" />
      <p className="text-center text-gray-500 py-4 sm:py-5 text-xs sm:text-sm">
        © 2026 - All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
