import { Router } from "express";
import { handleQuestionnaire } from "../controllers/articleController.js";

const articleRouter = Router();

articleRouter.post("/submit-questionnaire", handleQuestionnaire);

export default articleRouter;
