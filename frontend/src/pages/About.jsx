import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="px-6 md:px-16 lg:px-32 py-8 bg-white text-gray-800">
      {/* Title */}
      <div className="text-center mb-16 text-gray-400">
        <h1 className="text-2xl md:text-3xl text-gray-600">
          About <span className="font-semibold text-black"> Us</span>
        </h1>
        <p className="mt-2 text-gray-600">
          Learn more about who we are and what drives us at{" "}
          <span className="font-semibold text-black">MindAI.</span>
        </p>
      </div>

      {/* About Section */}
      <div className="flex flex-col md:flex-row items-center gap-16">
        {/* Image */}
        <div className="flex-1">
          <img
            src={assets.about_image}
            alt="About Prescripto"
            className="w-full rounded-sm shadow-sm "
          />
        </div>

        {/* Text */}
        <div className="flex-2 text-justify leading-tight text-gray-600">
          {" "}
          <p className="mb-6">
            {" "}
            Welcome to{" "}
            <span className="font-semibold text-blue-600">MindAI</span>, your
            intelligent partner in mental health and emotional wellbeing. At
            MindAI, we believe that seeking help should be simple, accessible,
            and stigma-free. That’s why we’ve created a platform where you can
            easily book in-person sessions with certified psychiatrists or chat
            anytime with our AI-powered mental health assistant for instant
            support.{" "}
          </p>{" "}
          <p className="mb-8">
            {" "}
            MindCare combines modern technology with compassionate care. Whether
            you’re managing stress, anxiety, depression, or just need someone to
            talk to, MindAI connects you with real experts and empathetic AI
            guidance — helping you take control of your mental wellbeing,
            anytime and anywhere.{" "}
          </p>{" "}
          <h2 className="text-xl font-semibold mb-4 text-gray-600">
            Our Vision
          </h2>{" "}
          <p className="text-gray-600">
            {" "}
            Our vision at MindAI is to redefine how people experience mental
            healthcare. We aim to bridge the gap between technology and
            emotional health by offering a safe space where human expertise
            meets AI innovation — empowering every mind to heal, grow, and
            thrive.{" "}
          </p>{" "}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="mt-30 text-center text-sm text-gray-800">
        <h2 className="text-2xl mb-6 text-gray-600">
          Why <span className="font-semibold text-black">Choose</span> Us
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          At MindAI, we don’t just make appointments we make mental health
          wellbeing easier, faster, and more reliable for everyone.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-300 shadow-sm cursor-pointer  hover:scale-105 transition-all duration-500s ">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              Expert Psychiatrists
            </h3>
            <p className="text-gray-600  p-4">
              We connect you with qualified and experienced doctors to ensure
              you get the best care possible.
            </p>
          </div>

          <div className="p-6 border border-gray-300 cursor-pointer shadow-sm hover:scale-105 transition-all duration-500">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              Easy Booking
            </h3>
            <p className="text-gray-600 p-4">
              Our platform lets you book, reschedule, or cancel appointments
              instantly — no waiting calls or queues.
            </p>
          </div>

          <div className="p-6 border border-gray-300 cursor-pointer shadow-sm hover:bg-primary  hover:scale-105 transition-all duration-500">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              Modern Platform
            </h3>
            <p className="text-gray-600  p-4 ">
              Built with the latest technology to ensure smooth, fast, and
              secure performance on all devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
