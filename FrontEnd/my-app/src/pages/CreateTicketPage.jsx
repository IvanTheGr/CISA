import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   PROJECT THEME TOKENS
───────────────────────────────────────────────────────────── */
const THEME = {
  gradCss: "linear-gradient(135deg, #D73A30, #872924)",
  gradCssHover: "linear-gradient(135deg, #c0322a, #6e2020)",
  accentRing: "rgba(215,58,48,0.30)",
  cardBg: "rgba(255,255,255,0.92)",
  pageBg: "#DDDDDD",
  primary: "#D73A30",
};

/* ─────────────────────────────────────────────────────────────
   INLINE SVG ICON SYSTEM
───────────────────────────────────────────────────────────── */
const SvgIcon = ({ d, size = 16, className = "", sw = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {[].concat(d).map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const CheckIcon = ({ size = 16 }) => <SvgIcon size={size} d="M20 6L9 17l-5-5" />;
const XIcon = ({ size = 16 }) => <SvgIcon size={size} d={["M18 6L6 18", "M6 6l12 12"]} />;
const ChevronIcon = ({ size = 14, className = "" }) => (
  <SvgIcon size={size} className={className} d="M6 9l6 6 6-6" />
);
const PaperclipIcon = ({ size = 16 }) => (
  <SvgIcon size={size} d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.49" />
);
const SearchIcon = ({ size = 14 }) => (
  <SvgIcon size={size} d={["M21 21l-4.35-4.35", "M17 11A6 6 0 105 11a6 6 0 0012 0"]} />
);
const TicketIcon = ({ size = 20 }) => (
  <SvgIcon size={size} d="M2 9a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 000-4V9z" />
);
const UserIcon = ({ size = 16 }) => (
  <SvgIcon size={size} d={["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8"]} />
);
const TagIcon = ({ size = 16 }) => (
  <SvgIcon size={size} d={["M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z", "M7 7h.01"]} />
);
const AlertTriIcon = ({ size = 13 }) => (
  <SvgIcon
    size={size}
    d={[
      "M12 9v4m0 4h.01",
      "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    ]}
  />
);
const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = {
    success: {
      bg: "#f0fdf4",
      border: "#86efac",
      color: "#166534",
      icon: <CheckIcon size={15} />,
    },
    error: {
      bg: "#fef2f2",
      border: "#fca5a5",
      color: "#991b1b",
      icon: <XIcon size={15} />,
    },
    info: {
      bg: "#eff6ff",
      border: "#93c5fd",
      color: "#1e40af",
      icon: <SvgIcon size={15} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />,
    },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed top-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl max-w-xs"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <span className="mt-0.5 flex-shrink-0">{cfg.icon}</span>
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button onClick={onClose} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
        <XIcon size={13} />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RICH TEXT TOOLBAR BUTTON
───────────────────────────────────────────────────────────── */
const ToolbarBtn = ({ onClick, title, active, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-sm transition-all duration-150"
    style={
      active
        ? { background: `rgba(215,58,48,0.12)`, color: "#D73A30" }
        : { color: "#6b7280" }
    }
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.background = "#f3f4f6";
        e.currentTarget.style.color = "#111";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#6b7280";
      }
    }}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <span className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />;

/* ─────────────────────────────────────────────────────────────
   RICH TEXT EDITOR
───────────────────────────────────────────────────────────── */
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fontSize, setFontSize] = useState("14");
  const [activeStates, setActiveStates] = useState({});
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const focusEditor = () => editorRef.current?.focus();

  const syncActive = () => {
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || "";
    setCharCount((editorRef.current?.innerText || "").length);
    onChange({ target: { name: "descriptionText", value: html } });
  };

  const exec = useCallback((cmd, val = null) => {
    focusEditor();
    document.execCommand(cmd, false, val);
    syncActive();
    emitChange();
  }, []);

  const applyFontSize = (size) => {
    setFontSize(size);
    focusEditor();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = size + "px";

    if (range.collapsed) {
      span.innerHTML = "&#8203;";
      range.insertNode(span);
      const nr = document.createRange();
      nr.setStart(span, 1);
      nr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nr);
    } else {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }

    emitChange();
  };

  const insertLink = () => {
    const u = window.prompt("Enter URL:", "https://");
    if (u) exec("createLink", u);
  };

  const insertImage = () => fileInputRef.current?.click();

  const handleImageFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => exec("insertImage", ev.target.result);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const FONT_SIZES = ["12", "13", "14", "16", "18", "20", "24", "28", "32"];

  const LineSVG = ({ lines }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </svg>
  );

  return (
    <div className="rounded-xl shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100" style={{ background: "#fafafa" }}>
        <select
          value={fontSize}
          onChange={(e) => applyFontSize(e.target.value)}
          className="text-xs rounded-md px-2 py-1 mr-1 focus:outline-none cursor-pointer"
          style={{
            background: "rgba(215,58,48,0.06)",
            border: "1px solid rgba(215,58,48,0.15)",
            color: "#374151",
          }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}px
            </option>
          ))}
        </select>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => exec("bold")} title="Bold" active={activeStates.bold}>
          <strong className="text-xs font-black">B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} title="Italic" active={activeStates.italic}>
          <em className="text-xs font-semibold">I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("underline")} title="Underline" active={activeStates.underline}>
          <span className="text-xs underline font-semibold">U</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("strikeThrough")} title="Strike">
          <span className="text-xs line-through font-semibold">S</span>
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => exec("justifyLeft")} title="Align Left">
          <LineSVG lines={[[3, 6, 21, 6], [3, 12, 15, 12], [3, 18, 18, 18]]} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("justifyCenter")} title="Align Center">
          <LineSVG lines={[[3, 6, 21, 6], [6, 12, 18, 12], [4, 18, 20, 18]]} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("justifyRight")} title="Align Right">
          <LineSVG lines={[[3, 6, 21, 6], [9, 12, 21, 12], [6, 18, 21, 18]]} />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet List" active={activeStates.insertUnorderedList}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered List" active={activeStates.insertOrderedList}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4M4 10h2M4 15.5c0-1 1.5-1 1.5 0s-1.5 1-1.5 2h3" strokeWidth="1.5" />
          </svg>
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn
          title="Insert Table"
          onClick={() => {
            let h = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
            for (let r = 0; r < 3; r++) {
              h += "<tr>";
              for (let c = 0; c < 3; c++) {
                h += '<td style="border:1px solid #e2e8f0;padding:8px 12px;min-width:80px">&nbsp;</td>';
              }
              h += "</tr>";
            }
            h += "</table><p><br></p>";
            exec("insertHTML", h);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={insertLink} title="Insert Link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={insertImage} title="Insert Image">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </ToolbarBtn>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

        <ToolbarDivider />

        <ToolbarBtn onClick={() => exec("undo")} title="Undo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 00-4-4H4" />
          </svg>
        </ToolbarBtn>

        <ToolbarBtn onClick={() => exec("redo")} title="Redo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 14 20 9 15 4" />
            <path d="M4 20v-7a4 4 0 014-4h12" />
          </svg>
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear Formatting">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h16v3" />
            <path d="M9 20h6" />
            <path d="M12 4v16" />
            <line x1="3" y1="3" x2="21" y2="21" strokeDasharray="3 2" />
          </svg>
        </ToolbarBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyUp={syncActive}
        onMouseUp={syncActive}
        className="min-h-[220px] p-5 text-sm text-slate-800 focus:outline-none leading-relaxed bg-white"
        style={{ fontFamily: "inherit" }}
        data-placeholder="Describe the issue in detail — steps to reproduce, expected vs actual behavior…"
      />

      <div className="px-4 py-2 flex justify-end border-t border-slate-100" style={{ background: "#fafafa" }}>
        <span className="text-xs text-slate-400">{charCount} characters</span>
      </div>

      <style>{`
        [contenteditable]:empty:before { content:attr(data-placeholder); color:#94a3b8; pointer-events:none; }
        [contenteditable] table td    { border:1px solid #e2e8f0; padding:8px 12px; }
        [contenteditable] a           { color:#D73A30; text-decoration:underline; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FIELD COMPONENTS
───────────────────────────────────────────────────────────── */
const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6b7280" }}>
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const baseInput =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 transition-all focus:outline-none hover:border-slate-300";

const ReadOnlyField = ({ value, mono }) => (
  <div
    className={`px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg ${
      mono ? "font-mono font-semibold text-slate-800" : "text-slate-700"
    }`}
  >
    {value || <span className="text-slate-400">—</span>}
  </div>
);

const onFocusRed = (e) => {
  e.currentTarget.style.borderColor = "#D73A30";
  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(215,58,48,0.25)";
};

const onBlurClean = (e) => {
  e.currentTarget.style.borderColor = "#e5e7eb";
  e.currentTarget.style.boxShadow = "none";
};

/* ─────────────────────────────────────────────────────────────
   SEARCHABLE DROPDOWN
───────────────────────────────────────────────────────────── */
function SearchableDropdown({ label, placeholder, value, displayValue, options, onSelect, required }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [rect, setRect] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const calcRect = useCallback(() => {
    if (!buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    setRect({
      top: r.bottom + window.scrollY,
      left: r.left + window.scrollX,
      width: r.width,
    });
  }, []);

  const toggleOpen = () => {
    if (!open) {
      calcRect();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
        setFilter("");
      }
    };

    const onScroll = () => calcRect();

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", calcRect);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", calcRect);
    };
  }, [open, calcRect]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(filter.toLowerCase())
  );

  const portalContent =
    open && rect
      ? ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: rect.top + 6,
              left: rect.left,
              width: rect.width,
              zIndex: 999999,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {options.length > 5 && (
              <div
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #f1f5f9",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                >
                  <SearchIcon size={13} />
                </span>

                <input
                  autoFocus
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter…"
                  style={{
                    width: "100%",
                    paddingLeft: "28px",
                    paddingRight: "12px",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    fontSize: "13px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <ul
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                padding: "4px 0",
                margin: 0,
                listStyle: "none",
              }}
            >
              {filtered.length === 0 ? (
                <li style={{ padding: "12px 16px", fontSize: "13px", color: "#94a3b8", textAlign: "center" }}>
                  No results
                </li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect(opt);
                      setFilter("");
                      setOpen(false);
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: value === opt.value ? "#fef2f2" : "transparent",
                      color: value === opt.value ? "#D73A30" : "#374151",
                      fontWeight: value === opt.value ? 600 : 400,
                    }}
                  >
                    {value === opt.value ? (
                      <CheckIcon size={12} />
                    ) : (
                      <span style={{ width: "16px", display: "inline-block" }} />
                    )}
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <div style={{ position: "relative" }}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}

      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "10px 14px",
          fontSize: "14px",
          borderRadius: "8px",
          background: "#fff",
          border: open ? "1px solid #D73A30" : "1px solid #e5e7eb",
          boxShadow: open ? "0 0 0 2px rgba(215,58,48,0.25)" : "none",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.15s",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: displayValue ? "#1e293b" : "#94a3b8",
          }}
        >
          {displayValue || placeholder || "Select…"}
        </span>
        <span
          style={{
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "#6b7280",
          }}
        >
          <ChevronIcon />
        </span>
      </button>

      {portalContent}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────────── */
function SectionCard({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-3xl"
      style={{
        background: THEME.cardBg,
        backdropFilter: "blur(16px)",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: THEME.gradCss }}
        >
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-700 tracking-wide">{title}</h3>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRIORITY BADGE CONFIG
───────────────────────────────────────────────────────────── */
const P_STYLE = {
  red: { badge: "bg-red-100 text-red-700", dot: "bg-red-500", text: "text-red-600" },
  orange: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500", text: "text-orange-600" },
  yellow: { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", text: "text-yellow-600" },
  green: { badge: "bg-green-100 text-green-700", dot: "bg-green-500", text: "text-green-600" },
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
function CreateTicketPage() {
  const [form, setForm] = useState({
    subject: "",
    partnerId: "",
    priorityId: "",
    productId: "",
    descriptionText: "",
    accountName: "",
    personName: "",
    email: "",
    attachment: null,
  });

  const [customerSearch, setCustomerSearch] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [showCustList, setShowCustList] = useState(false);
  const searchTimeout = useRef(null);
  const customerRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCustomer, setIsCustomer] = useState(false);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });

  useEffect(() => {
    (async () => {
      try {
        const [meRes, custRes, prodRes, prioRes, numRes] = await Promise.all([
          axios.get("/api/auth/me-ticket", { withCredentials: true }),
          axios.get("/api/dropdown/customers", { withCredentials: true }),
          axios.get("/api/dropdown/products", { withCredentials: true }),
          axios.get("/api/dropdown/priorities", { withCredentials: true }),
          axios.get("/api/ticket/next-number", { withCredentials: true }),
        ]);

        const user = meRes.data;
        console.log("ME-TICKET RESPONSE:", user);

        setCurrentUser(user);

        const customerList = Array.isArray(custRes.data)
          ? custRes.data
          : custRes.data.content ?? [];

        setCustomers(customerList);
        setProducts(prodRes.data ?? []);
        setPriorities(prioRes.data ?? []);
        setTicketNumber(numRes.data);

        const roles = Array.isArray(user.roles) ? user.roles : [];

        const privilegedRoles = [
          "Support Manager",
          "Support Staff",
          "PTAP Manager Support",
          "PTAP Eksternal/Internal Support Staff",
          "ROLE_Support Manager",
          "ROLE_Support Staff",
          "ROLE_PTAP Manager Support",
          "ROLE_PTAP Eksternal/Internal Support Staff",
        ];

        const privilegedNormalized = privilegedRoles.map((r) =>
          String(r).toLowerCase().trim()
        );

        const roleNormalized = roles.map((r) =>
          String(r).toLowerCase().trim()
        );

        const isPrivileged = roleNormalized.some((r) =>
          privilegedNormalized.includes(r)
        );

        console.log("ROLES:", roles);
        console.log("IS PRIVILEGED:", isPrivileged);

        if (!isPrivileged) {
          setIsCustomer(true);

          const autoPartnerId = user.partnerId ?? "";
          const matchedCustomer = customerList.find(
            (c) => String(c.id) === String(autoPartnerId)
          );

          const autoDisplayName =
            user.displayName ||
            matchedCustomer?.displayName ||
            "";

          const autoParentName =
            user.parentName ||
            matchedCustomer?.parentName ||
            autoDisplayName ||
            "";

          setForm((prev) => ({
            ...prev,
            partnerId: autoPartnerId,
            accountName: autoParentName,
            personName: "",
            email: "",
          }));

          setCustomerSearch(autoDisplayName);
        } else {
          setIsCustomer(false);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load form data", "error");
      } finally {
        setInitLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) {
        setShowCustList(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const searchCustomers = (val) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get("/api/dropdown/customers", {
          params: { search: val },
          withCredentials: true,
        });

        setCustomers(Array.isArray(res.data) ? res.data : res.data.content ?? []);
        setShowCustList(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

const handleSave = async () => {
  const errs = {};

  if (!form.subject.trim()) errs.subject = "Subject is required";
  if (!form.priorityId) errs.priorityId = "Priority is required";
  if (!form.productId) errs.productId = "Product is required";
  if (!form.descriptionText || !form.descriptionText.replace(/<[^>]*>/g, "").trim()) {
    errs.descriptionText = "Description is required";
  }

  if (Object.keys(errs).length) {
    setErrors(errs);
    showToast("Please fill in all required fields", "error");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      subject: form.subject,
      partnerId: form.partnerId,
      priorityId: form.priorityId,
      productId: form.productId,
      descriptionText: form.descriptionText,
      personName: form.personName,
      email: form.email,
    };

    await axios.post("/api/ticket/create", payload, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    const nextNumRes = await axios.get("/api/ticket/next-number", {
      withCredentials: true,
    });

    setTicketNumber(nextNumRes.data);

    showToast("Ticket created successfully!", "success");

    if (isCustomer && currentUser) {
      setForm({
        subject: "",
        partnerId: currentUser.partnerId ?? "",
        priorityId: "",
        productId: "",
        descriptionText: "",
        accountName: currentUser.parentName || currentUser.displayName || "",
        personName: "",
        email: "",
        attachment: null,
      });

      setCustomerSearch(currentUser.displayName || "");
    } else {
      setForm({
        subject: "",
        partnerId: "",
        priorityId: "",
        productId: "",
        descriptionText: "",
        accountName: "",
        personName: "",
        email: "",
        attachment: null,
      });

      setCustomerSearch("");
    }

    setErrors({});
  } catch (err) {
    console.error(err);
    showToast("Failed to create ticket. Please try again.", "error");
  } finally {
    setLoading(false);
  }
};

  const handleDiscard = () => {
    if (window.confirm("Discard all changes?")) {
      window.location.reload();
    }
  };

  const priorityOptions = priorities.map((p) => ({ value: p.id, label: p.name }));
  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  const selectedPriority = priorityOptions.find((o) => String(o.value) === String(form.priorityId));
  const selectedProduct = productOptions.find((o) => String(o.value) === String(form.productId));

  const pColor = (label = "") =>
    label.toLowerCase().includes("critical")
      ? "red"
      : label.toLowerCase().includes("high")
      ? "orange"
      : label.toLowerCase().includes("medium")
      ? "yellow"
      : "green";

  const priorityTableData = [
    {
      p: "P1",
      s: "Critical",
      color: "red",
      note: "The entire application or Critical Module cannot be operated, causing the Customer to be unable to continue work.",
    },
    {
      p: "P2",
      s: "High",
      color: "orange",
      note: "Important modules cannot be operated and no workaround is available.",
    },
    {
      p: "P3",
      s: "Medium",
      color: "yellow",
      note: "Features in the module cannot be operated but tasks can still be completed using a workaround.",
    },
    {
      p: "P4",
      s: "Low",
      color: "green",
      note: "Minor issue that does not impact functional modules or disrupt the customer's operational process.",
    },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: THEME.pageBg }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "rgba(215,58,48,0.07)" }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "rgba(135,41,36,0.05)" }}
        />
      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            key="t"
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div
        className="sticky top-[0px] z-20 w-full"
        style={{
          background: "rgba(221,221,221,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[1200px] mx-auto px-6 py-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: THEME.gradCss }}
              >
                <TicketIcon size={22} />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                  <span className="hover:text-slate-700 cursor-pointer transition-colors">Support</span>
                  <span>/</span>
                  <span className="hover:text-slate-700 cursor-pointer transition-colors">Tickets</span>
                  <span>/</span>
                  <span className="font-semibold text-slate-700">New</span>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 flex-wrap">
                  Create New Ticket
                  {ticketNumber && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: THEME.gradCss }}
                    >
                      #{ticketNumber}
                    </span>
                  )}
                </h1>

                <p className="text-sm text-slate-500 mt-0.5">
                  Fill in the details below to open a new support ticket
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleDiscard}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border bg-white text-slate-600 border-slate-200 transition-all active:scale-95"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                  e.currentTarget.style.color = "#b91c1c";
                  e.currentTarget.style.borderColor = "#fca5a5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#4b5563";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <XIcon size={14} /> Discard
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading || initLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: THEME.gradCss, boxShadow: `0 4px 14px ${THEME.accentRing}` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = THEME.gradCssHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = THEME.gradCss;
                }}
              >
                {loading ? (
                  <>
                    <SpinnerIcon /> Saving…
                  </>
                ) : (
                  <>
                    <CheckIcon size={14} /> Save Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="p-6">
        {initLoading && (
          <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-3 py-24 text-slate-500">
            <SpinnerIcon />
            <span className="text-sm font-medium">Loading form…</span>
          </div>
        )}

        {!initLoading && (
          <div className="max-w-[1200px] mx-auto space-y-5 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl px-6 py-5"
              style={{
                background: THEME.cardBg,
                backdropFilter: "blur(16px)",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <FieldLabel required>Subject</FieldLabel>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Enter a clear, descriptive ticket subject…"
                className="w-full px-4 py-3 text-base font-medium bg-white border rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:outline-none"
                style={{ borderColor: errors.subject ? "#fca5a5" : "#e5e7eb" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D73A30";
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(215,58,48,0.25)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.subject ? "#fca5a5" : "#e5e7eb";
                  e.currentTarget.style.boxShadow = errors.subject
                    ? "0 0 0 2px rgba(248,113,113,0.25)"
                    : "none";
                }}
              />
              {errors.subject && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertTriIcon /> {errors.subject}
                </p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionCard title="Customer Information" icon={<UserIcon size={15} />} delay={0.08}>
                <div>
                  <FieldLabel>Customer</FieldLabel>
                  <div className="relative" ref={customerRef}>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                      <SearchIcon size={14} />
                    </span>

<input
  type="text"
  disabled={isCustomer}
  value={
    customerSearch ||
    customers.find((c) => String(c.id) === String(form.partnerId))?.displayName ||
    ""
  }
  onChange={async (e) => {
    if (isCustomer) return;

    const value = e.target.value;
    setCustomerSearch(value);

    setForm((p) => ({
      ...p,
      partnerId: "",
      accountName: "",
      personName: "",
      email: "",
      productId: "",
    }));

    if (value.trim() === "") {
      setShowCustList(false);

      try {
        const allProductsRes = await axios.get("/api/dropdown/products", {
          withCredentials: true,
        });
        setProducts(allProductsRes.data ?? []);
      } catch (err) {
        console.error(err);
      }

      return;
    }

    searchCustomers(value);

    try {
      const allProductsRes = await axios.get("/api/dropdown/products", {
        withCredentials: true,
      });
      setProducts(allProductsRes.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }}
  onFocus={(e) => {
    onFocusRed(e);
    if (!isCustomer && customerSearch.trim() !== "") {
      searchCustomers(customerSearch);
      setShowCustList(true);
    }
  }}
  onBlur={onBlurClean}
  placeholder="Search customer…"
  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 transition-all focus:outline-none"
/>

                    <AnimatePresence>
                      {showCustList && customers.length > 0 && !form.partnerId && !isCustomer && (
                        <motion.ul
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-[999] mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-56 overflow-auto py-1"
                        >
                          {customers.map((c) => (
                            <li
                              key={c.id}
onClick={async () => {
  setForm((p) => ({
    ...p,
    partnerId: c.id,
    accountName: c.parentName || c.displayName || "",
    personName: "",
    email: "",
    productId: "",
  }));

  setCustomerSearch(c.displayName || "");
  setShowCustList(false);

  try {
    const res = await axios.get("/api/dropdown/products", {
      params: { partnerId: c.id },
      withCredentials: true,
    });

    setProducts(res.data ?? []);
  } catch (err) {
    console.error(err);
  }
}}
                              className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2.5 transition-colors hover:bg-slate-50"
                            >
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                                style={{ background: THEME.gradCss }}
                              >
                                {c.displayName?.[0]?.toUpperCase() || "C"}
                              </span>
                              <span className="text-slate-700">{c.displayName}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <FieldLabel>Account</FieldLabel>
                  <ReadOnlyField
                    value={
                      form.accountName ||
                      currentUser?.parentName ||
                      currentUser?.displayName ||
                      ""
                    }
                  />
                </div>

                <div>
                  <FieldLabel>Contact Name</FieldLabel>
<input
  type="text"
  name="personName"
  value={form.personName || ""}
  onChange={handleChange}
  placeholder="Full name"
  className={baseInput}
  onFocus={onFocusRed}
  onBlur={onBlurClean}
/>
                </div>

                <div>
                  <FieldLabel>Email Address</FieldLabel>
<input
  type="email"
  name="email"
  value={form.email || ""}
  onChange={handleChange}
  placeholder="contact@company.com"
  className={baseInput}
  onFocus={onFocusRed}
  onBlur={onBlurClean}
/>
                </div>
              </SectionCard>

              <SectionCard title="Ticket Details" icon={<TagIcon size={15} />} delay={0.14}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Ticket Number</FieldLabel>
                    <ReadOnlyField value={ticketNumber ? `#${ticketNumber}` : "Loading…"} mono />
                  </div>

                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-semibold text-emerald-700">Open</span>
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Channel</FieldLabel>
                  <ReadOnlyField value={isCustomer ? "Customer" : "Staff"} />
                </div>

                <SearchableDropdown
                  label="Priority"
                  placeholder="Select priority…"
                  value={form.priorityId}
                  displayValue={
                    selectedPriority ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            P_STYLE[pColor(selectedPriority.label)]?.dot
                          }`}
                        />
                        {selectedPriority.label}
                      </span>
                    ) : null
                  }
                  options={priorityOptions}
                  onSelect={(opt) => {
                    setForm((p) => ({ ...p, priorityId: opt.value }));
                    setErrors((p) => ({ ...p, priorityId: null }));
                  }}
                />

                <SearchableDropdown
                  label="Product"
                  placeholder="Select product…"
                  value={form.productId}
                  displayValue={selectedProduct?.label}
                  options={productOptions}
                  onSelect={(opt) => {
                    setForm((p) => ({
                      ...p,
                      productId: opt.value,
                    }));
                    setErrors((p) => ({
                      ...p,
                      productId: null,
                    }));
                  }}
                />

                {errors.priorityId && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriIcon /> {errors.priorityId}
                  </p>
                )}

                {errors.productId && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriIcon /> {errors.productId}
                  </p>
                )}
              </SectionCard>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="rounded-3xl"
              style={{
                background: THEME.cardBg,
                backdropFilter: "blur(16px)",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex border-b border-slate-200" style={{ background: "#fafafa" }}>
                {[
                  {
                    key: "description",
                    label: "Description",
                    iconD: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                  },
                  {
                    key: "casePriorities",
                    label: "Case Priorities",
                    iconD: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  },
                ].map(({ key, label, iconD }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px"
                    style={
                      activeTab === key
                        ? { borderColor: "#D73A30", color: "#D73A30", background: "#fff" }
                        : { borderColor: "transparent", color: "#6b7280" }
                    }
                  >
                    <SvgIcon size={14} d={iconD} />
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "description" && (
                <div className="p-6 space-y-4">
                  <input
                    type="file"
                    id="attachmentInput"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      if (f.size > 9 * 1024 * 1024) {
                        showToast("Max file size is 9MB", "error");
                        return;
                      }
                      setForm((p) => ({ ...p, attachment: f }));
                    }}
                  />

                  <label
                    htmlFor="attachmentInput"
                    className="flex items-center justify-between gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all"
                    style={{ borderColor: "#e5e7eb", background: "#fafafa" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(215,58,48,0.08)", color: "#D73A30" }}
                      >
                        <PaperclipIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          {form.attachment ? form.attachment.name : "Attach a file"}
                        </p>
                        <p className="text-xs text-slate-400">Max size: 9 MB</p>
                      </div>
                    </div>

                    {!form.attachment && (
                      <span
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: THEME.gradCss }}
                      >
                        Browse
                      </span>
                    )}
                  </label>

                  {form.attachment && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border"
                      style={{
                        background: "rgba(215,58,48,0.05)",
                        borderColor: "rgba(215,58,48,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2 text-sm min-w-0" style={{ color: "#D73A30" }}>
                        <PaperclipIcon size={14} />
                        <span className="truncate font-medium">{form.attachment.name}</span>
                        <span className="text-xs opacity-60 flex-shrink-0">
                          ({(form.attachment.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, attachment: null }))}
                        className="flex-shrink-0 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XIcon size={13} />
                      </button>
                    </motion.div>
                  )}

                  <RichEditor value={form.descriptionText} onChange={handleChange} />

                  {errors.descriptionText && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriIcon /> {errors.descriptionText}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "casePriorities" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200" style={{ background: "#fafafa" }}>
                        <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">
                          Level
                        </th>
                        <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">
                          Severity
                        </th>
                        <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {priorityTableData.map(({ p, s, color, note }) => {
                        const st = P_STYLE[color];
                        return (
                          <tr key={p} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black ${st.badge}`}>
                                {p}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {s}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 leading-relaxed">{note}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            <div className="pb-8" />
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateTicketPage;