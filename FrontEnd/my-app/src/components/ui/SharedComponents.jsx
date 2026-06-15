import { useEffect } from "react";

/* ─── ICON PRIMITIVE ─────────────────────────────────────────── */
export const Icon = ({ d, size = 16, className = "", style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d={d} />
  </svg>
);

/* ─── ICON LIBRARY ───────────────────────────────────────────── */
export const Icons = {
  box: (
    <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />
  ),
  refresh: (
    <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" />
  ),
  search: <Icon d="M21 21l-4.35-4.35 M11 19A8 8 0 1011 3a8 8 0 000 16z" />,
  plus: <Icon d="M12 5v14 M5 12h14" />,
  edit: (
    <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  ),
  trash: <Icon d="M3 6h18 M19 6l-1 14H6L5 6 M8 6V4h8v2 M10 11v6 M14 11v6" />,
  eye: (
    <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" />
  ),
  check: <Icon d="M20 6L9 17l-5-5" />,
  x: <Icon d="M18 6L6 18M6 6l12 12" />,
  alert: (
    <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01" />
  ),
  inbox: (
    <Icon d="M22 12h-6l-2 3H10l-2-3H2 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  ),
  download: (
    <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" />
  ),
  filter: <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  users: (
    <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z" />
  ),
  layers: (
    <Icon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" />
  ),
  tag: (
    <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" />
  ),
  calendar: (
    <Icon d="M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
  ),
  chevronDown: <Icon d="M6 9l6 6 6-6" />,
  chevronRight: <Icon d="M9 18l6-6-6-6" />,
  hash: <Icon d="M4 9h16 M4 15h16 M10 3L8 21 M16 3l-2 18" />,
  info: <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2z M12 16v-4 M12 8h.01" />,
  print: (
    <Icon d="M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z" />
  ),
  shield: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  clock: <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2" />,
  star: (
    <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
};

/* ─── TOAST ──────────────────────────────────────────────────── */
export const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const ok = type === "success";
  return (
    <div
      className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium animate-fade-in"
      style={
        ok
          ? {
              background: "#f0fdf4",
              border: "1px solid #86efac",
              color: "#15803d",
            }
          : {
              background: "#fff5f5",
              border: "1px solid #fca5a5",
              color: "#D73A30",
            }
      }
    >
      {ok ? Icons.check : Icons.x}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition"
      >
        {Icons.x}
      </button>
    </div>
  );
};

/* ─── LOADING SKELETON ───────────────────────────────────────── */
export const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-red-50">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <td key={i} className="px-4 py-3">
        <div
          className="h-3 rounded-full"
          style={{ background: "#fce8e8", width: `${40 + i * 10}%` }}
        />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 space-y-4 animate-pulse border border-red-50 shadow-sm">
    <div
      className="h-1 w-full rounded-full"
      style={{ background: "#fcd5d3" }}
    />
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded" style={{ background: "#fcd5d3" }} />
        <div className="h-5 w-44 rounded" style={{ background: "#fcd5d3" }} />
      </div>
      <div className="w-10 h-10 rounded-xl" style={{ background: "#fff5f5" }} />
    </div>
    <div className="h-3 w-full rounded" style={{ background: "#fff5f5" }} />
    <div className="h-3 w-3/4 rounded" style={{ background: "#fff5f5" }} />
  </div>
);

/* ─── EMPTY STATE ────────────────────────────────────────────── */
export const EmptyState = ({
  title = "No data found",
  subtitle = "Nothing to display here yet.",
  icon = "inbox",
  onAction,
  actionLabel,
}) => {
  const iconEl = Icons[icon] || Icons.inbox;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "#fff5f5",
          border: "1px solid #fcd5d3",
          color: "#D73A30",
        }}
      >
        {iconEl}
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-700">{title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(90deg, #D73A30, #872924)",
            boxShadow: "0 4px 12px rgba(215,58,48,0.25)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/* ─── STATUS BADGE ───────────────────────────────────────────── */
export const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const styles = {
    active: {
      bg: "#dcfce7",
      border: "#86efac",
      color: "#15803d",
      dot: "#22c55e",
    },
    inactive: {
      bg: "#fee2e2",
      border: "#fca5a5",
      color: "#dc2626",
      dot: "#ef4444",
    },
    expired: {
      bg: "#fef9c3",
      border: "#fde047",
      color: "#854d0e",
      dot: "#eab308",
    },
    success: {
      bg: "#dcfce7",
      border: "#86efac",
      color: "#15803d",
      dot: "#22c55e",
    },
    pending: {
      bg: "#fef9c3",
      border: "#fde047",
      color: "#854d0e",
      dot: "#eab308",
    },
    default: {
      bg: "#f1f5f9",
      border: "#cbd5e1",
      color: "#475569",
      dot: "#94a3b8",
    },
  };
  const c = styles[s] || styles.default;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: c.dot }}
      />
      {status || "—"}
    </span>
  );
};

/* ─── HEADER SECTION ─────────────────────────────────────────── */
export const HeaderSection = ({
  title,
  subtitle,
  icon,
  breadcrumb = [],
  actions = [],
  stats = [],
}) => (
  <div
    className="bg-white rounded-2xl overflow-hidden shadow-sm"
    style={{ border: "1px solid #f3e8e8" }}
  >
    <div
      className="h-1 w-full"
      style={{
        background: "linear-gradient(90deg, #D73A30, #872924, #D73A30)",
      }}
    />
    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #D73A30, #872924)",
            boxShadow: "0 4px 12px rgba(215,58,48,0.3)",
          }}
        >
          {icon}
        </div>
        <div>
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  <span
                    className={
                      i === breadcrumb.length - 1
                        ? "font-semibold text-red-700"
                        : ""
                    }
                  >
                    {b}
                  </span>
                </span>
              ))}
            </div>
          )}
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {stats.map((s, i) => (
          <div
            key={i}
            className="px-4 py-2 rounded-xl text-center min-w-[72px]"
            style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}
          >
            <p className="text-xl font-bold" style={{ color: "#D73A30" }}>
              {s.value}
            </p>
            <p className="text-xs font-medium" style={{ color: "#872924" }}>
              {s.label}
            </p>
          </div>
        ))}
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            disabled={a.disabled}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${a.variant === "outline" ? "" : "text-white shadow-md hover:shadow-lg"}`}
            style={
              a.variant === "outline"
                ? {
                    border: "1.5px solid #D73A30",
                    color: "#D73A30",
                    background: "white",
                  }
                : {
                    background: "linear-gradient(90deg, #D73A30, #872924)",
                    boxShadow: "0 4px 12px rgba(215,58,48,0.25)",
                  }
            }
          >
            {a.icon && <span>{a.icon}</span>}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ─── FILTER BAR ─────────────────────────────────────────────── */
export const FilterBar = ({
  search,
  onSearch,
  placeholder = "Search...",
  filters = [],
  onApply,
  onReset,
  children,
}) => (
  <div
    className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3"
    style={{ border: "1px solid #f3e8e8" }}
  >
    <div className="relative flex-1 min-w-48">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#D73A30", opacity: 0.6 }}
      >
        {Icons.search}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white text-slate-700 placeholder-slate-400 outline-none transition"
        style={{ border: "1.5px solid #fcd5d3" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#D73A30";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(215,58,48,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#fcd5d3";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {search && (
        <button
          onClick={() => onSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
          style={{ color: "#D73A30" }}
        >
          {Icons.x}
        </button>
      )}
    </div>
    {filters.map((f, i) => (
      <select
        key={i}
        value={f.value}
        onChange={(e) => f.onChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-lg outline-none transition cursor-pointer"
        style={{
          border: "1.5px solid #fcd5d3",
          color: "#872924",
          background: "white",
        }}
      >
        {f.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ))}
    {children}
    {onReset && (
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-red-50"
        style={{ color: "#D73A30", border: "1.5px solid #fcd5d3" }}
      >
        Reset
      </button>
    )}
    {onApply && (
      <button
        onClick={onApply}
        className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-md"
        style={{ background: "linear-gradient(90deg, #D73A30, #872924)" }}
      >
        Apply
      </button>
    )}
  </div>
);

/* ─── DATA TABLE ─────────────────────────────────────────────── */
export const DataTable = ({
  columns,
  data,
  loading,
  rowsCount,
  keyField = "id",
  onEdit,
  onDelete,
  onView,
  extraActions,
}) => (
  <div
    className="bg-white rounded-2xl overflow-hidden shadow-sm"
    style={{ border: "1px solid #f3e8e8" }}
  >
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{ background: "linear-gradient(90deg, #8B1A15, #B71C1C)" }}
          >
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                style={col.style || {}}
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || onView || extraActions) && (
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1}>
                <EmptyState
                  title="No records found"
                  subtitle="Try adjusting your search or filters."
                />
              </td>
            </tr>
          )}
          {!loading &&
            data.map((row, ri) => (
              <tr
                key={row[keyField] || ri}
                className="border-b transition-colors duration-150 cursor-default"
                style={{
                  borderColor: "#fdf2f2",
                  background: ri % 2 === 0 ? "white" : "#fffafa",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    ri % 2 === 0 ? "white" : "#fffafa";
                }}
              >
                {columns.map((col, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 text-slate-700"
                    style={col.cellStyle || {}}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? "—")}
                  </td>
                ))}
                {(onEdit || onDelete || onView || extraActions) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          title="View"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: "#f0f9ff",
                            border: "1px solid #bae6fd",
                            color: "#0369a1",
                          }}
                        >
                          <Icon
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"
                            size={13}
                          />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          title="Edit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: "#fff5f5",
                            border: "1px solid #fcd5d3",
                            color: "#D73A30",
                          }}
                        >
                          <Icon
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            size={13}
                          />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          title="Delete"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: "#fff5f5",
                            border: "1px solid #fcd5d3",
                            color: "#D73A30",
                          }}
                        >
                          <Icon
                            d="M3 6h18 M19 6l-1 14H6L5 6 M8 6V4h8v2 M10 11v6 M14 11v6"
                            size={13}
                          />
                        </button>
                      )}
                      {extraActions && extraActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    {rowsCount !== undefined && (
      <div
        className="px-4 py-3 flex items-center justify-between text-xs text-slate-400 border-t"
        style={{ borderColor: "#fdf2f2" }}
      >
        <span>
          Showing {data.length} of {rowsCount} entries
        </span>
      </div>
    )}
  </div>
);

/* ─── MODAL ──────────────────────────────────────────────────── */
export const Modal = ({
  open,
  title,
  onClose,
  children,
  width = "max-w-lg",
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${width} overflow-hidden flex flex-col`}
        style={{ border: "1px solid #fcd5d3" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: "linear-gradient(90deg, #8B1A15, #B71C1C)" }}
        >
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <Icon d="M18 6L6 18M6 6l12 12" size={16} />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

/* ─── FORM FIELD ─────────────────────────────────────────────── */
export const FormField = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

export const FormInput = ({
  placeholder,
  value,
  onChange,
  disabled,
  readOnly,
  type = "text",
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    readOnly={readOnly}
    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition"
    style={{
      border: "1.5px solid #fcd5d3",
      background: readOnly || disabled ? "#fff9f9" : "white",
      color: "#374151",
    }}
    onFocus={(e) => {
      if (!readOnly && !disabled) {
        e.currentTarget.style.borderColor = "#D73A30";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(215,58,48,0.1)";
      }
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#fcd5d3";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
);

export const FormTextarea = ({ placeholder, value, onChange, rows = 3 }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition resize-none"
    style={{ border: "1.5px solid #fcd5d3", color: "#374151" }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#D73A30";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(215,58,48,0.1)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#fcd5d3";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
);

export const PrimaryBtn = ({
  onClick,
  disabled,
  children,
  type = "button",
  variant = "solid",
  size = "md",
}) => {
  const sizeClass =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  if (variant === "ghost")
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 ${sizeClass} font-semibold rounded-xl transition-all hover:bg-red-50 disabled:opacity-60`}
        style={{ color: "#D73A30", border: "1.5px solid #fcd5d3" }}
      >
        {children}
      </button>
    );
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 ${sizeClass} font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed`}
      style={{
        background: "linear-gradient(90deg, #D73A30, #872924)",
        boxShadow: "0 4px 12px rgba(215,58,48,0.25)",
      }}
    >
      {children}
    </button>
  );
};
