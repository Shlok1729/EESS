# 🛡️ Eagle Eye Security Services (EESS)

> **Enterprise Security Workforce Management Platform**  
> A scalable, real-time Security Workforce Management platform that transforms traditional security agencies into a fully automated, technology-driven ecosystem.

<p align="center">

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-Voice_API-F22F46?style=for-the-badge&logo=twilio&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)

</p>

---

## 🚀 Overview

EESS is a complete enterprise-grade security workforce management platform featuring:

- 📍 Geo-Fenced Attendance
- 📷 Live Selfie Verification
- 📱 Device Binding
- 🛡 QR-based Patrol Verification
- ⚡ Real-time Monitoring
- 👨‍💼 Admin Dashboard
- 🏢 Client Portal
- 🤖 Autonomous Database Robots
- 📞 Automated Voice Call Escalation
- 🔒 Role-Based Access Control (RBAC)

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Routing | React Router v7 |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase WebSockets (`pg_changes`) |
| Automation | PostgreSQL `pg_cron`, `pg_net` |
| Edge Runtime | Deno Edge Functions |
| Voice Alerts | Twilio Voice API |
| Geo Utilities | geolib |
| QR Scanner | @yudiel/react-qr-scanner |
| QR Generator | qrcode.react |
| Deployment | Vercel |

---

# 🏗 System Architecture

The application consists of **four role-based portals** powered by a centralized PostgreSQL database.

```
                    PostgreSQL (Supabase)

        ┌──────────────┬──────────────┬──────────────┐
        │              │              │              │
     Guard         Admin          Client        Database
    Terminal      Dashboard       Portal        Robots
```

---

# 📱 Guard Terminal (`/guard`)

A zero-trust mobile-first interface designed specifically for field security personnel.

### Features

### 📍 Strict Geo-Fencing

- HTML5 Geolocation API
- Haversine distance calculation (`geolib`)
- Blocks Clock-In outside configured radius

---

### 📷 Live Selfie Verification

Uses

```html
<input capture="user">
```

to force live front-camera capture.

✅ Gallery uploads are blocked to prevent proxy attendance.

---

### 📱 Device Binding

Each device generates a persistent

```
device_id
```

stored in LocalStorage and mapped with active attendance.

This eliminates:

- Buddy Punching
- Multi-device attendance fraud

---

### ⏱ Smart Time Engine

Handles:

- 8 Hour Shifts
- 12 Hour Shifts
- Morning Shift
- Day Shift
- Night Shift

Automatically enforces:

- 30 minute grace window
- Dynamic cooldowns (6 or 10 hours)
- Shift lock/unlock logic

---

### 🔳 Dynamic QR Patrol

Guards scan physical QR checkpoints.

The system validates UUIDs against:

```
checkpoint_assignments
```

before allowing patrol completion.

---

# 🖥 Admin Command Center (`/admin`)

A real-time operations dashboard secured using Supabase Authentication.

### Features

### ⚡ Real-time Monitoring

Live subscriptions on:

- attendance_logs
- patrol_logs

using Supabase Realtime WebSockets.

No page refresh required.

---

### 🔳 QR Code Generator

Generates SVG QR codes directly from PostgreSQL UUIDs.

Supports:

- PNG Download
- Print Mode
- Authorized Guard Name Overlay

---

### 🔄 Assignment Mapping

Hot swap:

- Guards
- Sites
- Checkpoints
- Shift Slots

without downtime.

---

# 🏢 Client Dashboard (`/client/dashboard`)

A secure read-only portal providing complete transparency.

### Features

### 🔒 Email Bound Data Isolation

Queries are scoped using

```sql
WHERE client_email = auth.email()
```

Clients can only access their own assigned sites.

---

### 📈 Live SLA Dashboard

Clients can monitor:

- Live Guard Status
- Attendance History
- Patrol Logs
- Shift Performance

---

# 🤖 Autonomous Database Robots

One of the most powerful parts of the platform.

The backend actively enforces company policy using PostgreSQL extensions.

---

## 1️⃣ Auto Clock-Out Sweeper

Powered by **pg_cron**

Runs every **30 minutes**

Automatically:

- Calculates shift end
- Finds overdue guards
- Updates attendance status

```
auto_clocked_out
```

No manual intervention required.

---

## 2️⃣ Self Cleaning Storage Trigger

Powered by **pg_net**

Whenever a guard clocks out:

1. PostgreSQL Trigger fires
2. REST DELETE request sent
3. Selfie removed from Storage
4. URL cleared from database

Benefits:

- Zero Storage Waste
- Lower Cloud Costs
- Privacy Compliance

---

## 3️⃣ Terminator Protocol

Powered by:

- pg_cron
- pg_net
- Supabase Edge Functions
- Twilio Voice API

Workflow:

```
Guard Misses Patrol
        │
        ▼
pg_cron detects delay
        │
        ▼
HTTP Request
        │
        ▼
Supabase Edge Function
        │
        ▼
Twilio Voice API
        │
        ▼
Robot Voice Calls Guard
```

A robotic voice automatically instructs the guard to immediately complete their patrol.

---

# 📂 Project Structure

```
src/
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── utils/
├── contexts/
├── lib/
└── assets/
```

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js
- npm

---

## Clone Repository

```bash
git clone https://github.com/Shlok1729/EESS.git

cd EESS
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Run Development Server

```bash
npm run dev
```

Open

```
http://localhost:5173
```

---

# 📦 Production Build

Create an optimized production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 🔐 Security Highlights

- Geo-Fenced Attendance
- Device Binding
- Live Selfie Capture
- QR Patrol Verification
- JWT Authentication
- Role-Based Access Control
- PostgreSQL Row Level Security
- Automated Compliance
- Autonomous Database Triggers

---

# ⚙ Database Automation

✔ pg_cron

✔ pg_net

✔ PostgreSQL Triggers

✔ Supabase Edge Functions

✔ Realtime WebSockets

✔ Twilio Voice Escalation

---

# 🌟 Key Features

- 📍 Geo-Fenced Clock-In
- 📷 Live Selfie Attendance
- 📱 Device Binding
- 🔳 QR Patrol Verification
- ⚡ Live Dashboard
- 🏢 Client Portal
- 👨‍💼 Admin Dashboard
- 🤖 Automated Database Robots
- 📞 Voice Call Escalation
- 🔒 Enterprise RBAC
- ☁ Cloud Native Architecture

---

# 📜 License

Copyright © Eagle Eye Security Services.

All Rights Reserved.

---

<p align="center">

**Built with ❤️ using React, Supabase & PostgreSQL**

</p>