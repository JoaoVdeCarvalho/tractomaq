// src/componentes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const user = localStorage.getItem("userId");

  if (!user || user === "undefined" || user === "null") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
