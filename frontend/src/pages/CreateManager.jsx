import React, { useState } from "react";
import { createManager } from "../api/users";

function CreateManager({ token }) {
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
      const res = await createManager(token, form);
      setMessage("Manager created successfully!");
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setMessage("Failed: " + err.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="page">
      <h2>Create Manager</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit} className="simple-form">
        <input
          name="username"
          placeholder="Manager Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Manager Email"
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
        <button type="submit">Create Manager</button>
      </form>
    </div>
  );
}

export default CreateManager;
