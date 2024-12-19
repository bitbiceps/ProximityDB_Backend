"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _topicController = require("../controllers/topicController.js");
var topicRouter = (0, _express.Router)();
topicRouter.get("/get", _topicController.getTopicById);
topicRouter.post("/create", _topicController.handleTopicCreation);
topicRouter.put("/request-update", _topicController.handleUpdateTopicRequest);
topicRouter.put("/request-verify", _topicController.handleVerifyTopicRequest);
topicRouter.put("/add-suggestion", _topicController.handleUpdateSuggestion);
topicRouter.put("/submit", _topicController.handleSubmitTopic);
var _default = exports["default"] = topicRouter;