import { Router, Request, Response } from "express";
import { getAllDevelopers, getDeveloper } from "../services/developer";
import { sendSuccess } from "src/utils/response";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    const developers = await getAllDevelopers();
    return sendSuccess(res, { developers });
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const developer = await getDeveloper(id);
    return sendSuccess(res, developer);
});

export default router;
