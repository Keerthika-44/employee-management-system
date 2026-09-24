import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/employees";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  age: "",
  address: "",
};

export default function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");


  const [editingEmail, setEditingEmail] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load employees");
      }
      setEmployees(json.data);
    } catch (err) {
      setLoadError("Could not load employees. Check your backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
    setSuccessMsg("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Employee name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

   
    if (!editingEmail) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter exactly 10 digits";
    }

    const age = Number(formData.age);
    if (formData.age === "" || !Number.isInteger(age) || age < 1 || age > 120) {
      newErrors.age = "Enter an age between 1 and 120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleEditClick = (employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      age: String(employee.age),
      address: employee.address || "",
    });
    setEditingEmail(employee.email);
    setErrors({});
    setSuccessMsg("");
  };

 
  const handleCancelEdit = () => {
    setEditingEmail(null);
    setFormData(initialFormState);
    setErrors({});
  };


  const handleDelete = async (employee) => {
    const confirmed = window.confirm(`Delete ${employee.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(employee.email)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete employee");
      }

      setSuccessMsg("Employee deleted successfully!");
      await fetchEmployees();


      if (editingEmail === employee.email) {
        handleCancelEdit();
      }
    } catch (err) {
      setErrors({ form: err.message || "Could not delete employee" });
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      if (editingEmail) {
       
        const payload = {
          name: formData.name.trim(),
          phone: formData.phone,
          age: Number(formData.age),
          address: formData.address,
        };

        const res = await fetch(`${API_URL}/${encodeURIComponent(editingEmail)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          if (json.errors) setErrors(json.errors);
          else setErrors({ form: json.message || "Unable to update employee" });
          return;
        }

        setSuccessMsg("Employee updated successfully!");
        setEditingEmail(null);
      } else {
      
        const payload = {
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          age: Number(formData.age),
        };

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          if (json.errors) setErrors(json.errors);
          else setErrors({ form: json.message || "Unable to add employee" });
          return;
        }

        setSuccessMsg("Employee added successfully!");
      }

      setFormData(initialFormState);
      setErrors({});
      await fetchEmployees();
    } catch (err) {
      setErrors({ form: "Could not connect to the backend server" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Employee Management System</h1>

      <form className="employee-form" onSubmit={handleSubmit} noValidate>
        {successMsg && <p className="success-message">{successMsg}</p>}
        {errors.form && <p className="form-error">{errors.form}</p>}

        <div className="form-group">
          <label>Employee Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter employee name"
          />
          {errors.name && <small className="error-message">{errors.name}</small>}
        </div>

        <div className="form-group">
          <label>Email {editingEmail ? "" : "*"}</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            disabled={!!editingEmail} 
          />
          {errors.email && <small className="error-message">{errors.email}</small>}
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            placeholder="10-digit phone number"
          />
          {errors.phone && <small className="error-message">{errors.phone}</small>}
        </div>

        <div className="form-group">
          <label>Age *</label>
          <input
            name="age"
            type="number"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter age"
          />
          {errors.age && <small className="error-message">{errors.age}</small>}
        </div>

        <div className="form-group address-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="submit-btn" type="submit" disabled={submitting}>
            {submitting
              ? editingEmail ? "Updating..." : "Adding..."
              : editingEmail ? "Update Employee" : "Add Employee"}
          </button>

          {editingEmail && (
            <button type="button" className="submit-btn" onClick={handleCancelEdit} style={{ background: "#888" }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>Employee List ({employees.length})</h2>

      {loading && <p>Loading employees...</p>}
      {loadError && <p className="form-error">{loadError}</p>}

      {!loading && !loadError && (
        <div className="table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-text">No employees found</td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee.email}>
                    <td>{index + 1}</td>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.age}</td>
                    <td>{employee.address || "-"}</td>
                    <td>
                      <button onClick={() => handleEditClick(employee)} style={{ marginRight: 6 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(employee)} style={{ color: "red" }}>
                        Delete
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
  );
}