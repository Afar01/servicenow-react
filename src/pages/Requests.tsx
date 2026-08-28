import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_REQUESTS } from "../mockData";
import Badge from "../components/Badge";

const APPROVAL_FILTERS = ["All", "Pending", "Approved", "Rejected"];
const TYPE_FILTERS     = ["All", "Hardware", "Software", "Access Request", "Account Setup"];

function getApprovalColor(status: string): string {
  switch (status) {
    case "Pending":  return "#EF9F27";
    case "Approved": return "#639922";
    case "Rejected": return "#E24B4A";
    default:         return "#9CA3AF";
  }
}

export default function Requests() {
  const navigate = useNavigate();
  const [search,         setSearch]         = useState("");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [typeFilter,     setTypeFilter]     = useState("All");

  const filtered = useMemo(() => {
    return MOCK_REQUESTS.filter(req => {
      const matchSearch =
        req.Title.toLowerCase().includes(search.toLowerCase()) ||
        req.REQ_Number.toLowerCase().includes(search.toLowerCase());
      const matchApproval =
        approvalFilter === "All" || req.ApprovalStatus.Value === approvalFilter;
      const matchType =
        typeFilter === "All" || req.RequestType.Value === typeFilter;
      return matchSearch && matchApproval && matchType;
    });
  }, [search, approvalFilter, typeFilter]);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
            Requests
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            {approvalFilter !== "All" ? ` · ${approvalFilter}` : ""}
          </p>
        </div>
        <button onClick={() => navigate("/requests/new")}
          style={{ backgroundColor: "#0078D4", color: "white", border: "none",
            borderRadius: "8px", padding: "10px 18px", fontSize: "13px",
            fontWeight: "600", cursor: "pointer" }}>
          + New Request
        </button>
      </div>

      {/* Search */}
      <input type="text" placeholder="Search by title or REQ number..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", fontSize: "13px",
          border: "1px solid #E5E7EB", borderRadius: "8px", marginBottom: "12px",
          outline: "none", boxSizing: "border-box", backgroundColor: "white" }} />

      {/* Approval filter chips */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
        {APPROVAL_FILTERS.map(f => (
          <button key={f} onClick={() => setApprovalFilter(f)}
            style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
              fontWeight: "500", cursor: "pointer", border: "1.5px solid",
              borderColor: approvalFilter === f ? "#0078D4" : "#E5E7EB",
              backgroundColor: approvalFilter === f ? "#0078D4" : "white",
              color: approvalFilter === f ? "white" : "#6B7280",
              transition: "all 0.15s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Type filter chips */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {TYPE_FILTERS.map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "11px",
              fontWeight: "500", cursor: "pointer", border: "1.5px solid",
              borderColor: typeFilter === f ? "#639922" : "#E5E7EB",
              backgroundColor: typeFilter === f ? "#639922" : "white",
              color: typeFilter === f ? "white" : "#6B7280",
              transition: "all 0.15s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
            <div style={{ fontSize: "14px", fontWeight: "500" }}>No requests found</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          filtered.map((req, idx) => (
            <div key={req.Id}
              onClick={() => navigate(`/requests/${req.Id}`)}
              style={{ display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 20px", cursor: "pointer",
                borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

              {/* Approval color dot */}
              <div style={{ width: "10px", height: "10px", borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: getApprovalColor(req.ApprovalStatus.Value) }} />

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937",
                  marginBottom: "3px", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {req.Title}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {req.REQ_Number} · {req.RequestType.Value}
                  {req.RequestedBy
                    ? ` · ${req.RequestedBy.Title}`
                    : ""}
                </div>
              </div>

              {/* Request type badge */}
              <span style={{ fontSize: "11px", fontWeight: "500", color: "#6B7280",
                backgroundColor: "#F3F4F6", padding: "3px 10px",
                borderRadius: "20px", whiteSpace: "nowrap", flexShrink: 0 }}>
                {req.RequestType.Value}
              </span>

              {/* Approval badge */}
              <span style={{
                fontSize: "11px", fontWeight: "600", color: "white", flexShrink: 0,
                backgroundColor: getApprovalColor(req.ApprovalStatus.Value),
                padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                {req.ApprovalStatus.Value}
              </span>

              <span style={{ color: "#D1D5DB", fontSize: "18px" }}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}