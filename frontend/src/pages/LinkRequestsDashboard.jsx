import React, { useEffect, useState } from "react";
import { linkApi } from "../api/linkApi";

const LinkRequestsDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await linkApi.getAll();
        setRequests(data);
      } catch (err) {
        console.error("Error loading link requests:", err);
        setError("Failed to load requests. Check your token or permissions.");
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      const updated = await linkApi.update(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.link.status } : r))
      );
    } catch (err) {
      console.error("Error updating link:", err);
      alert("Failed to update status. Maybe token expired?");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Consumer Link Requests</h2>
      {requests.length === 0 ? (
        <p>No link requests yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Consumer</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.consumer_name}</td>
                <td>{r.supplier_name}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => handleUpdate(r.id, "accepted")}>Accept</button>
                      <button onClick={() => handleUpdate(r.id, "rejected")}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LinkRequestsDashboard;
