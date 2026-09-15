
import { apiFetch } from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Nav from "./nav";

// Icon component for a professional look
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function RoutineBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("email");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [slot, setSlot] = useState([]);
  const [sub, setSub] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Controlled form state
  const [day, setDay] = useState("");
  const [slotId, setSlotId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [routine, setRoutine] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch slots
  useEffect(() => {
    apiFetch(`/slot`)
      .then((data) => setSlot(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch subjects
  useEffect(() => {
    if (selectedDept && selectedSem) {
      apiFetch(`/get_subject/${selectedSem},${selectedDept}`)
        .then((data) => setSub(data))
        .catch((err) => console.error(err));
    } else {
      setSub([]);
    }
  }, [selectedDept, selectedSem]);


// Fetch teachers
useEffect(() => {
  if (subjectId && slotId && day) {
    apiFetch(`/available_teacher/${subjectId}?slot=${slotId}&day=${day}`)
      .then((data) => setTeachers(data))
      .catch((err) => console.error(err));
  } else {
    setTeachers([]);
  }
}, [subjectId, slotId, day]);


//   Fetch routine
  const fetchRoutine = () => {
     if (selectedDept && selectedSem) {
        setIsLoading(true);
        setError(null);   // reset error on every new fetch
        apiFetch(`/routine/${selectedDept},${selectedSem}`)
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
  }

  useEffect(() => {
    fetchRoutine();
  }, [selectedDept, selectedSem]);



  // Submit handler
  const handleSubmit = async () => {
    if (!selectedDept || !day || !slotId || !subjectId || !teacherId) {
        alert("⚠️ Please select all fields!");
        return;
    }

    try {
        const res = await apiFetch("/routine", "POST", {
            STid: parseInt(teacherId),
            Sl_id: parseInt(slotId),
            dep: selectedDept,
            day: day,
        });
        alert("✅ Routine Created");
        console.log("Created routine:", res);
        fetchRoutine(); // Re-fetch routine to show the new entry
        // Reset form
        setDay("");
        setSlotId("");
        setSubjectId("");
        setTeacherId("");
    } catch (err) {
        console.error(err);
        alert("❌ Error creating routine");
    }
  };

  // Delete handler
  const handleDelete = async (routineId) => {
    if(window.confirm("Are you sure you want to delete this entry?")) {
        try {
            await apiFetch(`/routine/${routineId}`, "DELETE");
            alert("✅ Routine entry deleted successfully!");
            // window.location.reload(); 
            fetchRoutine(); // Re-fetch to update the table
        } catch (err) {
            console.error(err);
            alert("❌ Error deleting routine entry.");
        }
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Nav
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedSem={selectedSem}
        setSelectedSem={setSelectedSem}
      />

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
            <div className="flex items-center justify-center">
                <CalendarIcon />
                <h1 className="text-4xl font-bold text-gray-800">
                    Routine Builder
                </h1>
            </div>
            <p className="text-gray-600 mt-2 text-lg">
              {selectedDept ? `${selectedDept} - Semester ${selectedSem || '...'}` : "Select Department and Semester to begin"}
            </p>
        </div>

        {/* Routine Table */}
        <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-200 bg-white mb-8">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-indigo-700 text-white uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="py-4 px-6 font-bold">Day</th>
                        {slot?.map((data) => (
                            <th scope="col" key={data.id} className="py-4 px-6 text-center font-bold">
                                <div>{data.sl_name}</div>
                                <div className="font-normal text-indigo-200 text-xs">{data.start} - {data.end}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                        <tr><td colSpan={slot.length + 1} className="text-center py-16 text-gray-500">Loading routine...</td></tr>
                    ) : error ? (
                        <tr><td colSpan={slot.length + 1} className="text-center py-16 text-red-500">No routine found</td></tr>
                    ) : (
                        days.map((dayName, i) => (
                            <tr key={dayName} className="hover:bg-indigo-50 transition-colors duration-200">
                                <td className="py-4 px-6 font-semibold text-gray-900 bg-gray-50">{dayName}</td>
                                {slot?.map((s) => {
                                    const cell = routine.find((r) => r.day === dayName && r.slot === s.id);
                                    return (
                                        <td key={s.id} className="py-4 px-6 text-center relative group">
                                            {cell ? (
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold shadow-sm">
                                                        {cell.subject}
                                                    </span>
                                                    <span className="text-gray-500 text-xs mt-1">
                                                        ({cell.teacher_code}) 
                                                    </span>
                                                    <button onClick={() => handleDelete(cell.routine_id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 text-xs leading-none">
                                                        &#x2715;
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
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

        {/* Create Routine Form */}
        <div className="bg-white shadow-xl rounded-lg p-6 lg:p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                ➕ Add New Class
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Day */}
                <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    <option value="">Select Day</option>
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Slot */}
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    <option value="">Select Slot</option>
                    {slot?.map((data) => <option key={data.id} value={data.id}>{data.sl_name}</option>)}
                </select>

                {/* Subject */}
                <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={!selectedDept || !selectedSem}>
                    <option value="">Select Subject</option>
                    {sub?.map((data) => <option key={data.id} value={data.id}>{data.label}</option>)}
                </select>

                {/* Teacher */}
                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={!subjectId}>
                    <option value="">Select Teacher</option>
                    {teachers?.map((t) => <option key={t.STid} value={t.STid}>{t.name} ({t.name_code})</option>)}
                </select>

                {/* Submit Button */}
                <button onClick={handleSubmit} className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-indigo-500/50 transform hover:-translate-y-0.5">
                    Submit
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}