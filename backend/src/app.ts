import cors from "cors";
import express from "express";
import developersRouter from "./routes/developers.js";

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

// API Routes
app.use("/api/developers", developersRouter);

export default app;
