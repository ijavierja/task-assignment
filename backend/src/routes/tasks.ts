import { Router, Request, Response } from "express";
import { getAllTasks } from "src/services/tasks";
import { sendSuccess } from "src/utils/response";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
      const tasks = await getAllTasks();
       return sendSuccess(res, {tasks} )
});

export default router;
