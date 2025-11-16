import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OrdersDashboard from "./pages/OrdersDashboard";
import ConsumerPage from "./pages/ConsumerPage";
import SuppliersList from "./pages/SuppliersList";
import LinkRequestsDashboard from "./pages/LinkRequestsDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import ChatPage from "./chat/ChatPage";
import CreateManager from "./pages/CreateManager";
import CreateSales from "./pages/CreateSales";
import ComplaintsPage from "./pages/ComplaintsPage";

function App() {

  const token = localStorage.getItem("access");

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/orders" element={<OrdersDashboard />} />
        <Route path="/consumer" element={<ConsumerPage />} />
        <Route path="/suppliers" element={<SuppliersList />} />
        <Route path="/dashboard/links" element={<LinkRequestsDashboard />} />
        <Route path="/dashboard/orders" element={<OrdersDashboard />} />
        <Route path="/dashboard/supplier" element={<SupplierDashboard />} />
        <Route path="/chat" element={<ChatPage token={token} />} />
        <Route path="/create-manager" element={<CreateManager token={token} />} />
        <Route path="/create-sales" element={<CreateSales token={token} />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
