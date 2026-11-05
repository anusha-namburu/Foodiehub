# 🍔 FoodieHub – Premium Online Food Ordering & Delivery Platform

**FoodieHub** is a modern, commercial-grade, responsive full-stack food delivery web application built with a high-performance **React + Tailwind CSS** frontend, a scalable **Python Flask REST API** backend, and **MySQL / SQLAlchemy ORM** database architecture.

---

## ✨ Features Overview

### 🍕 Customer Experience
- **Home Page**:
  - High-impact Hero section with instant food search and cuisine discovery
  - Category slider (Pizza, Burgers, Sushi, Biryani, Pasta, Desserts, Healthy, Drinks)
  - Popular partner restaurants with ratings, prep times, and delivery fees
  - Best-selling dishes with 1-click cart addition
  - Today's special offers and promo codes banner
  - Verified customer reviews & testimonials
  - Newsletter subscription with instant promo code reward
- **Restaurant & Menu Browsing**:
  - Search restaurants by name, cuisine, and dish
  - Filter by cuisine pills, 4.5+ / 4.0+ rating, delivery time (<25m, <35m), and sorting (Highest Rated, Fastest Delivery, Lowest Fee)
  - Dynamic restaurant detail page with banner, reviews, and categorized menus
  - Interactive dish modal with ingredients, veg/non-veg tags, spice indicators, and custom cooking instructions
- **Interactive Cart & Checkout**:
  - Slide-over basket drawer with dynamic counter badge
  - Real-time quantity adjustments and item removal
  - Automated calculation: Subtotal, Delivery Fee, Taxes (8%), and Coupon Discounts
  - Promo code validation engine (`WELCOME50`, `FOODIE20`, `FREESHIP`, `FEAST10`)
  - Multi-address manager (select existing or save new address inline)
  - Safe mock payment options: Credit/Debit Card, Instant UPI / Mobile Wallet, Cash on Delivery (COD)
- **Real-Time Order Tracking**:
  - 5-stage animated timeline stepper:
    1. **Order Placed**
    2. **Restaurant Accepted**
    3. **Food Preparation**
    4. **Out for Delivery** (with live active pulse)
    5. **Delivered**
  - Order cancellation option before cooking begins
  - Auto-polling status updates
- **Customer Dashboard**:
  - Profile management (Full Name, Phone)
  - Order history with status tags and 1-click re-tracking
  - Saved addresses management (Home, Work, Other)
  - Bookmarked favourite restaurants

---

### 🛡️ Admin Dashboard (`/admin`)
- **Key Metrics Overview**: Total Revenue, Today's Sales, Active Orders, Total Customers, Catalog counts
- **Live Order Management**: View all customer orders and update status in real time (`placed` -> `accepted` -> `preparing` -> `out_for_delivery` -> `delivered` -> `cancelled`)
- **Restaurant Management**: Add new partner restaurants, configure cuisines, delivery fees, and minimum order values
- **Food Catalog Management**: Add new dishes, adjust prices/discounts, toggle vegetarian, spicy, bestseller, and availability
- **Categories Manager**: Add and manage food categories and slugs
- **Coupons Engine**: Create discount codes with percentage or flat dollar savings and minimum order conditions
- **Customer Information**: View registered foodies, order counts, and total spending

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios |
| **Backend** | Python Flask, Flask-CORS, PyJWT, Werkzeug |
| **Database** | MySQL (with PyMySQL & SQLAlchemy ORM) + Automatic SQLite fallback |
| **Security** | JWT Bearer Authentication, Salted Password Hashing |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+) & **pip**
- *(Optional)* **MySQL Server** (XAMPP, WAMP, Docker, or native MySQL 8.0)

---

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) If you are using MySQL, configure your credentials:
# By default, FoodieHub tests for MySQL on localhost:3306.
# If MySQL is not running, it automatically and gracefully initializes
# a local SQLite database (foodiehub.db) with all sample seed data ready!

# To explicitly point to a MySQL database, set environment variables:
# export MYSQL_USER=root
# export MYSQL_PASSWORD=your_password
# export MYSQL_HOST=localhost
# export MYSQL_PORT=3306
# export MYSQL_DB=foodiehub

# Run the Flask backend server
python app.py
```
> **Backend runs on**: `http://127.0.0.1:5000`

---

### 3. Frontend Setup

In a new terminal window:
```bash
cd frontend

# Dependencies are already installed! If needed:
npm install

# Start the Vite development server
npm run dev
```
> **Frontend runs on**: `http://localhost:5173`

---

## 🔑 Demo Login Accounts

FoodieHub comes pre-seeded with both customer and admin demo accounts. On the Login page (`/login`), you can use the **1-Click Quick Fill** buttons:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@foodiehub.com` | `admin123` |
| **Demo Customer** | `customer@foodiehub.com` | `customer123` |

*Or click **Sign Up** to create your own customer account instantly.*

---

## 🎟️ Active Test Promo Codes

You can apply any of these codes in your cart or during checkout:
- `WELCOME50` – 50% discount up to \$15
- `FOODIE20` – 20% discount on orders above \$25
- `FREESHIP` – \$5.00 off delivery
- `FEAST10` – Flat \$10.00 off family orders above \$50

---

## 🗄️ Database Architecture

FoodieHub includes `backend/schema.sql` containing full DDL for:
- `users`
- `restaurants`
- `categories`
- `food_items`
- `cart_items`
- `addresses`
- `orders`
- `order_items`
- `payments`
- `reviews`
- `coupons`
- `favourites`
