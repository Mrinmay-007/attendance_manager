

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function AttendanceForm() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [formData, setFormData] = useState({
    id: "",
    department: "",
    year: "",
    semester: "",
    subject: "",
  });

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch teacher data
  useEffect(() => {
    apiFetch(`/teacher_data/${email}`)
      .then((data) => setFormData((prev) => ({ ...prev, id: data.id })))
      .catch((err) => console.error(err));
  }, [email]);

  // Fetch departments
  useEffect(() => {
    apiFetch("/department_students")
      .then(setDepartments)
      .catch((err) => console.error(err));
  }, []);

  // Fetch subjects when department or semester changes
  useEffect(() => {
    if (formData.id && formData.department && formData.semester) {
      const depName = departments.find(
        (d) => d.id === parseInt(formData.department)
      )?.dep;
      if (depName) {
        apiFetch(`/sub/${formData.id}/${depName}/${formData.semester}`)
          .then((data) => setSubjects(data))
          .catch((err) => console.error(err));
      }
    }
  }, [formData.department, formData.semester, formData.id, departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/teacher/attendance", { state: formData });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="bg-slate-800 w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400 mb-2">
          Attendance Form
        </h1>
        <p className="text-sm text-gray-400 mb-6">Logged in as: {email}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Teacher ID */}
          <div>
            <label className="block text-gray-300 mb-1">Teacher ID</label>
            <input
              type="text"
              value={formData.id}
              readOnly
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-300 mb-1">Select Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.dep}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-gray-300 mb-1">Select Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Semester</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-gray-300 mb-1">Select Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subject}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium shadow"
            >
              Logout
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium shadow"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

