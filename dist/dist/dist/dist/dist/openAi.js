"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _openai = _interopRequireDefault(require("openai"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
_dotenv["default"].config({
  path: ".env.local"
}); // This should be at the very top

var writer = new _openai["default"]({
  apiKey: process.env.API
});
var model = "ft:gpt-3.5-turbo-0613:cache-labs-llc:yt-tutorial:8hHNplz0";
var topicModel = "gpt-3.5-turbo";
var openAi = {
  writer: writer,
  model: model,
  topicModel: topicModel
};
var _default = exports["default"] = openAi;