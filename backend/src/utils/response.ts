import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200, meta?: Record<string, unknown>) {
    const response: Record<string, unknown> = { data };
    if (meta) response.meta = meta;
    res.status(statusCode).json(response);
}

export function sendError(
    res: Response,
    message: string,
    statusCode: number,
    details?: Record<string, unknown>
) {
    res.status(statusCode).json({
        error: {
            message,
            details: details || undefined,
        }
    });
}
