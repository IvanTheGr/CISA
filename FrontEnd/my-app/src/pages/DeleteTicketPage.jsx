import { useState, useRef } from "react";
import {
  fetchTicketByNumber,
  fetchMessagesByTicketNumber,
} from "../api/ticket_api";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi";
import SearchBar from "../components/SearchBar";
import toast, { Toaster } from "react-hot-toast";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    const pad = (n, z = 2) => String(n).padStart(z, "0");
    return (
      date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " +
      pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) + "." +
      pad(date.getMilliseconds(), 3)
    );
  } catch {
    return value;
  }
};

/* ─────────────────────────────────────────────
   DETAIL ROW
───────────────────────────────────────────── */
const DetailRow = ({ label, value, icon }) => (
  <div className="rounded-xl px-4 py-3 transition-all duration-150 hover:scale-[1.01]"
    style={{ background: "#ffffff", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5" style={{ color: "#872924" }}>
      {icon && <span className="opacity-60">{icon}</span>}
      {label}
    </p>
    <p className="text-sm font-medium text-slate-800 truncate">{value || "—"}</p>
  </div>
);

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #fcd5d3" }}>
    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#fcd5d3", background: "#fff5f5" }}>
      <div className="space-y-2">
        <div className="h-4 w-36 bg-red-100 rounded-lg animate-pulse" />
        <div className="h-3 w-24 bg-red-50 rounded animate-pulse" />
      </div>
      <div className="h-6 w-20 bg-red-100 rounded-full animate-pulse" />
    </div>
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl" style={{ background: "#fff5f5" }} />
      ))}
    </div>
    <div className="px-6 pb-6 space-y-3 animate-pulse">
      <div className="h-12 rounded-xl" style={{ background: "#fff5f5" }} />
      <div className="h-12 rounded-xl bg-red-50" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    open: { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
    closed: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
    pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    resolved: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  };
  const style = map[(status || "").toLowerCase()] || { bg: "#fff5f5", color: "#D73A30", border: "#fca5a5" };
  return (
    <span className="text-[10px] px-3 py-1 font-bold rounded-full uppercase tracking-wider"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
      {status || "—"}
    </span>
  );
};

/* ─────────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────────── */
const ConfirmModal = ({ open, onCancel, onConfirm, deleting }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      >
        <motion.div
          initial={{ scale: 0.92, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 24 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "#fcd5d3" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fff5f5" }}>
                <FiTrash2 size={18} style={{ color: "#D73A30" }} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Confirm Deletion</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
              <FiX size={16} />
            </button>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#fff5f5", border: "1px solid #fca5a5" }}>
              <FiAlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "#D73A30" }} />
              <p className="text-xs leading-relaxed" style={{ color: "#7f1d1d" }}>
                You are about to <strong>permanently delete</strong> this ticket and all associated data.
                Once deleted, this cannot be recovered.
              </p>
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              style={{ borderColor: "#e2e8f0" }}>
              Cancel
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(90deg, #D73A30, #872924)" }}>
              {deleting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiTrash2 size={14} />
              )}
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function DeleteTicketPage() {
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketList] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messages, setMessages] = useState([]);
  const resultRef = useRef(null);

  const loadTicketData = async () => {
    const number = String(ticketId || "").trim();
    if (!number) return;

    try {
      setLoading(true);
      setError("");

      const ticketRes = await fetchTicketByNumber(number);
      setTicketData(ticketRes.data);

      try {
        const msgRes = await fetchMessagesByTicketNumber(number);
        setMessages(msgRes.data || []);
      } catch (msgErr) {
        console.warn("Messages not found / failed", msgErr);
        setMessages([]);
      }

      toast.success("Ticket loaded");

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      console.error(err);
      setError("Ticket not found.");
      setTicketData(null);
      toast.error("Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!ticketData?.id) return;
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/ticket/${ticketData.id}`, { withCredentials: true });
      toast.success("Ticket deleted successfully.");
      setTicketData(null);
      setTicketId("");
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete the ticket.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex justify-center items-start" style={{ background: "#DDDDDD" }}>
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(215,58,48,0.15)",
          },
        }}
      />

      <div className="w-full max-w-2xl space-y-5">
        {/* PAGE HEADER */}
        <div className="flex items-center gap-4 pt-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #D73A30, #872924)" }}>
            <FiTrash2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Delete Ticket</h1>
            <p className="text-sm text-slate-400 mt-0.5">Search and permanently remove a support ticket</p>
          </div>
        </div>

        {/* SEARCH CARD */}
        <div className="bg-white rounded-2xl shadow-sm overflow-visible relative z-20" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: "#df4b43", background: "#ffffff" }}>
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#872924" }}>Search Ticket</h2>
          </div>
          <div className="p-6">
            <SearchBar value={ticketId} onChange={setTicketId} onSearch={loadTicketData} tickets={ticketList} />
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: "#ffffff", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", color: "#D73A30" }}
                >
                  <FiAlertTriangle size={15} className="shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div ref={resultRef}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SkeletonCard />
              </motion.div>
            )}

            {!loading && ticketData && (
              <motion.div
                key="ticket"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", damping: 24, stiffness: 260 }}
                className="bg-white rounded-xl overflow-hidden"
                style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                {/* Card header */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #c5594b", background: "#ffffff" }}>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: "#1F2937" }}>{ticketData.ticketNumber}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>ID: {ticketData.id}</p>
                  </div>
                  <StatusBadge status={ticketData.stateName} />
                </div>

                {/* Fields */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailRow label="Subject" value={ticketData.subject} />
                  <DetailRow label="Partner" value={ticketData.partner?.name || ticketData.partnerName} />
                  <DetailRow label="Priority" value={ticketData.priority?.name || ticketData.priorityName} />
                  <DetailRow label="Product" value={ticketData.product?.name || ticketData.productName} />
                  <DetailRow label="Channel" value={ticketData.channel} />
                  <DetailRow label="Created By" value={ticketData.picName || ticketData.assignedPic} />
                  <DetailRow label="Created At" value={formatDateTime(ticketData.createDateTime)} />
                  <DetailRow label="Description" value={ticketData.descriptionText} />
                </div>

                {/* Warning + action */}
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <FiAlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      This action is <strong>permanent and irreversible</strong>. All data associated with this ticket will be lost.
                    </p>
                  </div>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(90deg, #D73A30, #872924)",
                      boxShadow: "0 6px 20px rgba(215,58,48,0.3)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 10px 28px rgba(215,58,48,0.45)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(215,58,48,0.3)"}
                  >
                    {deleting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                    {deleting ? "Deleting…" : "DELETE PERMANENTLY"}
                  </button>
                </div>
              </motion.div>
            )}

            {!loading && !ticketData && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-lg border-dashed p-14 text-center"
                style={{ border: "2px dashed #fcd5d3" }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#fff5f5" }}>
                  🔍
                </div>
                <p className="text-slate-500 font-semibold text-sm">No ticket selected</p>
                <p className="text-slate-400 text-xs mt-1">Enter a Ticket Number above to get started</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal open={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={handleDeleteConfirmed} deleting={deleting} />
    </div>
  );
}