import { Router } from "express";
import {
  getAllUsers,
  getOutletList,
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
internalRouter.post("/outlet-list", getOutletList);

export default internalRouter;
