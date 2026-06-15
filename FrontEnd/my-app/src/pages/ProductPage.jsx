import { useState, useEffect } from "react";
import { fetchMyProducts } from "../api/product_api";

/* ─────────────────────────────────────────────────────────────
   ICON HELPERS
───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, className = "" }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

const BoxIcon     = () => <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />;
const TicketIcon  = () => <Icon d="M15 5v2 M15 11v2 M15 17v2 M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />;
const CalIcon     = () => <Icon d="M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />;
const RefreshIcon = () => <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" />;
const AlertIcon   = () => <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01" />;
const InboxIcon   = () => <Icon d="M22 12h-6l-2 3H10l-2-3H2 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />;
const HashIcon    = () => <Icon d="M4 9h16 M4 15h16 M10 3L8 21 M16 3l-2 18" />;
const ClockIcon   = () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2" />;
const CheckIcon   = () => <Icon d="M20 6L9 17l-5-5" />;

/* ─────────────────────────────────────────────────────────────
   TOAST  — matches ProfilePage toast style exactly
───────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium"
      style={isSuccess
        ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" }
        : { background: "#fff5f5", border: "1px solid #fca5a5", color: "#D73A30" }}
    >
      {isSuccess ? <CheckIcon /> : <Icon d="M18 6L6 18M6 6l12 12" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition">
        <Icon d="M18 6L6 18M6 6l12 12" size={14} />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD — uses ProfilePage pink-tinted skeleton colour
───────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div
    className="bg-white rounded-2xl p-6 space-y-4 animate-pulse"
    style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    {/* accent bar placeholder */}
    <div className="h-1 w-full rounded-full" style={{ background: "#fcd5d3" }} />
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded" style={{ background: "#fcd5d3" }} />
        <div className="h-5 w-44 rounded" style={{ background: "#fcd5d3" }} />
      </div>
      <div className="w-10 h-10 rounded-xl" style={{ background: "#fff5f5" }} />
    </div>
    <div className="h-3 w-full rounded" style={{ background: "#fff5f5" }} />
    <div className="h-3 w-3/4 rounded"  style={{ background: "#fff5f5" }} />
    <div className="flex gap-4 pt-1">
      <div className="h-3 w-20 rounded" style={{ background: "#fff5f5" }} />
      <div className="h-3 w-20 rounded" style={{ background: "#fff5f5" }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FORMAT DATE HELPER  — unchanged logic
───────────────────────────────────────────────────────────── */
const fmt = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("id-ID", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
};

/* ─────────────────────────────────────────────────────────────
   TICKET COUNT BADGE — re-styled with ProfilePage red palette
   high  (≥10) → strong red    matches primary #D73A30
   mid   (≥5)  → dark red      matches dark    #872924
   low   (≥2)  → muted red     lighter variant
   none  (1)   → soft pink     lightest tint
───────────────────────────────────────────────────────────── */
const countBadgeStyle = (count) => {
  if (count >= 10) return { background: "#fee2e2", border: "1px solid #fca5a5", color: "#D73A30" };
  if (count >= 5)  return { background: "#fff5f5", border: "1px solid #fcd5d3", color: "#872924" };
  if (count >= 2)  return { background: "#fff5f5", border: "1px solid #fcd5d3", color: "#872924" };
  return             { background: "#fff5f5", border: "1px solid #fcd5d3", color: "#872924" };
};

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER — identical pattern to ProfilePage
───────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, badge }) => (
  <div
    className="px-6 py-4 border-b flex items-center gap-2.5"
    style={{ borderColor: "#fcd5d3" }}
  >
    <div
      className="w-1 h-5 rounded-full flex-shrink-0"
      style={{ background: "linear-gradient(#D73A30, #872924)" }}
    />
    <h3
      className="text-sm font-bold uppercase tracking-wide"
      style={{ color: "#872924" }}
    >
      {title}
    </h3>
    {badge && <span className="ml-auto text-xs text-slate-400 italic">{badge}</span>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD — re-styled, logic untouched
═══════════════════════════════════════════════════════════════ */
const ProductCard = ({ product }) => (
  <div
    className="bg-white rounded-2xl overflow-hidden transition-all duration-200 group"
    style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "#fcd5d3";
      e.currentTarget.style.boxShadow   = "0 4px 12px rgba(215,58,48,0.10)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "#E5E7EB";
      e.currentTarget.style.boxShadow   = "0 1px 3px rgba(0,0,0,0.06)";
    }}
  >
    {/* Accent bar — matches ProfilePage gradient direction */}
    <div
      className="h-1 w-full"
      style={{ background: "linear-gradient(90deg, #D73A30, #872924, #D73A30)" }}
    />

    <div className="p-6 space-y-4">

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Product code — uses ProfilePage label colour */}
          <p
            className="text-xs font-mono font-semibold tracking-wider mb-1 flex items-center gap-1"
            style={{ color: "#872924", opacity: 0.7 }}
          >
            <HashIcon size={11} />
            {product.productCode}
          </p>
          {/* Product name */}
          <h3 className="text-base font-bold text-slate-800 leading-snug truncate">
            {product.productName}
          </h3>
        </div>

        {/* Box icon badge — matches ProfilePage role badge style */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: "#fff5f5", border: "1px solid #fcd5d3", color: "#D73A30" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; }}
        >
          <BoxIcon size={18} />
        </div>
      </div>

      {/* Latest ticket subject */}
      {product.latestTicketSubject && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex items-start gap-1.5">
          <TicketIcon size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#D73A30", opacity: 0.5 }} />
          <span>{product.latestTicketSubject}</span>
        </p>
      )}

      {/* Divider — matches ProfilePage pink divider */}
      <div style={{ borderTop: "1px solid #fcd5d3" }} />

      {/* Stats row */}
      <div className="flex items-center justify-between">
        {/* Ticket count badge */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full"
          style={countBadgeStyle(product.ticketCount)}
        >
          <TicketIcon size={11} />
          {product.ticketCount} ticket{product.ticketCount !== 1 ? "s" : ""}
        </span>

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "#872924", opacity: 0.6 }}>
          {product.firstTicketDate && (
            <span className="flex items-center gap-1" title="First ticket date">
              <CalIcon size={11} />
              {fmt(product.firstTicketDate)}
            </span>
          )}
          {product.lastUpdated && (
            <span className="flex items-center gap-1" title="Last updated">
              <ClockIcon size={11} />
              {fmt(product.lastUpdated)}
            </span>
          )}
        </div>
      </div>

    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [toast,    setToast]    = useState(null);
  const [search,   setSearch]   = useState("");

  /* ── Fetch on mount — LOGIC UNCHANGED ── */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyProducts();
      setProducts(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal memuat data produk";
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ── Client-side search filter — LOGIC UNCHANGED ── */
  const filtered = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode?.toLowerCase().includes(search.toLowerCase()) ||
    p.latestTicketSubject?.toLowerCase().includes(search.toLowerCase())
  );

  /* ════════════════ RENDER ════════════════ */
  return (
    /* Page background matches ProfilePage exactly */
    <div className="min-h-screen" style={{ background: "#DDDDDD" }}>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── TOP BAR — matches ProfilePage top bar ── */}
      <div
        className="sticky top-0 z-30 bg-white border-b shadow-sm"
        style={{ borderColor: "#fcd5d3" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Portal</span>
            <span className="text-slate-300">/</span>
            {/* Active breadcrumb uses ProfilePage primary red */}
            <span className="font-semibold" style={{ color: "#D73A30" }}>My Products</span>
          </div>

          {/* Refresh button — matches ProfilePage primary button style */}
          <button
            onClick={loadProducts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background:  "linear-gradient(90deg, #D73A30, #872924)",
              boxShadow:   "0 4px 12px rgba(215,58,48,0.25)",
            }}
          >
            <RefreshIcon size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── HEADER CARD — matches ProfilePage profile header card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          {/* Accent bar — same gradient as ProfilePage */}
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #D73A30, #872924, #D73A30)" }}
          />

          <div className="px-8 py-7 flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Icon badge — matches ProfilePage avatar gradient */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #D73A30, #872924)" }}
              >
                <BoxIcon size={26} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">My Products</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Products linked to your support tickets
                </p>
              </div>
            </div>

            {/* Stats chips — re-styled with red palette */}
            {!loading && !error && (
              <div className="hidden sm:flex items-center gap-3">
                <div
                  className="px-4 py-2 rounded-xl text-center"
                  style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}
                >
                  <p className="text-2xl font-bold" style={{ color: "#D73A30" }}>{products.length}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: "#872924" }}>Products</p>
                </div>
                <div
                  className="px-4 py-2 rounded-xl text-center"
                  style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}
                >
                  <p className="text-2xl font-bold" style={{ color: "#D73A30" }}>
                    {products.reduce((sum, p) => sum + (p.ticketCount || 0), 0)}
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: "#872924" }}>Total Tickets</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEARCH BAR — styled to match ProfilePage input style ── */}
        {!loading && !error && products.length > 0 && (
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <SectionHeader title="Cari Produk" />
            <div className="px-6 py-4">
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  style={{ color: "#D73A30", opacity: 0.6 }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari nama produk, kode, atau tiket…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-lg text-slate-800 placeholder-slate-400 transition focus:outline-none"
                  style={{ border: "1.5px solid #fcd5d3" }}
                  onFocus={e => {
                    e.currentTarget.style.boxShadow   = "0 0 0 2px rgba(215,58,48,0.2)";
                    e.currentTarget.style.borderColor = "#D73A30";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow   = "none";
                    e.currentTarget.style.borderColor = "#fcd5d3";
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
                    style={{ color: "#D73A30" }}
                  >
                    <Icon d="M18 6L6 18M6 6l12 12" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING GRID ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── ERROR STATE — uses ProfilePage red palette ── */}
        {!loading && error && (
          <div
            className="bg-white rounded-2xl px-6 py-10 flex flex-col items-center text-center gap-4"
            style={{ border: "1px solid #fca5a5", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}
            >
              <AlertIcon size={24} style={{ color: "#D73A30" }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#D73A30" }}>Gagal memuat data</h3>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
            <button
              onClick={loadProducts}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(90deg, #D73A30, #872924)",
                boxShadow:  "0 4px 12px rgba(215,58,48,0.25)",
              }}
            >
              <RefreshIcon size={14} />
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && products.length === 0 && (
          <div
            className="bg-white rounded-2xl px-6 py-16 flex flex-col items-center text-center gap-4"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}
            >
              <InboxIcon size={28} style={{ color: "#D73A30", opacity: 0.6 }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-700">Belum ada produk</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Produk akan muncul di sini setelah Anda membuat support ticket
                yang mencantumkan produk.
              </p>
            </div>
          </div>
        )}

        {/* ── SEARCH EMPTY ── */}
        {!loading && !error && products.length > 0 && filtered.length === 0 && (
          <div
            className="bg-white rounded-2xl px-6 py-12 flex flex-col items-center text-center gap-3"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}
            >
              <Icon
                d="M21 21l-4.35-4.35 M11 11a8 8 0 100-16 8 8 0 000 16"
                size={22}
                style={{ color: "#D73A30", opacity: 0.6 }}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-600">Tidak ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada produk yang cocok dengan "<strong>{search}</strong>"
              </p>
            </div>
            <button
              onClick={() => setSearch("")}
              className="text-xs font-medium transition hover:opacity-80"
              style={{ color: "#D73A30" }}
            >
              Hapus pencarian
            </button>
          </div>
        )}

        {/* ── PRODUCT GRID ── */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {search && (
              <p className="text-xs -mb-2" style={{ color: "#872924", opacity: 0.7 }}>
                Menampilkan {filtered.length} dari {products.length} produk
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default ProductPage;