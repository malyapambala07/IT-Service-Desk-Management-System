
import { NavLink } from "react-router-dom";

import {
  Ticket,
  Users,
  Headset,
  UserPlus,
  ChartNoAxesCombined,
  Clock,
  Bell,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ collapsed, setCollapsed }) {
  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    currentUser = null;
  }

  const userRole = String(
    currentUser?.role || ""
  ).toUpperCase();

  const dashboardMenu = {
    name: "Dashboard",
    icon: ChartNoAxesCombined,
    path: "/dashboard"
  };

  const adminMenu = [
    dashboardMenu,
    { name: "All Tickets", icon: Ticket, path: "/tickets" },
    { name: "Employees", icon: Users, path: "/employees" },
    { name: "Technicians", icon: Headset, path: "/technicians" },
    { name: "Assign Tickets", icon: UserPlus, path: "/assign-tickets" },
    { name: "Reports", icon: ChartNoAxesCombined, path: "/reports" },
    { name: "SLA Management", icon: Clock, path: "/sla" },
    { name: "Notifications", icon: Bell, path: "/notifications" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ];

  const employeeMenu = [
    dashboardMenu,
    { name: "My Tickets", icon: Ticket, path: "/tickets" },
    { name: "Notifications", icon: Bell, path: "/notifications" }
  ];

  const technicianMenu = [
    dashboardMenu,
    { name: "Assigned Tickets", icon: Ticket, path: "/tickets" },
    { name: "Notifications", icon: Bell, path: "/notifications" }
  ];

  let menuItems = [];

  if (userRole === "ADMIN") {
    menuItems = adminMenu;
  } else if (userRole === "EMPLOYEE") {
    menuItems = employeeMenu;
  } else if (userRole === "TECHNICIAN") {
    menuItems = technicianMenu;
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Headset size={24} />
          </div>

          {!collapsed && <span>ServiceDesk</span>}
        </div>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle sidebar"
          type="button"
        >
          {collapsed
            ? <PanelLeftOpen size={20} />
            : <PanelLeftClose size={20} />
          }
        </button>
      </div>

      <div className="sidebar-menu">
        {!collapsed && <p className="menu-heading">MAIN MENU</p>}

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) =>
                `menu-link ${isActive ? "active" : ""}`
              }
              title={collapsed ? item.name : ""}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <NavLink
          to="/login"
          className="menu-link logout-link"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
