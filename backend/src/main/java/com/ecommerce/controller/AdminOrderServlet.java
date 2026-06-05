package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.ecommerce.dao.AdminDAO;
import com.ecommerce.model.Admin;
import com.google.gson.Gson;

/**
 * GET  /admin/orders          → list all orders in admin's scope
 * POST /admin/orders?orderId=X&status=Shipped  → update status
 */
@WebServlet("/admin/orders")
public class AdminOrderServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
        List<Map<String,Object>> orders = dao.getOrders(admin.getCategoryScope());
        res.getWriter().print(new Gson().toJson(orders));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCors(res);
        res.setContentType("application/json;charset=UTF-8");

        Admin admin = getAdmin(req, res);
        if (admin == null) return;

        try {
            int    orderId   = Integer.parseInt(req.getParameter("orderId"));
            String newStatus = req.getParameter("status");

            if (newStatus == null || newStatus.trim().isEmpty()) {
                res.setStatus(400);
                res.getWriter().print("{\"error\":\"status is required\"}");
                return;
            }

            // Validate allowed statuses
            switch (newStatus) {
                case "Placed": case "Shipped": case "Delivered": case "Cancelled": break;
                default:
                    res.setStatus(400);
                    res.getWriter().print("{\"error\":\"Invalid status\"}");
                    return;
            }

            AdminDAO dao = new AdminDAO();
            boolean ok = dao.updateOrderStatus(orderId, newStatus);
            res.getWriter().print("{\"success\":" + ok + "}");
        } catch (Exception e) {
            res.setStatus(500);
            res.getWriter().print("{\"error\":\"" + e.getMessage() + "\"}");
        }
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