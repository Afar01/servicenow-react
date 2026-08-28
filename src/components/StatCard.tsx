interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderTop: `4px solid ${color}`,
      flex: "1",
      minWidth: "160px",
    }}>
      <div style={{
        fontSize: "36px",
        fontWeight: "700",
        color: color,
        marginBottom: "6px",
      }}>{value}</div>
      <div style={{
        fontSize: "13px",
        color: "#6B7280",
        fontWeight: "500",
      }}>{label}</div>
    </div>
  );
}
