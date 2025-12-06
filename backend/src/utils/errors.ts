import { StatusCodes } from "./statusCodes";

// utils/errors.ts
export class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "Unauthorized") {
        super(message, StatusCodes.UNAUTHORIZED);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = "Forbidden") {
        super(message, StatusCodes.FORBIDDEN);
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Bad Request") {
        super(message, StatusCodes.BAD_REQUEST);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "Not Found") {
        super(message, StatusCodes.NOT_FOUND);
    }
}

export class ConflictError extends HttpError {
    constructor(message = "Conflict") {
        super(message, StatusCodes.CONFLICT);
    }
}