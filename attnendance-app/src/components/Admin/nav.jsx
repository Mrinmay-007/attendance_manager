// import { apiFetch } from "../api";
// import { useEffect, useState } from "react";
// import Logout from "../logout.jsx"
// // ---------------- NAVBAR ----------------
// export default function Nav({ selectedDept, setSelectedDept, selectedSem, setSelectedSem }) {
//   const [dept, setDept] = useState([]);
//   const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

//   useEffect(() => {
//     apiFetch(`/department_students`)
//       .then((data) => setDept(data))
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div className="bg-white shadow-md border border-gray-200 rounded-2xl p-6 mb-6">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//         {/* Department Select */}
//         <Logout />
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             Department
//           </label>
//           <select
//             value={selectedDept}
//             onChange={(e) => setSelectedDept(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 shadow-sm 
//                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
//                        transition duration-150 ease-in-out"
//           >
//             <option value="">Select Department</option>
//             {dept?.map((data) => (
//               <option key={data.id} value={data.dep}>
//                 {data.dep}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Semester Select */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             Semester
//           </label>
//           <select
//             value={selectedSem}
//             onChange={(e) => setSelectedSem(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 shadow-sm 
//                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
//                        transition duration-150 ease-in-out"
//           >
//             <option value="">Select Semester</option>
//             {semesters.map((sem) => (
//               <option key={sem} value={sem}>
//                 Semester {sem}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// }
import { apiFetch } from "../api";
import { useEffect, useState } from "react";
import Logout from "../logout.jsx";
import { SiGoogleclassroom } from "react-icons/si";
import { CiBoxList } from "react-icons/ci";
import { LuChevronDown } from "react-icons/lu";



// ---------------- NAVBAR ----------------
export default function Nav({ selectedDept, setSelectedDept, selectedSem, setSelectedSem }) {
  const [dept, setDept] = useState([]);
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    apiFetch(`/department_students`)
      .then((data) => setDept(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    // Main container with modern background, padding, and shadow
    <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Filters Wrapper */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
          
          {/* Department Select Group */}
          <div className="w-full sm:w-64">
            <label htmlFor="department-select" className="block text-sm font-medium text-slate-700 mb-1">
              Department
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SiGoogleclassroom />
              </span>
              <select
                id="department-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 shadow-sm
                           appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition duration-150 ease-in-out hover:border-slate-400"
              >
                <option value="">Select Department</option>
                {dept?.map((data) => (
                  <option key={data.id} value={data.dep}>
                    {data.dep}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <LuChevronDown />
              </span>
            </div>
          </div>

          {/* Semester Select Group */}
          <div className="w-full sm:w-64">
            <label htmlFor="semester-select" className="block text-sm font-medium text-slate-700 mb-1">
              Semester
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CiBoxList />
              </span>
              <select
                id="semester-select"
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 shadow-sm
                           appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition duration-150 ease-in-out hover:border-slate-400"
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <LuChevronDown />
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button on the right */}
        <div className="w-full md:w-auto">
          <Logout />
        </div>
        
      </div>
    </div>
  );
}