import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Ensure uploads directory exists
await mkdir(path.resolve(__dirname, "uploads"), { recursive: true });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URL;

if (!mongoUri) {
  console.warn("MongoDB URI not set. Starting with local memory fallback only.");
}

try {
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  }
} catch (error) {
  console.warn(`MongoDB unavailable, using local fallback: ${error.message}`);
}

const { default: uploadRoutes } = await import("./routes/uploadRoutes.js");
const { default: queryRoutes }  = await import("./routes/queryRoutes.js");

const frontendDistDir   = path.resolve(__dirname, "../frontend/dist");
const frontendIndexFile = path.join(frontendDistDir, "index.html");
const hasFrontendBuild  = existsSync(frontendIndexFile);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongoUriConfigured: !!mongoUri,
    mongoReady: mongoose.connection.readyState === 1,
  });
});

if (hasFrontendBuild) {
  app.use(express.static(frontendDistDir));
  app.get(/.*/, (req, res) => res.sendFile(frontendIndexFile));
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "DocQuery backend is running. Start the Vite frontend or build frontend/dist to serve the UI here.",
    });
  });
}

app.listen(5000, () => console.log("Server running on port 5000"));