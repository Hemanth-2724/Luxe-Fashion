package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import com.google.gson.JsonObject;

import com.ecommerce.dao.AdminDAO;
import com.ecommerce.model.Admin;

@WebServlet("/admin/login")
public class AdminLoginServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCors(res); res.setStatus(200);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        setCors(res);
        res.setContentType("application/json;charset=UTF-8");

        String email    = req.getParameter("email");
        String password = req.getParameter("password");
        JsonObject json = new JsonObject();

        if (email == null || password == null) {
            res.setStatus(400);
            json.addProperty("error", "Email and password required.");
            res.getWriter().print(json);
            return;
        }

        try {
            AdminDAO dao = new AdminDAO();
            Admin admin = dao.login(email, password);
            if (admin != null) {
                HttpSession session = req.getSession(true);
                session.setAttribute("admin", admin);
                session.setMaxInactiveInterval(60 * 60 * 8); // 8 hrs

                json.addProperty("success",       true);
                json.addProperty("adminId",        admin.getAdminId());
                json.addProperty("fullName",       admin.getFullName());
                json.addProperty("email",          admin.getEmail());
                json.addProperty("categoryScope",  admin.getCategoryScope());
                res.getWriter().print(json);
            } else {
                res.setStatus(401);
                json.addProperty("error", "Invalid admin credentials.");
                res.getWriter().print(json);
            }
        } catch (Exception e) {
            res.setStatus(500);
            json.addProperty("error", e.getMessage());
            res.getWriter().print(json);
        }
    }
}