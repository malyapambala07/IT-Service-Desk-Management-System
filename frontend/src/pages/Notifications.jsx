
import { useEffect, useState } from "react";
import {
  Bell,
  Ticket,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Check,
  CheckCheck
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId = currentUser?.id;

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const loadNotifications = async () => {
    try {
      setError("");

      if (!userId) {
        throw new Error("User information not found. Please log in again.");
      }

      const response = await apiRequest(
        `/notifications/user/${userId}`
      );

      setNotifications(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      setActionLoading(true);

      await apiRequest(`/notifications/${id}/read`, {
        method: "PUT"
      });

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Unable to mark notification as read.");
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      setError("");

      const unreadNotifications = notifications.filter(
        (notification) => !notification.read
      );

      await Promise.all(
        unreadNotifications.map((notification) =>
          apiRequest(`/notifications/${notification.id}/read`, {
            method: "PUT"
          })
        )
      );

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Unable to mark all notifications as read.");
      await loadNotifications();
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setActionLoading(true);

      await apiRequest(`/notifications/${id}`, {
        method: "DELETE"
      });

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Unable to delete notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await Promise.all(
        notifications.map((notification) =>
          apiRequest(`/notifications/${notification.id}`, {
            method: "DELETE"
          })
        )
      );

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Unable to clear all notifications.");
      await loadNotifications();
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = (type) => {
    const notificationType = String(type || "").toUpperCase();

    if (
      notificationType.includes("ASSIGN")
    ) {
      return <UserCheck />;
    }

    if (
      notificationType.includes("RESOLV") ||
      notificationType.includes("CLOS")
    ) {
      return <CheckCircle />;
    }

    if (
      notificationType.includes("SLA") ||
      notificationType.includes("ALERT")
    ) {
      return <AlertTriangle />;
    }

    if (
      notificationType.includes("TICKET")
    ) {
      return <Ticket />;
    }

    return <Bell />;
  };

  const getTypeClass = (type) => {
    const notificationType = String(type || "").toUpperCase();

    if (notificationType.includes("ASSIGN")) return "assignment";

    if (
      notificationType.includes("RESOLV") ||
      notificationType.includes("CLOS")
    ) {
      return "resolved";
    }

    if (
      notificationType.includes("SLA") ||
      notificationType.includes("ALERT")
    ) {
      return "alert";
    }

    if (notificationType.includes("TICKET")) return "ticket";

    return "ticket";
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "Time unavailable";

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "Time unavailable";
    }

    const difference = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);

    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(
    (notification) => {
      if (activeFilter === "Unread") return !notification.read;
      if (activeFilter === "Read") return notification.read;
      return true;
    }
  );

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with ticket activities and system alerts.</p>
        </div>

        <div className="notification-header-actions">
          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || actionLoading}
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>

          <button
            className="clear-all-btn"
            onClick={clearAll}
            disabled={notifications.length === 0 || actionLoading}
          >
            <Trash2 size={17} />
            Clear all
          </button>
        </div>
      </div>

      <div className="notification-summary">
        <div className="notification-summary-icon">
          <Bell size={23} />
        </div>

        <div>
          <h2>{unreadCount} Unread Notifications</h2>
          <p>
            You have {notifications.length} notifications in total.
          </p>
        </div>
      </div>

      {error && (
        <div className="notification-error">
          {error}
        </div>
      )}

      <div className="notification-content">
        <div className="notification-tabs">
          {["All", "Unread", "Read"].map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}

              {filter === "Unread" && (
                <span className="notification-tab-count">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-empty">
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <div
                  className={`notification-icon ${getTypeClass(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="notification-details">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="unread-dot"></span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="notification-read-btn"
                      title="Mark as read"
                      onClick={() => markAsRead(notification.id)}
                      disabled={actionLoading}
                    >
                      <Check size={17} />
                    </button>
                  )}

                  <button
                    className="notification-delete-btn"
                    title="Delete notification"
                    onClick={() => deleteNotification(notification.id)}
                    disabled={actionLoading}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="notification-empty">
              <Bell size={35} />
              <h3>No notifications found</h3>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
