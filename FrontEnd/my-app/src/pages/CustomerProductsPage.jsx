import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HeaderSection, FilterBar, Toast, EmptyState, Icon
} from "../components/ui/SharedComponents";
import { INITIAL_CUSTOMER_PRODUCTS, getProductById, delay } from "./productStore";

const PAGE_SIZE = 10;
const CURRENT_CUSTOMER_ID = "BIND"; // Bank Indonesia — swap for auth context

/* ─── STATUS BADGE ───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Active:   { bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
    Inactive: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
    Expired:  { bg: "#fff7ed", color: "#d97706", dot: "#f59e0b" },
  };
  const s = map[status] ?? map["Inactive"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

/* ─── TABLE ROW ──────────────────────────────────────────────── */
const ProductRow = ({ item, index, status }) => (
  <tr
    className="border-b transition-colors duration-150"
    style={{ borderColor: "#fdf2f2", background: index % 2 === 0 ? "white" : "#fffafa" }}
    onMouseEnter={e => { e.currentTarget.style.background = "#fff5f5"; }}
    onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "white" : "#fffafa"; }}
  >
    <td className="px-4 py-3 text-sm font-bold" style={{ color: "#D73A30" }}>{index + 1}</td>
    <td className="px-4 py-3 font-semibold text-slate-800">{item.productName}</td>
    <td className="px-4 py-3 text-slate-600 text-sm">{item.principal}</td>
    <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-500">{item.productId}</td>
    <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.principalId}</td>
    <td className="px-4 py-3"><StatusBadge status={status} /></td>
  </tr>
);

/* ─── SKELETON ROW ───────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-red-50">
    {[20, 40, 30, 25, 25, 18].map((w, j) => (
      <td key={j} className="px-4 py-3.5">
        <div className="h-3 rounded-full" style={{ background: "#fce8e8", width: `${w + j * 5}%` }} />
      </td>
    ))}
  </tr>
);

/* ─── MAIN ───────────────────────────────────────────────────── */
function CustomerProductsPage() {
  const [items,   setItems]   = useState([]);
  const [record,  setRecord]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState(null);
  const [page,    setPage]    = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    await delay(700);
    const rec = INITIAL_CUSTOMER_PRODUCTS.find(r => r.customerId === CURRENT_CUSTOMER_ID);
    const productList = (rec?.productIds ?? [])
      .map(id => getProductById(id))
      .filter(Boolean);
    setRecord(rec ?? null);
    setItems(productList);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() =>
    items.filter(p => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.productName?.toLowerCase().includes(s) ||
        p.productId?.toLowerCase().includes(s)   ||
        p.principal?.toLowerCase().includes(s)   ||
        p.principalId?.toLowerCase().includes(s)
      );
    }), [items, search]);

  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const principals  = [...new Set(items.map(p => p.principal))];
  const activeCount = record?.status === "Active" ? items.length : 0;

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: "#f8f0f0" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="My Products"
        subtitle="All products and sub products linked to your account"
        breadcrumb={["Portal", "Products"]}
        icon={<Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" size={22} />}
        stats={[
          { value: loading ? "—" : items.length,     label: "Total Product" },
          { value: loading ? "—" : activeCount,       label: "Active"        },
          { value: loading ? "—" : principals.length, label: "Principals"    },
        ]}
        actions={[
          {
            label: "Refresh",
            icon: <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" size={14} className={loading ? "animate-spin" : ""} />,
            variant: "outline",
            onClick: load,
            disabled: loading,
          },
        ]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search Product..."
        onReset={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f3e8e8" }}>

        {/* Card header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "#fdf2f2" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <span className="text-sm font-bold text-slate-700">Purchase</span>
            {!loading && (
              <span className="text-xs text-slate-400 ml-1">{filtered.length} records</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #8B1A15, #B71C1C)" }}>
                {["NO", "PRODUCT NAME", "PRINCIPAL", "PRODUCT CODE", "PRINCIPAL ID", "STATUS"].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No products found"
                      subtitle={search ? "No products match your search." : "No products have been assigned to your account."}
                    />
                  </td>
                </tr>
              )}

              {!loading && paginated.map((item, i) => (
                <ProductRow
                  key={item.productId}
                  item={item}
                  index={(page - 1) * PAGE_SIZE + i}
                  status={record?.status ?? "Active"}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t text-xs text-slate-500" style={{ borderColor: "#fdf2f2" }}>
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
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

        {/* Footer */}
        {!loading && (
          <div className="px-5 py-3 text-xs text-slate-400 border-t" style={{ borderColor: "#fdf2f2" }}>
            Showing {paginated.length > 0 ? `1–${paginated.length}` : "0"} of {filtered.length} entries
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerProductsPage;