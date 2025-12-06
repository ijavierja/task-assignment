import { Router, Request, Response } from "express";
import { getAllTasks, getTask, createTask, updateTaskStatus, updateTaskAssignee, getAvailableAssignees } from "src/services/tasks";
import { sendSuccess } from "src/utils/response";
import { NotFoundError } from "src/utils/errors";
import { StatusCodes } from "src/utils/statusCodes";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const tasks = await getAllTasks();
  return sendSuccess(res, { tasks });
});

router.post("/", async (req: Request, res: Response) => {
  const task = await createTask(req.body);
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
  const developers = await getAvailableAssignees(id);
  return sendSuccess(res, { developers });
});

router.patch("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = await updateTaskStatus(id, status);
  return sendSuccess(res, task);
});

router.patch("/:id/assignee", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { assigneeId } = req.body;
  const task = await updateTaskAssignee(id, assigneeId ?? null);
  return sendSuccess(res, task);
});

export default router;
