<div align="center">

# 🌾 AgroMED Connect — Admin Dashboard

**A Platform & Financial Management Dashboard for the AgroMED Connect Marketplace**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-2A9D8F?style=for-the-badge)](https://yusuf-siyam.github.io/Agromed-Admin/)
[![React](https://img.shields.io/badge/React-18-264653?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-F4A261?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-2A9D8F?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

[Live Site](https://yusuf-siyam.github.io/Agromed-Admin/) · [Report Bug](https://github.com/Yusuf-Siyam/Agromed-Admin/issues) · [Request Feature](https://github.com/Yusuf-Siyam/Agromed-Admin/issues)

</div>

---

## 📖 About The Project

**AgroMED Connect** is a third-party platform that connects **Farmers**, **Agro Companies**, and **Service Providers** in a unified marketplace. Verified agro companies manage their own products, inventory, orders, and services independently — while AgroMED Connect focuses on **verification, financial oversight, and platform performance monitoring**.

This repository contains the **Admin Dashboard frontend** — the control center where platform administrators can:

- ✅ Verify and monitor agro companies
- 💰 Track platform-wide sales, revenue, and commission
- 🧾 Manage billing, settlement, discounts, and expenses
- 📊 Analyze company performance and platform-wide trends
- 🔔 Manage notifications, reviews, and services visibility

> **Note:** The admin **monitors** company-side business — it does **not** operate product catalogs, inventory, or order fulfillment. Those remain the responsibility of each verified company.

---

## 🚀 Live Demo

🔗 **[https://yusuf-siyam.github.io/Agromed-Admin/](https://yusuf-siyam.github.io/Agromed-Admin/)**

---

## ✨ Features

| Module | Description |
|---|---|
| **Dashboard** | At-a-glance view of total sales, platform revenue, commission, expenses, net profit, and company performance |
| **Company Management** | View, verify, approve/reject, suspend, and monitor agro companies with full sales/commission/billing profiles |
| **Company Performance** | Ranked comparison of companies by sales, growth %, and platform contribution |
| **Stakeholders** | Monitor Farmers and Service Providers on the platform |
| **Financial Suite** | Sales, Revenue, Commission Management, Billing & Settlement, Expenses, and Discounts (company-funded vs platform-funded) |
| **Analytics** | Platform-wide analytics and company-wise analytics with interactive charts |
| **Reports** | Generate Sales, Company, Revenue, Commission, and Settlement reports |
| **Services & Reviews** | Monitor platform services and manage customer reviews |
| **Notifications** | Send broadcasts and manage system alerts |
| **Authentication** | Secure admin login, password recovery, and session handling |

---

## 🛠️ Tech Stack

- **Framework:** [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Routing:** [React Router](https://reactrouter.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Build Tool:** [Vite](https://vitejs.dev)
- **Deployment:** GitHub Pages (`gh-pages`)

---

## 📁 Project Structure

```
agromed-admin/
├── frontend/                 # Admin Dashboard source code
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui primitives
│   │   │   └── shared/       # Reusable app components
│   │   ├── features/         # Feature-based modules (companies, financial, analytics, etc.)
│   │   ├── layouts/          # App shell (sidebar, navbar, layout)
│   │   ├── routes/           # Route definitions
│   │   ├── types/            # TypeScript interfaces
│   │   ├── mock-data/        # Mock/dummy data
│   │   ├── lib/               # Utilities/helpers
│   │   └── hooks/             # Custom React hooks
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── backend/                  # Reserved for backend integration (handled separately)
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Yusuf-Siyam/Agromed-Admin.git

# Navigate to the frontend directory
cd Agromed-Admin/frontend

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

---

## 🎨 Design System

| Token | Color |
|---|---|
| Primary | `#264653` |
| Secondary | `#F4A261` |
| Accent / Background | `#FDFCF9` |
| Info | `#2A9D8F` |

Design language inspired by modern SaaS products like Stripe, Linear, Vercel, Clerk, and Supabase — minimal, professional, and enterprise-ready.

---

## 🗺️ Roadmap

- [x] Project setup & design system
- [x] Authentication module
- [x] Dashboard home
- [x] Company management & verification
- [ ] Financial suite (Sales, Revenue, Commission, Billing, Expenses, Discounts)
- [ ] Analytics module
- [ ] Backend API integration

---

## 🤝 Contributing

This project is part of a Final Year Design Project (FYDP). Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Yusuf Siyam**

- GitHub: [@Yusuf-Siyam](https://github.com/Yusuf-Siyam)

---

<div align="center">
Made with 🌱 for AgroMED Connect
</div>
