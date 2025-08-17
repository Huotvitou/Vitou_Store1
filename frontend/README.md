# MyShop Pro (Khmer) — Clean UI + Customer Portal
**Frontend (Vercel)** + **Backend (Render)** + **MySQL + Cloudinary** + **Customer Login + Admin Delivery Note**

## 1) Backend
- Root: `backend/`
- API:
  - `POST /api/auth/register {name,phone,email,password}`
  - `POST /api/auth/login {email,password}` → returns JWT
  - `POST /api/orders` (multipart) → optional Bearer token to link user
  - `GET /api/orders/mine` (Bearer token) → customer can view own orders + delivery note
  - `GET /api/orders` (admin table view)
  - `PATCH /api/orders/:id/status` (header: `x-admin-key`)
  - `PUT /api/orders/:id/note` (header: `x-admin-key`) – put account/serial/keys for delivery
- `.env.example`:
```
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=myshop_pro
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=change_this_secret
ADMIN_KEY=change_admin_key
PORT=4000
```
- Run schema: `backend/schema.sql`

## 2) Frontend
- Root: `frontend/`
- Pages: `index.html`, `checkout.html`, `register.html`, `login.html`, `account.html`, `admin-login.html`, `admin-orders.html`
- Set API base in `frontend/config.js`:
```
window.API_BASE = 'https://<YOUR BACKEND URL>/api';
```

## Deploy
- Backend → Render (build: `npm install`, start: `npm start`, env: above)
- Frontend → Vercel (root dir `frontend/`)

## Flow
1. Customer **Register/Login** → gets JWT (stored in localStorage).
2. Customer **Checkout** → upload ABA slip → order saved (linked to user).
3. **Admin** opens admin page (enter `ADMIN_KEY`) → verify slips, set **Status** + write **Delivery Note** (e.g., “Account: user / Pass: 1234”).
4. Customer opens **My Orders** → sees order status + delivery note when ready.
