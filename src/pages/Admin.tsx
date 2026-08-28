import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_INCIDENTS, MOCK_REQUESTS } from "../mockData";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";

export default function Admin() {
  const navigate = useNavigate();
  const [isManager, setIsManager]   = useState(false);
  const [search,    setSearch]       = useState("");
  const [stateFilter, setStateFilter] = useState("All");

  const totalIncidents   = MOCK_INCIDENTS.length;
  const openIncidents    = MOCK_INCIDENTS.filter(
    i => i.State.Value !== "Resolved" && i.State.Value !== "Closed"
  ).length;
  const totalRequests    = MOCK_REQUESTS.length;
  const pendingApprovals = MOCK_REQUESTS.filter(
    r => r.ApprovalStatus.Value === "Pending"
  ).length;

  const STATE_FILTERS = ["All", "New", "In Progress", "On Hold", "Resolved", "Closed"];

  const filtered = useMemo(() => {
    return MOCK_INCIDENTS.filter(inc => {
      const matchSearch =
        inc.Title.toLowerCase().includes(search.toLowerCase()) ||
        inc.INC_Number.toLowerCase().includes(search.toLowerCase());
      const matchState =
        stateFilter === "All" || inc.State.Value === stateFilter;
      return matchSearch && matchState;
    });
  }, [search, stateFilter]);

  function getPriorityColor(p: string): string {
    if (p === "1-Critical") return "#E24B4A";
    if (p === "2-High")     return "#EF9F27";
    if (p === "3-Medium")   return "#0078D4";
    return "#639922";
  }

  // Access Restricted screen
  if (!isManager) {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto",
        textAlign: "center", padding: "48px 24px" }}>

        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h1 style={{ fontSize: "22px", fontWeight: "700",
          color: "#1F2937", marginBottom: "8px" }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "32px" }}>
          Manager view — all records
        </p>

        <div style={{ backgroundColor: "#FCEBEB", border: "1px solid #F09595",
          borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <div style={{ fontSize: "16px", fontWeight: "600",
            color: "#791F1F", marginBottom: "8px" }}>
            Access Restricted
          </div>
          <div style={{ fontSize: "13px", color: "#791F1F" }}>
            This area is for managers only.<br />
            Contact your IT admin to request access.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>Manager Mode</span>
          <div onClick={() => setIsManager(true)}
            style={{ width: "48px", height: "26px", backgroundColor: "#E5E7EB",
              borderRadius: "20px", cursor: "pointer", position: "relative",
              transition: "background 0.2s" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "white",
              borderRadius: "50%", position: "absolute", top: "3px", left: "3px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Off</span>
        </div>
      </div>
    );
  }

  // Manager view
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700",
            color: "#1F2937", margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Manager view — all records
          </p>
        </div>
        {/* Manager toggle ON */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#6B7280" }}>Manager Mode</span>
          <div onClick={() => setIsManager(false)}
            style={{ width: "48px", height: "26px", backgroundColor: "#0078D4",
              borderRadius: "20px", cursor: "pointer", position: "relative",
              transition: "background 0.2s" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "white",
              borderRadius: "50%", position: "absolute", top: "3px", left: "25px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: "12px", color: "#0078D4", fontWeight: "600" }}>On</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "16px",
        marginBottom: "28px", flexWrap: "wrap" }}>
        <StatCard label="Total Incidents"   value={totalIncidents}   color="#0078D4" />
        <StatCard label="Open Incidents"    value={openIncidents}    color="#E24B4A" />
        <StatCard label="Total Requests"    value={totalRequests}    color="#639922" />
        <StatCard label="Pending Approvals" value={pendingApprovals} color="#EF9F27" />
      </div>

      {/* All Incidents table */}
      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600",
            color: "#1F2937", margin: 0 }}>
            All Incidents
            <span style={{ fontSize: "12px", fontWeight: "400",
              color: "#9CA3AF", marginLeft: "8px" }}>
              {filtered.length} of {totalIncidents}
            </span>
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input type="text" placeholder="Search..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 12px", fontSize: "12px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", width: "180px" }} />
            <select value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              style={{ padding: "7px 10px", fontSize: "12px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {STATE_FILTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontSize: "13px" }}>No incidents match your search</div>
          </div>
        ) : (
          filtered.map((inc, idx) => (
            <div key={inc.Id}
              onClick={() => navigate(`/incidents/${inc.Id}`)}
              style={{ display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 20px", cursor: "pointer",
                borderBottom: idx < filtered.length - 1
                  ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s" }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = "#F9FAFB")}
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = "transparent")}>

              <div style={{ width: "9px", height: "9px", borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: getPriorityColor(inc.Priority.Value) }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600",
                  color: "#1F2937", marginBottom: "2px",
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap" }}>
                  {inc.Title}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {inc.INC_Number} · {inc.Category.Value}
                  {inc.AssignedTo
                    ? ` · ${inc.AssignedTo.Title}`
                    : " · Unassigned"}
                </div>
              </div>

              <Badge value={inc.Priority.Value} type="priority" />
              <Badge value={inc.State.Value}    type="state"    />
              <span style={{ color: "#D1D5DB", fontSize: "16px" }}>›</span>
            </div>
          ))
        )}
      </div>

      {/* All Requests summary */}
      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden", marginTop: "20px" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600",
            color: "#1F2937", margin: 0 }}>
            Pending Approvals
            <span style={{ fontSize: "12px", fontWeight: "400",
              color: "#9CA3AF", marginLeft: "8px" }}>
              {pendingApprovals} awaiting decision
            </span>
          </h2>
        </div>

        {MOCK_REQUESTS.filter(r => r.ApprovalStatus.Value === "Pending").length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center",
            color: "#9CA3AF", fontSize: "13px" }}>
            No pending approvals 🎉
          </div>
        ) : (
          MOCK_REQUESTS
            .filter(r => r.ApprovalStatus.Value === "Pending")
            .map((req, idx, arr) => (
              <div key={req.Id}
                onClick={() => navigate(`/requests/${req.Id}`)}
                style={{ display: "flex", alignItems: "center", gap: "12px",
                  padding: "13px 20px", cursor: "pointer",
                  borderBottom: idx < arr.length - 1
                    ? "1px solid #F9FAFB" : "none",
                  transition: "background 0.15s" }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = "transparent")}>

                <div style={{ width: "9px", height: "9px", borderRadius: "50%",
                  flexShrink: 0, backgroundColor: "#EF9F27" }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600",
                    color: "#1F2937", marginBottom: "2px" }}>
                    {req.Title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    {req.REQ_Number} · {req.RequestType.Value}
                    {req.RequestedBy ? ` · ${req.RequestedBy.Title}` : ""}
                  </div>
                </div>

                <span style={{ fontSize: "11px", fontWeight: "600",
                  color: "white", backgroundColor: "#EF9F27",
                  padding: "3px 10px", borderRadius: "20px",
                  whiteSpace: "nowrap" }}>
                  Pending
                </span>
                <span style={{ color: "#D1D5DB", fontSize: "16px" }}>›</span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}