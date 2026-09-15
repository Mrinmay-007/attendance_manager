import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Logout from "../logout";
export default function TeacherRoutine() {
  const email = localStorage.getItem("email");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [slot, setSlot] = useState([]);
  const [routine, setRoutine] = useState([]);

  // Fetch slots
  useEffect(() => {
    apiFetch(`/slot`)
      .then((data) => setSlot(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch routine for the logged-in teacher
  useEffect(() => {
    if (email) {
      // Ensure email exists before fetching
      apiFetch(`/routine/${email}`)
        .then((data) => setRoutine(data))
        .catch((err) => console.error(err));
    }
  }, [email]); // Dependency array includes email to refetch if it changes

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300">
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Left side: Title and Subtitle */}
          <div>
            <h1 className="text-3xl font-bold text-white">Weekly Routine</h1>
            {email && (
              <p className="mt-1 text-slate-400">
                Showing schedule for: {email}
              </p>
            )}
          </div>

          {/* Right side: Logout Button */}
          <div>
            <Logout />
          </div>
        </div>

        {/* Routine Table Container */}
        <div className="overflow-x-auto rounded-lg shadow-2xl border border-slate-700 bg-slate-800/50">
          <table className="w-full text-sm text-left">
            {/* Sticky Table Header */}
            <thead className="bg-slate-900/70 backdrop-blur-sm sticky top-0">
              <tr>
                <th
                  scope="col"
                  className="py-4 px-6 font-semibold text-white tracking-wider"
                >
                  Day
                </th>
                {slot?.map((data) => (
                  <th
                    scope="col"
                    key={data.id}
                    className="py-4 px-6 text-center font-semibold text-white tracking-wider"
                  >
                    <div>{data.sl_name}</div>
                    <div className="font-normal text-slate-400 text-xs">
                      {data.start} - {data.end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {days.map((d) => (
                <tr
                  key={d}
                  className="hover:bg-slate-700/50 transition-colors duration-200"
                >
                  {/* Day Cell */}
                  <td className="py-5 px-6 font-medium text-white whitespace-nowrap">
                    {d}
                  </td>

                  {/* Slot Cells */}
                  {slot.map((s) => {
                    // Find if a routine exists for this day & slot
                    const match = routine.find(
                      (r) => r.day === d && r.slot === s.id
                    );

                    return (
                      <td key={s.id} className="py-5 px-6 text-center">
                        {match ? (
                          <div>
                            <div className="font-semibold text-indigo-400">
                              {match.subject}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {match.department}-{match.semester}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
