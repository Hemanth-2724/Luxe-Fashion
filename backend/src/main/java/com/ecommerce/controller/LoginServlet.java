package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;

import java.io.IOException;
import com.google.gson.JsonObject;

import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.User;

@WebServlet("/login")
@MultipartConfig
public class LoginServlet extends HttpServlet {

    private void setCorsHeaders(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);
        res.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        setCorsHeaders(res);
        res.setContentType("application/json");
        res.getWriter().print("{\"message\":\"Login API is up ✅\"}");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        setCorsHeaders(res);
        res.setContentType("application/json;charset=UTF-8");

        String email    = req.getParameter("email");
        String password = req.getParameter("password");

        JsonObject json = new JsonObject();

        if (email == null || password == null) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            json.addProperty("error", "Email and password are required.");
            res.getWriter().print(json);
            return;
        }

        UserDAO dao = new UserDAO();
        try {
            User user = dao.login(email, password);
            if (user != null) {
                HttpSession session = req.getSession(true);
                session.setAttribute("user", user);
                session.setMaxInactiveInterval(60 * 60 * 24); // 24 hours

                json.addProperty("success", true);
                json.addProperty("userId",   user.getUserId());
                json.addProperty("fullName", user.getFullName());
                json.addProperty("email",    user.getEmail());
                res.getWriter().print(json);
            } else {
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                json.addProperty("error", "Invalid email or password.");
                res.getWriter().print(json);
            }
        } catch (Exception e) {
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            json.addProperty("error", "Server error: " + e.getMessage());
            res.getWriter().print(json);
        }
    }
}