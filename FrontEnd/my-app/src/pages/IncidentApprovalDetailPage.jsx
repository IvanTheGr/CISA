import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiInfo,
  FiMessageSquare,
  FiStar,
} from "react-icons/fi";
import {
  approveIncidentApi,
  downloadIncidentApprovalWordApi,
  fetchIncidentApprovalDetailApi,
} from "../api/incident_approval_api";

const safeValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const formatDateTime = (value) => {
  if (!value || value === "-") return "-";
  return String(value).replace("T", " ").substring(0, 19);
};

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

function ReadOnlyText({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <label className="text-sm font-bold text-slate-700">{label}</label>
      </div>
      <div className="px-4 py-4 text-sm text-slate-700 whitespace-pre-wrap min-h-[80px]">
        {safeValue(value)}
      </div>
    </div>
  );
}

function RatingStars({ rating }) {
  const value = Number(rating || 0);

  if (!value) {
    return (
      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
        N/A
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <FiStar
          key={index}
          className={
            index < value
              ? "text-amber-500 fill-amber-500"
              : "text-slate-300"
          }
        />
      ))}
      <span className="ml-2 text-sm font-bold text-slate-600">
        {value} / 5
      </span>
    </div>
  );
}

function ChatHistory({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <FiMessageSquare size={24} className="mx-auto mb-2" />
        <p className="text-sm font-semibold">Belum ada histori chat</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {messages.map((msg) => {
        const channel = msg.by || "-";
        const stateName = msg.state?.name || msg.stateName || "-";

        return (
          <div key={msg.id} className="p-5">
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
          </div>
        );
      })}
    </div>
  );
}

function IncidentApprovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidentApprovalDetailApi(id);
      setDetail(res.data);
    } catch (err) {
      console.error("Failed load incident approval detail", err);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await downloadIncidentApprovalWordApi(id);

      const contentDisposition = res.headers["content-disposition"];
      let filename = `Incident-Report-${detail?.ticketNumber || id}.docx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      downloadBlob(res.data, filename);
    } catch (err) {
      console.error("Failed download incident word", err);
      alert("Gagal download Incident Log Word");
    } finally {
      setDownloading(false);
    }
  };

  const handleApprove = async () => {
    const yes = window.confirm("Approve Incident Log ini?");
    if (!yes) return;

    try {
      setApproving(true);
      await approveIncidentApi(id);
      alert("Incident Log berhasil di-approve");
      await loadDetail();
    } catch (err) {
      console.error("Failed approve incident log", err);
      alert("Gagal approve Incident Log");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeded] p-6 text-slate-500">
        Loading approval detail...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#efeded] p-6">
        <button
          type="button"
          onClick={() => navigate("/ticket/approval")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 mb-4"
        >
          <FiArrowLeft />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-red-500">
          Detail approval tidak ditemukan.
        </div>
      </div>
    );
  }

  const incident = detail.incidentLog || {};
  const rating = detail.customerRating;
  const isApproved = String(incident.state || "").toLowerCase().includes("approve");

  return (
    <div className="min-h-screen bg-[#efeded] p-6">
      <div className="max-w-[1200px] mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/ticket/approval")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 mb-4"
            >
              <FiArrowLeft />
              Back to Approval
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center">
                <FiFileText />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Approve Incident Log
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {detail.ticketNumber} - {detail.subject || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold disabled:opacity-60"
            >
              <FiDownload />
              {downloading ? "Downloading..." : "Download Word"}
            </button>

            {!isApproved && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
              >
                <FiCheckCircle />
                {approving ? "Approving..." : "Approve"}
              </button>
            )}
          </div>
        </div>

        <SectionCard
          icon={FiStar}
          title="Penilaian Customer"
          subtitle="Rating dan feedback dari customer"
        >
          {!rating ? (
            <div className="p-6 text-sm text-slate-500">
              Belum ada penilaian dari customer.
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Rating
                </p>
                <RatingStars rating={rating.rating} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Customer
                </p>
                <p className="text-sm text-slate-700">
                  {rating.customerName || "-"}
                </p>
              </div>

              <ReadOnlyText label="Comment" value={rating.comment} />
              <ReadOnlyText
                label="Rating Date"
                value={formatDateTime(rating.createDate)}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={FiInfo}
          title="Informasi Ticket"
          subtitle="Detail ticket read-only"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="lg:border-r border-slate-100">
              <InfoRow label="Ticket Number" value={detail.ticketNumber} />
              <InfoRow label="Subject" value={detail.subject} />
              <InfoRow label="Company" value={detail.companyName} />
              <InfoRow label="Customer" value={detail.customerName} />
              <InfoRow label="Email" value={detail.email} />
              <InfoRow label="Channel" value={detail.channel} />
            </div>

            <div>
              <InfoRow label="Product" value={detail.productName} />
              <InfoRow label="Priority" value={detail.priorityName} />
              <InfoRow label="Assigned PIC" value={detail.assignedPic} />
              <InfoRow label="Status" value={detail.stateName} />
              <InfoRow label="Create Date" value={formatDateTime(detail.createDate || detail.createDateTime)} />
              <InfoRow label="Close Time" value={formatDateTime(detail.closeTime || detail.closeDate)} />
              <InfoRow label="Response Time" value={detail.responseTime} />
              <InfoRow label="Resolution Time" value={detail.resolutionTime} />
              <InfoRow label="Response To Close" value={detail.responseToClose} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={FiMessageSquare}
          title="Riwayat Percakapan"
          subtitle="Histori chat read-only"
        >
          <ChatHistory messages={detail.messages || []} />
        </SectionCard>

        <SectionCard
          icon={FiFileText}
          title="Incident Log"
          subtitle={`Approval Status: ${incident.state || "submit"}`}
        >
          <div className="p-5 grid grid-cols-1 gap-4">
            <ReadOnlyText label="Issue" value={incident.issue} />
            <ReadOnlyText label="Impact" value={incident.impact} />
            <ReadOnlyText label="Environment" value={incident.environment} />
            <ReadOnlyText label="Chronology" value={incident.chronology} />
            <ReadOnlyText label="Workaround" value={incident.workaround} />
            <ReadOnlyText label="Permanent Solution" value={incident.permanentSolution} />
            <ReadOnlyText label="Recommendation" value={incident.recommendation} />
            <ReadOnlyText label="Notes" value={incident.notes} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default IncidentApprovalDetailPage;