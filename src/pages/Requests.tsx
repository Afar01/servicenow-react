import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import { getRequests } from "../api/requests";
import { getVal } from "../types";

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
  const navigate        = useNavigate();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [requests,       setRequests]       = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [typeFilter,     setTypeFilter]     = useState("All");

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
      const data = await getRequests(response.accessToken);
      setRequests(data);
    } catch (e) {
      setError("Failed to load requests — " + String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return requests.filter(req => {
      const matchSearch =
        (req.Title ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (req.REQ_Number ?? "").toLowerCase().includes(search.toLowerCase());
      const matchApproval =
        approvalFilter === "All" ||
        getVal(req.ApprovalStatus) === approvalFilter;
      const matchType =
        typeFilter === "All" ||
        getVal(req.RequestType) === typeFilter;
      return matchSearch && matchApproval && matchType;
    });
  }, [requests, search, approvalFilter, typeFilter]);

  // Not signed in
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "64px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>
          Sign in to view requests
        </div>
        <button onClick={() => instance.loginRedirect(loginRequest)}
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
        <div style={{ fontSize: "14px" }}>
          Loading requests from SharePoint...
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700",
            color: "#1F2937", margin: 0 }}>
            Requests
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            {" · "}
            <span style={{ color: "#639922" }}>live SharePoint data ✅</span>
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
          <button onClick={() => navigate("/requests/new")}
            style={{ backgroundColor: "#0078D4", color: "white",
              border: "none", borderRadius: "8px", padding: "10px 18px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            + New Request
          </button>
        </div>
      </div>

      {/* Search */}
      <input type="text"
        placeholder="Search by title or REQ number..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", fontSize: "13px",
          border: "1px solid #E5E7EB", borderRadius: "8px",
          marginBottom: "12px", outline: "none",
          boxSizing: "border-box", backgroundColor: "white" }} />

      {/* Approval filter chips */}
      <div style={{ display: "flex", gap: "8px",
        marginBottom: "8px", flexWrap: "wrap" }}>
        {APPROVAL_FILTERS.map(f => (
          <button key={f} onClick={() => setApprovalFilter(f)}
            style={{ padding: "6px 14px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "500", cursor: "pointer",
              border: "1.5px solid",
              borderColor: approvalFilter === f ? "#0078D4" : "#E5E7EB",
              backgroundColor: approvalFilter === f ? "#0078D4" : "white",
              color: approvalFilter === f ? "white" : "#6B7280" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Type filter chips */}
      <div style={{ display: "flex", gap: "8px",
        marginBottom: "16px", flexWrap: "wrap" }}>
        {TYPE_FILTERS.map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            style={{ padding: "5px 12px", borderRadius: "20px",
              fontSize: "11px", fontWeight: "500", cursor: "pointer",
              border: "1.5px solid",
              borderColor: typeFilter === f ? "#639922" : "#E5E7EB",
              backgroundColor: typeFilter === f ? "#639922" : "white",
              color: typeFilter === f ? "white" : "#6B7280" }}>
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
            <div style={{ fontSize: "14px", fontWeight: "500" }}>
              No requests found
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          filtered.map((req, idx) => {
            const approvalVal = getVal(req.ApprovalStatus) || "Pending";
            const typeVal     = getVal(req.RequestType) || "—";
            return (
              <div key={req.Id}
                onClick={() => navigate("/requests/" + req.Id)}
                style={{ display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 20px", cursor: "pointer",
                  borderBottom: idx < filtered.length - 1
                    ? "1px solid #F9FAFB" : "none",
                  transition: "background 0.15s" }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = "transparent")}>

                {/* Approval dot */}
                <div style={{ width: "10px", height: "10px",
                  borderRadius: "50%", flexShrink: 0,
                  backgroundColor: getApprovalColor(approvalVal) }} />

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600",
                    color: "#1F2937", marginBottom: "3px",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap" }}>
                    {req.Title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    {req.REQ_Number ?? "—"} · {typeVal}
                    {req.RequestedBy
                      ? " · " + req.RequestedBy.Title : ""}
                  </div>
                </div>

                {/* Type badge */}
                <span style={{ fontSize: "11px", fontWeight: "500",
                  color: "#6B7280", backgroundColor: "#F3F4F6",
                  padding: "3px 10px", borderRadius: "20px",
                  whiteSpace: "nowrap", flexShrink: 0 }}>
                  {typeVal}
                </span>

                {/* Approval badge */}
                <span style={{ fontSize: "11px", fontWeight: "600",
                  color: "white", flexShrink: 0,
                  backgroundColor: getApprovalColor(approvalVal),
                  padding: "3px 10px", borderRadius: "20px",
                  whiteSpace: "nowrap" }}>
                  {approvalVal}
                </span>

                <span style={{ color: "#D1D5DB", fontSize: "18px" }}>›</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}