# The Fashion Hub — Men's Wear POS & Billing Software

A high-performance, full-stack MERN application crafted specifically for Men's Wear retail stores with **Thermal 80mm Receipt Printing**, **WhatsApp Digital Invoicing**, **Barcode POS Checkout**, **Inventory Stock Tracking**, and a **Navy Blue & Metallic Gold Luxury Dashboard**.

---

## 🌟 Key Features

1. **Luxury Navy & Gold Dashboard**:
   - Real-time sales metrics: Today's Revenue (₹), Bill Count, Garments Sold.
   - Weekly & Monthly totals, 7-Day sales trajectory chart (Recharts).
   - Category-wise quantity demand (Formal Shirts, Trousers, Suits, Jeans, etc.).
   - Low stock alert notifications and recent transactions.

2. **Rapid POS Billing & Barcode Terminal**:
   - Barcode scanner input & instant search.
   - Size tags (38, 40, 42, 44, S, M, L, XL, 30, 32, 34, 36) and color details.
   - Real-time cart calculations: Subtotal, Discount (Flat ₹ or %), GST (0%, 5%, 12%, 18%), Round Off, Grand Total.
   - Payment modes: Cash (with Cash Tendered & Change calculator), UPI / QR, Card, Split.
   - **Atomic Stock Decrement** directly in MongoDB.

3. **80mm Thermal Receipt Printing**:
   - Pixel-perfect standard 80mm POS thermal roll receipt layout (`@media print`).
   - Store header: "THE FASHION HUB", address, phone (+91 6309382716), GSTIN.
   - Itemized table with Size, Qty, Rate, Total, and barcode verification.

4. **One-Click WhatsApp Invoice Sharing**:
   - Formats a digital receipt with purchased items, totals, and shop details.
   - Launches `https://wa.me/91<phone>?text=...` directly for 1-click sharing.

5. **Product & Stock Management**:
   - Menswear categories: Formal Shirts, Casual Shirts, Trousers, Jeans, Suits & Blazers, Kurta & Ethnic Wear, Accessories.
   - Add/Edit garments, set low stock thresholds, and quick restock (+/-) adjustments.

6. **Sales Audit, Refunds & Stock Restoration**:
   - Filter transactions by date range (Today, 7 days, 30 days, Custom Range).
   - Export reports directly to CSV.
   - **Automatic Stock Restoration**: Refunding or cancelling a bill automatically increments product quantities back into active inventory!

---

## 🔑 Default Credentials

The database auto-seeds these default accounts on first startup:

| Role | Username | Password |
|---|---|---|
| **Store Owner (Admin)** | `admin` | `admin123` |
| **Cashier Staff** | `cashier` | `cashier123` |

*(You can also click the quick one-click demo login buttons directly on the login page!)*

---

## 🚀 How to Run Locally

### 1. Backend Server

1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Configure your MongoDB connection in [backend/.env](file:///c:/Users/srika/OneDrive/Desktop/Fashionhub-billing/backend/.env):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   JWT_SECRET=thefashionhub_menswear_jwt_secret_key_2026_secure
   CLIENT_URL=http://localhost:5173
   SHOP_NAME=The Fashion Hub
   SHOP_PHONE=6309382716
   SHOP_ADDRESS=New Jewewllary Market, Kamala Theatre Road Bhainsa 504103
   ```
3. Start the backend:
   ```bash
   npm run dev
   # or
   node server.js
   ```
   *The server will run on `http://localhost:5000` and automatically seed sample menswear garments and default accounts!*

---

### 2. Frontend Application

1. Open a second terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## 📁 Project Structure

```
Fashionhub-billing/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login, JWT, User Seeding
│   │   ├── productController.js  # CRUD, Barcode Scanner, Categories
│   │   ├── billController.js     # Create Bill, Atomic Stock, Refund Stock Restore
│   │   └── reportController.js   # Sales Analytics, Today/Weekly/Monthly Totals
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & admin guard
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Admin & Cashier schema with bcrypt
│   │   ├── Product.js            # Menswear inventory with size & barcode
│   │   ├── Bill.js               # Invoice schema with payment details
│   │   └── Counter.js            # Atomic sequential bill number counter
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── billRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/
│   │   ├── generateBillNumber.js # Sequential format: TFH-2610-1001
│   │   └── seedData.js           # Default menswear products & accounts
│   ├── .env                      # Environment config (MongoDB Atlas, Port, etc.)
│   └── server.js                 # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js          # Axios instance with Bearer token interceptor
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx          # Live digital clock, store phone, cashier badge
    │   │   │   ├── Sidebar.jsx         # Luxury Navy & Gold navigation
    │   │   │   ├── Modal.jsx           # Reusable modal
    │   │   │   └── ProtectedRoute.jsx  # Route guard
    │   │   ├── receipt/
    │   │   │   └── ThermalReceipt.jsx  # 80mm thermal receipt with @media print
    │   │   └── billing/
    │   │       └── WhatsAppShareModal.jsx # Live WhatsApp invoice generator
    │   ├── context/
    │   │   ├── AuthContext.jsx         # JWT session management
    │   │   └── ShopContext.jsx         # Store profile & settings
    │   ├── pages/
    │   │   ├── LoginPage.jsx           # Luxury login with demo quick-fill
    │   │   ├── DashboardPage.jsx       # KPIs, charts, category quantities, low stock
    │   │   ├── BillingPage.jsx         # POS terminal, barcode scan, cart checkout
    │   │   ├── ProductsPage.jsx        # Garment catalog, sizes, inventory adjustments
    │   │   ├── ReportsPage.jsx         # Sales audit, CSV export, refund stock restores
    │   │   └── SettingsPage.jsx        # Store profile & MongoDB health diagnostic
    │   ├── App.jsx                     # Master routes configuration
    │   ├── index.css                   # Tailwind v4 & Luxury Navy & Gold design system
    │   └── main.jsx
    ├── index.html                      # Luxury fonts & branding
    └── vite.config.js                  # Vite with Tailwind v4 & API proxy
```
