
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Technicians from "./pages/Technicians";
import Tickets from "./pages/Tickets";
import AssignTickets from "./pages/AssignTickets";
import Reports from "./pages/Reports";
import SLA from "./pages/SLA";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Checks login and role permissions before displaying a page.
function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("accessToken");

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    currentUser = null;
  }

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(
    currentUser.role || ""
  ).toUpperCase();

  if (!allowedRoles.includes(userRole)) {
    if (
      userRole === "EMPLOYEE" ||
      userRole === "TECHNICIAN"
    ) {
      return <Navigate to="/tickets" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

function App() {
  const adminOnly = ["ADMIN"];

  const allRoles = [
    "ADMIN",
    "EMPLOYEE",
    "TECHNICIAN"
  ];

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Public Pages */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard available to all roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={allRoles}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN Pages */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technicians"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <Technicians />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assign-tickets"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <AssignTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sla"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <SLA />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Pages available to all logged-in roles */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute allowedRoles={allRoles}>
              <Tickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={allRoles}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
