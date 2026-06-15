import React from "react";

const STATUS_STYLES = {
  Online:   { bg: "#22c55e", color: "#fff" },
  Today:    { bg: "#3b82f6", color: "#fff" },
  Recent:   { bg: "#a855f7", color: "#fff" },
  Idle:     { bg: "#eab308", color: "#fff" },
  Inactive: { bg: "#ef4444", color: "#fff" },
  Pending:  { bg: "#9ca3af", color: "#fff" },
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "3px 14px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
        minWidth: 72,
        textAlign: "center",
      }}
    >
      {status}
    </span>
  );
}

export function StatCard({ count, label, color }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 12,
        padding: "14px 22px",
        minWidth: 90,
        textAlign: "center",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.92 }}>{label}</div>
    </div>
  );
}

export function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function ModalCard({ title, children, onClose, width = 520 }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        background: "#fff", borderRadius: 12, width, maxWidth: "95vw",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(90deg,#B91C1C,#991B1B)",
          borderRadius: "12px 12px 0 0",
          padding: "16px 24px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18, color: "#fff" }}>👤</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>{title}</span>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </ModalOverlay>
  );
}

export function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%", boxSizing: "border-box",
        border: "1.5px solid #e5e7eb", borderRadius: 8,
        padding: "9px 12px", fontSize: 14, color: "#111827",
        outline: "none", background: disabled ? "#f9fafb" : "#fff",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => { e.target.style.borderColor = "#B91C1C"; }}
      onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }}
    />
  );
}

export function SelectInput({ value, onChange, children, disabled }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%", boxSizing: "border-box",
        border: "1.5px solid #e5e7eb", borderRadius: 8,
        padding: "9px 12px", fontSize: 14, color: "#111827",
        outline: "none", background: "#fff", cursor: "pointer",
        appearance: "none",
      }}
    >
      {children}
    </select>
  );
}

export function ActionButton({ onClick, variant = "primary", children, disabled, type = "button" }) {
  const styles = {
    primary: { background: "linear-gradient(90deg,#B91C1C,#991B1B)", color: "#fff", border: "none" },
    secondary: { background: "#fff", color: "#374151", border: "1.5px solid #d1d5db" },
    danger: { background: "#ef4444", color: "#fff", border: "none" },
  };
  const s = styles[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s, padding: "9px 20px", borderRadius: 8, fontSize: 14,
        fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export function PageHeader({ icon, title, subtitle, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      padding: "20px 28px", marginBottom: 24,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{title}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {children}
      </div>
    </div>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return "Never Logged In";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 5) return "Online Now";
  if (diffMins < 60 * 24) {
    return "Today, " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (diffDays === 1) return "Yesterday, " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
      <div style={{
        width: 36, height: 36, border: "3px solid #f3f4f6",
        borderTopColor: "#B91C1C", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
