import { useState } from "react";
import { FiSave, FiMessageSquare } from "react-icons/fi";

/* ===== TIME HELPERS ===== */

/**
 * Parse string/date ke object Date tanpa mengandalkan parsing browser yang aneh.
 * Support format:
 * - YYYY-MM-DD HH:mm:ss
 * - YYYY-MM-DD HH:mm:ss.SSS
 * - YYYY-MM-DDTHH:mm:ss
 * - YYYY-MM-DDTHH:mm:ss.SSS
 */
const parseFlexibleDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  const s = String(val).trim().replace("T", " ");
  const match = s.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/
  );

  if (!match) {
    const fallback = new Date(val);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, y, mo, d, h, mi, se, ms = "0"] = match;

  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(se),
    Number(ms.padEnd(3, "0"))
  );
};

const pad = (n, z = 2) => String(n).padStart(z, "0");

/**
 * Format date jadi text input:
 * YYYY-MM-DD HH:mm:ss.SSS
 */
const formatTextDate = (val) => {
  if (!val) return "";
  try {
    const d = parseFlexibleDate(val);
    if (!d) return "";

    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds()) +
      "." +
      pad(d.getMilliseconds(), 3)
    );
  } catch {
    return "";
  }
};

/**
 * DB/backend dianggap simpan jam "London / GMT".
 * Untuk ditampilkan ke user Jakarta:
 * tampil = db + 7 jam
 */
const backendToJakartaText = (val) => {
  if (!val) return "";
  const d = parseFlexibleDate(val);
  if (!d) return "";
  const jakarta = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return formatTextDate(jakarta);
};

/**
 * User input di frontend dianggap jam Jakarta.
 * Saat kirim ke backend:
 * backend = jakarta - 7 jam
 * hasil format: YYYY-MM-DDTHH:mm:ss.SSS
 */
const jakartaInputToBackendValue = (val) => {
  if (!val) return null;

  const jakartaDate = parseFlexibleDate(val);
  if (!jakartaDate) return null;

  const backendDate = new Date(jakartaDate.getTime() - 7 * 60 * 60 * 1000);

  return (
    backendDate.getFullYear() +
    "-" +
    pad(backendDate.getMonth() + 1) +
    "-" +
    pad(backendDate.getDate()) +
    "T" +
    pad(backendDate.getHours()) +
    ":" +
    pad(backendDate.getMinutes()) +
    ":" +
    pad(backendDate.getSeconds()) +
    "." +
    pad(backendDate.getMilliseconds(), 3)
  );
};

const TicketMessageTable = ({ messages = [], onSaveMessage }) => {
  const [editedRows, setEditedRows] = useState({});

  const handleChange = (id, field, value) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const isRowDirty = (msg) => {
    const edited = editedRows[msg.id];
    if (!edited) return false;

    if (
      edited.createDate !== undefined &&
      edited.createDate !== backendToJakartaText(msg.createDate)
    ) {
      return true;
    }

    if (edited.content !== undefined && edited.content !== msg.content) return true;
    if (edited.responseTime !== undefined && edited.responseTime !== msg.responseTime) return true;
    if (edited.resolutionTime !== undefined && edited.resolutionTime !== msg.resolutionTime) return true;

    return false;
  };

  const handleSave = (msg) => {
    const edited = editedRows[msg.id];
    if (!edited || !onSaveMessage) return;

    const convertedCreateDate =
      edited.createDate !== undefined
        ? jakartaInputToBackendValue(edited.createDate)
        : msg.createDate;

    if (edited.createDate !== undefined && !convertedCreateDate) {
      alert("Format create date tidak valid. Gunakan format: YYYY-MM-DD HH:mm:ss.SSS");
      return;
    }

    const payload = {
      createDate: convertedCreateDate,
      content: edited.content ?? msg.content,
      responseTime: edited.responseTime ?? msg.responseTime,
      resolutionTime: edited.resolutionTime ?? msg.resolutionTime,
    };

    onSaveMessage(msg.id, payload);

    setEditedRows((prev) => {
      const copy = { ...prev };
      delete copy[msg.id];
      return copy;
    });
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white flex-shrink-0"
          style={{ background: "#F05454" }}
        >
          <FiMessageSquare size={15} />
        </div>
        <h2 className="text-base font-semibold" style={{ color: "#1F2937" }}>
          Ticket Messages
        </h2>
        <span
          className="ml-auto text-xs font-medium px-2 py-1 rounded-md flex-shrink-0"
          style={{ background: "#F3F4F6", color: "#6B7280" }}
        >
          {messages.length} records
        </span>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table
          style={{
            width: "100%",
            minWidth: "560px",
            fontSize: "13px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "linear-gradient(90deg, #D73A30, #872924)" }}>
              {[
                "ID",
                "Status",
                "By Channel",
                "Create Date (Jakarta)",
                "Content",
                "Response Time",
                "Resolution Time",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "48px 16px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      color: "#94a3b8",
                    }}
                  >
                    <FiMessageSquare size={28} style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: "13px", margin: 0 }}>No messages found</p>
                  </div>
                </td>
              </tr>
            ) : (
              messages.map((m, index) => {
                const edited = editedRows[m.id] || {};
                const dirty = isRowDirty(m);

                return (
                  <tr
                    key={`${m.id}-${index}`}
                    style={{
                      borderBottom: "1px solid #fef2f2",
                      background: index % 2 === 0 ? "white" : "#fffbfb",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff8f8")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = index % 2 === 0 ? "white" : "#fffbfb")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#D73A30",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.id}
                    </td>

                    <td
                      style={{
                        padding: "10px 12px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#000000",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.state?.name ?? "-"}
                    </td>

                    <td
                      style={{
                        padding: "10px 12px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#000000",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.by ?? "-"}
                    </td>

                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD HH:mm:ss.SSS"
                        value={edited.createDate ?? backendToJakartaText(m.createDate)}
                        onChange={(e) => handleChange(m.id, "createDate", e.target.value)}
                        style={{
                          width: "100%",
                          minWidth: "160px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          border: "1px solid #fcd5d3",
                          background: "white",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(215,58,48,0.25)")}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                      />
                    </td>

                    <td
                      style={{
                        padding: "10px 12px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#000000",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.content?.replace(/<[^>]*>/g, "")}
                    </td>

                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        step="0.0001"
                        value={edited.responseTime ?? m.responseTime ?? ""}
                        onChange={(e) =>
                          handleChange(
                            m.id,
                            "responseTime",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        style={{
                          width: "100%",
                          minWidth: "80px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          border: "1px solid #fcd5d3",
                          background: "white",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(215,58,48,0.25)")}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                      />
                    </td>

                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        step="0.0001"
                        value={edited.resolutionTime ?? m.resolutionTime ?? ""}
                        onChange={(e) =>
                          handleChange(
                            m.id,
                            "resolutionTime",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        style={{
                          width: "100%",
                          minWidth: "80px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          border: "1px solid #fcd5d3",
                          background: "white",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(215,58,48,0.25)")}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                      />
                    </td>

                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <button
                        disabled={!dirty}
                        onClick={() => handleSave(m)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "8px",
                          border: "none",
                          cursor: dirty ? "pointer" : "not-allowed",
                          color: "white",
                          background: dirty
                            ? "linear-gradient(90deg, #D73A30, #872924)"
                            : "#94a3b8",
                          opacity: dirty ? 1 : 0.6,
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <FiSave size={11} /> Save
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketMessageTable;