import { useEffect, useRef, useState } from "react";
import api from "../api/metabase_api";
import {
  FiDownload,
  FiSearch,
  FiCalendar,
  FiX,
  FiFilter,
  FiLoader,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const normalizeCompany = (text = "") =>
  text
    .toLowerCase()
    .replace(/\b(pt|cv|tbk|persero|inactive)\b/gi, "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const MetabaseDashboard = ({ roleType = "CUSTOMER" }) => {
  const [url, setUrl] = useState("");
  const [iframeLoading, setIframeLoading] = useState(true);
  const [excelLoading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isPrivileged = roleType !== "CUSTOMER";

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    partnerName: "",
    partnerNameNormalized: "",
  });

  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [normalizedHint, setNormalizedHint] = useState("");

  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  const loadDashboard = async (useFilter = false) => {
    try {
      setIframeLoading(true);
      setErrorMessage("");

      const params =
        isPrivileged && useFilter
          ? {
              startDate: filters.startDate || "",
              endDate: filters.endDate || "",
              partnerName: filters.partnerName || "",
              partnerNameNormalized: filters.partnerNameNormalized || "",
            }
          : {};

      const res = await api.get("/metabase/dashboard", { params });

      if (!res.data || typeof res.data !== "string") {
        throw new Error("Dashboard URL kosong atau tidak valid");
      }

      setUrl(res.data);
    } catch (err) {
      console.error("Failed load dashboard", err);
      setErrorMessage("Dashboard gagal dimuat. Cek endpoint /metabase/dashboard atau koneksi Metabase.");
      setIframeLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleType]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDownloadExcel = async () => {
    setExcelLoading(true);

    try {
      const params = isPrivileged
        ? {
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            partnerName: filters.partnerName || "",
            partnerNameNormalized: filters.partnerNameNormalized || "",
          }
        : {};

      const res = await api.get("/metabase/export/excel", {
        responseType: "blob",
        params,
      });

      const blob = new Blob([res.data]);
      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);
      link.download = "incident-report.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Excel download failed", err);
      alert("Excel download failed");
    } finally {
      setExcelLoading(false);
    }
  };

  const searchCompany = (value) => {
    setCompanySearch(value);

    if (!value) {
      setFilters((p) => ({
        ...p,
        partnerName: "",
        partnerNameNormalized: "",
      }));
      setCompanyOptions([]);
      setShowDropdown(false);
      setNormalizedHint("");
      return;
    }

    const norm = normalizeCompany(value);
    setNormalizedHint(norm);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);

      try {
        const res = await api.get("/dropdown/customers-name", {
          params: {
            search: norm,
            searchRaw: value,
          },
        });

        const unique = Array.from(
          new Map((res.data || []).map((item) => [item.companyName, item])).values()
        );

        setCompanyOptions(unique);
        setShowDropdown(true);
      } catch (err) {
        console.error("Company search failed", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const selectCompany = (company) => {
    setCompanySearch(company.companyName);

    setFilters((p) => ({
      ...p,
      partnerName: company.companyName,
      partnerNameNormalized: normalizeCompany(company.companyName),
    }));

    setShowDropdown(false);
    setNormalizedHint("");
  };

  const clearCompany = () => {
    setCompanySearch("");

    setFilters((p) => ({
      ...p,
      partnerName: "",
      partnerNameNormalized: "",
    }));

    setCompanyOptions([]);
    setNormalizedHint("");
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      partnerName: "",
      partnerNameNormalized: "",
    });

    setCompanySearch("");
    setCompanyOptions([]);
    setShowDropdown(false);
    setNormalizedHint("");

    setTimeout(() => {
      loadDashboard(false);
    }, 100);
  };

  const avatarColor = (name = "") => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-violet-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];

    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div className="relative p-4 space-y-4">
      {isPrivileged && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white border border-gray-100 shadow-xl rounded-2xl p-5"
        >
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FiCalendar />
                Start Date
              </label>

              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    startDate: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FiCalendar />
                End Date
              </label>

              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    endDate: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              />
            </div>

            <div className="flex-[1.4] relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FiSearch />
                Company
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => searchCompany(e.target.value)}
                  onFocus={() => {
                    if (companyOptions.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Search company..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                />

                {companySearch && (
                  <button
                    type="button"
                    onClick={clearCompany}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <FiX />
                  </button>
                )}

                {searchLoading && (
                  <FiLoader className="absolute right-9 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {normalizedHint && (
                <p className="mt-1 text-[11px] text-gray-400">
                  Normalized:{" "}
                  <span className="font-medium">{normalizedHint}</span>
                </p>
              )}

              <AnimatePresence>
                {showDropdown && companyOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
                  >
                    {companyOptions.map((company, index) => (
                      <button
                        key={`${company.companyName}-${index}`}
                        type="button"
                        onClick={() => selectCompany(company)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left transition"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(
                            company.companyName
                          )}`}
                        >
                          {(company.companyName || "?").charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">
                            {company.companyName}
                          </p>

                          {company.displayName && (
                            <p className="text-xs text-gray-400 truncate">
                              {company.displayName}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-2 items-end">
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={iframeLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                {iframeLoading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiFilter className="text-xs" />
                )}
                Apply Filter
              </button>

              <button
                type="button"
                onClick={resetFilters}
                disabled={iframeLoading}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={excelLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                {excelLoading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiDownload className="text-xs" />
                )}
                Excel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
        {iframeLoading && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 shadow-sm flex items-center gap-2">
            <FiLoader className="animate-spin" />
            Loading dashboard...
          </div>
        )}

        {errorMessage && (
          <div className="absolute inset-0 z-20 bg-white flex items-center justify-center text-center px-6">
            <div>
              <p className="text-sm font-semibold text-red-600 mb-2">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => loadDashboard(false)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div style={{ height: "calc(100vh - 220px)", width: "100%" }}>
          {url && (
            <iframe
              key={url}
              title="Metabase Dashboard"
              src={url}
              className="w-full h-full border-0 rounded-xl"
              onLoad={() => setIframeLoading(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MetabaseDashboard;