import { useEffect, useState } from "react";
import axios from "axios";
import MetabaseDashboard from "../components/MetabaseDashboard";
import { FiBarChart2, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { motion } from "framer-motion";

const API_BASE_URL = "/api";

const DashboardHome = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roleType, setRoleType] = useState("CUSTOMER");
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRoleType = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/metabase/user-role`, {
          withCredentials: true,
        });

        setRoleType(res.data.roleType || "CUSTOMER");
      } catch (err) {
        console.error("Failed fetch dashboard role", err);
        setRoleType("CUSTOMER");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRoleType();
  }, []);

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{ background: "#DDDDDD" }}
    >
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(215,58,48,0.08)" }}
      />

      <motion.div
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(135,41,36,0.06)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative z-10 max-w-[1500px] mx-auto px-2"
      >
        <div
          className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-md border w-fit"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(215,58,48,0.15)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #D73A30, #872924)",
            }}
          >
            <FiBarChart2 className="text-white text-lg" />
          </div>

          <div className="flex flex-col">
            <h1
              className="text-xl font-bold"
              style={{
                background: "linear-gradient(90deg, #D73A30, #872924)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Dashboard Home
            </h1>

            <p className="text-xs text-slate-500">
              Overview analytics & system insights
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className={`mx-auto transition-all duration-500 ${
          isFullscreen ? "max-w-full" : "max-w-[1500px]"
        }`}
      >
        <div
          className="bg-white rounded-2xl overflow-hidden relative"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              borderBottom: "1px solid #F3F4F6",
              background: "#FAFAFA",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#F05454" }}
              />

              <span
                className="text-sm font-semibold"
                style={{ color: "#374151" }}
              >
                Analytics Overview
              </span>

              <span
                className="text-[11px] font-semibold px-2 py-1 rounded-full"
                style={{
                  background:
                    roleType === "CUSTOMER"
                      ? "#FEF3C7"
                      : roleType === "STAFF"
                      ? "#DBEAFE"
                      : "#DCFCE7",
                  color:
                    roleType === "CUSTOMER"
                      ? "#92400E"
                      : roleType === "STAFF"
                      ? "#1D4ED8"
                      : "#15803D",
                }}
              >
                {roleLoading ? "LOADING" : roleType}
              </span>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: "#F3F4F6",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
              }}
            >
              {isFullscreen ? (
                <FiMinimize2 size={13} />
              ) : (
                <FiMaximize2 size={13} />
              )}

              {isFullscreen ? "Minimize" : "Expand"}
            </button>
          </div>

          <div
            className={`w-full transition-all duration-500 ${
              isFullscreen ? "min-h-[88vh]" : "min-h-[78vh]"
            }`}
          >
            {!roleLoading && <MetabaseDashboard roleType={roleType} />}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;