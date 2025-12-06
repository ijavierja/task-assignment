import { Router, Request, Response } from "express";
import { getAllDevelopers } from "../services/developer.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const developers = await getAllDevelopers();
  res.json(developers);
});

export default router;
