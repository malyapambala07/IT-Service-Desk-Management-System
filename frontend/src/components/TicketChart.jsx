
import "./TicketChart.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const statusDetails = [
  { key: "OPEN", name: "Open", color: "#fb923c" },
  { key: "ASSIGNED", name: "Assigned", color: "#60a5fa" },
  { key: "IN_PROGRESS", name: "In Progress", color: "#a78bfa" },
  { key: "RESOLVED", name: "Resolved", color: "#4ade80" },
  { key: "CLOSED", name: "Closed", color: "#38bdf8" }
];

function TicketChart({ statusCounts }) {
  const ticketData = statusDetails.map((status) => ({
    name: status.name,
    value: statusCounts?.[status.key] ?? 0,
    color: status.color
  }));

  const chartData = ticketData.filter((item) => item.value > 0);

  return (
    <div className="ticket-chart">
      <div className="chart-header">
        <h3>Ticket Status Overview</h3>
        <p>Distribution of all support tickets</p>
      </div>

      <div className="chart-content">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        {ticketData.map((item) => (
          <div className="legend-item" key={item.name}>
            <span
              className="legend-dot"
              style={{ background: item.color }}
            ></span>
            <span>{item.name}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketChart;
