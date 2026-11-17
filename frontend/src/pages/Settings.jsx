
import { useEffect, useState } from "react";

import {
  Settings as SettingsIcon,
  Bell,
  Ticket,
  Shield,
  Save,
  RotateCcw,
  LockKeyhole,
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Settings.css";

const initialSettings = {
  applicationName: "",
  supportEmail: "",
  ticketPrefix: "",
  maintenanceMode: false,
  autoAssignTechnician: false,
  emailNotifications: true,
  ticketNotifications: true,
  slaNotifications: true,
  defaultPriority: "MEDIUM",
  defaultStatus: "OPEN",
};

function Settings() {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin =
    String(currentUser?.role || "").toUpperCase() === "ADMIN";

  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/settings");

      setSettings({
        applicationName: response.applicationName ?? "",
        supportEmail: response.supportEmail ?? "",
        ticketPrefix: response.ticketPrefix ?? "",
        maintenanceMode: response.maintenanceMode ?? false,
        autoAssignTechnician:
          response.autoAssignTechnician ?? false,
        emailNotifications: response.emailNotifications ?? true,
        ticketNotifications: response.ticketNotifications ?? true,
        slaNotifications: response.slaNotifications ?? true,
        defaultPriority: response.defaultPriority ?? "MEDIUM",
        defaultStatus: response.defaultStatus ?? "OPEN",
      });

      setUpdatedAt(response.updatedAt ?? null);
      setSaved(false);
    } catch (err) {
      setError(err.message || "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    if (
      !settings.applicationName.trim() ||
      !settings.supportEmail.trim() ||
      !settings.ticketPrefix.trim()
    ) {
      setError("Please complete all required application settings.");
      return;
    }

    if (settings.ticketPrefix.length > 10) {
      setError("Ticket prefix cannot exceed 10 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const requestData = {
        applicationName: settings.applicationName.trim(),
        supportEmail: settings.supportEmail.trim(),
        ticketPrefix: settings.ticketPrefix.trim(),
        maintenanceMode: settings.maintenanceMode,
        autoAssignTechnician: settings.autoAssignTechnician,
        emailNotifications: settings.emailNotifications,
        ticketNotifications: settings.ticketNotifications,
        slaNotifications: settings.slaNotifications,
        defaultPriority: settings.defaultPriority,
        defaultStatus: settings.defaultStatus,
      };

      const response = await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify(requestData),
      });

      setSettings({
        applicationName: response.applicationName ?? requestData.applicationName,
        supportEmail: response.supportEmail ?? requestData.supportEmail,
        ticketPrefix: response.ticketPrefix ?? requestData.ticketPrefix,
        maintenanceMode: response.maintenanceMode ?? requestData.maintenanceMode,
        autoAssignTechnician:
          response.autoAssignTechnician ?? requestData.autoAssignTechnician,
        emailNotifications:
          response.emailNotifications ?? requestData.emailNotifications,
        ticketNotifications:
          response.ticketNotifications ?? requestData.ticketNotifications,
        slaNotifications:
          response.slaNotifications ?? requestData.slaNotifications,
        defaultPriority:
          response.defaultPriority ?? requestData.defaultPriority,
        defaultStatus:
          response.defaultStatus ?? requestData.defaultStatus,
      });

      setUpdatedAt(response.updatedAt ?? null);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordSaving(true);

      await apiRequest("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      setPasswordSuccess(
        "Password changed successfully! Please log in again using your new password."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.message || "Unable to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Manage service desk application preferences.</p>
          </div>
        </div>

        <p className="settings-error">
          Only administrators can access system settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="settings-page">
        <h1>Settings</h1>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your service desk application preferences.</p>
        </div>

        <div className="settings-header-icon">
          <SettingsIcon size={26} />
        </div>
      </div>

      {error && (
        <p className="settings-error">{error}</p>
      )}

      <form onSubmit={handleSave}>
        <div className="settings-card">
          <div className="settings-card-title">
            <SettingsIcon size={20} />
            <div>
              <h2>Application Settings</h2>
              <p>Configure general application information.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Application Name</label>
              <input
                name="applicationName"
                value={settings.applicationName}
                onChange={handleChange}
                placeholder="Enter application name"
                required
              />
            </div>

            <div className="settings-field">
              <label>Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                placeholder="Enter support email"
                required
              />
            </div>

            <div className="settings-field">
              <label>Ticket ID Prefix</label>
              <input
                name="ticketPrefix"
                value={settings.ticketPrefix}
                onChange={handleChange}
                maxLength={10}
                placeholder="Example: TKT"
                required
              />
            </div>
          </div>

          <label className="settings-toggle">
            <div>
              <strong>Maintenance Mode</strong>
              <span>
                Enable maintenance mode for the application.
              </span>
            </div>

            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="settings-card">
          <div className="settings-card-title">
            <Ticket size={20} />
            <div>
              <h2>Ticket Configuration</h2>
              <p>Set default values for newly created tickets.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Default Ticket Priority</label>
              <select
                name="defaultPriority"
                value={settings.defaultPriority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Default Ticket Status</label>
              <select
                name="defaultStatus"
                value={settings.defaultStatus}
                onChange={handleChange}
              >
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <label className="settings-toggle">
            <div>
              <strong>Automatic Technician Assignment</strong>
              <span>
                Enable automatic assignment of tickets to technicians.
              </span>
            </div>

            <input
              type="checkbox"
              name="autoAssignTechnician"
              checked={settings.autoAssignTechnician}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="settings-card">
          <div className="settings-card-title">
            <Bell size={20} />
            <div>
              <h2>Notification Preferences</h2>
              <p>Choose which notifications should be enabled.</p>
            </div>
          </div>

          <label className="settings-toggle">
            <div>
              <strong>Email Notifications</strong>
              <span>Receive notifications through email.</span>
            </div>

            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
          </label>

          <label className="settings-toggle">
            <div>
              <strong>Ticket Notifications</strong>
              <span>
                Get updates when tickets are created or updated.
              </span>
            </div>

            <input
              type="checkbox"
              name="ticketNotifications"
              checked={settings.ticketNotifications}
              onChange={handleChange}
            />
          </label>

          <label className="settings-toggle">
            <div>
              <strong>SLA Notifications</strong>
              <span>
                Receive alerts about approaching or overdue SLA deadlines.
              </span>
            </div>

            <input
              type="checkbox"
              name="slaNotifications"
              checked={settings.slaNotifications}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="settings-card settings-info-card">
          <div className="settings-card-title">
            <Shield size={20} />
            <div>
              <h2>System Information</h2>
              <p>Basic information about this application.</p>
            </div>
          </div>

          <div className="system-info-grid">
            <div>
              <span>Application</span>
              <strong>{settings.applicationName || "IT Service Desk"}</strong>
            </div>

            <div>
              <span>Version</span>
              <strong>1.0.0</strong>
            </div>

            <div>
              <span>Frontend</span>
              <strong>React</strong>
            </div>

            <div>
              <span>Backend</span>
              <strong>Java Spring Boot</strong>
            </div>

            <div>
              <span>Database</span>
              <strong>MySQL</strong>
            </div>

            {updatedAt && (
              <div>
                <span>Last Updated</span>
                <strong>{new Date(updatedAt).toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="settings-reset-btn"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw size={17} />
            Reload Saved Settings
          </button>

          <button
            type="submit"
            className="settings-save-btn"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {saved && (
          <p className="settings-saved-message">
            Settings saved successfully.
          </p>
        )}
      </form>

      {/* CHANGE PASSWORD */}
      <div className="settings-card password-card">
        <div className="settings-card-title">
          <LockKeyhole size={20} />
          <div>
            <h2>Change Admin Password</h2>
            <p>
              Update your administrator account password securely.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword}>
          <div className="password-fields">
            <div className="settings-field">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInput}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="settings-field">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInput}
                placeholder="Enter new password"
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="settings-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInput}
                placeholder="Confirm new password"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          {passwordError && (
            <p className="settings-error">{passwordError}</p>
          )}

          {passwordSuccess && (
            <p className="settings-saved-message">
              {passwordSuccess}
            </p>
          )}

          <div className="settings-actions">
            <button
              type="submit"
              className="settings-save-btn"
              disabled={passwordSaving}
            >
              <LockKeyhole size={17} />
              {passwordSaving
                ? "Updating Password..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
