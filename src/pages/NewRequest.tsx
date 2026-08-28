import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_REQUESTS } from "../mockData";

const REQUEST_TYPES = ["Hardware", "Software", "Access Request", "Account Setup", "Other"];
const PRIORITIES    = ["1-Critical", "2-High", "3-Medium", "4-Low"];

function nextREQNumber(): string {
  const max = MOCK_REQUESTS.reduce((acc, req) => {
    const num = parseInt(req.REQ_Number.replace("REQ-", ""), 10);
    return num > acc ? num : acc;
  }, 0);
  return "REQ-" + String(max + 1).padStart(3, "0");
}

export default function NewRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title:       "",
    requestType: "Hardware",
    priority:    "3-Medium",
    description: "",
    requestedFor: "",
    dueDate:     "",
  });

  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [newREQNumber, setNewREQNumber] = useState("");

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const reqNumber = nextREQNumber();
      setNewREQNumber(reqNumber);
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto",
        textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📋</div>
        <h1 style={{ fontSize: "22px", fontWeight: "700",
          color: "#1F2937", marginBottom: "8px" }}>
          Request Submitted!
        </h1>
        <div style={{ fontSize: "32px", fontWeight: "700",
          color: "#0078D4", marginBottom: "8px" }}>
          {newREQNumber}
        </div>
        <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>
          {form.title}
        </p>
        <div style={{ display: "inline-block", backgroundColor: "#FAEEDA",
          color: "#633806", fontSize: "12px", fontWeight: "600",
          padding: "4px 12px", borderRadius: "20px", marginBottom: "8px" }}>
          Approval Status: Pending
        </div>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "32px" }}>
          A manager will review and approve or reject your request by email.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate("/requests")}
            style={{ padding: "10px 24px", backgroundColor: "#0078D4",
              color: "white", border: "none", borderRadius: "8px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            View All Requests
          </button>
          <button onClick={() => {
            setSubmitted(false);
            setForm({ title: "", requestType: "Hardware", priority: "3-Medium",
              description: "", requestedFor: "", dueDate: "" });
          }}
            style={{ padding: "10px 24px", backgroundColor: "white",
              color: "#0078D4", border: "1.5px solid #0078D4",
              borderRadius: "8px", fontSize: "13px",
              fontWeight: "600", cursor: "pointer" }}>
            + Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center",
        gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => navigate("/requests")}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "#6B7280", fontSize: "20px", padding: "4px", lineHeight: "1" }}>
          ←
        </button>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700",
            color: "#1F2937", margin: 0 }}>
            New Request
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Auto number: <strong>{nextREQNumber()}</strong> · Approval status will be <strong>Pending</strong>
          </p>
        </div>
      </div>

      {/* Approval info banner */}
      <div style={{ backgroundColor: "#FAEEDA", border: "1px solid #FAC775",
        borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
        fontSize: "13px", color: "#633806", display: "flex",
        alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>⚡</span>
        <span>Once submitted — a manager receives an approval email with Approve and Reject buttons.</span>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        padding: "24px", marginBottom: "16px" }}>

        <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937",
          marginBottom: "20px", paddingBottom: "10px",
          borderBottom: "1px solid #F3F4F6" }}>
          Request Information
        </h2>

        {/* Title */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
            color: "#374151", marginBottom: "6px" }}>
            Title <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input type="text" value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Brief title for your request..."
            style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
              border: errors.title ? "1.5px solid #E24B4A" : "1px solid #E5E7EB",
              borderRadius: "8px", outline: "none", boxSizing: "border-box" }} />
          {errors.title && (
            <div style={{ fontSize: "11px", color: "#E24B4A", marginTop: "4px" }}>
              {errors.title}
            </div>
          )}
        </div>

        {/* Request Type + Priority */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Request Type</label>
            <select value={form.requestType}
              onChange={e => set("requestType", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {REQUEST_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Priority</label>
            <select value={form.priority}
              onChange={e => set("priority", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Requested For + Due Date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Requested For</label>
            <input type="text" value={form.requestedFor}
              onChange={e => set("requestedFor", e.target.value)}
              placeholder="Name (if for someone else)"
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Due Date</label>
            <input type="date" value={form.dueDate}
              onChange={e => set("dueDate", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", boxSizing: "border-box",
                backgroundColor: "white", cursor: "pointer" }} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
            color: "#374151", marginBottom: "6px" }}>
            Description <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <textarea value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="Describe what you need and why — include any relevant details..."
            rows={5}
            style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
              border: errors.description ? "1.5px solid #E24B4A" : "1px solid #E5E7EB",
              borderRadius: "8px", resize: "vertical", fontFamily: "inherit",
              boxSizing: "border-box", outline: "none" }} />
          {errors.description && (
            <div style={{ fontSize: "11px", color: "#E24B4A", marginTop: "4px" }}>
              {errors.description}
            </div>
          )}
        </div>
      </div>

      {/* Submit row */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={() => navigate("/requests")}
          style={{ padding: "10px 24px", backgroundColor: "white",
            color: "#6B7280", border: "1px solid #E5E7EB",
            borderRadius: "8px", fontSize: "13px",
            fontWeight: "500", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: "10px 28px",
            backgroundColor: submitting ? "#93C5FD" : "#0078D4",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "13px", fontWeight: "600",
            cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

    </div>
  );
}