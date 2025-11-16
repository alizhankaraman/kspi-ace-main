import React, { useEffect, useState } from "react";
import { productApi } from "../api/productApi";

const OwnerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all products for this owner
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productApi.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Add a new product
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const product = await productApi.create(newProduct);
      setProducts([...products, product]);
      setNewProduct({ name: "", description: "", price: "", stock: "" });
      alert("✅ Product added successfully!");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product.");
    }
  };

  // Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete product.");
    }
  };

  // Inline update (PATCH)
  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async (id) => {
    try {
      const updatedProduct = products.find((p) => p.id === id);
      await productApi.update(id, {
        price: updatedProduct.price,
        stock: updatedProduct.stock,
      });
      alert("💾 Product updated successfully!");
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏭 Owner Product Dashboard</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: "30px",
          padding: "20px",
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
          alignItems: "center",
          borderRadius: "10px"}}>
        <input
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
        />
        <button type="submit">Add Product</button>
      </form>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price ($)</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>
                <input
                  type="number"
                  value={p.price}
                  onChange={(e) => handleChange(p.id, "price", e.target.value)}
                  style={{ width: "80px" }}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={p.stock}
                  onChange={(e) => handleChange(p.id, "stock", e.target.value)}
                  style={{ width: "60px" }}
                />
              </td>
              <td>
                <button onClick={() => handleSave(p.id)}>💾 Save</button>
                <button onClick={() => handleDelete(p.id)} style={{ marginLeft: "10px" }}>
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerDashboard;
