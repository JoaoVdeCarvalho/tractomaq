import { Link } from "react-router-dom";
import "../assets/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">TRACTOMAQ</h2>

      <nav className="menu">
        <Link to="/" className="menu-btn">Inicio</Link>
        <Link to="/estoque" className="menu-btn">Estoque</Link>
        <Link to="/agendamentos" className="menu-btn">Agenda</Link>
        <Link to="/orcamentos" className="menu-btn">Orçamentos</Link>
      </nav>
    </div>
  );
}
