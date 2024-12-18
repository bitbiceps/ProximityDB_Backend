import { Router } from "express";
import {
  handleArticleUpdateRequested,
  handleQuestionnaire,
  handleSubmitArticle,
} from "../controllers/articleController.js";

const articleRouter = Router();

articleRouter.post("/submit-questionnaire", handleQuestionnaire);
articleRouter.put("/request-update", handleArticleUpdateRequested);
articleRouter.put("/submit", handleSubmitArticle);

export default articleRouter;
