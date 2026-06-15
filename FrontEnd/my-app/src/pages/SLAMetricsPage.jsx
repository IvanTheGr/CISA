import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HeaderSection, FilterBar, DataTable, Toast, Icon,
} from "../components/ui/SharedComponents";
import { fetchSlaMetrics } from "../api/sla_metrics_api";

const PAGE_SIZE = 10;

/* ─── Helpers ────────────────────────────────────────────────────── */

const fmtHours = (v) =>
  v == null ? <span className="text-slate-300">—</span> : (
    <span className="font-mono text-sm">{v}h</span>
  );

const MetricCell = ({ actual, target, breached }) => {
  if (actual == null)
    return <span className="text-slate-300 font-mono text-sm">—</span>;

  const ok = breached === false;
  const bad = breached === true;

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="font-mono text-sm font-semibold"
        style={{ color: bad ? "#D73A30" : ok ? "#16a34a" : "#374151" }}
      >
        {actual}h
      </span>
      {target != null && (
        <span className="text-[10px] text-slate-400">target: {target}h</span>
      )}
    </div>
  );
};

const StatusBadge = ({ breached, noData }) => {
  if (noData)
    return (
      <span className="px-2 py-0.5 text-xs rounded-full font-semibold border bg-slate-50 text-slate-400 border-slate-200">
        No Data
      </span>
    );
  if (breached)
    return (
      <span className="px-2 py-0.5 text-xs rounded-full font-bold border bg-red-50 text-red-700 border-red-200">
        Breached
      </span>
    );
  return (
    <span className="px-2 py-0.5 text-xs rounded-full font-bold border bg-green-50 text-green-700 border-green-200">
      Within SLA
    </span>
  );
};

const PRIORITY_COLORS = {
  p1: "bg-red-50 text-red-700 border-red-200",
  p2: "bg-orange-50 text-orange-700 border-orange-200",
  p3: "bg-amber-50 text-amber-700 border-amber-200",
  p4: "bg-blue-50 text-blue-700 border-blue-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  high:     "bg-orange-50 text-orange-700 border-orange-200",
  medium:   "bg-amber-50 text-amber-700 border-amber-200",
  low:      "bg-blue-50 text-blue-700 border-blue-200",
};
const priorityBadge = (name) => {
  const key = name?.toLowerCase() ?? "";
  const cls =
    Object.entries(PRIORITY_COLORS).find(([k]) => key.includes(k))?.[1] ??
    "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-bold border ${cls}`}>
      {name || "—"}
    </span>
  );
};

/* ─── MAIN ───────────────────────────────────────────────────────── */
function SLAMetricsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState(null);
  const [page,    setPage]    = useState(1);

  const showToast = (msg, type = "error") => setToast({ type, message: msg });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSlaMetrics();
      setItems(res.data.map((r, i) => ({ ...r, no: i + 1 })));
    } catch {
      showToast("Failed to load SLA metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() =>
    items.filter((r) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        r.ticketNumber?.toLowerCase().includes(s) ||
        r.customerName?.toLowerCase().includes(s) ||
        r.productName?.toLowerCase().includes(s)  ||
        r.priorityName?.toLowerCase().includes(s) ||
        r.stateName?.toLowerCase().includes(s)
      );
    }), [items, search]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /* Stats */
  const breachedResponse   = items.filter((r) => r.responseBreached).length;
  const breachedResolution = items.filter((r) => r.resolutionBreached).length;
  const withSla            = items.filter((r) => r.slaActive).length;

  const cols = [
    {
      header: "No", key: "no",
      cellStyle: { fontWeight: 600, color: "#872924", width: 48 },
    },
    {
      header: "Ticket #", key: "ticketNumber",
      cellStyle: { fontFamily: "monospace", fontWeight: 700, color: "#374151" },
      render: (v) => v || "—",
    },
    {
      header: "Customer", key: "customerName",
      cellStyle: { fontWeight: 600, color: "#1e293b" },
      render: (v) => v || "—",
    },
    {
      header: "Product", key: "productName",
      cellStyle: { color: "#334155" },
      render: (v) => v || "—",
    },
    {
      header: "Priority", key: "priorityName",
      render: (v) => priorityBadge(v),
    },
    {
      header: "Actual Response",
      key: "actualResponseTime",
      render: (v, row) => (
        <MetricCell
          actual={row.actualResponseTime}
          target={row.slaTargetResponse}
          breached={row.responseBreached}
        />
      ),
    },
    {
      header: "Actual Resolution",
      key: "actualResolutionTime",
      render: (v, row) => (
        <MetricCell
          actual={row.actualResolutionTime}
          target={row.slaTargetResolution}
          breached={row.resolutionBreached}
        />
      ),
    },
    {
      header: "First Response",
      key: "firstResponseTime",
      render: (v) => fmtHours(v),
    },
    {
      header: "Total Resolution",
      key: "totalResolutionTime",
      render: (v) => fmtHours(v),
    },
    {
      header: "SLA Target Res",
      key: "slaTargetResponse",
      render: (v) => fmtHours(v),
    },
    {
      header: "SLA Target Reso",
      key: "slaTargetResolution",
      render: (v) => fmtHours(v),
    },
    {
      header: "Status",
      key: "responseBreached",
      render: (v, row) => {
        const noData = row.actualResponseTime == null && row.actualResolutionTime == null;
        const breached = row.responseBreached || row.resolutionBreached;
        return <StatusBadge breached={breached} noData={noData} />;
      },
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: "#f8f0f0" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="SLA Metrics"
        subtitle="Actual vs target response and resolution times per ticket"
        breadcrumb={["Portal", "Ticket", "SLA Metrics"]}
        icon={<Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2" size={22} />}
        stats={[
          { value: items.length,        label: "Tickets"      },
          { value: withSla,             label: "With SLA"     },
          { value: breachedResponse,    label: "Resp Breach"  },
          { value: breachedResolution,  label: "Reso Breach"  },
        ]}
        actions={[{
          label: "Refresh",
          icon: (
            <Icon
              d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15"
              size={14}
              className={loading ? "animate-spin" : ""}
            />
          ),
          variant: "outline",
          onClick: load,
          disabled: loading,
        }]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search ticket, customer, product, priority…"
        onReset={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f3e8e8" }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#fdf2f2" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <span className="text-sm font-bold text-slate-700">SLA Metrics</span>
            <span className="text-xs text-slate-400">{filtered.length} records</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Within SLA
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Breached
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={cols}
            data={paginated}
            loading={loading}
            rowsCount={items.length}
          />
        </div>

        {!loading && totalPages > 1 && (
          <div
            className="px-5 py-3 flex items-center justify-between border-t text-xs text-slate-500"
            style={{ borderColor: "#fdf2f2" }}
          >
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                  style={
                    n === page
                      ? { background: "linear-gradient(#D73A30,#872924)", color: "white" }
                      : { background: "#f8f0f0", color: "#475569" }
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SLAMetricsPage;
