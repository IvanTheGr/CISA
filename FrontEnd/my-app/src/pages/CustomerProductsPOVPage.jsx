import { useState, useEffect, useCallback } from "react";
import {
  HeaderSection,
  FilterBar,
  StatusBadge,
  Toast,
  SkeletonCard,
  EmptyState,
  Icons,
  Icon,
  Modal,
  PrimaryBtn,
} from "../components/ui/SharedComponents";

/* ─── MOCK DATA ──────────────────────────────────────────────── */
const mockCustomerProducts = [
  {
    id: 1,

    // Product Mapping
    product_id: "B24C",
    principal_id: "PACI",
    principal_name: "ACI Products",

    // Product Info
    prod_code: "B24C-PD-960",
    sub_prod_code: "B24C-SUB-986",
    cust_code: "CUST-001",
    name: "BASE24 DC",
    productName: "BASE24 DC",
    materialType: "Software",

    // Service Info
    srv_type: "JSL",
    serviceType: "JSL",
    serviceTypeFull: "Jasa Service Level",
    serviceId: "S001",

    // Project
    project_number: "PRJ-2026-001",

    // Contract
    started_date: "2023-10-22",
    ended_fdate: "2026-01-21",
    contract_sta_date: "2023-10-22",
    contract_sto_date: "2026-01-21",

    // SPK & PO
    spk_num: "SPK-2026-001",
    spk_date: "2023-10-20",
    po_num: "PO-2026-001",
    po_date: "2023-10-21",

    // PIC
    l1_pic: "Redi - L1 Support",
    l2_pic: "Regar - L2 Support",
    sales: "John Doe",

    // Support
    onsite: "Yes",
    dc_drc: "Jakarta DKI",

    // PM
    pm: true,
    pm_dur: "Every 3 months",

    // UI / Frontend Display
    status: "Active",
    period: "22-Oct-23 - 21-Jan-26",
    price: 12000000,
    purchaseDate: "22 October 2023",
    startDate: "22 October 2023",
    endDate: "21 January 2026",
    onSiteSupport: "Yes",
    dcDrc: "Jakarta DKI",
    l1pic: "Redi - L1 Support",
    l2pic: "Regar - L2 Support",
    sitc: "Dedy Syahputra - Account Manager",
    pmIncluded: "Yes",
    pmSchedule: "Every 3 months",
    nextPmDate: "10 April 2026",

    // Branding
    logo: "ACI",
    logoColor: "#049fd9",
  },

  {
    id: 2,

    // Product Mapping
    product_id: "HPIS",
    principal_id: "PHPE",
    principal_name: "HPE",

    // Product Info
    prod_code: "HPIS-PD-100",
    sub_prod_code: "HPIS-SUB-101",
    cust_code: "CUST-002",
    name: "NONSTOP NS8 DC",
    productName: "NONSTOP NS8 DC",
    materialType: "Hardware",

    // Service Info
    srv_type: "JSL",
    serviceType: "JSL",
    serviceTypeFull: "Jasa Service Level",
    serviceId: "S002",

    // Project
    project_number: "PRJ-2026-002",

    // Contract
    started_date: "2025-05-07",
    ended_fdate: "2026-05-06",
    contract_sta_date: "2025-05-07",
    contract_sto_date: "2026-05-06",

    // SPK & PO
    spk_num: "SPK-2026-002",
    spk_date: "2025-05-01",
    po_num: "PO-2026-002",
    po_date: "2025-05-03",

    // PIC
    l1_pic: "Budi - L1 Support",
    l2_pic: "Sari - L2 Support",
    sales: "Jane Smith",

    // Support
    onsite: "Yes",
    dc_drc: "Surabaya DC",

    // PM
    pm: true,
    pm_dur: "Every 6 months",

    // UI / Frontend Display
    status: "Active",
    period: "07-May-25 - 06-May-26",
    price: 18500000,
    purchaseDate: "07 May 2025",
    startDate: "07 May 2025",
    endDate: "06 May 2026",
    onSiteSupport: "Yes",
    dcDrc: "Surabaya DC",
    l1pic: "Budi - L1 Support",
    l2pic: "Sari - L2 Support",
    sitc: "Mega Lestari - Account Manager",
    pmIncluded: "Yes",
    pmSchedule: "Every 6 months",
    nextPmDate: "15 July 2026",

    // Branding
    logo: "HPE",
    logoColor: "#00b388",
  },

  {
    id: 3,

    // Product Mapping
    product_id: "FOPC",
    principal_id: "PFIN",
    principal_name: "Finastra Products",

    // Product Info
    prod_code: "FOPC-PD-200",
    sub_prod_code: "FOPC-SUB-201",
    cust_code: "CUST-003",
    name: "OPICS KLN",
    productName: "OPICS KLN",
    materialType: "Software",

    // Service Info
    srv_type: "ALF+JSL",
    serviceType: "ALF+JSL",
    serviceTypeFull: "Annual Level Framework + Jasa Service Level",
    serviceId: "S003",

    // Project
    project_number: "PRJ-2026-003",

    // Contract
    started_date: "2024-05-16",
    ended_fdate: "2027-05-15",
    contract_sta_date: "2024-05-16",
    contract_sto_date: "2027-05-15",

    // SPK & PO
    spk_num: "SPK-2026-003",
    spk_date: "2024-05-10",
    po_num: "PO-2026-003",
    po_date: "2024-05-12",

    // PIC
    l1_pic: "Rian - L1 Support",
    l2_pic: "Asep - L2 Support",
    sales: "Mike Johnson",

    // Support
    onsite: "No",
    dc_drc: "Bandung DC",

    // PM
    pm: false,
    pm_dur: "",

    // UI / Frontend Display
    status: "Active",
    period: "16-May-24 - 15-May-27",
    price: 22500000,
    purchaseDate: "16 May 2024",
    startDate: "16 May 2024",
    endDate: "15 May 2027",
    onSiteSupport: "No",
    dcDrc: "Bandung DC",
    l1pic: "Rian - L1 Support",
    l2pic: "Asep - L2 Support",
    sitc: "Hendra - Account Manager",
    pmIncluded: "No",
    pmSchedule: "—",
    nextPmDate: "—",

    // Branding
    logo: "FINASTRA",
    logoColor: "#9333ea",
  },
];

const fetchCustomerProductsPOV = async () => {
  try {
    await new Promise((r) => setTimeout(r, 700));
    return { data: mockCustomerProducts };
  } catch (e) {
    console.error(e);
    return { data: [] };
  }
};

const fmtRp = (n) => (n ? `Rp${Number(n).toLocaleString("id-ID")}` : "—");

/* ─── DETAIL MODAL ───────────────────────────────────────────── */
const DetailModal = ({ open, onClose, product, isEdit, onSave }) => {
  const [formData, setFormData] = useState({
    id: "",
    prod_code: "",
    sub_prod_code: "",
    cust_code: "",
    srv_type: "",
    project_number: "",
    started_date: "",
    ended_fdate: "",
    l1_pic: "",
    l2_pic: "",
    sales: "",
    onsite: "",
    dc_drc: "",
    spk_num: "",
    spk_date: "",
    po_num: "",
    po_date: "",
    contract_sta_date: "",
    contract_sto_date: "",
    pm: false,
    pm_dur: "",
  });

  // Update formData when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || "",
        prod_code: product.prod_code || "",
        sub_prod_code: product.sub_prod_code || "",
        cust_code: product.cust_code || "",
        srv_type: product.srv_type || "",
        project_number: product.project_number || "",
        started_date: product.started_date || "",
        ended_fdate: product.ended_fdate || "",
        l1_pic: product.l1_pic || "",
        l2_pic: product.l2_pic || "",
        sales: product.sales || "",
        onsite: product.onsite || "",
        dc_drc: product.dc_drc || "",
        spk_num: product.spk_num || "",
        spk_date: product.spk_date || "",
        po_num: product.po_num || "",
        po_date: product.po_date || "",
        contract_sta_date: product.contract_sta_date || "",
        contract_sto_date: product.contract_sto_date || "",
        pm: product.pm || false,
        pm_dur: product.pm_dur || "",
      });
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  const Section = ({ label }) => (
    <div className="col-span-full my-1">
      <p
        className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1"
        style={{ borderColor: "#fcd5d3" }}
      >
        {label}
      </p>
    </div>
  );

  const Field = ({ label, value, red }) => (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p
        className={`text-sm font-semibold ${red ? "" : "text-slate-700"}`}
        style={red ? { color: "#D73A30" } : {}}
      >
        {value || "—"}
      </p>
    </div>
  );

  const InputField = ({ label, name, type = "text", value, disabled }) => (
    <div>
      <label className="text-xs text-slate-400 mb-0.5 block">{label}</label>
      {type === "checkbox" ? (
        <input
          type="checkbox"
          name={name}
          checked={value || false}
          onChange={handleChange}
          disabled={disabled || !isEdit}
          className="w-4 h-4 rounded border-slate-300"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || !isEdit}
          className={`w-full px-3 py-2 text-sm border rounded-lg ${
            disabled
              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
              : "bg-white text-slate-700"
          }`}
        />
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Detail Information"}
      width="max-w-3xl h-[90vh]"
    >
      <form onSubmit={handleSubmit}>
        <div className="h-full flex flex-col">
          {/* Logo banner - fixed at top */}
          <div
            className="rounded-xl p-4 mb-5 flex items-center justify-between flex-shrink-0"
            style={{
              background: product.logoColor || "#6366f1",
              color: "white",
            }}
          >
            <div>
              <div className="text-xs font-mono opacity-80 mb-1">
                {formData.prod_code || "N/A"}
              </div>
              <div className="text-lg font-bold">
                {product.name || "Product"}
              </div>
            </div>
            {!isEdit && (
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 transition"
              >
                <Icon
                  d="M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z"
                  size={13}
                />
                Print Invoice
              </button>
            )}
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {isEdit ? (
                <>
                  {/* Edit Mode Fields */}
                  <Section label="Product Information" />
                  <InputField
                    label="ID"
                    name="id"
                    value={formData.id}
                    disabled
                  />
                  <InputField
                    label="Product Code"
                    name="prod_code"
                    value={formData.prod_code}
                  />
                  <InputField
                    label="Sub Product Code"
                    name="sub_prod_code"
                    value={formData.sub_prod_code}
                  />
                  <InputField
                    label="Customer Code"
                    name="cust_code"
                    value={formData.cust_code}
                  />
                  <div>
                    <label className="text-xs text-slate-400 mb-0.5 block">
                      Service Type
                    </label>
                    <select
                      name="srv_type"
                      value={formData.srv_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-700"
                    >
                      <option value="">Select Type</option>
                      <option value="JSL">JSL</option>
                      <option value="ALF">ALF</option>
                      <option value="TLF">TLF</option>
                    </select>
                  </div>
                  <InputField
                    label="Project Number"
                    name="project_number"
                    value={formData.project_number}
                  />
                  <InputField
                    label="Started Date"
                    name="started_date"
                    type="date"
                    value={formData.started_date}
                  />
                  <InputField
                    label="Ended Date"
                    name="ended_fdate"
                    type="date"
                    value={formData.ended_fdate}
                  />

                  <Section label="Person In Charge" />
                  <InputField
                    label="L1 PIC"
                    name="l1_pic"
                    value={formData.l1_pic}
                  />
                  <InputField
                    label="L2 PIC"
                    name="l2_pic"
                    value={formData.l2_pic}
                  />
                  <InputField
                    label="Sales"
                    name="sales"
                    value={formData.sales}
                  />
                  <InputField
                    label="Onsite"
                    name="onsite"
                    value={formData.onsite}
                  />
                  <InputField
                    label="DC / DRC"
                    name="dc_drc"
                    value={formData.dc_drc}
                  />

                  <Section label="SPK Information" />
                  <InputField
                    label="SPK Number"
                    name="spk_num"
                    value={formData.spk_num}
                  />
                  <InputField
                    label="SPK Date"
                    name="spk_date"
                    type="date"
                    value={formData.spk_date}
                  />

                  <Section label="PO Information" />
                  <InputField
                    label="PO Number"
                    name="po_num"
                    value={formData.po_num}
                  />
                  <InputField
                    label="PO Date"
                    name="po_date"
                    type="date"
                    value={formData.po_date}
                  />

                  <Section label="Contract Information" />
                  <InputField
                    label="Contract Start Date"
                    name="contract_sta_date"
                    type="date"
                    value={formData.contract_sta_date}
                  />
                  <InputField
                    label="Contract End Date"
                    name="contract_sto_date"
                    type="date"
                    value={formData.contract_sto_date}
                  />

                  <Section label="PM" />
                  <div className="flex items-center gap-2">
                    <InputField
                      label="PM Included"
                      name="pm"
                      type="checkbox"
                      value={formData.pm}
                    />
                  </div>
                  <InputField
                    label="PM Duration"
                    name="pm_dur"
                    value={formData.pm_dur}
                  />
                </>
              ) : (
                <>
                  {/* View Mode Fields */}
                  <Section label="Product Information" />
                  <Field label="ID" value={formData.id} />
                  <Field label="Product Code" value={formData.prod_code} />
                  <Field
                    label="Sub Product Code"
                    value={formData.sub_prod_code}
                  />
                  <Field label="Customer Code" value={formData.cust_code} />
                  <Field label="Service Type" value={formData.srv_type} />
                  <Field
                    label="Project Number"
                    value={formData.project_number}
                  />
                  <Field label="Started Date" value={formData.started_date} />
                  <Field label="Ended Date" value={formData.ended_fdate} />

                  <Section label="Person In Charge" />
                  <Field label="L1 PIC" value={formData.l1_pic} />
                  <Field label="L2 PIC" value={formData.l2_pic} />
                  <Field label="Sales" value={formData.sales} />
                  <Field label="Onsite" value={formData.onsite} />
                  <Field label="DC / DRC" value={formData.dc_drc} />

                  <Section label="SPK Information" />
                  <Field label="SPK Number" value={formData.spk_num} />
                  <Field label="SPK Date" value={formData.spk_date} />

                  <Section label="PO Information" />
                  <Field label="PO Number" value={formData.po_num} />
                  <Field label="PO Date" value={formData.po_date} />

                  <Section label="Contract Information" />
                  <Field
                    label="Contract Start Date"
                    value={formData.contract_sta_date}
                  />
                  <Field
                    label="Contract End Date"
                    value={formData.contract_sto_date}
                  />

                  <Section label="PM" />
                  <Field
                    label="PM Included"
                    value={formData.pm ? "Yes" : "No"}
                  />
                  <Field label="PM Duration" value={formData.pm_dur} />
                </>
              )}
            </div>
          </div>

          {/* Buttons - fixed at bottom */}
          <div
            className="mt-4 pt-4 border-t flex justify-end gap-3 flex-shrink-0"
            style={{ borderColor: "#fcd5d3" }}
          >
            {isEdit ? (
              <>
                <PrimaryBtn type="button" onClick={onClose} variant="outline">
                  Cancel
                </PrimaryBtn>
                <PrimaryBtn type="submit">Save</PrimaryBtn>
              </>
            ) : (
              <PrimaryBtn onClick={onClose}>Close</PrimaryBtn>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

/* ─── PRODUCT CARD ───────────────────────────────────────────── */
const CustomerProductCard = ({ product, onDetail }) => {
  const statusColors = {
    active: { bg: "#dcfce7", border: "#86efac", color: "#15803d" },
    expired: { bg: "#fef9c3", border: "#fde047", color: "#854d0e" },
    inactive: { bg: "#fee2e2", border: "#fca5a5", color: "#dc2626" },
  };
  const sc =
    statusColors[(product.status || "").toLowerCase()] || statusColors.inactive;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 group cursor-pointer"
      style={{ border: "1px solid #f3e8e8" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(215,58,48,0.12)";
        e.currentTarget.style.borderColor = "#fcd5d3";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "#f3e8e8";
      }}
    >
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${product.logoColor}, #D73A30)`,
        }}
      />
      <div className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black mb-2 shadow-sm"
              style={{ background: product.logoColor }}
            >
              {product.logo?.slice(0, 2)}
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {product.name}
            </h3>
          </div>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap"
            style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              color: sc.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: sc.color }}
            />
            {product.status}
          </span>
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Icon
              d="M15 5v2 M15 11v2 M15 17v2 M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"
              size={12}
              style={{ color: "#D73A30", opacity: 0.7 }}
            />
            <span>
              Service ID:{" "}
              <strong className="text-slate-700">{product.serviceId}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Icon
              d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01"
              size={12}
              style={{ color: "#D73A30", opacity: 0.7 }}
            />
            <span>
              Type:{" "}
              <strong className="text-slate-700">{product.serviceType}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Icon
              d="M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
              size={12}
              style={{ color: "#D73A30", opacity: 0.7 }}
            />
            <span className="truncate">{product.period}</span>
          </div>
        </div>

        <div className="pt-1 border-t" style={{ borderColor: "#fdf2f2" }}>
          <button
            onClick={() => onDetail(product)}
            className="w-full py-2 text-xs font-semibold rounded-lg transition-all hover:shadow-md"
            style={{
              background: "linear-gradient(90deg, #D73A30, #872924)",
              color: "white",
            }}
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN ───────────────────────────────────────────────────── */
function CustomerProductsPOVPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchCustomerProductsPOV();
    setItems(res.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || p.status?.toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = items.filter((i) => i.status === "Active").length;

  return (
    <div
      className="min-h-screen p-6 space-y-5"
      style={{ background: "#f8f0f0" }}
    >
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <HeaderSection
        title="Hello, Bank Mandiri"
        subtitle="Here are the products you are buying from us"
        breadcrumb={["Portal", "CustomerProducts"]}
        icon={
          <Icon
            d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12"
            size={22}
          />
        }
        stats={[
          { value: items.length, label: "Products" },
          { value: activeCount, label: "Active" },
        ]}
        actions={[
          {
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
          },
        ]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search Product..."
        filters={[
          {
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            value: filterCategory,
            onChange: setFilterCategory,
            options: [
              { value: "all", label: "All Categories" },
              { value: "jsl", label: "JSL" },
              { value: "alf", label: "ALF" },
              { value: "tlf", label: "TLF" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setFilterStatus("all");
          setFilterCategory("all");
        }}
      />

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          subtitle="Try adjusting your filters."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <CustomerProductCard key={p.id} product={p} onDetail={setDetail} />
          ))}
        </div>
      )}

      <DetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        product={detail}
        isEdit={false}
      />
    </div>
  );
}

export default CustomerProductsPOVPage;