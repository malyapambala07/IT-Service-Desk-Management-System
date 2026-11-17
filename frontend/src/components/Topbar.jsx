
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Bell,
  UserCircle,
  ChevronDown
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Topbar.css";

function Topbar() {
  const navigate = useNavigate();

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    currentUser = null;
  }

  const [unreadCount, setUnreadCount] = useState(0);

  const userId = currentUser?.id;

  const userName = currentUser?.fullName || "User";

  const userRole = String(
    currentUser?.role || ""
  ).toUpperCase();

  const roleLabel = {
    ADMIN: "Administrator",
    EMPLOYEE: "Employee",
    TECHNICIAN: "Technician"
  };

  useEffect(() => {
    if (!userId) return;

    const loadUnreadCount = async () => {
      try {
        const response = await apiRequest(
          `/notifications/user/${userId}/unread/count`
        );

        const count =
          typeof response === "number"
            ? response
            : Number(
                response?.unreadCount ??
                response?.count ??
                0
              );

        setUnreadCount(
          Number.isFinite(count) ? count : 0
        );
      } catch (error) {
        console.error(
          "Unable to load unread notification count:",
          error
        );
      }
    };

    loadUnreadCount();
  }, [userId]);

  const openNotifications = () => {
    navigate("/notifications");
  };

  return (
    <header className="topbar">

      <div className="topbar-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search tickets, employees..."
        />
      </div>

      <div className="topbar-actions">

        <button
          type="button"
          className="notification-btn"
          onClick={openNotifications}
          title="View notifications"
          aria-label={`Notifications. ${unreadCount} unread`}
        >
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="notification-dot">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div className="profile-section">

          <UserCircle size={34} />

          <div className="profile-info">
            <h4>{userName}</h4>

            <p>
              {roleLabel[userRole] || "User"}
            </p>
          </div>

          <ChevronDown size={17} />

        </div>

      </div>

    </header>
  );
}

export default Topbar;
