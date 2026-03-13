import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import toolRoutes from "./routes/toolRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import tagRoutes from "./routes/tagRoutes";
import authRoutes from "./routes/authRoutes";
import scrapeRoutes from "./routes/scrapeRoutes";

const app: Application = express();
const PORT = process.env.PORT || 5001;

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cors());
app.use(helmet());

/* ---------------- DATABASE ---------------- */

console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/designdev-hub";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Atlas connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

connectDB();

/* ---------------- ROUTES ---------------- */

app.get("/", (req: Request, res: Response) => {
  res.send("DesignDev Hub API is running");
});

app.use("/api/tools", toolRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/scrape", scrapeRoutes);

/* ---------------- SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;