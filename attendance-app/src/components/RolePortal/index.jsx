import { createElement, useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  LogOut,
  Menu,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { apiFetch } from "../api";
import { adminResources, navByRole, roleCopy } from "./constants";
import { titleFor } from "./utils";
import DataTable from "./DataTable";
import StudentAttendanceDetails from "./StudentAttendanceDetails";
import CreateForm from "./CreateForm";
import TeacherAttendanceHistory from "./TeacherAttendanceHistory";
import AttendanceForm from "./AttendanceForm";

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
  const filteredHistory = active === "history" && historyDate ? rows.filter((row) => row.date === historyDate) : rows;

  const load = useCallback(
    async (item = selected) => {
      if (!item.endpoint) return;
      setLoading(true);
      setError("");
      try {
        const result = await apiFetch(item.endpoint);
        if (item.key === "subject-teachers" && Array.isArray(result)) {
          const [subjects, teachers] = await Promise.all([apiFetch("/admin/subjects"), apiFetch("/admin/teachers")]);
          const subjectsById = new Map(subjects.map((subject) => [subject.subject_id, subject]));
          const teachersById = new Map(teachers.map((teacher) => [teacher.teacher_id, teacher]));
          setRows(
            result.map((assignment) => {
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
            })
          );
        } else {
          setRows(Array.isArray(result) ? result : []);
        }
      } catch (requestError) {
        setError(requestError.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [selected]
  );

  useEffect(() => {
    apiFetch("/auth/me")
      .then(setUser)
      .catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [load, active]);
  useEffect(() => {
    if (role !== "student") return;
    apiFetch("/student/attendance-summary")
      .then(setStudentAttendance)
      .catch((requestError) => setError(requestError.message));
  }, [role, active]);
  useEffect(() => {
    if (role !== "admin") return;

    Promise.all(adminResources.slice(0, 4).map((resource) => apiFetch(resource.endpoint)))
      .then((collections) => {
        setOverviewCounts(
          Object.fromEntries(
            adminResources.slice(0, 4).map((resource, index) => [resource.key, collections[index].length])
          )
        );
      })
      .catch((requestError) => setError(requestError.message));
  }, [role]);

  const overviewStats =
    role === "admin"
      ? adminResources.map((item) => ({ label: item.label, value: overviewCounts[item.key] ?? "—", icon: item.icon }))
      : role === "student"
      ? (() => {
          const attended = studentAttendance.reduce((total, item) => total + item.attended, 0);
          const total = studentAttendance.reduce((sum, item) => sum + item.total, 0);
          return [
            { label: "Total attendance", value: `${total ? Math.round((attended * 100) / total) : 0}%`, icon: CheckCircle2 },
            { label: "Attendance score", value: `${attended} / ${total}`, icon: ClipboardCheck },
          ];
        })()
      : [
          { label: "Workspace", value: "Live", icon: CheckCircle2 },
          { label: "Role", value: copy.label, icon: Users },
        ];

  function logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className={`portal ${collapsed ? "portal-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">X</div>
          <span>
            attend<span className="brand-accent">X</span>
          </span>
        </div>
        <div className="sidebar-caption">{copy.eyebrow}</div>
        <nav>
          {nav.map((item) => (
            <button
              className={active === item.key ? "nav-item active" : "nav-item"}
              key={item.key}
              onClick={() => setActive(item.key)}
            >
              {createElement(item.icon, { size: 18 })}
              <span>{item.label}</span>
              {active === item.key && <ChevronRight size={15} className="nav-arrow" />}
            </button>
          ))}
        </nav>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
          <span>{collapsed ? "Open menu" : "Collapse menu"}</span>
        </button>
      </aside>
      <main className="portal-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{titleFor(active)}</h1>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <div className="avatar">{(user?.name || role)[0].toUpperCase()}</div>
              <div>
                <strong>{user?.name || `${role} account`}</strong>
                <small>{user?.email || "Connected account"}</small>
              </div>
            </div>
            <button className="icon-button" title="Sign out" onClick={logout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {active === "overview" ? (
          <section className="overview">
            <div className="welcome-card">
              <div>
                <p className="eyebrow">Welcome back</p>
                <h2>{user?.name || copy.label}</h2>
                <p className="muted">Your attendance operations, organized in one clear view.</p>
              </div>
              <BarChart3 size={88} strokeWidth={1} />
            </div>
            <div className="stat-grid">
              {overviewStats.slice(0, role === "admin" ? 4 : 2).map(({ label, value, icon }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-icon">{createElement(icon, { size: 19 })}</div>
                  <div>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                </div>
              ))}
            </div>
            {role === "student" && (
              <div className="content-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Subject overview</p>
                    <h2>Attendance by subject</h2>
                  </div>
                </div>
                <DataTable
                  rows={studentAttendance.map(({ subject_name, subject_code, percentage }) => ({
                    subject_name,
                    subject_code,
                    percentage: `${percentage}%`,
                  }))}
                  loading={false}
                  resource={{ key: "student-attendance" }}
                />
              </div>
            )}
            <div className="quick-card">
              <div>
                <h3>Built around your role</h3>
                <p className="muted">
                  {role === "admin"
                    ? "Manage the academic structure through the live admin API."
                    : role === "teacher"
                    ? "Review assignments, plan your routine, and record attendance."
                    : "Keep your attendance and weekly routine close at hand."}
                </p>
              </div>
              <button className="primary-button" onClick={() => setActive(nav[1]?.key || "overview")}>
                Open workspace <ChevronRight size={16} />
              </button>
            </div>
          </section>
        ) : (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{role === "admin" ? "Live API collection" : "Live API view"}</p>
                <h2>{selected.label}</h2>
              </div>
              <div className="heading-actions">
                {selected.endpoint && (
                  <button className="secondary-button" onClick={() => load()}>
                    <RefreshCw size={16} /> Refresh
                  </button>
                )}
                {selected.create && (
                  <button
                    className="primary-button"
                    onClick={() => document.getElementById("create-record")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <Plus size={16} /> New record
                  </button>
                )}
              </div>
            </div>
            {error && (
              <div className="alert">
                <X size={16} />
                {error}
              </div>
            )}
            {selected.key === "history" && (
              <div className="create-panel">
                <label>
                  Filter by date
                  <input type="date" value={historyDate} onChange={(event) => setHistoryDate(event.target.value)} />
                </label>
                {historyDate && (
                  <button className="secondary-button" type="button" onClick={() => setHistoryDate("")}>
                    Clear filter
                  </button>
                )}
              </div>
            )}
            {selected.create && (
              <div id="create-record" className="create-panel">
                <h3>Create record</h3>
                <CreateForm resource={selected} user={user} onCreated={() => load()} />
              </div>
            )}
            {role === "teacher" && active === "attendance" && (
              <div className="create-panel">
                <h3>Record attendance</h3>
                <AttendanceForm onCreated={() => load()} />
              </div>
            )}
            {role === "teacher" && active === "teacher-history" ? (
              <TeacherAttendanceHistory />
            ) : role === "student" && active === "attendance" ? (
              loading ? (
                <div className="empty-state">
                  <RefreshCw className="spin" size={20} /> Loading live data…
                </div>
              ) : (
                <StudentAttendanceDetails summaries={rows} />
              )
            ) : (
              <DataTable rows={filteredHistory} loading={loading} resource={selected} onChanged={load} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
