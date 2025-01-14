import { Router } from "express";
import {
  getAllUsers,
  getReviewCounts,
  handleArticleMarkCompleted,
  handleGetAllCount,
  handleTopicMarkCompleted,
} from "../controllers/internalController.js";

const internalRouter = Router();

internalRouter.get("/stats", handleGetAllCount);
internalRouter.get("/users", getAllUsers);
internalRouter.get("/review/count", getReviewCounts);
internalRouter.patch("/complete-article", handleArticleMarkCompleted);
internalRouter.patch("/complete-topic", handleTopicMarkCompleted);

export default internalRouter;
