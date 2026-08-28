import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import { useNavigate } from "react-router-dom";
import type { Incident } from "../types";

// Mock data — replace with real SharePoint API calls later
const MOCK_INCIDENTS: Incident[] = [
  { Id: 1, INC_Number: "INC-001", Title: "Laptop not connecting to WiFi", Category: { Value: "Network" }, Priority: { Value: "2-High" }, State: { Value: "New" }, Description: "", CallerID: { Title: "Kedir Hassen", EMail: "" }, AssignedTo: { Title: "IT Support", EMail: "" }, AssignmentGroup: "", Resolution: "", ResolvedDate: null, Created: "2026-08-27T08:00:00Z", Modified: "2026-08-27T08:00:00Z" },
  { Id: 2, INC_Number: "INC-002", Title: "Email not syncing", Category: { Value: "Email" }, Priority: { Value: "3-Medium" }, State: { Value: "In Progress" }, Description: "", CallerID: { Title: "Habib Eshetu", EMail: "" }, AssignedTo: { Title: "IT Support", EMail: "" }, AssignmentGroup: "", Resolution: "", ResolvedDate: null, Created: "2026-08-26T10:00:00Z", Modified: "2026-08-26T10:00:00Z" },
  { Id: 3, INC_Number: "INC-003", Title: "Printer offline", Category: { Value: "Hardware" }, Priority: { Value: "3-Medium" }, State: { Value: "On Hold" }, Description: "", CallerID: { Title: "Sara Ahmed", EMail: "" }, AssignedTo: null, AssignmentGroup: "", Resolution: "", ResolvedDate: null, Created: "2026-08-25T14:00:00Z", Modified: "2026-08-25T14:00:00Z" },
  { Id: 4, INC_Number: "INC-004", Title: "VPN access issue", Category: { Value: "Network" }, Priority: { Value: "1-Critical" }, State: { Value: "New" }, Description: "", CallerID: { Title: "Ali Hassan", EMail: "" }, AssignedTo: { Title: "Network Team", EMail: "" }, AssignmentGroup: "", Resolution: "", ResolvedDate: null, Created: "2026-08-27T09:30:00Z", Modified: "2026-08-27T09:30:00Z" },
  { Id: 5, INC_Number: "INC-005", Title: "Software license expired", Category: { Value: "Software" }, Priority: { Value: "2-High" }, State: { Value: "Resolved" }, Description: "", CallerID: { Title: "Marta Bekele", EMail: "" }, AssignedTo: { Title: "IT Support", EMail: "" }, AssignmentGroup: "", Resolution: "License renewed", ResolvedDate: "2026-08-27T11:00:00Z", Created: "2026-08-24T08:00:00Z", Modified: "2026-08-27T11:00:00Z" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);

  const totalIncidents   = incidents.length;
  const openIncidents    = incidents.filter(i => i.State.Value !== "Resolved" && i.State.Value !== "Closed").length;
  const totalRequests    = 11;
  const pendingApprovals = 3;

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
    .slice(0, 5);

  return (
    <div>
      {/* Page title */}
      <div style={{marginBottom:"24px"}}>
        <h1 style={{fontSize:"22px", fontWeight:"700", color:"#1F2937", margin:0}}>
          Dashboard
        </h1>
        <p style={{fontSize:"13px", color:"#6B7280", margin:"4px 0 0"}}>
          Welcome back, Kedir — here is your system overview
        </p>
      </div>

      {/* Stat cards */}
      <div style={{display:"flex", gap:"16px", marginBottom:"32px", flexWrap:"wrap"}}>
        <StatCard label="Total Incidents"   value={totalIncidents}   color="#0078D4" />
        <StatCard label="Open Incidents"    value={openIncidents}    color="#E24B4A" />
        <StatCard label="Total Requests"    value={totalRequests}    color="#639922" />
        <StatCard label="Pending Approvals" value={pendingApprovals} color="#EF9F27" />
      </div>

      {/* Recent incidents */}
      <div style={{backgroundColor:"white", borderRadius:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.08)", overflow:"hidden"}}>
        <div style={{padding:"16px 20px", borderBottom:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{fontSize:"15px", fontWeight:"600", color:"#1F2937", margin:0}}>
            Recent Incidents
          </h2>
          <button
            onClick={() => navigate("/incidents")}
            style={{fontSize:"12px", color:"#0078D4", background:"none", border:"none", cursor:"pointer", fontWeight:"500"}}>
            View all →
          </button>
        </div>

        {recentIncidents.map(incident => (
          <div
            key={incident.Id}
            onClick={() => navigate(`/incidents/${incident.Id}`)}
            style={{
              display:"flex", alignItems:"center", gap:"12px",
              padding:"14px 20px", borderBottom:"1px solid #F9FAFB",
              cursor:"pointer", transition:"background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {/* Priority dot */}
            <div style={{
              width:"10px", height:"10px", borderRadius:"50%", flexShrink:0,
              backgroundColor:
                incident.Priority.Value === "1-Critical" ? "#E24B4A" :
                incident.Priority.Value === "2-High"     ? "#EF9F27" :
                incident.Priority.Value === "3-Medium"   ? "#0078D4" : "#639922",
            }} />

            {/* Title + meta */}
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:"13px", fontWeight:"600", color:"#1F2937", marginBottom:"2px",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                {incident.Title}
              </div>
              <div style={{fontSize:"11px", color:"#9CA3AF"}}>
                {incident.INC_Number} · {incident.Category.Value}
                {incident.AssignedTo ? ` · ${incident.AssignedTo.Title}` : " · Unassigned"}
              </div>
            </div>

            {/* State badge */}
            <Badge value={incident.State.Value} type="state" />

            {/* Arrow */}
            <span style={{color:"#D1D5DB", fontSize:"18px"}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
