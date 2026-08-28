import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_INCIDENTS } from "../mockData";
import Badge from "../components/Badge";
import type { WorkNote } from "../types";

const STATES = ["New", "In Progress", "On Hold", "Resolved", "Closed"];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", color: "#1F2937", padding: "10px 12px",
        backgroundColor: "#F9FAFB", borderRadius: "8px",
        border: "1px solid #E5E7EB", minHeight: "20px" }}>
        {value || "—"}
      </div>
    </div>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const original = MOCK_INCIDENTS.find(i => i.Id === Number(id));
  const [incident, setIncident] = useState(original ? { ...original } : null);
  const [selectedState, setSelectedState] = useState(
    original?.State.Value ?? "New"
  );
  const [noteText, setNoteText] = useState("");
  const [workNotes, setWorkNotes] = useState<WorkNote[]>([]);
  const [saved, setSaved] = useState(false);
  const [resolveMode, setResolveMode] = useState(false);
  const [resolution, setResolution] = useState("");

  function handleUpdateState() {
    setIncident(prev =>
      prev ? { ...prev, State: { Value: selectedState } } : prev
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    const note: WorkNote = {
      Id: workNotes.length + 1,
      Title: "Note on " + (incident ? incident.INC_Number : ""),
      RecordNumber: incident ? incident.INC_Number : "",
      Note: noteText.trim(),
      AddedBy: { Title: "Kedir Hassen" },
      Created: new Date().toISOString(),
    };
    setWorkNotes(prev => [note, ...prev]);
    setNoteText("");
  }

  function handleResolve() {
    if (!resolution.trim()) return;
    setIncident(prev =>
      prev ? { ...prev, State: { Value: "Resolved" }, Resolution: resolution } : prev
    );
    setSelectedState("Resolved");
    setResolveMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!incident) {
    return (
      <div style={{ textAlign: "center", padding: "64px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
        <div style={{ fontSize: "16px", fontWeight: "500" }}>Incident not found</div>
        <button onClick={() => navigate("/incidents")}
          style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#0078D4",
            color: "white", border: "none", borderRadius: "8px",
            cursor: "pointer", fontSize: "13px" }}>
          Back to Incidents
        </button>
      </div>
    );
  }

  const isResolved =
    incident.State.Value === "Resolved" || incident.State.Value === "Closed";

  return (
    <div style={{ maxWidth: "860px" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button onClick={() => navigate("/incidents")}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "#6B7280", fontSize: "20px", padding: "4px", lineHeight: "1" }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
              {incident.INC_Number}
            </h1>
            <Badge value={incident.State.Value} type="state" />
            <Badge value={incident.Priority.Value} type="priority" />
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Created: {new Date(incident.Created).toLocaleDateString()}
          </p>
        </div>
      </div>

      {saved && (
        <div style={{ backgroundColor: "#EAF3DE", border: "1px solid #97C459",
          borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
          fontSize: "13px", color: "#27500A" }}>
          ✅ Incident updated successfully!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        <div>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937",
              marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #F3F4F6" }}>
              Incident Details
            </h2>
            <Field label="Title" value={incident.Title} />
            <Field label="Description" value={incident.Description} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Category"   value={incident.Category.Value} />
              <Field label="Priority"   value={incident.Priority.Value} />
              <Field label="Caller"     value={incident.CallerID?.Title ?? "—"} />
              <Field label="Assigned To" value={incident.AssignedTo?.Title ?? "Unassigned"} />
            </div>
            {isResolved && incident.Resolution && (
              <Field label="Resolution" value={incident.Resolution} />
            )}
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937",
              marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #F3F4F6" }}>
              Work Notes ({workNotes.length})
            </h2>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Add a work note..." rows={3}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px", resize: "vertical",
                fontFamily: "inherit", boxSizing: "border-box",
                outline: "none", marginBottom: "8px" }} />
            <button onClick={handleAddNote}
              style={{ padding: "8px 16px", backgroundColor: "#0078D4", color: "white",
                border: "none", borderRadius: "8px", fontSize: "13px",
                fontWeight: "500", cursor: "pointer", marginBottom: "16px" }}>
              + Add Note
            </button>
            {workNotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px",
                color: "#9CA3AF", fontSize: "13px" }}>
                No work notes yet
              </div>
            ) : (
              workNotes.map(note => (
                <div key={note.Id} style={{ padding: "12px 14px", backgroundColor: "#F9FAFB",
                  borderRadius: "8px", marginBottom: "8px", border: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#0078D4" }}>
                      {note.AddedBy?.Title}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {new Date(note.Created).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>
                    {note.Note}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937", marginBottom: "12px" }}>
              Update State
            </h2>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px", marginBottom: "10px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleUpdateState}
              style={{ width: "100%", padding: "10px", backgroundColor: "#0078D4",
                color: "white", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Update State
            </button>
          </div>

          {!isResolved && (
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937", marginBottom: "12px" }}>
                Resolve Incident
              </h2>
              {resolveMode ? (
                <div>
                  <textarea value={resolution} onChange={e => setResolution(e.target.value)}
                    placeholder="Enter resolution details..." rows={3}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                      border: "1px solid #E5E7EB", borderRadius: "8px", resize: "vertical",
                      fontFamily: "inherit", boxSizing: "border-box",
                      outline: "none", marginBottom: "8px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleResolve}
                      style={{ flex: 1, padding: "10px", backgroundColor: "#639922",
                        color: "white", border: "none", borderRadius: "8px",
                        fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                      ✓ Confirm
                    </button>
                    <button onClick={() => setResolveMode(false)}
                      style={{ padding: "10px 14px", backgroundColor: "#F3F4F6",
                        color: "#6B7280", border: "none", borderRadius: "8px",
                        fontSize: "13px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setResolveMode(true)}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#639922",
                    color: "white", border: "none", borderRadius: "8px",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  ✓ Mark as Resolved
                </button>
              )}
            </div>
          )}

          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937", marginBottom: "12px" }}>
              Info
            </h2>
            {[
              ["Number",   incident.INC_Number],
              ["Category", incident.Category.Value],
              ["Priority", incident.Priority.Value],
              ["Created",  new Date(incident.Created).toLocaleDateString()],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between",
                padding: "7px 0", borderBottom: "1px solid #F9FAFB", fontSize: "12px" }}>
                <span style={{ color: "#9CA3AF" }}>{l}</span>
                <span style={{ color: "#1F2937", fontWeight: "500" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}