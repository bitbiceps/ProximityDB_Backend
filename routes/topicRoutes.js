import { Router } from "express";
import {
  getTopicById,
  handleSubmitTopic,
  handleTopicCreation,
  handleUpdateSuggestion,
  handleVerifyTopicRequest,
  getAllTopics,
  handleTopicUpdate,
  handleTopicUpdateRequest
} from "../controllers/topicController.js";

const topicRouter = Router();

topicRouter.get("/", getAllTopics);
topicRouter.get("/get", getTopicById);
topicRouter.put("/request-update", handleTopicUpdate);
topicRouter.put("/request-verify", handleVerifyTopicRequest);
topicRouter.put("/add-suggestion", handleUpdateSuggestion);
topicRouter.put("/submit", handleSubmitTopic);
topicRouter.post("/title-update", handleTopicUpdateRequest);

topicRouter.post("/generate", handleTopicCreation);

export default topicRouter;
