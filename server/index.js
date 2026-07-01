import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

// ── Route Imports ─────────────────────────────────────────────
import authRoutes         from "./routes/auth.route.js";
import userRoutes         from "./routes/user.route.js";
import medicineRoutes     from "./routes/medicine.routes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import cartRoutes         from "./routes/cart.routes.js";
import prescriberRoutes   from "./routes/prescriberRoutes.js";
import patientRoutes      from "./routes/patient.routes.js";
import portRoutes         from "./routes/portRoutes.js";
import stockRoutes        from "./routes/Stockroutes.js";
import Orderroutes        from "./routes/Orderroutes.js";
import sliderRoutes       from "./routes/sliderRoutes.js"; 
import mediaRoutes        from "./routes/mediaRoutes.js";
import postroutes from './routes/post.routes.js'
import footerRoutes from './routes/footerRoutes.js'
import aboutRoutes from './routes/aboutRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import adminContactRoute from './routes/adminContactRoute.js'

// Added unified media management route

// ── Jobs ──────────────────────────────────────────────────────
import { startJobs } from "./jobs/Expiry.js";

dotenv.config();

const app = express();

// ── Directory Setup ───────────────────────────────────────────
// Automatically ensures the 'uploads' directory is present for Multer storage
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL2,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ── Middlewares ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Expose the 'uploads' folder statically so the frontend can retrieve images cleanly
app.use("/uploads", express.static("uploads"));

// ── Routes ────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("API Running..."));

app.use("/api/auth",            authRoutes);
app.use("/api/users",           userRoutes);
app.use("/api/medicines",       medicineRoutes);
app.use("/api/prescriptions",   prescriptionRoutes);
app.use("/api/patients",        patientRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/posts', postroutes);
app.use('/api/about', aboutRoutes);

// FIX: mount prescriberRoutes on BOTH paths so that:
// - /api/prescriber/search, /api/prescriber/link etc. work (used by prescriberLink page)
// - /api/prescriber-link/active-links works (used by CartPage)
app.use("/api/prescriber",      prescriberRoutes);
app.use("/api/prescriber-link", prescriberRoutes);

app.use("/api/cart",            cartRoutes);
app.use("/api/orders",          Orderroutes);
app.use("/api/port",           portRoutes);
app.use("/api/three-pot",       portRoutes); // Backward compatibility
app.use("/api/stock",           stockRoutes);
app.use("/api/sliders",         sliderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/media",           mediaRoutes); // Mounted new media framework route (Slider, Logos, Gallery)

app.use('/api', adminContactRoute);

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── DB + Start Server ─────────────────────────────────────────
let isConnecting = false;

const connectDB = async (retries = 5) => {
  if (isConnecting) return;
  isConnecting = true;
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✅ MongoDB Connected Successfully");
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`MongoDB attempt ${i}/${retries} failed:`, err.message);
      if (i === retries) {
        isConnecting = false;
        setTimeout(() => connectDB(), 30000);
        return;
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

connectDB().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startJobs();
  });
});
