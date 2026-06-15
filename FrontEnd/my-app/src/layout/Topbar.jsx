import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/apiConfig";

/* ── tiny bell icon ── */
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold select-none"
      style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.35)", color: "white" }}>
      {initials}
    </div>
  );
};

const Topbar = ({ toggleSidebar, isOpen }) => {
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [displayRole, setDisplayRole] = useState("Support Agent");

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true,
        });
        setPartnerName(res.data.partnerName);
        setRoles(res.data.roles);

const roleMapping = {
  "Support Manager": "Manager Support",
  "PTAP Manager Support": "Manager Support",

  "Support Staff": "Support Agent",
  "PTAP Eksternal/Internal Support Staff": "Support Agent",
  "External Support": "Support Agent",
  "Internal Support": "Support Agent",
  "Support Agent": "Support Agent",
};

const foundRole = res.data.roles.find((r) => roleMapping[r]);

if (foundRole) {
  setDisplayRole(roleMapping[foundRole]);
} else {
  setDisplayRole("Customer");
}
      } catch (err) {
        console.error("Failed to fetch user", err);
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
      window.location.href = "/login";
    }
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  return (
    <>
      {/* ── MOBILE OVERLAY ── */}
      {/* Tapping this dark backdrop closes the sidebar on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* ── TOPBAR ── */}
      <div
        className="sticky top-0 z-40 h-[60px] flex items-center justify-between px-5"
        style={{
          background: "linear-gradient(90deg, #D73A30, #872924)",
          borderBottom: "1px solid rgba(0,0,0,0.15)",
          boxShadow: "0 2px 16px rgba(215,58,48,0.35)",
        }}
      >
        {/* LEFT GROUP */}
        <div className="flex items-center gap-4">
          {/* HAMBURGER */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ background: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span
              className={`block h-[2px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white/90 ${
                isOpen ? "w-5 translate-y-[7px] rotate-45" : "w-5"
              }`}
            />
            <span
              className={`block h-[2px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white/90 ${
                isOpen ? "w-0 opacity-0" : "w-4"
              }`}
            />
            <span
              className={`block h-[2px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white/90 ${
                isOpen ? "w-5 -translate-y-[7px] -rotate-45" : "w-5"
              }`}
            />
          </button>

          {/* BRAND */}
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOpen
                ? "opacity-0 -translate-x-2 pointer-events-none"
                : "opacity-100 translate-x-0"
            }`}
          >
            <span className="font-semibold text-[15px] text-white whitespace-nowrap tracking-tight">
              Customer Support
            </span>
          </div>
        </div>

        {/* RIGHT GROUP */}
        <div className="flex items-center gap-2">
          {/* Date chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}>
            <CalendarIcon />
            <span>{today}</span>
          </div>

          <span className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.25)" }} />

          {/* USER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl transition-all duration-150"
              style={{ border: "1px solid transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
            >
              <Avatar name={partnerName} />
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-[13px] font-semibold text-white leading-none">
                  {partnerName || "Loading…"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {displayRole}
                </p>
              </div>
              <span className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.6)" }}>
                <ChevronDown />
              </span>
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden z-50"
                style={{ animation: "dropIn 0.15s ease" }}>
                <style>{`
                  @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{partnerName || "—"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{displayRole}</p>
                </div>

                {/* Profile item */}
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 mt-1 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 text-left"
                >
                  <ProfileIcon />
                  My Profile
                </button>

                <div className="mx-4 border-t border-slate-100 my-1" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 text-left"
                >
                  <LogoutIcon />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;