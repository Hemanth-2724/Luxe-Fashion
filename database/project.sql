-- ============================================================
-- LUXE FASHION — FULL SCHEMA WITH ADMIN SUPPORT
-- ============================================================

DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db;
USE ecommerce_db;

-- ================= TABLES =================

CREATE TABLE users (
    user_id    INT PRIMARY KEY AUTO_INCREMENT,
    full_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    phone      VARCHAR(15),
    password   VARCHAR(255) NOT NULL,
    gender     VARCHAR(10),
    address    TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── ADMIN TABLE ─────────────────────────────────────────
-- category_scope: 'Men' | 'Women' | 'Kids' | 'Accessories' | 'All'
CREATE TABLE admins (
    admin_id       INT PRIMARY KEY AUTO_INCREMENT,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL,
    category_scope VARCHAR(20)  NOT NULL DEFAULT 'All',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id   INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description   VARCHAR(255),
    is_active     BOOLEAN DEFAULT TRUE
);

CREATE TABLE products (
    product_id       INT PRIMARY KEY AUTO_INCREMENT,
    category_id      INT,
    product_name     VARCHAR(200) NOT NULL,
    description      TEXT,
    price            DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2)  DEFAULT 0,
    image_url        VARCHAR(500),
    gender_category  VARCHAR(20),
    is_active        BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE product_sizes (
    product_size_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id      INT,
    size_label      VARCHAR(10),
    stock_quantity  INT DEFAULT 0,
    sku_code        VARCHAR(100),
    is_available    BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE cart (
    cart_id    INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id      INT NOT NULL,
    product_id   INT NOT NULL,
    size_label   VARCHAR(10),
    quantity     INT DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,
    added_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id)    REFERENCES cart(cart_id)         ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)  ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id          INT NOT NULL,
    order_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount     DECIMAL(10,2),
    payment_method   VARCHAR(50),
    order_status     VARCHAR(50) DEFAULT 'Placed',
    delivery_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id      INT NOT NULL,
    product_id    INT,
    product_name  VARCHAR(200),
    quantity      INT,
    unit_price    DECIMAL(10,2),
    subtotal      DECIMAL(10,2),
    size_label    VARCHAR(10),
    FOREIGN KEY (order_id)   REFERENCES orders(order_id)      ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)  ON DELETE SET NULL
);

-- ================= CATEGORIES =================
INSERT INTO categories (category_name, description) VALUES
('Women',       'Women fashion'),
('Men',         'Men fashion'),
('Kids',        'Kids wear'),
('Accessories', 'Accessories');

-- ================= ADMINS =================
-- admin1 manages Men, admin2 manages Women, admin3 Kids, admin4 Accessories
-- Passwords are plain-text here — hash them with BCrypt in production
INSERT INTO admins (full_name, email, password, category_scope) VALUES
('Super Admin',     'admin@luxe.com',        'Admin@123',  'All'),
('Men Admin',       'men@luxe.com',          'Admin@123',  'Men'),
('Women Admin',     'women@luxe.com',        'Admin@123',  'Women'),
('Kids Admin',      'kids@luxe.com',         'Admin@123',  'Kids'),
('Accessories Admin','accessories@luxe.com', 'Admin@123',  'Accessories');

-- ================= PRODUCTS =================

-- ── MEN (15) ──────────────────────────────────────────────
INSERT INTO products (category_id, gender_category, product_name, description, price, discount_percent, image_url) VALUES
(2,'Men','Men T-Shirt',      'Cotton T-Shirt',    499,  10, '/images/products/Men/Men T-Shirt.webp'),
(2,'Men','Men Hoodie',       'Warm hoodie',        999,  15, '/images/products/Men/Men Hoodie.jpg'),
(2,'Men','Men Jeans',        'Slim fit jeans',    1299,   5, '/images/products/Men/Men Jeans.jpg'),
(2,'Men','Men Shirt',        'Formal shirt',       899,   0, '/images/products/Men/Men Shirt.webp'),
(2,'Men','Men Jacket',       'Winter jacket',     1999,  20, '/images/products/Men/Men Jacket.jpg'),
(2,'Men','Men Shorts',       'Comfort shorts',     599,   5, '/images/products/Men/Men Shorts.jpg'),
(2,'Men','Men Blazer',       'Party blazer',      2499,  10, '/images/products/Men/Men Blazer.jpg'),
(2,'Men','Men Kurta',        'Traditional kurta',  799,  10, '/images/products/Men/Men Kurta.webp'),
(2,'Men','Men Tracksuit',    'Sports tracksuit',  1499,  15, '/images/products/Men/Men Tracksuit.jpg'),
(2,'Men','Men Polo',         'Polo T-Shirt',       699,   5, '/images/products/Men/Men Polo.jpg'),
(2,'Men','Men Coat',         'Formal coat',       2999,  25, '/images/products/Men/Men Coat.jpg'),
(2,'Men','Men Sweatshirt',   'Casual sweatshirt',  899,  10, '/images/products/Men/Men Sweatshirt.webp'),
(2,'Men','Men Joggers',      'Joggers',            799,   5, '/images/products/Men/Men Joggers.jpg'),
(2,'Men','Men Vest',         'Gym vest',           399,   0, '/images/products/Men/Men Vest.webp'),
(2,'Men','Men Denim Jacket', 'Denim jacket',      1799,  15, '/images/products/Men/Men Denim Jacket.webp');

-- ── WOMEN (15) ────────────────────────────────────────────
INSERT INTO products (category_id, gender_category, product_name, description, price, discount_percent, image_url) VALUES
(1,'Women','Women Dress',    'Floral dress',      1299,  10, '/images/products/Women/Women Dress.jpg'),
(1,'Women','Women Top',      'Stylish top',        699,   5, '/images/products/Women/Women Top.webp'),
(1,'Women','Women Jeans',    'Skinny jeans',      1199,  10, '/images/products/Women/Women Jeans.webp'),
(1,'Women','Women Saree',    'Traditional saree', 1999,  20, '/images/products/Women/Women Saree.webp'),
(1,'Women','Women Kurti',    'Ethnic kurti',       899,  10, '/images/products/Women/Women Kurti.webp'),
(1,'Women','Women Skirt',    'Long skirt',         799,  15, '/images/products/Women/Women Skirt.webp'),
(1,'Women','Women Jacket',   'Winter jacket',     1599,  20, '/images/products/Women/Women Jacket.webp'),
(1,'Women','Women Blouse',   'Designer blouse',    599,   5, '/images/products/Women/Women Blouse.webp'),
(1,'Women','Women Palazzo',  'Palazzo pants',      899,  10, '/images/products/Women/Women Palazzo.webp'),
(1,'Women','Women Leggings', 'Comfort leggings',   499,   5, '/images/products/Women/Women Leggings.jpg'),
(1,'Women','Women Gown',     'Party gown',        2499,  25, '/images/products/Women/Women Gown.webp'),
(1,'Women','Women Hoodie',   'Casual hoodie',      999,  15, '/images/products/Women/Women Hoodie.jpg'),
(1,'Women','Women Coat',     'Winter coat',       2999,  30, '/images/products/Women/Women Coat.jpg'),
(1,'Women','Women T-Shirt',  'Basic tee',          499,   5, '/images/products/Women/Women T-Shirt.jpg'),
(1,'Women','Women Shorts',   'Summer shorts',      599,  10, '/images/products/Women/Women Shorts.webp');

-- ── KIDS (10) ─────────────────────────────────────────────
INSERT INTO products (category_id, gender_category, product_name, description, price, discount_percent, image_url) VALUES
(3,'Kids','Kids T-Shirt',   'Kids tee',    299,  0, '/images/products/Kids/Kids T-Shirt.webp'),
(3,'Kids','Kids Jeans',     'Kids jeans',  599,  5, '/images/products/Kids/Kids Jeans.jpg'),
(3,'Kids','Kids Dress',     'Cute dress',  799, 10, '/images/products/Kids/Kids Dress.webp'),
(3,'Kids','Kids Hoodie',    'Kids hoodie', 699, 10, '/images/products/Kids/Kids Hoodie.webp'),
(3,'Kids','Kids Shorts',    'Kids shorts', 399,  5, '/images/products/Kids/Kids Shorts.jpg'),
(3,'Kids','Kids Jacket',    'Kids jacket', 999, 15, '/images/products/Kids/Kids Jacket.webp'),
(3,'Kids','Kids Shirt',     'Kids shirt',  499,  5, '/images/products/Kids/Kids Shirt.jpg'),
(3,'Kids','Kids Tracksuit', 'Kids tracksuit',899,10, '/images/products/Kids/Kids Tracksuit.webp'),
(3,'Kids','Kids Sweater',   'Warm sweater',699, 10, '/images/products/Kids/Kids Sweater.webp'),
(3,'Kids','Kids Kurta',     'Ethnic wear', 599, 10, '/images/products/Kids/Kids Kurta.jpg');

-- ── ACCESSORIES (10) ──────────────────────────────────────
INSERT INTO products (category_id, gender_category, product_name, description, price, discount_percent, image_url) VALUES
(4,'Accessories','Watch',      'Stylish watch',           999, 15, '/images/products/Accessories/Watch.webp'),
(4,'Accessories','Sunglasses', 'UV protection sunglasses',499, 10, '/images/products/Accessories/Sunglasses.webp'),
(4,'Accessories','Handbag',    'Fashion handbag',        1499, 20, '/images/products/Accessories/Handbag.jpg'),
(4,'Accessories','Wallet',     'Leather wallet',          799, 10, '/images/products/Accessories/Wallet.webp'),
(4,'Accessories','Cap',        'Cool cap',                299,  5, '/images/products/Accessories/Cap.jpg'),
(4,'Accessories','Belt',       'Leather belt',            499, 10, '/images/products/Accessories/Belt.jpg'),
(4,'Accessories','Backpack',   'Travel backpack',        1299, 15, '/images/products/Accessories/Backpack.webp'),
(4,'Accessories','Bracelet',   'Fashion bracelet',        399,  5, '/images/products/Accessories/Bracelet.jpg'),
(4,'Accessories','Necklace',   'Stylish necklace',        699, 10, '/images/products/Accessories/Necklace.jpg'),
(4,'Accessories','Shoes',      'Casual shoes',           1999, 20, '/images/products/Accessories/Shoes.webp');

SELECT '✅ DATABASE READY' AS status;