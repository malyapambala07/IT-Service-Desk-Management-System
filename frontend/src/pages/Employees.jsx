
import { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Users,
  Pencil,
  Trash2
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Employees.css";

function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD EMPLOYEES FROM DATABASE
  const loadEmployees = async () => {
    try {
      setError("");

      const data = await apiRequest("/users");

      setEmployees(
        data.filter((user) => user.role === "EMPLOYEE")
      );
    } catch (err) {
      setError(err.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const editingEmployee = employees.find(
    (employee) => employee.id === editingEmployeeId
  );

  // ADD EMPLOYEE
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    const form = e.target;

    const newEmployee = {
      fullName: form.employeeName.value.trim(),
      email: form.employeeEmail.value.trim(),
      password: form.employeePassword.value,
      role: "EMPLOYEE"
    };

    try {
      setError("");

      await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(newEmployee)
      });

      form.reset();
      setShowForm(false);

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Unable to add employee.");
    }
  };

  // UPDATE EMPLOYEE
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    const form = e.target;

    const updatedEmployee = {
      fullName: form.employeeName.value.trim(),
      email: form.employeeEmail.value.trim(),
      password: form.employeePassword.value,
      role: "EMPLOYEE"
    };

    try {
      setError("");

      await apiRequest(`/users/${editingEmployeeId}`, {
        method: "PUT",
        body: JSON.stringify(updatedEmployee)
      });

      form.reset();
      setEditingEmployeeId(null);
      setShowForm(false);

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Unable to update employee.");
    }
  };

  // OPEN EDIT FORM
  const handleEditClick = (employee) => {
    setEditingEmployeeId(employee.id);
    setShowForm(true);
  };

  // DELETE EMPLOYEE
  const handleDeleteEmployee = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await apiRequest(`/users/${id}`, {
        method: "DELETE"
      });

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Unable to delete employee.");
    }
  };

  // FILTER EMPLOYEES
  const filteredEmployees = employees.filter((employee) =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(employee.id).includes(searchTerm)
  );

  return (
    <div className="employees-page">

      <div className="page-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage and monitor your organization's employees.</p>
        </div>

        <button
          className="add-employee-btn"
          onClick={() => {
            setEditingEmployeeId(null);
            setShowForm(true);
            setError("");
          }}
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {error && (
        <p style={{ color: "#f87171" }}>{error}</p>
      )}

      {showForm && (
        <div className="employee-form-container">

          <h2>
            {editingEmployeeId
              ? "Edit Employee"
              : "Add New Employee"}
          </h2>

          <form
            onSubmit={
              editingEmployeeId
                ? handleUpdateEmployee
                : handleAddEmployee
            }
          >
            <input
              type="text"
              name="employeeName"
              placeholder="Employee Name"
              defaultValue={editingEmployee?.fullName || ""}
              required
            />

            <input
              type="email"
              name="employeeEmail"
              placeholder="Email Address"
              defaultValue={editingEmployee?.email || ""}
              required
            />

            <input
              type="password"
              name="employeePassword"
              placeholder={
                editingEmployeeId
                  ? "New Password (leave blank to keep current)"
                  : "Password (minimum 8 characters)"
              }
              minLength={8}
              required={!editingEmployeeId}
            />

            <div className="form-buttons">

              <button
                type="submit"
                className="save-employee-btn"
              >
                Save Employee
              </button>

              <button
                type="button"
                className="cancel-employee-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingEmployeeId(null);
                }}
              >
                Cancel
              </button>

            </div>
          </form>
        </div>
      )}

      <div className="employee-summary">
        <Users size={24} />

        <div>
          <h2>All Employees</h2>
          <p>{employees.length} employees registered</p>
        </div>
      </div>

      <div className="employee-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="employee-table-container">

        <table className="employee-table">

          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading employees...</td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-employees">
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id}>

                  <td>EMP{String(employee.id).padStart(3, "0")}</td>
                  <td>{employee.fullName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>

                  <td>
                    <span
                      className={`employee-status ${
                        employee.active ? "active" : "inactive"
                      }`}
                    >
                      {employee.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="employee-actions">

                      <button
                        className="edit-employee-btn"
                        title="Edit Employee"
                        onClick={() => handleEditClick(employee)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-employee-btn"
                        title="Delete Employee"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
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

export default Employees;
