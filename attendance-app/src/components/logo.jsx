

// src/components/Logo.jsx
import React from "react";
import logo from "../assets/logo.png";
import { ReactTyped } from "react-typed";

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 -mt-8">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="h-40 md:w-80 md:h-52 drop-shadow-xl"
      />

      {/* Typing Effect */}
      <ReactTyped
        strings={[
          "Welcome to Attendance System",
          "Stay Connected",
          "Track Your Attendance",
        ]}
        typeSpeed={70}
        backSpeed={40}
        loop
        className="text-2xl md:text-4xl font-bold text-gray-100 tracking-wide drop-shadow-md"
      />
    </div>
  );
};

export default Logo;
