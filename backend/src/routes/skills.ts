import { Router, Request, Response } from "express";
import { getAllSkills, getSkill } from "src/services/skills";
import { sendSuccess } from "src/utils/response";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const skills = await getAllSkills();
  return sendSuccess(res, { skills });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const skill = await getSkill(id);
  return sendSuccess(res, skill);
});

export default router;
