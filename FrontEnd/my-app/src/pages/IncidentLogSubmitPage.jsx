import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiSave,
  FiMessageSquare,
  FiInfo,
} from "react-icons/fi";
import axios from "axios";
import {
  fetchTicketDetailApi,
  submitIncidentLogAndDownloadApi,
} from "../api/grouped_ticket_api";

const API_BASE_URL = "/api";

const REQUIRED_FIELDS = [
  { key: "issue", label: "Issue" },
  { key: "impact", label: "Impact" },
  { key: "environment", label: "Environment" },
  { key: "chronology", label: "Chronology" },
  { key: "workaround", label: "Workaround" },
  { key: "permanentSolution", label: "Permanent Solution" },
  { key: "recommendation", label: "Recommendation" },
  { key: "notes", label: "Notes" },
];

const safeValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const formatDateTime = (value) => {
  if (!value || value === "-") return "-";

  try {
    return String(value).replace("T", " ").substring(0, 23);
  } catch {
    return value;
  }
};

const getTicketCompany = (ticket) => {
  return (
    ticket?.companyName ||
    ticket?.company ||
    ticket?.partnerName ||
    ticket?.partner?.parent?.name ||
    ticket?.partner?.name ||
    "-"
  );
};

const getTicketCustomer = (ticket) => {
  return (
    ticket?.customerName ||
    ticket?.personName ||
    ticket?.customer ||
    ticket?.partner?.name ||
    "-"
  );
};

const getTicketProduct = (ticket) => {
  return ticket?.productName || ticket?.product || ticket?.product?.name || "-";
};

const getTicketPriority = (ticket) => {
  return ticket?.priorityName || ticket?.priority || ticket?.priority?.name || "-";
};

const getTicketPic = (ticket) => {
  return (
    ticket?.picName ||
    ticket?.assignedPic ||
    ticket?.assignedPicName ||
    ticket?.user?.partner?.name ||
    "-"
  );
};

const getTicketState = (ticket) => {
  return ticket?.stateName || ticket?.state || ticket?.state?.name || "-";
};

function Field({ label, value, onChange, error }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <label className="text-sm font-bold text-slate-700">
          {label} <span className="text-red-500">*</span>
        </label>
      </div>

      <textarea
        rows={4}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 text-sm outline-none resize-y ${
          error ? "border-red-300 bg-red-50" : ""
        }`}
        placeholder={`Isi ${label}...`}
      />

      {error && (
        <div className="px-4 pb-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] border-b border-slate-100 last:border-b-0">
      <div className="px-4 py-3 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="px-4 py-3 text-sm text-slate-700 break-words">
        {safeValue(value)}
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Icon />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

function ChatHistory({ messages, loading }) {
  if (loading) {
    return (
      <div className="p-5 text-sm text-slate-500">
        Loading chat history...
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
          <FiMessageSquare size={22} />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Belum ada histori chat
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {messages.map((msg) => {
        const channel = msg.by || msg.channel || "-";
        const stateName = msg.state?.name || msg.stateName || msg.state || "-";

        return (
          <div key={msg.id} className="p-5 hover:bg-slate-50 transition">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                ID: {msg.id}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                {channel}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                {stateName}
              </span>

              <span className="text-xs text-slate-400">
                {formatDateTime(msg.createDate)}
              </span>
            </div>

            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white border border-slate-100 rounded-xl px-4 py-3">
              {msg.content || "-"}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                Response Time: {msg.responseTime ?? 0}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                Resolution Time: {msg.resolutionTime ?? 0}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncidentLogSubmitPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [form, setForm] = useState({
    issue: "",
    impact: "",
    environment: "",
    chronology: "",
    workaround: "",
    permanentSolution: "",
    recommendation: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ticketTitle = useMemo(() => {
    if (!ticket) return "Incident Log";
    return `${ticket.ticketNumber || id} - ${ticket.subject || "-"}`;
  }, [ticket, id]);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoadingTicket(true);
        const res = await fetchTicketDetailApi(id);
        setTicket(res.data);
      } catch (err) {
        console.error("Failed load ticket detail", err);
      } finally {
        setLoadingTicket(false);
      }
    };

    loadTicket();
  }, [id]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!ticket) return;

      try {
        setLoadingMessages(true);

        let res;

        if (ticket.ticketNumber) {
          res = await axios.get(`${API_BASE_URL}/message/by-number`, {
            params: { ticketNumber: ticket.ticketNumber },
            withCredentials: true,
          });
        } else {
          res = await axios.get(`${API_BASE_URL}/message/by-ticket-id`, {
            params: { id },
            withCredentials: true,
          });
        }

        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed load ticket messages", err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [ticket, id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field.key] || "").trim()) {
        nextErrors[field.key] = `${field.label} wajib diisi`;
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const res = await submitIncidentLogAndDownloadApi(id, form);

      const contentDisposition = res.headers["content-disposition"];
      let filename = `Incident-Report-${ticket?.ticketNumber || id}.docx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      downloadBlob(res.data, filename);

      navigate("/ticket/history");
    } catch (err) {
      console.error("Failed submit incident log", err);
      alert("Submit incident log gagal. Pastikan semua field wajib sudah diisi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTicket) {
    return <div className="p-6 text-slate-500">Loading ticket...</div>;
  }

  return (
    <div className="min-h-screen bg-[#efeded] p-6">
      <div className="max-w-[1200px] mx-auto space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <button
            type="button"
            onClick={() => navigate(`/ticket/grouped/${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 mb-4"
          >
            <FiArrowLeft />
            Back to Ticket
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center">
              <FiFileText />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Submit Incident Log
              </h1>
              <p className="text-sm text-slate-500 mt-1">{ticketTitle}</p>
            </div>
          </div>
        </div>

        {/* ALERT */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
          Ticket sudah di-close. Staff wajib mengisi Incident Log sebelum proses selesai.
        </div>

        {/* INFORMASI TICKET */}
        <SectionCard
          icon={FiInfo}
          title="Informasi Ticket"
          subtitle="Data ticket sebagai referensi sebelum mengisi incident log"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="lg:border-r border-slate-100">
              <InfoRow label="Ticket Number" value={ticket?.ticketNumber || id} />
              <InfoRow label="Subject" value={ticket?.subject} />
              <InfoRow label="Company" value={getTicketCompany(ticket)} />
              <InfoRow label="Customer" value={getTicketCustomer(ticket)} />
              <InfoRow label="Email" value={ticket?.email} />
            </div>

            <div>
              <InfoRow label="Product" value={getTicketProduct(ticket)} />
              <InfoRow label="Priority" value={getTicketPriority(ticket)} />
              <InfoRow label="Assigned PIC" value={getTicketPic(ticket)} />
              <InfoRow label="Status" value={getTicketState(ticket)} />
              <InfoRow
                label="Create Date"
                value={formatDateTime(ticket?.createDate || ticket?.createDateTime)}
              />
              <InfoRow
                label="Close Time"
                value={formatDateTime(ticket?.closeTime || ticket?.closeDate)}
              />
            </div>
          </div>
        </SectionCard>

        {/* HISTORI CHAT */}
        <SectionCard
          icon={FiMessageSquare}
          title="Histori Chat"
          subtitle="Riwayat percakapan ticket, hanya dapat dibaca"
        >
          <ChatHistory messages={messages} loading={loadingMessages} />
        </SectionCard>

        {/* FORM INCIDENT LOG */}
        <SectionCard
          icon={FiFileText}
          title="Form Incident Log"
          subtitle="Isi seluruh field wajib sebelum submit dan download Word"
        >
          <div className="p-5 grid grid-cols-1 gap-4">
            {REQUIRED_FIELDS.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                value={form[field.key]}
                error={errors[field.key]}
                onChange={(value) => handleChange(field.key, value)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SUBMIT BUTTON */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60"
          >
            {submitting ? (
              <>
                <FiSave />
                Submitting...
              </>
            ) : (
              <>
                <FiDownload />
                Submit & Download Word
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncidentLogSubmitPage;