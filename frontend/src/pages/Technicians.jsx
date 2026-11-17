
import { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Users,
  Pencil,
  Trash2,
  CheckCircle,
  UserX,
  X
} from "lucide-react";
import { apiRequest } from "../services/api";
import "./Technicians.css";

function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTechnicianId, setEditingTechnicianId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/users/role/TECHNICIAN");
      setTechnicians(data);
    } catch (err) {
      setError(err.message || "Failed to load technicians.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const totalCount = technicians.length;
  const activeCount = technicians.filter(t => t.active).length;
  const inactiveCount = totalCount - activeCount;

  const filteredTechnicians = technicians.filter(t =>
    t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(t.id).includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: ""
    });
    setEditingTechnicianId(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = technician => {
    setFormData({
      fullName: technician.fullName,
      email: technician.email,
      password: ""
    });
    setEditingTechnicianId(technician.id);
    setShowForm(true);
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFormData(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    try {
      setError("");

      const requestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: "TECHNICIAN"
      };

      if (!editingTechnicianId || formData.password.trim()) {
        requestData.password = formData.password;
      }

      if (editingTechnicianId) {
        await apiRequest(`/users/${editingTechnicianId}`, {
          method: "PUT",
          body: JSON.stringify(requestData)
        });
      } else {
        await apiRequest("/users", {
          method: "POST",
          body: JSON.stringify(requestData)
        });
      }

      resetForm();
      await loadTechnicians();
    } catch (err) {
      setError(err.message || "Unable to save technician.");
    }
  };

  const handleDeleteClick = async id => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this technician?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/users/${id}`, {
        method: "DELETE"
      });

      await loadTechnicians();
    } catch (err) {
      setError(err.message || "Unable to delete technician.");
    }
  };

  return (
    <div className="technicians-page">
      <div className="page-header">
        <div>
          <h2>Technician Management</h2>
          <p>Manage your IT support technicians</p>
        </div>

        <button className="add-button" onClick={handleAddClick}>
          <UserPlus size={18} />
          Add Technician
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="technician-stats">
        <div className="stat-card">
          <Users size={22} />
          <div>
            <h3>{totalCount}</h3>
            <p>Total Technicians</p>
          </div>
        </div>

        <div className="stat-card">
          <CheckCircle size={22} />
          <div>
            <h3>{activeCount}</h3>
            <p>Active Technicians</p>
          </div>
        </div>

        <div className="stat-card">
          <UserX size={22} />
          <div>
            <h3>{inactiveCount}</h3>
            <p>Inactive Technicians</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="technician-form-container">
          <div className="form-header">
            <h3>
              {editingTechnicianId
                ? "Edit Technician"
                : "Add New Technician"}
            </h3>

            <button type="button" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter technician name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Password {editingTechnicianId && "(Leave blank to keep current password)"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                minLength={8}
                required={!editingTechnicianId}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm}>
                Cancel
              </button>

              <button type="submit">
                {editingTechnicianId
                  ? "Update Technician"
                  : "Add Technician"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="technician-content">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search technicians..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading technicians...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Technician ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTechnicians.length === 0 ? (
                  <tr>
                    <td colSpan="5">No technicians found.</td>
                  </tr>
                ) : (
                  filteredTechnicians.map(technician => (
                    <tr key={technician.id}>
                      <td>TECH{String(technician.id).padStart(3, "0")}</td>
                      <td>{technician.fullName}</td>
                      <td>{technician.email}</td>
                      <td>
                        <span className={
                          technician.active ? "status-active" : "status-inactive"
                        }>
                          {technician.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleEditClick(technician)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(technician.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Technicians;
