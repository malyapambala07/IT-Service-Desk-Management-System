
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter
} from "lucide-react";

import "./Tickets.css";
import { apiRequest } from "../services/api";

const emptyForm = {
  subject: "",
  employeeId: "",
  email: "",
  category: "Hardware",
  priority: "MEDIUM",
  status: "OPEN",
  technicianId: "",
  description: ""
};

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

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function Tickets() {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userRole = currentUser?.role;

  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD TICKETS

  const loadData = async () => {
    try {
      setError("");

      const ticketData = await apiRequest("/tickets");

      let employeeList = [];
      let technicianList = [];

      if (userRole === "ADMIN") {
        const [employeeData, technicianData] = await Promise.all([
          apiRequest("/users/role/EMPLOYEE/active"),
          apiRequest("/users/role/TECHNICIAN/active")
        ]);

        employeeList = employeeData || [];
        technicianList = technicianData || [];
      }

      setEmployees(employeeList);
      setTechnicians(technicianList);

      const mappedTickets = (ticketData || []).map((ticket) => {
        const employee = employeeList.find(
          (user) => String(user.id) === String(ticket.employeeId)
        );

        const technician = technicianList.find(
          (user) => String(user.id) === String(ticket.technicianId)
        );

        return {
          ...ticket,
          displayId: ticket.ticketNumber || `TKT-${ticket.id}`,
          employee:
            ticket.employeeName || employee?.fullName || "Unknown",
          email:
            employee?.email ||
            (String(ticket.employeeId) === String(currentUser?.id)
              ? currentUser?.email
              : "—"),
          technician:
            ticket.technicianName ||
            technician?.fullName ||
            "Unassigned",
          priority: priorityLabels[ticket.priority] || ticket.priority,
          status: statusLabels[ticket.status] || ticket.status,
          createdAt: formatDate(ticket.createdAt)
        };
      });

      setTickets(mappedTickets);
   } catch (err) {
  await loadData();
  setError(err.message || "Unable to save the ticket.");
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // TICKET STATISTICS

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Resolved" || ticket.status === "Closed"
  ).length;

  const criticalTickets = tickets.filter(
    (ticket) => ticket.priority === "Critical"
  ).length;

  // SEARCH AND FILTER

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(ticket.displayId).toLowerCase().includes(search) ||
      String(ticket.subject || "").toLowerCase().includes(search) ||
      String(ticket.employee || "").toLowerCase().includes(search) ||
      String(ticket.technician || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // OPEN CREATE FORM

  const handleAddClick = () => {
    setEditingTicketId(null);

    setFormData({
      ...emptyForm,
      employeeId: String(currentUser?.id || ""),
      email: currentUser?.email || ""
    });

    setShowForm(true);
    setSelectedTicket(null);
    setError("");
  };

  // OPEN EDIT FORM

  const handleEditClick = (ticket) => {
    setEditingTicketId(ticket.id);

    setFormData({
      subject: ticket.subject || "",
      employeeId: String(
        userRole === "EMPLOYEE"
          ? currentUser?.id || ""
          : ticket.employeeId || ""
      ),
      email: ticket.email === "—" ? "" : ticket.email,
      category: ticket.category || "Hardware",
      priority: ticket.priority?.toUpperCase() || "MEDIUM",
      status:
        ticket.status?.toUpperCase().replaceAll(" ", "_") || "OPEN",
      technicianId: ticket.technicianId
        ? String(ticket.technicianId)
        : "",
      description: ticket.description || ""
    });

    setShowForm(true);
    setSelectedTicket(null);
    setError("");
  };

  // HANDLE FORM INPUTS

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      const selectedEmployee = employees.find(
        (employee) => String(employee.id) === value
      );

      setFormData((previousData) => ({
        ...previousData,
        employeeId: value,
        email: selectedEmployee?.email || ""
      }));

      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // ADD OR UPDATE TICKET

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employeeId =
      userRole === "EMPLOYEE"
        ? currentUser?.id
        : formData.employeeId;

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const requestData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        employeeId: Number(employeeId)
      };

      let savedTicket;

      if (editingTicketId) {
        savedTicket = await apiRequest(
          `/tickets/${editingTicketId}`,
          {
            method: "PUT",
            body: JSON.stringify(requestData)
          }
        );
      } else {
        savedTicket = await apiRequest("/tickets", {
          method: "POST",
          body: JSON.stringify(requestData)
        });
      }

      const ticketId = editingTicketId || savedTicket?.id;

      if (!ticketId) {
        throw new Error("Ticket was saved, but its ID was not returned.");
      }

      // ADMIN ONLY: ASSIGN TECHNICIAN

      if (userRole === "ADMIN" && formData.technicianId) {
        const existingTicket = tickets.find(
          (ticket) => String(ticket.id) === String(ticketId)
        );

        if (
          !editingTicketId ||
          String(existingTicket?.technicianId || "") !==
            formData.technicianId
        ) {
          await apiRequest(
            `/tickets/${ticketId}/assign/${formData.technicianId}`,
            { method: "PUT" }
          );
        }
      }

      // ADMIN ONLY: UPDATE STATUS

      if (userRole === "ADMIN") {
        const existingTicket = tickets.find(
          (ticket) => String(ticket.id) === String(ticketId)
        );

        const previousStatus = existingTicket?.status
          ?.toUpperCase()
          .replaceAll(" ", "_");

        if (
          (!editingTicketId && formData.status !== "OPEN") ||
          (editingTicketId && previousStatus !== formData.status)
        ) {
          await apiRequest(
            `/tickets/${ticketId}/status?status=${formData.status}`,
            { method: "PUT" }
          );
        }
      }

      setFormData(emptyForm);
      setEditingTicketId(null);
      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save the ticket.");
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  // TECHNICIAN: UPDATE TICKET STATUS

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      setError("");

      await apiRequest(
        `/tickets/${ticket.id}/status?status=${newStatus}`,
        { method: "PUT" }
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update ticket status.");
    }
  };

  // DELETE TICKET

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await apiRequest(`/tickets/${id}`, {
        method: "DELETE"
      });

      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete the ticket.");
    }
  };

  // CLOSE FORM

  const handleCancel = () => {
    setShowForm(false);
    setEditingTicketId(null);
    setFormData(emptyForm);
    setError("");
  };

  return (
    <div className="tickets-page">

      {/* PAGE HEADER */}

      <div className="tickets-header">
        <div>
          <h1>Ticket Management</h1>
          <p>Create, assign and monitor IT support tickets.</p>
        </div>

        {userRole === "EMPLOYEE" && (
          <button
            className="create-ticket-btn"
            onClick={handleAddClick}
          >
            <Plus size={18} />
            Create Ticket
          </button>
        )}
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="critical-ticket-notice">
          <AlertTriangle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* STATISTICS */}

      <div className="ticket-stats-grid">

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon total">
            <Ticket size={22} />
          </div>
          <div>
            <p>Total Tickets</p>
            <h2>{totalTickets}</h2>
          </div>
        </div>

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon open">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p>Open Tickets</p>
            <h2>{openTickets}</h2>
          </div>
        </div>

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon progress">
            <Clock size={22} />
          </div>
          <div>
            <p>In Progress</p>
            <h2>{inProgressTickets}</h2>
          </div>
        </div>

        <div className="ticket-stat-card">
          <div className="ticket-stat-icon resolved">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Resolved / Closed</p>
            <h2>{resolvedTickets}</h2>
          </div>
        </div>

      </div>

      {/* CRITICAL TICKET NOTICE */}

      {criticalTickets > 0 && (
        <div className="critical-ticket-notice">
          <AlertTriangle size={19} />
          <span>
            You have {criticalTickets} critical priority ticket(s) requiring attention.
          </span>
        </div>
      )}

      {/* CREATE / EDIT FORM */}

      {showForm && (
        <div className="ticket-form-container">

          <div className="ticket-form-header">
            <h2>
              {editingTicketId ? "Edit Ticket" : "Create New Ticket"}
            </h2>

            <button
              type="button"
              className="close-ticket-form"
              onClick={handleCancel}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="ticket-form-grid">

              <div className="ticket-form-group full-width">
                <label>Ticket Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter ticket subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  maxLength="150"
                  required
                />
              </div>

              {userRole === "ADMIN" && (
                <div className="ticket-form-group">
                  <label>Employee</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Employee</option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {userRole === "ADMIN" && (
                <div className="ticket-form-group">
                  <label>Employee Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Employee email"
                    value={formData.email}
                    readOnly
                  />
                </div>
              )}

              <div className="ticket-form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                  <option value="Database">Database</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="ticket-form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {userRole === "ADMIN" && (
                <>
                  <div className="ticket-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="OPEN">Open</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div className="ticket-form-group">
                    <label>Assign Technician</label>
                    <select
                      name="technicianId"
                      value={formData.technicianId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Technician</option>

                      {technicians.map((technician) => (
                        <option key={technician.id} value={technician.id}>
                          {technician.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="ticket-form-group full-width">
                <label>Issue Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>

            </div>

            <div className="ticket-form-buttons">
              <button
                type="submit"
                className="save-ticket-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingTicketId
                    ? "Update Ticket"
                    : "Create Ticket"}
              </button>

              <button
                type="button"
                className="cancel-ticket-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TICKET TOOLBAR */}

      <div className="ticket-toolbar">

        <div>
          <h2>All Tickets</h2>
          <p>{filteredTickets.length} tickets displayed</p>
        </div>

        <div className="ticket-filters">

          <div className="ticket-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ticket-filter-select">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="ticket-filter-select">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

        </div>
      </div>

      {/* TICKET TABLE */}

      <div className="ticket-table-container">

        <table className="ticket-table">

          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Employee</th>
              <th>Technician</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="8" className="no-tickets">
                  Loading tickets...
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>

                  <td className="ticket-id">{ticket.displayId}</td>

                  <td className="ticket-subject">{ticket.subject}</td>

                  <td>{ticket.employee}</td>

                  <td>{ticket.technician}</td>

                  <td>
                    <span
                      className={`ticket-priority ${ticket.priority.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td>
                    {userRole === "TECHNICIAN" &&
                    String(ticket.technicianId) === String(currentUser?.id) ? (
                      <select
                        value={
                          ticket.status?.toUpperCase().replaceAll(" ", "_")
                        }
                        onChange={(e) =>
                          handleStatusChange(ticket, e.target.value)
                        }
                      >
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    ) : (
                      <span
                        className={`ticket-status ${ticket.status.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        {ticket.status}
                      </span>
                    )}
                  </td>

                  <td>{ticket.createdAt}</td>

                  <td>
                    <div className="ticket-actions">

                      <button
                        className="view-ticket-btn"
                        title="View Ticket"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye size={16} />
                      </button>

                      {(userRole === "ADMIN" ||
                        (userRole === "EMPLOYEE" &&
                          String(ticket.employeeId) === String(currentUser?.id))) && (
                        <button
                          className="edit-ticket-btn"
                          title="Edit Ticket"
                          onClick={() => handleEditClick(ticket)}
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {userRole === "ADMIN" && (
                        <button
                          className="delete-ticket-btn"
                          title="Delete Ticket"
                          onClick={() => handleDeleteClick(ticket.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))
            )}

            {!loading && filteredTickets.length === 0 && (
              <tr>
                <td colSpan="8" className="no-tickets">
                  No tickets found.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* TICKET DETAILS */}

      {selectedTicket && (
        <div className="ticket-modal-overlay">
          <div className="ticket-details-modal">

            <div className="ticket-modal-header">
              <div>
                <p>Ticket Details</p>
                <h2>{selectedTicket.displayId}</h2>
              </div>

              <button
                className="close-ticket-form"
                onClick={() => setSelectedTicket(null)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ticket-details-content">

              <h3>{selectedTicket.subject}</h3>

              <div className="ticket-detail-badges">
                <span
                  className={`ticket-priority ${selectedTicket.priority.toLowerCase()}`}
                >
                  {selectedTicket.priority}
                </span>

                <span
                  className={`ticket-status ${selectedTicket.status.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {selectedTicket.status}
                </span>
              </div>

              <div className="ticket-detail-grid">

                <div>
                  <label>Employee</label>
                  <p>{selectedTicket.employee}</p>
                </div>

                <div>
                  <label>Email</label>
                  <p>{selectedTicket.email}</p>
                </div>

                <div>
                  <label>Category</label>
                  <p>{selectedTicket.category}</p>
                </div>

                <div>
                  <label>Assigned Technician</label>
                  <p>{selectedTicket.technician}</p>
                </div>

                <div>
                  <label>Created Date</label>
                  <p>{selectedTicket.createdAt}</p>
                </div>

              </div>

              <div className="ticket-description">
                <label>Issue Description</label>
                <p>{selectedTicket.description}</p>
              </div>

            </div>

            <div className="ticket-modal-footer">

              <button
                className="cancel-ticket-btn"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>

              {(userRole === "ADMIN" ||
                (userRole === "EMPLOYEE" &&
                  String(selectedTicket.employeeId) === String(currentUser?.id))) && (
                <button
                  className="save-ticket-btn"
                  onClick={() => handleEditClick(selectedTicket)}
                >
                  <Pencil size={15} />
                  Edit Ticket
                </button>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Tickets;
