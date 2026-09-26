# PipWise — Forex Review & Broker Comparison Platform

PipWise is a premier, full-stack Forex broker review, comparison, and trader analytics platform. Built with modern React 19 on the frontend and an Express & MongoDB backend with OTP authentication and administrative controls.

## 🏛️ Monorepo Structure

The project is organized as a clean, decoupled monorepo:

```
pip-wise/
├── frontend/                  # React 19 + Vite 8 Single Page Application
│   ├── src/
│   │   ├── app/               # Store, routing, and app root
│   │   ├── features/          # Feature-based modular architecture (auth, brokers, admin)
│   │   ├── pages/             # Route views (Home, Compare, All Brokers, Admin)
│   │   └── index.css          # Design system, glassmorphism, and animations
│   ├── public/                # Static assets, fonts, icons, sitemap, robots.txt
│   └── package.json           # Frontend dependencies and Vite configuration
│
├── backend/                   # Express 5 + MongoDB REST API Service
│   ├── src/
│   │   ├── config/            # DB and environment configuration
│   │   ├── controllers/       # Auth, broker, admin, and testimonial handlers
│   │   ├── middlewares/       # JWT auth, rate-limiting, error handling, validation
│   │   ├── models/            # Mongoose schemas (User, Broker, Testimonial, OTP)
│   └── routes/            # REST API endpoints
├── package.json           # Backend dependencies and server scripts
│
├── package.json               # Root monorepo orchestration scripts
└── README.md                  # Project overview and setup guide
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)

### 1. Install All Dependencies
Run from the root directory to install packages for both frontend and backend:
```bash
npm run install:all
```

### 2. Environment Setup

#### Backend Configuration
Create a `.env` file in the `backend/` directory:
```bash
touch backend/.env
```
And add your environment configuration:
- `MONGO_URI`: Your MongoDB database connection string
- `JWT_SECRET`: A secure random string for JWT authentication
- `SMTP_USER` / `SMTP_PASSWORD`: Hostinger SMTP credentials for OTP emails

### 3. Running Locally

You can run both frontend and backend independently or from root:

#### Run Frontend (Vite Dev Server)
```bash
npm run dev:frontend
# or cd frontend && npm run dev
```
Accessible at: `http://localhost:5173`

#### Run Backend (Express API Server)
```bash
npm run dev:backend
# or cd backend && npm run dev
```
Accessible at: `http://localhost:5001`

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite 8
- **State Management**: Redux Toolkit
- **Animation & Motion**: Framer Motion & CSS hardware-accelerated transforms
- **Smooth Scrolling**: Lenis
- **Styling**: Vanilla CSS, Modern CSS Tokens, Glassmorphism, Responsive Dark Theme
- **SEO**: Dynamic SEO Head, OpenGraph, Sitemap, Robots.txt

### Backend
- **Runtime**: Node.js & Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcryptjs password hashing, email OTP verification
- **Security**: Helmet, CORS origin validation, Rate Limiting, HTTP-only secure cookies
- **Email Delivery**: Nodemailer with Hostinger SMTP

---

## 🚢 Deployment Guide

Because frontend and backend are cleanly separated into their own folders:
- **Frontend**: Deploy effortlessly to [Vercel](https://vercel.com/) or [Cloudflare Pages](https://pages.cloudflare.com/) by setting the **Root Directory** to `frontend`.
- **Backend**: Deploy to [Render](https://render.com/), [Railway](https://railway.app/), or any Node.js hosting by setting the **Root Directory** to `backend`.

- Production deployment setup
