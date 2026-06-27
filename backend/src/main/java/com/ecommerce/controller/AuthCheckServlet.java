package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import com.ecommerce.model.User;

@WebServlet("/auth/check")
public class AuthCheckServlet extends HttpServlet {

    private void setCorsHeaders(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin",      "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods",     "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers",     "Content-Type");
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
        if (session != null && session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            res.getWriter().print(
                "{\"authenticated\":true,\"userId\":" + user.getUserId() +
                ",\"fullName\":\"" + user.getFullName() +
                "\",\"email\":\"" + user.getEmail() + "\"}"
            );
        } else {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"authenticated\":false}");
        }
    }
}