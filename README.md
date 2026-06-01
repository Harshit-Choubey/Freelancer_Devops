# 🚀 GigMatrix: Cloud-Native DevSecOps Capstone

A scalable, real-time freelance marketplace platform engineered to unify project discovery, collaboration, and execution into a single seamless ecosystem. **This repository represents the cloud-native, DevSecOps evolution of the platform.**

---

## 🧠 Problem Statement
Freelancing platforms often suffer from fragmented workflows — users rely on multiple tools for communication, project tracking, and collaboration. This leads to inefficiency, poor visibility, and delayed execution.

GigMatrix addresses this by delivering a unified, real-time system that integrates job management, communication, and user interaction into a single optimized platform. 

## 🔄 Project Evolution & Repository Strategy

GigMatrix has evolved through two major phases, split across two repositories to cleanly separate application development from infrastructure engineering.

### Phase 1 — Full Stack Marketplace Development
**Repository:** [GigMatrix (Core Application)](https://github.com/Harshit-Choubey/GigMatrix)

**Focus Areas:**
- Initial full-stack development
- User Authentication & Role-Based Access Control
- Freelancer & Client Workflows
- Job Marketplace
- Real-Time Messaging via WebSockets
- Profile Management
- Core Business Logic Development

### Phase 2 — Cloud-Native DevSecOps Transformation (Current)
**Repository:** [Freelancer_Devops (Official DevOps Repository)](https://github.com/Harshit-Choubey/Freelancer_Devops)

**Focus Areas:**
- Enterprise Architecture Refactoring
- Dockerization & Local Orchestration (Docker Compose)
- NGINX Reverse Proxy
- Monitoring & Observability (Prometheus, Grafana, cAdvisor)
- DevSecOps Tooling (SonarQube, Trivy)
- CI/CD Automation (Jenkins)
- Kubernetes Deployment Readiness
- Infrastructure as Code (Terraform)
- GitOps Practices (ArgoCD)

> **Note:** The `Freelancer_Devops` repository serves as the primary capstone repository and the authoritative source of truth for all cloud-native development.

---

## 🎯 What Makes GigMatrix Different?
- **Real-time communication** using WebSockets (no refresh needed)
- **Modular backend architecture** for scalability
- **Production-level authentication** & security practices
- **Clean separation of concerns** (controllers, services, routes)
- **Modern UI** with performance-focused frontend design
- **Cloud-Native Infrastructure** designed for enterprise resilience

---

## ✨ Core Features
### 🔐 Authentication & Security
- JWT-based authentication with secure token lifecycle
- OTP-based email verification via SMTP
- Role-based access control (Client / Freelancer)
- Secure password hashing (bcrypt)
- CSP, XSS & input validation safeguards

### 💼 Job & Workflow Management
- Full CRUD operations for job lifecycle
- Intelligent search & filtering system
- Application workflow with status transitions
- Budget and deadline tracking

### 💬 Real-Time Communication
- WebSocket-powered messaging (Socket.IO)
- Job-specific communication channels
- Persistent chat storage (MongoDB)
- Instant message delivery & typing indicators

### 👤 User Profiles
- Dynamic profile management
- Skill tagging system for freelancers
- Profile image upload & storage

### 🎨 UI/UX Engineering
- Responsive design across devices
- Glassmorphism-based modern UI
- Optimized typography & layout
- Smooth transitions and animations

---

## 🏗️ System Architecture
GigMatrix follows a layered architecture pattern:
- **Controller Layer** → Handles request/response cycle
- **Service Layer** → Business logic abstraction
- **Route Layer** → API endpoint definitions
- **Database Layer** → Managed via Prisma ORM
- **Infrastructure Layer** → Docker, NGINX, and Kubernetes automation

### Design Principles
- Separation of concerns
- Scalability-first structure
- Maintainable codebase
- Efficient data flow

---

## 🛠️ Tech Stack

### DevOps & Cloud-Native Infrastructure
- **Containerization & Orchestration:** Docker, Docker Compose, Kubernetes, Helm
- **Reverse Proxy & Routing:** NGINX
- **CI/CD Automation:** Jenkins, GitHub Webhooks
- **GitOps:** ArgoCD
- **Infrastructure as Code:** Terraform, AWS
- **Monitoring & Observability:** Prometheus, Grafana, cAdvisor
- **DevSecOps & Code Quality:** SonarQube, Trivy

### Backend
- **Node.js** — Runtime environment
- **Express.js** — REST API framework
- **Prisma ORM** — Database abstraction layer
- **MongoDB Atlas / Docker Mongo** — Database
- **Socket.IO** — Real-time communication
- **JWT & bcrypt** — Authentication & security
- **Nodemailer** — Email service

### Frontend
- **Vanilla JavaScript** — Lightweight & performant
- **Modern CSS** — Glassmorphism UI
- **Socket.IO Client** — Real-time updates
- **Font Awesome** — Icons

---

## ⚡ Engineering Highlights
- Reduced redundant API calls through structured request handling
- Efficient WebSocket implementation for real-time UX
- Modular service layer for maintainability
- Clean folder structure aligned with industry practices
- Fully decoupled infrastructure setup for continuous delivery

---

## ⚙️ Setup & Installation

> **Note:** The original GigMatrix repository contains the initial application development history. The Freelancer_Devops repository contains the enterprise DevOps transformation and serves as the official capstone repository.

```bash
# Clone the official DevOps repository
git clone https://github.com/Harshit-Choubey/Freelancer_Devops.git
cd Freelancer_Devops

# Start the cloud-native infrastructure (Docker Compose)
docker compose up -d --build
```
*(The platform will be available at `http://localhost:8080`)*

---

## 🚀 Future Enhancements
- 💳 Payment gateway integration
- 🤖 AI-based job recommendations
- 🔔 Notification system
- 📊 Advanced analytics dashboard

---

## 👨‍💻 Author
Harshit Choubey

⭐ **Final Note:** This project demonstrates real-world full-stack engineering practices, focusing on scalability, real-time systems, and clean architecture — going beyond traditional CRUD-based applications and culminating in an enterprise-grade cloud-native platform.
