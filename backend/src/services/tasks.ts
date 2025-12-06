import { prisma } from "../lib/prisma";
import type { Task, TaskStatus, Developer } from "../../generated/prisma";
import {
    createTaskSchema,
    updateTaskSchema,
    type CreateTaskInput,
    type UpdateTaskInput,
} from "../schemas/taskSchema";
import { BadRequestError, NotFoundError } from "../utils/errors";

export const getAllTasks = async () => {
    return await prisma.task.findMany({
        include: {
            skills: true,
            assignee: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

export const getTask = async (taskId: Task["id"]) => {
    return await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            skills: true,
            assignee: true,
        },
    });
};

export const getAvailableAssignees = async (taskId: Task["id"]) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { skills: true },
    });

    if (!task) {
        throw new NotFoundError("Task not found");
    }
    let res: Developer;

    if (task.skills.length === 0) {
        return await prisma.developer.findMany({
            orderBy: { name: "asc" },
        });
    }

    const requiredSkillIds = task.skills.map((s) => s.id);
    return await prisma.developer.findMany({
        where: {
            skills: {
                every: {
                    id: {
                        in: requiredSkillIds,
                    },
                },
            },
        },
        orderBy: { name: "asc" },
    });
};

export const createTask = async (input) => {
    const validatedInput = createTaskSchema.parse(input);

    if (validatedInput.skillIds.length > 0) {
        const skills = await prisma.skill.findMany({
            where: { id: { in: validatedInput.skillIds } },
        });
        if (skills.length !== validatedInput.skillIds.length) {
            throw new BadRequestError("One or more skills not found");
        }
    }

    return await prisma.task.create({
        data: {
            title: validatedInput.title,
            skills: {
                connect: validatedInput.skillIds.map((id) => ({ id })),
            },
        },
        include: {
            skills: true,
            assignee: true,
        },
    });
};

export const updateTaskStatus = async (taskId: Task["id"], status: TaskStatus) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
    });

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    return await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
            skills: true,
            assignee: true,
        },
    });
};

export const updateTaskAssignee = async (taskId: Task["id"], assigneeId: string | null) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { skills: true },
    });

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    if (assigneeId !== null) {
        const assignee = await prisma.developer.findUnique({
            where: { id: assigneeId },
            include: { skills: true },
        });

        if (!assignee) {
            throw new NotFoundError("Developer not found");
        }

        if (task.skills.length > 0) {
            const assigneeSkillIds = assignee.skills.map((skill) => skill.id);
            const requiredSkillIds = task.skills.map((skill) => skill.id);
            const missingSkills = requiredSkillIds.filter((id) => !assigneeSkillIds.includes(id));

            if (missingSkills.length > 0) {
                throw new BadRequestError(
                    `Developer does not have the required skills. Missing: ${missingSkills.length} skill(s)`
                );
            }
        }
    }

    return await prisma.task.update({
        where: { id: taskId },
        data: { assigneeId },
        include: {
            skills: true,
            assignee: true,
        },
    });
};
