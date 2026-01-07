# ServerSide Backend

A robust, production-ready Node.js/Express backend API built with TypeScript and MongoDB. It features a complete authentication system with security best practices, role-based access control (RBAC), and full CRUD capabilities for managing Tasks, Notes, and Products.

## 🚀 Features

### **Authentication & Security (The "Shield")**
- **JWT Authentication**: Secure user sessions with JSON Web Tokens.
- **Email Verification**: User accounts are locked until email is verified.
- **Password Reset Flow**: Secure, token-based password recovery system.
- **Rate Limiting**:
  - Global API rate limiting to prevent DDoS.
  - Strict logic-based limiting on Login/Auth routes.
- **Brute Force Protection**: Account locks for 1 hour after 5 failed login attempts.
- **Dashboard Lock**: Special `verify-password` endpoint for sensitive actions (Lock Screen).
- **Security Headers**: Integrated `helmet` for HTTP security headers.

### **Role-Based Access Control (RBAC)**
- **User Role**:
  - Can manage their own private Tasks and Notes.
  - Can accept public Products.
  - Can manage their own profile (`/me`).
- **Admin Role**:
  - Full access to manage all Users.
  - Full CRUD access to Products.

### **Data Management**
- **Tasks**: Private, per-user task management.
- **Notes**: Private, per-user note taking.
- **Products**: Public catalog with Admin-only management.

### **Documentation**
- **Swagger UI**: Interactive API documentation available at `/api-docs`.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Documentation**: Swagger (OpenAPI 3.0)
- **Security**: Helmet, Express-Rate-Limit, BCrypt, JWT, Zod
- **Utilities**: Nodemailer (Email), Dotenv

---

## ⚡️ Getting Started

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas URL)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/serverside_db
NODE_ENV=development

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d

# Email (Ethereal / SMTP)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_user
EMAIL_PASS=your_ethereal_pass

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Running the Server

**Development Mode** (with hot-reload):
```bash
npm run dev
```
*Note: In development mode, Email Verification and Password Reset links are printed to the server console for easy testing without a real email provider.*

**Production Build**:
```bash
npm run build
npm start
```

### 5. API Documentation
Render link:https://backend-developer-intern.onrender.com
Once the server is running, visit:
👉 **http://localhost:5000/api-docs**

###
Note: In this project, email verification and forgot-password links are not sent via email. Instead, the links are displayed in the running command-line console. The user must copy the link from the console and paste it into a browser to complete the activation process.

### for login admin and user

admin email :admin@gmail.com
admin password:admin123

user emai:user@gmail.com
user password:user123@

---

## 📡 API Endpoints Overview

### **Auth**
- `POST /api/v1/auth/register` - Create account (triggers verification email)
- `POST /api/v1/auth/login` - Login (requires verified email)
- `GET /api/v1/auth/logout` - Logout (clears cookie)
- `GET /api/v1/auth/verifyEmail/:token` - Verify email address
- `POST /api/v1/auth/forgotPassword` - Request reset link
- `PATCH /api/v1/auth/resetPassword/:token` - Set new password
- `POST /api/v1/auth/verify-password` - Verify password (for UI lock screens)

### **Users**
- `GET /api/v1/users/me` - Get current user info
- `PATCH /api/v1/users/updateMe` - Update profile
- `DELETE /api/v1/users/deleteMe` - Soft delete account
- `GET /api/v1/users` - Admin: Get all users
- `POST /api/v1/users` - Admin: Create user

### **Tasks & Notes** (Private)
- `GET /api/v1/tasks` | `/api/v1/notes`
- `POST /api/v1/tasks` | `/api/v1/notes`
- `PATCH /api/v1/tasks/:id` | `/api/v1/notes/:id`
- `DELETE /api/v1/tasks/:id` | `/api/v1/notes/:id`

### **Products**
- `GET /api/v1/products` - Public list
- `POST /api/v1/products` - Admin only
- `DELETE /api/v1/products/:id` - Admin only

---

## 🔒 Error Handling
- Centralized Error Middleware.
- Operational vs. Programming error distinction.
- Development mode provides detailed stack traces.
- Production mode provides user-friendly messages and hides implementation details.
- Handles MongoDB Duplicate Key, Validation, and Cast errors gracefully.

