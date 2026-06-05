import { createContext, useContext, useState, useEffect } from "react";
import BASE_URL from "../api";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin");
    if (saved) {
      try { setAdmin(JSON.parse(saved)); } catch { localStorage.removeItem("admin"); }
    }

    fetch(`${BASE_URL}/admin/check`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setAdmin({
            adminId: data.adminId,
            fullName: data.fullName,
            email: data.email,
            categoryScope: data.categoryScope,
          });
        } else {
          setAdmin(null);
          localStorage.removeItem("admin");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loginAdmin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  const logoutAdmin = async () => {
    try {
      await fetch(`${BASE_URL}/admin/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setAdmin(null);
    localStorage.removeItem("admin");
  };

  return (
    <AdminContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);