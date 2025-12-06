import { Router, Request, Response } from "express";
import {
    getAllTasks,
    getTask,
    createTask,
    updateTaskStatus,
    updateTaskAssignee,
    getAvailableAssignees,
} from "src/services/tasks";
import { sendSuccess } from "src/utils/response";
import { NotFoundError } from "src/utils/errors";
import { StatusCodes } from "src/utils/statusCodes";
import {
    createTaskSchema,
    updateTaskStatusSchema,
    updateTaskAssigneeSchema,
    CreateTaskInput,
    UpdateTaskStatusInput,
    UpdateTaskAssigneeInput,
} from "src/schemas/taskSchema";
import { validate } from "src/utils/validate";
import z from "zod";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    const tasks = await getAllTasks();
    return sendSuccess(res, { tasks });
});

router.post("/", validate(createTaskSchema), async (req: Request, res: Response) => {
    const newTask = req.body as unknown as CreateTaskInput
    const task = await createTask(newTask);
    return sendSuccess(res, task, StatusCodes.CREATED);
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await getTask(id);

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    return sendSuccess(res, task);
});

router.get("/:id/available-assignees", async (req: Request, res: Response) => {
    const { id } = req.params;
    const availableAssignees = await getAvailableAssignees(id);
    return sendSuccess(res, { availableAssignees });
});

router.patch("/:id/status", validate(updateTaskStatusSchema), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as unknown as UpdateTaskStatusInput;
    const task = await updateTaskStatus(id, status);
    return sendSuccess(res, task);
});

router.patch("/:id/assignee", validate(updateTaskAssigneeSchema), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assigneeId } = req.body as unknown as UpdateTaskAssigneeInput;
    const task = await updateTaskAssignee(id, assigneeId);
    return sendSuccess(res, task);
});

export default router;
