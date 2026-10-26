# AgriSense — Intelligent Farmer Decision Support System

A full-stack MERN platform built for farmers to manage crops, track soil telemetry, access AI crop diagnostic advisories, and check live APMC market prices.

---

## 📁 Project Structure

```
major project sem 7/
├── backend/            # Express.js REST API + MongoDB Mongoose Models
│   ├── models/         # Farmer, Farm, Crop, SoilReading, MarketPrice, etc.
│   ├── routes/         # Auth, Farms, Crops, Advisories, Market, etc.
│   ├── scripts/        # Auto-seed scripts for market prices & advisories
│   ├── server.js       # Main server entry point
│   ├── package.json
│   └── .env            # Environment config (Port, Mongo URI, JWT secret)
│
└── frontend/           # React + Vite + Tailwind CSS User Interface
    ├── src/            # Components, Context, Pages, Services, UI
    ├── public/
    ├── vite.config.js  # Vite config with /api proxy to backend
    └── package.json
```

---

## 🚀 How to Run the Project (Just 2 Commands)

### 1. Start the Backend
Open a terminal and run:
```powershell
cd backend
npm run dev
```
> **Note:** The backend automatically connects to MongoDB and automatically seeds initial market prices & advisories on first start.

### 2. Start the Frontend
Open a second terminal and run:
```powershell
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔐 Key Features

- **Farmer Authentication:** Phone number + PIN based registration and login with bcrypt hashing and JWT tokens.
- **Dynamic Data Management:** All data (farms, crops, soil readings, alerts) is stored persistently in MongoDB.
- **Market Prices:** Live APMC mandi prices with price forecast trends.
- **Regional Advisories:** Agricultural advisories categorized by crop growth stage.
