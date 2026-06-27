# Collaborative Task Manager

A modern, full-stack task management application with user authentication, role-based access control (RBAC), and real-time updates. This system allows managers to oversee projects and users to focus on their assigned tasks.

## 🌟 Key Features

### 🏢 Core Functionality
- **User Authentication**: Secure JWT-based signup and login.
- **RBAC (Role-Based Access Control)**:
  - **Manager**: Complete control. Can create, assign, edit, and delete tasks.
  - **User**: Focused access. Can view and update the status of tasks specifically assigned to them.
- **Task Management**: Structured CRUD operations with priority and due date tracking.
- **Activity Logging**: Automatic auditing of all task changes for transparency.
- **Real-time Synchronization**: Live updates powered by Socket.io (no refresh needed!).

### 🎨 Visual & UX
- **Kanban Board**: Drag-and-drop interface for visual status management.
- **Dark Mode**: Premium dark/light themes for comfortable usage.
- **Responsive Design**: Fully mobile-friendly UI built with Tailwind CSS.
- **Smart Filtering**: Filter by status or priority with efficient pagination.

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Axios, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, Socket.io.
- **Security**: JWT (JSON Web Tokens), bcryptjs (hashing), express-rate-limit.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v16+) and **npm**.
- **MongoDB Atlas** account (Free tier is perfect).

### 2. Database Configuration (MongoDB Atlas)
1.  Create a cluster and a database user (save the password!).
2.  In **Network Access**, whitelist `0.0.0.0/0` (Allow all) for development.
3.  Copy your connection string and replace `<password>` with your real password.

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` and paste your `MONGODB_URI`. Then start:
```bash
npm run dev
```
*Server runs on `http://localhost:5000`*

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
*App runs on `http://localhost:3000`*

---

## 📝 Usage & Roles

### 👑 Managers
- Click **"New Task"** to create a project.
- **Assign To**: Choose a user from the dropdown (populated automatically from signed-up users).
- **Control**: Use the "Eye" icon to edit or delete any task.
- **Monitor**: Switch to **Kanban Board** to see team progress visually.

### 👥 Users
- View only the tasks assigned to you on the dashboard.
- **Update Status**: Use the dropdown or **Drag & Drop** tasks in Kanban view to mark them as `In Progress` or `Completed`.

---

## 🛡️ Security & Performance
- **Rate Limiting**: Users are limited to **50 requests per minute** to prevent API abuse.
- **Role Isolation**: Users cannot view or modify tasks they are not assigned to.
- **Data Integrity**: Uses MongoDB transactions/Mongoose to ensure data consistency.

## 📜 License
ISC License. Built for performance and collaboration.
