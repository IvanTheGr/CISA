import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HeaderSection, FilterBar, DataTable, Modal, FormField, FormInput, FormTextarea,
  PrimaryBtn, Toast, Icon, EmptyState
} from "../components/ui/SharedComponents";
import { PRODUCTS, delay } from "./productStore";

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const PAGE_SIZE = 10;

/* ─── ADD / EDIT MODAL ───────────────────────────────────────── */
const ProductModal = ({ open, onClose, initial, onSave }) => {
  const isEdit = !!initial?.productId;
  const blank  = { productName: "", principal: "", productId: "", principalId: "" };
  const [form,   setForm]   = useState(blank);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? { ...initial } : blank);
    setErrors({});
  }, [initial, open]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = "Required";
    if (!form.principal.trim())   e.principal   = "Required";
    if (!form.productId.trim())   e.productId   = "Required";
    if (!form.principalId.trim()) e.principalId = "Required";
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

  const Field = ({ label, field, placeholder, required }) => (
    <FormField label={label} required={required}>
      <FormInput
        placeholder={placeholder}
        value={form[field] ?? ""}
        onChange={set(field)}
        style={errors[field] ? { borderColor: "#ef4444" } : {}}
      />
      {errors[field] && (
        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors[field]}</p>
      )}
    </FormField>
  );

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"} width="max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Product Name"  field="productName"  placeholder="e.g. Base 24"       required />
        <Field label="Principal"     field="principal"    placeholder="e.g. ACI Products"   required />
        <Field label="Product ID"    field="productId"    placeholder="e.g. B24C"           required />
        <Field label="Principal ID"  field="principalId"  placeholder="e.g. PACI"           required />
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: "#fcd5d3" }}>
        <PrimaryBtn variant="ghost" onClick={onClose}>Cancel</PrimaryBtn>
        <PrimaryBtn onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update Product" : "Save Product"}
        </PrimaryBtn>
      </div>
    </Modal>
  );
};

/* ─── MAIN PAGE ──────────────────────────────────────────────── */
function AdminProductsPage() {
  const [products, setProducts] = useState(() => PRODUCTS.map(p => ({ ...p })));
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState(null);
  const [modal,    setModal]    = useState(null);   // null | { mode, data }
  const [delTarget,setDelTarget]= useState(null);
  const [page,     setPage]     = useState(1);

  /* simulate initial fetch */
  const load = useCallback(async () => {
    setLoading(true);
    await delay(600);
    setProducts(PRODUCTS.map(p => ({ ...p })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* reset page on search change */
  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() =>
    products.filter(p => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.productName?.toLowerCase().includes(s) ||
        p.productId?.toLowerCase().includes(s)   ||
        p.principal?.toLowerCase().includes(s)   ||
        p.principalId?.toLowerCase().includes(s)
      );
    }), [products, search]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const principals = [...new Set(products.map(p => p.principal))];

  const showToast = (message, type = "success") =>
    setToast({ type, message });

  /* ── CRUD handlers ── */
  const handleSave = (form, isEdit) => {
    if (isEdit) {
      setProducts(prev => prev.map(p =>
        p.productId === form.productId ? { ...p, ...form } : p
      ));
      showToast("Product updated successfully");
    } else {
      const maxNo = Math.max(0, ...products.map(p => p.no));
      setProducts(prev => [...prev, { ...form, no: maxNo + 1 }]);
      showToast("Product added successfully");
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    await delay(250);
    setProducts(prev => prev.filter(p => p.productId !== delTarget.productId));
    showToast("Product deleted successfully");
    setDelTarget(null);
  };

  /* ── Column definitions ── */
  const cols = [
    { header: "No",           key: "no",          cellStyle: { fontWeight: 600, color: "#872924", width: 48 } },
    { header: "Product Name", key: "productName",  cellStyle: { fontWeight: 600, color: "#1e293b" } },
    { header: "Principal",    key: "principal" },
    { header: "Product ID",   key: "productId",    cellStyle: { fontFamily: "monospace", fontSize: "12px", color: "#475569" } },
    { header: "Principal ID", key: "principalId",  cellStyle: { fontFamily: "monospace", fontSize: "12px", color: "#475569" } },
  ];

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: "#f8f0f0" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="Products"
        subtitle="Product master data linked to support tickets"
        breadcrumb={["Portal", "Products"]}
        icon={<Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" size={22} />}
        stats={[
          { value: products.length,   label: "Total Products"   },
          { value: principals.length, label: "Total Principals" },
        ]}
        actions={[
          { label: "Dump",    icon: <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" size={14} />, variant: "outline", onClick: () => {} },
          { label: "Refresh", icon: <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" size={14} className={loading ? "animate-spin" : ""} />, variant: "outline", onClick: load, disabled: loading },
        ]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by name, product ID, principal…"
        onReset={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f3e8e8" }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#fdf2f2" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#D73A30, #872924)" }} />
            <span className="text-sm font-bold text-slate-700">List Of Products</span>
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
          rowsCount={products.length}
          onEdit={(row)   => setModal({ mode: "edit", data: { ...row } })}
          onDelete={(row) => setDelTarget(row)}
        />

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
                  style={n === page
                    ? { background: "linear-gradient(#D73A30,#872924)", color: "white" }
                    : { background: "#f8f0f0", color: "#475569" }
                  }
                >{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProductModal
        open={!!modal}
        onClose={() => setModal(null)}
        initial={modal?.data}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Confirm Delete" width="max-w-sm">
        <p className="text-sm text-slate-600 mb-6">
          Delete <strong>{delTarget?.productName}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <PrimaryBtn variant="ghost" onClick={() => setDelTarget(null)}>Cancel</PrimaryBtn>
          <PrimaryBtn onClick={handleDelete}>Delete</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}

export default AdminProductsPage;
