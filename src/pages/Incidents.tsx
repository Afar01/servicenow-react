import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import { MOCK_INCIDENTS } from "../mockData";

const STATE_FILTERS = ["All", "New", "In Progress", "On Hold", "Resolved", "Closed"];

function getPriorityColor(p: string) {
  if (p === "1-Critical") return "#E24B4A";
  if (p === "2-High")     return "#EF9F27";
  if (p === "3-Medium")   return "#0078D4";
  return "#639922";
}

export default function Incidents() {
  const navigate = useNavigate();
  const [search,      setSearch]      = useState("");
  const [stateFilter, setStateFilter] = useState("All");

  const filtered = useMemo(() => {
    return MOCK_INCIDENTS.filter(inc => {
      const matchSearch = inc.Title.toLowerCase().includes(search.toLowerCase())
        || inc.INC_Number.toLowerCase().includes(search.toLowerCase())
        || inc.Category.Value.toLowerCase().includes(search.toLowerCase());
      const matchState = stateFilter === "All" || inc.State.Value === stateFilter;
      return matchSearch && matchState;
    });
  }, [search, stateFilter]);

  return (
    <div>
      {/* Header row */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
        <div>
          <h1 style={{fontSize:"22px", fontWeight:"700", color:"#1F2937", margin:0}}>Incidents</h1>
          <p style={{fontSize:"13px", color:"#6B7280", margin:"4px 0 0"}}>
            {filtered.length} incident{filtered.length !== 1 ? "s" : ""}
            {stateFilter !== "All" ? ` · ${stateFilter}` : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/incidents/new")}
          style={{backgroundColor:"#0078D4", color:"white", border:"none",
            borderRadius:"8px", padding:"10px 18px", fontSize:"13px",
            fontWeight:"600", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px"}}>
          + New Incident
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by title, INC number or category..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:"100%", padding:"10px 14px", fontSize:"13px",
          border:"1px solid #E5E7EB", borderRadius:"8px", marginBottom:"12px",
          outline:"none", boxSizing:"border-box", backgroundColor:"white"}}/>

      {/* State filter chips */}
      <div style={{display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap"}}>
        {STATE_FILTERS.map(state => (
          <button
            key={state}
            onClick={() => setStateFilter(state)}
            style={{padding:"6px 14px", borderRadius:"20px", fontSize:"12px",
              fontWeight:"500", cursor:"pointer", border:"1.5px solid",
              borderColor: stateFilter === state ? "#0078D4" : "#E5E7EB",
              backgroundColor: stateFilter === state ? "#0078D4" : "white",
              color: stateFilter === state ? "white" : "#6B7280",
              transition:"all 0.15s"}}>
            {state}
          </button>
        ))}
      </div>

      {/* Incidents list */}
      <div style={{backgroundColor:"white", borderRadius:"12px",
        boxShadow:"0 1px 3px rgba(0,0,0,0.08)", overflow:"hidden"}}>

        {filtered.length === 0 ? (
          <div style={{padding:"48px", textAlign:"center", color:"#9CA3AF"}}>
            <div style={{fontSize:"32px", marginBottom:"8px"}}>🔍</div>
            <div style={{fontSize:"14px", fontWeight:"500"}}>No incidents found</div>
            <div style={{fontSize:"12px", marginTop:"4px"}}>Try adjusting your search or filter</div>
          </div>
        ) : (
          filtered.map((inc, idx) => (
            <div
              key={inc.Id}
              onClick={() => navigate(`/incidents/${inc.Id}`)}
              style={{display:"flex", alignItems:"center", gap:"12px",
                padding:"14px 20px", cursor:"pointer", transition:"background 0.15s",
                borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none"}}>

              {/* Priority dot */}
              <div style={{width:"10px", height:"10px", borderRadius:"50%",
                flexShrink:0, backgroundColor: getPriorityColor(inc.Priority.Value)}} />

              {/* Title + meta */}
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:"13px", fontWeight:"600", color:"#1F2937",
                  marginBottom:"3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                  {inc.Title}
                </div>
                <div style={{fontSize:"11px", color:"#9CA3AF"}}>
                  {inc.INC_Number} · {inc.Category.Value}
                  {inc.AssignedTo ? ` · ${inc.AssignedTo.Title}` : " · Unassigned"}
                </div>
              </div>

              {/* Priority badge */}
              <Badge value={inc.Priority.Value} type="priority" />

              {/* State badge */}
              <Badge value={inc.State.Value} type="state" />

              {/* Arrow */}
              <span style={{color:"#D1D5DB", fontSize:"18px"}}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
