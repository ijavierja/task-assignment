import { initTRPC, TRPCError } from "@trpc/server";
import * as taskService from "./services/tasks";
import * as developerService from "./services/developer";
import * as skillsService from "./services/skills";
import { HttpError } from "./utils/errors";
import { z } from "zod";
import {
    createTaskSchema,
    updateTaskStatusSchema,
    updateTaskAssigneeSchema,
} from "./schemas/taskSchema";

// Initialize tRPC (no context needed yet)
const t = initTRPC.create();

export const router = t.router;

// Map HTTP status codes to tRPC error codes
const httpToTrpcCodeMap: Record<number, TRPCError["code"]> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    413: "PAYLOAD_TOO_LARGE",
    422: "UNPROCESSABLE_CONTENT",
    501: "NOT_IMPLEMENTED",
};

// Middleware to handle errors and convert to proper tRPC codes
const errorHandlingMiddleware = t.middleware(async ({ next }) => {
    try {
        return await next();
    } catch (error: unknown) {
        // Handle custom HTTP errors
        if (error instanceof HttpError) {
            const code = httpToTrpcCodeMap[error.statusCode] ?? "INTERNAL_SERVER_ERROR";

            throw new TRPCError({
                code,
                message: error.message,
                cause: error, // important for debugging
            });
        }

        // Handle unknown errors
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
            cause: error, // preserve stack
        });
    }
});

// Create procedure with automatic error handling
export const publicProcedure = t.procedure.use(errorHandlingMiddleware);

// App router
export const appRouter = router({
    // Tasks procedures
    tasks: router({
        getAll: publicProcedure.query(async () => {
            return await taskService.getAllTasks();
        }),

        getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
            return await taskService.getTask(input.id);
        }),

        create: publicProcedure.input(createTaskSchema).mutation(async ({ input }) => {
            return await taskService.createTask(input);
        }),

        updateStatus: publicProcedure
            .input(z.object({ id: z.string() }).merge(updateTaskStatusSchema))
            .mutation(async ({ input }) => {
                return await taskService.updateTaskStatus(input.id, input.status);
            }),

        assignDeveloper: publicProcedure
            .input(z.object({ id: z.string() }).merge(updateTaskAssigneeSchema))
            .mutation(async ({ input }) => {
                return await taskService.updateTaskAssignee(input.id, input.assigneeId);
            }),

        getAvailableAssignees: publicProcedure
            .input(z.object({ id: z.string() }))
            .query(async ({ input }) => {
                return await taskService.getAvailableAssignees(input.id);
            }),

        getSubtasks: publicProcedure
            .input(z.object({ id: z.string() }))
            .query(async ({ input }) => {
                return await taskService.getSubtasks(input.id);
            }),
    }),

    // Developers procedures
    developers: router({
        getAll: publicProcedure.query(async () => {
            return await developerService.getAllDevelopers();
        }),

        getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
            return await developerService.getDeveloper(input.id);
        }),
    }),

    // Skills procedures
    skills: router({
        getAll: publicProcedure.query(async () => {
            return await skillsService.getAllSkills();
        }),

        getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
            return await skillsService.getSkill(input.id);
        }),
    }),
});

export type AppRouter = typeof appRouter;
