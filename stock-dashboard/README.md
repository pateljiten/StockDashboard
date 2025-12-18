# Stock Portfolio Dashboard

A modern, responsive dashboard for tracking US stock investments built with Next.js 14, TypeScript, and TailwindCSS.

## Features

- **Consolidated View**: View combined data from multiple portfolios
- **Individual Portfolio Views**: Switch between Portfolio 1 and Portfolio 2
- **Summary Cards**: Display invested amount, current value, realized/unrealized P&L
- **Cash Position Returns**: Track cash position, risk-free returns, and accumulated interest
- **Allocation Visualization**: Interactive donut chart and allocation bar
- **Recent Transactions**: View latest buy/sell activities
- **Stock Holdings Table**: Sortable and searchable table with detailed holdings information

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Option 1: Using Docker (Recommended)

#### Prerequisites
- Docker Desktop installed and running

#### Run with Docker Compose

1. Navigate to the project directory:
   ```bash
   cd stock-dashboard
   ```

2. Build and start the container:
   ```bash
   docker-compose up --build -d
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Docker Commands

```bash
# Start the container
docker-compose up -d

# Stop the container
docker-compose down

# View logs
docker logs stock-dashboard

# Rebuild after changes to package.json
docker-compose up --build -d
```

### Option 2: Using Node.js Directly

#### Prerequisites
- Node.js 18.17 or later
- npm or yarn

#### Installation

1. Navigate to the project directory:
   ```bash
   cd stock-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
stock-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main dashboard page
│   ├── components/
│   │   ├── AllocationBar.tsx
│   │   ├── AllocationChart.tsx
│   │   ├── CashPositionReturns.tsx
│   │   ├── Header.tsx
│   │   ├── PortfolioSelector.tsx
│   │   ├── RecentTransactions.tsx
│   │   ├── StockHoldingsTable.tsx
│   │   ├── SummaryCards.tsx
│   │   └── index.ts
│   ├── data/
│   │   └── mockData.ts      # Sample portfolio data
│   ├── types/
│   │   └── portfolio.ts     # TypeScript interfaces
│   └── utils/
│       └── formatters.ts    # Utility functions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Customization

### Adding Real Data

Replace the mock data in `src/data/mockData.ts` with your actual portfolio data. The data structures are defined in `src/types/portfolio.ts`.

### Styling

The dashboard uses TailwindCSS for styling. Customize colors and themes in `tailwind.config.ts`.

## License

MIT

