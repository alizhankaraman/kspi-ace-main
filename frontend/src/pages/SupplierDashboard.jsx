import React, { useEffect, useState } from "react";
import { supplierApi } from "../api/supplierApi";

const SupplierDashboard = () => {
  const [supplier, setSupplier] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const data = await supplierApi.getMySupplier();
        setSupplier(data);
        const staff = await supplierApi.getEmployees(data.id);
        setEmployees(staff);
      } catch (err) {
        console.error("SupplierDashboard: Error loading supplier data:", err);
        setError("SupplierDashboard: Failed to load supplier or employees.");
      } finally {
        setLoading(false);
      }
    };
    loadSupplier();
  }, []);

  const toggleEmployee = async (employeeId) => {
    try {
      await supplierApi.toggleEmployee(supplier.id, employeeId);
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId ? { ...e, is_active: !e.is_active } : e
        )
      );
    } catch (err) {
      alert("SupplierDashboard: Failed to toggle employee status.");
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await supplierApi.deleteEmployee(supplier.id, employeeId);
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    } catch (err) {
      alert("SupplierDashboard: Failed to delete employee.");
    }
  };

  if (loading) return <p>Loading supplier data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏢 Supplier Dashboard</h2>
      <h3>{supplier.name}</h3>
      <p>Status: {supplier.is_active ? "✅ Active" : "❌ Inactive"}</p>

      <h3 style={{ marginTop: "20px" }}>👥 Employees</h3>
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.username}</td>
                <td>{e.role}</td>
                <td>{e.is_active ? "✅" : "❌"}</td>
                <td>
                  <button onClick={() => toggleEmployee(e.id)}>
                    {e.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => deleteEmployee(e.id)} style={{ marginLeft: "10px" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupplierDashboard;
