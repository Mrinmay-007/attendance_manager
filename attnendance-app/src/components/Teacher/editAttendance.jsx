

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function EditAttendance() {
  const location = useLocation();
  const rowData = location.state; // data you passed while navigating
  const [history, setHistory] = useState([]);
  const [updates, setUpdates] = useState({}); // store new statuses

  useEffect(() => {
    if (rowData) {
      apiFetch(`/attendance?stid=${rowData.STid}&dt=${rowData.date}`)
        .then((data) => {
          setHistory(data);
          const init = {};
          data.forEach((row) => (init[row.id] = row.status));
          setUpdates(init);
        })
        .catch((err) => console.error(err));
    }
  }, [rowData]);

  const handleChange = (id, value) => {
    setUpdates((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    try {
      for (const row of history) {
        const newStatus = updates[row.id] || row.status;
        if (newStatus !== row.status) {
          await apiFetch(`/attendance/${row.id}`, "PUT", {
            new_status: newStatus,
          });
        }
      }
      alert("Attendance updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating attendance");
    }
  };

  if (!rowData)
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        No data received
      </div>
    );

  if (!history.length)
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        Edit Attendance
      </h1>

      {/* Session Info Card */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg mb-8 border border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-300">
          <p>
            <span className="font-semibold text-white">ID:</span>{" "}
            {rowData.STid}
          </p>
          <p>
            <span className="font-semibold text-white">Subject:</span>{" "}
            {rowData.subject}
          </p>
          <p>
            <span className="font-semibold text-white">Code:</span>{" "}
            {rowData.code}
          </p>
          <p>
            <span className="font-semibold text-white">Date:</span>{" "}
            {rowData.date}
          </p>
          <p>
            <span className="font-semibold text-white">Semester:</span>{" "}
            {rowData.sem}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 overflow-x-auto">
        <table className="min-w-full text-sm text-gray-300">
          <thead>
            <tr className="bg-slate-700 text-gray-200">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">University Roll</th>
              <th className="px-4 py-3 text-left">Class Roll</th>
              <th className="px-4 py-3 text-left">Old Status</th>
              <th className="px-4 py-3 text-left">New Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-700 hover:bg-slate-700/50 transition"
              >
                <td className="px-4 py-2">{row.id}</td>
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.u_roll}</td>
                <td className="px-4 py-2">{row.c_roll}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      row.status === "Present"
                        ? "bg-green-600/20 text-green-400"
                        : row.status === "Absent"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    {["Present", "Absent", "Late"].map((status) => (
                      <label key={status} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`attendance-${row.id}`}
                          value={status}
                          checked={updates[row.id] === status}
                          onChange={(e) =>
                            handleChange(row.id, e.target.value)
                          }
                          className="accent-blue-500"
                        />
                        <span
                          className={
                            status === "Present"
                              ? "text-green-400"
                              : status === "Absent"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }
                        >
                          {status[0]}
                        </span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition font-semibold"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
