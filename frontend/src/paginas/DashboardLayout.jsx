import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import { Outlet } from "react-router-dom";
import "../assets/dashboardLayout.css";

export default function Dashboard() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="conteudo">
        <Navbar />
        <div className="pagina">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
