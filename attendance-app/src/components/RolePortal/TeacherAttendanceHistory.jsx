import { useCallback, useEffect, useState } from "react";
import { Pencil, RefreshCw } from "lucide-react";
import { apiFetch } from "../api";
import { statusClass } from "./utils";

export default function TeacherAttendanceHistory() {
  const [rows, setRows] = useState([]);
  const [date, setDate] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (deptCode.trim()) params.set("dept_code", deptCode.trim());
    try {
      const result = await apiFetch(`/teacher/attendance/history?${params.toString()}`);
      setRows(
        (result || []).sort((a, b) => {
          const dateOrder = String(b.date || "").localeCompare(String(a.date || ""));
          if (dateOrder) return dateOrder;
          return String(a.c_roll_no || a.roll_no || "").localeCompare(
            String(b.c_roll_no || b.roll_no || ""),
            undefined,
            { numeric: true }
          );
        })
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [date, deptCode]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function updateStatus(row, status) {
    if (status === row.status || !window.confirm(`Update attendance for ${row.student_name}?`)) return;
    setSavingId(row.attendance_id);
    setError("");
    try {
      await apiFetch(`/teacher/attendance/${row.attendance_id}`, "PATCH", { status });
      await loadHistory();
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="create-form">
      <div className="form-grid">
        <label>
          Date
          <input
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          Department code
          <input placeholder="e.g. CSE" value={deptCode} onChange={(event) => setDeptCode(event.target.value)} />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <div className="empty-state">
          <RefreshCw className="spin" size={20} /> Loading history…
        </div>
      ) : !rows.length ? (
        <div className="empty-state">No attendance history found for these filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Roll number</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.attendance_id}>
                  <td>{row.date}</td>
                  <td>{row.student_name}</td>
                  <td>{row.roll_no}</td>
                  <td>
                    {row.dept_name} ({row.dept_code})
                  </td>
                  <td>
                    {row.subject_name} ({row.subject_code})
                  </td>
                  <td>
                    {editingId === row.attendance_id ? (
                      <select
                        className="status-select"
                        value={editStatus}
                        onChange={(event) => setEditStatus(event.target.value)}
                      >
                        {["Present", "Absent", "Late"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={statusClass(row.status)}>{row.status}</span>
                    )}
                  </td>
                  <td>
                    {editingId === row.attendance_id ? (
                      <button
                        className="action-button"
                        disabled={savingId === row.attendance_id}
                        onClick={() => updateStatus(row, editStatus)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="icon-button attendance-edit-button"
                        title="Edit attendance status"
                        aria-label={`Edit attendance for ${row.student_name}`}
                        disabled={savingId === row.attendance_id}
                        onClick={() => {
                          setEditingId(row.attendance_id);
                          setEditStatus(row.status);
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
