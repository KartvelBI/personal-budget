# SalesPro — Personal Budget & Invoicing Service

A modern, high-performance web application for controlling income, expenses, deliverables, and automated client invoicing — designed in the **SalesPro Dashboard UI/UX** aesthetic.

🌐 **Live Production Application**: [https://personal-budget-service.vercel.app](https://personal-budget-service.vercel.app)

---

## ✨ Features

- **🌓 Dark & White Theme Modes**: Seamless toggle between crisp light mode and sleek deep-space dark mode with persistent settings.
- **🍔 Expandable / Collapsible Navigation**: Collapsible sidebar with hover tooltips and header hamburger menu toggle.
- **👥 Coagents (Customers Directory)**: Complete customer database with contact info, tax ID, address, currency preferences, and total invoiced statistics.
- **📁 Projects & Milestones**:
  - Exact submission fields: `date`, `coagents`, `Category`, `Transfer date`, `Amount`, `Currency`, and `Note`.
  - **Automated Invoicing Button**: Generate and preview professional invoices with a single click.
- **📄 Invoices & Printable PDF Generator**:
  - Filter by status (`Sent`, `Paid`, `Draft`).
  - Formal invoice modal with SalesPro logo mark, client details, bank transfer instructions (IBAN, SWIFT), and browser print / PDF export.
- **💳 Executive Finances Dashboard**:
  - 4 KPI Stat Cards (Revenue, Orders, Customers, Conversion rate).
  - Interactive Sales Overview spline area chart.
  - Recent Orders table with pill status badges.
  - Top Deliverables and Recent Activity stream.
  - Income & Expense financial ledger with manual transaction modal.
- **📊 Analytics & Reporting**:
  - Monthly cashflow comparisons (Income vs Expenses).
  - Expense category donut distribution.
  - Project scope volume progress bars.
  - 1-click CSV export.
- **⚙️ Options & System Settings**:
  - Dynamic category management with custom color swatches.
  - Multi-currency support (USD, EUR, GBP, GEL, etc.).
  - Business issuer details & banking instructions.
  - JSON backup download and restore.

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** with instant HMR
- **Tailwind CSS v4**
- **Recharts** for visualizations
- **Lucide Icons**
- **Vercel** for continuous deployment

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/KartvelBI/personal-budget.git

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```
