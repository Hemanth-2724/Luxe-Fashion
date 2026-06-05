package com.ecommerce.model;

import java.io.Serializable;

public class Admin implements Serializable {

    private int    adminId;
    private String fullName;
    private String email;
    private String password;
    private String categoryScope; // Men | Women | Kids | Accessories | All

    public int    getAdminId()             { return adminId; }
    public void   setAdminId(int v)        { this.adminId = v; }

    public String getFullName()            { return fullName; }
    public void   setFullName(String v)    { this.fullName = v; }

    public String getEmail()               { return email; }
    public void   setEmail(String v)       { this.email = v; }

    public String getPassword()            { return password; }
    public void   setPassword(String v)    { this.password = v; }

    public String getCategoryScope()       { return categoryScope; }
    public void   setCategoryScope(String v){ this.categoryScope = v; }
}