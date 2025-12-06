import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
    (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
        (req: Request, _res: Response, next: NextFunction) => {
            const parsed = schema.parse(req[source])
            Object.assign(req[source], parsed)
            return next();
        }