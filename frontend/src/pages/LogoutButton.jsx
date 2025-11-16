import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <button onClick={handleLogout}>
      🚪 Logout
    </button>
  );
};

export default LogoutButton;
