import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HeaderSection, FilterBar, DataTable, Modal, FormField, FormInput,
  PrimaryBtn, Toast, StatusBadge, Icon, EmptyState
} from "../components/ui/SharedComponents";
import { PRODUCTS, CUSTOMERS, INITIAL_CUSTOMER_PRODUCTS, getProductById, delay } from "./productStore";

const PAGE_SIZE = 10;

/* ─── PRODUCT ASSIGNMENT SECTION in Modal ────────────────────── */
const ProductAssignSection = ({ assigned, onChange }) => {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p =>
    !search ||
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.productId.toLowerCase().includes(search.toLowerCase())
  );
  const toggle = (id) => {
    if (assigned.includes(id)) onChange(assigned.filter(a => a !== id));
    else onChange([...assigned, id]);
  };
  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search products to assign…"
        className="w-full px-3 py-2 text-sm rounded-lg outline-none mb-2"
        style={{ border: "1.5px solid #fcd5d3" }}
        onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
        onBlur={e  => { e.currentTarget.style.borderColor = "#fcd5d3"; }}
      />
      <div className="max-h-48 overflow-y-auto rounded-lg border" style={{ borderColor: "#fcd5d3" }}>
        {filtered.length === 0 && (
          <p className="p-3 text-xs text-slate-400 text-center">No products found</p>
        )}
        {filtered.map(p => {
          const checked = assigned.includes(p.productId);
          return (
            <label
              key={p.productId}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors"
              style={{ background: checked ? "#fff5f5" : "white", borderBottom: "1px solid #fdf2f2" }}
              onMouseEnter={e => { if (!checked) e.currentTarget.style.background = "#fdf9f9"; }}
              onMouseLeave={e => { e.currentTarget.style.background = checked ? "#fff5f5" : "white"; }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.productId)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "#D73A30" }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-700 truncate">{p.productName}</div>
                <div className="text-xs text-slate-400 font-mono">{p.productId} · {p.principal}</div>
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-1">{assigned.length} product(s) assigned</p>
    </div>
  );
};

/* ─── ASSIGN / EDIT MODAL ────────────────────────────────────── */
const AssignModal = ({ open, onClose, initial, onAssign }) => {
  const isEdit = !!initial?.id;
  const blank  = {
    customerId: "", serviceType: "", projectNo: "", purchaseDate: "", startDate: "", endDate: "",
    dcDrc: "", l1pic: "", l2pic: "", sales: "", spkNumber: "", poNumber: "",
    pmInclude: false, pmSchedule: "", status: "Active", productIds: []
  };
  const [form,   setForm]   = useState(blank);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? { ...blank, ...initial } : blank);
    setErrors({});
  }, [initial, open]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedCustomer = CUSTOMERS.find(c => c.namingConvention === form.customerId);

  const validate = () => {
    const e = {};
    if (!form.customerId)          e.customerId  = "Required";
    if (!form.serviceType)         e.serviceType = "Required";
    if (!form.projectNo.trim())    e.projectNo   = "Required";
    if (!form.startDate)           e.startDate   = "Required";
    if (!form.endDate)             e.endDate     = "Required";
    if (form.productIds.length === 0) e.productIds = "Assign at least one product";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleAssign = async () => {
    if (!validate()) return;
    setSaving(true);
    await delay(400);
    setSaving(false);
    onAssign({ ...form, customerName: selectedCustomer?.customerName ?? "", customerType: selectedCustomer?.customerType ?? "" }, isEdit);
  };

  const Section = ({ label }) => (
    <div className="col-span-full mt-2 mb-1">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "#fcd5d3" }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#872924" }}>{label}</span>
        <div className="flex-1 h-px" style={{ background: "#fcd5d3" }} />
      </div>
    </div>
  );

  const ErrMsg = ({ field }) => errors[field]
    ? <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors[field]}</p>
    : null;

  const inputStyle = (field) => ({
    border: errors[field] ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3"
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Customer Assignment" : "Assign Products to Customer"} width="max-w-3xl">
      <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-0">
        <div className="grid grid-cols-2 gap-4">

          <Section label="Customer Information" />

          {/* Customer selector */}
          <div className="col-span-2">
            <FormField label="Customer" required>
              <select
                value={form.customerId}
                onChange={set("customerId")}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                style={{ border: errors.customerId ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3", color: "#374151" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
                onBlur={e  => { e.currentTarget.style.borderColor = errors.customerId ? "#ef4444" : "#fcd5d3"; }}
              >
                <option value="">— Select Customer —</option>
                {CUSTOMERS.map(c => (
                  <option key={c.namingConvention} value={c.namingConvention}>
                    {c.customerName} ({c.namingConvention})
                  </option>
                ))}
              </select>
              <ErrMsg field="customerId" />
            </FormField>
          </div>

          {selectedCustomer && (
            <>
              <FormField label="Customer Type">
                <FormInput value={selectedCustomer.customerType} readOnly />
              </FormField>
              <FormField label="Head Office">
                <FormInput value={selectedCustomer.headOffice} readOnly />
              </FormField>
            </>
          )}

          <Section label="Assigned Products" />
          <div className="col-span-2">
            <FormField label="Select Products" required>
              <ProductAssignSection
                assigned={form.productIds}
                onChange={(ids) => setForm(f => ({ ...f, productIds: ids }))}
              />
              <ErrMsg field="productIds" />
            </FormField>
          </div>

          <Section label="Service Details" />

          <FormField label="Service Type" required>
            <select
              value={form.serviceType}
              onChange={set("serviceType")}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{ border: errors.serviceType ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3", color: "#374151" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = errors.serviceType ? "#ef4444" : "#fcd5d3"; }}
            >
              <option value="">— Select Type —</option>
              <option>JSL</option>
              <option>ALF</option>
              <option>SLA</option>
            </select>
            <ErrMsg field="serviceType" />
          </FormField>

          <FormField label="Project Number" required>
            <FormInput placeholder="e.g. PRJ-2026-001" value={form.projectNo} onChange={set("projectNo")} style={inputStyle("projectNo")} />
            <ErrMsg field="projectNo" />
          </FormField>

          <FormField label="Start Date" required>
            <FormInput type="date" value={form.startDate} onChange={set("startDate")} style={inputStyle("startDate")} />
            <ErrMsg field="startDate" />
          </FormField>

          <FormField label="End Date" required>
            <FormInput type="date" value={form.endDate} onChange={set("endDate")} style={inputStyle("endDate")} />
            <ErrMsg field="endDate" />
          </FormField>

          <FormField label="Purchase Date">
            <FormInput type="date" value={form.purchaseDate} onChange={set("purchaseDate")} />
          </FormField>

          <FormField label="DC/DRC">
            <FormInput placeholder="e.g. Jakarta DC" value={form.dcDrc} onChange={set("dcDrc")} />
          </FormField>

          <Section label="Person In Charge" />

          <FormField label="L1 PIC">
            <FormInput placeholder="e.g. Redi" value={form.l1pic} onChange={set("l1pic")} />
          </FormField>
          <FormField label="L2 PIC">
            <FormInput placeholder="e.g. Regar" value={form.l2pic} onChange={set("l2pic")} />
          </FormField>
          <div className="col-span-2">
            <FormField label="Sales">
              <FormInput placeholder="e.g. Dedy Syahputra" value={form.sales} onChange={set("sales")} />
            </FormField>
          </div>

          <Section label="Contract" />

          <FormField label="SPK Number">
            <FormInput placeholder="SPK-2026-001" value={form.spkNumber} onChange={set("spkNumber")} />
          </FormField>
          <FormField label="PO Number">
            <FormInput placeholder="PO-2026-001" value={form.poNumber} onChange={set("poNumber")} />
          </FormField>

          <Section label="Preventive Maintenance" />

          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.pmInclude}
                onChange={e => setForm(f => ({ ...f, pmInclude: e.target.checked }))}
                className="w-4 h-4 rounded"
                style={{ accentColor: "#D73A30" }}
              />
              <span className="text-sm font-semibold text-slate-700">Include PM</span>
            </label>
          </div>

          {form.pmInclude && (
            <div className="col-span-2">
              <FormField label="PM Schedule">
                <FormInput placeholder="e.g. Every 3 months" value={form.pmSchedule} onChange={set("pmSchedule")} />
              </FormField>
            </div>
          )}

          <Section label="Status" />

          <FormField label="Status">
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{ border: "1.5px solid #fcd5d3", color: "#374151" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "#fcd5d3"; }}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: "#fcd5d3" }}>
        <PrimaryBtn variant="ghost" onClick={onClose}>Cancel</PrimaryBtn>
        <PrimaryBtn onClick={handleAssign} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update Assignment" : "Assign Products"}
        </PrimaryBtn>
      </div>
    </Modal>
  );
};

/* ─── DETAIL VIEW MODAL ──────────────────────────────────────── */
const DetailModal = ({ open, onClose, record }) => {
  if (!record) return null;
  const products = (record.productIds || []).map(id => getProductById(id)).filter(Boolean);

  const Info = ({ label, value }) => (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Assignment Details" width="max-w-2xl">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Customer info */}
        <div className="p-4 rounded-xl" style={{ background: "#fff5f5", border: "1px solid #fcd5d3" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#872924" }}>Customer</p>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Customer Name"   value={record.customerName} />
            <Info label="Customer Type"   value={record.customerType} />
            <Info label="Naming Conv."    value={record.customerId} />
            <Info label="Status"          value={record.status} />
          </div>
        </div>

        {/* Assigned products */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#872924" }}>
            Assigned Products ({products.length})
          </p>
          {products.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ background: "#f8f0f0" }}>
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm font-semibold text-slate-500">No products assigned</p>
              <p className="text-xs text-slate-400 mt-1">Edit this record to assign products</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#f3e8e8" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "linear-gradient(90deg,#8B1A15,#B71C1C)" }}>
                    {["Product Name", "Product ID", "Principal", "Principal ID"].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-xs font-bold text-white uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.productId} style={{ background: i % 2 === 0 ? "white" : "#fffafa", borderBottom: "1px solid #fdf2f2" }}>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{p.productName}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.productId}</td>
                      <td className="px-4 py-2.5 text-slate-600">{p.principal}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.principalId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Service info */}
        <div className="p-4 rounded-xl" style={{ background: "#f8f0f0" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#872924" }}>Service</p>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Service Type"   value={record.serviceType} />
            <Info label="Project No"     value={record.projectNo} />
            <Info label="Start Date"     value={record.startDate} />
            <Info label="End Date"       value={record.endDate} />
            <Info label="DC/DRC"         value={record.dcDrc} />
            <Info label="PM Included"    value={record.pmInclude ? "Yes" : "No"} />
            {record.pmInclude && <Info label="PM Schedule" value={record.pmSchedule} />}
            <Info label="L1 PIC"         value={record.l1pic} />
            <Info label="L2 PIC"         value={record.l2pic} />
            <Info label="Sales"          value={record.sales} />
            <Info label="SPK Number"     value={record.spkNumber} />
            <Info label="PO Number"      value={record.poNumber} />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 pt-4 border-t" style={{ borderColor: "#fcd5d3" }}>
        <PrimaryBtn onClick={onClose}>Close</PrimaryBtn>
      </div>
    </Modal>
  );
};

/* ─── MAIN PAGE ──────────────────────────────────────────────── */
function AdminCustomerProductsPage() {
  const [items,      setItems]      = useState(() => INITIAL_CUSTOMER_PRODUCTS.map(r => ({ ...r })));
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast,      setToast]      = useState(null);
  const [modal,      setModal]      = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [page,       setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    await delay(600);
    setItems(INITIAL_CUSTOMER_PRODUCTS.map(r => ({ ...r })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const filtered = useMemo(() =>
    items.filter(r => {
      const matchSearch = !search ||
        r.customerName?.toLowerCase().includes(search.toLowerCase())    ||
        r.customerId?.toLowerCase().includes(search.toLowerCase())       ||
        r.customerType?.toLowerCase().includes(search.toLowerCase())     ||
        r.projectNo?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || r.status?.toLowerCase() === filterStatus;
      return matchSearch && matchStatus;
    }), [items, search, filterStatus]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const showToast  = (msg, type = "success") => setToast({ type, message: msg });

  /* CRUD */
  const handleAssign = (form, isEdit) => {
    if (isEdit) {
      setItems(prev => prev.map(r => r.id === form.id ? { ...r, ...form } : r));
      showToast("Assignment updated successfully");
    } else {
      const newId = `CP${String(Date.now()).slice(-5)}`;
      const maxNo = Math.max(0, ...items.map(i => i.no));
      setItems(prev => [...prev, { ...form, id: newId, no: maxNo + 1 }]);
      showToast("Products assigned successfully");
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    await delay(250);
    setItems(prev => prev.filter(r => r.id !== delTarget.id));
    showToast("Assignment deleted successfully");
    setDelTarget(null);
  };

  const activeCount   = items.filter(i => i.status === "Active").length;
  const inactiveCount = items.filter(i => i.status === "Inactive").length;

  const cols = [
    { header: "No",             key: "no",           cellStyle: { fontWeight: 600, color: "#872924", width: 48 } },
    { header: "Customer Name",  key: "customerName",
      render: (v, r) => (
        <div>
          <div className="font-semibold text-slate-800">{v}</div>
          <div className="text-xs text-slate-400 font-mono">{r.customerId}</div>
        </div>
      )
    },
    { header: "Customer Type",  key: "customerType", cellStyle: { fontSize: "12px", color: "#475569" } },
    { header: "Assigned Products", key: "productIds",
      render: (ids) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(#D73A30,#872924)" }}>
            {(ids || []).length}
          </span>
          <span className="text-xs text-slate-500">products</span>
        </div>
      )
    },
    { header: "Service",   key: "serviceType",
      render: (v) => v ? (
        <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">{v}</span>
      ) : "—"
    },
    { header: "Project No",  key: "projectNo",   cellStyle: { fontFamily: "monospace", fontSize: "12px" } },
    { header: "Period",      key: "startDate",
      render: (v, r) => <span className="text-xs text-slate-500">{v} → {r.endDate}</span>
    },
    { header: "PM",          key: "pmInclude",
      render: (v) => (
        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${v ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          {v ? "Yes" : "No"}
        </span>
      )
    },
    { header: "Status",      key: "status",  render: (v) => <StatusBadge status={v} /> },
    { header: "Detail",      key: "_detail",
      render: (_, r) => (
        <button
          onClick={() => setDetail(r)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
          style={{ background: "#fff5f5", color: "#D73A30", border: "1px solid #fcd5d3" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#D73A30"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#D73A30"; }}
        >
          View
        </button>
      )
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: "#f8f0f0" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="Customer Products"
        subtitle="Manage product assignments per customer"
        breadcrumb={["Portal", "Customer Products"]}
        icon={<Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" size={22} />}
        stats={[
          { value: items.length,        label: "Assignments" },
          { value: CUSTOMERS.length,    label: "Customers"   },
          { value: activeCount,         label: "Active"      },
          { value: inactiveCount,       label: "Inactive"    },
        ]}
        actions={[
          { label: "Refresh", icon: <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" size={14} className={loading ? "animate-spin" : ""} />, variant: "outline", onClick: load, disabled: loading },
        ]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search customer, project no…"
        filters={[
          {
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: "all",      label: "All Status" },
              { value: "active",   label: "Active"     },
              { value: "inactive", label: "Inactive"   },
            ],
          },
        ]}
        onReset={() => { setSearch(""); setFilterStatus("all"); }}
      />

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f3e8e8" }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#fdf2f2" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <span className="text-sm font-bold text-slate-700">Customer Assignments</span>
            <span className="text-xs text-slate-400">{filtered.length} records</span>
          </div>
          <PrimaryBtn size="sm" onClick={() => setModal({ mode: "add", data: null })}>
            <Icon d="M12 5v14 M5 12h14" size={13} /> Assign
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

      <AssignModal open={!!modal} onClose={() => setModal(null)} initial={modal?.data} onAssign={handleAssign} />
      <DetailModal open={!!detail} onClose={() => setDetail(null)} record={detail} />

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Confirm Delete" width="max-w-sm">
        <p className="text-sm text-slate-600 mb-6">
          Remove assignment for <strong>{delTarget?.customerName}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <PrimaryBtn variant="ghost" onClick={() => setDelTarget(null)}>Cancel</PrimaryBtn>
          <PrimaryBtn onClick={handleDelete}>Delete</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerProductsPage;
