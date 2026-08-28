import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_INCIDENTS } from "../mockData";

const CATEGORIES = ["Network", "Hardware", "Software", "Email", "Access", "Other"];
const PRIORITIES = ["1-Critical", "2-High", "3-Medium", "4-Low"];
const URGENCIES  = ["1-High", "2-Medium", "3-Low"];
const IMPACTS    = ["1-High", "2-Medium", "3-Low"];

function nextINCNumber(): string {
  const max = MOCK_INCIDENTS.reduce((acc, inc) => {
    const num = parseInt(inc.INC_Number.replace("INC-", ""), 10);
    return num > acc ? num : acc;
  }, 0);
  return "INC-" + String(max + 1).padStart(3, "0");
}

export default function NewIncident() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title:       "",
    category:    "Network",
    priority:    "3-Medium",
    urgency:     "2-Medium",
    impact:      "2-Medium",
    description: "",
    assignedTo:  "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newINCNumber, setNewINCNumber] = useState("");

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
      const incNumber = nextINCNumber();
      setNewINCNumber(incNumber);
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1F2937", marginBottom: "8px" }}>
          Incident Created!
        </h1>
        <div style={{ fontSize: "32px", fontWeight: "700", color: "#0078D4", marginBottom: "8px" }}>
          {newINCNumber}
        </div>
        <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>
          {form.title}
        </p>
        <div style={{ display: "inline-block", backgroundColor: "#EAF3DE", color: "#27500A",
          fontSize: "12px", fontWeight: "600", padding: "4px 12px",
          borderRadius: "20px", marginBottom: "32px" }}>
          State: New · Priority: {form.priority}
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate("/incidents")}
            style={{ padding: "10px 24px", backgroundColor: "#0078D4", color: "white",
              border: "none", borderRadius: "8px", fontSize: "13px",
              fontWeight: "600", cursor: "pointer" }}>
            View All Incidents
          </button>
          <button onClick={() => {
            setSubmitted(false);
            setForm({ title: "", category: "Network", priority: "3-Medium",
              urgency: "2-Medium", impact: "2-Medium", description: "", assignedTo: "" });
          }}
            style={{ padding: "10px 24px", backgroundColor: "white", color: "#0078D4",
              border: "1.5px solid #0078D4", borderRadius: "8px", fontSize: "13px",
              fontWeight: "600", cursor: "pointer" }}>
            + Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => navigate("/incidents")}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "#6B7280", fontSize: "20px", padding: "4px", lineHeight: "1" }}>
          ←
        </button>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
            New Incident
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Auto number: <strong>{nextINCNumber()}</strong> · State will be set to <strong>New</strong>
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "24px", marginBottom: "16px" }}>

        <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937",
          marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #F3F4F6" }}>
          Incident Information
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
            color: "#374151", marginBottom: "6px" }}>
            Title <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="Brief description of the issue..."
            style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
              border: errors.title ? "1.5px solid #E24B4A" : "1px solid #E5E7EB",
              borderRadius: "8px", outline: "none", boxSizing: "border-box" }} />
          {errors.title && (
            <div style={{ fontSize: "11px", color: "#E24B4A", marginTop: "4px" }}>
              {errors.title}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Priority</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Urgency</label>
            <select value={form.urgency} onChange={e => set("urgency", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
              color: "#374151", marginBottom: "6px" }}>Impact</label>
            <select value={form.impact} onChange={e => set("impact", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "8px",
                outline: "none", backgroundColor: "white", cursor: "pointer" }}>
              {IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
            color: "#374151", marginBottom: "6px" }}>Assigned To</label>
          <input type="text" value={form.assignedTo}
            onChange={e => set("assignedTo", e.target.value)}
            placeholder="Agent name (optional)"
            style={{ width: "100%", padding: "10px 12px", fontSize: "13px",
              border: "1px solid #E5E7EB", borderRadius: "8px",
              outline: "none", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
            color: "#374151", marginBottom: "6px" }}>
            Description <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <textarea value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="What happened, when it started, what was tried..."
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

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={() => navigate("/incidents")}
          style={{ padding: "10px 24px", backgroundColor: "white", color: "#6B7280",
            border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px",
            fontWeight: "500", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: "10px 28px",
            backgroundColor: submitting ? "#93C5FD" : "#0078D4",
            color: "white", border: "none", borderRadius: "8px", fontSize: "13px",
            fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Creating..." : "Create Incident"}
        </button>
      </div>

    </div>
  );
}