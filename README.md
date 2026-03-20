# 🎮 KVJP_1-SmartOLICT  
### Gamified Learning System for O/L ICT Students

## 📌 Project Overview

**KVJP_1-SmartOLICT** is a full-stack MERN web application designed to provide an engaging and interactive **gamified learning experience** for **Ordinary Level (O/L) ICT students in Sri Lanka**.  
The platform enhances student motivation and learning outcomes through **interactive lessons, quizzes, progress tracking, leaderboards, and gamification elements**, while supporting **multiple user roles** with secure authentication and role-based access control.

This project demonstrates practical implementation of **modern web technologies**, **secure API design**, and **gamification principles** in educational software.

---
## 👥 Project Team

**Group Name:** KVJP_1  
**Course:** EEY4189 – Software Design in Group  
**Institution:** Open University of Sri Lanka  

**Team Members:**
- G.D.L. Madhumini (523598053) 
- H.M.H. Malshini (523598893)
- A.P.S.S. Fernando (523607238)
- S.D.D.N. Sudasingha (623599072)
- S.P.R.L. Fonseka (721450758)

------

## 🧠 Key Features

### 🔐 User Authentication & Authorization
- User registration and login
- JWT-based authentication
- Google OAuth integration using Passport.js
- Role-based access control (Admin > Teacher > Student)
- Secure password hashing with bcrypt
- Special registration flow for teachers and admins
- Protected routes using middleware

---

### 📚 Content Management
- Create, edit, delete, and restore lessons and quizzes
- Grade-specific lessons for **Grades 10 and 11**
- Video-based lesson content with dynamic rendering
- Question management for quizzes
- Soft delete functionality for content recovery

---

### 🧩 Gamification & Engagement
- Leaderboards and rankings
- Gamification points and badges
- Progress tracking and performance reports
- Multiple quiz attempts with instant feedback
- Notifications for achievements and updates

---

### 📊 Admin Dashboard
- User management (students, teachers, admins)
- Content moderation and logs
- Feedback and notification management
- Analytics and reports (login logs, activity logs)

---

### 🛡️ Security & Logging
- JWT authentication for APIs
- Secure session handling
- Comprehensive logging for:
  - User activity
  - Content changes
  - Login attempts
- CORS protection and environment-based configuration

---

## 🏗️ Architecture

### Frontend – **Smart_O/L_ICT**
- Single Page Application (SPA)
- Handles authentication, dashboards, lessons, quizzes, and admin panels

### Backend – **Server**
- Express.js REST API
- Handles business logic, authentication, database operations, and file uploads

### Database
- MongoDB (MongoDB Atlas)
- Structured schema with multiple related models

### File Storage
- Local uploads directory for video content
- Static file serving via Express

---

## 🧰 Technologies Used

### Frontend
- React (v19.1.1)
- Vite
- React Router
- Axios
- Bootstrap
- Lucide React

### Backend
- Node.js
- Express.js (v5.2.1)
- JWT (jsonwebtoken)
- Passport.js (Google OAuth)
- bcrypt
- Express Session
- Multer
- CORS

### Database
- MongoDB
- Mongoose

### Development Tools
- Git & GitHub
- ESLint
- Nodemon
- dotenv

---

## 🗄️ Database Models

- User  
- Student  
- Teacher  
- Admin  
- Lesson  
- Quiz  
- Question  
- QuizAttempt  
- ProgressReport  
- Leaderboard  
- GamificationPoints  
- Notification  
- Feedback  
- InstantMessage  
- ContentLog  
- LoginLog  
- VideoFile  

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account
- Git
