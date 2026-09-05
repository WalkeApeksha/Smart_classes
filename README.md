# 🎓 Kashvi SmartClass - Complete EdTech & School Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_Token-FB542B?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

**Kashvi SmartClass** is an institutional academic management system engineered for schools, coaching institutes, and universities. Featuring unified multi-role authentication (**Admin**, **Teacher**, **Student**, and **Parent**), real-time attendance analytics, homework management, online fee tracking, report cards, and automated notifications.

---

## 🌟 Key Features by Role

### 👑 1. Admin Dashboard
- **Institutional Overview**: Real-time stats on total students, faculty members, fee collections, and system health.
- **User Management**: Add, update, view, and manage faculty, student, and parent accounts.
- **Fee Management**: Create fee invoices, track paid/pending statuses, and monitor revenue analytics.
- **Academic Setup**: Class allocation, teacher assignment, and timetable coordination.
- **System Announcements**: Broadcast institution-wide alerts and updates.

### 👨‍🏫 2. Teacher Dashboard
- **Classroom Operations**: Quick attendance marking (Present / Absent / Leave) per class & subject.
- **Homework Hub**: Create homework tasks with due dates, attachments, instructions, and review submissions.
- **Examination & Marks Entry**: Publish class test marks, term grades, and academic feedback.
- **Student Progress Insights**: Monitor individual and class-level academic performance.
- **Notice Board**: Broadcast notifications to assigned classes and parents.

### 🎒 3. Student Dashboard
- **Academic Hub**: Daily schedule, active timetable, subject list, and syllabus progress.
- **Attendance Analytics**: Visual breakdown of attendance percentage with graphical charts.
- **Homework & Submissions**: View assigned homework, upload completed tasks, and track evaluation status.
- **Grade Reports**: View test scores, term report cards, and ranking summaries.
- **Fee Status**: View pending/paid tuition fee receipts.

### 👨‍👩‍👦 4. Parent Dashboard
- **Multi-Ward Support**: Switch seamlessly between enrolled children.
- **Live Attendance Monitoring**: Instant tracking of child's daily presence with alerts.
- **Academic Performance**: View test results, homework completion rates, and teacher remarks.
- **Fee Invoices & Payments**: Track fee schedules and receipt generation.
- **Direct Faculty Communication**: View assigned teacher details and send feedback/queries.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Node.js (ES Modules), Express.js 4.19, Mongoose 8 |
| **Database** | MongoDB (Local or MongoDB Atlas) |
| **Authentication & Security** | JWT (JSON Web Tokens), Bcrypt.js, Helmet, Express Validator, CORS |
| **File Storage & Media** | Multer, Cloudinary SDK |
| **Frontend Options** | • **Interactive Single-Page Portal**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js, Canvas Confetti<br>• **React Application**: React 18, Vite 5, Tailwind CSS, Lucide Icons, React Router DOM, Axios |
| **Logging & Utilities** | Morgan, Dotenv, Nodemailer |

---

## 📁 Project Structure

```
kashvi/
├── backend/                     # Node.js Express REST API
│   ├── config/                  # Database & 3rd-party service configs
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── controllers/             # Request handlers for auth, admin, teacher, etc.
│   ├── middleware/              # Auth guard, role check, error handler, upload
│   ├── models/                  # Mongoose Schemas (User, Attendance, Homework, Fee, etc.)
│   ├── routes/                  # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── parentRoutes.js
│   │   ├── studentRoutes.js
│   │   └── teacherRoutes.js
│   ├── utils/                   # Seed data & helper utilities
│   │   └── seedData.js
│   ├── .env.example             # Backend environment template
│   ├── package.json
│   └── server.js                # Express entry point
│
├── frontend/                    # Vite + React Modern Web Client
│   ├── src/
│   │   ├── services/            # Axios API clients (auth, endpoints)
│   │   ├── styles/              # Global Tailwind CSS styles
│   │   └── utils/               # Formatting and helper utilities
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── index.html                   # Standalone Full-Featured Interactive Portal
├── app.js                       # Interactive portal application logic & charts
├── styles.css                   # Premium glassmorphic stylesheet
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

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
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173

   # Default Admin Credentials
   ADMIN_EMAIL=admin@kashvi.com
   ADMIN_PASSWORD=Admin@2024

   # Optional: Cloudinary & Email Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

4. **Seed Demo Data (Optional but Recommended)**:
   Populate users, attendance, fees, homework, and test records:
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

#### Option A: Standalone Portal (Direct Browser Access)
Simply open the root `index.html` file in any modern web browser or serve it using a local live server:
```bash
# From workspace root
npx serve .
# or double click index.html
```

#### Option B: React + Vite Frontend
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

## 🔑 Demo Credentials

If you populated the database using `npm run seed` (or using default demo logins in the portal):

| Role | Email / Unique ID | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kashvi.com` / `ADMIN-2024-0001` | `Admin@2024` | Full system control & settings |
| **Teacher** | `teacher@kashvi.com` / `TCH-2024-0048` | `Teacher@123` | Class 10-A, 9-B Mathematics |
| **Student** | `student@kashvi.com` / `STU-2024-1284` | `Student@123` | Class 10-A (Aarav Sharma) |
| **Parent** | `parent@kashvi.com` / `PRN-2024-0980` | `Parent@123` | Guardian of Aarav Sharma & Rhea |

---

## 🔌 API Reference Overview

All API endpoints are prefixed with `/api`:

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & retrieve JWT token
- `POST /api/auth/register` - Register new user account
- `GET /api/auth/me` - Get current logged-in user profile
- `PUT /api/auth/update-password` - Change account password

### 👑 Admin (`/api/admin`)
- `GET /api/admin/dashboard` - Get institutional stats and metrics
- `GET /api/admin/users` - List all users (filters: role, class)
- `POST /api/admin/users` - Create student/teacher/parent account
- `DELETE /api/admin/users/:id` - Remove user account

### 👨‍🏫 Teacher (`/api/teacher`)
- `POST /api/teacher/attendance` - Record class attendance batch
- `POST /api/teacher/homework` - Create homework assignment
- `POST /api/teacher/marks` - Upload student test scores
- `POST /api/teacher/announcements` - Publish notice to assigned classes

### 🎒 Student (`/api/student`)
- `GET /api/student/dashboard` - Get student metrics & schedule
- `GET /api/student/attendance` - Get attendance summary & history
- `GET /api/student/homework` - Get homework assignments & submission status
- `GET /api/student/reports` - Get test results & report cards

### 👨‍👩‍👦 Parent (`/api/parent`)
- `GET /api/parent/children` - Get linked student profiles
- `GET /api/parent/child/:id/overview` - Get detailed academic overview of child
- `GET /api/parent/child/:id/fees` - View tuition fee invoice breakdown

---

## 🔒 Security Best Practices
- **Password Hashing**: Salted hashing via `bcryptjs`.
- **JWT Protection**: Bearer tokens with strict expiration.
- **HTTP Header Protection**: Enforced via `helmet`.
- **Input Sanitization**: Request validation via `express-validator`.

---

## 📄 License
This project is licensed under the **ISC License**.
