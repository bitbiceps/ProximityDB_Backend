import { Router } from "express";
import {
  getTopicById,
  handleSubmitTopic,
  handleTopicCreation,
  handleUpdateSuggestion,
  handleUpdateTopicRequest,
  handleVerifyTopicRequest,
  getAllTopics,
} from "../controllers/topicController.js";

const topicRouter = Router();

topicRouter.get("/", getAllTopics);
topicRouter.get("/get", getTopicById);
topicRouter.put("/request-update", handleUpdateTopicRequest);
topicRouter.put("/request-verify", handleVerifyTopicRequest);
topicRouter.put("/add-suggestion", handleUpdateSuggestion);
topicRouter.put("/submit", handleSubmitTopic);

topicRouter.post("/questionnaire", handleTopicCreation);

export default topicRouter;
