import React, { useState, useEffect } from "react";
import {
  FiSettings, FiToggleLeft, FiToggleRight,
  FiPackage, FiTool, FiUsers,
  FiBell, FiMail, FiMessageCircle, FiSend, FiCalendar, FiRefreshCw, FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { ModalCard, TextInput, ActionButton, PageHeader } from "../components/SharedUI";
import { fetchReminderConfigs, saveReminderConfig, testReminderChannel } from "../api/reminder_api";

// ─── Data ─────────────────────────────────────────────────────────────────────
const EMPTY_CHANNEL_CONFIGS = {
  email:    { smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "", fromName: "" },
  whatsapp: { apiUrl: "",  apiKey: "",  phone: "" },
  telegram: { botToken: "", chatId: "" },
};

const INITIAL_REMINDERS = [
  {
    id: "customerProduct",
    label: "Customer Product",
    description: "Notify assigned personnel before customer product contracts or subscriptions expire.",
    accent: "#2563eb", accentLight: "#eff6ff",
    enabled: false,
    startDaysBefore: 30, repeatEveryDays: 7, keepRemindingDays: 30,
    assignTo: { l1pic: true, l2pic: false, sales: false },
    channels: { inApp: true, email: false, whatsapp: false, telegram: false },
    channelConfigs: { ...EMPTY_CHANNEL_CONFIGS },
  },
  {
    id: "pm",
    label: "Preventive Maintenance",
    description: "Notify assigned personnel when preventive maintenance schedules are approaching.",
    accent: "#d97706", accentLight: "#fffbeb",
    enabled: false,
    startDaysBefore: 14, repeatEveryDays: 3, keepRemindingDays: 14,
    assignTo: { l1pic: true, l2pic: true, sales: false },
    channels: { inApp: true, email: false, whatsapp: false, telegram: false },
    channelConfigs: { ...EMPTY_CHANNEL_CONFIGS },
  },
];

const PIC_OPTIONS = [
  { key: "l1pic", label: "L1 PIC"  },
  { key: "l2pic", label: "L2 PIC"  },
  { key: "sales", label: "Sales"   },
];

const CHANNEL_OPTIONS = [
  {
    key: "inApp", label: "In-App", Icon: FiBell, color: "#6366f1", bg: "#eef2ff",
    fields: [],
  },
  {
    key: "email", label: "Email", Icon: FiMail, color: "#0ea5e9", bg: "#e0f2fe",
    fields: [
      { key: "smtpHost", label: "SMTP Host",  placeholder: "smtp.gmail.com",  type: "text",     half: true },
      { key: "smtpPort", label: "SMTP Port",  placeholder: "587",             type: "number",   half: true },
      { key: "smtpUser", label: "Username",   placeholder: "you@email.com",   type: "text",     half: true },
      { key: "smtpPass", label: "App Password (spaces OK)",   placeholder: "xxxx xxxx xxxx xxxx",  type: "password", half: true },
      { key: "fromName", label: "From Name (optional)",       placeholder: "CISA System",          type: "text",     half: false },
    ],
  },
  {
    key: "whatsapp", label: "WhatsApp", Icon: FiMessageCircle, color: "#16a34a", bg: "#dcfce7",
    fields: [
      { key: "apiUrl", label: "API URL",           placeholder: "https://api.whatsapp.com/...", type: "text",     half: false },
      { key: "apiKey", label: "API Key / Token",   placeholder: "Enter your API key",          type: "password", half: true  },
      { key: "phone",  label: "Sender Phone",      placeholder: "+62 812 3456 7890",           type: "text",     half: true  },
    ],
  },
  {
    key: "telegram", label: "Telegram", Icon: FiSend, color: "#0284c7", bg: "#dbeafe",
    fields: [
      { key: "botToken", label: "Bot Token", placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11", type: "password", half: false },
      { key: "chatId",   label: "Chat ID",   placeholder: "-1001234567890",                            type: "text",     half: true  },
    ],
  },
];

// ─── API transform helpers ────────────────────────────────────────────────────
function toApiDto(r) {
  return {
    id:               r.id,
    enabled:          r.enabled,
    startDaysBefore:  r.startDaysBefore,
    repeatEveryDays:  r.repeatEveryDays,
    keepRemindingDays: r.keepRemindingDays,
    assignTo:         Object.entries(r.assignTo).filter(([, v]) => v).map(([k]) => k.replace("pic", "")),
    channels:         Object.entries(r.channels).filter(([, v]) => v).map(([k]) => k),
    channelConfigs:   r.channelConfigs,
  };
}

function fromApiDto(dto) {
  const base = INITIAL_REMINDERS.find((r) => r.id === dto.id) || {};
  return {
    ...base,
    enabled:           dto.enabled          ?? false,
    startDaysBefore:   dto.startDaysBefore  ?? base.startDaysBefore,
    repeatEveryDays:   dto.repeatEveryDays  ?? base.repeatEveryDays,
    keepRemindingDays: dto.keepRemindingDays ?? base.keepRemindingDays,
    assignTo: {
      l1pic:   (dto.assignTo ?? []).includes("l1"),
      l2pic:   (dto.assignTo ?? []).includes("l2"),
      sales:   (dto.assignTo ?? []).includes("sales"),
    },
    channels: {
      inApp:    (dto.channels ?? []).includes("inApp"),
      email:    (dto.channels ?? []).includes("email"),
      whatsapp: (dto.channels ?? []).includes("whatsapp"),
      telegram: (dto.channels ?? []).includes("telegram"),
    },
    channelConfigs: { ...EMPTY_CHANNEL_CONFIGS, ...(dto.channelConfigs || {}) },
  };
}

// ─── Configure Modal ──────────────────────────────────────────────────────────
function ConfigureModal({ reminder, onClose, onSaved }) {
  const [start,  setStart]  = useState(String(reminder.startDaysBefore));
  const [repeat, setRepeat] = useState(String(reminder.repeatEveryDays));
  const [keep,   setKeep]   = useState(String(reminder.keepRemindingDays));
  const [assignTo,      setAssignTo]      = useState({ ...reminder.assignTo });
  const [channels,      setChannels]      = useState({ ...reminder.channels });
  const [channelConfigs, setChannelConfigs] = useState({
    email:    { ...EMPTY_CHANNEL_CONFIGS.email,    ...(reminder.channelConfigs?.email    || {}) },
    whatsapp: { ...EMPTY_CHANNEL_CONFIGS.whatsapp, ...(reminder.channelConfigs?.whatsapp || {}) },
    telegram: { ...EMPTY_CHANNEL_CONFIGS.telegram, ...(reminder.channelConfigs?.telegram || {}) },
  });
  const [err, setErr] = useState("");
  const [testingCh,  setTestingCh]  = useState(null);
  // testResults[channelKey] = { ok: bool, msg: string } — stays visible until user edits or retests
  const [testResults, setTestResults] = useState({});

  const extractErrorMsg = (e) => {
    const data = e.response?.data;
    if (!data) return e.message || "Test failed — no response from server";
    // Spring Boot wraps errors as { timestamp, status, message } — extract the message string
    if (typeof data === "object") return data.message || data.error || JSON.stringify(data);
    return String(data);
  };

  const handleTest = (key) => {
    setTestingCh(key);
    setTestResults((p) => ({ ...p, [key]: null }));
    testReminderChannel(key, channelConfigs[key], reminder.id)
      .then(() => setTestResults((p) => ({ ...p, [key]: { ok: true,  msg: "Test message sent successfully! Check your inbox (and spam folder)." } })))
      .catch((e) => setTestResults((p) => ({ ...p, [key]: { ok: false, msg: extractErrorMsg(e) } })))
      .finally(() => setTestingCh(null));
  };

  const togglePic = (k) => setAssignTo((p) => ({ ...p, [k]: !p[k] }));
  const toggleCh  = (k) => { setChannels((p) => ({ ...p, [k]: !p[k] })); setErr(""); };

  const setConfigField = (ch, field, val) => {
    setTestResults((p) => ({ ...p, [ch]: null })); // clear result when user edits a field
    setChannelConfigs((p) => ({ ...p, [ch]: { ...p[ch], [field]: val } }));
  };

  const save = () => {
    const s = parseInt(start, 10), r = parseInt(repeat, 10), k = parseInt(keep, 10);
    if (!s || s < 1) return setErr("Start days must be at least 1");
    if (!r || r < 1) return setErr("Repeat interval must be at least 1 day");
    if (!k || k < 1) return setErr("Keep reminding duration must be at least 1 day");
    if (!Object.values(assignTo).some(Boolean))  return setErr("Assign to at least one PIC");
    if (!Object.values(channels).some(Boolean))  return setErr("Select at least one notification channel");

    // Validate configs for active channels that require it
    if (channels.email) {
      const c = channelConfigs.email;
      if (!c.smtpHost || !c.smtpPort || !c.smtpUser || !c.smtpPass)
        return setErr("Email: fill in SMTP host, port, username, and password");
    }
    if (channels.whatsapp) {
      const c = channelConfigs.whatsapp;
      if (!c.apiUrl || !c.apiKey || !c.phone)
        return setErr("WhatsApp: fill in API URL, API key, and sender phone");
    }
    if (channels.telegram) {
      const c = channelConfigs.telegram;
      if (!c.botToken || !c.chatId)
        return setErr("Telegram: fill in bot token and chat ID");
    }

    onSaved({ ...reminder, startDaysBefore: s, repeatEveryDays: r, keepRemindingDays: k, assignTo, channels, channelConfigs });
    toast.success(`${reminder.label} reminder configured`);
    onClose();
  };

  return (
    <ModalCard title={`Configure — ${reminder.label} Reminder`} onClose={onClose} width={560}>

      {/* ── Timing ── */}
      <ModalSection label="Timing">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <ModalNumberField label="Start before"  unit="days before"   icon={<FiCalendar  size={13} color="#9ca3af" />} value={start}  onChange={(v) => { setStart(v);  setErr(""); }} />
          <ModalNumberField label="Repeat every"  unit="days interval" icon={<FiRefreshCw size={13} color="#9ca3af" />} value={repeat} onChange={(v) => { setRepeat(v); setErr(""); }} />
          <ModalNumberField label="Keep for"      unit="days total"    icon={<FiClock     size={13} color="#9ca3af" />} value={keep}   onChange={(v) => { setKeep(v);   setErr(""); }} />
        </div>
      </ModalSection>

      {/* ── PIC ── */}
      <ModalSection label="Assign To (PIC)">
        <div style={{ display: "flex", gap: 8 }}>
          {PIC_OPTIONS.map((o) => (
            <label key={o.key} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "9px 0", borderRadius: 8, cursor: "pointer",
              border: `1.5px solid ${assignTo[o.key] ? "#B91C1C" : "#e5e7eb"}`,
              background: assignTo[o.key] ? "#fef2f2" : "#fafafa", transition: "all 0.15s",
            }}>
              <input type="checkbox" checked={assignTo[o.key]} onChange={() => togglePic(o.key)}
                style={{ accentColor: "#B91C1C", width: 13, height: 13 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: assignTo[o.key] ? "#B91C1C" : "#6b7280" }}>
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </ModalSection>

      {/* ── Notification Channels ── */}
      <ModalSection label="Notification Channels">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CHANNEL_OPTIONS.map(({ key, label, Icon, color, bg, fields }) => {
            const on = channels[key];
            const hasFields = fields.length > 0;
            return (
              <div key={key} style={{
                borderRadius: 10, overflow: "hidden",
                border: `1.5px solid ${on ? color : "#e5e7eb"}`,
                background: on ? bg : "#fafafa",
                transition: "all 0.2s",
              }}>
                {/* ── Channel toggle row ── */}
                <div
                  onClick={() => toggleCh(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px", cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: on ? color : "#e9ecef",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    <Icon size={16} color={on ? "#fff" : "#9ca3af"} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: on ? color : "#374151" }}>
                    {label}
                  </span>
                  {hasFields && on && (
                    <span style={{ fontSize: 11, color: color, fontWeight: 500, marginRight: 4 }}>
                      Configure below
                    </span>
                  )}
                  {/* Custom toggle pill */}
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                    background: on ? color : "#d1d5db",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: 3,
                      left: on ? 19 : 3,
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#fff", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                </div>

                {/* ── Config fields (only when ON and has fields) ── */}
                {on && hasFields && (
                  <div style={{
                    padding: "0 14px 14px",
                    borderTop: `1px solid ${color}33`,
                    background: "#fff",
                  }}>
                    <div style={{
                      fontSize: 10.5, fontWeight: 700, color: color,
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      padding: "10px 0 8px",
                    }}>
                      {label} Configuration
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {fields.map((f) => (
                        <div key={f.key} style={{ gridColumn: f.half ? undefined : "1 / -1" }}>
                          <label style={{ display: "block", fontSize: 11.5, fontWeight: 500, color: "#6b7280", marginBottom: 5 }}>
                            {f.label}
                          </label>
                          <TextInput
                            type={f.type}
                            value={channelConfigs[key]?.[f.key] ?? ""}
                            onChange={(e) => setConfigField(key, f.key, e.target.value)}
                            placeholder={f.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                    {/* ── Test button + inline result ── */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          disabled={testingCh === key}
                          onClick={() => handleTest(key)}
                          style={{
                            padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                            cursor: testingCh === key ? "not-allowed" : "pointer",
                            background: testingCh === key ? "#f3f4f6" : "#fff",
                            color: testingCh === key ? "#9ca3af" : color,
                            border: `1.5px solid ${testingCh === key ? "#d1d5db" : color}`,
                            opacity: testingCh === key ? 0.7 : 1,
                            transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: 6,
                          }}
                        >
                          {testingCh === key ? (
                            <>
                              <span style={{
                                width: 11, height: 11, border: `2px solid ${color}`,
                                borderTopColor: "transparent", borderRadius: "50%",
                                display: "inline-block", animation: "spin 0.7s linear infinite",
                              }} />
                              Sending test…
                            </>
                          ) : (
                            <>&#9654; Send Test</>
                          )}
                        </button>
                      </div>

                      {/* Inline result — stays visible until user edits a field or retests */}
                      {testResults[key] && (
                        <div style={{
                          marginTop: 8, padding: "9px 12px", borderRadius: 7,
                          background: testResults[key].ok ? "#f0fdf4" : "#fef2f2",
                          border: `1px solid ${testResults[key].ok ? "#86efac" : "#fca5a5"}`,
                          color: testResults[key].ok ? "#15803d" : "#b91c1c",
                          fontSize: 12, lineHeight: 1.55,
                        }}>
                          <span style={{ fontWeight: 700, marginRight: 6 }}>
                            {testResults[key].ok ? "✓" : "✗"}
                          </span>
                          {typeof testResults[key].msg === "string"
                            ? testResults[key].msg
                            : JSON.stringify(testResults[key].msg)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ModalSection>

      {err && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{err}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton onClick={save}>Save Configuration</ActionButton>
      </div>
    </ModalCard>
  );
}

// ─── Reminder Card ────────────────────────────────────────────────────────────
function ReminderTypeCard({ reminder, onToggle, onConfigure }) {
  const CardIcon   = reminder.id === "pm" ? FiTool : FiPackage;
  const accent     = reminder.enabled ? "#16a34a" : "#B91C1C";
  const accentBg   = reminder.enabled ? "#f0fdf4" : "#fef2f2";
  const activePics = PIC_OPTIONS.filter((p) => reminder.assignTo[p.key]);
  const activeChs  = CHANNEL_OPTIONS.filter((c) => reminder.channels[c.key]);

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
      border: "1px solid #f0f0f0",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* ── Left accent + header ── */}
      <div style={{ display: "flex" }}>
        <div style={{
          width: 4, flexShrink: 0,
          background: reminder.enabled
            ? "linear-gradient(180deg, #16a34a 0%, #15803d 100%)"
            : "linear-gradient(180deg, #B91C1C99 0%, #B91C1C44 100%)",
          transition: "background 0.3s",
        }} />
        <div style={{ flex: 1, padding: "22px 22px 20px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: accentBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <CardIcon size={22} color={accent} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                  {reminder.label} Reminder
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: accentBg,
                  border: `1px solid ${reminder.enabled ? "#86efac" : "#fca5a5"}`,
                  borderRadius: 20, padding: "2px 9px",
                  fontSize: 10.5, fontWeight: 700, color: accent,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", display: "inline-block", background: accent }} />
                  {reminder.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.6, margin: 0, maxWidth: 360 }}>
                {reminder.description}
              </p>
            </div>
          </div>
          <button onClick={() => onToggle(reminder.id)}
            title={reminder.enabled ? "Disable" : "Enable"}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, marginTop: 2 }}>
            {reminder.enabled
              ? <FiToggleRight size={36} color="#16a34a" />
              : <FiToggleLeft  size={36} color="#B91C1C" />}
          </button>
        </div>
      </div>

      {/* ── Horizontal timing strip ── */}
      <div style={{ margin: "0 24px", background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 10, display: "flex" }}>
        {[
          { Icon: FiCalendar,  label: "Starts",   value: reminder.startDaysBefore,              unit: "days before" },
          { Icon: FiRefreshCw, label: "Repeats",  value: `every ${reminder.repeatEveryDays}`,   unit: "days"        },
          { Icon: FiClock,     label: "Duration", value: reminder.keepRemindingDays,             unit: "days total"  },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <div style={{ width: 1, background: "#e9ecef", alignSelf: "stretch" }} />}
            <div style={{ flex: 1, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "#fff", border: "1px solid #e9ecef",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <item.Icon size={13} color={accent} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {item.value} <span style={{ fontSize: 11, fontWeight: 500, color: "#6b7280" }}>{item.unit}</span>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── PIC + Channels ── */}
      <div style={{ padding: "16px 24px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, width: 80, flexShrink: 0 }}>
            <FiUsers size={12} color="#9ca3af" />
            <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 600 }}>PIC</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {activePics.length
              ? activePics.map((p) => (
                <span key={p.key} style={{
                  fontSize: 11.5, fontWeight: 600, color: "#374151",
                  background: "#f3f4f6", border: "1px solid #e5e7eb",
                  borderRadius: 6, padding: "2px 10px",
                }}>{p.label}</span>
              ))
              : <span style={{ fontSize: 12, color: "#d1d5db", fontStyle: "italic" }}>None assigned</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, width: 80, flexShrink: 0 }}>
            <FiBell size={12} color="#9ca3af" />
            <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 600 }}>Channels</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {activeChs.length
              ? activeChs.map(({ key, label, Icon, color, bg }) => (
                <span key={key} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: bg, color, border: `1px solid ${color}33`,
                  borderRadius: 6, padding: "2px 9px", fontSize: 11.5, fontWeight: 600,
                }}>
                  <Icon size={11} />{label}
                </span>
              ))
              : <span style={{ fontSize: 12, color: "#d1d5db", fontStyle: "italic" }}>None selected</span>}
          </div>
        </div>
      </div>

      {/* ── Footer button ── */}
      <div style={{ padding: "4px 24px 20px" }}>
        <button
          onClick={() => onConfigure(reminder)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 0", borderRadius: 8, cursor: "pointer",
            background: accent, border: `1.5px solid ${accent}`,
            fontSize: 13, fontWeight: 600, color: "#fff",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <FiSettings size={13} />
          Configure Reminder
        </button>
      </div>
    </div>
  );
}

// ─── Modal helpers ────────────────────────────────────────────────────────────
function ModalSection({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ModalNumberField({ label, unit, icon, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon}
        <span style={{ fontSize: 11.5, fontWeight: 500, color: "#6b7280" }}>{label}</span>
      </div>
      <TextInput type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
      <span style={{ fontSize: 10.5, color: "#9ca3af" }}>{unit}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReminderPage() {
  const [reminders,   setReminders]   = useState(INITIAL_REMINDERS);
  const [configuring, setConfiguring] = useState(null);

  // Load persisted configs from backend on mount
  useEffect(() => {
    fetchReminderConfigs()
      .then(({ data }) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setReminders((prev) =>
          prev.map((r) => {
            const dto = data.find((d) => d.id === r.id);
            return dto ? fromApiDto(dto) : r;
          })
        );
      })
      .catch(() => {}); // backend not yet running — stay on defaults
  }, []);

  const persistAndUpdate = (updated) => {
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    saveReminderConfig(toApiDto(updated)).catch(() =>
      toast.error("Could not save reminder config to server")
    );
  };

  const handleToggle = (id) =>
    setReminders((prev) => {
      const next = prev.map((r) => {
        if (r.id !== id) return r;
        const toggled = { ...r, enabled: !r.enabled };
        saveReminderConfig(toApiDto(toggled)).catch(() =>
          toast.error("Could not save to server")
        );
        toast.success(`${toggled.label} reminder ${toggled.enabled ? "enabled" : "disabled"}`);
        return toggled;
      });
      return next;
    });

  const handleSaved = (updated) => persistAndUpdate(updated);

  const activeCount = reminders.filter((r) => r.enabled).length;

  return (
    <div style={{ padding: "28px 32px 40px", background: "#f3f4f6", minHeight: "100vh" }}>
      <PageHeader icon="🔔" title="Reminder Settings"
        subtitle="Configure automated reminders for customer products and preventive maintenance">
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: activeCount > 0 ? "#f0fdf4" : "#fef2f2",
          border: `1.5px solid ${activeCount > 0 ? "#16a34a" : "#fca5a5"}`,
          borderRadius: 10, padding: "7px 14px",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", display: "inline-block", background: activeCount > 0 ? "#16a34a" : "#B91C1C" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: activeCount > 0 ? "#16a34a" : "#B91C1C" }}>
            {activeCount} of {reminders.length} active
          </span>
        </div>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(700px, 1fr))", gap: 20, alignItems: "start" }}>
        {reminders.map((r) => (
          <ReminderTypeCard key={r.id} reminder={r}
            onToggle={handleToggle}
            onConfigure={(item) => setConfiguring(item)} />
        ))}
      </div>

      {configuring && (
        <ConfigureModal
          reminder={configuring}
          onClose={() => setConfiguring(null)}
          onSaved={(updated) => { handleSaved(updated); setConfiguring(null); }}
        />
      )}
    </div>
  );
}
