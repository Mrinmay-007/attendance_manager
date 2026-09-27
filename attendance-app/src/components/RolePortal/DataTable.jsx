import { useMemo, useState } from "react";
import { Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { apiFetch } from "../api";
import { formatValue, statusClass } from "./utils";

export default function DataTable({ rows, loading, resource, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [attendanceEditingId, setAttendanceEditingId] = useState(null);
  const [attendanceEditStatus, setAttendanceEditStatus] = useState("");

  const columns = useMemo(() => {
    if (resource?.key === "attendance") {
      return ["date", "student_name", "roll_no", "c_roll_no", "dept_name", "subject_name", "status"];
    }
    const keys = new Set();
    rows.forEach((row) => Object.keys(row || {}).forEach((key) => keys.add(key)));
    const editableColumns = resource?.editFields?.map(([name]) => name) || [];
    const columns = [...new Set([...editableColumns, ...keys])];
    if (resource?.key === "subject-teachers") {
      return columns
        .filter((column) => !["subject_id", "teacher_id", "st_id", "dept_name", "dept_code"].includes(column))
        .slice(0, 8);
    }
    if (resource?.key === "departments") {
      return columns.filter((column) => column !== "college_id").slice(0, 8);
    }
    return columns.slice(0, 8);
  }, [rows, resource]);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const dateOrder = String(b.date || "").localeCompare(String(a.date || ""));
        if (dateOrder) return dateOrder;
        return String(a.c_roll_no || a.roll_no || "").localeCompare(
          String(b.c_roll_no || b.roll_no || ""),
          undefined,
          { numeric: true }
        );
      }),
    [rows]
  );

  if (loading) {
    return (
      <div className="empty-state">
        <RefreshCw className="spin" size={20} /> Loading live data…
      </div>
    );
  }
  if (!rows.length) return <div className="empty-state">No records found for this workspace.</div>;

  const canManage = Boolean(resource?.update && resource?.remove && resource?.id && resource?.editFields);
  const isAttendanceTable = resource?.key === "attendance";

  function startEditing(row) {
    setActionError("");
    setEditingId(row[resource.id]);
    setEditValues(Object.fromEntries(resource.editFields.map(([name]) => [name, row[name] ?? ""])));
  }

  async function saveEdit(row) {
    if (!window.confirm(`Update this ${resource.label.slice(0, -1).toLowerCase()}?`)) return;
    setSaving(true);
    setActionError("");
    try {
      const payload = Object.fromEntries(
        Object.entries(editValues).map(([key, value]) => {
          const field = resource.editFields.find(([name]) => name === key);
          return [key, field?.[2] === "number" ? Number(value) : value];
        })
      );
      await apiFetch(`${resource.update}/${row[resource.id]}`, "PATCH", payload);
      setEditingId(null);
      onChanged();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(row) {
    if (!window.confirm(`Delete this ${resource.label.slice(0, -1).toLowerCase()}? This action cannot be undone.`))
      return;
    setSaving(true);
    setActionError("");
    try {
      await apiFetch(`${resource.remove}/${row[resource.id]}`, "DELETE");
      onChanged();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveAttendanceEdit(row) {
    const status = attendanceEditStatus;
    if (!window.confirm(`Update attendance for ${row.student_name}?`)) return;
    setSaving(true);
    setActionError("");
    try {
      await apiFetch("/teacher/attendance", "POST", {
        st_id: row.st_id,
        student_id: row.student_id,
        date: row.date,
        status,
      });
      onChanged();
      setAttendanceEditingId(null);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function displayValue(row, column) {
    if (resource?.key === "subject-teachers" && column === "subject_id" && row.subject) {
      return `${row.subject_id} - ${row.subject.subject_name} (${row.subject.subject_code})`;
    }
    if (resource?.key === "subject-teachers" && column === "teacher_id" && row.teacher) {
      return `${row.teacher_id} - ${row.teacher.name} (${row.teacher.teacher_code})`;
    }
    if (resource?.key === "subject-teachers" && column === "subject_name") {
      return `${formatValue(row.subject_name)} (${formatValue(row.subject_code)})`;
    }
    if (resource?.key === "subject-teachers" && column === "teacher_name") {
      return `${formatValue(row.teacher_name)} (${formatValue(row.teacher_code)})`;
    }
    if (resource?.key === "subjects" && column === "dept_id") {
      return `${row.dept_id} - ${formatValue(row.dept_name)} (${formatValue(row.dept_code)})`;
    }
    if (resource?.key === "subject-teachers" && column === "dept_id") {
      return `${row.dept_id} - ${formatValue(row.dept_name)} (${formatValue(row.dept_code)})`;
    }
    // Unreachable: identical to the "subject-teachers" + subject_name/teacher_name checks
    // above - those already return first, so these never run. See changes.md.
    if (resource?.key === "attendance" && column === "student_id") {
      return formatValue(row.roll_no);
    }
    if (resource?.key === "attendance" && column === "dept_name") {
      return `${formatValue(row.dept_name)} (${formatValue(row.dept_code)})`;
    }
    if (resource?.key === "attendance" && column === "subject_name") {
      return `${formatValue(row.subject_name)} (${formatValue(row.subject_code)})`;
    }
    return formatValue(row[column]);
  }

  return (
    <div className="table-wrap">
      {actionError && (
        <div className="alert">
          <X size={16} />
          {actionError}
        </div>
      )}
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column.replaceAll("_", " ")}</th>
            ))}
            {(canManage || isAttendanceTable) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => {
            const rowKey = row.id || row[`${columns[0]}`] || index;
            const editing = editingId === row[resource.id];
            return (
              <tr key={rowKey}>
                {columns.map((column) => (
                  <td key={column}>
                    {editing && resource.editFields.some(([name]) => name === column) ? (
                      <input
                        className="table-input"
                        type={resource.editFields.find(([name]) => name === column)?.[2] || "text"}
                        value={editValues[column]}
                        onChange={(event) => setEditValues({ ...editValues, [column]: event.target.value })}
                      />
                    ) : column === "status" ? (
                      <span className={statusClass(row.status)}>{row.status}</span>
                    ) : (
                      displayValue(row, column)
                    )}
                  </td>
                ))}
                {canManage && (
                  <td>
                    <div className="row-actions">
                      {editing ? (
                        <>
                          <button className="action-button" disabled={saving} onClick={() => saveEdit(row)}>
                            Save
                          </button>
                          <button className="action-button" disabled={saving} onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-button"
                            title="Edit department"
                            disabled={saving}
                            onClick={() => startEditing(row)}
                          >
                            <Pencil size={15} /> Edit
                          </button>
                          <button
                            className="action-button danger-button"
                            title="Delete department"
                            disabled={saving}
                            onClick={() => deleteRow(row)}
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
                {isAttendanceTable && (
                  <td>
                    {attendanceEditingId === row.attendance_id ? (
                      <div className="row-actions">
                        <select
                          className="status-select"
                          value={attendanceEditStatus}
                          onChange={(event) => setAttendanceEditStatus(event.target.value)}
                        >
                          {["Present", "Absent", "Late"].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button className="action-button" disabled={saving} onClick={() => saveAttendanceEdit(row)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        className="icon-button attendance-edit-button"
                        title="Edit attendance status"
                        aria-label={`Edit attendance for ${row.student_name}`}
                        disabled={saving}
                        onClick={() => {
                          setAttendanceEditingId(row.attendance_id);
                          setAttendanceEditStatus(row.status);
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
