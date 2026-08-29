import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import { getIncidents } from "../api/incidents";
import Badge from "../components/Badge";
import { getVal } from "../types";
import type { Incident } from "../types";

const STATE_FILTERS = ["All", "New", "In Progress", "On Hold", "Resolved", "Closed"];

export default function Incidents() {
  const navigate        = useNavigate();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [incidents,    setIncidents]    = useState<Incident[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [stateFilter,  setStateFilter]  = useState("All");

  useEffect(() => {
    const account = instance.getActiveAccount() || accounts[0];
    if (isAuthenticated && account) {
      loadData();
    }
  }, [isAuthenticated]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const account = instance.getActiveAccount() || accounts[0];
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      const data = await getIncidents(response.accessToken);
      setIncidents(data);
    } catch (e) {
      setError("Failed to load incidents — " + String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch =
        (inc.Title ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (inc.INC_Number ?? "").toLowerCase().includes(search.toLowerCase()) ||
        getVal(inc.Category).toLowerCase().includes(search.toLowerCase());
      const matchState =
        stateFilter === "All" || getVal(inc.State) === stateFilter;
      return matchSearch && matchState;
    });
  }, [incidents, search, stateFilter]);

  function getPriorityColor(inc: Incident): string {
    const p = getVal(inc.Priority);
    if (p === "1-Critical") return "#E24B4A";
    if (p === "2-High")     return "#EF9F27";
    if (p === "3-Medium")   return "#0078D4";
    return "#639922";
  }

  // Not signed in
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "64px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>
          Sign in to view incidents
        </div>
        <button
          onClick={() => instance.loginRedirect(loginRequest)}
          style={{ padding: "10px 24px", backgroundColor: "#0078D4",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          Sign in with Microsoft
        </button>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <div style={{ fontSize: "14px" }}>Loading incidents from SharePoint...</div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "64px" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>❌</div>
        <div style={{ fontSize: "14px", color: "#E24B4A", marginBottom: "16px" }}>
          {error}
        </div>
        <button onClick={loadData}
          style={{ padding: "10px 20px", backgroundColor: "#0078D4",
            color: "white", border: "none", borderRadius: "8px",
            cursor: "pointer", fontSize: "13px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700",
            color: "#1F2937", margin: 0 }}>
            Incidents
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            {filtered.length} incident{filtered.length !== 1 ? "s" : ""}
            {stateFilter !== "All" ? ` · ${stateFilter}` : ""}
            {" · "}<span style={{ color: "#639922" }}>live SharePoint data ✅</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={loadData}
            style={{ padding: "8px 14px", backgroundColor: "white",
              color: "#0078D4", border: "1px solid #0078D4",
              borderRadius: "8px", fontSize: "12px",
              fontWeight: "500", cursor: "pointer" }}>
            🔄 Refresh
          </button>
          <button onClick={() => navigate("/incidents/new")}
            style={{ backgroundColor: "#0078D4", color: "white",
              border: "none", borderRadius: "8px",
              padding: "10px 18px", fontSize: "13px",
              fontWeight: "600", cursor: "pointer" }}>
            + New Incident
          </button>
        </div>
      </div>

      {/* Search */}
      <input type="text"
        placeholder="Search by title, INC number or category..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", fontSize: "13px",
          border: "1px solid #E5E7EB", borderRadius: "8px",
          marginBottom: "12px", outline: "none",
          boxSizing: "border-box", backgroundColor: "white" }} />

      {/* State filter chips */}
      <div style={{ display: "flex", gap: "8px",
        marginBottom: "16px", flexWrap: "wrap" }}>
        {STATE_FILTERS.map(f => (
          <button key={f} onClick={() => setStateFilter(f)}
            style={{ padding: "6px 14px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "500", cursor: "pointer",
              border: "1.5px solid",
              borderColor: stateFilter === f ? "#0078D4" : "#E5E7EB",
              backgroundColor: stateFilter === f ? "#0078D4" : "white",
              color: stateFilter === f ? "white" : "#6B7280",
              transition: "all 0.15s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Incidents list */}
      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
            <div style={{ fontSize: "14px", fontWeight: "500" }}>
              No incidents found
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          filtered.map((inc, idx) => (
            <div key={inc.Id}
              onClick={() => navigate(`/incidents/${inc.Id}`)}
              style={{ display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 20px", cursor: "pointer",
                borderBottom: idx < filtered.length - 1
                  ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s" }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = "#F9FAFB")}
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = "transparent")}>

              {/* Priority dot */}
              <div style={{ width: "10px", height: "10px",
                borderRadius: "50%", flexShrink: 0,
                backgroundColor: getPriorityColor(inc) }} />

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600",
                  color: "#1F2937", marginBottom: "3px",
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

              {/* Priority badge */}
              <Badge value={getVal(inc.Priority) || "Unknown"} type="priority" />

              {/* State badge */}
              <Badge value={getVal(inc.State) || "Unknown"} type="state" />

              <span style={{ color: "#D1D5DB", fontSize: "18px" }}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}