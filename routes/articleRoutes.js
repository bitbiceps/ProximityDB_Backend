import { Router } from "express";
import {
  handleArticleUpdateRequested,
  handleGetArticles,
  handleQuestionnaire,
  handleSubmitArticle,
  handleCreateArticles,
  handleGetApprovedTopics,
  handleGetArticlesById
} from "../controllers/articleController.js";

const articleRouter = Router();

articleRouter.get("/", handleGetArticles);
articleRouter.post("/create-article",handleCreateArticles)
articleRouter.post("/submit-questionnaire", handleQuestionnaire);
articleRouter.put("/request-update", handleArticleUpdateRequested);
articleRouter.put("/submit", handleSubmitArticle);
articleRouter.post("/fetch-approvedtopics",handleGetApprovedTopics)
articleRouter.post("/get",handleGetArticlesById)
export default articleRouter;
