
import { useEffect, useState } from "react";

import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer,
  Settings,
  Save
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./SLA.css";

const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const PRIORITY_LABELS = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low"
};

function SLA() {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin =
    String(currentUser?.role || "").toUpperCase() === "ADMIN";

  const [policies, setPolicies] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSLAData();
  }, []);

  const loadSLAData = async () => {
    try {
      setLoading(true);
      setError("");

      const [policyResponse, ticketResponse] = await Promise.all([
        apiRequest("/sla"),
        apiRequest("/tickets")
      ]);

      setPolicies(
        Array.isArray(policyResponse) ? policyResponse : []
      );

      setTickets(
        Array.isArray(ticketResponse) ? ticketResponse : []
      );
    } catch (err) {
      setError(err.message || "Unable to load SLA information.");
    } finally {
      setLoading(false);
    }
  };

  const getPolicy = (priority) => {
    return policies.find(
      (policy) =>
        String(policy.priority).toUpperCase() ===
        String(priority).toUpperCase()
    );
  };

  const handlePolicyChange = (priority, field, value) => {
    setPolicies((previous) => {
      const existingPolicy = previous.find(
        (policy) =>
          String(policy.priority).toUpperCase() === priority
      );

      if (existingPolicy) {
        return previous.map((policy) =>
          String(policy.priority).toUpperCase() === priority
            ? { ...policy, [field]: value }
            : policy
        );
      }

      return [
        ...previous,
        {
          priority,
          responseTimeHours:
            field === "responseTimeHours" ? value : "",
          resolutionTimeHours:
            field === "resolutionTimeHours" ? value : ""
        }
      ];
    });

    setSaved(false);
  };

  const handleSave = async () => {
    if (!isAdmin) return;

    const policiesToSave = PRIORITIES.map((priority) =>
      getPolicy(priority)
    );

    const invalidPolicy = policiesToSave.some(
      (policy) =>
        !policy ||
        !Number.isInteger(Number(policy.responseTimeHours)) ||
        !Number.isInteger(Number(policy.resolutionTimeHours)) ||
        Number(policy.responseTimeHours) <= 0 ||
        Number(policy.resolutionTimeHours) <= 0 ||
        Number(policy.responseTimeHours) >=
          Number(policy.resolutionTimeHours)
    );

    if (invalidPolicy) {
      alert(
        "Please enter valid positive whole-number hours for every priority. Response time must be less than resolution time."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      await Promise.all(
        policiesToSave.map((policy) => {
          const requestData = {
            priority: String(policy.priority).toUpperCase(),
            responseTimeHours: Number(policy.responseTimeHours),
            resolutionTimeHours: Number(policy.resolutionTimeHours)
          };

          if (policy.id) {
            return apiRequest("/sla", {
              method: "PUT",
              body: JSON.stringify(requestData)
            });
          }

          return apiRequest("/sla", {
            method: "POST",
            body: JSON.stringify(requestData)
          });
        })
      );

      await loadSLAData();
      setSaved(true);
    } catch (err) {
      setError(err.message || "Unable to save SLA policies.");
    } finally {
      setSaving(false);
    }
  };

  const getTicketSLAStatus = (ticket) => {
    const status = String(ticket.status || "").toUpperCase();

    if (["RESOLVED", "CLOSED"].includes(status)) {
      return "Completed";
    }

    if (!ticket.slaDeadline) {
      return "Not Configured";
    }

    const deadline = new Date(ticket.slaDeadline);

    if (Number.isNaN(deadline.getTime())) {
      return "Not Configured";
    }

    const remainingMilliseconds = deadline.getTime() - Date.now();

    if (remainingMilliseconds <= 0) {
      return "Overdue";
    }

    const policy = getPolicy(ticket.priority);

    if (!policy || !ticket.createdAt) {
      return "On Track";
    }

    const createdAt = new Date(ticket.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return "On Track";
    }

    const totalSlaMilliseconds =
      Number(policy.resolutionTimeHours) * 60 * 60 * 1000;

    if (totalSlaMilliseconds <= 0) {
      return "Not Configured";
    }

    const remainingPercentage =
      (remainingMilliseconds / totalSlaMilliseconds) * 100;

    if (remainingPercentage <= 20) {
      return "At Risk";
    }

    return "On Track";
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "Not available";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  };

  const overdueCount = tickets.filter(
    (ticket) => getTicketSLAStatus(ticket) === "Overdue"
  ).length;

  const atRiskCount = tickets.filter(
    (ticket) => getTicketSLAStatus(ticket) === "At Risk"
  ).length;

  const onTrackCount = tickets.filter(
    (ticket) => getTicketSLAStatus(ticket) === "On Track"
  ).length;

  const completedCount = tickets.filter(
    (ticket) => getTicketSLAStatus(ticket) === "Completed"
  ).length;

  if (loading) {
    return (
      <div className="sla-page">
        <h1>SLA Management</h1>
        <p>Loading SLA information...</p>
      </div>
    );
  }

  if (error && policies.length === 0 && tickets.length === 0) {
    return (
      <div className="sla-page">
        <h1>SLA Management</h1>
        <p>{error}</p>

        <button onClick={loadSLAData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="sla-page">
      <div className="sla-header">
        <div>
          <h1>SLA Management</h1>
          <p>
            Configure service-level agreements and monitor deadlines.
          </p>
        </div>
      </div>

      {error && (
        <div className="sla-error">
          {error}
        </div>
      )}

      <div className="sla-stats">
        <div className="sla-stat-card">
          <div className="sla-icon purple">
            <Timer />
          </div>
          <div>
            <h3>{tickets.length}</h3>
            <p>Tracked Tickets</p>
          </div>
        </div>

        <div className="sla-stat-card">
          <div className="sla-icon red">
            <AlertTriangle />
          </div>
          <div>
            <h3>{overdueCount}</h3>
            <p>Overdue</p>
          </div>
        </div>

        <div className="sla-stat-card">
          <div className="sla-icon orange">
            <Clock />
          </div>
          <div>
            <h3>{atRiskCount}</h3>
            <p>At Risk</p>
          </div>
        </div>

        <div className="sla-stat-card">
          <div className="sla-icon green">
            <CheckCircle />
          </div>
          <div>
            <h3>{onTrackCount + completedCount}</h3>
            <p>On Track / Completed</p>
          </div>
        </div>
      </div>

      <div className="sla-policy-card">
        <div className="sla-section-heading">
          <div className="sla-heading-icon">
            <Settings size={20} />
          </div>

          <div>
            <h2>SLA Policy Configuration</h2>
            <p>
              Define response and resolution targets for each priority.
            </p>
          </div>
        </div>

        <div className="sla-policy-table-wrapper">
          <table className="sla-policy-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Response Time (Hours)</th>
                <th>Resolution Time (Hours)</th>
              </tr>
            </thead>

            <tbody>
              {PRIORITIES.map((priority) => {
                const policy = getPolicy(priority);

                return (
                  <tr key={priority}>
                    <td>
                      <span
                        className={`sla-priority ${priority.toLowerCase()}`}
                      >
                        {PRIORITY_LABELS[priority]}
                      </span>
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={policy?.responseTimeHours ?? ""}
                        disabled={!isAdmin || saving}
                        placeholder="Hours"
                        onChange={(event) =>
                          handlePolicyChange(
                            priority,
                            "responseTimeHours",
                            event.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={policy?.resolutionTimeHours ?? ""}
                        disabled={!isAdmin || saving}
                        placeholder="Hours"
                        onChange={(event) =>
                          handlePolicyChange(
                            priority,
                            "resolutionTimeHours",
                            event.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sla-save-area">
          {saved && (
            <span className="sla-saved-message">
              <CheckCircle size={16} />
              Policies saved successfully!
            </span>
          )}

          {isAdmin ? (
            <button
              className="sla-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Policies"}
            </button>
          ) : (
            <span>
              Only administrators can modify SLA policies.
            </span>
          )}
        </div>
      </div>

      <div className="sla-tickets-card">
        <div className="sla-section-heading">
          <div>
            <h2>SLA Monitoring</h2>
            <p>
              Actual ticket deadlines and calculated SLA status.
            </p>
          </div>
        </div>

        <div className="sla-ticket-table-wrapper">
          <table className="sla-ticket-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Resolution Deadline</th>
                <th>SLA Status</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const slaStatus = getTicketSLAStatus(ticket);

                  return (
                    <tr key={ticket.id}>
                      <td className="sla-ticket-id">
                        {ticket.ticketNumber || ticket.id}
                      </td>

                      <td>{ticket.subject}</td>

                      <td>
                        <span
                          className={`sla-priority ${String(
                            ticket.priority || ""
                          ).toLowerCase()}`}
                        >
                          {PRIORITY_LABELS[
                            String(ticket.priority || "").toUpperCase()
                          ] || ticket.priority}
                        </span>
                      </td>

                      <td>
                        {formatDeadline(ticket.slaDeadline)}
                      </td>

                      <td>
                        <span
                          className={`sla-status ${slaStatus
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {slaStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">
                    No tickets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SLA;
