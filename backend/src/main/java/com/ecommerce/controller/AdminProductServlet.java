package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.List;

import com.ecommerce.dao.AdminDAO;
import com.ecommerce.model.Admin;
import com.ecommerce.model.Product;
import com.google.gson.Gson;

/**
 * GET    /admin/products           → list products in scope
 * POST   /admin/products           → add product
 * PUT    /admin/products?id=X      → update product  (sent as POST with _method=PUT)
 * DELETE /admin/products?id=X      → delete product
 */
@WebServlet("/admin/products")
public class AdminProductServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCors(res); res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCors(res);
        res.setContentType("application/json;charset=UTF-8");

        Admin admin = getAdmin(req, res);
        if (admin == null) return;

        AdminDAO dao = new AdminDAO();
        List<Product> products = dao.getProducts(admin.getCategoryScope());
        res.getWriter().print(new Gson().toJson(products));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        setCors(res);
        res.setContentType("application/json;charset=UTF-8");

        Admin admin = getAdmin(req, res);
        if (admin == null) return;

        String method = req.getParameter("_method");

        // ── DELETE via POST ──────────────────────
        if ("DELETE".equalsIgnoreCase(method)) {
            doDelete(req, res);
            return;
        }

        // ── UPDATE via POST ──────────────────────
        if ("PUT".equalsIgnoreCase(method)) {
            try {
                int productId = Integer.parseInt(req.getParameter("productId"));
                Product p = buildProduct(req, admin);
                p.setProductId(productId);

                AdminDAO dao = new AdminDAO();
                boolean ok = dao.updateProduct(p);
                res.getWriter().print("{\"success\":" + ok + "}");
            } catch (Exception e) {
                res.setStatus(500);
                res.getWriter().print("{\"error\":\"" + e.getMessage() + "\"}");
            }
            return;
        }

        // ── CREATE ───────────────────────────────
        try {
            Product p = buildProduct(req, admin);
            AdminDAO dao = new AdminDAO();
            boolean ok = dao.addProduct(p);
            res.getWriter().print("{\"success\":" + ok + "}");
        } catch (Exception e) {
            res.setStatus(500);
            res.getWriter().print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCors(res);
        res.setContentType("application/json;charset=UTF-8");

        Admin admin = getAdmin(req, res);
        if (admin == null) return;

        try {
            int productId = Integer.parseInt(req.getParameter("id") != null
                ? req.getParameter("id") : req.getParameter("productId"));
            AdminDAO dao = new AdminDAO();
            boolean ok = dao.deleteProduct(productId);
            res.getWriter().print("{\"success\":" + ok + "}");
        } catch (Exception e) {
            res.setStatus(500);
            res.getWriter().print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── Admin Dashboard Stats ─────────────────────────────
    // GET /admin/products?stats=true
    // (handled separately via AdminDashboardServlet for clarity,
    //  but you can also add it here as a branch)

    private Product buildProduct(HttpServletRequest req, Admin admin) {
        Product p = new Product();
        p.setProductName(req.getParameter("productName"));
        p.setDescription(req.getParameter("description"));
        p.setPrice(Double.parseDouble(req.getParameter("price")));
        p.setDiscountPercent(req.getParameter("discountPercent") != null
            ? Double.parseDouble(req.getParameter("discountPercent")) : 0);
        p.setImageUrl(req.getParameter("imageUrl"));

        // Enforce scope — admin can only add/edit in their category
        String scope = admin.getCategoryScope();
        String gender = req.getParameter("genderCategory");
        if ("All".equalsIgnoreCase(scope)) {
            p.setGenderCategory(gender != null ? gender : "Men");
        } else {
            p.setGenderCategory(scope); // force to their scope
        }

        // Map gender_category to category_id
        int catId;
        switch (p.getGenderCategory()) {
            case "Women":
                catId = 1;
                break;
            case "Men":
                catId = 2;
                break;
            case "Kids":
                catId = 3;
                break;
            case "Accessories":
                catId = 4;
                break;
            default:
                catId = 2;
        }
        p.setCategoryId(catId);
        return p;
    }

    private Admin getAdmin(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("admin") == null) {
            res.setStatus(401);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return null;
        }
        return (Admin) session.getAttribute("admin");
    }
}