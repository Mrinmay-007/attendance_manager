import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logout from "../components/logout";
import { FaUserCheck, FaBullhorn, FaBell, FaSignOutAlt } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { LuCalendarClock } from "react-icons/lu";
export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Student Dashboard</h1>

        <Logout />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <Link to="/student/attendance">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center hover:scale-[1.02]">
            <FaUserCheck className="text-5xl mb-4 text-blue-600" />
            <h2 className="text-blue-700 font-semibold text-lg">Attendance</h2>
            <p className="text-gray-500 text-sm">
              View and track your attendance easily
            </p>
          </div>
        </Link>

        {/* Card 2 */}
        <Link to="/student/routine">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center hover:scale-[1.02]">
            <LuCalendarClock className="text-5xl mb-4 text-green-600" />
            <h2 className="text-green-700 font-semibold text-lg">Routine</h2>
            <p className="text-gray-500 text-sm">
              Stay updated with the latest events
            </p>
          </div>
        </Link>

        {/* Card 3 */}
        <Link to="/student/notice">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center hover:scale-[1.02]">
            <FaBell className="text-5xl mb-4 text-yellow-500" />
            <h2 className="text-yellow-600 font-semibold text-lg">Notice</h2>
            <p className="text-gray-500 text-sm">
              Important updates and alerts for you
            </p>
          </div>
        </Link>

        {/* Card 4 */}
        <Link to="/student/settings">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center hover:scale-[1.02]">
            <FaGear className="text-5xl mb-4 text-purple-600" />
            <h2 className="text-purple-700 font-semibold text-lg">Settings</h2>
            <p className="text-gray-500 text-sm">
              Secure your account credentials
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
