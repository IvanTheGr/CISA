import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle } from "react-icons/fi";
import { FiStar } from "react-icons/fi";

import LogoFull from "../Picture/Logofix2.png";

import {
  FiHome,
  FiPlusCircle,
  FiList,
  FiTrash2,
  FiFilePlus,
  FiFileText,
  FiBox,
  FiChevronDown,
  FiLayers,
  FiUsers,
  FiShoppingBag,
  FiSettings,
  FiShield,
  FiBell,
} from "react-icons/fi";

import {
  isManager,
  isStaff,
  isCustomer,
} from "../utils/roleAccess";

const API_BASE_URL = "/api";

const TOP_NAV_ITEMS = [
  { to: "/", icon: FiHome, label: "Dashboard", end: true },
];

const SERVICES_ALL_ITEMS = [
  { to: "/admin/products", icon: FiBox, label: "Products (Admin)" },
  { to: "/admin/sub-products", icon: FiLayers, label: "Sub Products" },
  { to: "/admin/customer-products", icon: FiUsers, label: "Customer Products" },
  { to: "/my-products", icon: FiShoppingBag, label: "My Products" },
  { to: "/my-services", icon: FiBox, label: "My Services" },
  { to: "/my-products-lama", icon: FiBox, label: "My Products lama" },
];

const SETTING_ALL_ITEMS = [
  { to: "/setting/user", icon: FiUsers, label: "User" },
  { to: "/setting/role", icon: FiShield, label: "Role" },
  { to: "/setting/reminder", icon: FiBell, label: "Reminder" },
];

const MANAGER_TICKET_ITEMS = [
  { to: "/ticket/create", icon: FiPlusCircle, label: "Create Ticket" },
  { to: "/summary", icon: FiFilePlus, label: "My Tickets" },
  { to: "/ticket/grouped", icon: FiList, label: "Grouped Tickets" },
  { to: "/ticket/approval", icon: FiCheckCircle, label: "Approve Incident" },
  { to: "/ticket/history", icon: FiFileText, label: "History Ticket" },
  { to: "/ticket", icon: FiList, label: "Edit Ticket", end: true },
  {
    to: "/ticket/delete",
    icon: FiTrash2,
    label: "Delete Ticket",
    danger: true,
  },
];

const STAFF_TICKET_ITEMS = [
  { to: "/ticket/create", icon: FiPlusCircle, label: "Create Ticket" },
  { to: "/ticket/grouped", icon: FiList, label: "Grouped Tickets" },
  { to: "/ticket/history", icon: FiFileText, label: "History Ticket" },
  
];

const CUSTOMER_TICKET_ITEMS = [
  { to: "/ticket/create", icon: FiPlusCircle, label: "Create Ticket" },
  { to: "/summary", icon: FiFilePlus, label: "My Tickets" },
  { to: "/ticket/rating", icon: FiStar, label: "Rating Ticket" },
];

const NavGroup = ({ label, icon: Icon, items, isAnyActive }) => {
  const [open, setOpen] = useState(isAnyActive);

  useEffect(() => {
    if (isAnyActive) setOpen(true);
  }, [isAnyActive]);

  if (!items || items.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isAnyActive ? "text-white shadow-lg" : "text-black hover:bg-gray-100"
        }`}
        style={{
          background: isAnyActive
            ? "linear-gradient(90deg, #D73A30, #c0392b)"
            : "transparent",
        }}
      >
        <span className="flex items-center gap-3">
          <Icon size={17} className="shrink-0" />
          <span>{label}</span>
        </span>

        <FiChevronDown
          size={15}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-1 ml-4 pl-2 border-l border-gray-200 space-y-1">
          {items.map(({ to, icon: ItemIcon, label, end, danger }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-red-50 text-[#D73A30] font-semibold"
                    : danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-black hover:bg-gray-100"
                }`
              }
            >
              <ItemIcon size={15} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true,
        });

        setRoles(res.data.roles || []);
      } catch (err) {
        console.error("Failed fetch auth user for sidebar", err);
        setRoles([]);
      }
    };

    fetchMe();
  }, []);

  const access = useMemo(() => {
    const manager = isManager(roles);
    const staff = isStaff(roles);
    const customer = isCustomer(roles);

    return {
      manager,
      staff,
      customer,
    };
  }, [roles]);

  const ticketItems = useMemo(() => {
    if (access.manager) return MANAGER_TICKET_ITEMS;
    if (access.staff) return STAFF_TICKET_ITEMS;
    return CUSTOMER_TICKET_ITEMS;
  }, [access.manager, access.staff]);

  const serviceItems = useMemo(() => {
    if (access.manager || access.staff) return SERVICES_ALL_ITEMS;
    return [];
  }, [access.manager, access.staff]);

  const settingItems = useMemo(() => {
    if (access.manager || access.staff) return SETTING_ALL_ITEMS;
    return [];
  }, [access.manager, access.staff]);

  const isServicesRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/my-products") ||
    location.pathname.startsWith("/my-services");

  const isTicketRoute =
    location.pathname.startsWith("/ticket") ||
    location.pathname.startsWith("/my-tickets") ||
    location.pathname.startsWith("/summary");

  const isSettingRoute = location.pathname.startsWith("/setting");

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center px-5 pt-8 pb-6 border-b border-gray-200">
          <img
            src={LogoFull}
            alt="Logo"
            className="h-20 object-contain mb-2"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

<div className="flex flex-col items-center justify-center text-center leading-tight w-full py-2 select-none">
  {/* Main Branding */}
  <div className="relative">
    <h1
      className="
        text-[26px]
        md:text-[30px]
        font-black
        italic
        tracking-[2px]
        text-red-600
        drop-shadow-sm
      "
      style={{
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      CISA
    </h1>

    {/* Elegant underline */}
    <div className="mx-auto mt-1 h-[2.5px] w-14 rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-300" />
  </div>

  {/* Subtitle */}
  <p
    className="
      mt-2
      max-w-[210px]
      text-[9px]
      md:text-[10px]
      font-semibold
      uppercase
      tracking-[1.5px]
      text-red-500
      leading-[1.4]
    "
  >
    Customer Information System of Abhimata
  </p>

  {/* Small caption */}
  <span
    className="
      mt-1
      text-[9px]
      tracking-[3px]
      uppercase
      text-gray-400
    "
  >
    Helpdesk Portal
  </span>
</div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>

          {TOP_NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? "text-white shadow-lg" : "text-black hover:bg-gray-100"
                }`
              }
              style={({ isActive }) => ({
                background: isActive
                  ? "linear-gradient(90deg, #D73A30, #c0392b)"
                  : "transparent",
              })}
            >
              <Icon size={17} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          {(access.manager || access.staff) && (
            <NavGroup
              label="Services"
              icon={FiBox}
              items={serviceItems}
              isAnyActive={isServicesRoute}
            />
          )}

          <NavGroup
            label="Ticket"
            icon={FiFilePlus}
            items={ticketItems}
            isAnyActive={isTicketRoute}
          />

          {(access.manager || access.staff) && (
            <NavGroup
              label="Setting"
              icon={FiSettings}
              items={settingItems}
              isAnyActive={isSettingRoute}
            />
          )}
        </nav>

        <div className="px-5 py-4 border-t border-gray-200">
          <p className="text-gray-400 text-[10px] text-center">
            v1.0 · IT Support System
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;