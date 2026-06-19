package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import com.google.gson.Gson;

import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.User;

@WebServlet("/profile")
public class ProfileServlet extends HttpServlet {

    private void setCorsHeaders(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        // Refresh from DB
        UserDAO dao = new UserDAO();
        User fresh = dao.getUserById(user.getUserId());
        if (fresh != null) {
            // Don't expose password
            fresh.setPassword(null);
            res.getWriter().print(new Gson().toJson(fresh));
        } else {
            res.setStatus(404);
            res.getWriter().print("{\"error\":\"User not found\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        setCorsHeaders(res);
        res.setContentType("application/json;charset=UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\":\"Not authenticated\"}");
            return;
        }

        User sessionUser = (User) session.getAttribute("user");
        UserDAO dao = new UserDAO();

        User updated = new User();
        updated.setUserId(sessionUser.getUserId());
        updated.setFullName(req.getParameter("fullName"));
        updated.setPhone(req.getParameter("phone"));
        updated.setGender(req.getParameter("gender"));
        updated.setAddress(req.getParameter("address"));

        boolean ok = dao.updateProfile(updated);
        if (ok) {
            // Refresh session
            User fresh = dao.getUserById(sessionUser.getUserId());
            session.setAttribute("user", fresh);
            res.getWriter().print("{\"success\":true}");
        } else {
            res.setStatus(500);
            res.getWriter().print("{\"error\":\"Update failed\"}");
        }
    }
}