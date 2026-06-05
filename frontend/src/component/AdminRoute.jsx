import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

/**
 * Wraps admin-only pages.
 * Redirects to /admin/login if not authenticated as admin.
 * Does NOT render Navbar/Footer — admin has its own sidebar.
 */
export default function AdminRoute({ children }) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}