import { Router } from "express";
import {
  handleArticleUpdateRequested,
  handleGetArticles,
  handleQuestionnaire,
  handleSubmitArticle,
  handleCreateArticles,
  handleGetApprovedTopics,
  handleGetArticlesById,
  determineBestOutletsForArticle,
  handleArticleContentUpdate
} from "../controllers/articleController.js";

const articleRouter = Router();

articleRouter.get("/", handleGetArticles);
articleRouter.post("/create-article", handleCreateArticles);
articleRouter.post("/submit-questionnaire", handleQuestionnaire);
articleRouter.put("/request-update", handleArticleUpdateRequested);
articleRouter.put("/update" , handleArticleContentUpdate);
articleRouter.put("/submit", handleSubmitArticle);
articleRouter.post("/fetch-approvedtopics", handleGetApprovedTopics);
articleRouter.post("/get", handleGetArticlesById);
articleRouter.post("/article-outlet",determineBestOutletsForArticle)
export default articleRouter;
