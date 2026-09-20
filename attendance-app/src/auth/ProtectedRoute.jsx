import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // No token → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Role check (case-insensitive)
  if (allowedRole && role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
