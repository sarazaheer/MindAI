import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <h1>
          Contact <span className="font-semibold text-gray-700 ">Us</span>
        </h1>
      </div>
      <div className="my-10 flex flex-col justify-center md:flex-row text-lg">
        <img
          src={assets.contact_image}
          alt=""
          className="w-1/2 ml-20 md:max-w-[360px]"
        />
        <div className="mx-10">
          <p className="py-10 text-2xl font-semibold text-gray-600">
            OUR OFFICE
          </p>
          <p className="py-2 text-sm text-gray-600">
            26000,
            <br /> Kohat, Pakistan
          </p>
          <p className="py-2 text-sm text-gray-600">
            Tel: (+92) 000-0000000 <br />
            Email:{" "}
            <a
              href="mailto:umerbangash5528@gmail.com"
              className="underline text-blue-600 hover:text-blue-800 transition-all"
            >
              umerbangash5528@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
