function formatLabel(label) {
  return label?.replace(/_/g, " ").toLowerCase() ?? "";
}

export function StatusBadge({ status, active = false }) {
  const isActive = active || status === "IN_PROGRESS";
  return (
    <span className={isActive ? "badge-box-active" : "badge-box"}>
      {formatLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const isHigh = ["urgent", "high"].includes(priority.toLowerCase());
  return (
    <span className={isHigh ? "badge-box-active" : "badge-box"}>
      {formatLabel(priority)}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isElevated = role === "admin" || role === "moderator";
  return (
    <span className={isElevated ? "badge-box-active" : "badge-box"}>
      {formatLabel(role)}
    </span>
  );
}
