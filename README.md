# 🎓 Kashvi SmartClass - Complete EdTech & School Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_Token-FB542B?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

**Kashvi SmartClass** is an institutional academic management system engineered for schools, coaching institutes, and universities. Featuring unified multi-role authentication (**Admin**, **Teacher**, **Student**, and **Parent**), real-time attendance analytics, homework management, AI-powered study planner (Google Gemini), dynamic UPI QR fee payments & instant receipts, clash-free academic timetable scheduling, live virtual classrooms, and automated notifications.

---

## 🌟 Key Features by Role

### 👑 1. Admin Dashboard (`/dashboard/admin`)
- **Institutional Overview**: Real-time stats on total students, faculty members, fee revenue collections, and system health.
- **User Directory**: Create, update, search, and manage faculty, student, and parent accounts with encrypted passwords and unique IDs (e.g. `STU-2024-XXXX`).
- **Academic Timetable Scheduler**: Day/time/class schedule management with automated backend conflict detection (`TEACHER_COLLISION`, `CLASS_COLLISION`, `ROOM_COLLISION`).
- **Fee Management**: Create tuition invoices, monitor revenue analytics, and track real-time settlement status.
- **Study Notes Governance**: View and manage curriculum documents across all grades.

### 👨‍🏫 2. Teacher Dashboard (`/dashboard/teacher`)
- **Attendance Register**: One-click class attendance marking (`Present`, `Absent`, `Late`) with "Mark All Present" helper.
- **Homework Hub**: Create homework assignments with due dates, attachments, duplicate prevention, and submissions review.
- **Live Classroom Scheduling**: Schedule and launch Google Meet / Zoom live classes.
- **Study Materials Repository**: Upload and publish subject notes, PDF guides, and revision resources.

### 🎒 3. Student Dashboard (`/dashboard/student`)
- **Academic Learning Workspace**: Daily schedule, quick concept boosters, and performance stats.
- **Attendance Analytics**: Visual breakdown of attendance percentage with graphical metric cards.
- **Homework & Submissions**: View assigned tasks, upload file attachments/links, and track submission feedback.
- **Dynamic Leaderboard**: Live academic ranking calculated dynamically from weighted test scores and attendance consistency.
- **🤖 AI Study Plan Generator**: Adaptive 7-day personalized study timetable powered by **Google Gemini 1.5 Flash** (with built-in academic intelligence engine fallback) and MongoDB persistence.
- **Live Virtual Classes**: Join scheduled live lectures directly with one click.

### 👨‍👩‍👦 4. Parent Dashboard (`/dashboard/parent`)
- **Multi-Ward Switcher**: Switch seamlessly between enrolled children under a single guardian account.
- **Live Attendance Monitor**: Daily attendance log and cumulative presence percentage.
- **Fee Invoices & Online Payments**: View pending invoices, pay instantly via **Dynamic UPI QR Code** (`upi://pay`) or card/NetBanking simulation, and download/print official receipts.
- **Report Cards**: Term-by-term score sheets, percentages, subject grades, and faculty remarks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Node.js (ES Modules), Express.js 4.19, Mongoose 8.4, Axios |
| **Database** | MongoDB (Local `mongodb://127.0.0.1:27017` or MongoDB Atlas) |
| **Authentication & Security** | JWT (JSON Web Tokens), Bcrypt.js, Helmet, Express Validator, CORS, Strict Parent IDOR Protection |
| **AI Engine** | Google Gemini 1.5 Flash API + Built-in Adaptive Academic Planner |
| **Payments** | Dynamic UPI QR Generator (`upi://pay`), Order Creation, Verification Webhooks, Printable Receipts |
| **File Storage & Media** | Multer, Cloudinary SDK |
| **Frontend Options** | • **React Web Client**: React 18, Vite 5, Tailwind CSS, Lucide Icons, React Router DOM 6/7, React Hot Toast, Axios<br>• **Standalone Portal**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js |
| **Logging & Utilities** | Morgan, Dotenv, Nodemailer |

---

## 📁 Project Structure

```
kashvi/
├── backend/                     # Node.js Express REST API
│   ├── config/                  # Database, Email & Cloudinary configs
│   │   ├── cloudinary.js
│   │   ├── database.js
│   │   └── email.js
│   ├── controllers/             # Request handlers for all modules
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── feeController.js
│   │   ├── notificationController.js
│   │   ├── onlineClassController.js
│   │   ├── parentController.js
│   │   ├── reportController.js
│   │   ├── studentController.js
│   │   ├── studyMaterialController.js
│   │   ├── teacherController.js
│   │   └── timetableController.js
│   ├── middleware/              # Auth guard, role check, trial guard, upload, error handler
│   ├── models/                  # Mongoose Schemas (User, Attendance, Homework, Fee, StudyPlan, etc.)
│   ├── routes/                  # Modular API routes
│   ├── utils/                   # Seed data, ID generator, notification service, verification suite
│   ├── .env.example             # Backend environment template
│   ├── package.json
│   └── server.js                # Express entry point
│
├── frontend/                    # Vite + React Modern Web Client
│   ├── src/
│   │   ├── components/          # Layout, Sidebar Navigation, ProtectedRoute
│   │   ├── context/             # AuthContext (JWT state & 2FA handlers)
│   │   ├── pages/               # Multi-role dashboard pages (Admin, Teacher, Student, Parent, Login)
│   │   ├── services/            # Axios API clients
│   │   ├── styles/              # Global Tailwind CSS stylesheet
│   │   ├── App.jsx              # Application router
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── index.html                   # Standalone Full-Featured Interactive Portal
├── app.js                       # Interactive portal application logic & charts
├── styles.css                   # Premium glassmorphic stylesheet
├── package.json                 # Root convenience scripts
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### 1. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` folder (or copy from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/kashvi_smartclass
   JWT_SECRET=kashvi_super_secure_jwt_secret_key_2024_academic
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173

   # Default Admin Credentials
   ADMIN_EMAIL=admin@kashvi.com
   ADMIN_PASSWORD=Admin@2024

   # Optional: Google Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Cloudinary & Email Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

4. **Seed Demo Data (Recommended)**:
   Populate users, attendance, fees, homework, timetables, and report cards:
   ```bash
   npm run seed
   ```

5. **Start the API Server**:
   ```bash
   # Development mode with hot-reload
   npm run dev

   # Production mode
   npm start
   ```
   *Server will run at `http://localhost:5000` (Health check: `http://localhost:5000/health`).*

---

### 2. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

---

### 3. Root Workspace Commands (Convenience)

From the project root folder (`d:\kashvi`):
```bash
# Run backend development server
npm run dev:backend

# Run frontend development server
npm run dev:frontend

# Seed database
npm run seed
```

---

## 🔑 Demo Credentials

| Role | Email / Unique ID | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kashvi.com` / `ADMIN-2024-0001` | `Admin@2024` | Full system control, timetable & user setup |
| **Teacher** | `teacher@kashvi.com` / `TCH-2024-0048` | `Teacher@123` | Class 10-A, 9-B Mathematics |
| **Student** | `student@kashvi.com` / `STU-2024-1284` | `Student@123` | Class 10-A (Aarav Sharma) |
| **Parent** | `parent@kashvi.com` / `PRN-2024-0980` | `Parent@123` | Guardian of Aarav Sharma & Rhea |

---

## 🔌 API Reference Overview

All API endpoints are prefixed with `/api`:

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & retrieve JWT token
- `POST /api/auth/register` - Register new user account (Admin only)
- `GET /api/auth/me` - Get current authenticated user profile
- `POST /api/auth/verify-2fa` - Two-factor authentication verification
- `PUT /api/auth/change-password` - Change account password

### 👑 Admin (`/api/admin`)
- `GET /api/admin/dashboard-stats` - Get institutional stats and telemetry
- `GET /api/admin/users` - List all users (filters: role, class, search query)
- `POST /api/admin/users` - Create new user with hashed password
- `DELETE /api/admin/users/:id` - Remove/deactivate user account

### 👨‍🏫 Teacher (`/api/teacher`)
- `POST /api/teacher/attendance/mark` - Record batch attendance with remarks
- `GET /api/teacher/attendance` - Query attendance history
- `POST /api/teacher/homework` - Create homework with duplicate detection
- `GET /api/teacher/homework` - View assignments and submissions
- `GET /api/teacher/my-students` - Get assigned students list

### 🎒 Student (`/api/student`)
- `GET /api/student/dashboard` - Get student metrics & schedule
- `GET /api/student/attendance` - Get attendance summary & history
- `GET /api/student/homework` - Get homework assignments & submission status
- `POST /api/student/homework/:id/submit` - Submit solution with file upload/link
- `GET /api/student/leaderboard` - Live dynamic academic rankings
- `GET /api/student/study-plan` - Get saved AI study plan
- `POST /api/student/study-plan` - Generate & persist personalized AI study plan

### 👨‍👩‍👦 Parent (`/api/parent`)
- `GET /api/parent/children` - Get linked student profiles
- `GET /api/parent/children/:id/attendance` - Get attendance log of specific child
- `GET /api/parent/children/:id/fees` - View tuition fee invoices of child
- `GET /api/parent/children/:id/reports` - View term academic report cards

### 💳 Fees & Payments (`/api/fees`)
- `GET /api/fees` - List invoices (Role-filtered)
- `GET /api/fees/:id` - Get invoice details
- `POST /api/fees` - Create fee invoice (Admin only)
- `POST /api/fees/:id/order` - Generate payment order & dynamic UPI link
- `POST /api/fees/:id/pay` - Settle and verify fee payment, generate official receipt

### 📅 Timetable (`/api/timetable`)
- `GET /api/timetable` - Get class/teacher schedule
- `POST /api/timetable` - Create slot with clash detection (`TEACHER_COLLISION`, `CLASS_COLLISION`, `ROOM_COLLISION`)
- `DELETE /api/timetable/:id` - Remove timetable slot

### 📚 Study Materials (`/api/notes`)
- `GET /api/notes` - Get curriculum notes & PDF downloads
- `POST /api/notes` - Upload new study material
- `DELETE /api/notes/:id` - Delete study material

### 📹 Online Classes (`/api/online-classes`)
- `GET /api/online-classes` - Get scheduled live lectures
- `POST /api/online-classes` - Schedule live class (Google Meet / Zoom)
- `PUT /api/online-classes/:id` - Update live class details
- `DELETE /api/online-classes/:id` - Cancel live class

---

## 🔒 Security & Architecture Highlights
- **Password Hashing**: Cryptographic salting and hashing via `bcryptjs`.
- **JWT Protection**: Stateless bearer tokens with strict expiration.
- **Strict IDOR Prevention**: Parent endpoints verify child ownership to prevent unauthorized data access.
- **HTTP Header Security**: Protected against XSS, clickjacking, and MIME sniffing via `helmet`.
- **Input Sanitization**: Request validation and schema checks via `express-validator`.
- **Timetable Conflict Engine**: Automated validation preventing teacher, room, and class double-booking.
