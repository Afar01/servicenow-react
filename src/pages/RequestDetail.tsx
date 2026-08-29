import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import { getRequest, updateRequest } from "../api/requests";
import { getVal } from "../types";
import type { WorkNote } from "../types";

const STATES = ["Open", "In Progress", "Pending Approval", "Completed", "Cancelled"];

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

function getApprovalColor(status: string): string {
  switch (status) {
    case "Pending":  return "#EF9F27";
    case "Approved": return "#639922";
    case "Rejected": return "#E24B4A";
    default:         return "#9CA3AF";
  }
}

export default function RequestDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [request,       setRequest]       = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [selectedState, setSelectedState] = useState("Open");
  const [noteText,      setNoteText]      = useState("");
  const [workNotes,     setWorkNotes]     = useState<WorkNote[]>([]);
  const [saved,         setSaved]         = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve"|"reject"|null>(null);
  const [actionNote,    setActionNote]    = useState("");

  useEffect(() => {
    const account = instance.getActiveAccount() || accounts[0];
    if (isAuthenticated && account && id) {
      loadRequest();
    }
  }, [isAuthenticated, id]);

  async function getToken() {
    const account = instance.getActiveAccount() || accounts[0];
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  }

  async function loadRequest() {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const data  = await getRequest(Number(id), token);
      setRequest(data);
      setSelectedState(getVal(data.State) || "Open");
    } catch (e) {
      setError("Failed to load request — " + String(e));
    } finally {
      setLoading(false);
    }
  }

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleUpdateState() {
    setSaving(true);
    try {
      const token = await getToken();
      await updateRequest(request.Id, { State: selectedState }, token);
      setRequest((prev: any) => ({ ...prev, State: selectedState }));
      showSaved();
    } catch (e) {
      setError("Failed to update — " + String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    const note: WorkNote = {
      Id: workNotes.length + 1,
      Title: "Note on " + (request?.REQ_Number ?? ""),
      RecordNumber: request?.REQ_Number ?? "",
      Note: noteText.trim(),
      AddedBy: { Title: accounts[0]?.name ?? "Kedir Hassen" },
      Created: new Date().toISOString(),
    };
    setWorkNotes(prev => [note, ...prev]);
    setNoteText("");
  }

  async function handleApprove() {
    setSaving(true);
    try {
      const token = await getToken();
      await updateRequest(
        request.Id,
        { ApprovalStatus: "Approved", State: "In Progress" },
        token
      );
      setRequest((prev: any) => ({
        ...prev,
        ApprovalStatus: "Approved",
        State: "In Progress",
      }));
      setSelectedState("In Progress");
      setApprovalAction(null);
      showSaved();
    } catch (e) {
      setError("Failed to approve — " + String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    setSaving(true);
    try {
      const token = await getToken();
      await updateRequest(
        request.Id,
        { ApprovalStatus: "Rejected", State: "Cancelled" },
        token
      );
      setRequest((prev: any) => ({
        ...prev,
        ApprovalStatus: "Rejected",
        State: "Cancelled",
      }));
      setSelectedState("Cancelled");
      setApprovalAction(null);
      showSaved();
    } catch (e) {
      setError("Failed to reject — " + String(e));
    } finally {
      setSaving(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <div style={{ fontSize: "14px" }}>Loading request from SharePoint...</div>
      </div>
    );
  }

  // Error
  if (error || !request) {
    return (
      <div style={{ textAlign: "center", padding: "64px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>❌</div>
        <div style={{ fontSize: "14px", color: "#E24B4A", marginBottom: "16px" }}>
          {error || "Request not found"}
        </div>
        <button onClick={() => navigate("/requests")}
          style={{ padding: "10px 20px", backgroundColor: "#0078D4",
            color: "white", border: "none", borderRadius: "8px",
            cursor: "pointer", fontSize: "13px" }}>
          Back to Requests
        </button>
      </div>
    );
  }

  const approvalVal = getVal(request.ApprovalStatus) || "Pending";
  const isPending   = approvalVal === "Pending";
  const isApproved  = approvalVal === "Approved";
  const isRejected  = approvalVal === "Rejected";

  return (
    <div style={{ maxWidth: "860px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center",
        gap: "12px", marginBottom: "20px" }}>
        <button onClick={() => navigate("/requests")}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "#6B7280", fontSize: "20px", padding: "4px", lineHeight: "1" }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center",
            gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700",
              color: "#1F2937", margin: 0 }}>
              {request.REQ_Number}
            </h1>
            <span style={{ fontSize: "11px", fontWeight: "600",
              color: "white", padding: "3px 10px", borderRadius: "20px",
              backgroundColor: getApprovalColor(approvalVal) }}>
              {approvalVal}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "600",
              color: "#6B7280", backgroundColor: "#F3F4F6",
              padding: "3px 10px", borderRadius: "20px" }}>
              {getVal(request.Priority) || "—"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            {getVal(request.RequestType)} · Created:{" "}
            {new Date(request.Created).toLocaleDateString()}
            {" · "}
            <span style={{ color: "#639922" }}>live SharePoint data ✅</span>
          </p>
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div style={{ backgroundColor: "#EAF3DE", border: "1px solid #97C459",
          borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
          fontSize: "13px", color: "#27500A" }}>
          ✅ Request updated in SharePoint successfully!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px",
        gap: "20px", alignItems: "start" }}>

        {/* LEFT */}
        <div>
          <div style={{ backgroundColor: "white", borderRadius: "12px",
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937",
              marginBottom: "16px", paddingBottom: "10px",
              borderBottom: "1px solid #F3F4F6" }}>
              Request Details
            </h2>
            <Field label="Title"       value={request.Title ?? "—"} />
            <Field label="Description" value={request.Description ?? "—"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Request Type"  value={getVal(request.RequestType) || "—"} />
              <Field label="Priority"      value={getVal(request.Priority) || "—"} />
              <Field label="Requested By"  value={request.RequestedBy?.Title ?? "—"} />
              <Field label="Due Date"      value={request.DueDate ?? "—"} />
            </div>
            {(isApproved || isRejected) && request.CompletionNotes && (
              <Field label="Completion Notes" value={request.CompletionNotes} />
            )}
          </div>

          {/* Work notes */}
          <div style={{ backgroundColor: "white", borderRadius: "12px",
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937",
              marginBottom: "16px", paddingBottom: "10px",
              borderBottom: "1px solid #F3F4F6" }}>
              Work Notes ({workNotes.length})
            </h2>
            <textarea value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a work note..."
              rows={3}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                resize: "vertical", fontFamily: "inherit",
                boxSizing: "border-box", outline: "none", marginBottom: "8px" }} />
            <button onClick={handleAddNote}
              style={{ padding: "8px 16px", backgroundColor: "#0078D4",
                color: "white", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: "500",
                cursor: "pointer", marginBottom: "16px" }}>
              + Add Note
            </button>
            {workNotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px",
                color: "#9CA3AF", fontSize: "13px" }}>
                No work notes yet
              </div>
            ) : (
              workNotes.map(note => (
                <div key={note.Id}
                  style={{ padding: "12px 14px", backgroundColor: "#F9FAFB",
                    borderRadius: "8px", marginBottom: "8px",
                    border: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600",
                      color: "#0078D4" }}>
                      {note.AddedBy?.Title}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {new Date(note.Created).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151",
                    lineHeight: "1.5" }}>
                    {note.Note}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div>

          {/* Approval decision */}
          {isPending && (
            <div style={{ backgroundColor: "white", borderRadius: "12px",
              padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              marginBottom: "16px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "600",
                color: "#1F2937", marginBottom: "4px" }}>
                Approval Decision
              </h2>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>
                Awaiting manager approval
              </p>

              {approvalAction === null && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setApprovalAction("approve")}
                    style={{ flex: 1, padding: "10px", backgroundColor: "#639922",
                      color: "white", border: "none", borderRadius: "8px",
                      fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => setApprovalAction("reject")}
                    style={{ flex: 1, padding: "10px", backgroundColor: "#E24B4A",
                      color: "white", border: "none", borderRadius: "8px",
                      fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    ✕ Reject
                  </button>
                </div>
              )}

              {approvalAction === "approve" && (
                <div>
                  <textarea value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    placeholder="Approval note (optional)..."
                    rows={2}
                    style={{ width: "100%", padding: "8px 10px", fontSize: "12px",
                      border: "1px solid #E5E7EB", borderRadius: "8px",
                      resize: "none", fontFamily: "inherit",
                      boxSizing: "border-box", outline: "none", marginBottom: "8px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleApprove} disabled={saving}
                      style={{ flex: 1, padding: "9px",
                        backgroundColor: saving ? "#86EFAC" : "#639922",
                        color: "white", border: "none", borderRadius: "8px",
                        fontSize: "12px", fontWeight: "600",
                        cursor: saving ? "not-allowed" : "pointer" }}>
                      {saving ? "Saving..." : "✓ Confirm Approve"}
                    </button>
                    <button onClick={() => setApprovalAction(null)}
                      style={{ padding: "9px 12px", backgroundColor: "#F3F4F6",
                        color: "#6B7280", border: "none", borderRadius: "8px",
                        fontSize: "12px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {approvalAction === "reject" && (
                <div>
                  <textarea value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    placeholder="Reason for rejection..."
                    rows={2}
                    style={{ width: "100%", padding: "8px 10px", fontSize: "12px",
                      border: "1px solid #E5E7EB", borderRadius: "8px",
                      resize: "none", fontFamily: "inherit",
                      boxSizing: "border-box", outline: "none", marginBottom: "8px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleReject} disabled={saving}
                      style={{ flex: 1, padding: "9px",
                        backgroundColor: saving ? "#FCA5A5" : "#E24B4A",
                        color: "white", border: "none", borderRadius: "8px",
                        fontSize: "12px", fontWeight: "600",
                        cursor: saving ? "not-allowed" : "pointer" }}>
                      {saving ? "Saving..." : "✕ Confirm Reject"}
                    </button>
                    <button onClick={() => setApprovalAction(null)}
                      style={{ padding: "9px 12px", backgroundColor: "#F3F4F6",
                        color: "#6B7280", border: "none", borderRadius: "8px",
                        fontSize: "12px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approved banner */}
          {isApproved && (
            <div style={{ backgroundColor: "#EAF3DE", border: "1px solid #97C459",
              borderRadius: "12px", padding: "16px 20px",
              marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>✅</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#27500A" }}>
                Request Approved
              </div>
            </div>
          )}

          {/* Rejected banner */}
          {isRejected && (
            <div style={{ backgroundColor: "#FCEBEB", border: "1px solid #F09595",
              borderRadius: "12px", padding: "16px 20px",
              marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>❌</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#791F1F" }}>
                Request Rejected
              </div>
            </div>
          )}

          {/* Update State */}
          <div style={{ backgroundColor: "white", borderRadius: "12px",
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            marginBottom: "16px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600",
              color: "#1F2937", marginBottom: "12px" }}>
              Update State
            </h2>
            <select value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                marginBottom: "10px", outline: "none",
                backgroundColor: "white", cursor: "pointer" }}>
              {STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={handleUpdateState} disabled={saving}
              style={{ width: "100%", padding: "10px",
                backgroundColor: saving ? "#93C5FD" : "#0078D4",
                color: "white", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Update State"}
            </button>
          </div>

          {/* Info */}
          <div style={{ backgroundColor: "white", borderRadius: "12px",
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600",
              color: "#1F2937", marginBottom: "12px" }}>
              Info
            </h2>
            {[
              ["Number",   request.REQ_Number ?? "—"],
              ["Type",     getVal(request.RequestType) || "—"],
              ["Priority", getVal(request.Priority) || "—"],
              ["Approval", approvalVal],
              ["Created",  new Date(request.Created).toLocaleDateString()],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between",
                padding: "7px 0", borderBottom: "1px solid #F9FAFB",
                fontSize: "12px" }}>
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