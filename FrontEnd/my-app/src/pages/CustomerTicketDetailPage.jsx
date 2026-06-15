import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiClock,
  FiMessageSquare,
  FiSend,
  FiPaperclip,
  FiCheckCircle,
} from "react-icons/fi";

const API_BASE_URL = "/api";

function formatDateTime(value) {
  if (!value || value === "-") return "-";
  return String(value).replace("T", " ");
}

function normalizeAttachmentUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

function badgeColor(state) {
  const s = (state || "").toLowerCase();

  if (s.includes("closed")) return "bg-emerald-100 text-emerald-700";
  if (s.includes("customer replied")) return "bg-amber-100 text-amber-700";
  if (s.includes("manager replied")) return "bg-violet-100 text-violet-700";
  if (s.includes("staff replied")) return "bg-sky-100 text-sky-700";
  if (s.includes("open")) return "bg-slate-100 text-slate-700";

  return "bg-slate-100 text-slate-700";
}

function channelBadge(channel) {
  const c = (channel || "").toLowerCase();

  if (c.includes("customer")) return "bg-amber-100 text-amber-700";
  if (c.includes("staff")) return "bg-sky-100 text-sky-700";
  if (c.includes("manager")) return "bg-violet-100 text-violet-700";

  return "bg-slate-100 text-slate-700";
}

function MessageBubble({ msg }) {
  const by = (msg.by || "").toLowerCase();
  const isCustomer = by === "customer";
  const isManager = by === "manager";

  const wrapperClass = isCustomer ? "justify-end" : "justify-start";
  const bubbleClass = isCustomer
    ? "bg-[#9f3527] text-white"
    : isManager
    ? "bg-violet-600 text-white"
    : "bg-white border border-slate-200 text-slate-700";

  const attachments = msg.attachments || [];

  return (
    <div className={`flex ${wrapperClass}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${bubbleClass}`}>
        <div className="flex items-center gap-2 mb-2 text-xs opacity-90">
          <span className="font-semibold">{msg.by || "-"}</span>
          <span>•</span>
          <span>{formatDateTime(msg.createDate)}</span>
        </div>

        {msg.content?.replace(/<[^>]*>/g, "") && (
          <div className="text-sm whitespace-pre-wrap break-words mb-3">
            {msg.content.replace(/<[^>]*>/g, "")}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-3">
            {attachments.map((file) => {
              const fileUrl = normalizeAttachmentUrl(file.url);
              const isImage =
                file.contentType?.startsWith("image/") ||
                /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.fileName || "");

              if (isImage) {
                return (
                  <div key={file.id} className="rounded-2xl overflow-hidden bg-white/10">
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      <img
                        src={fileUrl}
                        alt={file.fileName}
                        className="block w-full max-w-[520px] max-h-[520px] object-contain rounded-xl cursor-pointer"
                      />
                    </a>

                    <div className="mt-2 px-2 pb-2">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline break-all opacity-90"
                      >
                        {file.fileName}
                      </a>
                    </div>
                  </div>
                );
              }

              return (
                <div key={file.id} className="rounded-xl bg-black/10 px-3 py-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline break-all"
                  >
                    {file.fileName}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="px-2 py-1 rounded-full bg-black/10">
            State: {msg.state?.name || "-"}
          </span>
          <span className="px-2 py-1 rounded-full bg-black/10">
            Resp: {msg.responseTime ?? 0}
          </span>
          <span className="px-2 py-1 rounded-full bg-black/10">
            Reso: {msg.resolutionTime ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, badge }) {
  return (
    <div className="grid grid-cols-[170px_1fr] gap-y-2 items-start">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="text-sm text-slate-700">
        {badge ? (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>
            {value || "-"}
          </span>
        ) : (
          value || "-"
        )}
      </div>
    </div>
  );
}

function CardSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-700">{title}</h3>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

function CustomerTicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [ticketRes, msgRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/ticket/detail/${id}`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/message/by-ticket-id`, {
          withCredentials: true,
          params: { id },
        }),
      ]);

      setTicket(ticketRes.data || null);
      setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
    } catch (err) {
      console.error("Failed load customer ticket detail", err);
      setTicket(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const historyCount = useMemo(() => messages.length, [messages.length]);

  const chatDisabled = useMemo(() => {
    const state = (ticket?.state || "").toLowerCase();
    return state.includes("closed");
  }, [ticket]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (chatDisabled) return;
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      setSending(true);

      const formData = new FormData();
      formData.append("content", newMessage || "");

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      await axios.post(`${API_BASE_URL}/message/send/${id}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewMessage("");
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadData();
      setActiveTab("history");
    } catch (err) {
      console.error("Failed send customer message", err);
      alert(err?.response?.data || err?.message || "Failed send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Loading...</div>;
  }

  if (!ticket) {
    return <div className="p-6 text-slate-500">Ticket not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#efeded] p-6">
      <div className="max-w-[1450px] mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-4">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <FiArrowLeft /> Back
                </button>
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-slate-800">
                    {ticket.subject || "-"}
                  </h1>

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(
                      ticket.state
                    )}`}
                  >
                    {ticket.state || "-"}
                  </span>

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${channelBadge(
                      ticket.channel
                    )}`}
                  >
                    {ticket.channel || "-"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-slate-500">
                  Ticket Number:{" "}
                  <span className="font-semibold text-slate-700">
                    {ticket.ticketNumber || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <CardSection title="Customer Info">
            <InfoRow label="Customer Name" value={ticket.customerName} />
            <InfoRow label="Email" value={ticket.email} />
            <InfoRow label="Account" value={ticket.company} />
            <InfoRow label="Priority" value={ticket.priority} />
            <InfoRow label="Product" value={ticket.product} />
          </CardSection>

          <CardSection title="Ticket Info">
            <InfoRow label="Ticket Number" value={ticket.ticketNumber} />
            <InfoRow label="State" value={ticket.state} badge={badgeColor(ticket.state)} />
            <InfoRow label="Channel" value={ticket.channel} badge={channelBadge(ticket.channel)} />
            <InfoRow label="Assigned PIC" value={ticket.assignedPic} />
            <InfoRow label="First Response At" value={formatDateTime(ticket.firstResponseAt)} />
            <InfoRow label="Resolution Start" value={formatDateTime(ticket.resolutionStartAt)} />
            <InfoRow label="Resolution End" value={formatDateTime(ticket.resolutionEndAt)} />
          </CardSection>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 border-b border-slate-100 flex flex-wrap gap-6">
            <button
              className={`py-4 text-sm font-semibold border-b-2 ${
                activeTab === "history"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-slate-500"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Conversation History ({historyCount})
            </button>

            <button
              className={`py-4 text-sm font-semibold border-b-2 ${
                activeTab === "sla"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-slate-500"
              }`}
              onClick={() => setActiveTab("sla")}
            >
              SLA
            </button>
          </div>

          {activeTab === "history" && (
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-slate-400 text-sm">No messages</div>
                ) : (
                  messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Reply Message
                </label>

                {chatDisabled && (
                  <div className="mb-3 rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-500">
                    Ticket sudah closed, chat tidak bisa digunakan.
                  </div>
                )}

                <div className="mb-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Attach files</p>
                      <p className="text-xs text-slate-500">
                        Images, PDF, DOCX, XLSX, ZIP, etc.
                      </p>
                    </div>

                    <label
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-white cursor-pointer ${
                        chatDisabled
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Browse
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        disabled={chatDisabled}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
                      />
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <FiPaperclip className="text-slate-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          {!chatDisabled && (
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="ml-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={5}
                  disabled={chatDisabled}
                  placeholder={chatDisabled ? "Ticket sudah closed..." : "Write a reply..."}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 disabled:bg-slate-100 disabled:text-slate-400"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      sending ||
                      chatDisabled ||
                      (!newMessage.trim() && selectedFiles.length === 0)
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                  >
                    <FiSend />
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sla" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FiClock />
                  First Response Time
                </div>
                <div className="mt-2 text-xl font-bold text-slate-700">
                  {ticket.firstResponseTime || "-"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FiCheckCircle />
                  Resolution Time
                </div>
                <div className="mt-2 text-xl font-bold text-slate-700">
                  {ticket.resolutionTime || "-"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FiClock />
                  Start Resolution
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-700 break-all">
                  {formatDateTime(ticket.resolutionStartAt)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FiMessageSquare />
                  End Resolution
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-700 break-all">
                  {formatDateTime(ticket.resolutionEndAt)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerTicketDetailPage;