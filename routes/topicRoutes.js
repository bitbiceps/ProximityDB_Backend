import { Router } from "express";
import {
  getTopicById,
  handleSubmitTopic,
  handleTopicCreation,
  handleUpdateSuggestion,
  handleVerifyTopicRequest,
  getAllTopics,
  handleTopicUpdate,
} from "../controllers/topicController.js";

const topicRouter = Router();

topicRouter.get("/", getAllTopics);
topicRouter.get("/get", getTopicById);
topicRouter.put("/request-update", handleTopicUpdate);
topicRouter.put("/request-verify", handleVerifyTopicRequest);
topicRouter.put("/add-suggestion", handleUpdateSuggestion);
topicRouter.put("/submit", handleSubmitTopic);

topicRouter.post("/questionnaire", handleTopicCreation);

export default topicRouter;
