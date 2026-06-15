import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiStar,
} from "react-icons/fi";
import { fetchMyTicketHistoryApi } from "../api/ticket_history_api";

const formatDateTime = (value) => {
  if (!value) return "-";
  return String(value).replace("T", " ").substring(0, 19);
};

function StatusBadge({ status }) {
  const text = status || "SUBMITTED";
  const isApproved = String(text).toUpperCase().includes("APPROV");

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        isApproved
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {text}
    </span>
  );
}

function RatingStars({ rating, ratingText }) {
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
          size={14}
          className={
            index < value
              ? "text-amber-500 fill-amber-500"
              : "text-slate-300"
          }
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-600">
        {ratingText || `${value} / 5`}
      </span>
    </div>
  );
}

function HistoryTable({ title, subtitle, icon: Icon, tickets, type, onOpen }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            type === "approved"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <FiFileText className="mx-auto mb-3" size={26} />
          <p className="text-sm font-semibold">Tidak ada data</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1250px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Ticket Number</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Close Time</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Approval</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onOpen(ticket.id)}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-bold text-sky-600">
                    {ticket.ticketNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ticket.subject || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ticket.companyName || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ticket.customerName || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ticket.productName || "-"}
                  </td>
                  <td className="px-4 py-3 text-red-500 font-semibold">
                    {ticket.priorityName || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateTime(ticket.closeTime)}
                  </td>
                  <td className="px-4 py-3">
                    <RatingStars
                      rating={ticket.customerRating}
                      ratingText={ticket.customerRatingText}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.incidentState} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TicketHistoryPage() {
  const navigate = useNavigate();

  const [pendingApproval, setPendingApproval] = useState([]);
  const [approved, setApproved] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetchMyTicketHistoryApi();

      setPendingApproval(res.data?.pendingApproval || []);
      setApproved(res.data?.approved || []);
    } catch (err) {
      console.error("Failed load ticket history", err);
      setPendingApproval([]);
      setApproved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filterTickets = (tickets) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tickets;

    return tickets.filter((ticket) => {
      return (
        String(ticket.ticketNumber || "").toLowerCase().includes(keyword) ||
        String(ticket.subject || "").toLowerCase().includes(keyword) ||
        String(ticket.companyName || "").toLowerCase().includes(keyword) ||
        String(ticket.customerName || "").toLowerCase().includes(keyword) ||
        String(ticket.productName || "").toLowerCase().includes(keyword) ||
        String(ticket.priorityName || "").toLowerCase().includes(keyword) ||
        String(ticket.customerRatingText || "").toLowerCase().includes(keyword)
      );
    });
  };

  const filteredPending = useMemo(
    () => filterTickets(pendingApproval),
    [pendingApproval, search]
  );

  const filteredApproved = useMemo(
    () => filterTickets(approved),
    [approved, search]
  );

  const openDetail = (ticketId) => {
    navigate(`/ticket/history/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-[#efeded] p-5">
      <div className="max-w-[1500px] mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center">
              <FiFileText />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                History Ticket
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Ticket closed yang sudah memiliki Incident Log
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history ticket..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
            Loading history ticket...
          </div>
        ) : (
          <>
            <HistoryTable
              title="Belum Approve Manager"
              subtitle="Incident Log sudah disubmit staff dan menunggu approval manager"
              icon={FiClock}
              tickets={filteredPending}
              type="pending"
              onOpen={openDetail}
            />

            <HistoryTable
              title="Sudah Approve Manager"
              subtitle="Incident Log yang sudah disetujui manager"
              icon={FiCheckCircle}
              tickets={filteredApproved}
              type="approved"
              onOpen={openDetail}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TicketHistoryPage;