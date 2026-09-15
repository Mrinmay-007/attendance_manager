
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logout from "../components/logout";
import {
  FaUserCheck,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import { LuCalendarClock } from "react-icons/lu";

export default function TeacherDashboard() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const handleThemeSwitch = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    // THEME-AWARE: Light mode background, with dark mode gradient override
    <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-[#0b132b] dark:via-[#1c2541] dark:to-[#0b132b] p-6 transition-colors duration-300">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold tracking-wide text-gray-800 dark:text-white">
          Teacher Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleThemeSwitch}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
            aria-label="Toggle Dark Mode"
          >
            {theme === "light" ? (
              <HiOutlineMoon className="h-6 w-6" />
            ) : (
              <HiOutlineSun className="h-6 w-6" />
            )}
          </button>
          <Logout />
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Mark Attendance */}
        <Link to="/teacher/form" className="group">
          <div className="bg-white dark:bg-[#1c2541] p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border border-gray-200 dark:border-gray-700">
            <FaUserCheck className="text-6xl mb-4 text-blue-500 dark:text-blue-400" />
            <h2 className="text-gray-800 dark:text-blue-300 font-semibold text-lg">
              Mark Attendance
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Take and manage student attendance
            </p>
          </div>
        </Link>

        {/* Card 2: Routine */}
        <Link to="/teacher/routine" className="group">
          <div className="bg-white dark:bg-[#1c2541] p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border border-gray-200 dark:border-gray-700">
            <LuCalendarClock className="text-6xl mb-4 text-yellow-500 dark:text-yellow-400" />
            <h2 className="text-gray-800 dark:text-yellow-300 font-semibold text-lg">
              View Routine
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Check your weekly class schedule
            </p>
          </div>
        </Link>
        
        {/* Card 3: Notice */}
        <Link to="/teacher/notice" className="group">
          <div className="bg-white dark:bg-[#1c2541] p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border border-gray-200 dark:border-gray-700">
            <FaBell className="text-6xl mb-4 text-green-500 dark:text-green-400" />
            <h2 className="text-gray-800 dark:text-green-300 font-semibold text-lg">
              Notices
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              View and send important notices
            </p>
          </div>
        </Link>

        {/* Card 4: Details */}
        <Link to="/teacher/details" className="group">
          <div className="bg-white dark:bg-[#1c2541] p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border border-gray-200 dark:border-gray-700">
            <FaUserCircle className="text-6xl mb-4 text-purple-500 dark:text-purple-400" />
            <h2 className="text-gray-800 dark:text-purple-300 font-semibold text-lg">
              My Details
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              View your profile and class details
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}