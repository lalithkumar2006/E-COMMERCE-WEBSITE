# AuraStore — Complete Modern E-Commerce Platform with Verified UPI Payments

A production-ready, fully functional full-stack e-commerce website featuring dynamic product search & filtering, interactive shopping cart, stock control, customer authentication, order management, printable tax invoice generation, comprehensive admin dashboard, and **verified UPI payment integration** to merchant destination **`lalithkumar19742006@oksbi`** (Merchant Name: **Lalithkumar**).

---

## 🌟 Key Features Overview

### 1. Website Design & UI/UX
- **Design & Typography**: Clean, premium aesthetics powered by Tailwind CSS and Plus Jakarta Sans.
- **Theme Modes**: Full **Light & Dark Mode** toggle with persistent storage and system synchronization.
- **Responsiveness**: Pixel-perfect responsive experience across desktop, laptop, tablet, and mobile browsers.
- **Micro-Interactions**: Smooth hover transitions, interactive galleries with thumbnail zoom, confetti animation on order completion, and reactive toast notifications.

### 2. 21 Main Pages (100% Implemented & Functional)
1. **Home (`/`)**: Hero banner, value propositions, category grid, featured products, promotional discounts (`SUPER20`), trending products, and trust badges.
2. **Shop / All Products (`/shop`)**: Complete catalog with multi-facet sidebar filtering (categories, brands, price range, ratings, stock), search query support, sorting (price low-high, high-low, newest, ratings, popularity), and pagination.
3. **Product Details (`/product/:idOrSlug`)**: High-res multi-image gallery, interactive thumbnail switcher, brand tags, live stock status counter, quantity selector, "Add to Cart", "Buy Now", wishlist toggle, technical specifications table, verified customer reviews & ratings breakdown, and related products recommendations.
4. **Product Categories (`/categories`)**: Visual gallery of curated categories with live product counters.
5. **Search Results (`/search?q=...`)**: Instant search results page with count indicators and smart empty-state tips.
6. **Shopping Cart (`/cart`)**: Persistent cart (localStorage + server sync), item quantity adjustment with stock limiters, coupon code engine (`SUPER20`, `WELCOME10`, `FESTIVE500`), free shipping calculation threshold (₹1,000+), and order summary breakdown.
7. **Wishlist (`/wishlist`)**: Customer wishlist with 1-click "Move to Cart" and quick remove.
8. **Checkout (`/checkout`)**: Pre-filled address form for logged-in users, validation for Indian 6-digit PIN codes, order review, and UPI payment method selection.
9. **UPI Payment (`/payment/upi/:orderNumber`)**: **The core payment terminal**:
   - Displays Merchant UPI ID: `lalithkumar19742006@oksbi` with 1-click copy
   - Displays Merchant Name: `Lalithkumar`
   - Exact order amount formatted in INR
   - Dynamically generated high-contrast UPI QR code (NPCI compliant)
   - Deep links for Google Pay, PhonePe, Paytm, BHIM UPI
   - 12-digit Bank UTR / Reference number submission form
   - Double-transaction duplicate prevention
   - Real-time status polling and instant verification simulator.
10. **Order Confirmation (`/order-confirmation/:orderNumber`)**: Celebration confetti, live order timeline, order item details, printable tax invoice generation with print stylesheet.
11. **My Orders (`/orders`)**: Complete order history with status badges (`Pending`, `Payment Pending`, `Payment Successful`, `Processing`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`), payment status, and 1-click links to pay or view tax invoice.
12. **Customer Profile (`/profile`)**: Manage customer name, phone number, and default delivery shipping address.
13. **Login (`/login`)**: Secure authentication with 1-click demo credential fill buttons (`admin@ecommerce.com` / `customer@example.com`).
14. **Registration (`/register`)**: Customer registration with bcrypt password hashing and automatic JWT issuance.
15. **Forgot Password (`/forgot-password`)**: Safe recovery flow with password reset capability.
16. **Contact Us (`/contact`)**: Contact form with direct WhatsApp customer support link (`https://wa.me/919840123456`) and merchant office details.
17. **About Us (`/about`)**: Brand story, curation principles, and official merchant declaration.
18. **Privacy Policy (`/privacy`)**: Transparent privacy terms confirming zero storage of UPI PINs or banking credentials.
19. **Terms and Conditions (`/terms`)**: Detailed e-commerce terms and conditions.
20. **Return and Refund Policy (`/returns`)**: 7-day guarantee and direct UPI refund timeline guidelines.
21. **404 Not Found (`*`)**: Custom error page with quick links to home and store.
+ **Admin Dashboard (`/admin`)**: Restricted panel for administrators with KPI analytics, live revenue, category sales, payment reconciliations, order status updates, product cataloging, and coupon management.

---

## 💳 UPI Payment Architecture & Workflow

### 1. Merchant Destination
- **Merchant UPI ID**: `lalithkumar19742006@oksbi`
- **Merchant Name**: `Lalithkumar`
- **Currency**: `INR`

### 2. Payment Process & Security
1. **Dynamic QR Code Generation**:
   The backend generates an official NPCI-compliant UPI URI:
   ```text
   upi://pay?pa=lalithkumar19742006@oksbi&pn=Lalithkumar&am=<EXACT_TOTAL>&tr=<REF_ID>&tn=Order%20<ORDER_NUMBER>&cu=INR
   ```
   A high-contrast QR Code is generated server-side using the `qrcode` library and served as a base64 Data URL.
2. **UPI App Deep Links**:
   Mobile and tablet customers can tap dedicated app triggers:
   - **Google Pay**: `tez://upi/pay?pa=lalithkumar19742006@oksbi&pn=Lalithkumar&am=...`
   - **PhonePe**: `phonepe://pay?pa=lalithkumar19742006@oksbi&pn=Lalithkumar&am=...`
   - **Paytm**: `paytmmp://pay?pa=lalithkumar19742006@oksbi&pn=Lalithkumar&am=...`
   - **BHIM UPI**: `bhim://pay?pa=lalithkumar19742006@oksbi&pn=Lalithkumar&am=...`
3. **Transaction Verification (Anti-Fraud)**:
   - **No Blind Approvals**: An order is never marked as paid simply because a user clicked a button or uploaded a screenshot.
   - **12-Digit UTR Requirement**: The customer submits their 12-digit Bank Reference Number (UTR) from their UPI app receipt.
   - **Duplicate Protection**: The database checks and blocks duplicate UTR numbers across multiple orders to prevent double spending.
   - **Server-Side Verification**: Transactions can be verified by the administrator in the Admin Dashboard or via the automated verification endpoint (`/api/payment/verify-payment`), which updates the order status to `Payment Successful` and timestamps the audit log.

---

## 🗄️ Relational Database Architecture

Powered by Node.js built-in native **SQLite** (`node:sqlite DatabaseSync`), providing zero-friction, native execution with zero compilation or external database service requirements:

| Table | Description |
|---|---|
| `users` | Accounts, bcrypt password hashes, roles (`customer`, `admin`), profile data |
| `categories` | Product categories with slug, descriptions, and banner images |
| `products` | Product title, slug, price, discount price, category, brand, stock, ratings |
| `product_images` | Multiple high-resolution images per product |
| `product_specs` | Structured key-value technical specifications |
| `cart_items` | User shopping cart items with quantity and timestamps |
| `wishlist_items` | Customer saved wishlist entries |
| `addresses` | Saved shipping addresses with Indian postal codes |
| `orders` | Orders with unique IDs, customer info, totals, statuses, tracking number |
| `order_items` | Snapshot of purchased products, unit prices, and quantities |
| `payments` | UPI payment records, merchant UPI ID, UTR number, approval timestamps |
| `transactions` | Immutable audit log of all financial transaction attempts |
| `reviews` | Customer ratings (1-5 stars), titles, comments, and approvals |
| `coupons` | Promo discount codes (percentage / fixed value, minimum spend limits) |
| `inventory_logs` | Audit trail of inventory movements and restocks |
| `contact_messages` | Customer inquiries and contact submissions |
| `newsletter_subscribers`| Registered newsletter emails |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router v6, Canvas Confetti.
- **Backend**: Node.js, Express.js, CORS, Dotenv, JWT (`jsonwebtoken`), bcryptjs, QRCode (`qrcode`).
- **Database**: SQLite (Node.js native `DatabaseSync` engine).

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js v18+ (tested on Node v24.19)
- npm

### 1. Installation
Clone or navigate to the workspace directory:
```bash
cd Money
```

Install backend dependencies:
```bash
cd server
npm install
cd ..
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### 2. Environment Variables Setup
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_ecommerce_store_2026

# Merchant UPI Details
MERCHANT_UPI_ID=lalithkumar19742006@oksbi
MERCHANT_NAME=Lalithkumar

# Optional Razorpay Gateway Credentials
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### 3. Initialize & Seed Database
The server seeds categories, rich products, coupons, and demo accounts automatically on startup. You can also run:
```bash
node server/src/config/seed.js
```

### 4. Running the Application

#### Option A: Unified Full-Stack Server (Recommended)
Build the frontend once and run everything on a single port (`http://localhost:5000`):
```bash
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser!

#### Option B: Independent Development Mode (Hot Reloading)
In Terminal 1 (Backend API):
```bash
npm run dev:server
```
In Terminal 2 (Vite Frontend):
```bash
npm run dev:client
```
Frontend runs on **`http://localhost:3000`** with live proxying to backend on port 5000.

---

## 🔑 Default Accounts for Testing

| Role | Email Address | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@ecommerce.com` | `Admin@123` | Full Admin Console, Analytics, Payment Approvals, Product CRUD |
| **Sample Customer** | `customer@example.com` | `Customer@123` | Store customer with pre-loaded address and order history |

*Tip: Quick 1-click test credentials buttons are provided directly on the Login page!*

---

## 🎟️ Pre-Configured Discount Coupons

| Code | Discount | Minimum Purchase | Notes |
|---|---|---|---|
| `WELCOME10` | 10% OFF | ₹500 | First purchase welcome discount |
| `SUPER20` | 20% OFF | ₹1,500 | Max discount ₹1,000 |
| `FESTIVE500` | Flat ₹500 OFF | ₹2,500 | Festive promotional discount |

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Retrieve current user profile and default address
- `PUT /api/auth/profile` — Update customer name, phone, and address
- `POST /api/auth/forgot-password` — Password recovery trigger
- `POST /api/auth/reset-password` — Set new password

### Products (`/api/products`)
- `GET /api/products` — Filter, search, sort, and paginate products
- `GET /api/products/suggestions?q=...` — Live autocomplete suggestions
- `GET /api/products/featured` — Top featured showcase products
- `GET /api/products/trending` — Trending items
- `GET /api/products/filters` — Available categories, brands, price bounds
- `GET /api/products/:idOrSlug` — Single product details with specs & images
- `GET /api/products/:id/related` — Recommended related items

### Categories (`/api/categories`)
- `GET /api/categories` — List all categories with product counts
- `GET /api/categories/:slug` — Category details and products

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Get logged-in user cart
- `POST /api/cart/add` — Add product to cart (stock-validated)
- `PUT /api/cart/update` — Update item quantity (stock-validated)
- `DELETE /api/cart/:productId` — Remove product from cart
- `DELETE /api/cart/clear/all` — Clear cart

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` — Get customer wishlist
- `POST /api/wishlist/toggle` — Add / remove item from wishlist

### Coupons (`/api/coupons`)
- `GET /api/coupons/active` — Active public coupons
- `POST /api/coupons/apply` — Validate code and calculate discounts

### Orders (`/api/orders`)
- `POST /api/orders` — Create new order with server-side price check and inventory lock
- `GET /api/orders` — Customer order history
- `GET /api/orders/:orderNumber` — Single order breakdown with invoice data
- `POST /api/orders/:orderNumber/cancel` — Cancel pending order and restore stock

### UPI Payment Integration (`/api/payment`)
- `GET /api/payment/upi-details/:orderNumber` — Generate dynamic UPI QR Code, deep links, and merchant details (`lalithkumar19742006@oksbi`)
- `POST /api/payment/submit-upi-ref` — Submit 12-digit UTR with duplicate check
- `GET /api/payment/status/:orderNumber` — Live polling status
- `POST /api/payment/verify-payment` — Approve or reject payment (Admin / Verification Simulator)

### Reviews (`/api/reviews`)
- `GET /api/reviews/:productId` — Get approved customer reviews
- `POST /api/reviews/:productId` — Submit customer rating and review

### Admin Console (`/api/admin`)
- `GET /api/admin/stats` — Revenue, order counts, customer count, category breakdown
- `GET /api/admin/orders` — Filter all orders
- `PUT /api/admin/orders/:orderNumber/status` — Change order status
- `GET /api/admin/payments` — Review submitted UTRs
- `GET /api/admin/products` — Product inventory list
- `POST /api/admin/products` — Catalog new product
- `PUT /api/admin/products/:id` — Edit product price, stock, details
- `DELETE /api/admin/products/:id` — Delete product
- `GET /api/admin/customers` — Customer list & total spending
- `GET /api/admin/coupons` — Coupon manager
- `POST /api/admin/coupons` — Create coupon
- `DELETE /api/admin/coupons/:id` — Remove coupon

---

## 🌐 Production Deployment Guide

### Deploying the Unified Full-Stack App (Render / Railway / VPS)
1. Set the Root Directory to `.`
2. Build Command:
   ```bash
   cd client && npm install && npm run build && cd ../server && npm install
   ```
3. Start Command:
   ```bash
   node server/src/index.js
   ```
4. Set Environment Variables in your provider dashboard:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `JWT_SECRET=<YOUR_SECURE_KEY>`
   - `MERCHANT_UPI_ID=lalithkumar19742006@oksbi`
   - `MERCHANT_NAME=Lalithkumar`

---

## 🛡️ Cybersecurity & Production Safeguards
- **Server-Side Price Recalculation**: The backend strictly computes subtotal, discounts, and delivery fees directly from database records, preventing client-side price tampering.
- **Strict Stock Enforcement**: Prevents orders exceeding current database inventory.
- **Idempotent UTR Reconciliations**: Every 12-digit UTR is indexed with a uniqueness constraint to prevent duplicate submissions.
- **SQL Injection Prevention**: 100% prepared parameterized SQL statements.
- **XSS & Content Protection**: Output encoding, modern React JSX escaping, and strict JSON API responses.
