package com.ecommerce.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.ecommerce.model.Admin;
import com.ecommerce.model.Product;
import com.ecommerce.util.DBConnection;

public class AdminDAO {

    /** Authenticate admin by email + password, returns Admin or null */
    public Admin login(String email, String password) throws Exception {
        Connection conn = DBConnection.getConnection();
        if (conn == null) throw new Exception("Database connection failed.");

        PreparedStatement ps = conn.prepareStatement(
            "SELECT * FROM admins WHERE email=? AND password=?");
        ps.setString(1, email);
        ps.setString(2, password);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) return mapAdmin(rs);
        return null;
    }

    /** Get all orders (super-admin) or orders containing products in scope */
    public List<java.util.Map<String,Object>> getOrders(String categoryScope) {
        List<java.util.Map<String,Object>> list = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConnection();
            String sql;
            PreparedStatement ps;

            if ("All".equalsIgnoreCase(categoryScope)) {
                sql = "SELECT o.order_id, o.order_date, o.total_amount, o.order_status, " +
                      "o.payment_method, o.delivery_address, u.full_name, u.email " +
                      "FROM orders o JOIN users u ON o.user_id = u.user_id " +
                      "ORDER BY o.order_date DESC";
                ps = conn.prepareStatement(sql);
            } else {
                // Only orders that contain at least one product in the admin's scope
                sql = "SELECT DISTINCT o.order_id, o.order_date, o.total_amount, o.order_status, " +
                      "o.payment_method, o.delivery_address, u.full_name, u.email " +
                      "FROM orders o " +
                      "JOIN users u ON o.user_id = u.user_id " +
                      "JOIN order_items oi ON oi.order_id = o.order_id " +
                      "JOIN products p ON p.product_id = oi.product_id " +
                      "WHERE p.gender_category = ? " +
                      "ORDER BY o.order_date DESC";
                ps = conn.prepareStatement(sql);
                ps.setString(1, categoryScope);
            }

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                java.util.Map<String,Object> row = new java.util.LinkedHashMap<>();
                row.put("orderId",         rs.getInt("order_id"));
                row.put("orderDate",       rs.getString("order_date"));
                row.put("totalAmount",     rs.getDouble("total_amount"));
                row.put("orderStatus",     rs.getString("order_status"));
                row.put("paymentMethod",   rs.getString("payment_method"));
                row.put("deliveryAddress", rs.getString("delivery_address"));
                row.put("customerName",    rs.getString("full_name"));
                row.put("customerEmail",   rs.getString("email"));
                list.add(row);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    /** Update order status */
    public boolean updateOrderStatus(int orderId, String newStatus) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE orders SET order_status=? WHERE order_id=?");
            ps.setString(1, newStatus);
            ps.setInt(2, orderId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /** Get all products the admin can manage */
    public List<Product> getProducts(String categoryScope) {
        List<Product> list = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConnection();
            String sql;
            PreparedStatement ps;

            if ("All".equalsIgnoreCase(categoryScope)) {
                sql = "SELECT * FROM products ORDER BY gender_category, product_name";
                ps = conn.prepareStatement(sql);
            } else {
                sql = "SELECT * FROM products WHERE gender_category=? ORDER BY product_name";
                ps = conn.prepareStatement(sql);
                ps.setString(1, categoryScope);
            }

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Product p = new Product();
                p.setProductId(rs.getInt("product_id"));
                p.setProductName(rs.getString("product_name"));
                p.setDescription(rs.getString("description"));
                p.setPrice(rs.getDouble("price"));
                p.setImageUrl(rs.getString("image_url"));
                p.setDiscountPercent(rs.getDouble("discount_percent"));
                p.setCategoryId(rs.getInt("category_id"));
                p.setGenderCategory(rs.getString("gender_category"));
                list.add(p);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    /** Add a new product */
    public boolean addProduct(Product p) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO products(category_id, product_name, description, price, " +
                "discount_percent, image_url, gender_category) VALUES(?,?,?,?,?,?,?)");
            ps.setInt(1, p.getCategoryId());
            ps.setString(2, p.getProductName());
            ps.setString(3, p.getDescription());
            ps.setDouble(4, p.getPrice());
            ps.setDouble(5, p.getDiscountPercent());
            ps.setString(6, p.getImageUrl());
            ps.setString(7, p.getGenderCategory());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /** Update an existing product */
    public boolean updateProduct(Product p) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE products SET product_name=?, description=?, price=?, " +
                "discount_percent=?, image_url=?, gender_category=?, category_id=? " +
                "WHERE product_id=?");
            ps.setString(1, p.getProductName());
            ps.setString(2, p.getDescription());
            ps.setDouble(3, p.getPrice());
            ps.setDouble(4, p.getDiscountPercent());
            ps.setString(5, p.getImageUrl());
            ps.setString(6, p.getGenderCategory());
            ps.setInt(7, p.getCategoryId());
            ps.setInt(8, p.getProductId());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /** Delete a product */
    public boolean deleteProduct(int productId) {
        try {
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(
                "DELETE FROM products WHERE product_id=?");
            ps.setInt(1, productId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /** Dashboard stats for admin */
    public java.util.Map<String,Object> getDashboardStats(String categoryScope) {
        java.util.Map<String,Object> stats = new java.util.LinkedHashMap<>();
        try {
            Connection conn = DBConnection.getConnection();

            // Total products in scope
            String prodSql = "All".equalsIgnoreCase(categoryScope)
                ? "SELECT COUNT(*) FROM products"
                : "SELECT COUNT(*) FROM products WHERE gender_category=?";
            PreparedStatement ps1 = conn.prepareStatement(prodSql);
            if (!"All".equalsIgnoreCase(categoryScope)) ps1.setString(1, categoryScope);
            ResultSet rs1 = ps1.executeQuery();
            if (rs1.next()) stats.put("totalProducts", rs1.getInt(1));

            // Total orders in scope
            String ordSql = "All".equalsIgnoreCase(categoryScope)
                ? "SELECT COUNT(*) FROM orders"
                : "SELECT COUNT(DISTINCT o.order_id) FROM orders o " +
                  "JOIN order_items oi ON oi.order_id=o.order_id " +
                  "JOIN products p ON p.product_id=oi.product_id WHERE p.gender_category=?";
            PreparedStatement ps2 = conn.prepareStatement(ordSql);
            if (!"All".equalsIgnoreCase(categoryScope)) ps2.setString(1, categoryScope);
            ResultSet rs2 = ps2.executeQuery();
            if (rs2.next()) stats.put("totalOrders", rs2.getInt(1));

            // Revenue
            String revSql = "All".equalsIgnoreCase(categoryScope)
                ? "SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE order_status != 'Cancelled'"
                : "SELECT COALESCE(SUM(oi.subtotal),0) FROM order_items oi " +
                  "JOIN orders o ON o.order_id=oi.order_id " +
                  "JOIN products p ON p.product_id=oi.product_id " +
                  "WHERE p.gender_category=? AND o.order_status != 'Cancelled'";
            PreparedStatement ps3 = conn.prepareStatement(revSql);
            if (!"All".equalsIgnoreCase(categoryScope)) ps3.setString(1, categoryScope);
            ResultSet rs3 = ps3.executeQuery();
            if (rs3.next()) stats.put("totalRevenue", rs3.getDouble(1));

            // Pending orders
            String pendSql = "All".equalsIgnoreCase(categoryScope)
                ? "SELECT COUNT(*) FROM orders WHERE order_status='Placed'"
                : "SELECT COUNT(DISTINCT o.order_id) FROM orders o " +
                  "JOIN order_items oi ON oi.order_id=o.order_id " +
                  "JOIN products p ON p.product_id=oi.product_id " +
                  "WHERE p.gender_category=? AND o.order_status='Placed'";
            PreparedStatement ps4 = conn.prepareStatement(pendSql);
            if (!"All".equalsIgnoreCase(categoryScope)) ps4.setString(1, categoryScope);
            ResultSet rs4 = ps4.executeQuery();
            if (rs4.next()) stats.put("pendingOrders", rs4.getInt(1));

        } catch (Exception e) {
            e.printStackTrace();
        }
        return stats;
    }

    private Admin mapAdmin(ResultSet rs) throws SQLException {
        Admin a = new Admin();
        a.setAdminId(rs.getInt("admin_id"));
        a.setFullName(rs.getString("full_name"));
        a.setEmail(rs.getString("email"));
        a.setCategoryScope(rs.getString("category_scope"));
        return a;
    }
}