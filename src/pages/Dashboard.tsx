import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import { getIncidents } from "../api/incidents";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import type { Incident } from "../types";
import { MOCK_REQUESTS } from "../mockData";
import { getVal } from "../types";

export default function Dashboard() {
  const navigate        = useNavigate();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const totalRequests    = MOCK_REQUESTS.length;
  const pendingApprovals = MOCK_REQUESTS.filter(
    r => r.ApprovalStatus.Value === "Pending"
  ).length;

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const account = instance.getActiveAccount() || accounts[0];
      if (!account) {
        setError("No account found — please sign in again");
        setLoading(false);
        return;
      }
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      const data = await getIncidents(response.accessToken);
      setIncidents(data);
    } catch (e) {
      setError("Failed to load — " + String(e));
    } finally {
      setLoading(false);
    }
  }

  // Runs ONCE when authentication state changes
  useEffect(() => {
    const account = instance.getActiveAccount() || accounts[0];
    if (isAuthenticated && account) {
      loadData();
    }
  }, [isAuthenticated]);

  async function handleLogin() {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (e) {
      setError("Login failed — please try again");
    }
  }

  const openIncidents = incidents.filter(
  i => getVal(i.State) !== "Resolved" && getVal(i.State) !== "Closed"
).length;

  const recentIncidents = [...incidents]
    .sort((a, b) =>
      new Date(b.Created).getTime() - new Date(a.Created).getTime()
    )
    .slice(0, 5);

  // Not signed in
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto",
        textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
        <h1 style={{ fontSize: "22px", fontWeight: "700",
          color: "#1F2937", marginBottom: "8px" }}>
          Sign in to ServiceNow System
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "32px" }}>
          Sign in with your Microsoft 365 account to load your real SharePoint data
        </p>
        <button onClick={handleLogin}
          style={{ padding: "12px 32px", backgroundColor: "#0078D4",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
          Sign in with Microsoft
        </button>
        {error && (
          <div style={{ marginTop: "12px", fontSize: "13px", color: "#E24B4A" }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <div style={{ fontSize: "14px" }}>
          Loading your incidents from SharePoint...
        </div>
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

  // Dashboard — signed in and data loaded
  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex",
        justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700",
            color: "#1F2937", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Welcome back, {accounts[0]?.name} — live SharePoint data ✅
          </p>
        </div>
        <button onClick={loadData}
          style={{ padding: "8px 16px", backgroundColor: "white",
            color: "#0078D4", border: "1px solid #0078D4",
            borderRadius: "8px", fontSize: "12px",
            fontWeight: "500", cursor: "pointer" }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px",
        marginBottom: "32px", flexWrap: "wrap" }}>
        <StatCard label="Total Incidents"   value={incidents.length} color="#0078D4" />
        <StatCard label="Open Incidents"    value={openIncidents}    color="#E24B4A" />
        <StatCard label="Total Requests"    value={totalRequests}    color="#639922" />
        <StatCard label="Pending Approvals" value={pendingApprovals} color="#EF9F27" />
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6",
          display: "flex", justifyContent: "space-between",
          alignItems: "center" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600",
            color: "#1F2937", margin: 0 }}>
            Recent Incidents
          </h2>
          <button onClick={() => navigate("/incidents")}
            style={{ fontSize: "12px", color: "#0078D4",
              background: "none", border: "none",
              cursor: "pointer", fontWeight: "500" }}>
            View all →
          </button>
        </div>

        {recentIncidents.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center",
            color: "#9CA3AF" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
            <div style={{ fontSize: "13px" }}>
              No incidents found in SharePoint
            </div>
          </div>
        ) : (
          recentIncidents.map((incident, idx) => (
            <div key={incident.Id}
              onClick={() => navigate("/incidents/" + incident.Id)}
              style={{ display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 20px", cursor: "pointer",
                borderBottom: idx < recentIncidents.length - 1
                  ? "1px solid #F9FAFB" : "none" }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = "#F9FAFB")}
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = "transparent")}>

              <div style={{ width: "10px", height: "10px",
                borderRadius: "50%", flexShrink: 0,
                backgroundColor:
                  getVal(incident.Priority) === "1-Critical" ? "#E24B4A" :
                  getVal(incident.Priority) === "2-High"     ? "#EF9F27" :
                  getVal(incident.Priority) === "3-Medium"   ? "#0078D4" : "#639922"
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600",
                  color: "#1F2937", marginBottom: "2px",
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap" }}>
                  {incident.Title}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                {incident.INC_Number}{getVal(incident.Category) ? " · " + getVal(incident.Category) : ""}
                {incident.AssignedTo ? " · " + incident.AssignedTo.Title : " · Unassigned"}
                </div>
              </div>

              <Badge value={getVal(incident.State) || "Unknown"} type="state" />
              <span style={{ color: "#D1D5DB", fontSize: "18px" }}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}