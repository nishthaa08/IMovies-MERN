import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeFor = (user) => (user?.role === "admin" ? "/admin" : "/home");

export function UserProtection({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "user") return <Navigate to="/admin" replace />;
  return children;
}

export function AdminProtection({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/home" replace />;
  return children;
}

// Logged-in people skip the landing/login/register pages
export function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}
