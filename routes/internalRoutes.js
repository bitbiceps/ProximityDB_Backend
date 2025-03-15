import { Router } from "express";
import {
  getAllUsers,
  getOutletList,
  getReviewCounts,
  handleArticleMarkCompleted,
  handleGetAllCount,
  handleTopicMarkCompleted,
  handleSendTeamMessage,
  handleTopicSuggestion
} from "../controllers/internalController.js";

const internalRouter = Router();

internalRouter.get("/stats", handleGetAllCount);
internalRouter.get("/users", getAllUsers);
internalRouter.get("/review/count", getReviewCounts);
internalRouter.patch("/complete-article", handleArticleMarkCompleted);
internalRouter.patch("/complete-topic", handleTopicMarkCompleted);
internalRouter.post("/outlet-list", getOutletList);
internalRouter.post("/send-message",handleSendTeamMessage);
internalRouter.post("/update-topic-suggestion", handleTopicSuggestion); // for approving or rejecting the title suggestion from the internal dashboard

export default internalRouter;
