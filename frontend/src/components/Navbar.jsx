import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 20px",
        backgroundColor: "#222",
        color: "#fff",
        gap: "20px",
      }}
    >
      <h3>Kaspi-ACE</h3>
      <div style={{ display: "flex", gap: "20px" }}>
        {user?.role === "owner" && (
          <>
            <Link to="/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
            <Link to="/dashboard/links" style={{ color: "#fff" }}>Link Requests</Link>
            <Link to="/dashboard/supplier" style={{ color: "#fff" }}>Company Employees</Link>
            <Link to="/dashboard/orders" style={{ color: "#fff" }}>Orders</Link>
            <Link to="/create-manager" style={{ color: "#fff" }}>Create Manager</Link>
            <Link to="/create-sales" style={{ color: "#fff" }}>Create Salesman</Link>
            <Link to="/complaints">Complaints</Link>
          </>
        )}

        {user?.role === "manager" && (
          <>
            <Link to="/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
            <Link to="/dashboard/links" style={{ color: "#fff" }}>Link Requests</Link>
            <Link to="/dashboard/supplier" style={{ color: "#fff" }}>Company Employees</Link>
            <Link to="/dashboard/orders" style={{ color: "#fff" }}>Orders</Link>
            <Link to="/owner" style={{ color: "#fff" }}>Add Product</Link>
            <Link to="/complaints">Complaints</Link>
          </>
        )}

        {user?.role === "consumer" && (
          <>
            <Link to="/consumer" style={{ color: "#fff" }}>Shop</Link>
            <Link to="/suppliers" style={{ color: "#fff" }}>Available Suppliers</Link>
          </>
        )}

        {user?.role === "sales" && (
          <>
            <Link to="/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
            <Link to="/chat" style={{ color: "#fff" }}>Chat</Link>
            <Link to="/complaints">Complaints</Link>
          </>
        )}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: "crimson",
              border: "none",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
