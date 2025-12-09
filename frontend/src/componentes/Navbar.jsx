import "../assets/navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("token"); // caso use token futuramente
    navigate("/login");
  }

  return (
    <div className="navbar">
      <span className="titulo">Painel do Usuário</span>

      <button className="btn-logout" onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}
