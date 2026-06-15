import { useEffect, useMemo, useState, Fragment } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import { fetchGroupedOpenTickets } from "../api/grouped_ticket_api";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/api";

function statusColor(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("open")) return "text-sky-600";
  if (s.includes("manager replied")) return "text-red-500";
  if (s.includes("customer replied")) return "text-red-500";
  if (s.includes("staff replied")) return "text-emerald-600";

  return "text-slate-600";
}

function statusTicketColor(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("delayed")) return "text-red-500";
  if (s.includes("ongoing")) return "text-sky-600";
  if (s.includes("done")) return "text-emerald-600";
  if (s.includes("open")) return "text-sky-600";

  return "text-slate-600";
}

function isAssignedTicket(ticket) {
  const pic = String(ticket?.assignedPic || "").trim().toLowerCase();

  return pic !== "" && pic !== "-" && pic !== "null" && pic !== "undefined";
}

function getAllTickets(groups = []) {
  return groups.flatMap((group) => group.tickets || []);
}

function uniqueOptions(values = []) {
  return Array.from(
    new Set(
      values
        .map((v) => String(v || "").trim())
        .filter((v) => v && v !== "-")
    )
  ).sort((a, b) => a.localeCompare(b));
}

function filterGroups(groups, filters) {
  const keyword = String(filters.search || "").toLowerCase().trim();
  const product = String(filters.product || "").toLowerCase().trim();
  const priority = String(filters.priority || "").toLowerCase().trim();
  const company = String(filters.company || "").toLowerCase().trim();

  return groups
    .map((group) => {
      const filteredTickets = (group.tickets || []).filter((ticket) => {
        const matchSearch =
          !keyword ||
          (ticket.createdOn || "").toLowerCase().includes(keyword) ||
          (ticket.ticketNumber || "").toLowerCase().includes(keyword) ||
          (ticket.assignedPic || "").toLowerCase().includes(keyword) ||
          (ticket.product || "").toLowerCase().includes(keyword) ||
          (ticket.priority || "").toLowerCase().includes(keyword) ||
          (ticket.company || "").toLowerCase().includes(keyword) ||
          (ticket.customerName || "").toLowerCase().includes(keyword) ||
          (ticket.state || "").toLowerCase().includes(keyword) ||
          (ticket.subject || "").toLowerCase().includes(keyword) ||
          (ticket.statusTicket || "").toLowerCase().includes(keyword) ||
          (group.companyName || "").toLowerCase().includes(keyword);

        const matchProduct =
          !product || String(ticket.product || "").toLowerCase() === product;

        const matchPriority =
          !priority || String(ticket.priority || "").toLowerCase() === priority;

        const ticketCompany = String(ticket.company || group.companyName || "")
          .toLowerCase()
          .trim();

        const matchCompany = !company || ticketCompany === company;

        return matchSearch && matchProduct && matchPriority && matchCompany;
      });

      if (filteredTickets.length > 0) {
        return {
          ...group,
          tickets: filteredTickets,
          total: filteredTickets.length,
        };
      }

      return null;
    })
    .filter(Boolean);
}

function splitGroupsForStaff(groups) {
  const assignedGroups = [];
  const unassignedGroups = [];

  groups.forEach((group) => {
    const assignedTickets = (group.tickets || []).filter(isAssignedTicket);
    const unassignedTickets = (group.tickets || []).filter(
      (ticket) => !isAssignedTicket(ticket)
    );

    if (assignedTickets.length > 0) {
      assignedGroups.push({
        ...group,
        tickets: assignedTickets,
        total: assignedTickets.length,
      });
    }

    if (unassignedTickets.length > 0) {
      unassignedGroups.push({
        ...group,
        tickets: unassignedTickets,
        total: unassignedTickets.length,
      });
    }
  });

  return {
    assignedGroups,
    unassignedGroups,
  };
}

function TicketGroupedTable({
  title,
  subtitle,
  groups,
  openGroups,
  onToggleGroup,
  onOpenTicket,
  loading,
  emptyText,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-700">{title}</h2>

        {subtitle && (
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-slate-500">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="p-6 text-center text-slate-500">{emptyText}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1400px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-3 text-left w-10"></th>
                <th className="px-3 py-3 text-left">Created on</th>
                <th className="px-3 py-3 text-left">Ticket Number</th>
                <th className="px-3 py-3 text-left">Assigned PIC (L1)</th>
                <th className="px-3 py-3 text-left">Product</th>
                <th className="px-3 py-3 text-left">Priority</th>
                <th className="px-3 py-3 text-left">Company</th>
                <th className="px-3 py-3 text-left">Customer Name</th>
                <th className="px-3 py-3 text-left">State</th>
                <th className="px-3 py-3 text-left">Subject</th>
                <th className="px-3 py-3 text-left">Status Ticket</th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group) => (
                <Fragment key={`${title}-${group.companyName}`}>
                  <tr
                    className="bg-slate-200 font-semibold text-slate-700 cursor-pointer hover:bg-slate-300"
                    onClick={() => onToggleGroup(group.companyName)}
                  >
                    <td className="px-3 py-3">
                      {openGroups[group.companyName] ? (
                        <FiChevronDown />
                      ) : (
                        <FiChevronRight />
                      )}
                    </td>

                    <td colSpan="10" className="px-3 py-3">
                      {group.companyName} ({group.total})
                    </td>
                  </tr>

                  {openGroups[group.companyName] &&
                    group.tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b hover:bg-slate-50 align-top cursor-pointer"
                        onClick={() => onOpenTicket(ticket.id)}
                      >
                        <td className="px-3 py-3"></td>

                        <td className="px-3 py-3 text-red-500">
                          {ticket.createdOn || "-"}
                        </td>

                        <td className="px-3 py-3 text-sky-600">
                          {ticket.ticketNumber || "-"}
                        </td>

                        <td className="px-3 py-3 text-red-500">
                          {isAssignedTicket(ticket)
                            ? ticket.assignedPic
                            : "Belum diambil"}
                        </td>

                        <td className="px-3 py-3 text-sky-600">
                          {ticket.product || "-"}
                        </td>

                        <td className="px-3 py-3 text-red-500">
                          {ticket.priority || "-"}
                        </td>

                        <td className="px-3 py-3 text-red-500">
                          {ticket.company || group.companyName || "-"}
                        </td>

                        <td className="px-3 py-3 text-sky-600">
                          {ticket.customerName || "-"}
                        </td>

                        <td className={`px-3 py-3 ${statusColor(ticket.state)}`}>
                          {ticket.state || "-"}
                        </td>

                        <td className={`px-3 py-3 ${statusColor(ticket.state)}`}>
                          {ticket.subject || "-"}
                        </td>

                        <td
                          className={`px-3 py-3 ${statusTicketColor(
                            ticket.statusTicket
                          )}`}
                        >
                          {ticket.statusTicket || "-"}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GroupedTicketPage() {
  const [groups, setGroups] = useState([]);

  const [openAssignedGroups, setOpenAssignedGroups] = useState({});
  const [openUnassignedGroups, setOpenUnassignedGroups] = useState({});
  const [openManagerGroups, setOpenManagerGroups] = useState({});

  const [loading, setLoading] = useState(true);
  const [roleType, setRoleType] = useState("CUSTOMER");

  const [filters, setFilters] = useState({
    search: "",
    product: "",
    priority: "",
    company: "",
  });

  const navigate = useNavigate();

  const openTicketDetail = (ticketId) => {
    navigate(`/ticket/grouped/${ticketId}`);
  };

  const buildInitialOpenGroups = (data = []) => {
    const initialOpen = {};

    data.forEach((g) => {
      initialOpen[g.companyName] = false;
    });

    if (data.length > 0) {
      initialOpen[data[0].companyName] = true;
    }

    return initialOpen;
  };

  const loadRole = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/metabase/user-role`, {
        withCredentials: true,
      });

      setRoleType(res.data.roleType || "CUSTOMER");
    } catch (err) {
      console.error("Failed load role", err);
      setRoleType("CUSTOMER");
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);

      const res = await fetchGroupedOpenTickets();
      const data = res.data || [];

      setGroups(data);

      const initialOpen = buildInitialOpenGroups(data);

      setOpenAssignedGroups(initialOpen);
      setOpenUnassignedGroups(initialOpen);
      setOpenManagerGroups(initialOpen);
    } catch (err) {
      console.error("Failed to load grouped tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRole();
    loadTickets();
  }, []);

  const filterOptions = useMemo(() => {
    const tickets = getAllTickets(groups);

    return {
      products: uniqueOptions(tickets.map((ticket) => ticket.product)),
      priorities: uniqueOptions(tickets.map((ticket) => ticket.priority)),
      companies: uniqueOptions(
        tickets
          .map((ticket) => ticket.company)
          .concat(groups.map((g) => g.companyName))
      ),
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return filterGroups(groups, filters);
  }, [groups, filters]);

  const { assignedGroups, unassignedGroups } = useMemo(() => {
    return splitGroupsForStaff(filteredGroups);
  }, [filteredGroups]);

  const isStaffView = roleType === "STAFF";

  const toggleAssignedGroup = (companyName) => {
    setOpenAssignedGroups((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const toggleUnassignedGroup = (companyName) => {
    setOpenUnassignedGroups((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const toggleManagerGroup = (companyName) => {
    setOpenManagerGroups((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const openAllGroups = () => {
    const nextOpen = {};

    groups.forEach((g) => {
      nextOpen[g.companyName] = true;
    });

    setOpenAssignedGroups(nextOpen);
    setOpenUnassignedGroups(nextOpen);
    setOpenManagerGroups(nextOpen);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    openAllGroups();
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      product: "",
      priority: "",
      company: "",
    });

    const initialOpen = buildInitialOpenGroups(groups);

    setOpenAssignedGroups(initialOpen);
    setOpenUnassignedGroups(initialOpen);
    setOpenManagerGroups(initialOpen);
  };

  const hasActiveFilter =
    filters.search || filters.product || filters.priority || filters.company;

  return (
    <div className="min-h-screen bg-[#efeded] p-4">
      <div className="max-w-[1500px] mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h1 className="text-2xl font-bold text-slate-700">
            Grouped Open Tickets
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            {isStaffView
              ? "Staff view: ticket milik staff dan ticket yang belum diambil"
              : "Staff / Manager view grouped by company"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1.2fr_auto] gap-3 items-center">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search grouped tickets..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              />
            </div>

            <select
              value={filters.product}
              onChange={(e) => handleFilterChange("product", e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-slate-600 focus:ring-2 focus:ring-red-100 focus:border-red-400"
            >
              <option value="">All Product</option>
              {filterOptions.products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-slate-600 focus:ring-2 focus:ring-red-100 focus:border-red-400"
            >
              <option value="">All Priority</option>
              {filterOptions.priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>

            <select
              value={filters.company}
              onChange={(e) => handleFilterChange("company", e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-slate-600 focus:ring-2 focus:ring-red-100 focus:border-red-400"
            >
              <option value="">All Company</option>
              {filterOptions.companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilter}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX />
              Reset
            </button>
          </div>
        </div>

        {isStaffView ? (
          <>
            <TicketGroupedTable
              title="My Tickets"
              subtitle="Ticket open yang sudah assigned ke staff login saat ini"
              groups={assignedGroups}
              openGroups={openAssignedGroups}
              onToggleGroup={toggleAssignedGroup}
              onOpenTicket={openTicketDetail}
              loading={loading}
              emptyText="Belum ada ticket yang diambil staff ini"
            />

            <TicketGroupedTable
              title="Unassigned Tickets"
              subtitle="Ticket open yang belum memiliki Assigned PIC"
              groups={unassignedGroups}
              openGroups={openUnassignedGroups}
              onToggleGroup={toggleUnassignedGroup}
              onOpenTicket={openTicketDetail}
              loading={loading}
              emptyText="Tidak ada ticket open yang belum diambil"
            />
          </>
        ) : (
          <TicketGroupedTable
            title="All Grouped Open Tickets"
            subtitle="Manager view: semua ticket open grouped by company"
            groups={filteredGroups}
            openGroups={openManagerGroups}
            onToggleGroup={toggleManagerGroup}
            onOpenTicket={openTicketDetail}
            loading={loading}
            emptyText="No grouped tickets found"
          />
        )}
      </div>
    </div>
  );
}

export default GroupedTicketPage;