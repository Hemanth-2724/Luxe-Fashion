package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.Map;

import com.ecommerce.dao.AdminDAO;
import com.ecommerce.model.Admin;
import com.google.gson.Gson;

@WebServlet("/admin/dashboard")
public class AdminDashboardServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
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

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("admin") == null) {
            res.setStatus(401);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        Admin admin = (Admin) session.getAttribute("admin");
        AdminDAO dao = new AdminDAO();
        Map<String,Object> stats = dao.getDashboardStats(admin.getCategoryScope());
        res.getWriter().print(new Gson().toJson(stats));
    }
}