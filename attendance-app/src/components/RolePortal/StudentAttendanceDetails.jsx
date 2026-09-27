import { useState } from "react";

export default function StudentAttendanceDetails({ summaries }) {
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

  return (
    <div className="create-form">
      <div className="form-grid">
        <label>
          Overall target attendance (%)
          <input
            type="number"
            min="1"
            max="100"
            value={overallTarget}
            onChange={(event) => updateOverallTarget(event.target.value)}
          />
        </label>
        <div className="stat-card">
          <div>
            <span>Classes needed overall</span>
            <strong>{classesNeeded(overallAttended, overallTotal, overallTarget)}</strong>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Attendance</th>
              <th>Percentage</th>
              <th>Target %</th>
              <th>Present classes needed</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => {
              const target = subjectTargets[summary.subject_id] || "75";
              return (
                <tr key={summary.subject_id}>
                  <td>
                    {summary.subject_name} ({summary.subject_code})
                  </td>
                  <td>
                    {summary.attended} / {summary.total}
                  </td>
                  <td>{summary.percentage}%</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={target}
                      onChange={(event) => updateSubjectTarget(summary.subject_id, event.target.value)}
                    />
                  </td>
                  <td>{classesNeeded(summary.attended, summary.total, target)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
