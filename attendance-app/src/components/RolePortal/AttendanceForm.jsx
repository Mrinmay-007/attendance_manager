import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiFetch } from "../api";

export default function AttendanceForm({ onCreated }) {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/teacher/my-subjects")
      .then(setAssignments)
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!selectedAssignment) {
      setStudents([]);
      setStatuses({});
      return;
    }

    apiFetch(`/teacher/assigned-students?st_id=${selectedAssignment}`)
      .then((studentData) => {
        setStudents(studentData);
        setStatuses({});
      })
      .catch((requestError) => setError(requestError.message));
  }, [selectedAssignment]);

  function selectStatus(studentId, status) {
    setStatuses((current) => ({ ...current, [studentId]: status }));
  }

  function setAllStatuses(status) {
    setStatuses(Object.fromEntries(students.map((student) => [student.student_id, status])));
  }

  // async function saveAttendance() {
  //   if (!selectedAssignment || !students.length) return;
  //   setError("");
  //   setSaving(true);
  //   try {
  //     const entries = Object.entries(statuses);
  //     if (!entries.length) {
  //       throw new Error("Select Present, Absent, or Late for at least one student");
  //     }
  //     await Promise.all(
  //       entries.map(([studentId, status]) =>
  //         apiFetch("/teacher/attendance", "POST", {
  //           st_id: Number(selectedAssignment),
  //           student_id: Number(studentId),
  //           date,
  //           status,
  //         })
  //       )
  //     );
  //     onCreated();
  //     setError("");
  //   } catch (requestError) {
  //     setError(requestError.message);
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  async function saveAttendance() {
    if (!selectedAssignment || !students.length) return;
    setError("");
    setSaving(true);
    try {
      const records = Object.entries(statuses).map(([studentId, status]) => ({
        student_id: Number(studentId),
        status,
      }));
      if (!records.length) {
        throw new Error("Select Present, Absent, or Late for at least one student");
      }
      await apiFetch("/teacher/attendance/bulk", "POST", {
        st_id: Number(selectedAssignment),
        date,
        records,
      });
      onCreated();
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="create-form">
      <div className="form-grid">
        <label>
          Class / subject
          <select required value={selectedAssignment} onChange={(event) => setSelectedAssignment(event.target.value)}>
            <option value="">Select an assigned class</option>
            {assignments.map((assignment) => (
              <option key={assignment.st_id} value={assignment.st_id}>
                {assignment.subject_name || `Subject ${assignment.subject_id}`} (
                {assignment.subject_code || assignment.subject_id}) - Year {assignment.year}, Sem {assignment.sem}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            required
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setStatuses({});
            }}
          />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      {students.length > 0 && (
        <div className="heading-actions attendance-bulk-actions">
          <span className="muted">Set all students:</span>
          {["Present", "Absent", "Late"].map((status) => (
            <button
              className={`attendance-button attendance-${status.toLowerCase()}`}
              type="button"
              key={status}
              onClick={() => setAllStatuses(status)}
            >
              {status}
            </button>
          ))}
        </div>
      )}
      {selectedAssignment && !students.length && <p className="muted">No students found for this assigned class.</p>}
      {students.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll number</th>
                <th>Section</th>
                <th>Mark attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.name}</td>
                  <td>
                    {student.roll_no}
                    {student.c_roll_no ? ` (${student.c_roll_no})` : ""}
                  </td>
                  <td>{student.section || "—"}</td>
                  <td>
                    <div className="heading-actions">
                      {["Present", "Absent", "Late"].map((status) => (
                        <button
                          className={`attendance-button attendance-${status.toLowerCase()} ${
                            statuses[student.student_id] === status ? "selected" : ""
                          }`}
                          type="button"
                          key={status}
                          onClick={() => selectStatus(student.student_id, status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {students.length > 0 && (
        <button className="primary-button" type="button" disabled={saving} onClick={saveAttendance}>
          <CheckCircle2 size={16} /> {saving ? "Saving attendance…" : "Save attendance"}
        </button>
      )}
    </div>
  );
}
