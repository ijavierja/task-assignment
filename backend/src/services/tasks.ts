import { prisma } from "../lib/prisma";
import { Task, TaskStatus, Developer, Skill } from "../../generated/prisma";
import { createTaskSchema } from "../schemas/taskSchema";
import { BadRequestError, NotFoundError } from "../utils/errors";
import z from "zod";

const MAX_SUBTASK_DEPTH = 3;

const calculateTaskDepth = async (taskId: string): Promise<number> => {
    const result = await prisma.$queryRaw<Array<{ depth: number }>>`
        WITH RECURSIVE task_hierarchy AS (
            -- Base case: start with the task
            SELECT id, "parentTaskId", 0 as depth
            FROM tasks
            WHERE id = ${taskId}
            
            UNION ALL
            
            -- Recursive case: find parent tasks
            SELECT t.id, t."parentTaskId", th.depth + 1
            FROM tasks t
            INNER JOIN task_hierarchy th ON t.id = th."parentTaskId"
        )
        SELECT MAX(depth) as depth FROM task_hierarchy;
    `;
    
    return result[0]?.depth ?? 0;
};

export const getAllTasks = async (): Promise<
    Array<Task & { skills: Skill[]; assignee: Developer | null }>
> => {
    return await prisma.task.findMany({
        include: {
            skills: true,
            assignee: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

export const getTask = async (
    taskId: Task["id"]
): Promise<(Task & { skills: Skill[]; assignee: Developer | null }) | null> => {
    return await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            skills: true,
            assignee: true,
        },
    });
};

export const getAvailableAssignees = async (taskId: Task["id"]): Promise<Developer[]> => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { skills: true },
    });

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    if (task.skills.length === 0) {
        return await prisma.developer.findMany({
            orderBy: { name: "asc" },
        });
    }

    const requiredSkillIds = task.skills.map((s) => s.id);
    
    // Get developers that have ALL required skills
    return await prisma.developer.findMany({
        where: {
            AND: requiredSkillIds.map((skillId) => ({
                skills: {
                    some: { id: skillId },
                },
            })),
        },
        orderBy: { name: "asc" },
    });
};

export const createTask = async (
    newTask: z.infer<typeof createTaskSchema>
): Promise<Task & { skills: Skill[]; assignee: Developer | null }> => {
    if (newTask.parentTaskId) {
        const parentTask = await prisma.task.findUnique({
            where: { id: newTask.parentTaskId },
        });

        if (!parentTask) {
            throw new NotFoundError("Parent task not found");
        }

        // Check if parent task is already Done
        if (parentTask.status === TaskStatus.DONE) {
            throw new BadRequestError(
                "Cannot create subtask for a task that is already marked as Done"
            );
        }

        // Check depth limit
        const currentDepth = await calculateTaskDepth(newTask.parentTaskId);
        if (currentDepth >= MAX_SUBTASK_DEPTH) {
            throw new BadRequestError(
                `Cannot create subtask. Maximum nesting depth of ${MAX_SUBTASK_DEPTH} levels exceeded.`
            );
        }
    }

    if (newTask.skillIds.length > 0) {
        const skills = await prisma.skill.findMany({
            where: { id: { in: newTask.skillIds } },
        });
        if (skills.length !== newTask.skillIds.length) {
            throw new BadRequestError("One or more skills not found");
        }
    }

    return await prisma.task.create({
        data: {
            title: newTask.title,
            parentTaskId: newTask.parentTaskId,
            skills: {
                connect: newTask.skillIds.map((id) => ({ id })),
            },
        },
        include: {
            skills: true,
            assignee: true,
        },
    });
};

export const updateTaskStatus = async (
    taskId: Task["id"],
    status: TaskStatus
): Promise<Task & { skills: Skill[]; assignee: Developer | null }> => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
    });

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    // Check if trying to mark as Done
    if (status === TaskStatus.DONE) {
        // Get all subtasks
        const subtasks = await prisma.task.findMany({
            where: { parentTaskId: taskId },
        });

        // Check if any subtask is not Done
        const incompleteTasks = subtasks.filter((subtask) => subtask.status !== TaskStatus.DONE);
        if (incompleteTasks.length > 0) {
            throw new BadRequestError(
                `Cannot mark task as Done. There are ${incompleteTasks.length} incomplete subtask(s).`
            );
        }
    }

    // Check if trying to mark as TODO or IN_PROGRESS (incomplete status)
    if (status === TaskStatus.TODO || status === TaskStatus.IN_PROGRESS) {
        // Check entire parent chain in a single query - if ANY ancestor is Done, can't mark as incomplete
        const doneAncestors = await prisma.$queryRaw<Array<{ id: string }>>`
            WITH RECURSIVE ancestor_chain AS (
                -- Base case: start with the parent of current task
                SELECT id, "parentTaskId", status
                FROM tasks
                WHERE id = ${task.parentTaskId}
                
                UNION ALL
                
                -- Recursive case: find parent tasks
                SELECT t.id, t."parentTaskId", t.status
                FROM tasks t
                INNER JOIN ancestor_chain ac ON t.id = ac."parentTaskId"
            )
            SELECT id FROM ancestor_chain WHERE status = ${TaskStatus.DONE};
        `;

        if (doneAncestors.length > 0) {
            throw new BadRequestError(
                "Cannot change task status to incomplete. An ancestor task is already marked as Done."
            );
        }
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

export const updateTaskAssignee = async (
    taskId: Task["id"],
    assigneeId: Developer["id"] | null
): Promise<Task & { skills: Skill[]; assignee: Developer | null }> => {
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

export const getSubtasks = async (
    taskId: Task["id"]
): Promise<Array<Task & { skills: Skill[]; assignee: Developer | null }>> => {
    return await prisma.task.findMany({
        where: { parentTaskId: taskId },
        include: {
            skills: true,
            assignee: true,
        },
        orderBy: { createdAt: "asc" },
    });
};
