import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HeaderSection, FilterBar, DataTable, Modal, FormField, FormInput, FormTextarea,
  PrimaryBtn, Toast, Icon
} from "../components/ui/SharedComponents";
import { PRODUCTS, INITIAL_SUB_PRODUCTS, delay } from "./productStore";

const PAGE_SIZE = 10;

/* ─── ADD / EDIT MODAL ───────────────────────────────────────── */
const SubProductModal = ({ open, onClose, initial, onSave }) => {
  const isEdit = !!initial?.id;
  const blank  = {
    parentProductId: "", parentProductName: "", principal: "",
    subProductName: "", subProductCode: "", moduleId: "", materialType: "", description: ""
  };
  const [form,   setForm]   = useState(blank);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? { ...blank, ...initial } : blank);
    setErrors({});
  }, [initial, open]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  /* auto-fill principal when parent product changes */
  const handleParentChange = (e) => {
    const pid  = e.target.value;
    const prod = PRODUCTS.find(p => p.productId === pid);
    setForm(f => ({
      ...f,
      parentProductId:   pid,
      parentProductName: prod?.productName ?? "",
      principal:         prod?.principal   ?? "",
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.parentProductId)    e.parentProductId  = "Required";
    if (!form.subProductName.trim()) e.subProductName = "Required";
    if (!form.subProductCode.trim()) e.subProductCode = "Required";
    if (!form.materialType.trim())   e.materialType   = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await delay(350);
    setSaving(false);
    onSave(form, isEdit);
  };

  const ErrMsg = ({ field }) => errors[field]
    ? <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors[field]}</p>
    : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Sub Product" : "Add Sub Product"} width="max-w-2xl">
      <div className="grid grid-cols-2 gap-4">

        {/* Parent product selector */}
        <FormField label="Parent Product" required>
          <select
            value={form.parentProductId}
            onChange={handleParentChange}
            className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
            style={{
              border: errors.parentProductId ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3",
              color: "#374151"
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
            onBlur={e  => { e.currentTarget.style.borderColor = errors.parentProductId ? "#ef4444" : "#fcd5d3"; }}
          >
            <option value="">— Select Parent Product —</option>
            {PRODUCTS.map(p => (
              <option key={p.productId} value={p.productId}>
                {p.productName} ({p.productId})
              </option>
            ))}
          </select>
          <ErrMsg field="parentProductId" />
        </FormField>

        {/* Auto-filled principal */}
        <FormField label="Principal">
          <FormInput value={form.principal} readOnly placeholder="Auto-filled from parent" />
        </FormField>

        {/* Sub product name */}
        <FormField label="Sub Product Name" required>
          <FormInput
            placeholder="e.g. ATM Module"
            value={form.subProductName}
            onChange={set("subProductName")}
            style={errors.subProductName ? { borderColor: "#ef4444" } : {}}
          />
          <ErrMsg field="subProductName" />
        </FormField>

        {/* Sub product code */}
        <FormField label="Sub Product Code" required>
          <FormInput
            placeholder="e.g. B24C-ATM"
            value={form.subProductCode}
            onChange={set("subProductCode")}
            style={errors.subProductCode ? { borderColor: "#ef4444" } : {}}
          />
          <ErrMsg field="subProductCode" />
        </FormField>

        {/* Module ID */}
        <FormField label="Module ID">
          <FormInput
            placeholder="e.g. MOD-01"
            value={form.moduleId}
            onChange={set("moduleId")}
          />
        </FormField>

        {/* Material type */}
        <FormField label="Material Type" required>
          <select
            value={form.materialType}
            onChange={set("materialType")}
            className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
            style={{
              border: errors.materialType ? "1.5px solid #ef4444" : "1.5px solid #fcd5d3",
              color: "#374151"
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#D73A30"; }}
            onBlur={e  => { e.currentTarget.style.borderColor = errors.materialType ? "#ef4444" : "#fcd5d3"; }}
          >
            <option value="">— Select Type —</option>
            <option>Software</option>
            <option>Hardware</option>
            <option>License</option>
            <option>Service</option>
          </select>
          <ErrMsg field="materialType" />
        </FormField>

        <div className="col-span-2">
          <FormField label="Description (optional)">
            <FormTextarea
              placeholder="Short description of this sub product"
              value={form.description}
              onChange={set("description")}
              rows={2}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: "#fcd5d3" }}>
        <PrimaryBtn variant="ghost" onClick={onClose}>Cancel</PrimaryBtn>
        <PrimaryBtn onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update" : "Save"}
        </PrimaryBtn>
      </div>
    </Modal>
  );
};

/* ─── MAIN ───────────────────────────────────────────────────── */
function AdminSubProductsPage() {
  const [items,     setItems]     = useState(() => INITIAL_SUB_PRODUCTS.map(s => ({ ...s })));
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [toast,     setToast]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [page,      setPage]      = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    await delay(600);
    setItems(INITIAL_SUB_PRODUCTS.map(s => ({ ...s })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() =>
    items.filter(p => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.subProductName?.toLowerCase().includes(s)  ||
        p.subProductCode?.toLowerCase().includes(s)  ||
        p.parentProductName?.toLowerCase().includes(s) ||
        p.principal?.toLowerCase().includes(s)       ||
        p.parentProductId?.toLowerCase().includes(s)
      );
    }), [items, search]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const showToast  = (msg, type = "success") => setToast({ type, message: msg });

  /* CRUD */
  const handleSave = (form, isEdit) => {
    if (isEdit) {
      setItems(prev => prev.map(p => p.id === form.id ? { ...p, ...form } : p));
      showToast("Sub product updated successfully");
    } else {
      const newId = `SP${String(Date.now()).slice(-5)}`;
      const maxNo = Math.max(0, ...items.map(i => i.no));
      setItems(prev => [...prev, { ...form, id: newId, no: maxNo + 1 }]);
      showToast("Sub product added successfully");
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    await delay(250);
    setItems(prev => prev.filter(p => p.id !== delTarget.id));
    showToast("Sub product deleted successfully");
    setDelTarget(null);
  };

  const cols = [
    { header: "No",               key: "no",              cellStyle: { fontWeight: 600, color: "#872924", width: 48 } },
    { header: "Parent Product",   key: "parentProductName", cellStyle: { fontWeight: 600, color: "#1e293b" } },
    { header: "Sub Product Name", key: "subProductName",   cellStyle: { fontWeight: 500, color: "#334155" } },
    { header: "Sub Product Code", key: "subProductCode",   cellStyle: { fontFamily: "monospace", fontSize: "12px", color: "#475569" } },
    { header: "Principal",        key: "principal" },
    { header: "Module ID",        key: "moduleId",         cellStyle: { fontFamily: "monospace", fontSize: "12px" } },
    { header: "Material Type",    key: "materialType",
      render: (v) => {
        const colorMap = { Software: "bg-purple-50 text-purple-700 border-purple-200", Hardware: "bg-blue-50 text-blue-700 border-blue-200", License: "bg-green-50 text-green-700 border-green-200", Service: "bg-amber-50 text-amber-700 border-amber-200" };
        return <span className={`px-2 py-0.5 text-xs rounded-full font-semibold border ${colorMap[v] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{v || "—"}</span>;
      }
    },
  ];

  const parentCount = [...new Set(items.map(i => i.parentProductId))].length;

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: "#f8f0f0" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="Sub Products"
        subtitle="Sub products linked to parent product master"
        breadcrumb={["Portal", "Sub Products"]}
        icon={<Icon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" size={22} />}
        stats={[
          { value: items.length,  label: "Sub Products"   },
          { value: parentCount,   label: "Parent Products" },
        ]}
        actions={[
          { label: "Dump",    icon: <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" size={14} />, variant: "outline", onClick: () => {} },
          { label: "Refresh", icon: <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" size={14} className={loading ? "animate-spin" : ""} />, variant: "outline", onClick: load, disabled: loading },
        ]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search sub product, parent, principal…"
        onReset={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f3e8e8" }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#fdf2f2" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <span className="text-sm font-bold text-slate-700">List Of Sub Products</span>
            <span className="text-xs text-slate-400">{filtered.length} records</span>
          </div>
          <PrimaryBtn size="sm" onClick={() => setModal({ mode: "add", data: null })}>
            <Icon d="M12 5v14 M5 12h14" size={13} /> Add
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

      <SubProductModal
        open={!!modal}
        onClose={() => setModal(null)}
        initial={modal?.data}
        onSave={handleSave}
      />

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Confirm Delete" width="max-w-sm">
        <p className="text-sm text-slate-600 mb-6">
          Delete <strong>{delTarget?.subProductName}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <PrimaryBtn variant="ghost" onClick={() => setDelTarget(null)}>Cancel</PrimaryBtn>
          <PrimaryBtn onClick={handleDelete}>Delete</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}

export default AdminSubProductsPage;
