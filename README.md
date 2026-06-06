# XYZ Homes — Premium Real Estate Platform

XYZ Homes is a high-performance, premium real estate web application designed for browsing, listing, renting, and purchasing high-end properties in India. It features map-based search, client-side image compression, real-time messaging, booking appointments, and a modern glassmorphic responsive UI supporting both light and dark themes.

---

## 🚀 Key Features

* 🗺️ **India-Specific Mapping**: Fully integrated with **Mappls Web Maps API** (formerly MapmyIndia) for geo-search, autocomplete location suggestions, and interactive property tracking.
* 📸 **Real Image Uploads & Compression**: Supports local image file uploads for property listings with client-side canvas compression that reduces file sizes by **~95%** (down to ~100–200 KB) before uploading, optimizing dashboard loading performance.
* 💬 **Direct Messaging System**: Integrated text chat allowing prospective buyers and renters to directly communicate with listing agents/owners.
* 📅 **Booking & Tour Management**: Detailed tour booking log on the dashboard allowing buyers to request property tours and listing owners to approve or reject them.
* 💳 **INR Currency Integration**: Configured with Indian Rupee (₹) notations, matching localized real estate valuation practices.
* 🌓 **Premium Dark/Light Modes**: Curated design tokens with high-legibility styling for all typography, buttons, inputs, and gradients.
* ⚡ **Performance Optimized**: Built with React lazy loading, Route-based code splitting, preconnect tags, and state caching.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite, TypeScript
* **Styling**: TailwindCSS, custom CSS layers, Framer Motion (for smooth micro-animations)
* **Routing**: React Router DOM (v6)
* **State & Query**: TanStack React Query (v5)
* **Map Engine**: Mappls Web Maps API
* **Icons**: Google Material Symbols

### Backend
* **Core**: Node.js, Express, TypeScript
* **Database & ORM**: SQLite, Prisma ORM
* **Auth**: JSON Web Tokens (JWT), bcryptjs

---

## 📦 Project Structure

```
xyz/
├── frontend/             # Vite + React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI elements (Map, Header, Cards, Chat)
│   │   ├── context/     # Auth and Theme context
│   │   ├── pages/       # Route-level pages (Buy, Rent, Sell, Dashboards)
│   │   ├── App.tsx      # App router & lazy route config
│   │   └── main.tsx     # App bootstrapping
│   └── package.json
└── backend/              # Node.js + Express Backend
    ├── prisma/           # Database schema & migrations
    ├── src/
    │   ├── controllers/  # Route handler logic
    │   ├── middleware/   # Auth verification & error handling
    │   ├── routes/       # Express route definitions
    │   └── server.ts     # Server startup script
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### 1. Clone & Set Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_here"
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_MAPPLS_MAP_SDK_KEY="your_mappls_client_id_or_sdk_key"
```

### 2. Install Backend & Initialize DB
```bash
cd backend
npm install

# Run database migrations and seed default data
npx prisma migrate dev
npx prisma db seed

# Start the backend dev server (runs on port 5000)
npm run dev
```

### 3. Install Frontend & Run Dev Server
```bash
cd ../frontend
npm install

# Start the frontend dev server (runs on port 5173)
npm run dev
```

---

## ⚡ Production Optimizations
The frontend utilizes modern bundler performance features:
1. **Route Splitting**: Dynamic imports (`React.lazy`) load page bundles on-demand, reducing initial load weight.
2. **Resource Preconnecting**: Custom `preconnect` tags inside `index.html` expedite DNS resolution for Google Fonts and Unsplash assets.
3. **Leaflet Lazy Bundling**: The map engine library is loaded inside a separate chunk and only parsed when the user displays the interactive map.
