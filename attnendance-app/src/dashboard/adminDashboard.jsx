import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logout from "../components/logout";
import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineBell,
  HiOutlineDocumentText,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi";
import { RxGear } from "react-icons/rx";

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* --- MODIFIED HEADER --- */}
        <header className="mb-10 flex justify-between items-center">
          {/* Left Side: Title */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              Admin Control Panel
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Select a module to manage your application.
            </p>
          </div>

          {/* Right Side: Action Buttons Group */}
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

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dashboard  */}
            <Link to="/admin/dashboard" className="group">
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                <HiOutlineViewGrid className="h-12 w-12 text-blue-600 dark:text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Dashboard
                </h2>
              </div>
            </Link>

            {/* Routine */}
            <Link to="/admin/create-routine" className="group">
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                <HiOutlineCalendar className="h-12 w-12 text-blue-600 dark:text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Create Routine
                </h2>
              </div>
            </Link>

            {/* Notices */}
            <Link to="/admin/notice" className="group">
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                <HiOutlineBell className="h-12 w-12 text-blue-600 dark:text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Manage Notices
                </h2>
              </div>
            </Link>

            {/* Settings */}
            <Link to="/admin/settings" className="group">
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                <RxGear className="h-12 w-12 text-blue-600 dark:text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Settings
                </h2>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
