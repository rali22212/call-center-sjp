# SJP Call Center Management System 📞

A comprehensive, full-stack management system designed for efficient call center operations. This project features a secure NestJS backend and a high-performance Next.js 14 frontend, built to handle queries, user management, and detailed performance reporting.

## 🚀 Live Demo & Deployment
- **Frontend**: Deployed on **Vercel**
- **Backend**: Deployed on **Render**
- **Database**: Hosted on **Neon.tech** (PostgreSQL)

---

## ✨ Features

### 👨‍💼 For Agents
- **Secure Login**: Role-based authentication using JWT.
- **Query Management**: Create, view, and track queries with unique IDs.
- **Real-time Status Updates**: Mark queries as "In Progress", "Resolved", or "Closed".
- **Validation**: Enforced data integrity (e.g., 13-digit CNIC validation).
- **Remarks**: Add internal notes to keep track of query progress.

### 🛡️ For Administrators
- **Comprehensive Dashboard**: View system-wide stats for users, queries, and categories.
- **User Management**: Create, list, and delete system users (Agents/Admins).
- **Category Hierarchy**: Manage a multi-level category and subcategory system.
- **Performance Reports**: 
    - Real-time status breakdown.
    - User performance tracking.
    - Category-based analytics.
    - **Export**: Download data as CSV or generate PDF Performance Reports.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), Tailwind CSS, TypeScript |
| **Backend** | [NestJS](https://nestjs.com/), Passport.js, JWT |
| **Database** | PostgreSQL with [Prisma ORM](https://www.prisma.io/) |
| **Hosting** | Vercel (Frontend), Render (Backend), Neon (Database) |

---

## 📂 Project Structure

```text
call-center-sjp/
├── frontend/          # Next.js Application
│   ├── app/           # App Router, Pages, and Layouts
│   ├── components/    # Reusable UI components
│   └── config.ts      # API configuration (Local vs. Production)
├── backend/           # NestJS API
│   ├── src/           # Application logic (Auth, Users, Queries, etc.)
│   ├── prisma/        # Database schema and migrations
│   └── .env           # Environment variables (DB URL, JWT Secret)
└── DEPLOYMENT_GUIDE.md # Detailed deployment instructions
```

---

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Cloud instance)

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with your DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma db push
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3001` to view the application.

---

## 📄 Documentation
For detailed guides, please refer to:
- [**Deployment Guide**](./DEPLOYMENT_GUIDE.md): Step-by-step instructions for Render/Vercel.
- [**Deployment Roadmap**](./LEARNER_DEPLOYMENT_ROADMAP.md): Conceptual overview of the production architecture.

---

## 👨‍💻 Development
Developed as part of the **Call Center Management System Training Program**.

---

© 2025 Call Center Internees. All rights reserved.