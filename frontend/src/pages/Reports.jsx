
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Reports.css";

const statusColors = [
  "#facc15",
  "#60a5fa",
  "#a78bfa",
  "#4ade80",
  "#94a3b8"
];

const STATUS_LABELS = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
};

function Reports() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/tickets");

      setTickets(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const getDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const totalTickets = tickets.length;

  const resolvedTickets = tickets.filter((ticket) =>
    ["RESOLVED", "CLOSED"].includes(
      String(ticket.status || "").toUpperCase()
    )
  );

  const openTickets = tickets.filter(
    (ticket) =>
      String(ticket.status || "").toUpperCase() === "OPEN"
  );

  const resolutionTimes = resolvedTickets
    .map((ticket) => {
      const created = getDate(ticket.createdAt);
      const resolved = getDate(ticket.resolvedAt);

      if (!created || !resolved || resolved < created) {
        return null;
      }

      return (resolved - created) / (1000 * 60 * 60);
    })
    .filter((hours) => hours !== null);

  const averageResolutionTime =
    resolutionTimes.length > 0
      ? resolutionTimes.reduce((total, hours) => total + hours, 0) /
        resolutionTimes.length
      : null;

  const statusData = Object.entries(STATUS_LABELS).map(
    ([status, name]) => ({
      name,
      value: tickets.filter(
        (ticket) =>
          String(ticket.status || "").toUpperCase() === status
      ).length
    })
  );

  const priorityData = Object.entries(PRIORITY_LABELS).map(
    ([priority, name]) => ({
      name,
      tickets: tickets.filter(
        (ticket) =>
          String(ticket.priority || "").toUpperCase() === priority
      ).length
    })
  );

  const monthlyData = (() => {
    const months = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const month = date.getMonth();

      const created = tickets.filter((ticket) => {
        const ticketDate = getDate(ticket.createdAt);

        return (
          ticketDate &&
          ticketDate.getFullYear() === year &&
          ticketDate.getMonth() === month
        );
      }).length;

      const resolved = tickets.filter((ticket) => {
        const resolvedDate = getDate(ticket.resolvedAt);

        return (
          resolvedDate &&
          resolvedDate.getFullYear() === year &&
          resolvedDate.getMonth() === month
        );
      }).length;

      months.push({
        month: date.toLocaleString("en-US", {
          month: "short"
        }),
        created,
        resolved
      });
    }

    return months;
  })();

  const technicianData = (() => {
    const performance = {};

    resolvedTickets.forEach((ticket) => {
      if (!ticket.technicianName) return;

      performance[ticket.technicianName] =
        (performance[ticket.technicianName] || 0) + 1;
    });

    return Object.entries(performance)
      .map(([name, resolved]) => ({
        name,
        resolved
      }))
      .sort((a, b) => b.resolved - a.resolved);
  })();

  const handleExport = () => {
    const report = [
      ["IT SERVICE DESK - REPORT SUMMARY"],
      ["Metric", "Value"],
      ["Total Tickets", totalTickets],
      ["Resolved Tickets", resolvedTickets.length],
      ["Open Tickets", openTickets.length],
      [
        "Average Resolution Time (hours)",
        averageResolutionTime === null
          ? "Not available"
          : averageResolutionTime.toFixed(2)
      ],
      [],
      ["TICKETS BY STATUS"],
      ["Status", "Tickets"],
      ...statusData.map((item) => [item.name, item.value]),
      [],
      ["TICKETS BY PRIORITY"],
      ["Priority", "Tickets"],
      ...priorityData.map((item) => [item.name, item.tickets]),
      [],
      ["MONTHLY TICKET TRENDS"],
      ["Month", "Created", "Resolved"],
      ...monthlyData.map((item) => [
        item.month,
        item.created,
        item.resolved
      ]),
      [],
      ["TECHNICIAN PERFORMANCE"],
      ["Technician", "Resolved Tickets"],
      ...technicianData.map((item) => [
        item.name,
        item.resolved
      ])
    ];

    const csvContent = report
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "IT-Service-Desk-Report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <h1>Reports & Analytics</h1>
        <p>Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <h1>Reports & Analytics</h1>
        <p>{error}</p>
        <button onClick={loadReports}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>
            Monitor ticket activity and support team performance.
          </p>
        </div>

        <button
          className="export-report-btn"
          onClick={handleExport}
        >
          <Download size={17} />
          Export Report
        </button>
      </div>

      <div className="report-stats">
        <div className="report-stat-card">
          <div className="report-stat-icon purple">
            <FileText />
          </div>
          <div>
            <h3>{totalTickets}</h3>
            <p>Total Tickets</p>
            <span>Overall ticket volume</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon green">
            <CheckCircle />
          </div>
          <div>
            <h3>{resolvedTickets.length}</h3>
            <p>Resolved Tickets</p>
            <span>
              {totalTickets > 0
                ? `${((resolvedTickets.length / totalTickets) * 100).toFixed(1)}% of total tickets`
                : "No tickets available"}
            </span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange">
            <Clock />
          </div>
          <div>
            <h3>{openTickets.length}</h3>
            <p>Open Tickets</p>
            <span>Awaiting action</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon red">
            <AlertTriangle />
          </div>
          <div>
            <h3>
              {averageResolutionTime === null
                ? "—"
                : `${averageResolutionTime.toFixed(1)} hrs`}
            </h3>
            <p>Avg. Resolution Time</p>
            <span>
              Based on tickets with resolution dates
            </span>
          </div>
        </div>
      </div>

      <div className="reports-chart-grid">
        <div className="report-chart-card">
          <div className="report-chart-heading">
            <h2>Tickets by Status</h2>
            <p>Distribution of tickets across statuses</p>
          </div>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={65}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[index]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-chart-card">
          <div className="report-chart-heading">
            <h2>Tickets by Priority</h2>
            <p>Number of tickets in each priority level</p>
          </div>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />

                <Bar
                  dataKey="tickets"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-chart-card wide">
          <div className="report-chart-heading">
            <h2>Monthly Ticket Trends</h2>
            <p>
              Tickets created versus tickets resolved in the last
              seven months
            </p>
          </div>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#4ade80"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-chart-card wide">
          <div className="report-chart-heading">
            <h2>Technician Performance</h2>
            <p>
              Number of resolved tickets handled by each technician
            </p>
          </div>

          <div className="report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={technicianData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />

                <Bar
                  dataKey="resolved"
                  name="Resolved Tickets"
                  fill="#38bdf8"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
