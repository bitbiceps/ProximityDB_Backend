import { Router } from "express";
import {
  getTopicById,
  handleSubmitTopic,
  handleTopicCreation,
  handleUpdateSuggestion,
  handleUpdateTopicRequest,
  handleVerifyTopicRequest,
} from "../controllers/topicController.js";

const topicRouter = Router();

topicRouter.get("/get", getTopicById);
topicRouter.post("/create", handleTopicCreation);
topicRouter.put("/request-update", handleUpdateTopicRequest);
topicRouter.put("/request-verify", handleVerifyTopicRequest);
topicRouter.put("/add-suggestion", handleUpdateSuggestion);
topicRouter.put("/submit", handleSubmitTopic);

export default topicRouter;
