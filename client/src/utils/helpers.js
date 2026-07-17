// Small shared helpers used across pages/components.

export function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function percentage(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

export function firstName(fullName = "") {
  return fullName.split(" ")[0];
}

export function attendanceColor(pct) {
  return pct >= 75 ? "text-teal" : "text-coral";
}
