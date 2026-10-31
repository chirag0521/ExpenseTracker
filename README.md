# 💰 ExpenseTracker (Pocket Wallet)

A mobile-first, privacy-focused daily budget and expense tracker PWA designed to give you instant clarity over your daily spending allowance, monthly budget health, and IPO investments.

Live Demo: [https://chirag0521.github.io/ExpenseTracker/](https://chirag0521.github.io/ExpenseTracker/)

---

## ✨ Features

- **🎯 Smart Daily Allowance**: Automatically calculates your remaining daily budget based on remaining monthly balance and days left in the month.
- **👛 Month-End Rollover & Refill**: Smoothly transitions unspent amounts into savings or carries them over, with automated refill reminders on the 1st of every month.
- **⚡ Instant Quick Expense Entry**: Rapid expense logging with preset categories (Food, Transit, Bills, Shopping, Health, Entertainment, etc.), custom notes, and date selection.
- **📊 Interactive Visual Analytics**:
  - SVG Category Donut Breakdown.
  - 7-day spending trends bar charts.
  - Daily detail sheets with breakdown by transaction.
- **📈 IPO Investment Tracker**: Track your IPO applications, blocked funds, allotment status, refunds, and listing profits or losses.
- **🔒 100% Offline & Private**: Zero external database dependencies; your data never leaves your device and is persisted locally in `localStorage`.
- **💾 JSON Backup & Restore**: One-click export and import of your entire financial history.
- **📲 Progressive Web App (PWA)**: Installable on iOS & Android home screens with full offline functionality.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Tailored Design System, CSS Variables, Glassmorphism & Micro-animations)
- **Typography**: Fraunces (Headings) & DM Sans (Body)
- **Icons**: Lucide React
- **PWA**: `vite-plugin-pwa` with Workbox offline caching
- **CI/CD**: GitHub Actions for automated GitHub Pages deployment

---

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/chirag0521/ExpenseTracker.git
   cd ExpenseTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License. Free to use and customize!
