import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import { getIncidents } from "../api/incidents";
import { getRequests } from "../api/requests";
import { getVal } from "../types";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";

export default function Admin() {
  const navigate        = useNavigate();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [isManager,   setIsManager]   = useState(false);
  const [incidents,   setIncidents]   = useState<any[]>([]);
  const [requests,    setRequests]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [stateFilter, setStateFilter] = useState("All");

  const STATE_FILTERS = ["All", "New", "In Progress", "On Hold", "Resolved", "Closed"];

  useEffect(() => {
    if (isManager && isAuthenticated) {
      loadData();
    }
  }, [isManager, isAuthenticated]);

  async function getToken() {
    const account = instance.getActiveAccount() || accounts[0];
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  }

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const [inc, req] = await Promise.all([
        getIncidents(token),
        getRequests(token),
      ]);
      setIncidents(inc);
      setRequests(req);
    } catch (e) {
      setError("Failed to load data — " + String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch =
        (inc.Title ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (inc.INC_Number ?? "").toLowerCase().includes(search.toLowerCase());
      const matchState =
        stateFilter === "All" || getVal(inc.State) === stateFilter;
      return matchSearch && matchState;
    });
  }, [incidents, search, stateFilter]);

  const totalIncidents   = incidents.length;
  const openIncidents    = incidents.filter(
    i => getVal(i.State) !== "Resolved" && getVal(i.State) !== "Closed"
  ).length;
  const totalRequests    = requests.length;
  const pendingApprovals = requests.filter(
    r => getVal(r.ApprovalStatus) === "Pending"
  ).length;

  function getPriorityColor(inc: any): string {
    const p = getVal(inc.Priority);
    if (p === "1-Critical") return "#E24B4A";
    if (p === "2-High")     return "#EF9F27";
    if (p === "3-Medium")   return "#0078D4";
    return "#639922";
  }

  // Access Restricted
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
              borderRadius: "20px", cursor: "pointer", position: "relative" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "white",
              borderRadius: "50%", position: "absolute", top: "3px", left: "3px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Off</span>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <div style={{ fontSize: "14px" }}>
          Loading all data from SharePoint...
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
            Manager view — all records ·{" "}
            <span style={{ color: "#639922" }}>live SharePoint data ✅</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={loadData}
            style={{ padding: "7px 14px", backgroundColor: "white",
              color: "#0078D4", border: "1px solid #0078D4",
              borderRadius: "8px", fontSize: "12px",
              fontWeight: "500", cursor: "pointer" }}>
            🔄 Refresh
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>
              Manager Mode
            </span>
            <div onClick={() => setIsManager(false)}
              style={{ width: "48px", height: "26px", backgroundColor: "#0078D4",
                borderRadius: "20px", cursor: "pointer", position: "relative" }}>
              <div style={{ width: "20px", height: "20px",
                backgroundColor: "white", borderRadius: "50%",
                position: "absolute", top: "3px", left: "25px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#0078D4", fontWeight: "600" }}>
              On
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#FCEBEB", border: "1px solid #F09595",
          borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
          fontSize: "13px", color: "#791F1F" }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "16px",
        marginBottom: "28px", flexWrap: "wrap" }}>
        <StatCard label="Total Incidents"   value={totalIncidents}   color="#0078D4" />
        <StatCard label="Open Incidents"    value={openIncidents}    color="#E24B4A" />
        <StatCard label="Total Requests"    value={totalRequests}    color="#639922" />
        <StatCard label="Pending Approvals" value={pendingApprovals} color="#EF9F27" />
      </div>

      {/* All Incidents */}
      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
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
                outline: "none", backgroundColor: "white",
                cursor: "pointer" }}>
              {STATE_FILTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontSize: "13px" }}>No incidents match</div>
          </div>
        ) : (
          filtered.map((inc, idx) => (
            <div key={inc.Id}
              onClick={() => navigate("/incidents/" + inc.Id)}
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
                flexShrink: 0, backgroundColor: getPriorityColor(inc) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600",
                  color: "#1F2937", marginBottom: "2px",
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap" }}>
                  {inc.Title}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {inc.INC_Number}
                  {getVal(inc.Category) ? " · " + getVal(inc.Category) : ""}
                  {inc.AssignedTo
                    ? " · " + inc.AssignedTo.Title
                    : " · Unassigned"}
                </div>
              </div>
              <Badge value={getVal(inc.Priority) || "Unknown"} type="priority" />
              <Badge value={getVal(inc.State)    || "Unknown"} type="state"    />
              <span style={{ color: "#D1D5DB", fontSize: "16px" }}>›</span>
            </div>
          ))
        )}
      </div>

      {/* Pending Approvals */}
      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
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

        {pendingApprovals === 0 ? (
          <div style={{ padding: "32px", textAlign: "center",
            color: "#9CA3AF", fontSize: "13px" }}>
            No pending approvals 🎉
          </div>
        ) : (
          requests
            .filter(r => getVal(r.ApprovalStatus) === "Pending")
            .map((req, idx, arr) => (
              <div key={req.Id}
                onClick={() => navigate("/requests/" + req.Id)}
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
                    {req.REQ_Number} · {getVal(req.RequestType)}
                    {req.RequestedBy ? " · " + req.RequestedBy.Title : ""}
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