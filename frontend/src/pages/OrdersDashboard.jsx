import React, { useEffect, useState } from "react";
import { orderApi } from "../api/orderApi";

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderApi.getAll();
        setOrders(data);
      } catch (err) {
        console.error("Error loading orders:", err);
        setError("Failed to load orders. Check token or permissions.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await orderApi.updateStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      alert(`✅ Order #${id} updated to "${newStatus}".`);
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status. Maybe token expired?");
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "confirmed":
        return "blue";
      case "shipped":
        return "purple";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Supplier Orders Dashboard</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Consumer</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.product}</td>
                <td>{o.consumer}</td>
                <td>{o.quantity}</td>
                <td>${o.total_price}</td>
                <td style={{ color: getStatusColor(o.status), fontWeight: "bold" }}>
                  {o.status}
                </td>
                <td>
                  {o.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, "confirmed")}
                        style={{ backgroundColor: "#4caf50", color: "white", marginRight: "5px" }}
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, "cancelled")}
                        style={{ backgroundColor: "#ff4d4d", color: "white" }}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}

                  {o.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, "shipped")}
                        style={{ backgroundColor: "#2196f3", color: "white", marginRight: "5px" }}
                      >
                        🚚 Ship
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, "cancelled")}
                        style={{ backgroundColor: "#ff4d4d", color: "white" }}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}

                  {o.status === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, "delivered")}
                      style={{ backgroundColor: "#9c27b0", color: "white" }}
                    >
                      📦 Deliver
                    </button>
                  )}

                  {o.status === "cancelled" && (
                    <span style={{ color: "red" }}>Order Cancelled</span>
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

export default OrdersDashboard;
