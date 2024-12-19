"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _articleController = require("../controllers/articleController.js");
var articleRouter = (0, _express.Router)();
articleRouter.get("/", _articleController.handleGetArticles);
articleRouter.post("/submit-questionnaire", _articleController.handleQuestionnaire);
articleRouter.put("/request-update", _articleController.handleArticleUpdateRequested);
articleRouter.put("/submit", _articleController.handleSubmitArticle);
var _default = exports["default"] = articleRouter;