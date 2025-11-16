import { useEffect, useState } from "react";
import {
  getComplaintsSales,
  getComplaintsEscalated,
  resolveComplaint,
  escalateComplaint,
  closeComplaint,
  getComplaintHistory
} from "../api/complaintsApi";

function ComplaintsPage() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await loadActive();
    await loadHistory();
  }

  async function loadActive() {
    if (role === "sales") {
      const res = await getComplaintsSales();
      setActive(res.data);
    } else if (role === "manager" || role === "owner") {
      const res = await getComplaintsEscalated();
      setActive(res.data);
    }
  }

  async function loadHistory() {
    const res = await getComplaintHistory();
    setHistory(res.data);
  }

  async function handleResolve(id) {
    await resolveComplaint(id);
    loadAll();
  }

  async function handleEscalate(id) {
    await escalateComplaint(id);
    loadAll();
  }

  async function handleClose(id) {
    await closeComplaint(id);
    loadAll();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Complaints</h2>

      {/* ACTIVE COMPLAINTS */}
      <h3>Active Complaints</h3>
      {active.length === 0 && <p>No active complaints.</p>}
      {active.map((c) => (
        <div key={c.id} style={boxStyle}>
          <p><strong>From:</strong> {c.consumer.username}</p>
          <p><strong>Subject:</strong> {c.subject}</p>
          <p>{c.message}</p>
          <p><strong>Status:</strong> {c.status}</p>

          {role === "sales" && (
            <>
              <button onClick={() => handleResolve(c.id)}>Resolve</button>
              <button onClick={() => handleEscalate(c.id)}>Escalate</button>
            </>
          )}

          {(role === "manager" || role === "owner") && c.status === "escalated" && (
            <button onClick={() => handleClose(c.id)}>Close</button>
          )}
        </div>
      ))}

      {/* HISTORY SECTION */}
      <h3 style={{ marginTop: 40 }}>Complaint History</h3>
      {history.length === 0 && <p>No past complaints.</p>}
      {history.map((c) => (
        <div key={c.id} style={{ ...boxStyle, opacity: 0.7 }}>
          <p><strong>From:</strong> {c.consumer.username}</p>
          <p><strong>Subject:</strong> {c.subject}</p>
          <p>{c.message}</p>
          <p><strong>Status:</strong> {c.status}</p>
        </div>
      ))}
    </div>
  );
}

const boxStyle = {
  padding: 15,
  border: "1px solid #ccc",
  borderRadius: 6,
  marginBottom: 10,
};

export default ComplaintsPage;
