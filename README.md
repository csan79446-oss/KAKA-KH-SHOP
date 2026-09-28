# KAKA KH SHOP - Telegram MiniApp & Admin Dashboard 🇰🇭

A full-stack, production-ready Telegram MiniApp and Admin Dashboard designed for fresh Cambodian fruits, traditional delicacies, and beverages. Built with Next.js (App Router), Tailwind CSS, Prisma ORM, Bakong KHQR & ABA PayWay integration.

---

## 🚀 Features

### 🛍️ Telegram MiniApp Storefront (`/`)
- **Telegram WebApp Integration**: Automatically initializes with Telegram WebApp script. Reads user details (`id`, `username`, `first_name`) and provides haptic feedback.
- **Categorized Produce & Delicacies**:
  - 🍎 Fresh Cambodian Fruits (Kampot Durian, Battambang Oranges, Dragon Fruit, Pomelo)
  - 🍲 Khmer Food & Meals (Traditional Fish Amok, Lok Lak Beef)
  - 🥤 Drinks & Smoothies (Sugarcane Juice with Calamansi)
  - 🥗 Organic Khmer Snacks
- **Real-time Dual Currency Display**: Displays USD ($) and Cambodian Riel (KHR ៛) with live conversion.
- **Cart Management**: Add to cart, adjust quantities, instant subtotal calculation, and persistent storage.
- **Delivery Checkout**: Full checkout form capturing customer name, phone number, and delivery address in Phnom Penh.
- **Bakong KHQR & ABA PayWay Payment**:
  - Dynamically renders EMVCo compliant Bakong KHQR code using `qrcode`.
  - Transaction ID copying.
  - Interactive "Simulate Paid" button to verify payments in test/sandbox mode.

### 👑 Admin Management Dashboard (`/admin`)
- **Executive Analytics**: Total revenue, paid orders, pending orders, and registered Telegram MiniApp users.
- **Orders Management**: Complete order list, status filtering (Pending, Paid, Delivered, Cancelled), details drawer, and status transitions.
- **Products CRUD**: Add new fruits/meals, update prices, manage stock inventory levels, and upload images.
- **Categories CRUD**: Manage store categories and emoji icons.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (React 19, TypeScript, App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (default local zero-config) or PostgreSQL via Prisma ORM
- **State Management**: React Context with LocalStorage persistence
- **Icons**: Lucide Icons
- **Payments**: Bakong KHQR EMVCo format & ABA PayWay simulator

---

## 📋 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Setup & Seeding
Push the schema and seed sample Cambodian products:
```bash
npx prisma db push
npx tsx prisma/seeds/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the Storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Dashboard.

---

## 🤖 Configuring Telegram MiniApp with @BotFather

To connect this application to Telegram:

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Create a new bot if you haven't already:
   - Type `/newbot`
   - Set a name (e.g. `KAKA KH SHOP`) and a username (e.g. `kaka_kh_shop_bot`).
   - Copy the generated API Token to `TELEGRAM_BOT_TOKEN` in your `.env`.
3. Create the MiniApp:
   - Type `/newapp` in @BotFather.
   - Select your bot.
   - Enter a title (e.g. `KAKA KH SHOP`).
   - Enter a short description (e.g. `Order fresh Cambodian fruits & food`).
   - Upload an app icon / image.
   - Enter your public MiniApp URL (e.g. `https://your-domain.vercel.app` or ngrok tunnel).
   - Choose a short name for the WebApp (e.g. `shop`).
4. **Attach Menu Button**:
   - Type `/mybots` -> select your bot -> **Bot Settings** -> **Menu Button** -> **Configure menu button**.
   - Set URL to your deployed app `https://your-domain.vercel.app`.
5. **Register Telegram Webhook**:
   - Once deployed, visit: `https://your-domain.vercel.app/api/telegram/webhook?setup=true`
   - The bot will automatically handle `/start`, `/orders`, and `/help` directly in chat!

---

## 🔒 Production Security & Features
- **Admin PIN**: Default is `1234` (configurable via `NEXT_PUBLIC_ADMIN_PIN` in `.env`).
- **Cryptographic Verification**: Telegram `initData` is validated via HMAC-SHA256 according to Telegram WebApp security specifications.
- **Stock Safeguard**: Server-side stock checks on `/api/orders` reject orders that exceed available product stock.
- **Image Upload**: Multipart file uploads to `/api/upload` stored in `/public/uploads`.
- **Order Export**: One-click CSV export in Admin for dispatch and accounting.

