# Scanbit Backend API

Professional backend API for Scanbit - Digital Menu & Business Solutions Platform.

**Developed by Rudransh Infotech Private Limited**

---

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Default Credentials](#default-credentials)

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 📧 **OTP Email Verification** - Email verification via OTP
- 🏪 **Restaurant/Business Management** - Complete CRUD operations
- 📋 **Menu & Category Management** - Organize menu items by categories
- 🍽️ **Menu Item Management** - Add, update, and delete menu items
- 📊 **Analytics & QR Scan Tracking** - Track QR code scans and analytics
- 👤 **Admin Dashboard** - Comprehensive admin panel
- 🎯 **Role-based Access Control** - Admin and User roles
- 📤 **File Upload** - Image uploads via Cloudinary
- 🔄 **Password Reset** - Secure password reset functionality

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MongoDB** (v6.0 or higher) - Local installation or MongoDB Atlas account
- **Git** (for cloning the repository)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Menu card App/backend"
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration (see [Environment Variables](#environment-variables) section).

### Step 4: Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```
3. MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### Step 5: Seed the Database

Run the seed script to create admin user and demo data:

```bash
npm run seed
```

This will create:
- Admin user account
- Demo business/restaurant account
- Sample menu data

### Step 6: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

---

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/scanbit
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scanbit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (for OTP and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**⚠️ Important:** Never commit your `.env` file to version control. Always use `.env.example` as a template.

---

## 📊 Database Setup

The application uses MongoDB with Mongoose ODM. The database will be automatically created when you first run the application.

### Database Models

- **User** - User accounts (admin and regular users)
- **Restaurant** - Business/restaurant information
- **Category** - Menu categories
- **MenuItem** - Individual menu items
- **QRScan** - QR code scan tracking

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with **nodemon** for automatic reloading on file changes.

### Production Mode

```bash
npm start
```

### Seed Database

```bash
npm run seed
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with code | No |

### OTP Verification

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/otp/send` | Send OTP to email | No |
| POST | `/api/otp/verify` | Verify OTP | No |

### Restaurants/Businesses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/restaurants` | Get all restaurants (admin) | Yes (Admin) |
| GET | `/api/restaurants/my-restaurant` | Get current user's restaurant | Yes |
| GET | `/api/restaurants/:id` | Get single restaurant | Yes |
| PUT | `/api/restaurants/:id` | Update restaurant | Yes |
| GET | `/api/restaurants/:restaurantId/menu` | Get restaurant menu (public) | No |

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | Yes |
| POST | `/api/categories` | Create category | Yes |
| PUT | `/api/categories/:id` | Update category | Yes |
| DELETE | `/api/categories/:id` | Delete category | Yes |

### Menu Items

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/menu-items` | Get all menu items | Yes |
| GET | `/api/menu-items/:id` | Get single menu item | Yes |
| POST | `/api/menu-items` | Create menu item | Yes |
| PUT | `/api/menu-items/:id` | Update menu item | Yes |
| DELETE | `/api/menu-items/:id` | Delete menu item | Yes |

### Menus (Public)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/menus/:restaurantId` | Get complete menu for restaurant | No |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard` | Get dashboard analytics | Yes |

### QR Codes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/qr/:restaurantId` | Get QR code URL | No |
| POST | `/api/qr/scan` | Track QR code scan | No |

### File Upload

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Upload image to Cloudinary | Yes |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Get admin statistics | Yes (Admin) |
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/restaurants` | Get all restaurants | Yes (Admin) |

---

## 🛠 Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **CORS:** cors middleware

---

## 📦 Dependencies

### Production Dependencies

```json
{
  "bcryptjs": "^2.4.3",           // Password hashing
  "cloudinary": "^1.41.0",        // Image upload and storage
  "cors": "^2.8.5",                // Cross-Origin Resource Sharing
  "dotenv": "^16.3.1",             // Environment variables
  "express": "^4.18.2",            // Web framework
  "express-validator": "^7.0.1",   // Input validation
  "jsonwebtoken": "^9.0.2",        // JWT authentication
  "mongoose": "^8.0.3",            // MongoDB ODM
  "multer": "^1.4.5-lts.1",        // File upload middleware
  "nodemailer": "^7.0.12"          // Email sending
}
```

### Development Dependencies

```json
{
  "nodemon": "^3.0.2"              // Auto-reload for development
}
```

---

## 📁 Project Structure

```
backend/
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Restaurant.js        # Restaurant/Business model
│   ├── Category.js           # Category model
│   ├── MenuItem.js          # Menu item model
│   └── QRScan.js            # QR scan tracking model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── otp.js               # OTP verification routes
│   ├── restaurants.js       # Restaurant routes
│   ├── categories.js        # Category routes
│   ├── menuItems.js         # Menu item routes
│   ├── menus.js             # Public menu routes
│   ├── analytics.js         # Analytics routes
│   ├── qr.js                # QR code routes
│   ├── upload.js            # File upload routes
│   └── admin.js             # Admin routes
├── scripts/
│   └── seed.js              # Database seeding script
├── utils/
│   ├── generateToken.js     # JWT token generation
│   ├── otpStore.js          # OTP storage utilities
│   └── emailTemplates.js    # Email templates
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## 🔑 Default Credentials

After running the seed script, you can use these credentials:

### Admin Account
- **Email:** `admin@scanbit.com`
- **Password:** `admin123`

### Demo Business Account
- **Email:** `hotel@demo.com`
- **Password:** `demo123`

**⚠️ Important:** Change these default passwords in production!

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- Verify network connectivity for MongoDB Atlas

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill the process using the port:
  ```bash
  # Find process
  lsof -i :5000
  # Kill process
  kill -9 <PID>
  ```

### Cloudinary Upload Issues

- Verify your Cloudinary credentials in `.env`
- Check your Cloudinary account dashboard
- Ensure API keys have upload permissions

### Email Not Sending

- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check firewall/network restrictions

---

## 📝 License

ISC License

---

## 👨‍💻 Developed by

**Rudransh Infotech Private Limited**

---

## 📞 Support

For support and inquiries, please contact Rudransh Infotech Private Limited.

---

## 🔄 Version

**Version:** 1.0.0

---

**Last Updated:** 2025
