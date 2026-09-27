import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch } from "../api";

export default function CreateForm({ resource, onCreated, user }) {
  const initial = Object.fromEntries(resource.fields.map(([name]) => [name, ""]));
  const [values, setValues] = useState(initial);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isDepartmentCollegeId = resource.key === "departments";
  const isRoutine = resource.key === "routines";
  const selectedDepartmentId = values.dept_id;
  const availableAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          !values.slot_id ||
          !values.day ||
          !routines.some(
            (routine) =>
              String(routine.st_id) === String(assignment.st_id) &&
              String(routine.slot_id) === String(values.slot_id) &&
              routine.day === values.day
          )
      ),
    [assignments, routines, values.slot_id, values.day]
  );
  const selectedAssignment = assignments.find((assignment) => String(assignment.st_id) === String(values.st_id));
  const availableTeachers = useMemo(() => {
    if (!selectedAssignment || !values.slot_id || !values.day) return [];
    return assignments
      .filter(
        (assignment) =>
          assignment.subject_id === selectedAssignment.subject_id &&
          !routines.some(
            (routine) =>
              String(routine.st_id) === String(assignment.st_id) &&
              String(routine.slot_id) === String(values.slot_id) &&
              routine.day === values.day
          )
      )
      .reduce((result, assignment) => {
        if (!result.some((teacher) => teacher.teacher_id === assignment.teacher_id)) {
          result.push(assignment);
        }
        return result;
      }, []);
  }, [assignments, routines, selectedAssignment, values.day, values.slot_id]);
  const departmentSubjects = subjects.filter((subject) => String(subject.dept_id) === String(selectedDepartmentId));
  const departmentTeachers = teachers;
  const selectedSubject = subjects.find((subject) => String(subject.subject_id) === String(values.subject_id));

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

  useEffect(() => {
    if (!isRoutine) return;
    setAssignments([]);
    setSlots([]);
    setRoutines([]);
    setValues((current) => ({ ...current, st_id: "", slot_id: "" }));
    if (!selectedDepartmentId) return;

    Promise.all([apiFetch(`/admin/subject-teachers?dept_id=${selectedDepartmentId}`), apiFetch("/admin/slots")])
      .then(([assignmentData, slotData]) => {
        setAssignments(assignmentData);
        setSlots(slotData);
      })
      .catch((requestError) => setError(requestError.message));
  }, [isRoutine, selectedDepartmentId]);

  useEffect(() => {
    if (!isRoutine || !selectedDepartmentId) return;
    apiFetch(`/admin/routines?dept_id=${selectedDepartmentId}`)
      .then(setRoutines)
      .catch((requestError) => setError(requestError.message));
  }, [isRoutine, selectedDepartmentId]);

  useEffect(() => {
    if (
      isRoutine &&
      values.st_id &&
      !availableAssignments.some((assignment) => String(assignment.st_id) === String(values.st_id))
    ) {
      setValues((current) => ({ ...current, st_id: "" }));
    }
  }, [isRoutine, values.st_id, availableAssignments]);

  useEffect(() => {
    if (
      !isRoutine ||
      !selectedAssignment ||
      !availableTeachers.length ||
      availableTeachers.some((assignment) => String(assignment.teacher_id) === String(values.teacher_id))
    ) {
      return;
    }
    setValues((current) => ({
      ...current,
      teacher_id: String(selectedAssignment.teacher_id),
      st_id: String(selectedAssignment.st_id),
    }));
  }, [isRoutine, selectedAssignment, availableTeachers, values.teacher_id]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload =
      resource.key === "subject-teachers"
        ? {
            dept_id: Number(values.dept_id),
            subject_id: Number(values.subject_id),
            teacher_id: Number(values.teacher_id),
          }
        : Object.fromEntries(
            Object.entries(values)
              .filter(([key, value]) => key !== "teacher_id" && value !== "")
              .map(([key, value]) => {
                const field = resource.fields.find(([name]) => name === key);
                return [key, field?.[2] === "number" ? Number(value) : value];
              })
          );
    if (resource.key === "subject-teachers" && Object.values(payload).some((value) => !Number.isInteger(value) || value <= 0)) {
      setError("Select a department, subject, and teacher before creating the assignment");
      setSaving(false);
      return;
    }
    try {
      await apiFetch(resource.create, "POST", payload);
      setValues({
        ...initial,
        ...(isDepartmentCollegeId && user?.college_id ? { college_id: String(user.college_id) } : {}),
      });
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
                onChange={(event) =>
                  setValues({
                    ...values,
                    [name]: event.target.value,
                    ...(resource.key === "subject-teachers" ? { subject_id: "", teacher_id: "" } : {}),
                    ...(isRoutine ? { st_id: "", teacher_id: "", slot_id: "", day: "" } : {}),
                  })
                }
              >
                <option value="">Select a department</option>
                {departments.map((department) => (
                  <option key={department.dept_id} value={department.dept_id}>
                    {department.dept_id} - {department.dept_name} ({department.dept_code})
                  </option>
                ))}
              </select>
            ) : isRoutine && name === "st_id" ? (
              <select
                required
                value={values[name]}
                disabled={!selectedDepartmentId}
                onChange={(event) => setValues({ ...values, [name]: event.target.value })}
              >
                <option value="">{selectedDepartmentId ? "Select an assignment" : "Select a department first"}</option>
                {availableAssignments.map((assignment) => (
                  <option key={assignment.st_id} value={assignment.st_id}>
                    {assignment.subject_name} ({assignment.subject_code}) - {assignment.teacher_name} (
                    {assignment.teacher_code}) - Year {assignment.year ?? "—"}, Sem {assignment.sem ?? "—"}
                  </option>
                ))}
              </select>
            ) : isRoutine && name === "slot_id" ? (
              <select
                required
                value={values[name]}
                disabled={!selectedDepartmentId}
                onChange={(event) => setValues({ ...values, [name]: event.target.value })}
              >
                <option value="">{selectedDepartmentId ? "Select a time slot" : "Select a department first"}</option>
                {slots.map((slot) => (
                  <option key={slot.slot_id} value={slot.slot_id}>
                    {slot.slot_name ? `${slot.slot_name} - ` : ""}
                    {slot.start_time} - {slot.end_time}
                  </option>
                ))}
              </select>
            ) : isRoutine && name === "teacher_id" ? (
              <select
                required
                value={values[name] || ""}
                disabled={!values.st_id || !values.slot_id || !values.day}
                onChange={(event) => {
                  const assignment = availableTeachers.find((item) => String(item.teacher_id) === event.target.value);
                  setValues({
                    ...values,
                    teacher_id: event.target.value,
                    st_id: String(assignment?.st_id || values.st_id),
                  });
                }}
              >
                <option value="">
                  {values.st_id && values.slot_id && values.day
                    ? "Select an available teacher"
                    : "Select assignment, slot, and day first"}
                </option>
                {availableTeachers.map((assignment) => (
                  <option key={assignment.teacher_id} value={assignment.teacher_id}>
                    {assignment.teacher_name} ({assignment.teacher_code})
                  </option>
                ))}
              </select>
            ) : isRoutine && name === "day" ? (
              <select required value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })}>
                <option value="">Select a day</option>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            ) : name === "subject_id" ? (
              <select required value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })}>
                <option value="">Select a subject</option>
                {departmentSubjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_id} - {subject.subject_name} ({subject.subject_code}) - Year{" "}
                    {subject.year ?? "—"}, Sem {subject.sem ?? "—"}
                  </option>
                ))}
              </select>
            ) : name === "teacher_id" ? (
              <select required value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })}>
                <option value="">Select a teacher</option>
                {departmentTeachers.map((teacher) => (
                  <option key={teacher.teacher_id} value={teacher.teacher_id}>
                    {teacher.teacher_id} - {teacher.name} ({teacher.teacher_code})
                  </option>
                ))}
              </select>
            ) : (
              <input
                required={[
                  "college_id",
                  "dept_name",
                  "dept_code",
                  "name",
                  "email",
                  "password",
                  "teacher_code",
                  "roll_no",
                  "year",
                  "sem",
                  "subject_name",
                  "subject_code",
                  "subject_id",
                  "teacher_id",
                  "start_time",
                  "end_time",
                  "st_id",
                  "slot_id",
                  "day",
                ].includes(name)}
                disabled={isDepartmentCollegeId && name === "college_id"}
                type={type || "text"}
                value={values[name]}
                onChange={(event) => setValues({ ...values, [name]: event.target.value })}
              />
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
      <button className="primary-button" disabled={saving} type="submit">
        <Plus size={16} /> {saving ? "Saving…" : `Create ${resource.label.slice(0, -1)}`}
      </button>
    </form>
  );
}
