import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { fetchDashboardSummary, fetchMyTickets } from "../api/my_ticket_api";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(d.getDate())} ${d.toLocaleString("en-US", {
    month: "short",
  })} ${d.getFullYear()} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function priorityClass(priority) {
  const p = (priority || "").toUpperCase();
  if (p.includes("P1")) return "bg-cyan-400 text-black";
  if (p.includes("P2")) return "bg-indigo-500 text-white";
  if (p.includes("P3")) return "bg-purple-500 text-white";
  if (p.includes("P4")) return "bg-lime-500 text-black";
  return "bg-slate-300 text-slate-800";
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("open")) return "bg-lime-400 text-black";
  if (s.includes("progress")) return "bg-yellow-400 text-black";
  if (s.includes("close")) return "bg-red-500 text-white";
  return "bg-slate-300 text-slate-800";
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-red-100 rounded-xl px-4 py-3 text-center min-w-[120px]">
      <div className="text-lg font-semibold text-red-700">{value ?? 0}</div>
      <div className="text-sm text-red-700 leading-tight">{label}</div>
    </div>
  );
}

function SummaryTicket() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({
    totalOpen: 0,
    totalClosed: 0,
    totalUnassigned: 0,
    totalMyOpen: 0,
    myInProgressTickets: 0,
    myCloseTickets: 0,
    totalMyTickets: 0,
  });
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketRes, summaryRes] = await Promise.allSettled([
          fetchMyTickets(),
          fetchDashboardSummary(),
        ]);

        if (ticketRes.status === "fulfilled") {
          setTickets(Array.isArray(ticketRes.value.data) ? ticketRes.value.data : []);
        } else {
          console.error("Failed to load my tickets:", ticketRes.reason);
          setTickets([]);
        }

        if (summaryRes.status === "fulfilled") {
          setSummary(summaryRes.value.data || {});
        } else {
          console.error("Failed to load dashboard summary:", summaryRes.reason);
          setSummary({
            totalOpen: 0,
            totalClosed: 0,
            totalUnassigned: 0,
            totalMyOpen: 0,
            myInProgressTickets: 0,
            myCloseTickets: 0,
            totalMyTickets: 0,
          });
        }
      } catch (err) {
        console.error("Failed to load summary ticket page:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        (ticket.caseNumber || "").toLowerCase().includes(keyword) ||
        (ticket.subject || "").toLowerCase().includes(keyword) ||
        (ticket.account || "").toLowerCase().includes(keyword) ||
        (ticket.customerName || "").toLowerCase().includes(keyword) ||
        (ticket.state || "").toLowerCase().includes(keyword);

      const matchPriority =
        !priorityFilter ||
        (ticket.priority || "").toLowerCase() === priorityFilter.toLowerCase();

      const matchStatus =
        !statusFilter ||
        (ticket.state || "").toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchPriority && matchStatus;
    });
  }, [tickets, search, priorityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTickets.slice(start, start + rowsPerPage);
  }, [filteredTickets, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search, priorityFilter, statusFilter]);

  const summaryCards = [
    { label: "All Open Ticket", value: summary?.totalOpen ?? 0 },
    { label: "All Close Ticket", value: summary?.totalClosed ?? 0 },
    { label: "Unassigned Open", value: summary?.totalUnassigned ?? 0 },
    { label: "My Open Tickets", value: summary?.totalMyOpen ?? 0 },
    { label: "My In-Progress Tickets", value: summary?.myInProgressTickets ?? 0 },
    { label: "My Close Tickets", value: summary?.myCloseTickets ?? 0 },
  ];

  const openCustomerTicketDetail = (ticket) => {
    if (!ticket?.id) return;
    navigate(`/my/tickets/${ticket.id}`);
  };

  return (
    <div className="min-h-screen bg-[#efeded] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-[28px] shadow-md px-8 py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                <FiSettings size={20} />
              </div>
              <div>
                <h1 className="text-[32px] font-bold text-red-700 leading-none">
                  Ticket List
                </h1>
                <p className="text-sm text-slate-400 mt-2">
                  Active and open support tickets
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              {summaryCards.map((item, index) => (
                <SummaryCard key={index} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.7fr_0.7fr] gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket . . ."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-sm border border-slate-200 outline-none text-slate-600"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-white shadow-sm border border-slate-200 outline-none text-slate-600"
          >
            <option value="">All Priority</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-white shadow-sm border border-slate-200 outline-none text-slate-600"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="bg-white rounded-[28px] shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#9f3527] text-white">
                      <th className="px-4 py-4 text-left font-medium">ID</th>
                      <th className="px-4 py-4 text-left font-medium">Ticket ID</th>
                      <th className="px-4 py-4 text-left font-medium">Customer</th>
                      <th className="px-4 py-4 text-left font-medium">Company</th>
                      <th className="px-4 py-4 text-left font-medium">Subject</th>
                      <th className="px-4 py-4 text-left font-medium">Priority</th>
                      <th className="px-4 py-4 text-left font-medium">Status</th>
                      <th className="px-4 py-4 text-left font-medium">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-14 text-center text-slate-400">
                          No tickets found
                        </td>
                      </tr>
                    ) : (
                      paginatedTickets.map((ticket, index) => (
                        <tr
                          key={ticket.id}
                          onClick={() => openCustomerTicketDetail(ticket)}
                          className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                          title="Klik untuk buka detail ticket"
                        >
                          <td className="px-4 py-4">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-4 text-slate-800 font-medium">
                            {ticket.caseNumber}
                          </td>
                          <td className="px-4 py-4 text-red-500">
                            {ticket.customerName}
                          </td>
                          <td className="px-4 py-4">{ticket.account}</td>
                          <td className="px-4 py-4">{ticket.subject}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-4 py-1 rounded-full text-xs font-semibold ${priorityClass(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-4 py-1 rounded-full text-xs font-semibold ${statusClass(
                                ticket.state
                              )}`}
                            >
                              {ticket.state}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-red-400">
                            {formatDate(ticket.createdOn)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>Rows per page</span>
                  <select className="border rounded-xl px-3 py-2 bg-white">
                    <option>5</option>
                  </select>
                </div>

                <div className="text-sm text-slate-600 text-center">
                  Showing {filteredTickets.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
                  {" - "}
                  {Math.min(currentPage * rowsPerPage, filteredTickets.length)} of {filteredTickets.length} entries
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded border flex items-center justify-center disabled:opacity-40"
                  >
                    <FiChevronLeft size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded border text-sm ${
                        currentPage === pageNum
                          ? "bg-[#9f3527] text-white border-[#9f3527]"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded border flex items-center justify-center disabled:opacity-40"
                  >
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SummaryTicket;