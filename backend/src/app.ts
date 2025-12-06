import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./trpc";
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

// tRPC HTTP handler with error formatting
const trpcHandler = createHTTPHandler({
    router: appRouter,
    onError: ({ error }) => {
        if (error instanceof TRPCError) {
            console.error(`[tRPC] ${error.code}: ${error.message}`);
        } else {
            console.error("[tRPC] Internal error:", error);
        }
    },
});

// Mount tRPC routes
app.use("/trpc", trpcHandler);

// 404 handler
app.use((req, res) => {
    sendError(res, "Not found", StatusCodes.NOT_FOUND);
});

// Error handler
app.use((err: Error, _req: Request, res: Response, __next: NextFunction) => {
    console.error(err);

    if (err instanceof HttpError) {
        return sendError(res, err.message, err.statusCode);
    }

    sendError(res, "Internal server error", StatusCodes.INTERNAL_SERVER_ERROR);
});

export default app;
