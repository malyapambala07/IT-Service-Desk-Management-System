
import { useEffect, useState } from "react";
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle,
  UserCheck,
  AlertTriangle
} from "lucide-react";

import { apiRequest } from "../services/api";
import StatCard from "../components/StatCard";
import TicketChart from "../components/TicketChart";
import RecentTickets from "../components/RecentTickets";
import "./Dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiRequest("/dashboard");
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDashboard();
  }, []);

  const statistics = [
    {
      title: "Total Tickets",
      value: dashboard?.totalTickets ?? 0,
      icon: Ticket,
      color: "blue",
      description: "All tickets registered"
    },
    {
      title: "Open Tickets",
      value: dashboard?.openTickets ?? 0,
      icon: AlertCircle,
      color: "orange",
      description: "Awaiting assignment"
    },
    {
      title: "Assigned Tickets",
      value: dashboard?.assignedTickets ?? 0,
      icon: UserCheck,
      color: "blue",
      description: "Assigned to technicians"
    },
    {
      title: "In Progress",
      value: dashboard?.inProgressTickets ?? 0,
      icon: Clock,
      color: "purple",
      description: "Currently being handled"
    },
    {
      title: "Resolved",
      value: dashboard?.resolvedTickets ?? 0,
      icon: CheckCircle,
      color: "green",
      description: "Successfully resolved"
    },
    {
      title: "Critical Tickets",
      value: dashboard?.criticalTickets ?? 0,
      icon: AlertTriangle,
      color: "red",
      description: "Highest priority tickets"
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h1>Dashboard</h1>
        <p>Welcome to IT Service Desk Management System.</p>
      </div>

      {error && (
        <p style={{ color: "#f87171" }}>
          Unable to load dashboard: {error}
        </p>
      )}

      <div className="stats-grid">
        {statistics.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="dashboard-charts">
        <TicketChart statusCounts={dashboard?.statusCounts} />
      </div>

      <RecentTickets />
    </div>
  );
}

export default Dashboard;
