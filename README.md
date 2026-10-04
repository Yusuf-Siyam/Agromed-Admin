<div align="center">

# 🌾 AgroMED Connect — Admin Dashboard

**A Platform & Financial Management Dashboard for the AgroMED Connect Marketplace**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-2A9D8F?style=for-the-badge)](https://yusuf-siyam.github.io/Agromed-Admin/)
[![React](https://img.shields.io/badge/React-18-264653?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-F4A261?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-2A9D8F?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

[Live Site](https://yusuf-siyam.github.io/Agromed-Admin/) ·
[Report Bug](https://github.com/Yusuf-Siyam/Agromed-Admin/issues) ·
[Request Feature](https://github.com/Yusuf-Siyam/Agromed-Admin/issues)

</div>

---

## 📖 About The Project

**AgroMED Connect** is a third-party agricultural platform connecting **Farmers, Agro Companies, and Service Providers** through a unified marketplace.

Verified companies manage their own products, inventory, orders, sales, and services. The Admin Dashboard focuses on **company verification, financial oversight, platform monitoring, analytics, and administration**.

> **Note:** The admin monitors company activities but does not directly manage company inventory or daily order fulfillment.

---

## ✨ Features

| Module                | Description                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| **Dashboard**         | Platform sales, revenue, commission, expenses, profit, and performance overview |
| **Companies**         | Company management, verification, documents, status, and performance            |
| **Stakeholders**      | Farmers and Service Providers monitoring                                        |
| **Sales**             | Sales and transaction monitoring                                                |
| **Revenue**           | Platform revenue tracking                                                       |
| **Commission**        | Commission rate and earnings management                                         |
| **Billing**           | Company billing and settlement                                                  |
| **Discounts**         | Company-funded and platform-funded discounts                                    |
| **Expenses**          | Platform expenses, taxes, and fees                                              |
| **Analytics**         | Platform and company analytics                                                  |
| **Reports**           | Sales, revenue, commission, company, and settlement reports                     |
| **Services**          | Service monitoring                                                              |
| **Products & Orders** | Platform-level monitoring                                                       |
| **Reviews**           | Review monitoring and management                                                |
| **Notifications**     | System notifications and alerts                                                 |
| **Settings**          | Platform and administrative settings                                            |
| **Authentication**    | Login, password recovery, reset, and protected routes                           |

---

## 💰 Financial Overview

The dashboard keeps the main financial concepts separate:

```text
Total Sales / GMV
        ↓
   Commission
        ↓
Platform Revenue
        ↓
Platform Expenses
        ↓
   Net Profit

Expenses may include tax, payment gateway fees, marketing, operating costs, refunds, and platform-funded discounts.
🛠️ Tech Stack
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide React
- Vite
- GitHub Pages
📁 Project Structure
agromed-admin/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── lib/
│   │   └── routes/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md

The application follows a feature-based architecture with reusable shared components and API utilities.
⚙️ Getting Started
Prerequisites
- Node.js v18+
- npm
Installation
git clone https://github.com/Yusuf-Siyam/Agromed-Admin.git
cd Agromed-Admin/frontend
npm install

Development
npm run dev

Open:
http://localhost:5173

Production Build
npm run build

🌐 Deployment
The application is deployed using GitHub Pages.
- Branch: gh-pages
- Base Path: /Agromed-Admin/
🔗 Live: https://yusuf-siyam.github.io/Agromed-Admin/
🎨 Design System
Token	Color
Primary	#004B23
Secondary	#6A994E
Accent	#A7C957
Background	#F2E8CF
Info / Status	#6A994E
White	#FFFFFF


The interface follows a modern, minimal, responsive, agriculture-inspired SaaS design.
🗺️ Project Status
Completed
- [x] Project setup
- [x] Authentication
- [x] Dashboard
- [x] Company Management & Verification
- [x] Company Performance
- [x] Sales & Revenue
- [x] Commission
- [x] Billing & Settlement
- [x] Discounts
- [x] Expenses
- [x] Analytics
- [x] Reports
- [x] Services
- [x] Reviews
- [x] Notifications
- [x] Products & Orders Monitoring
- [x] Categories
- [x] Settings
- [x] GitHub Pages Deployment
Future
- [ ] Production Backend API Integration
- [ ] Database Integration
- [ ] Advanced Role-Based Access Control
- [ ] Real-Time Financial Updates
- [ ] Advanced Reports & Export
- [ ] Production Monitoring & Logging
🔄 Development
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/feature-name

# Commit changes
git add .
git commit -m "feat: describe the change"

# Push branch
git push origin feature/feature-name

Keep changes focused on the assigned module and reuse existing shared components.
🤝 Contributing
This project is part of a Final Year Design Project (FYDP).
Contributions, issues, and feature requests are welcome within the project team.
📄 License
Distributed under the MIT License. See LICENSE for more information.
👤 Author
Md. Yusuf Siyam
GitHub: @Yusuf-Siyam
<div align="center">

Made with 🌱 for AgroMED Connect
</div>
```
