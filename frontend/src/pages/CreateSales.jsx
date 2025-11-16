import React, { useState } from "react";
import { createSales } from "../api/users";

function CreateSales({ token }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createSales(token, form);
      setMessage("🎉 Sales account created!");

      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.detail || "Failed"));
    }
  };

  return (
    <div className="cm-container">
      <h2>Create Sales User</h2>

      {message && <div className="cm-message">{message}</div>}

      <form onSubmit={handleSubmit} className="cm-form">
        <input
          name="username"
          placeholder="Sales username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Sales email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="cm-btn">➕ Create Sales</button>
      </form>
    </div>
  );
}

export default CreateSales;
