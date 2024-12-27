import { Router } from "express";
import {
  handleArticleMarkCompleted,
  handleGetAllCount,
  handleTopicMarkCompleted,
} from "../controllers/internalController.js";

const internalRouter = Router();

internalRouter.get("/all", handleGetAllCount);
internalRouter.patch("/complete-article", handleArticleMarkCompleted);
internalRouter.patch("/complete-topic", handleTopicMarkCompleted);

export default internalRouter;
