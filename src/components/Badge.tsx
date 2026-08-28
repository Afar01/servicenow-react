interface BadgeProps {
  value: string;
  type: "state" | "priority";
}

function getStateColor(state: string): string {
  switch (state) {
    case "New":         return "#E24B4A";
    case "In Progress": return "#0078D4";
    case "On Hold":     return "#EF9F27";
    case "Resolved":    return "#639922";
    case "Closed":      return "#6B7280";
    default:            return "#9CA3AF";
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "1-Critical": return "#E24B4A";
    case "2-High":     return "#EF9F27";
    case "3-Medium":   return "#0078D4";
    case "4-Low":      return "#639922";
    default:           return "#9CA3AF";
  }
}

export default function Badge({ value, type }: BadgeProps) {
  const color = type === "state"
    ? getStateColor(value)
    : getPriorityColor(value);
  return (
    <span style={{
      backgroundColor: color,
      color: "white",
      fontSize: "11px",
      fontWeight: "600",
      padding: "3px 10px",
      borderRadius: "20px",
      whiteSpace: "nowrap",
    }}>{value}</span>
  );
}
