import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  Plus,
  RefreshCw,
  School,
  Users,
  X,
} from "lucide-react";
import { apiFetch } from "./api";

const roleCopy = {
  admin: { label: "Administrator", eyebrow: "Operations workspace" },
  teacher: { label: "Faculty workspace", eyebrow: "Teaching workspace" },
  student: { label: "Student workspace", eyebrow: "Personal overview" },
};

const adminResources = [
  { key: "departments", label: "Departments", endpoint: "/admin/departments", create: "/admin/departments", icon: School, fields: [["college_id", "College ID", "number"], ["dept_name", "Department name"], ["dept_code", "Department code"], ["description", "Description"]] },
  { key: "teachers", label: "Teachers", endpoint: "/admin/teachers", create: "/admin/teachers", icon: Users, fields: [["name", "Full name"], ["email", "Email", "email"], ["password", "Initial password", "password"], ["dept_id", "Department ID", "number"], ["teacher_code", "Teacher code"], ["designation", "Designation"], ["experience", "Experience (years)", "number"], ["join_date", "Join date", "date"]] },
  { key: "students", label: "Students", endpoint: "/admin/students", create: "/admin/students", icon: GraduationCap, fields: [["name", "Full name"], ["email", "Email", "email"], ["password", "Initial password", "password"], ["dept_id", "Department ID", "number"], ["roll_no", "Roll number"], ["c_roll_no", "Class roll number"], ["year", "Year", "number"], ["sem", "Semester", "number"], ["section", "Section"]] },
  { key: "subjects", label: "Subjects", endpoint: "/admin/subjects", create: "/admin/subjects", icon: BookOpen, fields: [["dept_id", "Department ID", "number"], ["subject_name", "Subject name"], ["subject_code", "Subject code"], ["year", "Year", "number"], ["sem", "Semester", "number"]] },
  { key: "subject-teachers", label: "Assignments", endpoint: "/admin/subject-teachers", create: "/admin/subject-teachers", icon: ClipboardCheck, fields: [["dept_id", "Department", "number"], ["subject_id", "Subject", "number"], ["teacher_id", "Teacher", "number"]] },
  { key: "slots", label: "Time slots", endpoint: "/admin/slots", create: "/admin/slots", icon: CalendarDays, fields: [["start_time", "Start time", "time"], ["end_time", "End time", "time"], ["slot_name", "Slot name"]] },
  { key: "routines", label: "Routines", endpoint: "/admin/routines", create: "/admin/routines", icon: CalendarDays, fields: [["st_id", "Assignment ID", "number"], ["slot_id", "Slot ID", "number"], ["dept_id", "Department ID", "number"], ["day", "Day"]] },
];

const navByRole = {
  admin: [{ key: "overview", label: "Overview", icon: LayoutDashboard }, ...adminResources],
  teacher: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "subjects", label: "My subjects", endpoint: "/teacher/my-subjects", icon: BookOpen },
    { key: "routine", label: "My routine", endpoint: "/teacher/my-routine", icon: CalendarDays },
    { key: "attendance", label: "Attendance", endpoint: "/teacher/attendance", icon: ClipboardCheck },
  ],
  student: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "attendance", label: "My attendance", endpoint: "/student/attendance-summary", icon: ClipboardCheck },
    { key: "history", label: "History", endpoint: "/student/attendance-history", icon: CalendarDays },
    { key: "routine", label: "My routine", endpoint: "/student/my-routine", icon: CalendarDays },
  ],
};

function titleFor(key) {
  return key === "overview" ? "Overview" : key.replace("-", " ");
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DataTable({ rows, loading, resource }) {
  const columns = useMemo(() => {
    const keys = new Set();
    rows.forEach((row) => Object.keys(row || {}).forEach((key) => keys.add(key)));
    return [...keys].slice(0, 8);
  }, [rows]);

  if (loading) return <div className="empty-state"><RefreshCw className="spin" size={20} /> Loading live data…</div>;
  if (!rows.length) return <div className="empty-state">No records found for this workspace.</div>;

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
    if (resource?.key === "attendance" && column === "student_id") {
      return formatValue(row.roll_no);
    }
    return formatValue(row[column]);
  }

  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.id || row[`${columns[0]}`] || index}>{columns.map((column) => <td key={column}>{displayValue(row, column)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function StudentAttendanceDetails({ summaries }) {
  const [overallTarget, setOverallTarget] = useState(
    () => localStorage.getItem("attendance-target-overall") || "75"
  );
  const [subjectTargets, setSubjectTargets] = useState(
    () => JSON.parse(localStorage.getItem("attendance-target-subjects") || "{}")
  );

  function updateOverallTarget(value) {
    setOverallTarget(value);
    localStorage.setItem("attendance-target-overall", value);
  }

  function updateSubjectTarget(subjectId, value) {
    const next = { ...subjectTargets, [subjectId]: value };
    setSubjectTargets(next);
    localStorage.setItem("attendance-target-subjects", JSON.stringify(next));
  }

  function classesNeeded(attended, total, target) {
    const percentage = Number(target);
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) return "—";
    if (total === 0 || attended / total >= percentage / 100) return 0;
    if (percentage === 100) return "Not reachable";
    return Math.ceil((percentage * total / 100 - attended) / (1 - percentage / 100));
  }

  const overallAttended = summaries.reduce((sum, item) => sum + item.attended, 0);
  const overallTotal = summaries.reduce((sum, item) => sum + item.total, 0);

  return <div className="create-form">
    <div className="form-grid">
      <label>Overall target attendance (%)
        <input type="number" min="1" max="100" value={overallTarget} onChange={(event) => updateOverallTarget(event.target.value)} />
      </label>
      <div className="stat-card">
        <div><span>Classes needed overall</span><strong>{classesNeeded(overallAttended, overallTotal, overallTarget)}</strong></div>
      </div>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>Subject</th><th>Attendance</th><th>Percentage</th><th>Target %</th><th>Present classes needed</th></tr></thead>
      <tbody>{summaries.map((summary) => {
        const target = subjectTargets[summary.subject_id] || "75";
        return <tr key={summary.subject_id}>
          <td>{summary.subject_name} ({summary.subject_code})</td>
          <td>{summary.attended} / {summary.total}</td>
          <td>{summary.percentage}%</td>
          <td><input type="number" min="1" max="100" value={target} onChange={(event) => updateSubjectTarget(summary.subject_id, event.target.value)} /></td>
          <td>{classesNeeded(summary.attended, summary.total, target)}</td>
        </tr>;
      })}</tbody>
    </table></div>
  </div>;
}

function CreateForm({ resource, onCreated, user }) {
  const initial = Object.fromEntries(resource.fields.map(([name]) => [name, ""]));
  const [values, setValues] = useState(initial);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isDepartmentCollegeId = resource.key === "departments";
  const selectedDepartmentId = values.dept_id;
  const departmentSubjects = subjects.filter(
    (subject) => String(subject.dept_id) === String(selectedDepartmentId)
  );
  const departmentTeachers = teachers.filter(
    (teacher) => String(teacher.dept_id) === String(selectedDepartmentId)
  );
  const selectedSubject = subjects.find(
    (subject) => String(subject.subject_id) === String(values.subject_id)
  );

  useEffect(() => {
    if (isDepartmentCollegeId && user?.college_id) {
      setValues((current) => ({ ...current, college_id: String(user.college_id) }));
    }
  }, [isDepartmentCollegeId, user?.college_id]);

  useEffect(() => {
    const hasDepartment = resource.fields.some(([name]) => name === "dept_id");
    const hasSubject = resource.fields.some(([name]) => name === "subject_id");
    const hasTeacher = resource.fields.some(([name]) => name === "teacher_id");
    if (!hasDepartment && !hasSubject && !hasTeacher) return;

    Promise.all([
      hasDepartment ? apiFetch("/admin/departments") : Promise.resolve([]),
      hasSubject ? apiFetch("/admin/subjects") : Promise.resolve([]),
      hasTeacher ? apiFetch("/admin/teachers") : Promise.resolve([]),
    ])
      .then(([departmentData, subjectData, teacherData]) => {
        setDepartments(departmentData);
        setSubjects(subjectData);
        setTeachers(teacherData);
      })
      .catch((requestError) => setError(requestError.message));
  }, [resource]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "").map(([key, value]) => {
      const field = resource.fields.find(([name]) => name === key);
      return [key, field?.[2] === "number" ? Number(value) : value];
    }));
    try {
      await apiFetch(resource.create, "POST", payload);
      setValues(initial);
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="create-form" onSubmit={submit}>
      <div className="form-grid">
        {resource.fields.map(([name, label, type]) => (
          <label key={name}>
            {label}
            {name === "dept_id" ? (
              <select
                required
                value={values[name]}
                onChange={(event) => setValues({
                  ...values,
                  [name]: event.target.value,
                  ...(resource.key === "subject-teachers" ? { subject_id: "", teacher_id: "" } : {}),
                })}
              >
                <option value="">Select a department</option>
                {departments.map((department) => (
                  <option key={department.dept_id} value={department.dept_id}>
                    {department.dept_id} - {department.dept_name} ({department.dept_code})
                  </option>
                ))}
              </select>
            ) : name === "subject_id" ? (
              <select
                required
                value={values[name]}
                onChange={(event) => setValues({ ...values, [name]: event.target.value })}
              >
                <option value="">Select a subject</option>
                {departmentSubjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_id} - {subject.subject_name} ({subject.subject_code}) - Year {subject.year ?? "—"}, Sem {subject.sem ?? "—"}
                  </option>
                ))}
              </select>
            ) : name === "teacher_id" ? (
              <select
                required
                value={values[name]}
                onChange={(event) => setValues({ ...values, [name]: event.target.value })}
              >
                <option value="">Select a teacher</option>
                {departmentTeachers.map((teacher) => (
                  <option key={teacher.teacher_id} value={teacher.teacher_id}>
                    {teacher.teacher_id} - {teacher.name} ({teacher.teacher_code})
                  </option>
                ))}
              </select>
            ) : (
              <input required={["college_id", "dept_name", "dept_code", "name", "email", "password", "teacher_code", "roll_no", "year", "sem", "subject_name", "subject_code", "subject_id", "teacher_id", "start_time", "end_time", "st_id", "slot_id", "day"].includes(name)} disabled={isDepartmentCollegeId && name === "college_id"} type={type || "text"} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} />
            )}
            {resource.key === "subject-teachers" && name === "subject_id" && selectedSubject && (
              <small className="muted">
                Year: {selectedSubject.year ?? "—"} · Semester: {selectedSubject.sem ?? "—"}
              </small>
            )}
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" disabled={saving} type="submit"><Plus size={16} /> {saving ? "Saving…" : `Create ${resource.label.slice(0, -1)}`}</button>
    </form>
  );
}

function AttendanceForm({ onCreated }) {
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

  async function saveAttendance() {
    if (!selectedAssignment || !students.length) return;
    setError("");
    setSaving(true);
    try {
      const entries = Object.entries(statuses);
      if (!entries.length) {
        throw new Error("Select Present, Absent, or Late for at least one student");
      }
      await Promise.all(entries.map(([studentId, status]) => apiFetch("/teacher/attendance", "POST", {
        st_id: Number(selectedAssignment),
        student_id: Number(studentId),
        date,
        status,
      })));
      onCreated();
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <div className="create-form">
    <div className="form-grid">
      <label>Class / subject
        <select required value={selectedAssignment} onChange={(event) => setSelectedAssignment(event.target.value)}>
          <option value="">Select an assigned class</option>
          {assignments.map((assignment) => (
            <option key={assignment.st_id} value={assignment.st_id}>
              {assignment.subject_name || `Subject ${assignment.subject_id}`} ({assignment.subject_code || assignment.subject_id}) - Year {assignment.year}, Sem {assignment.sem}
            </option>
          ))}
        </select>
      </label>
      <label>Date<input required type="date" value={date} onChange={(event) => { setDate(event.target.value); setStatuses({}); }} /></label>
    </div>
    {error && <p className="form-error">{error}</p>}
    {selectedAssignment && !students.length && <p className="muted">No students found for this assigned class.</p>}
    {students.length > 0 && <div className="table-wrap"><table>
      <thead><tr><th>Student</th><th>Roll number</th><th>Section</th><th>Mark attendance</th></tr></thead>
      <tbody>{students.map((student) => <tr key={student.student_id}>
        <td>{student.name}</td>
        <td>{student.roll_no}{student.c_roll_no ? ` (${student.c_roll_no})` : ""}</td>
        <td>{student.section || "—"}</td>
        <td><div className="heading-actions">
          {["Present", "Absent", "Late"].map((status) => <button className={`attendance-button attendance-${status.toLowerCase()} ${statuses[student.student_id] === status ? "selected" : ""}`} type="button" key={status} onClick={() => selectStatus(student.student_id, status)}>{status}</button>)}
        </div></td>
      </tr>)}</tbody>
    </table></div>}
    {students.length > 0 && <button className="primary-button" type="button" disabled={saving} onClick={saveAttendance}><CheckCircle2 size={16} /> {saving ? "Saving attendance…" : "Save attendance"}</button>}
  </div>;
}

export default function RolePortal({ role }) {
  const [active, setActive] = useState("overview");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [overviewCounts, setOverviewCounts] = useState({});
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [historyDate, setHistoryDate] = useState("");
  const nav = navByRole[role];
  const selected = nav.find((item) => item.key === active) || nav[0];
  const copy = roleCopy[role];
  const filteredHistory = active === "history" && historyDate
    ? rows.filter((row) => row.date === historyDate)
    : rows;

  const load = useCallback(async (item = selected) => {
    if (!item.endpoint) return;
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch(item.endpoint);
      if (item.key === "subject-teachers" && Array.isArray(result)) {
        const [subjects, teachers] = await Promise.all([
          apiFetch("/admin/subjects"),
          apiFetch("/admin/teachers"),
        ]);
        const subjectsById = new Map(subjects.map((subject) => [subject.subject_id, subject]));
        const teachersById = new Map(teachers.map((teacher) => [teacher.teacher_id, teacher]));
        setRows(result.map((assignment) => {
          const subject = subjectsById.get(assignment.subject_id);
          const teacher = teachersById.get(assignment.teacher_id);
          return {
            ...assignment,
            subject_name: subject?.subject_name,
            subject_code: subject?.subject_code,
            year: subject?.year,
            sem: subject?.sem,
            teacher_name: teacher?.name,
            teacher_code: teacher?.teacher_code,
          };
        }));
      } else {
        setRows(Array.isArray(result) ? result : []);
      }
    } catch (requestError) {
      setError(requestError.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    apiFetch("/auth/me").then(setUser).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load, active]);
  useEffect(() => {
    if (role !== "student") return;
    apiFetch("/student/attendance-summary")
      .then(setStudentAttendance)
      .catch((requestError) => setError(requestError.message));
  }, [role, active]);
  useEffect(() => {
    if (role !== "admin") return;

    Promise.all(
      adminResources.slice(0, 4).map((resource) => apiFetch(resource.endpoint))
    )
      .then((collections) => {
        setOverviewCounts(
          Object.fromEntries(
            adminResources.slice(0, 4).map((resource, index) => [
              resource.key,
              collections[index].length,
            ])
          )
        );
      })
      .catch((requestError) => setError(requestError.message));
  }, [role]);

  const overviewStats = role === "admin"
    ? adminResources.map((item) => ({ label: item.label, value: overviewCounts[item.key] ?? "—", icon: item.icon }))
    : role === "student"
      ? (() => {
        const attended = studentAttendance.reduce((total, item) => total + item.attended, 0);
        const total = studentAttendance.reduce((sum, item) => sum + item.total, 0);
        return [
          { label: "Total attendance", value: `${total ? Math.round(attended * 100 / total) : 0}%`, icon: CheckCircle2 },
          { label: "Attendance score", value: `${attended} / ${total}`, icon: ClipboardCheck },
        ];
      })()
    : [{ label: "Workspace", value: "Live", icon: CheckCircle2 }, { label: "Role", value: copy.label, icon: Users }];

  function logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return <div className={`portal ${collapsed ? "portal-collapsed" : ""}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">X</div><span>attend<span className="brand-accent">X</span></span></div>
      <div className="sidebar-caption">{copy.eyebrow}</div>
      <nav>{nav.map((item) => <button className={active === item.key ? "nav-item active" : "nav-item"} key={item.key} onClick={() => setActive(item.key)}>{createElement(item.icon, { size: 18 })}<span>{item.label}</span>{active === item.key && <ChevronRight size={15} className="nav-arrow" />}</button>)}</nav>
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}<span>{collapsed ? "Open menu" : "Collapse menu"}</span></button>
    </aside>
    <main className="portal-main">
      <header className="topbar"><div><p className="eyebrow">{copy.eyebrow}</p><h1>{titleFor(active)}</h1></div><div className="topbar-actions"><div className="user-chip"><div className="avatar">{(user?.name || role)[0].toUpperCase()}</div><div><strong>{user?.name || `${role} account`}</strong><small>{user?.email || "Connected account"}</small></div></div><button className="icon-button" title="Sign out" onClick={logout}><LogOut size={18} /></button></div></header>
      {active === "overview" ? <section className="overview">
        <div className="welcome-card"><div><p className="eyebrow">Welcome back</p><h2>{user?.name || copy.label}</h2><p className="muted">Your attendance operations, organized in one clear view.</p></div><BarChart3 size={88} strokeWidth={1} /></div>
        <div className="stat-grid">{overviewStats.slice(0, role === "admin" ? 4 : 2).map(({ label, value, icon }) => <div className="stat-card" key={label}><div className="stat-icon">{createElement(icon, { size: 19 })}</div><div><span>{label}</span><strong>{value}</strong></div></div>)}</div>
        {role === "student" && <div className="content-card"><div className="section-heading"><div><p className="eyebrow">Subject overview</p><h2>Attendance by subject</h2></div></div><DataTable rows={studentAttendance.map(({ subject_name, subject_code, percentage }) => ({ subject_name, subject_code, percentage: `${percentage}%` }))} loading={false} resource={{ key: "student-attendance" }} /></div>}
        <div className="quick-card"><div><h3>Built around your role</h3><p className="muted">{role === "admin" ? "Manage the academic structure through the live admin API." : role === "teacher" ? "Review assignments, plan your routine, and record attendance." : "Keep your attendance and weekly routine close at hand."}</p></div><button className="primary-button" onClick={() => setActive(nav[1]?.key || "overview")}>Open workspace <ChevronRight size={16} /></button></div>
      </section> : <section className="content-card">
        <div className="section-heading"><div><p className="eyebrow">{role === "admin" ? "Live API collection" : "Live API view"}</p><h2>{selected.label}</h2></div><div className="heading-actions">{selected.endpoint && <button className="secondary-button" onClick={() => load()}><RefreshCw size={16} /> Refresh</button>}{selected.create && <button className="primary-button" onClick={() => document.getElementById("create-record")?.scrollIntoView({ behavior: "smooth" })}><Plus size={16} /> New record</button>}</div></div>
        {error && <div className="alert"><X size={16} />{error}</div>}
        {selected.key === "history" && <div className="create-panel"><label>Filter by date<input type="date" value={historyDate} onChange={(event) => setHistoryDate(event.target.value)} /></label>{historyDate && <button className="secondary-button" type="button" onClick={() => setHistoryDate("")}>Clear filter</button>}</div>}
        {selected.create && <div id="create-record" className="create-panel"><h3>Create record</h3><CreateForm resource={selected} user={user} onCreated={() => load()} /></div>}
        {role === "teacher" && active === "attendance" && <div className="create-panel"><h3>Record attendance</h3><AttendanceForm onCreated={() => load()} /></div>}
        {role === "student" && active === "attendance"
          ? (loading ? <div className="empty-state"><RefreshCw className="spin" size={20} /> Loading live data…</div> : <StudentAttendanceDetails summaries={rows} />)
          : <DataTable rows={filteredHistory} loading={loading} resource={selected} />}
      </section>}
    </main>
  </div>;
}
