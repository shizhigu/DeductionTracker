# DeductionTracker (DeduX)

> Expense tracking and tax deduction management for freelancers -- capture receipts, classify expenses, and maximize tax savings at filing time.

## What is this?

DeductionTracker is a full-stack expense management platform with dual Web (Next.js) and Mobile (React/Vite) clients sharing a common component library, backed by a unified Express API and PostgreSQL on Neon. It helps freelancers and small-business owners distinguish business from personal expenses, model partial deductibility percentages, track estimated tax savings in real time, and generate exportable reports for their accountant.

## Why?

I was frustrated that existing tools fall into two extremes: enterprise expense platforms (SAP Concur, Expensify) designed for corporate reimbursement workflows, or consumer budgeting apps (Mint, YNAB) that do not model the business/personal distinction or partial deductibility that freelancers need. I built DeduX to fill the gap with a lightweight, purpose-built tool that works on both desktop and mobile.

## How it works

The architecture has four layers connected by a shared schema:

1. **Web Dashboard (Next.js App Router)** -- data-dense dashboard with interactive charts (Recharts + Chart.js), KPI cards, category breakdowns, and a quick-add floating action button for expenses and receipt scans
2. **Mobile Client (React + Vite + Wouter)** -- mobile-first SPA with bottom-tab navigation, horizontally scrollable stat cards, and a receipt capture flow that activates the device camera via native HTML file input
3. **Shared Component Library** -- `AppLayout`, `Sidebar`, `MobileNav`, `Logo`, and `UserProfile` components imported by both clients, with an `isMobileOverride` prop to force mobile layout on the Vite client
4. **Express API Server** -- RESTful endpoints for CRUD operations plus four summary/analytics endpoints (today's total, monthly deductible, tax savings, category breakdown)
5. **PostgreSQL (Neon)** -- four tables (`users`, `categories`, `expenses`, `reports`) managed by Drizzle ORM with Zod validation via `drizzle-zod`

Tax savings are computed server-side: `SUM(amount * deductible_percentage / 100 * tax_rate)` in a single SQL query, supporting partial deductions (e.g., a car used 75% for business).

## Key Technical Highlights

- **Shared component architecture**: A single `shared/` directory provides the responsive layout shell, navigation, and branding to both the Next.js and Vite clients -- the `AppLayout` auto-switches between sidebar and bottom-tab layouts based on device detection or an explicit override prop.
- **Storage abstraction**: An `IStorage` interface with `MemStorage` (in-memory) and `DatabaseStorage` (PostgreSQL) implementations lets you prototype the full UI without a database, then switch to production storage in one line.
- **Native receipt capture**: After iterating through `getUserMedia` failures on iOS Safari, the receipt flow uses `<input capture="environment">` to delegate camera access to the OS -- dramatically more reliable and zero permissions prompting.

## Tech Stack

| Layer | Technology |
|---|---|
| Web Client | Next.js 15 (App Router) |
| Mobile Client | React 18 + Vite 5 + Wouter |
| API Server | Express 4 |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM + drizzle-zod |
| State (Web) | Zustand 5 |
| State (Mobile) | TanStack React Query 5 |
| UI | shadcn/ui + Radix UI + MUI 7 |
| Charts | Recharts + Chart.js 4 |
| Styling | Tailwind CSS 3 + Framer Motion |
| Forms | React Hook Form + Zod |
| Build | Vite + esbuild |
| Language | TypeScript 5.6 |

## Quick Start

```bash
git clone https://github.com/shizhigu/DeductionTracker.git
cd DeductionTracker
cp .env.example .env  # add Neon database URL
npm install
npm run db:push
npm run dev
```

## License

MIT
