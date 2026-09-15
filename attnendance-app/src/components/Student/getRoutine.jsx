

import { apiFetch } from "../api";
import { useEffect, useState, useMemo } from "react";
import Logout from "../logout";

export default function Routine() {
  const email = localStorage.getItem("email");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [students, setStudents] = useState({});
  const [routine, setRoutine] = useState([]);
  const [slot, setSlot] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch student details
  useEffect(() => {
    if (email) {
      apiFetch(`/student-details/${email}`)
        .then((data) => setStudents(data))
        .catch((err) => {
          console.error(err);
          setError("Failed to fetch student details.");
        });
    }
  }, [email]);

  // Fetch slots
  useEffect(() => {
    apiFetch(`/slot`)
      .then((data) => setSlot(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch slots.");
      });
  }, []);

  // Fetch routine
  const fetchRoutine = () => {
    if (students.dep && students.sem) {
      setIsLoading(true);
      setError("");
      apiFetch(`/routine/${students.dep},${students.sem}`)
        .then((data) => {
          setRoutine(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to fetch routine.");
          setIsLoading(false);
        });
    } else {
      setRoutine([]);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, [students.dep, students.sem]);

  // ✅ Preprocess routine into a lookup { "Monday-1": {…}, "Monday-2": {…} }
  const routineMap = useMemo(() => {
    const map = {};
    routine.forEach((r) => {
      map[`${r.day}-${r.slot}`] = r;
    });
    return map;
  }, [routine]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          📅 Student Routine
        </h1>
        <Logout />
      </div>

      {/* Card Wrapper */}
      <div className="overflow-x-auto rounded-2xl shadow-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm text-left text-gray-700">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-4 px-6 font-bold text-lg">Day</th>
              {slot?.map((data) => (
                <th
                  scope="col"
                  key={data.id}
                  className="py-4 px-6 text-center font-semibold"
                >
                  <div className="text-base">{data.sl_name}</div>
                  <div className="font-normal text-indigo-200 text-xs">
                    {data.start} - {data.end}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={slot.length + 1}
                  className="text-center py-16 text-gray-500"
                >
                  ⏳ Loading routine...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={slot.length + 1}
                  className="text-center py-16 text-red-500 font-medium"
                >
                  {error}
                </td>
              </tr>
            ) : (
              days.map((dayName) => (
                <tr
                  key={dayName}
                  className="hover:bg-indigo-50/70 transition-colors duration-200"
                >
                  <td className="py-4 px-6 font-semibold text-gray-900 bg-gray-50 sticky left-0">
                    {dayName}
                  </td>
                  {slot?.map((s) => {
                    const cell = routineMap[`${dayName}-${s.id}`];
                    return (
                      <td
                        key={s.id}
                        className="py-6 px-6 text-center relative group"
                      >
                        {cell ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold shadow-md hover:scale-105 transform transition">
                              {cell.subject}
                            </span>
                            <span className="text-gray-500 text-xs mt-1">
                              ({cell.teacher_code})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
