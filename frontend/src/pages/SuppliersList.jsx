import React, { useEffect, useState } from "react";
import { consumerApi } from "../api/consumerApi";

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await consumerApi.getSuppliers();
        console.log("📦 suppliers data:", data);
        setSuppliers(data);
      } catch (err) {
        console.error("Error loading suppliers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSuppliers();
  }, []);

  const handleLinkRequest = async (supplierId) => {
    try {
      await consumerApi.sendLinkRequest(supplierId);
      alert("Link request sent!");
    } catch (err) {
      console.error("Error sending link request:", err);
      alert("Failed to send request. Maybe you already sent one?");
    }
  };

  if (loading) return <p>Loading suppliers...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Suppliers</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {suppliers.map((s) => (
          <div key={s.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "10px" }}>
            <h3>{s.name}</h3>
            <p>{s.address}</p>
            <button onClick={() => handleLinkRequest(s.id)}>Send Link Request</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuppliersList;
