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
  handleArticleContentUpdate,
  handleCreateArticlesSecond,
  handleGenerateArticle,
  handleArticleFileNameUpdate,
  handleArticleDelete,
  handleArticleStatusUpdate,
  handleArticleRegenerate,
  handleGetActiveArticles,
  getUserArticleStats
} from "../controllers/articleController.js";
import createTask from "../helpers/clickUp.js";
import requireSudo from "../middleware/internalMiddlewares.js";

const articleRouter = Router();

articleRouter.get("/", handleGetArticles);
articleRouter.post("/create-article", handleCreateArticlesSecond);
articleRouter.post("/submit-questionnaire", handleQuestionnaire);
articleRouter.put("/request-update", handleArticleUpdateRequested);
articleRouter.put("/update" , handleArticleContentUpdate);
articleRouter.put("/update-filename",handleArticleFileNameUpdate)
articleRouter.put("/submit", handleSubmitArticle);
articleRouter.post("/fetch-approvedtopics", handleGetApprovedTopics);
articleRouter.post("/get", handleGetArticlesById);
articleRouter.post("/article-outlet",determineBestOutletsForArticle)
articleRouter.post("/generate-article",handleGenerateArticle);
articleRouter.delete("/delete/:articleId", handleArticleDelete);
articleRouter.post("/update-status",handleArticleStatusUpdate);
articleRouter.post("/regenerate",handleArticleRegenerate);
articleRouter.get("/active-articles/:id", handleGetActiveArticles);
articleRouter.get("/stats/:userId", getUserArticleStats);








articleRouter.post("/create-task", async (req, res) => {
  const { name, description } = req.body;

  // Validate incoming data
  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required." });
  }

  try {
    // Call createTask to create a task in ClickUp
    const taskData = await createTask(name, description);

    // Send back the response data from ClickUp
    return res.status(200).json({
      message: "Task created successfully",
      task: taskData, // Return the created task data
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
export default articleRouter;
