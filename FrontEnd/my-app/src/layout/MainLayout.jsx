import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const SIDEBAR_WIDTH = "224px";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar  = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen" style={{ background: "#f5f0f0" }}>

      {/* Sidebar — receives onClose so the backdrop & nav links can close it */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-col flex-1 min-w-0 h-screen">

        {/* Responsive margin: shift right on desktop when sidebar is open */}
        <style>{`
          @media (min-width: 768px) {
            .main-content-shift {
              margin-left: ${sidebarOpen ? SIDEBAR_WIDTH : "0px"};
            }
          }
          @media (max-width: 767px) {
            .main-content-shift {
              margin-left: 0 !important;
            }
          }
        `}</style>

        <div
          className="main-content-shift flex flex-col flex-1 min-w-0 h-screen"
          style={{ transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <Topbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />

          <main
            id="main-scroll-area"
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;