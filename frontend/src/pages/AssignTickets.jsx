
import { useEffect, useState } from "react";
import {
  Search,
  UserCheck,
  ClipboardList,
  Clock,
  CheckCircle,
  UserPlus
} from "lucide-react";
import { apiRequest } from "../services/api";
import "./AssignTickets.css";

const statusLabels = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
};

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
};

function AssignTickets() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [ticketData, technicianData] = await Promise.all([
        apiRequest("/tickets"),
        apiRequest("/users/role/TECHNICIAN/active")
      ]);

      setTickets(ticketData || []);
      setTechnicians(technicianData || []);
    } catch (err) {
      setError(err.message || "Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTechnicianChange = (ticketId, technicianId) => {
    setSelectedTechnicians(previous => ({
      ...previous,
      [ticketId]: technicianId
    }));
  };

  const handleAssign = async (ticketId) => {
    const technicianId = selectedTechnicians[ticketId];

    if (!technicianId) {
      setError("Please select a technician first.");
      return;
    }

    try {
      setError("");
      setAssigningTicketId(ticketId);

      await apiRequest(
        `/tickets/${ticketId}/assign/${technicianId}`,
        { method: "PUT" }
      );

      setSelectedTechnicians(previous => ({
        ...previous,
        [ticketId]: ""
      }));

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to assign ticket.");
    } finally {
      setAssigningTicketId(null);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    [
      ticket.ticketNumber,
      ticket.subject,
      ticket.employeeName,
      ticket.technicianName
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const unassignedCount = tickets.filter(
    ticket => !ticket.technicianId
  ).length;

  const assignedCount = tickets.filter(
    ticket => ticket.technicianId
  ).length;

  const openCount = tickets.filter(
    ticket => ticket.status === "OPEN"
  ).length;

  return (
    <div className="assign-page">
      <div className="assign-header">
        <div>
          <h1>Assign Tickets</h1>
          <p>Allocate support tickets to available technicians.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="assign-stats">
        <div className="assign-stat-card">
          <div className="assign-stat-icon purple">
            <ClipboardList />
          </div>
          <div>
            <h3>{tickets.length}</h3>
            <p>Total Tickets</p>
          </div>
        </div>

        <div className="assign-stat-card">
          <div className="assign-stat-icon orange">
            <Clock />
          </div>
          <div>
            <h3>{unassignedCount}</h3>
            <p>Unassigned</p>
          </div>
        </div>

        <div className="assign-stat-card">
          <div className="assign-stat-icon blue">
            <UserCheck />
          </div>
          <div>
            <h3>{assignedCount}</h3>
            <p>Assigned</p>
          </div>
        </div>

        <div className="assign-stat-card">
          <div className="assign-stat-icon green">
            <CheckCircle />
          </div>
          <div>
            <h3>{openCount}</h3>
            <p>Open Tickets</p>
          </div>
        </div>
      </div>

      <div className="assign-content">
        <div className="assign-section-header">
          <div>
            <h2>Ticket Allocation</h2>
            <p>Choose a technician and assign the ticket.</p>
          </div>

          <div className="assign-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="assign-table-wrapper">
          <table className="assign-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Employee</th>
                <th>Priority</th>
                <th>Technician</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="assign-empty">
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="assign-empty">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td className="assign-ticket-id">
                      {ticket.ticketNumber || `TKT-${ticket.id}`}
                    </td>

                    <td>{ticket.subject}</td>

                    <td>{ticket.employeeName || "Unknown"}</td>

                    <td>
                      <span
                        className={`assign-priority ${(ticket.priority || "").toLowerCase()}`}
                      >
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>

                    <td>
                      <select
                        className="technician-select"
                        value={
                          selectedTechnicians[ticket.id] ??
                          String(ticket.technicianId || "")
                        }
                        onChange={event =>
                          handleTechnicianChange(
                            ticket.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="">Select Technician</option>

                        {technicians.map(technician => (
                          <option
                            key={technician.id}
                            value={technician.id}
                          >
                            {technician.fullName}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <span
                        className={`assign-status ${(ticket.status || "").toLowerCase()}`}
                      >
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="assign-action-btn"
                        onClick={() => handleAssign(ticket.id)}
                        disabled={assigningTicketId === ticket.id}
                      >
                        <UserPlus size={15} />
                        {assigningTicketId === ticket.id
                          ? "Assigning..."
                          : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AssignTickets;
