import React, { useEffect, useState } from "react";
import { consumerApi } from "../api/consumerApi";

const ConsumerPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, orderData] = await Promise.all([
          consumerApi.getProducts(),
          consumerApi.getOrders(),
        ]);
        setProducts(productData);
        setOrders(orderData);
      } catch (err) {
        console.error("Error loading consumer data:", err);
        setError("Failed to load data. Check your token or API.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOrder = async (productId) => {
  const quantity = parseInt(prompt("Enter quantity:", 1));
  if (isNaN(quantity) || quantity <= 0) {
    alert("Invalid quantity.");
    return;
  }

  try {
    const order = await consumerApi.createOrder(productId, quantity);
    alert(`Order placed for ${quantity} units of product ID ${productId}`);
    setOrders((prev) => [...prev, order]);
  } catch (err) {
    alert("Failed to create order. Maybe token expired?");
  }
};


  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Products</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "10px" }}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p>${p.price}</p>
            <p>Stock: {p.stock}</p>
            <button onClick={() => handleOrder(p.id)}>Order</button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "40px" }}>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id || `${o.product}-${o.quantity}-${Math.random()}`}>
              Product #{o.product} — Qty: {o.quantity} — Status: <b>{o.status}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConsumerPage;
