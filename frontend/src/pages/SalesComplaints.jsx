import { useEffect, useState } from "react";
import {
  getComplaintsForSales,
  resolveComplaint,
  escalateComplaint,
} from "../api/complaints";

export default function SalesComplaints() {
  const [complaints, setComplaints] = useState([]);

  const load = async () => {
    const res = await getComplaintsForSales();
    setComplaints(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Complaints</h2>
      {complaints.map((c) => (
        <div key={c.id} className="complaint">
          <h4>{c.subject}</h4>
          <p>{c.message}</p>

          <button onClick={() => resolveComplaint(c.id).then(load)}>
            Resolve
          </button>
          <button onClick={() => escalateComplaint(c.id).then(load)}>
            Escalate
          </button>
        </div>
      ))}
    </div>
  );
}
