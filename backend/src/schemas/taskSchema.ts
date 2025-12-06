import { z } from "zod";
import { TaskStatus } from "../../generated/prisma";

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    skillIds: z.array(z.string()).optional().default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]).optional(),
    assigneeId: z.string().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const updateTaskStatusSchema = z.object({
    status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const updateTaskAssigneeSchema = z.object({
    assigneeId: z.string().nullable(),
});

export type UpdateTaskAssigneeInput = z.infer<typeof updateTaskAssigneeSchema>;
