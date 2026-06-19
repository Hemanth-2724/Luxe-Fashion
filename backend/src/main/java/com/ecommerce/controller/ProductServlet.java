package com.ecommerce.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.List;
import com.google.gson.Gson;

import com.ecommerce.dao.ProductDAO;
import com.ecommerce.model.Product;

@WebServlet("/products")
public class ProductServlet extends HttpServlet {
    
    private void setCorsHeaders(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        setCorsHeaders(res);
        res.setContentType("application/json");

        String id = req.getParameter("id");

        ProductDAO dao = new ProductDAO();
        Gson gson = new Gson();

        if (id != null) {
            Product p = dao.getProductById(Integer.parseInt(id));
            res.getWriter().print(gson.toJson(p));
        } else {
            List<Product> list = dao.getAllProducts();
            res.getWriter().print(gson.toJson(list));
        }
    }
}