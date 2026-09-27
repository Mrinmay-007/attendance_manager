export function statusClass(status) {
  return `status-badge status-${String(status || "").toLowerCase()}`;
}

export function titleFor(key) {
  return key === "overview" ? "Overview" : key.replace("-", " ");
}

export function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
