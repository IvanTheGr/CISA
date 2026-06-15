import { useState, useEffect, useRef, useCallback } from "react";
import { getProfile, updateProfile } from "../api/profile_api";

/* ─────────────────────────────────────────────────────────────
   ICON HELPERS
───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const SaveIcon   = () => <Icon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8" />;
const UserIcon   = () => <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z" />;
const MailIcon   = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const PhoneIcon  = () => <Icon d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />;
const ShieldIcon = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const ClockIcon  = () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2" />;
const CheckIcon  = () => <Icon d="M20 6L9 17l-5-5" />;
const GlobeIcon  = () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20 M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />;
const BellIcon   = () => <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0" />;

/* ─────────────────────────────────────────────────────────────
   RICH TEXT EDITOR
───────────────────────────────────────────────────────────── */
const ToolbarBtn = ({ onClick, title, active, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`inline-flex items-center justify-center w-7 h-7 rounded text-sm transition-all
      ${active ? "" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
    style={active ? { background: "rgba(215,58,48,0.12)", color: "#D73A30" } : {}}
  >
    {children}
  </button>
);

const ToolbarSep = () => <span className="w-px h-5 bg-slate-200 mx-0.5 self-center" />;

function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [active, setActive] = useState({});
  const [fontSize, setFontSize] = useState("14");

  useEffect(() => {
    if (ref.current && value !== undefined && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = useCallback((cmd, val = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    sync(); emit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sync = () =>
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikeThrough"),
    });

  const emit = () =>
    onChange({ target: { name: "signature", value: ref.current?.innerHTML || "" } });

  const applySize = (sz) => {
    setFontSize(sz);
    ref.current?.focus();
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      const span = document.createElement("span");
      span.style.fontSize = sz + "px";
      span.innerHTML = "&#8203;";
      range.insertNode(span);
    } else {
      const ex = range.extractContents();
      const span = document.createElement("span");
      span.style.fontSize = sz + "px";
      span.appendChild(ex);
      range.insertNode(span);
    }
    emit();
  };

  const insertLink = () => {
    const url = window.prompt("URL:", "https://");
    if (url) exec("createLink", url);
  };

  const insertTable = () => {
    let html = '<table style="border-collapse:collapse;width:100%">';
    for (let r = 0; r < 3; r++) {
      html += "<tr>";
      for (let c = 0; c < 3; c++)
        html += '<td style="border:1px solid #fcd5d3;padding:6px 10px;min-width:60px">&nbsp;</td>';
      html += "</tr>";
    }
    html += "</table><p><br></p>";
    exec("insertHTML", html);
  };

  const SIZES = ["10","11","12","13","14","15","16","18","20","24","28","32"];

  return (
    <div className="rounded-xl overflow-hidden shadow-sm bg-white" style={{  border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b" style={{ background: "#ffffff", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <select value={fontSize} onChange={(e) => applySize(e.target.value)}
          className="text-xs rounded px-1.5 py-1 bg-white text-slate-700 mr-1 focus:outline-none"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"}}>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <ToolbarSep />
        <ToolbarBtn onClick={() => exec("bold")} title="Bold" active={active.bold}>
          <strong className="text-xs font-black">B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} title="Italic" active={active.italic}>
          <em className="text-xs font-semibold">I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("underline")} title="Underline" active={active.underline}>
          <span className="text-xs underline font-semibold">U</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("strikeThrough")} title="Strikethrough" active={active.strike}>
          <span className="text-xs line-through font-semibold">S</span>
        </ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={insertTable} title="Insert table">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="1"/>
            <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={insertLink} title="Insert link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => fileRef.current?.click()} title="Insert image">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </ToolbarBtn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => exec("insertImage", ev.target.result);
            r.readAsDataURL(f);
            e.target.value = "";
          }}
        />
        <ToolbarSep />
        <ToolbarBtn onClick={() => exec("undo")} title="Undo">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/>
          </svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("redo")} title="Redo">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/>
          </svg>
        </ToolbarBtn>
      </div>

      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={emit} onKeyUp={sync} onMouseUp={sync}
        data-placeholder="Add a signature here…"
        className="min-h-[160px] p-4 text-sm text-slate-800 focus:outline-none leading-relaxed"
        style={{ fontFamily: "inherit" }}
      />
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
        [contenteditable] table td { border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"; padding: 6px 10px; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FIELD HELPERS
───────────────────────────────────────────────────────────── */
const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#872924" }}>
    {children}{required && <span className="ml-0.5" style={{ color: "#D73A30" }}>*</span>}
  </label>
);

const inputCls =
  "w-full px-3 py-2 text-sm bg-white rounded-lg text-slate-800 placeholder-slate-400 transition focus:outline-none hover:border-red-300";
const inputStyle = { border: "1.5px solid #fcd5d3" };

const readonlyCls = "w-full px-3 py-2 text-sm rounded-lg text-slate-500 cursor-not-allowed";
const readonlyStyle = { background: "#ffffff", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };

const selectCls =
  "w-full px-3 py-2 text-sm bg-white rounded-lg text-slate-800 transition focus:outline-none hover:border-red-300 cursor-pointer";

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium"
      style={isSuccess
        ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" }
        : { background: "#fff5f5", border: "1px solid #fca5a5", color: "#D73A30" }}
    >
      {isSuccess ? <CheckIcon /> : <Icon d="M18 6L6 18M6 6l12 12" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition">
        <Icon d="M18 6L6 18M6 6l12 12" size={14} />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────────── */
const SkeletonField = () => (
  <div className="space-y-1.5">
    <div className="h-3 w-20 rounded animate-pulse" style={{ background: "#ffffff" }} />
    <div className="h-9 w-full rounded-lg animate-pulse" style={{ background: "#ffffff" }} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────── */
const SectionHeader = ({ accent, title, badge }) => (
  <div className="px-6 py-4 border-b flex items-center gap-2.5" style={{ borderColor: "#fcd5d3" }}>
    <div className="w-1 h-5 rounded-full" style={{ background: accent || "linear-gradient(#D73A30, #872924)" }} />
    <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#872924" }}>{title}</h3>
    {badge && <span className="ml-auto text-xs text-slate-400 italic">{badge}</span>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    language: "English",
    timezone: "Asia/Jakarta",
    notificationType: "handle_by_emails",
    chatterPosition: "normal",
    signature: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      const data = res.data;
      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        language: data.language || "English",
        timezone: data.timezone || "Asia/Jakarta",
        notificationType: data.notificationType || "handle_by_emails",
        chatterPosition: data.chatterPosition || "normal",
        signature: data.signature || "",
      });
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal memuat data profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Nama lengkap wajib diisi";
    if (!form.email.trim()) {
      errs.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Format email tidak valid";
    }
    if (form.phone && !/^(\+62|62|0)[0-9]{8,13}$/.test(form.phone.replace(/\s/g, ""))) {
      errs.phone = "Format nomor telepon tidak valid (contoh: 08123456789)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        notificationType: form.notificationType,
        chatterPosition: form.chatterPosition,
        signature: form.signature,
        timezone: form.timezone,
      });
      setProfile(res.data.data);
      showToast("Profil berhasil diperbarui", "success");
      setErrors({});
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menyimpan perubahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const set = (name, value) => handleChange({ target: { name, value } });
  const showToast = (message, type) => setToast({ message, type });
  const closeToast = () => setToast(null);

  const fmt = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const initials = (name) =>
    (name || "?").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const focusStyle = { boxShadow: "0 0 0 2px rgba(215,58,48,0.2)", borderColor: "#D73A30" };
  const blurStyle = { boxShadow: "none", borderColor: "#fcd5d3" };

  return (
    <div className="min-h-screen" style={{ background: "#DDDDDD" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* TOP BAR */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm" style={{ borderColor: "#fcd5d3" }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Account</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold" style={{ color: "#D73A30" }}>My Profile</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "linear-gradient(90deg, #D73A30, #872924)", boxShadow: "0 4px 12px rgba(215,58,48,0.25)" }}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Menyimpan…
              </>
            ) : (
              <><SaveIcon /> Simpan Perubahan</>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {/* Accent bar */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #D73A30, #872924, #D73A30)" }} />

          <div className="px-8 py-7 flex items-start gap-7">
            {loading ? (
              <div className="w-20 h-20 rounded-full animate-pulse flex-shrink-0" style={{ background: "#fcd5d3" }} />
            ) : (
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg select-none"
                  style={{ background: "linear-gradient(135deg, #D73A30, #872924)" }}>
                  {initials(profile?.fullName)}
                </div>
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-6 w-48 rounded animate-pulse" style={{ background: "#fcd5d3" }} />
                  <div className="h-4 w-36 rounded animate-pulse" style={{ background: "#fff5f5" }} />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight truncate">
                    {profile?.fullName || "—"}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <MailIcon size={13} />
                    {profile?.login}
                  </p>
                  {profile?.roles?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {profile.roles.map((r) => (
                        <span key={r}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full cursor-default select-none transition-colors"
                          style={{ border: "1px solid #fcd5d3", background: "#fdfdfd", color: "#872924" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fcd5d3"; }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60 flex-shrink-0">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <SectionHeader title="Informasi Pribadi" />
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <FieldLabel required>Nama Lengkap</FieldLabel>
              {loading ? <SkeletonField /> : (
                <>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#D73A30", opacity: 0.6 }}>
                      <UserIcon size={15} />
                    </div>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className={`${inputCls} pl-9 ${errors.fullName ? "" : ""}`}
                      style={{ ...inputStyle, borderColor: errors.fullName ? "#fca5a5" : "#fcd5d3" }}
                      onFocus={e => { e.currentTarget.style.boxShadow = focusStyle.boxShadow; e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                      onBlur={e => { e.currentTarget.style.boxShadow = blurStyle.boxShadow; e.currentTarget.style.borderColor = errors.fullName ? "#fca5a5" : blurStyle.borderColor; }}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs mt-1" style={{ color: "#D73A30" }}>{errors.fullName}</p>}
                </>
              )}
            </div>

            {/* Email */}
            <div>
              <FieldLabel required>Email</FieldLabel>
              {loading ? <SkeletonField /> : (
                <>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#D73A30", opacity: 0.6 }}>
                      <MailIcon size={15} />
                    </div>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="email@example.com"
                      className={`${inputCls} pl-9`}
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.boxShadow = focusStyle.boxShadow; e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                      onBlur={e => { e.currentTarget.style.boxShadow = blurStyle.boxShadow; e.currentTarget.style.borderColor = blurStyle.borderColor; }}
                    />
                  </div>
                  {errors.email && <p className="text-xs mt-1" style={{ color: "#D73A30" }}>{errors.email}</p>}
                </>
              )}
            </div>

            {/* Phone */}
            <div>
              <FieldLabel>Nomor Telepon</FieldLabel>
              {loading ? <SkeletonField /> : (
                <>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#D73A30", opacity: 0.6 }}>
                      <PhoneIcon size={15} />
                    </div>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="08123456789"
                      className={`${inputCls} pl-9`}
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.boxShadow = focusStyle.boxShadow; e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                      onBlur={e => { e.currentTarget.style.boxShadow = blurStyle.boxShadow; e.currentTarget.style.borderColor = blurStyle.borderColor; }}
                    />
                  </div>
                  {errors.phone && <p className="text-xs mt-1" style={{ color: "#D73A30" }}>{errors.phone}</p>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <SectionHeader title="Preferensi" />
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Language */}
            <div>
              <FieldLabel>Bahasa</FieldLabel>
              {loading ? <SkeletonField /> : (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#D73A30", opacity: 0.6 }}>
                    <GlobeIcon size={15} />
                  </div>
                  <select name="language" value={form.language} onChange={handleChange}
                    className={`${selectCls} pl-9`} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.boxShadow = focusStyle.boxShadow; e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                    onBlur={e => { e.currentTarget.style.boxShadow = blurStyle.boxShadow; e.currentTarget.style.borderColor = blurStyle.borderColor; }}
                  >
                    <option value="English">English</option>
                    <option value="Indonesian">Indonesian (Bahasa)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Timezone */}
            <div>
              <FieldLabel>Zona Waktu</FieldLabel>
              {loading ? <SkeletonField /> : (
                <select name="timezone" value={form.timezone} onChange={handleChange}
                  className={selectCls} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.boxShadow = focusStyle.boxShadow; e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                  onBlur={e => { e.currentTarget.style.boxShadow = blurStyle.boxShadow; e.currentTarget.style.borderColor = blurStyle.borderColor; }}
                >
                  {["Asia/Jakarta","Asia/Makassar","Asia/Jayapura","Asia/Singapore","Asia/Bangkok","Asia/Tokyo","UTC","America/New_York","Europe/London"].map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Chatter Position */}
            <div>
              <FieldLabel>Posisi Chatter</FieldLabel>
              {loading ? <SkeletonField /> : (
                <select name="chatterPosition" value={form.chatterPosition} onChange={handleChange}
                  className={selectCls} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.boxShadow = focusStyle.boxShadow; e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                  onBlur={e => { e.currentTarget.style.boxShadow = blurStyle.boxShadow; e.currentTarget.style.borderColor = blurStyle.borderColor; }}
                >
                  <option value="normal">Normal</option>
                  <option value="sided">Sided</option>
                </select>
              )}
            </div>
          </div>

          {/* Notification Management */}
          <div className="px-6 pb-6">
            <FieldLabel>Notifikasi Email</FieldLabel>
            {loading ? <SkeletonField /> : (
              <div className="flex flex-col gap-2.5 mt-1">
                {[
                  { value: "handle_by_emails", label: "Handle by Emails", desc: "Kirim notifikasi melalui email" },
                  { value: "inbox", label: "Handle in Odoo", desc: "Tampilkan notifikasi di inbox Odoo" },
                ].map(({ value, label, desc }) => (
                  <label key={value}
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${form.notificationType === value ? "#fca5a5" : "#fcd5d3"}`,
                      background: form.notificationType === value ? "#fff5f5" : "white",
                    }}
                  >
                    <input type="radio" name="notificationType" value={value}
                      checked={form.notificationType === value}
                      onChange={() => set("notificationType", value)}
                      className="mt-0.5" style={{ accentColor: "#D73A30" }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"}}>
          <SectionHeader title="Tanda Tangan Email" />
          <div className="px-6 py-5">
            {loading ? (
              <div className="h-48 rounded-xl animate-pulse" style={{ background: "#ffffff" }} />
            ) : (
              <RichEditor value={form.signature} onChange={(e) => set("signature", e.target.value)} />
            )}
          </div>
        </div>

        {/* SYSTEM INFO */}
        <div className="bg-white rounded-xl" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"}}>
          <SectionHeader title="Informasi Sistem" badge="Tidak dapat diubah" />
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel>Username / Login</FieldLabel>
              {loading ? <SkeletonField /> : (
                <div className={readonlyCls} style={readonlyStyle}>{profile?.login || "—"}</div>
              )}
            </div>
            <div>
              <FieldLabel>Dibuat Pada</FieldLabel>
              {loading ? <SkeletonField /> : (
                <div className={`${readonlyCls} flex items-center gap-2`} style={readonlyStyle}>
                  <ClockIcon size={14} />
                  {fmt(profile?.createdAt)}
                </div>
              )}
            </div>
            <div>
              <FieldLabel>Terakhir Diperbarui</FieldLabel>
              {loading ? <SkeletonField /> : (
                <div className={`${readonlyCls} flex items-center gap-2`} style={readonlyStyle}>
                  <ClockIcon size={14} />
                  {fmt(profile?.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PASSWORD NOTE */}
        <div className="rounded-xl px-5 py-4 text-sm flex items-start gap-3"
          style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
          <ShieldIcon size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
          <p>
            Untuk mengubah password, silakan hubungi administrator sistem atau
            gunakan menu <strong>Change Password</strong> di pengaturan akun Odoo.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
