import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./paginas/Login";

// LAYOUT
import DashboardLayout from "./paginas/DashboardLayout";

// PÁGINAS
import Dashboard from "./paginas/Dashboard";
import Estoque from "./paginas/Estoque";
import Agenda from "./paginas/Agenda";
import Orcamentos from "./paginas/Orcamentos";

import PrivateRoute from "./componentes/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ROTA PÚBLICA */}
        <Route path="/login" element={<Login />} />

        {/* ROTAS PRIVADAS */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* ROTA PRINCIPAL DO SISTEMA */}
          <Route index element={<Dashboard />} />

          {/* OUTRAS PÁGINAS */}
          <Route path="estoque" element={<Estoque />} />
          <Route path="agendamentos" element={<Agenda />} />
          <Route path="orcamentos" element={<Orcamentos />} />
          <Route path="" element={<Orcamentos />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
