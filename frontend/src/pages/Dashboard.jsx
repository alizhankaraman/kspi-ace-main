import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Greetings, {user?.username}</h2>
      <p>Your role?: {user?.role}</p>

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Exit
      </button>
    </div>
  );
}

export default Dashboard;
