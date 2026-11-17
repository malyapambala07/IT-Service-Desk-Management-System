
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./RecentTickets.css";

function RecentTickets() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await apiRequest("/tickets");

        const sortedTickets = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTickets(sortedTickets.slice(0, 5));
      } catch (err) {
        setError(err.message);
      }
    };

    loadTickets();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return status.replaceAll("_", " ").toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="recent-tickets">
      <div className="table-header">
        <div>
          <h3>Recent Tickets</h3>
          <p>Latest IT support requests</p>
        </div>

        <Link to="/tickets" className="view-all-btn">
          View All
        </Link>
      </div>

      {error && (
        <p style={{ color: "#f87171" }}>
          Unable to load tickets: {error}
        </p>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Employee</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="7">No tickets available.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticketNumber}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.employeeName}</td>

                  <td>
                    <span className={`priority ${ticket.priority?.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`status ${ticket.status?.toLowerCase().replaceAll("_", "-")}`}>
                      {formatStatus(ticket.status)}
                    </span>
                  </td>

                  <td>{formatDate(ticket.createdAt)}</td>

                  <td>
                    <Link
                      to="/tickets"
                      className="view-ticket-btn"
                      title="View tickets"
                    >
                      <Eye size={17} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTickets;
