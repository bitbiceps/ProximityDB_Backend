import { Router } from "express";
import {
  getAllUsers,
  getOutletList,
  getReviewCounts,
  handleArticleMarkCompleted,
  handleGetAllCount,
  handleTopicMarkCompleted,
  handleSendTeamMessage,
  handleTopicSuggestion,
  fetchAllUserMessageList,
  handleReadMessage
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
internalRouter.get("/allMessageList" , fetchAllUserMessageList)
internalRouter.post("/read-messsage",handleReadMessage);

export default internalRouter;
