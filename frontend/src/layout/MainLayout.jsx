import { Outlet } from "react-router-dom";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import "../assets/layout.css";

export default function MainLayout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}
