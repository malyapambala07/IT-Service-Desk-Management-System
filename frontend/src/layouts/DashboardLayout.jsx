
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`main-content ${
          collapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
