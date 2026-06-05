import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ToastProvider } from "./context/ToastContext";
import Footer          from "./component/Footer";
import ProtectedRoute  from "./component/ProtectedRoute";
import AdminRoute      from "./component/AdminRoute";

import Register       from "./pages/Register";
import Login          from "./pages/Login";
import Products       from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories     from "./pages/Categories";
import Cart           from "./pages/Cart";
import MyOrders       from "./pages/MyOrders";
import OrderDetails   from "./pages/OrderDetails";
import Profile        from "./pages/Profile";

// Admin pages
import AdminLogin     from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <main style={{ flex: "1 0 auto" }}>
                <Routes>
                  {/* Default */}
                  <Route path="/" element={<Navigate to="/products" replace />} />

                  {/* Auth */}
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Public */}
                  <Route path="/products"    element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/categories"  element={<Categories />} />

                  {/* Protected (user) */}
                  <Route path="/cart"       element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/orders"     element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                  <Route path="/order/:id"  element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                  <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  {/* Admin */}
                  <Route path="/admin/login"     element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin"           element={<Navigate to="/admin/login" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;