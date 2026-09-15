

import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Logout from "../logout";

export default function Info() {
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const email = localStorage.getItem("email");

  useEffect(() => {
    apiFetch(`/teacher_details/${email}`)
      .then((data) => {
        setTeacher(data.teacher);
        setSubjects(data.subjects);
        setDepartments(data.departments);
      })
      .catch((err) => console.error(err));
  }, [email]);

  if (!teacher)
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Header/Nav */}
      <header className="flex justify-between items-center bg-slate-800 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-blue-400">Teacher Details</h1>
        <div className="text-right">
          <Logout />
          <p className="mt-2 font-semibold text-lg">
            {teacher.name}{" "}
            <span className="text-gray-400">({teacher.name_code})</span>
          </p>
          <p className="text-sm text-gray-400">{teacher.email}</p>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        {/* Subjects Section */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            Assigned Subjects
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-300">
              <thead>
                <tr className="bg-slate-700 text-gray-200">
                  <th className="px-4 py-3 text-left">Sub ID</th>
                  <th className="px-4 py-3 text-left">Subject Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Department</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => (
                  <tr
                    key={sub.Sub_id}
                    className={`border-b border-slate-700 ${
                      idx % 2 === 0 ? "bg-slate-800" : "bg-slate-900"
                    } hover:bg-slate-700/50 transition`}
                  >
                    <td className="px-4 py-2">{sub.Sub_id}</td>
                    <td className="px-4 py-2">{sub.sub_name}</td>
                    <td className="px-4 py-2">{sub.sub_code}</td>
                    <td className="px-4 py-2">{sub.sem}</td>
                    <td className="px-4 py-2">{sub.year}</td>
                    <td className="px-4 py-2">
                      {departments.map((dep) => dep.dep).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
