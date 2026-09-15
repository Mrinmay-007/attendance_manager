

import { Link, useNavigate } from "react-router-dom";
import Logout from "../logout";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Details() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    apiFetch(`/attendance_history/${email}`)
      .then((data) => {
        setHistory(data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch attendance history");
        setIsLoading(false);
      });
  }, [email]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-red-400 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Details</h2>
        <Logout />
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/teacher/details/info">
          <div className="p-6 bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition hover:scale-105 cursor-pointer text-center border border-slate-700">
            <h3 className="text-lg font-semibold text-blue-400">Your Info</h3>
            <p className="text-sm text-gray-400 mt-2">
              View your profile and details
            </p>
          </div>
        </Link>

        <Link to="/teacher/details/reset-password">
          <div className="p-6 bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition hover:scale-105 cursor-pointer text-center border border-slate-700">
            <h3 className="text-lg font-semibold text-purple-400">
              Reset Password
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Secure your account credentials
            </p>
          </div>
        </Link>
      </div>

      {/* Attendance History */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-xl font-semibold mb-4 text-yellow-400">
          Attendance History
        </h3>
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              No attendance history available.
            </div>
          ) : (
            <table className="min-w-full text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-700 text-gray-200 text-left">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                  >
                    <td className="px-4 py-2">{row.STid}</td>
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">{row.department}</td>
                    <td className="px-4 py-2">{row.subject}</td>
                    <td className="px-4 py-2">{row.code}</td>
                    <td className="px-4 py-2">{row.year}</td>
                    <td className="px-4 py-2">{row.sem}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => navigate("/teacher/edit_attendance", { state: row })}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded-lg shadow-md transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
