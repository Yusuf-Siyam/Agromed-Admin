# AgroMED Connect — Admin Dashboard Build Prompts

**How to use:** Paste PROMPT 0 first (sets context/rules once). Then paste PROMPT 1, wait for it to finish, verify, then PROMPT 2, and so on — one at a time, in order. Each prompt is self-contained for its own module and ends with an explicit stop instruction so the AI won't jump ahead.

---

## PROMPT 0 — Context & Rules (send this once, first)

```
ROLE
Act as a Senior Frontend Architect + Senior React Developer + Senior Product Designer with 15+ years building enterprise SaaS dashboards. Think before generating code. Never generate unnecessary code. Never rewrite existing files unless explicitly asked. Build modular, reusable, type-safe components only.

PROJECT
Name: AgroMED Connect
Scope: Admin Dashboard frontend ONLY.
Do NOT build: landing page, farmer panel, buyer panel, agro company panel, backend, mobile app — another team owns those.

TECH STACK
React, TypeScript, Tailwind CSS, shadcn/ui, React Router, Lucide React icons.
Feature-based folder structure. Lazy-loaded routes. Fully responsive. Use mock/dummy data only (no backend yet).

DESIGN SYSTEM
Primary: #264653
Secondary: #F4A261
Accent/Background: #FDFCF9
Info: #2A9D8F
Style: modern minimal enterprise SaaS (Stripe / Linear / Vercel / Clerk / Supabase inspired). Rounded cards, soft shadows, clean spacing, smooth transitions. No Bootstrap-style admin UI.

GLOBAL RULES
- Business logic separate from UI.
- TypeScript interfaces for all data models.
- Tailwind utility classes only, no inline styles.
- Every list/data page needs: breadcrumb, page title, action button, search, filter, table/cards, pagination, loading state, empty state, error state, confirmation dialog, success toast.
- Reuse components — never duplicate UI.
- Use shadcn/ui components + Lucide icons everywhere.

WORKFLOW RULE
Do not build the whole project at once. I will send one prompt per module/feature. Complete ONLY what is asked in each prompt, make it fully functional, then STOP and wait for my next prompt. Do not build ahead. Do not modify previously built files unless I explicitly ask.

Acknowledge you understood this context, then wait for PROMPT 1.
```

---

## PROMPT 1 — Project Setup & Folder Structure

```
Set up the base project structure for AgroMED Connect Admin Dashboard using the stack and rules already established.

Build:
- Tailwind config with the defined color tokens (primary, secondary, accent, info) as reusable theme variables.
- Install/configure shadcn/ui base setup.
- Feature-based folder structure: /components/ui, /components/shared, /features/<module>, /layouts, /routes, /types, /mock-data, /lib, /hooks.
- React Router setup with a placeholder route list (routes as empty stubs) for all modules: auth, dashboard, companies, farmers, buyers, products, categories, orders, services, payments, sales, revenue, reports, notifications, reviews, settings, profile.
- Base TypeScript interfaces file structure (empty/skeleton per module, to be filled later).

Do not build any actual page UI yet. Complete this setup fully, then stop and wait for PROMPT 2.
```

---

## PROMPT 2 — Shared Reusable Components

```
Build the shared reusable UI components used across the entire dashboard (module UIs will consume these later — do not build any module pages yet):

- PageHeader (breadcrumb + title + primary action button slot)
- DataTable (search, column sort, filter dropdown slot, pagination, empty state, loading skeleton)
- StatCard (icon, label, value, trend indicator)
- ConfirmDialog (used for delete/suspend/activate/reject actions)
- LoadingState, EmptyState, ErrorState components
- Toast notification setup (success/error)
- StatusBadge (for order/company/payment statuses, color-coded)

All must use shadcn/ui + Lucide icons + the established color tokens, be fully typed, and be generic/reusable (props-driven, no hardcoded module data).

Complete this fully, then stop and wait for PROMPT 3.
```

---

## PROMPT 3 — App Shell (Sidebar + Navbar + Layout)

```
Build the main dashboard shell.

Sidebar (collapsible, active-state highlighting):
- Dashboard
- Management: Companies, Farmers, Buyers, Products, Categories, Orders, Services, Payments
- Analytics: Sales, Revenue, Reports
- Communication: Notifications, Reviews
- System: Settings, Profile, Logout

Navbar:
- Search bar
- Notifications icon (with badge)
- Messages icon
- Theme toggle (optional)
- Admin profile dropdown (Profile, Settings, Logout)

Layout:
- Responsive layout wrapper combining sidebar + navbar + content outlet
- Mobile: sidebar becomes a drawer/overlay
- Wire this layout into the router from PROMPT 1 as the parent layout for all authenticated routes.

Use only shared components from PROMPT 2 where applicable. Complete fully, then stop and wait for PROMPT 4.
```

---

## PROMPT 4 — Authentication Pages

```
Build the authentication module (public routes, outside the main shell):

Pages:
- Admin Login (email, password, remember me, show/hide password toggle, login button)
- Forgot Password
- Reset Password
- Session Expired screen
- Unauthorized screen

Validation & states:
- Required field validation, email format check, minimum password length
- Loading state on submit
- Inline error messages
- Success state/redirect behavior (mock only, no real API)

Fully responsive, matches established design system. Complete fully, then stop and wait for PROMPT 5.
```

---

## PROMPT 5 — Dashboard Home Page

```
Build the Dashboard home page (main landing page after login, inside the app shell).

Widgets (StatCard grid): Total Revenue, Platform Revenue, Total Orders, Completed Orders, Pending Orders, Cancelled Orders, Total Farmers, Total Buyers, Total Agro Companies, Total Products, Total Services, Low Stock Products.

Charts (mock data): Monthly Sales, Revenue Analytics, Orders Overview, Company Sales, Top Selling Medicines.

Tables: Recent Orders, Recent Payments, Recent Activities.

Quick Actions bar: Add Company, Add Product, Add Category, Send Notification (buttons only, can trigger placeholder dialogs).

Use StatCard/DataTable from PROMPT 2. Include loading and empty states. Complete fully, then stop and wait for PROMPT 6.
```

---

## PROMPT 6 — Client (Agro Company) Management

```
Build the Company Management module.

List page: search, filter, sort, pagination, table of companies with quick actions (verify, reject, suspend, activate, delete — each via ConfirmDialog).

Company Details page: Company Info, Contact Details, Verification Status, Total Products, Total Orders, Total Sales, Monthly Revenue, Customer Rating, Joined Date, plus tabs/sections for Products, Orders, Sales, Services.

Use shared DataTable, StatusBadge, ConfirmDialog, PageHeader from PROMPT 2. Mock data with realistic sample companies. Complete fully, then stop and wait for PROMPT 7.
```

---

## PROMPT 7 — Farmer Management

```
Build the Farmer Management module: list page (search, filter, pagination, suspend/activate/delete actions via ConfirmDialog) and a Farmer Details view showing profile info + Purchase History table.

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 8.
```

---

## PROMPT 8 — Buyer Management

```
Build the Buyer Management module: list page (search, filter, pagination, suspend/activate/delete actions via ConfirmDialog) and a Buyer Details view showing profile info + Orders table.

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 9.
```

---

## PROMPT 9 — Product Management

```
Build the Product Management module:

- Product List page: search, filter, sort, pagination, stock status badges, low stock alert indicator
- Add Product / Edit Product forms (validated)
- Product Details page
- Categories management (list, add, edit, delete)
- Inventory view with stock status overview

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 10.
```

---

## PROMPT 10 — Order Management

```
Build the Order Management module.

All Orders list with tabs/filters for: Pending, Processing, Shipped, Delivered, Cancelled, Refunded.

Order Details view showing: Customer, Company, Product, Quantity, Payment Status, Delivery Status, and a status Timeline component.

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 11.
```

---

## PROMPT 11 — Service Management

```
Build the Service Management module: view service requests (list + filters), assign company action, update status action, track progress view, and a Completed Services list.

Reuse shared components (ConfirmDialog for assign/update actions). Mock data. Complete fully, then stop and wait for PROMPT 12.
```

---

## PROMPT 12 — Payment Management

```
Build the Payment Management module: Payment History table (filter by method: SSLCommerz / Cash on Delivery), Refund Requests list with approve/reject actions, and a Revenue Overview summary section (StatCards + simple chart).

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 13.
```

---

## PROMPT 13 — Sales Analytics

```
Build the Sales Analytics module with two sections:

Platform Analytics: Daily / Weekly / Monthly / Yearly sales views (line + bar charts, date range toggle).

Company Analytics: Sales by Company, Revenue by Company, Top Companies, Lowest Performing Companies (bar chart + ranked table).

Include a pie chart for category/segment breakdown. Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 14.
```

---

## PROMPT 14 — Reviews

```
Build the Reviews module: reviews list (filter/search), delete review action, report review action (both via ConfirmDialog), and a Rating Statistics summary (StatCards + rating distribution chart).

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 15.
```

---

## PROMPT 15 — Notifications

```
Build the Notifications module: Send Notification form (target audience selector, message, send button), Broadcast history list, and System Alerts list.

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 16.
```

---

## PROMPT 16 — Reports

```
Build the Reports module: a Reports hub page listing available report types — Sales Report, Company Report, Revenue Report, Product Report, User Report — each with a generate/preview UI (filter by date range, export button UI only, no real file generation needed).

Reuse shared components. Mock data. Complete fully, then stop and wait for PROMPT 17.
```

---

## PROMPT 17 — Settings & Profile

```
Build the Settings module: General Settings, Platform Settings, Profile Settings, Change Password form, Theme Settings — organized as tabs or a settings sidebar within the page.

Reuse shared components with proper form validation and success toasts. Mock data/local state only. Complete fully.

This is the final module — after this, do a full pass and list any inconsistent components, unused mock data, or missing empty/loading/error states across all modules so far.
```
