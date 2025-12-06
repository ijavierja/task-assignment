import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import developersRouter from "./routes/developers";
import tasksRouter from "./routes/tasks";
import skillsRouter from "./routes/skills";
import { sendError } from "./utils/response";
import { StatusCodes } from "./utils/statusCodes";
import { HttpError } from "./utils/errors";

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
app.use("/api/tasks", tasksRouter);
app.use("/api/skills", skillsRouter);

// 404 handler
app.use((req, res) => {
    sendError(res, "Not found", StatusCodes.NOT_FOUND);
});

// Error handler
app.use((
    err: Error,
    _req: Request,
    res: Response,
    __next: NextFunction
) => {
    console.error(err);

    if (err instanceof z.ZodError) {
        return sendError(
            res,
            err.issues[0]?.message ?? "Validation failed",
            StatusCodes.BAD_REQUEST,
            { validationErrors: err.issues }
        );
    }

    if (err instanceof HttpError) {
        return sendError(res, err.message, err.statusCode);
    }

    sendError(res, "Internal server error", StatusCodes.INTERNAL_SERVER_ERROR);
});

export default app;
