import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HeaderSection, FilterBar, DataTable, Modal, FormField,
  PrimaryBtn, Toast, Icon
} from "../components/ui/SharedComponents";
import {
  fetchSlaConfigs,
  fetchPartnerLookup, fetchProductLookup, fetchPriorityLookup,
} from "../api/sla_api";

let _slaSeq = 1;

const generateSlaId = (productName) => {
  const alpha  = (productName ?? "").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const first  = alpha[0]                ?? "X";
  const last   = alpha[alpha.length - 1] ?? "X";
  const prefix = (first + last).padEnd(2, "X");
  return prefix + String(_slaSeq++).padStart(3, "0");
};

const PAGE_SIZE = 10;

const REMARKS_OPTIONS = [
  { id: "contract", name: "By Contract" },
  { id: "none",     name: "None"        },
];

const remarkLabel = (v) =>
  v === "contract" ? "By Contract" : v === "none" ? "None" : v || "—";

/* ─── Shared field helpers ──────────────────────────────────────── */

const SelectField = ({ label, value, onChange, options, placeholder, error, required }) => (
  <FormField label={label} required={required}>
    <select
      value={value ?? ""}
      onChange={onChange}
      className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
      style={{
        border: error ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3",
        color: value ? "#374151" : "#9ca3af",
      }}
      onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
      onBlur={e  => { e.currentTarget.style.borderColor = error ? "#ef4444" : "#fcd5d3"; }}
    >
      <option value="">{placeholder || "— Select —"}</option>
      {options.map(o => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
    {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
  </FormField>
);

const TimeInput = ({ value, onChange, error, disabled }) => (
  <input
    type="number"
    min="0"
    step="0.5"
    value={value ?? ""}
    onChange={onChange}
    disabled={disabled}
    placeholder="—"
    className="w-full px-3 py-2 text-sm rounded-lg outline-none text-center"
    style={{
      border: error ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3",
      color: disabled ? "#9ca3af" : "#374151",
      background: disabled ? "#fafafa" : "white",
    }}
    onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = "#D73A30"; }}
    onBlur={e  => { if (!disabled) e.currentTarget.style.borderColor = error ? "#ef4444" : "#fcd5d3"; }}
  />
);

/* ─── ADD / EDIT MODAL ──────────────────────────────────────────── */
const BLANK_FORM = { partnerId: "", productId: "", priorityId: "", responseTime: "", resolutionTime: "", remarks: "" };

const SlaModal = ({ open, onClose, initial, onSave, partners, products, priorities }) => {
  const isEdit = !!initial?.id;
  const [form,   setForm]   = useState(BLANK_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm(isEdit && initial ? {
      partnerId:      String(initial.partnerId  ?? ""),
      productId:      String(initial.productId  ?? ""),
      priorityId:     String(initial.priorityId ?? ""),
      responseTime:   initial.responseTime   ?? "",
      resolutionTime: initial.resolutionTime ?? "",
      remarks:        initial.countdownCondition ?? "",
    } : BLANK_FORM);
    setErrors({});
  }, [open, initial, isEdit]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.partnerId)    e.partnerId    = "Required";
    if (!form.productId)    e.productId    = "Required";
    if (!form.priorityId)   e.priorityId   = "Required";
    if (!form.responseTime) e.responseTime = "Required";
    if (!form.resolutionTime) e.resolutionTime = "Required";
    if (!form.remarks)      e.remarks      = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    const partner  = partners.find(p  => String(p.id)  === form.partnerId);
    const product  = products.find(p  => String(p.id)  === form.productId);
    const priority = priorities.find(p => String(p.id) === form.priorityId);
    onSave([{
      id:                 isEdit ? initial.id : generateSlaId(product?.name),
      partnerId:          Number(form.partnerId),
      partnerName:        partner?.name  ?? "",
      productId:          Number(form.productId),
      productName:        product?.name  ?? "",
      priorityId:         Number(form.priorityId),
      priorityName:       priority?.name ?? "",
      responseTime:       Number(form.responseTime),
      resolutionTime:     Number(form.resolutionTime),
      countdownCondition: form.remarks,
    }], isEdit);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit SLA Rule — ID #${initial?.id}` : "Add SLA Rule"}
      width="max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Customer (Partner)" required
          value={form.partnerId} onChange={set("partnerId")}
          options={partners} placeholder="— Select Customer —" error={errors.partnerId} />
        <SelectField label="Product" required
          value={form.productId} onChange={set("productId")}
          options={products} placeholder="— Select Product —" error={errors.productId} />
        <SelectField label="Priority" required
          value={form.priorityId} onChange={set("priorityId")}
          options={priorities} placeholder="— Select Priority —" error={errors.priorityId} />
        <SelectField label="Remarks" required
          value={form.remarks} onChange={set("remarks")}
          options={REMARKS_OPTIONS} placeholder="— Select Remarks —" error={errors.remarks} />
        <FormField label="Response Time (h)" required>
          <TimeInput value={form.responseTime} onChange={set("responseTime")} error={errors.responseTime} />
          {errors.responseTime && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.responseTime}</p>}
        </FormField>
        <FormField label="Resolution Time (h)" required>
          <TimeInput value={form.resolutionTime} onChange={set("resolutionTime")} error={errors.resolutionTime} />
          {errors.resolutionTime && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.resolutionTime}</p>}
        </FormField>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: "#fcd5d3" }}>
        <PrimaryBtn variant="ghost" onClick={onClose}>Cancel</PrimaryBtn>
        <PrimaryBtn onClick={handleSave}>{isEdit ? "Update" : "Save"}</PrimaryBtn>
      </div>
    </Modal>
  );
};

/* ─── Priority badge ────────────────────────────────────────────── */
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
  const cls = Object.entries(PRIORITY_COLORS).find(([k]) => key.includes(k))?.[1]
    ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-bold border ${cls}`}>
      {name || "—"}
    </span>
  );
};

/* ─── MAIN ──────────────────────────────────────────────────────── */
function SLAConfiguration() {
  const [items,      setItems]      = useState([]);
  const [partners,   setPartners]   = useState([]);
  const [products,   setProducts]   = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [toast,      setToast]      = useState(null);
  const [modal,      setModal]      = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [page,       setPage]       = useState(1);

  const showToast = (msg, type = "success") => setToast({ type, message: msg });

  const loadLookups = useCallback(async () => {
    try {
      const [p, pr, pri] = await Promise.all([
        fetchPartnerLookup(), fetchProductLookup(), fetchPriorityLookup(),
      ]);
      setPartners(p.data);
      setProducts(pr.data);
      setPriorities(pri.data);
    } catch {
      /* server not ready yet — dropdowns stay empty */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSlaConfigs();
      setItems(res.data.map((r, i) => ({ ...r, no: i + 1 })));
    } catch {
      /* server not ready yet — start with empty list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLookups(); load(); }, [load, loadLookups]);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() =>
    items.filter(r => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        String(r.id).includes(s) ||
        r.partnerName?.toLowerCase().includes(s)  ||
        r.productName?.toLowerCase().includes(s)  ||
        r.priorityName?.toLowerCase().includes(s) ||
        remarkLabel(r.countdownCondition).toLowerCase().includes(s)
      );
    }), [items, search]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /* CRUD */
  const handleSave = (savedList, isEdit) => {
    if (isEdit) {
      const saved = savedList[0];
      setItems(prev => prev.map(r => r.id === saved.id ? { ...saved, no: r.no } : r));
      showToast("SLA updated");
    } else {
      setItems(prev => {
        const next = [...prev];
        savedList.forEach(s => next.push({ ...s, no: next.length + 1 }));
        return next;
      });
      showToast(`${savedList.length} SLA ${savedList.length !== 1 ? "s" : ""} created`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!delTarget) return;
    setItems(prev => prev.filter(r => r.id !== delTarget.id).map((r, i) => ({ ...r, no: i + 1 })));
    showToast("SLA deleted");
    setDelTarget(null);
  };

  const cols = [
    { header: "No",       key: "no",          cellStyle: { fontWeight: 600, color: "#872924", width: 48 } },
    { header: "ID",       key: "id",           cellStyle: { fontFamily: "monospace", fontWeight: 700, color: "#374151" } },
    { header: "Customer", key: "partnerName",  cellStyle: { fontWeight: 600, color: "#1e293b" } },
    { header: "Product",  key: "productName",  cellStyle: { color: "#334155" } },
    { header: "Priority", key: "priorityName", render: (v) => priorityBadge(v) },
    {
      header: "Response (h)", key: "responseTime",
      cellStyle: { textAlign: "left" },
      render: (v) => v != null ? <span className="font-mono text-sm">{v}h</span> : "—",
    },
    {
      header: "Resolution (h)", key: "resolutionTime",
      cellStyle: { textAlign: "left" },
      render: (v) => v != null ? <span className="font-mono text-sm">{v}h</span> : "—",
    },
    {
      header: "Remarks", key: "countdownCondition",
      render: (v) => {
        const label = remarkLabel(v);
        const cls   = v === "contract"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-slate-50 text-slate-500 border-slate-200";
        return (
          <span className={`px-2 py-0.5 text-xs rounded-full font-semibold border ${cls}`}>
            {label}
          </span>
        );
      },
    },
  ];

  const uniqueCustomers = [...new Set(items.map(r => r.partnerId))].length;
  const uniqueProducts  = [...new Set(items.map(r => r.productId))].length;

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: "#f8f0f0" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="SLA Configuration"
        subtitle="Service Level Agreement by customer, product, and priority"
        breadcrumb={["Portal", "Ticket", "SLA Config"]}
        icon={<Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={22} />}
        stats={[
          { value: items.length,    label: "SLA"  },
          { value: uniqueCustomers, label: "Customers"  },
          { value: uniqueProducts,  label: "Products"   },
        ]}
        actions={[{
          label: "Refresh",
          icon: <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" size={14} className={loading ? "animate-spin" : ""} />,
          variant: "outline",
          onClick: load,
          disabled: loading,
        }]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search customer, product, priority, remarks…"
        onReset={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f3e8e8" }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#fdf2f2" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <span className="text-sm font-bold text-slate-700">SLA</span>
            <span className="text-xs text-slate-400">{filtered.length} records</span>
          </div>
          <PrimaryBtn size="sm" onClick={() => setModal({ mode: "add", data: null })}>
            <Icon d="M12 5v14 M5 12h14" size={13} /> Add SLA
          </PrimaryBtn>
        </div>

        <DataTable
          columns={cols}
          data={paginated}
          loading={loading}
          rowsCount={items.length}
          onEdit={(row)   => setModal({ mode: "edit", data: { ...row } })}
          onDelete={(row) => setDelTarget(row)}
        />

        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between border-t text-xs text-slate-500" style={{ borderColor: "#fdf2f2" }}>
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                  style={n === page
                    ? { background: "linear-gradient(#D73A30,#872924)", color: "white" }
                    : { background: "#f8f0f0", color: "#475569" }
                  }>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <SlaModal
        open={!!modal}
        onClose={() => setModal(null)}
        initial={modal?.data}
        onSave={handleSave}
        partners={partners}
        products={products}
        priorities={priorities}
      />

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Confirm Delete" width="max-w-sm">
        <p className="text-sm text-slate-600 mb-1">
          Delete SLA — <strong>ID #{delTarget?.id}</strong>?
        </p>
        <p className="text-xs text-slate-400 mb-6">
          {delTarget?.partnerName} · {delTarget?.productName} · {delTarget?.priorityName}
        </p>
        <div className="flex justify-end gap-3">
          <PrimaryBtn variant="ghost" onClick={() => setDelTarget(null)}>Cancel</PrimaryBtn>
          <PrimaryBtn onClick={handleDelete}>Delete</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}

export default SLAConfiguration;
